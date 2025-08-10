import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, it, beforeEach, expect, vi, Mock } from 'vitest'
import { ResultsPage } from '../../../src/pages/ResultsPage'
import { MockHotelData, MockPriceData } from '../../stores/__mocks__/MockHotel'
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

describe('Sort DropDown Test', () => {
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

  it('Sort by Ascending Price', () => {
    const dropdown = screen.getByTestId('sort-dropdown')
    fireEvent.change(dropdown, { target: { value: 'Price (Ascending)' } })

    const hotelCards = screen.getAllByTestId('hotel-card')
    const names = hotelCards.map(
      card => within(card).getByTestId('hotel-name').textContent,
    )
    expect(names).toEqual(['Cookie A Hotel', 'Milk B Hotel', 'Oreo C Hotel'])
  })

  it('Sort by Descending Price', () => {
    const dropdown = screen.getByTestId('sort-dropdown')
    fireEvent.change(dropdown, { target: { value: 'Price (Descending)' } })

    const hotelCards = screen.getAllByTestId('hotel-card')
    const names = hotelCards.map(
      card => within(card).getByTestId('hotel-name').textContent,
    )
    expect(names).toEqual(['Oreo C Hotel', 'Milk B Hotel', 'Cookie A Hotel'])
  })

  it('Sort by Ascending Rating', () => {
    const dropdown = screen.getByTestId('sort-dropdown')
    fireEvent.change(dropdown, { target: { value: 'Rating (Ascending)' } })

    const hotelCards = screen.getAllByTestId('hotel-card')
    const names = hotelCards.map(
      card => within(card).getByTestId('hotel-name').textContent,
    )
    expect(names).toEqual(['Milk B Hotel', 'Cookie A Hotel', 'Oreo C Hotel'])
  })

  it('Sort by Descending Rating', () => {
    const dropdown = screen.getByTestId('sort-dropdown')
    fireEvent.change(dropdown, { target: { value: 'Rating (Descending)' } })

    const hotelCards = screen.getAllByTestId('hotel-card')
    const names = hotelCards.map(
      card => within(card).getByTestId('hotel-name').textContent,
    )
    expect(names).toEqual(['Oreo C Hotel', 'Cookie A Hotel', 'Milk B Hotel'])
  })
})

describe('Sort empty list', () => {
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

  it('renders no hotel cards when data is empty', async () => {
    const hotelCards = screen.queryAllByTestId('hotel-card')
    expect(hotelCards.length).toBe(0)

    const dropdown = screen.getByTestId('sort-dropdown')
    expect(dropdown).toBeInTheDocument()
    await screen.findByText(/No matching hotels found/i)
  })
})
