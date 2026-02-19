'use client'

import { useState } from 'react'
import { formatCurrencyDisplay, parseCurrencyInput } from '@/lib/numberFormat'

interface CurrencyInputProps {
  value: number
  onChange: (value: number) => void
  className?: string
  placeholder?: string
}

export default function CurrencyInput({ value, onChange, className, placeholder }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(() =>
    value === 0 ? '' : formatCurrencyDisplay(value)
  )
  const [isFocused, setIsFocused] = useState(false)
  const [prevValue, setPrevValue] = useState(value)

  // Sync display from prop when value changes externally (not during focus)
  if (prevValue !== value) {
    setPrevValue(value)
    if (!isFocused) {
      setDisplayValue(value === 0 ? '' : formatCurrencyDisplay(value))
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    // Show raw number without commas while editing
    setDisplayValue(value === 0 ? '' : String(value))
  }

  const handleBlur = () => {
    const parsed = parseCurrencyInput(displayValue)
    setDisplayValue(parsed === 0 ? '' : formatCurrencyDisplay(parsed))
    setIsFocused(false)
    onChange(parsed)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    // Allow empty, digits, commas, decimal point, minus
    if (/^-?[\d,]*\.?\d*$/.test(raw) || raw === '') {
      setDisplayValue(raw)
    }
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder || '0'}
      className={className}
    />
  )
}
