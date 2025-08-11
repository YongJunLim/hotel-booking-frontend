import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, it, beforeEach, expect, vi, Mock } from 'vitest'
import { ResultsPage } from '../../../src/pages/ResultsPage'
import { MockHotelData, MockPriceData } from '../../../__mocks__/MockHotel'
import { Hotel } from '../../../src/types/params'
import useSWR from 'swr'

vi.mock('swr', () => ({
  __esModule: true,
  default: vi.fn(),
}))
const mockedUseSWR = useSWR as Mock

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

describe('Filter by Rating', () => {
  beforeEach(() => {
    mockedUseSWR.mockImplementation((key: string | null) => {
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

  it('Filter min 3 & max 5 rating', () => {
    const MinInput = screen.getByTestId('min-rating-star-3')
    const MaxInput = screen.getByTestId('max-rating-star-5')

    fireEvent.click(MinInput)
    fireEvent.click(MaxInput)

    const hotelCards = screen.getAllByTestId('hotel-card')
    const names = hotelCards.map(
      card => within(card).getByTestId('hotel-name').textContent,
    )
    const rating = hotelCards.map((card) => {
      const checkedStar = within(card).getByRole('radio', { checked: true })
      return checkedStar.getAttribute('aria-label')
    })

    expect(names).toEqual(['Cookie A Hotel', 'Oreo C Hotel'])
    expect(rating).toEqual(['3.5 star', '4.5 star'])
  })

  it('Filter min 3.5 & max 3.5 rating', () => {
    const MinInput = screen.getByTestId('min-rating-star-3.5')
    const MaxInput = screen.getByTestId('max-rating-star-3.5')

    fireEvent.click(MinInput)
    fireEvent.click(MaxInput)

    const hotelCards = screen.getAllByTestId('hotel-card')
    const names = hotelCards.map(
      card => within(card).getByTestId('hotel-name').textContent,
    )
    const rating = hotelCards.map((card) => {
      const checkedStar = within(card).getByRole('radio', { checked: true })
      return checkedStar.getAttribute('aria-label')
    })

    expect(names).toEqual(['Cookie A Hotel'])
    expect(rating).toEqual(['3.5 star'])
  })

  it('Filter min 5 max 3 rating (error)', async () => {
    const MinInput = screen.getByTestId('min-rating-star-5')
    const MaxInput = screen.getByTestId('max-rating-star-3')

    fireEvent.click(MinInput)
    fireEvent.click(MaxInput)

    const hotelCards = screen.queryAllByTestId('hotel-card')
    expect(hotelCards.length).toBe(0)
    await screen.findByText(/No matching hotels found/i)
  })
})

describe('Filter empty list', () => {
  beforeEach(() => {
    mockedUseSWR.mockImplementation((key: string | null) => {
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

  it('filters no hotel cards when data is empty', async () => {
    const MinInput = screen.getByTestId('min-rating-star-3')
    const MaxInput = screen.getByTestId('min-rating-star-3')

    fireEvent.click(MinInput)
    fireEvent.click(MaxInput)

    const hotelCards = screen.queryAllByTestId('hotel-card')
    expect(hotelCards.length).toBe(0)
    await screen.findByText(/No matching hotels found/i)
  })
})
