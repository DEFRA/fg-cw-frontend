import { describe, it, expect } from 'vitest'
import { getFormattedGBDate } from './date-helpers.js'

describe('date-helpers', () => {
  describe('getFormattedGBDate', () => {
    it('formats valid ISO date string correctly', () => {
      const result = getFormattedGBDate('2021-01-15T00:00:00.000Z')
      expect(result).toBe('15/01/2021')
    })

    it('formats valid date string without time correctly', () => {
      const result = getFormattedGBDate('2021-12-25')
      expect(result).toBe('25/12/2021')
    })

    it('formats Date object correctly', () => {
      const date = new Date('2021-06-30T12:30:45.000Z')
      const result = getFormattedGBDate(date)
      expect(result).toBe('30/06/2021')
    })

    it('returns "Invalid Date" for undefined', () => {
      const result = getFormattedGBDate(undefined)
      expect(result).toBe('Invalid Date')
    })

    it('returns "Invalid Date" for empty string', () => {
      const result = getFormattedGBDate('')
      expect(result).toBe('Invalid Date')
    })
  })
})
