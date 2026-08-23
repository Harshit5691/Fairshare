import type { User, Group, Expense} from '../types'

function equalSplits(amount: number, memberIds: string[]) {
  const share = amount / memberIds.length
  return memberIds.map((userId) => ({ userId, shareAmount: share }))
}

export const users: Record<string, User> = {
  me:     { id: 'me',     name: 'Maya Rao',    initials: 'MR', avatarColor: '#3a4cc0' },
  jordan: { id: 'jordan', name: 'Jordan Lee',  initials: 'JL', avatarColor: '#d98c3a' },
  priya:  { id: 'priya',  name: 'Priya Anand', initials: 'PA', avatarColor: '#3a8a5a' },
  sam:    { id: 'sam',    name: 'Sam Kim',     initials: 'SK', avatarColor: '#7a5ad9' },
  nina:   { id: 'nina',   name: 'Nina Costa',  initials: 'NC', avatarColor: '#c0533a' },
  alex:   { id: 'alex',   name: 'Alex Park',   initials: 'AP', avatarColor: '#3a9ec0' },
}

export const groups: Group[] = [
  { id: 'lisbon', name: 'Lisbon Trip',  emoji: '🇵🇹', currency: 'EUR', memberIds: ['me', 'jordan', 'priya', 'sam'] },
  { id: 'apt',    name: 'Apartment 4B', emoji: '🏠', currency: 'USD', memberIds: ['me', 'priya', 'sam'] },
  { id: 'crew',   name: 'Weekend Crew', emoji: '🍕', currency: 'USD', memberIds: ['me', 'sam', 'jordan', 'nina', 'alex'] },
]

export const expenses: Expense[] = [
  { id: '1', groupId: 'lisbon', description: 'City-centre flat', category: 'Travel', amount: 640, currency: 'EUR', paidBy: 'me',     splitType: 'equal', splits: equalSplits(640, ['me','jordan','priya','sam']), createdAt: '2026-06-28' },
  { id: '2', groupId: 'lisbon', description: 'Dinner at Time Out', category: 'Food', amount: 128, currency: 'EUR', paidBy: 'me',     splitType: 'equal', splits: equalSplits(128, ['me','jordan','priya','sam']), createdAt: '2026-06-28' },
  { id: '3', groupId: 'lisbon', description: 'Airport taxi', category: 'Travel', amount: 44, currency: 'EUR', paidBy: 'jordan', splitType: 'equal', splits: equalSplits(44, ['me','jordan','priya','sam']), createdAt: '2026-06-27' },
  { id: '6', groupId: 'apt',    description: 'September rent', category: 'Rent', amount: 1500, currency: 'USD', paidBy: 'priya', splitType: 'equal', splits: equalSplits(1500, ['me','priya','sam']), createdAt: '2026-06-23' },
  { id: '7', groupId: 'apt',    description: 'Groceries — Trader Joes', category: 'Groceries', amount: 156, currency: 'USD', paidBy: 'me', splitType: 'equal', splits: equalSplits(156, ['me','priya','sam']), createdAt: '2026-06-25' },
  { id: '10', groupId: 'crew',  description: 'Pizza night', category: 'Food', amount: 64, currency: 'USD', paidBy: 'me',    splitType: 'equal', splits: equalSplits(64, ['me','sam','jordan','nina','alex']), createdAt: '2026-06-29' },
  { id: '11', groupId: 'crew',  description: 'Concert tickets', category: 'Entertainment', amount: 250, currency: 'USD', paidBy: 'sam', splitType: 'equal', splits: equalSplits(250, ['me','sam','jordan','nina','alex']), createdAt: '2026-06-16' },
]