/**
 * Format a number with US locale commas (e.g., 1234567 -> "1,234,567")
 * Returns empty string for 0 to allow empty display in inputs.
 */
export function formatCurrencyDisplay(value: number): string {
  if (value === 0) return ''
  return value.toLocaleString('en-US')
}

/**
 * Parse a formatted number string back to a number.
 * Handles commas, whitespace, and returns 0 for empty/invalid input.
 */
export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^0-9.\-]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}
