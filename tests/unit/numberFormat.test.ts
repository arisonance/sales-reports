import { describe, it, expect } from 'vitest'
import { formatCurrencyDisplay, parseCurrencyInput } from '@/lib/numberFormat'

describe('formatCurrencyDisplay', () => {
  it('returns empty string for 0', () => {
    expect(formatCurrencyDisplay(0)).toBe('')
  })

  it('formats thousands with commas', () => {
    expect(formatCurrencyDisplay(1234)).toBe('1,234')
    expect(formatCurrencyDisplay(1234567)).toBe('1,234,567')
  })

  it('handles small numbers without commas', () => {
    expect(formatCurrencyDisplay(999)).toBe('999')
  })

  it('handles single digits', () => {
    expect(formatCurrencyDisplay(5)).toBe('5')
  })

  it('handles negative numbers', () => {
    expect(formatCurrencyDisplay(-5000)).toBe('-5,000')
  })

  it('handles decimal values', () => {
    const result = formatCurrencyDisplay(1234.56)
    expect(result).toContain('1,234')
  })

  it('handles very large numbers', () => {
    expect(formatCurrencyDisplay(1000000000)).toBe('1,000,000,000')
  })
})

describe('parseCurrencyInput', () => {
  it('returns 0 for empty string', () => {
    expect(parseCurrencyInput('')).toBe(0)
  })

  it('parses plain numbers', () => {
    expect(parseCurrencyInput('1234')).toBe(1234)
  })

  it('strips commas and parses', () => {
    expect(parseCurrencyInput('1,234,567')).toBe(1234567)
  })

  it('handles decimal values', () => {
    expect(parseCurrencyInput('1,234.56')).toBe(1234.56)
  })

  it('returns 0 for non-numeric strings', () => {
    expect(parseCurrencyInput('abc')).toBe(0)
  })

  it('handles negative numbers', () => {
    expect(parseCurrencyInput('-5,000')).toBe(-5000)
  })

  it('handles whitespace', () => {
    expect(parseCurrencyInput(' 1,234 ')).toBe(1234)
  })

  it('handles leading zeros', () => {
    expect(parseCurrencyInput('007')).toBe(7)
  })

  it('handles just a decimal point', () => {
    expect(parseCurrencyInput('.')).toBe(0)
  })

  it('handles value with dollar sign', () => {
    expect(parseCurrencyInput('$1,234')).toBe(1234)
  })
})
