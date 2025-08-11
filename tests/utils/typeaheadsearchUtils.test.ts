import { handleKeyDown, evaluateEpiData } from '../../src/utils/typeaheadsearchUtils'
import type { Destination } from '../../src/types/destination'
import { describe, it, expect } from 'vitest'

describe('handleKeyDown Unit Test', () => {
  it('should call setHighlightedIndex with the correct value when ArrowDown is pressed', () => {
    const setHighlightedIndex = vi.fn()
    const setStartIndex = vi.fn()
    const suggestions: Destination[] = [{
      uid: '1', term: 'Paris', type: 'city',
      lat: 0,
      lng: 0,
    },
    {
      uid: '2', term: 'London', type: 'city',
      lat: 0,
      lng: 0,
    }]
    const startIndex = 0
    const maxVisibleItems = 4
    const handleSelect = vi.fn()

    const event = {
      key: 'ArrowDown',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.KeyboardEvent<HTMLInputElement>
    handleKeyDown(
      event,
      0,
      setHighlightedIndex,
      suggestions,
      startIndex,
      setStartIndex,
      maxVisibleItems,
      handleSelect,
    )

    expect(setHighlightedIndex).toHaveBeenCalled()
    const updateFn = setHighlightedIndex.mock.calls[0][0] as (prev: number) => number
    expect(updateFn(1)).toBe(1)
  })

  it('should call setHighlightedIndex with the correct value when ArrowUp is pressed', () => {
    const setHighlightedIndex = vi.fn()
    const setStartIndex = vi.fn()
    const suggestions: Destination[] = [{
      uid: '1', term: 'Paris', type: 'city',
      lat: 0,
      lng: 0,
    },
    {
      uid: '2', term: 'London', type: 'city',
      lat: 0,
      lng: 0,
    }]
    const startIndex = 1
    const maxVisibleItems = 4
    const handleSelect = vi.fn()
    const event = {
      key: 'ArrowUp',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.KeyboardEvent<HTMLInputElement>
    handleKeyDown(
      event,
      1,
      setHighlightedIndex,
      suggestions,
      startIndex,
      setStartIndex,
      maxVisibleItems,
      handleSelect,
    )

    expect(setHighlightedIndex).toHaveBeenCalled()
    const updateFn = setHighlightedIndex.mock.calls[0][0] as (prev: number) => number
    expect(updateFn(1)).toBe(0)
  })

  it('should call handleSelect with the correct suggestion when Enter is pressed', () => {
    const setHighlightedIndex = vi.fn()
    const setStartIndex = vi.fn()
    const suggestions: Destination[] = [{
      uid: '1', term: 'Paris', type: 'city',
      lat: 0,
      lng: 0,
    },
    {
      uid: '2', term: 'London', type: 'city',
      lat: 0,
      lng: 0,
    }]
    const startIndex = 0
    const maxVisibleItems = 4
    const handleSelect = vi.fn()

    const event = {
      key: 'Enter',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.KeyboardEvent<HTMLInputElement>
    handleKeyDown(
      event,
      0,
      setHighlightedIndex,
      suggestions,
      startIndex,
      setStartIndex,
      maxVisibleItems,
      handleSelect,
    )

    expect(handleSelect).toHaveBeenCalledWith(suggestions[0])
  })
})

describe('evaluateEpiData Unit Test', () => {
  it('should return the correct output for a term that is not in the JSON (Paris)', () => {
    const term = 'Paris'
    const result = evaluateEpiData(term)
    expect(result).toEqual({
      message: 'There is no environmental data available for this destination.',
      level: 'none',
    })
  })

  it('should return the correct output for a term (country only, capitalised first letter) that is within the JSON and has score more than or equals to 67 and less than or equals to 100 (France with score of 67)', () => {
    const term = 'France'
    const result = evaluateEpiData(term)
    expect(result).toEqual({
      message: 'This destination is highly environmentally friendly!',
      level: 'high',
    })
  })

  it('should return the correct output for a term (country only, capitalised third letter) that is within the JSON and has score more than or equals to 67 and less than or equals to 100 (France with score of 67)', () => {
    const term = 'frAnce'
    const result = evaluateEpiData(term)
    expect(result).toEqual({
      message: 'This destination is highly environmentally friendly!',
      level: 'high',
    })
  })

  it('should return the correct output for a term (country and city) that is within the JSON and has score more than or equals to 67 and less than or equals to 100 (France with score of 67)', () => {
    const term = 'Paris, France'
    const result = evaluateEpiData(term)
    expect(result).toEqual({
      message: 'This destination is highly environmentally friendly!',
      level: 'high',
    })
  })

  it('should return the correct output for a term (country only, capitalised first letter) that is within the JSON and has score more than or equals to 34 and less than 67 (Liberia with score of 34.3)', () => {
    const term = 'Liberia'
    const result = evaluateEpiData(term)
    expect(result).toEqual({
      message: 'This destination has moderate environmental friendliness.',
      level: 'moderate',
    })
  })

  it('should return the correct output for a term (country only, capitalised third letter) that is within the JSON and has score more than or equals to 34 and less than 67 (Liberia with score of 34.3)', () => {
    const term = 'liBeria'
    const result = evaluateEpiData(term)
    expect(result).toEqual({
      message: 'This destination has moderate environmental friendliness.',
      level: 'moderate',
    })
  })

  it('should return the correct output for a term (country and city) that is within the JSON and has score more than or equals to 34 and less than 67 (Liberia with score of 34.3)', () => {
    const term = 'Monrovia, Liberia'
    const result = evaluateEpiData(term)
    expect(result).toEqual({
      message: 'This destination has moderate environmental friendliness.',
      level: 'moderate',
    })
  })

  it('should return the correct output for a term (country only, capitalised first letter) that is within the JSON and has score less than 34 and more than or equals to 0 (Rwanda with score of 33.9)', () => {
    const term = 'Rwanda'
    const result = evaluateEpiData(term)
    expect(result).toEqual({
      message: 'This destination has low environmental friendliness.',
      level: 'low',
    })
  })

  it('should return the correct output for a term (country only, capitalised third letter) that is within the JSON and has score less than 34 and more than or equals to 0 (Rwanda with score of 33.9)', () => {
    const term = 'rwAnda'
    const result = evaluateEpiData(term)
    expect(result).toEqual({
      message: 'This destination has low environmental friendliness.',
      level: 'low',
    })
  })

  it('should return the correct output for a term (country and city) that is within the JSON and has score less than 34 and more than or equals to 0 (Rwanda with score of 33.9)', () => {
    const term = 'Kigali, Rwanda'
    const result = evaluateEpiData(term)
    expect(result).toEqual({
      message: 'This destination has low environmental friendliness.',
      level: 'low',
    })
  })
})
