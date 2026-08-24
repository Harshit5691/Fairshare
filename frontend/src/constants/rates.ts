import type { CurrencyCode } from '../types'

export const RATES_TO_USD: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  JPY: 0.0067,
  INR: 0.012,
}

export function convert(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
): number {
  if (from === to) return amount
  return (amount * RATES_TO_USD[from]) / RATES_TO_USD[to]
}
