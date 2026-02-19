import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CurrencyInput from '@/components/ReportForm/CurrencyInput'

describe('CurrencyInput', () => {
  it('renders with formatted value for non-zero', () => {
    render(<CurrencyInput value={1234} onChange={() => {}} />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('1,234')
  })

  it('shows empty for zero value', () => {
    render(<CurrencyInput value={0} onChange={() => {}} />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('')
  })

  it('shows placeholder for zero value', () => {
    render(<CurrencyInput value={0} onChange={() => {}} />)
    const input = screen.getByPlaceholderText('0')
    expect(input).toBeInTheDocument()
  })

  it('shows raw number on focus (strips commas)', async () => {
    const user = userEvent.setup()
    render(<CurrencyInput value={1234} onChange={() => {}} />)
    const input = screen.getByRole('textbox')
    await user.click(input)
    expect(input).toHaveValue('1234')
  })

  it('shows empty on focus when value is 0', async () => {
    const user = userEvent.setup()
    render(<CurrencyInput value={0} onChange={() => {}} />)
    const input = screen.getByRole('textbox')
    await user.click(input)
    expect(input).toHaveValue('')
  })

  it('allows typing digits', async () => {
    const user = userEvent.setup()
    render(<CurrencyInput value={0} onChange={() => {}} />)
    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.type(input, '5000')
    expect(input).toHaveValue('5000')
  })

  it('calls onChange with parsed number on blur', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CurrencyInput value={0} onChange={onChange} />)
    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.type(input, '5000')
    await user.tab() // blur
    expect(onChange).toHaveBeenCalledWith(5000)
  })

  it('allows clearing the field', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CurrencyInput value={1234} onChange={onChange} />)
    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.clear(input)
    await user.tab()
    expect(onChange).toHaveBeenCalledWith(0)
  })

  it('formats on blur with commas', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CurrencyInput value={0} onChange={onChange} />)
    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.type(input, '1234567')
    await user.tab()
    expect(input).toHaveValue('1,234,567')
  })

  it('allows decimal input', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CurrencyInput value={0} onChange={onChange} />)
    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.type(input, '99.50')
    await user.tab()
    expect(onChange).toHaveBeenCalledWith(99.5)
  })

  it('syncs display when value prop changes while not focused', () => {
    const { rerender } = render(<CurrencyInput value={100} onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toHaveValue('100')
    rerender(<CurrencyInput value={5000} onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toHaveValue('5,000')
  })

  it('does not sync display when value prop changes while focused', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<CurrencyInput value={100} onChange={() => {}} />)
    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.type(input, '999')
    // Simulate external value change while user is typing
    rerender(<CurrencyInput value={200} onChange={() => {}} />)
    // Should keep user's typed value, not switch to 200
    expect(input).toHaveValue('100999')
  })

  it('applies custom className', () => {
    render(<CurrencyInput value={0} onChange={() => {}} className="custom-class" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
  })

  it('has inputMode decimal for mobile keyboards', () => {
    render(<CurrencyInput value={0} onChange={() => {}} />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('inputMode', 'decimal')
  })
})
