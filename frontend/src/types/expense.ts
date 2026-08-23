import type { CurrencyCode } from "./common";

export type SplitType = 'equal' | 'exact' | 'percentage'

export type Category = 'Food' | 'Travel' | 'Rent' | 'Utilities' | 'Entertainment' | 'Groceries' | 'Other'

export interface ExpenseSplit {
    userId: string
    shareAmount: number
    inputValue?: number
}

export interface Expense {
    id: string
    groupId: string
    description: string
    category: Category
    amount: number
    currency: CurrencyCode
    paidBy: string
    splitType: SplitType
    splits: ExpenseSplit[]
    createdAt: string
}