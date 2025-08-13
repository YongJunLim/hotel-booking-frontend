<<<<<<< HEAD
import './__mocks__/zustandMiddleware'

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useFormStore, useCountryStore } from '../../src/stores/HotelSearch'
import { mockStorage } from './__mocks__/zustandMiddleware'
=======
import '../../__mocks__/zustandMiddleware'

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useFormStore, useCountryStore } from '../../src/stores/HotelSearchStore'
import { mockStorage } from '../../__mocks__/zustandMiddleware'
>>>>>>> main

interface StoredFormData {
  state: {
    Adult: number
    Children: number
    Room: number
    range: {
      from: string
      to: string
    }
  }
  version: number
}

interface StoredCountryData {
  state: {
    country: {
      uid: string
      term: string
      lat: number
      lng: number
    }
  }
  version: number
}

describe('Unit Test for FormStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStorage.getItem.mockReturnValue(null)
    mockStorage.setItem.mockClear()
  })

  it('should initialize with default values', () => {
    const state = useFormStore.getState()

    expect(state.Adult).toBe(1)
    expect(state.Children).toBe(0)
    expect(state.Room).toBe(1)
    expect(state.range.from).toBeUndefined()
  })

  it('should update Adult count', () => {
    const { setAdult } = useFormStore.getState()

    setAdult(3)

    expect(useFormStore.getState().Adult).toBe(3)
  })

  it('should update Adult count with function', () => {
    const { setAdult } = useFormStore.getState()

    setAdult(prev => prev + 2)

    expect(useFormStore.getState().Adult).toBe(3)
  })

  it('should update Children count', () => {
    const { setChildren } = useFormStore.getState()

    setChildren(2)

    expect(useFormStore.getState().Children).toBe(2)
  })

  it('should update Children count with function', () => {
    const { setChildren } = useFormStore.getState()

    setChildren(prev => prev + 1)

    expect(useFormStore.getState().Children).toBe(1)
  })
  it('should update Room count', () => {
    const { setRoom } = useFormStore.getState()

    setRoom(2)

    expect(useFormStore.getState().Room).toBe(2)
  })

  it('should update Room count with function', () => {
    const { setRoom } = useFormStore.getState()

    setRoom(prev => prev + 1)

    expect(useFormStore.getState().Room).toBe(2)
  })

  it('should update date range', () => {
    const { setRange } = useFormStore.getState()
    const testStartDate = new Date('2025-08-10')
    const testEndDate = new Date('2025-08-15')

    setRange({ from: testStartDate, to: testEndDate })

    const state = useFormStore.getState()
    expect(state.range.from).toEqual(testStartDate)
    expect(state.range.to).toEqual(testEndDate)
  })

  it('should handle state restoration correctly', () => {
    useFormStore.setState({
      Adult: 3,
      Children: 2,
      Room: 2,
      range: {
        from: new Date('2025-08-10T00:00:00.000Z'),
        to: new Date('2025-08-15T00:00:00.000Z'),
      },
    })

    const state = useFormStore.getState()
    expect(state.Adult).toBe(3)
    expect(state.Children).toBe(2)
    expect(state.Room).toBe(2)
    expect(state.range.from).toBeInstanceOf(Date)
  })

  it('should parse stored data correctly', () => {
    const storedData = JSON.stringify({
      state: {
        Adult: 3,
        Children: 2,
        Room: 2,
        range: {
          from: '2025-08-10T00:00:00.000Z',
          to: '2025-08-15T00:00:00.000Z',
        },
      },
      version: 0,
    })

    mockStorage.getItem.mockReturnValue(storedData)

    expect(mockStorage.getItem('form-storage')).toBe(storedData)

    const parsed = JSON.parse(storedData) as StoredFormData
    expect(parsed.state.Adult).toBe(3)
    expect(parsed.state.Children).toBe(2)
    expect(parsed.state.Room).toBe(2)
    expect(parsed.state.range.from).toBe('2025-08-10T00:00:00.000Z')
    expect(parsed.state.range.to).toBe('2025-08-15T00:00:00.000Z')
  })

  it('should persist state to sessionStorage', async () => {
    const { setAdult, setChildren, setRoom, setRange } = useFormStore.getState()

    mockStorage.setItem.mockClear()

    setAdult(2)
    setChildren(1)
    setRoom(2)
    setRange({ from: new Date('2025-08-10'), to: new Date('2025-08-15') })

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(mockStorage.setItem).toHaveBeenCalled()

    const calls = mockStorage.setItem.mock.calls
    const lastCall = calls[calls.length - 1]

    expect(lastCall[0]).toBe('form-storage')

    const storedData = JSON.parse(lastCall[1] as string) as StoredFormData
    expect(storedData.state.Adult).toBe(2)
    expect(storedData.state.Children).toBe(1)
    expect(storedData.state.Room).toBe(2)
    expect(new Date(storedData.state.range.from)).toEqual(new Date('2025-08-10'))
    expect(new Date(storedData.state.range.to)).toEqual(new Date('2025-08-15'))
  })
})

describe('Unit Test for CountryStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStorage.getItem.mockReturnValue(null)
    mockStorage.setItem.mockClear()
  })

  it('should initialize with default country', () => {
    const state = useCountryStore.getState()

    expect(state.country).toEqual({
      uid: '',
      term: '',
      lat: 0,
      lng: 0,
    })
  })

  it('should update country', () => {
    const { setCountry } = useCountryStore.getState()

    setCountry('A6Dz', 'Rome, Italy', 41.895466, 12.482324)

    const state = useCountryStore.getState()
    expect(state.country).toEqual({
      uid: 'A6Dz',
      term: 'Rome, Italy',
      lat: 41.895466,
      lng: 12.482324,
    })
  })

  it('should handle state restoration correctly', () => {
    useCountryStore.setState({
      country: {
        uid: 'A6Dz',
        term: 'Rome, Italy',
        lat: 41.895466,
        lng: 12.482324,
      },
    })

    const state = useCountryStore.getState()
    expect(state.country).toEqual({
      uid: 'A6Dz',
      term: 'Rome, Italy',
      lat: 41.895466,
      lng: 12.482324,
    })
  })

  it('should parse stored data correctly', () => {
    const storedData = JSON.stringify({
      state: {
        country: {
          uid: 'A6Dz',
          term: 'Rome, Italy',
          lat: 41.895466,
          lng: 12.482324,
        },
      },
      version: 0,
    })

    mockStorage.getItem.mockReturnValue(storedData)

    expect(mockStorage.getItem('country-storage')).toBe(storedData)

    const parsed = JSON.parse(storedData) as StoredCountryData
    expect(parsed.state.country.uid).toBe('A6Dz')
    expect(parsed.state.country.term).toBe('Rome, Italy')
    expect(parsed.state.country.lat).toBe(41.895466)
    expect(parsed.state.country.lng).toBe(12.482324)
  })

  it('should persist country to sessionStorage', async () => {
    const { setCountry } = useCountryStore.getState()

    mockStorage.setItem.mockClear()

    setCountry('A6Dz', 'Rome, Italy', 41.895466, 12.482324)

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(mockStorage.setItem).toHaveBeenCalled()

    const calls = mockStorage.setItem.mock.calls
    const lastCall = calls[calls.length - 1]

    expect(lastCall[0]).toBe('country-storage')

    const storedData = JSON.parse(lastCall[1] as string) as StoredCountryData
    expect(storedData.state.country.uid).toBe('A6Dz')
    expect(storedData.state.country.term).toBe('Rome, Italy')
    expect(storedData.state.country.lat).toBe(41.895466)
    expect(storedData.state.country.lng).toBe(12.482324)
  })
})
