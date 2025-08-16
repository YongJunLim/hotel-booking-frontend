import { incrementBy, decrementBy, CheckAdultAndChildren, CheckRoom } from '../../src/utils/dropdownUtils'
import { describe, it, vi, expect, test } from 'vitest'

function createMockState<T>(initialValue: T) {
  let value = initialValue

  const setter = vi.fn((update: T | ((prev: T) => T)) => {
    value
      = typeof update === 'function'
        ? (update as (prev: T) => T)(value)
        : update
  })

  const getValue = () => value

  return { setter, getValue }
}

describe('incrementBy Unit Test', () => {
  it('incrementBy should increase the value by the given amount if the result is less than or equal to 4', () => {
    const { setter, getValue } = createMockState(1)
    const incrementAmount = 3
    incrementBy(setter, incrementAmount)
    expect(setter).toHaveBeenCalled()
    expect(getValue()).toBe(4)
  })
})

describe('incrementBy Unit Test', () => {
  it('incrementBy should not increase the value by the given amount if the result is more than 4', () => {
    const { setter, getValue } = createMockState(4)
    const incrementAmount = 1
    incrementBy(setter, incrementAmount)
    expect(setter).toHaveBeenCalled()
    expect(getValue()).toBe(4)
  })
})

describe('decrementBy Unit Test', () => {
  it('decrementBy should decrease the value by the given amount if the result is greater than or equal to the original amount', () => {
    const { setter, getValue } = createMockState(4)
    const decrementAmount = 2
    const originalAmount = 2
    decrementBy(setter, decrementAmount, originalAmount)
    expect(setter).toHaveBeenCalled()
    expect(getValue()).toBe(2)
  })
})

describe('decrementBy Unit Test', () => {
  it('decrementBy should not decrease the value by the given amount if the result is less than the original amount', () => {
    const { setter, getValue } = createMockState(1)
    const decrementAmount = 1
    const originalAmount = 1
    decrementBy(setter, decrementAmount, originalAmount)
    expect(setter).toHaveBeenCalled()
    expect(getValue()).toBe(1)
  })
})

test('CheckAdultAndChildren should return Guests per room if input is more than 1', () => {
  const adults = 2
  const children = 1
  const result = CheckAdultAndChildren(adults + children)
  expect(result).toBe('Guests per room')
})

test('CheckAdultAndChildren should return Guest per room if input is equal to 1', () => {
  const adults = 0
  const children = 1
  const result = CheckAdultAndChildren(adults + children)
  expect(result).toBe('Guest per room')
})

test('CheckAdultAndChildren should throw an error if input is not a positive number', () => {
  expect(() => CheckAdultAndChildren(0)).toThrow('Input must be a positive number')
})

test('CheckRoom should return Rooms if input is more than 1', () => {
  const rooms = 3
  const result = CheckRoom(rooms)
  expect(result).toBe('Rooms')
})

test('CheckRoom should return Room if input is equal to 1', () => {
  const rooms = 1
  const result = CheckRoom(rooms)
  expect(result).toBe('Room')
})

test('CheckRoom should throw an error if input is not positive', () => {
  expect(() => CheckRoom(0)).toThrow('Input must be a positive number')
})
