import type { CurrencyCode } from "../types";

export interface CurrenyMeta {
    code: CurrencyCode
    name: string
    symbol: string
}

export const CURRENCIES: CurrenyMeta[] = [
    {code: 'USD', name: 'US Dollar', symbol: '$'},
    {code: 'EUR', name: 'Euro', symbol: '€'},
    {code: 'GBP', name: 'British Pound', symbol: '£'},
    {code: 'JPY', name: 'Japanese Yen', symbol: '¥'},
    {code: 'INR', name: 'Indian Rupee', symbol: '₹'},
]

export const CURRENCY_BY_CODE: Record<CurrencyCode, CurrenyMeta> = Object.fromEntries(
    CURRENCIES.map((c) => [c.code,c]),
) as Record<CurrencyCode, CurrenyMeta>