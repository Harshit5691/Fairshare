export const CHART_SERIES = [
  '#3987e5',
  '#d95926',
  '#199e70',
  '#c98500',
  '#d55181',
  '#008300',
  '#9085e9',
] as const

export const CHART_OTHER = '#6b6f7a'

export function seriesColor(index: number): string {
  return CHART_SERIES[index] ?? CHART_OTHER
}
