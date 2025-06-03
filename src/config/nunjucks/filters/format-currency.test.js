import { describe, test, expect } from 'vitest'
import { formatCurrency } from './filters.js'

describe('formatCurrency', () => {
  test('should format value to GBP currency by default', () => {
    const result = formatCurrency(1234.56)
    expect(result).toBe('£1,234.56') // Default to 'en-GB' and 'GBP'
  })

  test('should format value to specified currency', () => {
    const result = formatCurrency(1234.56, 'en-US', 'USD')
    expect(result).toBe('$1,234.56') // Expected as per 'en-US' locale and 'USD'
  })

  test('should format value to specified locale', () => {
    const result = formatCurrency(1234.56, 'fr-FR', 'EUR')
    expect(result).toBe('1 234,56 €') // French format for Euros
  })

  test('should handle integers correctly', () => {
    const result = formatCurrency(1000, 'en-GB', 'GBP')
    expect(result).toBe('£1,000.00')
  })

  test('should handle zero correctly', () => {
    const result = formatCurrency(0, 'en-GB', 'GBP')
    expect(result).toBe('£0.00')
  })

  test('should handle negative values correctly', () => {
    const result = formatCurrency(-500.99, 'en-US', 'USD')
    expect(result).toBe('-$500.99')
  })
})
