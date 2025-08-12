import { dateToLocal } from '../../src/utils/dateUtils'
import { expect, it, describe } from 'vitest'

describe('dateToLocal Unit Test', () => {
  it('dateToLocal should format the date correctly', () => {
    // const date = new Date('Thu Jul 31 2025 00:00:00 GMT+0800 (Singapore Standard Time)')
    const date = new Date(2025, 6, 31) // Year, Month (0-indexed), Day
    const result = dateToLocal(date)
    expect(result).toBe('31/07/2025')
  })
})
