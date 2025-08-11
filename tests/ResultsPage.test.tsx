import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from '@testing-library/react'
import { describe, it, beforeEach, expect, vi, Mock } from 'vitest'
import { ResultsPage } from '../src/pages/ResultsPage'
import { MockHotelData, MockPriceData } from './stores/__mocks__/MockHotel'
import { Hotel } from '../src/types/params'
import useSWR from 'swr'
import { MapLayerMouseEvent } from 'maplibre-gl'
import type { FeatureCollection } from 'geojson'

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

// for map
/* eslint-disable @typescript-eslint/no-unused-vars */
let lastOnMouseMove: ((event: MapLayerMouseEvent) => void) | null = null
let lastOnClick: ((event: MapLayerMouseEvent) => void) | null = null
/* eslint-enable @typescript-eslint/no-unused-vars */

interface MockMapProps {
  ref?: React.RefObject<unknown>
  onMouseMove?: (event: MapLayerMouseEvent) => void
  onClick?: (event: MapLayerMouseEvent) => void
  children?: React.ReactNode
  [key: string]: unknown
}

interface MockComponentProps {
  children?: React.ReactNode
  [key: string]: unknown
}
interface MockSourceProps {
  data: FeatureCollection
  children?: React.ReactNode
}
const flyTo = vi.fn()
const mockSourceProps: { data?: FeatureCollection } = {}

vi.mock('react-map-gl/maplibre', () => ({
  Map: (props: MockMapProps) => {
    if (props.ref) {
      props.ref.current = { flyTo }
    }
    lastOnMouseMove = props.onMouseMove ?? null
    lastOnClick = props.onClick ?? null
    return <div data-testid="map">{props.children}</div>
  },
  Source: (props: MockSourceProps) => {
    mockSourceProps.data = props.data
    return <div data-testid="map-source">{props.children}</div>
  },
  Layer: () => <div />,
  Popup: (props: MockComponentProps) => (
    <div data-testid="popup">{props.children}</div>
  ),
}))

