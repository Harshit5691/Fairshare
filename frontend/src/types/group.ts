import type { CurrencyCode } from './common'

export interface Group{
    id: string
    name: string
    emoji: string
    currency: CurrencyCode
    memberIds: string[]
}