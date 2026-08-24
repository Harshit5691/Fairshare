/**
 * Categorical palette for the Insights charts.
 *
 * Validated for dark surfaces (#0c0e13): every hue sits in the OKLCH
 * L 0.48–0.67 band, clears the chroma floor and 3:1 contrast, and every
 * adjacent pair stays separable under deuteranopia, protanopia and
 * tritanopia. Assign these in fixed order — never cycle or generate a hue.
 */
export const CHART_SERIES = [
  '#3987e5', // blue
  '#d95926', // orange
  '#199e70', // aqua
  '#c98500', // yellow
  '#d55181', // magenta
  '#008300', // green
  '#9085e9', // violet
] as const

/** Anything past the palette folds into this neutral. */
export const CHART_OTHER = '#6b6f7a'

export function seriesColor(index: number): string {
  return CHART_SERIES[index] ?? CHART_OTHER
}