describe('Results Page Integration test', () => {
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

  it('filter rating + map', async () => {
    const minRating = screen.getByTestId('min-rating-star-2')
    fireEvent.click(minRating)

    const hotelCards = await screen.findAllByTestId('hotel-card')
    const names = hotelCards.map(
      cards => within(cards).getByTestId('hotel-name').textContent,
    )

    await waitFor(() => {
      expect(mockSourceProps.data?.features.length).toBe(2)
    })
    expect(names).toEqual(['Cookie A Hotel', 'Oreo C Hotel'])
  })

  it('filter rating + sort', async () => {
    const minRating = screen.getByTestId('min-rating-star-2')
    fireEvent.click(minRating)

    const sortDropdown = screen.getByTestId('sort-dropdown')
    fireEvent.change(sortDropdown, { target: { value: 'Rating (Ascending)' } })

    const hotelCards = await screen.findAllByTestId('hotel-card')
    const names = hotelCards.map(
      cards => within(cards).getByTestId('hotel-name').textContent,
    )

    expect(names).toEqual(['Cookie A Hotel', 'Oreo C Hotel'])
  })

  it('sort + filter rating', async () => {
    const sortDropdown = screen.getByTestId('sort-dropdown')
    fireEvent.change(sortDropdown, { target: { value: 'Rating (Ascending)' } })

    const minRating = screen.getByTestId('min-rating-star-2')
    fireEvent.click(minRating)

    const hotelCards = await screen.findAllByTestId('hotel-card')
    const names = hotelCards.map(
      cards => within(cards).getByTestId('hotel-name').textContent,
    )

    expect(names).toEqual(['Cookie A Hotel', 'Oreo C Hotel'])
  })

  it('filter price + map', async () => {
    const priceSlider = screen.getByTestId('price-range-slider')
    const inputs = priceSlider.querySelectorAll('input')
    fireEvent.change(inputs[0], { target: { value: '1000' } })
    fireEvent.change(inputs[1], { target: { value: '2000' } })

    const hotelCards = await screen.findAllByTestId('hotel-card')
    const names = hotelCards.map(
      cards => within(cards).getByTestId('hotel-name').textContent,
    )

    await waitFor(() => {
      expect(mockSourceProps.data?.features.length).toBe(2)
    })
    expect(names).toEqual(['Milk B Hotel', 'Oreo C Hotel'])
  })

  it('filter price + sort', async () => {
    const priceSlider = screen.getByTestId('price-range-slider')
    const inputs = priceSlider.querySelectorAll('input')
    fireEvent.change(inputs[0], { target: { value: '1000' } })
    fireEvent.change(inputs[1], { target: { value: '2000' } })

    const sortDropdown = screen.getByTestId('sort-dropdown')
    fireEvent.change(sortDropdown, { target: { value: 'Price (Descending)' } })

    const hotelCards = await screen.findAllByTestId('hotel-card')
    const names = hotelCards.map(
      cards => within(cards).getByTestId('hotel-name').textContent,
    )

    expect(names).toEqual(['Oreo C Hotel', 'Milk B Hotel'])
  })

  it('sort + filter price', async () => {
    const sortDropdown = screen.getByTestId('sort-dropdown')
    fireEvent.change(sortDropdown, { target: { value: 'Price (Descending)' } })

    const priceSlider = screen.getByTestId('price-range-slider')
    const inputs = priceSlider.querySelectorAll('input')
    fireEvent.change(inputs[0], { target: { value: '1000' } })
    fireEvent.change(inputs[1], { target: { value: '2000' } })

    const hotelCards = await screen.findAllByTestId('hotel-card')
    const names = hotelCards.map(
      cards => within(cards).getByTestId('hotel-name').textContent,
    )

    expect(names).toEqual(['Oreo C Hotel', 'Milk B Hotel'])
  })

  it('filter rating + filter price', async () => {
    const minRating = screen.getByTestId('min-rating-star-2')
    fireEvent.click(minRating)

    const priceSlider = screen.getByTestId('price-range-slider')
    const inputs = priceSlider.querySelectorAll('input')
    fireEvent.change(inputs[0], { target: { value: '500' } })
    fireEvent.change(inputs[1], { target: { value: '1000' } })

    const hotelCards = await screen.findAllByTestId('hotel-card')
    const names = hotelCards.map(
      cards => within(cards).getByTestId('hotel-name').textContent,
    )

    expect(names).toEqual(['Cookie A Hotel'])
  })

  it('filter rating + filter price + map', async () => {
    const minRating = screen.getByTestId('min-rating-star-2')
    fireEvent.click(minRating)

    const priceSlider = screen.getByTestId('price-range-slider')
    const inputs = priceSlider.querySelectorAll('input')
    fireEvent.change(inputs[0], { target: { value: '500' } })
    fireEvent.change(inputs[1], { target: { value: '1000' } })

    const hotelCards = await screen.findAllByTestId('hotel-card')
    const names = hotelCards.map(
      cards => within(cards).getByTestId('hotel-name').textContent,
    )

    await waitFor(() => {
      expect(mockSourceProps.data?.features.length).toBe(1)
    })
    expect(names).toEqual(['Cookie A Hotel'])
  })

  it('filter rating + filter price (out of range)', () => {
    const minRating = screen.getByTestId('min-rating-star-4')
    fireEvent.click(minRating)

    const priceSlider = screen.getByTestId('price-range-slider')
    const inputs = priceSlider.querySelectorAll('input')
    fireEvent.change(inputs[0], { target: { value: '500' } })
    fireEvent.change(inputs[1], { target: { value: '1000' } })

    const hotelCards = screen.queryAllByTestId('hotel-card')
    expect(hotelCards.length).toBe(0)
    expect(screen.getByText(/No matching hotels found/i)).toBeInTheDocument()
  })

  it('filter rating + filter price + map (out of range)', async () => {
    const minRating = screen.getByTestId('min-rating-star-4')
    fireEvent.click(minRating)

    const priceSlider = screen.getByTestId('price-range-slider')
    const inputs = priceSlider.querySelectorAll('input')
    fireEvent.change(inputs[0], { target: { value: '500' } })
    fireEvent.change(inputs[1], { target: { value: '1000' } })

    const hotelCards = screen.queryAllByTestId('hotel-card')
    expect(hotelCards.length).toBe(0)
    expect(screen.getByText(/No matching hotels found/i)).toBeInTheDocument()
    await waitFor(() => {
      expect(mockSourceProps.data?.features.length).toBe(0)
    })
  })

  it('filter rating + filter price + sort + map', async () => {
    const minRating = screen.getByTestId('min-rating-star-2')
    fireEvent.click(minRating)

    const priceSlider = screen.getByTestId('price-range-slider')
    const inputs = priceSlider.querySelectorAll('input')
    fireEvent.change(inputs[0], { target: { value: '500' } })
    fireEvent.change(inputs[1], { target: { value: '2000' } })

    const sortDropdown = screen.getByTestId('sort-dropdown')
    fireEvent.change(sortDropdown, { target: { value: 'Price (Descending)' } })

    const hotelCards = await screen.findAllByTestId('hotel-card')
    const names = hotelCards.map(
      cards => within(cards).getByTestId('hotel-name').textContent,
    )
    expect(names).toEqual(['Oreo C Hotel', 'Cookie A Hotel'])
    await waitFor(() => {
      expect(mockSourceProps.data?.features.length).toBe(2)
    })
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

  it('Data is empty', async () => {
    const minRating = screen.getByTestId('min-rating-star-2')
    fireEvent.click(minRating)

    const priceSlider = screen.getByTestId('price-range-slider')
    const inputs = priceSlider.querySelectorAll('input')
    fireEvent.change(inputs[0], { target: { value: '500' } })
    fireEvent.change(inputs[1], { target: { value: '2000' } })

    const sortDropdown = screen.getByTestId('sort-dropdown')
    fireEvent.change(sortDropdown, { target: { value: 'Price (Descending)' } })

    const hotelCards = screen.queryAllByTestId('hotel-card')
    expect(hotelCards.length).toBe(0)
    expect(screen.getByText(/No matching hotels found/i)).toBeInTheDocument()
    await waitFor(() => {
      expect(mockSourceProps.data?.features.length).toBe(0)
    })
  })
})
