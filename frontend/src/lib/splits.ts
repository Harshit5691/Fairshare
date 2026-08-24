import type { ExpenseSplit, SplitType } from '../types'

export const SPLIT_TOLERANCE = 0.01

function toCents(value: number): number {
  return Math.round(value * 100) / 100
}

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
  total: number
  target: number
  message?: string
}

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
