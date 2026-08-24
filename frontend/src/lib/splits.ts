import type { ExpenseSplit, SplitType } from '../types'

/** Splits must add up to the expense total, within this tolerance. */
export const SPLIT_TOLERANCE = 0.01

/** Round to whole cents so repeated arithmetic doesn't drift. */
function toCents(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Turn the form's raw inputs into the splits we store.
 *
 * `shareAmount` is always real money and is the source of truth for balances.
 * `inputValue` preserves what the user actually typed (a percentage, or an
 * exact amount) so the expense can be edited later without guessing.
 *
 * For an equal split the remainder from rounding is added to the first
 * participant, so the shares always sum to exactly `amount`.
 */
export function buildSplits(
  splitType: SplitType,
  amount: number,
  participantIds: string[],
  inputValues: Record<string, number>,
): ExpenseSplit[] {
  if (participantIds.length === 0) return []

  if (splitType === 'equal') {
    const share = toCents(amount / participantIds.length)
    const splits = participantIds.map((userId) => ({ userId, shareAmount: share }))
    const drift = toCents(amount - share * participantIds.length)
    if (drift !== 0) {
      splits[0] = { ...splits[0], shareAmount: toCents(splits[0].shareAmount + drift) }
    }
    return splits
  }

  if (splitType === 'exact') {
    return participantIds.map((userId) => ({
      userId,
      shareAmount: toCents(inputValues[userId] ?? 0),
      inputValue: inputValues[userId] ?? 0,
    }))
  }

  // percentage
  return participantIds.map((userId) => {
    const pct = inputValues[userId] ?? 0
    return {
      userId,
      shareAmount: toCents((amount * pct) / 100),
      inputValue: pct,
    }
  })
}

export interface SplitValidation {
  valid: boolean
  /** What the splits currently add up to (money for exact, percent for percentage). */
  total: number
  /** What they need to add up to. */
  target: number
  message?: string
}

/**
 * Check that the user's split inputs add up. Equal splits are always valid;
 * exact splits must sum to the amount, percentages must sum to 100.
 */
export function validateSplits(
  splitType: SplitType,
  amount: number,
  participantIds: string[],
  inputValues: Record<string, number>,
): SplitValidation {
  if (participantIds.length === 0) {
    return { valid: false, total: 0, target: 0, message: 'Pick at least one person' }
  }

  if (splitType === 'equal') {
    return { valid: true, total: amount, target: amount }
  }

  const total = toCents(
    participantIds.reduce((sum, id) => sum + (inputValues[id] ?? 0), 0),
  )

  if (splitType === 'exact') {
    const diff = toCents(amount - total)
    return {
      valid: Math.abs(diff) <= SPLIT_TOLERANCE,
      total,
      target: amount,
      message:
        Math.abs(diff) <= SPLIT_TOLERANCE
          ? undefined
          : diff > 0
            ? `${diff.toFixed(2)} left to assign`
            : `${Math.abs(diff).toFixed(2)} over the total`,
    }
  }

  const diff = toCents(100 - total)
  return {
    valid: Math.abs(diff) <= SPLIT_TOLERANCE,
    total,
    target: 100,
    message:
      Math.abs(diff) <= SPLIT_TOLERANCE
        ? undefined
        : diff > 0
          ? `${diff.toFixed(2)}% left to assign`
          : `${Math.abs(diff).toFixed(2)}% over 100%`,
  }
}
