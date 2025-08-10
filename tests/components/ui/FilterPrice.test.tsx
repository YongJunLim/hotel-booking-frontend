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

  it('filter min 600 max 1500 price', () => {
    const slider = screen.getByTestId('price-range-slider')
    const inputs = slider.querySelectorAll('input')

    fireEvent.change(inputs[0], { target: { value: '600' } })
    fireEvent.change(inputs[1], { target: { value: '1500' } })

    const hotelCards = screen.getAllByTestId('hotel-card')
    const names = hotelCards.map(
      cards => within(cards).getByTestId('hotel-name').textContent,
    )

    expect(names).toEqual(['Milk B Hotel'])
  })

  it('filter min 500 max 500 price', () => {
    const slider = screen.getByTestId('price-range-slider')
    const inputs = slider.querySelectorAll('input')

    fireEvent.change(inputs[0], { target: { value: '500' } })
    fireEvent.change(inputs[1], { target: { value: '500' } })

    const hotelCards = screen.getAllByTestId('hotel-card')
    const names = hotelCards.map(
      cards => within(cards).getByTestId('hotel-name').textContent,
    )

    expect(names).toEqual(['Cookie A Hotel'])
  })

  it('Filter min 1500 max 600 price', () => {
    const slider = screen.getByTestId('price-range-slider')
    const inputs = slider.querySelectorAll('input')

    fireEvent.change(inputs[0], { target: { value: '1500' } })
    fireEvent.change(inputs[1], { target: { value: '600' } })

    const hotelCards = screen.getAllByTestId('hotel-card')
    const names = hotelCards.map(
      cards => within(cards).getByTestId('hotel-name').textContent,
    )

    expect(names).toEqual(['Milk B Hotel'])
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
    const slider = screen.getByTestId('price-range-slider')
    const inputs = slider.querySelectorAll('input')

    fireEvent.change(inputs[0], { target: { value: '600' } })
    fireEvent.change(inputs[1], { target: { value: '1500' } })

    const hotelCards = screen.queryAllByTestId('hotel-card')
    expect(hotelCards.length).toBe(0)
    await screen.findByText(/No matching hotels found/i)
  })
})
