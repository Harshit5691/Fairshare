import type { User, Group } from '../types'

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
