import type { CurrencyCode } from '../types'

/**
 * Static exchange rates, expressed as "1 unit of this currency = N USD".
 * A real app would fetch these; the design hardcoded them too.
 */
export const RATES_TO_USD: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  JPY: 0.0067,
  INR: 0.012,
}

/** Convert an amount from one currency to another via USD. */
export function convert(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
): number {
  if (from === to) return amount
  return (amount * RATES_TO_USD[from]) / RATES_TO_USD[to]
}
