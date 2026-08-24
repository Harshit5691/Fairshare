import type { CurrencyCode } from './common'

export type SettlementMethod = 'cash' | 'in_app'

export interface Settlement {
  id: string
  groupId: string | null
  fromUser: string
  toUser: string
  amount: number
  currency: CurrencyCode
  method: SettlementMethod
  createdAt: string
}
