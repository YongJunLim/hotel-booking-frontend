import { render, screen, within } from '@testing-library/react'
import { describe, expect, beforeEach, vi, Mock } from 'vitest'
import { ResultsPage } from '../../../src/pages/ResultsPage'
import { MockHotelData, MockPriceData } from '../../stores/__mocks__/MockHotel'
import { Hotel } from '../../../src/types/params'
import useSWR from 'swr'

vi.mock('swr', () => ({
  __esModule: true,
  default: vi.fn(),
}))

const mockUseSWR = useSWR as Mock

const PriceData = {
  hotels: MockPriceData.flatMap(group => group.hotels),
  completed: true,
}
const HotelData = MockHotelData
const EmptyPriceData = {
  hotels: [],
  completed: true,
}
const EmptyHotelData: Hotel[] = []

describe('Hotel & Price data is stitched according to id & in ascending price', () => {
  beforeEach(() => {
    mockUseSWR.mockImplementation((key: string | null) => {
      if (typeof key !== 'string') {
        return { data: null, error: null, isLoading: false }
      }
      if (key.includes('/hotels/prices')) {
        return {
          data: PriceData,
          error: null,
          isLoading: false,
        }
      }
      else if (key.includes('/hotels?destination_id')) {
        return {
          data: HotelData,
          error: null,
          isLoading: false,
        }
      }
      return { data: null, error: null, isLoading: false }
    })
    render(<ResultsPage></ResultsPage>)
  })

  it('shows stitched hotels with matching id sorted by price ascending', () => {
    const hotelCards = screen.getAllByTestId('hotel-card')
    const names = hotelCards.map(
      card => within(card).getByTestId('hotel-name').textContent,
    )
    const prices = hotelCards.map(
      card => within(card).getByTestId('hotel-price').textContent,
    )

    expect(names).toEqual(['Cookie A Hotel', 'Milk B Hotel', 'Oreo C Hotel'])
    expect(prices).toEqual(['$500', '$1000', '$2000'])
  })
})

describe('empty price data', () => {
  const mockUseSWR = useSWR as Mock
  beforeEach(() => {
    mockUseSWR.mockImplementation((key: string | null) => {
      if (typeof key !== 'string') {
        return { data: null, error: null, isLoading: false }
      }
      if (key.includes('/hotels/prices')) {
        return {
          data: EmptyPriceData,
          error: null,
          isLoading: false,
        }
      }
      else if (key.includes('/hotels?destination_id')) {
        return {
          data: HotelData,
          error: null,
          isLoading: false,
        }
      }
      return { data: null, error: null, isLoading: false }
    })
    render(<ResultsPage></ResultsPage>)
  })

  it('shows stitched hotels with matching id sorted by price ascending', async () => {
    const hotelCards = screen.queryAllByTestId('hotel-card')
    expect(hotelCards.length).toBe(0)
    await screen.findByText(/No matching hotels found/i)
  })
})

describe('empty hotel data', () => {
  const mockUseSWR = useSWR as Mock
  beforeEach(() => {
    mockUseSWR.mockImplementation((key: string | null) => {
      if (typeof key !== 'string') {
        return { data: null, error: null, isLoading: false }
      }
      if (key.includes('/hotels/prices')) {
        return {
          data: PriceData,
          error: null,
          isLoading: false,
        }
      }
      else if (key.includes('/hotels?destination_id')) {
        return {
          data: EmptyHotelData,
          error: null,
          isLoading: false,
        }
      }
      return { data: null, error: null, isLoading: false }
    })
    render(<ResultsPage></ResultsPage>)
  })

  it('shows stitched hotels with matching id sorted by price ascending', async () => {
    const hotelCards = screen.queryAllByTestId('hotel-card')
    expect(hotelCards.length).toBe(0)
    await screen.findByText(/No matching hotels found/i)
  })
})

describe('empty price & hotel data', () => {
  const mockUseSWR = useSWR as Mock
  beforeEach(() => {
    mockUseSWR.mockImplementation((key: string | null) => {
      if (typeof key !== 'string') {
        return { data: null, error: null, isLoading: false }
      }
      if (key.includes('/hotels/prices')) {
        return {
          data: EmptyPriceData,
          error: null,
          isLoading: false,
        }
      }
      else if (key.includes('/hotels?destination_id')) {
        return {
          data: EmptyHotelData,
          error: null,
          isLoading: false,
        }
      }
      return { data: null, error: null, isLoading: false }
    })
    render(<ResultsPage></ResultsPage>)
  })

  it('shows stitched hotels with matching id sorted by price ascending', async () => {
    const hotelCards = screen.queryAllByTestId('hotel-card')
    expect(hotelCards.length).toBe(0)
    await screen.findByText(/No matching hotels found/i)
  })
})
