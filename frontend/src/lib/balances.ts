import type { CurrencyCode, Expense, Settlement } from '../types'
import { convert } from '../constants/rates'

export const SETTLED_EPSILON = 0.005

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
    if (s.fromUser === meId) net += s.amount
    else if (s.toUser === meId) net -= s.amount
  }

  return net
}

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

export function applySettlementsToPair(
  balance: number,
  settlements: Settlement[],
  meId: string,
  otherId: string,
): number {
  let adjusted = balance
  for (const s of settlements) {
    if (s.fromUser === meId && s.toUser === otherId) {
      adjusted += s.amount
    } else if (s.fromUser === otherId && s.toUser === meId) {
      adjusted -= s.amount
    }
  }

  return adjusted
}

export interface FriendNet {
  userId: string
  amount: number
}

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
      for (const split of expense.splits) {
        if (split.userId === meId) continue
        const value = convert(split.shareAmount, expense.currency, homeCurrency)
        totals[split.userId] = (totals[split.userId] ?? 0) + value
      }
    } else if (myShare > 0) {
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
  owed: number
  owe: number
  net: number
}

export function summarizeNets(friendNets: FriendNet[]): NetSummary {
  let owed = 0
  let owe = 0
  for (const { amount } of friendNets) {
    if (amount > 0) owed += amount
    else owe += -amount
  }

  return { owed, owe, net: owed - owe }
}
