import type { CurrencyCode, Expense, Settlement } from '../types'
import { convert } from '../constants/rates'

/** Balances below this (in absolute value) count as settled up. */
export const SETTLED_EPSILON = 0.005

/**
 * Your NET balance across a set of expenses, from the perspective of `meId`.
 * Positive = you are owed overall. Negative = you owe overall.
 *
 * Pass `settlements` so payments already made are subtracted — otherwise the
 * headline number disagrees with the per-person balances below it.
 */
export function computeNetBalance(
  expenses: Expense[],
  meId: string,
  settlements: Settlement[] = [],
): number {
  let net = 0
  for (const expense of expenses) {
    const myShare = expense.splits.find((s) => s.userId === meId)?.shareAmount ?? 0
    if (expense.paidBy === meId) {
      net += expense.amount - myShare
    } else {
      net -= myShare
    }
  }

  for (const s of settlements) {
    // Paying someone clears debt (net rises); being paid clears credit.
    if (s.fromUser === meId) net += s.amount
    else if (s.toUser === meId) net -= s.amount
  }

  return net
}

/**
 * The balance between you (`meId`) and one specific other person (`otherId`).
 * Positive = they owe you. Negative = you owe them.
 */
export function computePairBalance(
  expenses: Expense[],
  meId: string,
  otherId: string,
): number {
  let balance = 0
  for (const expense of expenses) {
    if (expense.paidBy === meId) {
      const theirShare = expense.splits.find((s) => s.userId === otherId)?.shareAmount ?? 0
      balance += theirShare
    } else if (expense.paidBy === otherId) {
      const myShare = expense.splits.find((s) => s.userId === meId)?.shareAmount ?? 0
      balance -= myShare
    }
  }

  return balance
}

/**
 * Apply settlements to a pair balance. Paying someone reduces what you owe them;
 * being paid reduces what they owe you.
 */
export function applySettlementsToPair(
  balance: number,
  settlements: Settlement[],
  meId: string,
  otherId: string,
): number {
  let adjusted = balance
  for (const s of settlements) {
    if (s.fromUser === meId && s.toUser === otherId) {
      // I paid them, so I owe them less (balance moves positive).
      adjusted += s.amount
    } else if (s.fromUser === otherId && s.toUser === meId) {
      // They paid me, so they owe me less (balance moves negative).
      adjusted -= s.amount
    }
  }

  return adjusted
}

export interface FriendNet {
  userId: string
  /** Net balance in the viewer's home currency. Positive = they owe you. */
  amount: number
}

/**
 * Net balance with every other person, across ALL groups, converted to
 * `homeCurrency`. This is what the Friends screen and the Home hero show.
 */
export function computeFriendNets(
  expenses: Expense[],
  settlements: Settlement[],
  meId: string,
  homeCurrency: CurrencyCode,
): FriendNet[] {
  const totals: Record<string, number> = {}

  for (const expense of expenses) {
    const myShare = expense.splits.find((s) => s.userId === meId)?.shareAmount ?? 0

    if (expense.paidBy === meId) {
      // Everyone else in the split owes me their share.
      for (const split of expense.splits) {
        if (split.userId === meId) continue
        const value = convert(split.shareAmount, expense.currency, homeCurrency)
        totals[split.userId] = (totals[split.userId] ?? 0) + value
      }
    } else if (myShare > 0) {
      // Someone else paid and I participated, so I owe the payer my share.
      const value = convert(myShare, expense.currency, homeCurrency)
      totals[expense.paidBy] = (totals[expense.paidBy] ?? 0) - value
    }
  }

  for (const s of settlements) {
    const value = convert(s.amount, s.currency, homeCurrency)
    if (s.fromUser === meId) {
      totals[s.toUser] = (totals[s.toUser] ?? 0) + value
    } else if (s.toUser === meId) {
      totals[s.fromUser] = (totals[s.fromUser] ?? 0) - value
    }
  }

  return Object.entries(totals).map(([userId, amount]) => ({ userId, amount }))
}

export interface NetSummary {
  /** Total others owe you, in home currency. */
  owed: number
  /** Total you owe others, in home currency. */
  owe: number
  /** owed - owe. */
  net: number
}

/** Roll friend nets up into the owed / owe / net figures shown on Home. */
export function summarizeNets(friendNets: FriendNet[]): NetSummary {
  let owed = 0
  let owe = 0
  for (const { amount } of friendNets) {
    if (amount > 0) owed += amount
    else owe += -amount
  }

  return { owed, owe, net: owed - owe }
}
