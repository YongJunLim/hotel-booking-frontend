import { describe, expect, vi, beforeEach, afterEach, Mock } from 'vitest'
import useBookingStore from '../src/stores/BookingStore'
import { renderHook, act } from '@testing-library/react'
import useAuthStore from '../src/stores/AuthStore'

describe('GetBooking ', () => {
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OTAyNTQ0OWM0Mjg4N2JkMDlkNjllNSIsImV4cCI6MTc1NDQ4Njk0M30.SsUFhg-PsRIScNP_4WAVofRjDzq12jzOteBwbr3aJpg'
})

vi.mock('../src/utils/GetBooking', () => ({
  getBooking: vi.fn(),
}))

import { getBooking } from '../src/utils/GetBooking'
const mockedGetBooking = vi.mocked(getBooking)

describe('BookingStore', () => {
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OTAyNTQ0OWM0Mjg4N2JkMDlkNjllNSIsImV4cCI6MTc1NDQ4Njk0M30.SsUFhg-PsRIScNP_4WAVofRjDzq12jzOteBwbr3aJpg'

  const mockBookings = [
    {
      _id: '507f1f77bcf86cd799439011',
      guestId: '507f191e810c19729de860ea',
      roomType: 'Standard Room',
      startDate: '2024-01-15',
      endDate: '2024-01-18',
      nights: 3,
      adults: 2,
      children: 0,
      status: 'confirmed',
      messageToHotel: 'Late check-in',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z',
    },
    {
      _id: '507f1f77bcf86cd799439012',
      guestId: '507f191e810c19729de860ea',
      roomType: 'Deluxe Suite',
      startDate: '2024-02-20',
      endDate: '2024-02-23',
      nights: 3,
      adults: 2,
      children: 1,
      status: 'pending',
      messageToHotel: 'Need extra bed',
      createdAt: '2024-01-05T14:30:00Z',
      updatedAt: '2024-01-05T14:30:00Z',
    },
  ]

  beforeEach(() => {
    vi.useFakeTimers()
    // Reset the store state before each test
    useBookingStore.getState().bookings = []
    useBookingStore.getState().bookingStatus = false
    useBookingStore.getState().selectedBooking = null
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should successfully fetch bookings - API module', async () => {
    // Mock the imported getBookings function
    mockedGetBooking.mockResolvedValueOnce({
      success: true,
      data: mockBookings,
      message: 'Bookings fetched successfully',
    })

    const { result } = renderHook(() => useBookingStore())

    await act(async () => {
      await result.current.fetchBooking()
    })

    expect(result.current.bookings).toEqual(mockBookings)
    expect(result.current.bookingStatus).toBe(true)
    expect(result.current.selectedBooking).toBeNull()
  })

  it('should initialise with default values', () => {
    const { result } = renderHook(() => useBookingStore())

    expect(result.current.bookingStatus).toBe(false)
    expect(result.current.bookings).toEqual([])
    expect(result.current.selectedBooking).toBeNull()
  })

  it('Successful fetch bookings but with no listings', async () => {
    // Mock the imported getBookings function
    mockedGetBooking.mockResolvedValueOnce({
      success: true,
      data: [],
      message: 'successful',
    })

    const { result } = renderHook(() => useBookingStore())

    await act(async () => {
      await result.current.fetchBooking()
    })

    expect(result.current.bookings).toEqual([])
    expect(result.current.bookingStatus).toBe(true)
    expect(result.current.selectedBooking).toBeNull()
  })

  it('Fail to fetch bookings', async () => {
    // Mock the imported getBookings function
    mockedGetBooking.mockResolvedValueOnce({
      success: false,
      message: 'Unsuccessful',
    })

    const { result } = renderHook(() => useBookingStore())

    await act(async () => {
      await result.current.fetchBooking()
    })

    expect(result.current.bookings).toEqual([])
    expect(result.current.bookingStatus).toBe(false)
    expect(result.current.selectedBooking).toBeNull()
  })

  it('Network error when fetching bookings', async () => {
    // Mock the imported getBookings function
    mockedGetBooking.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useBookingStore())

    await act(async () => {
      await result.current.fetchBooking()
    })

    expect(result.current.bookings).toEqual([])
    expect(result.current.bookingStatus).toBe(false)
    expect(result.current.selectedBooking).toBeNull()
  })

  it('should set selectedbooking', async () => {
    const { result } = renderHook(() => useBookingStore())

    await act(async () => {
      result.current.setSelectedBooking(mockBookings[0])
    })

    expect(result.current.selectedBooking).toEqual(mockBookings[0])
  })

  it('should set selectedbooking to null', async () => {
    const { result } = renderHook(() => useBookingStore())

    await act(async () => {
      result.current.setSelectedBooking(null)
    })

    expect(result.current.selectedBooking).toBeNull()
  })

  it('should clear selectedbooking to null', async () => {
    const { result } = renderHook(() => useBookingStore())

    await act(async () => {
      result.current.setSelectedBooking(mockBookings[0])
      result.current.clearBooking()
    })

    expect(result.current.selectedBooking).toBeNull()
  })
})
