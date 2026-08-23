import type { CurrencyCode } from "../types";

export function formatMoney(value: number, currency: CurrencyCode, signed = false): string{
    const formatted = new Intl.NumberFormat('en-US',{
        style: 'currency',
        currency,
        currencyDisplay: 'narrowSymbol'
    }).format(Math.abs(value))

    if(signed) return `${value < 0 ? '-':'+'}${formatted}`
    return `${value < 0 ? '-':''}${formatted}`
}