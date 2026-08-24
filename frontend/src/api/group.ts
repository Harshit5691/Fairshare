import { addExpense, addSettlement, expenses, groups, settlements, users } from '../mock/data'
import type {
  Category,
  CurrencyCode,
  Expense,
  Group,
  Settlement,
  SplitType,
  User,
} from '../types'
import {
  applySettlementsToPair,
  computeFriendNets,
  computeNetBalance,
  computePairBalance,
  summarizeNets,
  type FriendNet,
  type NetSummary,
} from '../lib/balances'
import { buildSplits } from '../lib/splits'
import { convert } from '../constants/rates'

export const ME = 'me'

const LATENCY = 350

function delay(ms = LATENCY) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export interface GroupSummary extends Group {
  balance: number
}

export interface GroupDetail {
  group: Group
  members: User[]
  expenses: Expense[]
  settlements: Settlement[]
}

export async function fetchGroups(): Promise<GroupSummary[]> {
  await delay()

  return groups.map((group) => {
    const groupExpenses = expenses.filter((e) => e.groupId === group.id)
    const groupSettlements = settlements.filter((s) => s.groupId === group.id)
    return {
      ...group,
      balance: computeNetBalance(groupExpenses, ME, groupSettlements),
    }
  })
}

export async function fetchGroupDetail(groupId: string): Promise<GroupDetail> {
  await delay()

  const group = groups.find((g) => g.id === groupId)
  if (!group) throw new Error(`Group ${groupId} not found`)

  const members = group.memberIds.map((id) => users[id])
  const groupExpenses = expenses.filter((e) => e.groupId === groupId)
  const groupSettlements = settlements.filter((s) => s.groupId === groupId)

  return { group, members, expenses: groupExpenses, settlements: groupSettlements }
}

export interface CreateExpenseInput {
  groupId: string
  description: string
  category: Category
  amount: number
  paidBy: string
  splitType: SplitType
  participantIds: string[]
  inputValues: Record<string, number>
}

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  await delay()

  const group = groups.find((g) => g.id === input.groupId)
  if (!group) throw new Error(`Group ${input.groupId} not found`)

  const expense: Expense = {
    id: `exp_${Date.now()}`,
    groupId: input.groupId,
    description: input.description,
    category: input.category,
    amount: input.amount,
    currency: group.currency,
    paidBy: input.paidBy,
    splitType: input.splitType,
    splits: buildSplits(
      input.splitType,
      input.amount,
      input.participantIds,
      input.inputValues,
    ),
    createdAt: new Date().toISOString(),
  }

  addExpense(expense)
  return expense
}

export interface ActivityItem {
  id: string
  kind: 'expense' | 'settlement'
  description: string
  groupName: string
  groupId: string
  emoji: string
  category?: Category
  amount: number
  currency: CurrencyCode
  impact: number
  subtitle: string
  createdAt: string
}

export async function fetchActivity(): Promise<ActivityItem[]> {
  await delay()

  const groupById = new Map(groups.map((g) => [g.id, g]))

  const expenseItems: ActivityItem[] = expenses.map((e) => {
    const group = groupById.get(e.groupId)
    const myShare = e.splits.find((s) => s.userId === ME)?.shareAmount ?? 0
    const impact = e.paidBy === ME ? e.amount - myShare : -myShare
    const payer = e.paidBy === ME ? 'You' : (users[e.paidBy]?.name.split(' ')[0] ?? '?')

    return {
      id: e.id,
      kind: 'expense' as const,
      description: e.description,
      groupName: group?.name ?? 'Unknown group',
      groupId: e.groupId,
      emoji: group?.emoji ?? '💳',
      category: e.category,
      amount: e.amount,
      currency: e.currency,
      impact,
      subtitle: `${group?.name ?? ''} · ${payer} paid`,
      createdAt: e.createdAt,
    }
  })

  const settlementItems: ActivityItem[] = settlements.map((s) => {
    const group = s.groupId ? groupById.get(s.groupId) : undefined
    const iPaid = s.fromUser === ME
    const other = users[iPaid ? s.toUser : s.fromUser]

    return {
      id: s.id,
      kind: 'settlement' as const,
      description: iPaid ? `You paid ${other?.name ?? ''}` : `${other?.name ?? ''} paid you`,
      groupName: group?.name ?? 'Settlement',
      groupId: s.groupId ?? '',
      emoji: '✅',
      amount: s.amount,
      currency: s.currency,
      impact: iPaid ? s.amount : -s.amount,
      subtitle: group ? `${group.name} · settled up` : 'Settled up',
      createdAt: s.createdAt,
    }
  })

  return [...expenseItems, ...settlementItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export interface FriendRow {
  user: User
  amount: number
}

export async function fetchFriends(homeCurrency: CurrencyCode): Promise<FriendRow[]> {
  await delay()

  const nets = computeFriendNets(expenses, settlements, ME, homeCurrency)
  return nets
    .filter((n) => users[n.userId])
    .map((n) => ({ user: users[n.userId], amount: n.amount }))
    .sort((a, b) => b.amount - a.amount)
}

export interface HomeSummary {
  summary: NetSummary
  friendNets: FriendNet[]
  groups: GroupSummary[]
  activity: ActivityItem[]
  homeCurrency: CurrencyCode
}

export async function fetchHome(homeCurrency: CurrencyCode): Promise<HomeSummary> {
  await delay()

  const friendNets = computeFriendNets(expenses, settlements, ME, homeCurrency)
  const summary = summarizeNets(friendNets)

  const groupSummaries = groups.map((group) => {
    const groupExpenses = expenses.filter((e) => e.groupId === group.id)
    const groupSettlements = settlements.filter((s) => s.groupId === group.id)
    return {
      ...group,
      balance: computeNetBalance(groupExpenses, ME, groupSettlements),
    }
  })

  const activity = await fetchActivity()

  return {
    summary,
    friendNets,
    groups: groupSummaries,
    activity: activity.slice(0, 6),
    homeCurrency,
  }
}

export interface SettleTarget {
  user: User
  amount: number
  currency: CurrencyCode
}

export async function fetchSettleTargets(
  homeCurrency: CurrencyCode,
  groupId?: string,
): Promise<SettleTarget[]> {
  await delay()

  if (groupId) {
    const group = groups.find((g) => g.id === groupId)
    if (!group) throw new Error(`Group ${groupId} not found`)

    const groupExpenses = expenses.filter((e) => e.groupId === groupId)
    const groupSettlements = settlements.filter((s) => s.groupId === groupId)

    return group.memberIds
      .filter((id) => id !== ME)
      .map((id) => ({
        user: users[id],
        amount: applySettlementsToPair(
          computePairBalance(groupExpenses, ME, id),
          groupSettlements,
          ME,
          id,
        ),
        currency: group.currency,
      }))
      .filter((row) => Math.abs(row.amount) > 0.005)
      .sort((a, b) => a.amount - b.amount)
  }

  const nets = computeFriendNets(expenses, settlements, ME, homeCurrency)
  return nets
    .filter((n) => users[n.userId] && Math.abs(n.amount) > 0.005)
    .map((n) => ({ user: users[n.userId], amount: n.amount, currency: homeCurrency }))
    .sort((a, b) => a.amount - b.amount)
}

export interface CreateSettlementInput {
  groupId: string | null
  toUser: string
  amount: number
  currency: CurrencyCode
  method: 'cash' | 'in_app'
}

export async function createSettlement(
  input: CreateSettlementInput,
): Promise<Settlement> {
  await delay()

  const settlement: Settlement = {
    id: `set_${Date.now()}`,
    groupId: input.groupId,
    fromUser: ME,
    toUser: input.toUser,
    amount: input.amount,
    currency: input.currency,
    method: input.method,
    createdAt: new Date().toISOString(),
  }

  addSettlement(settlement)
  return settlement
}

export interface CategoryTotal {
  category: Category
  total: number
  pct: number
}

export interface GroupTotal {
  groupId: string
  name: string
  emoji: string
  total: number
}

export interface MonthlyPoint {
  label: string
  total: number
}

export interface Insights {
  summary: NetSummary
  totalTracked: number
  expenseCount: number
  byCategory: CategoryTotal[]
  byGroup: GroupTotal[]
  monthly: MonthlyPoint[]
  homeCurrency: CurrencyCode
}

export async function fetchInsights(homeCurrency: CurrencyCode): Promise<Insights> {
  await delay()

  const friendNets = computeFriendNets(expenses, settlements, ME, homeCurrency)
  const summary = summarizeNets(friendNets)

  const totalTracked = expenses.reduce(
    (sum, e) => sum + convert(e.amount, e.currency, homeCurrency),
    0,
  )

  const categoryTotals = new Map<Category, number>()
  for (const e of expenses) {
    const value = convert(e.amount, e.currency, homeCurrency)
    categoryTotals.set(e.category, (categoryTotals.get(e.category) ?? 0) + value)
  }
  const byCategory: CategoryTotal[] = [...categoryTotals.entries()]
    .map(([category, total]) => ({
      category,
      total,
      pct: totalTracked > 0 ? (total / totalTracked) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)

  const byGroup: GroupTotal[] = groups
    .map((group) => ({
      groupId: group.id,
      name: group.name,
      emoji: group.emoji,
      total: expenses
        .filter((e) => e.groupId === group.id)
        .reduce((sum, e) => sum + convert(e.amount, e.currency, homeCurrency), 0),
    }))
    .sort((a, b) => b.total - a.total)

  const monthly: MonthlyPoint[] = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const total = expenses
      .filter((e) => {
        const d = new Date(e.createdAt)
        return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth()
      })
      .reduce((sum, e) => sum + convert(e.amount, e.currency, homeCurrency), 0)

    monthly.push({
      label: date.toLocaleString('en-US', { month: 'short' }),
      total,
    })
  }

  return {
    summary,
    totalTracked,
    expenseCount: expenses.length,
    byCategory,
    byGroup,
    monthly,
    homeCurrency,
  }
}
