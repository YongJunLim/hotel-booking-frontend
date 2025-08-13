import { describe, expect, vi, beforeEach, afterEach } from 'vitest'
import useBookingStore from '../../src/stores/BookingStore'
import { renderHook, act } from '@testing-library/react'
import useAuthStore from '../../src/stores/AuthStore'
import { userService } from '../../src/utils/userService'

// Mock the dependencies
vi.mock('../../src/utils/userService')

// Type the mocked functions
const mockedUserService = vi.mocked(userService)

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

describe('BookingStore Unit tests', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Reset all mocks
    vi.clearAllMocks()

    // Reset store state
    useBookingStore.setState({
      bookings: [],
      bookingStatus: false,
      selectedBooking: null,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should initialise with default values', () => {
    const { result } = renderHook(() => useBookingStore())

    expect(result.current.bookingStatus).toBe(false)
    expect(result.current.bookings).toEqual([])
    expect(result.current.selectedBooking).toBeNull()
  })

  describe('set Selected Booking', () => {
    it('should set selected booking', () => {
      const { result } = renderHook(() => useBookingStore())

      act(() => {
        result.current.setSelectedBooking(mockBookings[0])
      })

      expect(result.current.selectedBooking).toEqual(mockBookings[0])
    })

    it('should set selected booking to null', () => {
      const { result } = renderHook(() => useBookingStore())

      // First set a booking
      act(() => {
        result.current.setSelectedBooking(mockBookings[0])
      })

      // Then set it to null
      act(() => {
        result.current.setSelectedBooking(null)
      })

      expect(result.current.selectedBooking).toBeNull()
    })

    it('should overwrite previously selected booking', () => {
      const { result } = renderHook(() => useBookingStore())

      act(() => {
        result.current.setSelectedBooking(mockBookings[0])
      })

      act(() => {
        result.current.setSelectedBooking(mockBookings[1])
      })

      expect(result.current.selectedBooking).toEqual(mockBookings[1])
    })
  })

  describe('clear selected booking', () => {
    it('should clear booking data', () => {
      const { result } = renderHook(() => useBookingStore())

      act(() => {
        useBookingStore.setState({
          bookings: mockBookings,
          bookingStatus: true,
          selectedBooking: mockBookings[0],
        })
      })

      // clear
      act(() => {
        result.current.clearBooking()
      })

      expect(result.current.bookings).toEqual([])
      expect(result.current.bookingStatus).toBe(false)
      expect(result.current.selectedBooking).toBeNull()
    })

    it('should work when store is already empty', () => {
      const { result } = renderHook(() => useBookingStore())

      act(() => {
        result.current.clearBooking()
      })

      expect(result.current.bookings).toEqual([])
      expect(result.current.bookingStatus).toBe(false)
      expect(result.current.selectedBooking).toBeNull()
    })
  })
})

describe('Store Integration Test', () => {
  vi.mock('../../src/stores/AuthStore', () => ({
    default: {
      getState: vi.fn(() => ({ accessToken: 'mock-token' })),
      setState: vi.fn(),
    },
  }))

  beforeEach(() => {
    vi.useFakeTimers()
    // Reset all mocks
    vi.clearAllMocks()
    const mockGetState = useAuthStore.getState as ReturnType<typeof vi.fn>
    mockGetState.mockReturnValue({ accessToken: mockToken })

    // Reset store state
    useBookingStore.setState({
      bookings: [],
      bookingStatus: false,
      selectedBooking: null,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should maintain state consistency when fetching then selecting booking', async () => {
    mockedUserService.getBooking.mockResolvedValueOnce({
      success: true,
      bookings: mockBookings,
      message: 'Success',
    })

    const { result } = renderHook(() => useBookingStore())

    // Fetch bookings first
    await act(async () => {
      await result.current.fetchBooking()
    })

    // Then select a booking
    act(() => {
      result.current.setSelectedBooking(mockBookings[1])
    })

    // Assert
    expect(result.current.bookings).toEqual(mockBookings)
    expect(result.current.bookingStatus).toBe(true)
    expect(result.current.selectedBooking).toEqual(mockBookings[1])
  })

  it('should handle fetch failure then successful retry', async () => {
    mockedUserService.getBooking
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        success: true,
        bookings: mockBookings,
        message: 'Success',
      })

    const { result } = renderHook(() => useBookingStore())

    // First call fails
    await act(async () => {
      await result.current.fetchBooking()
    })

    expect(result.current.bookingStatus).toBe(false)
    expect(result.current.bookings).toEqual([])

    // Second call succeeds
    await act(async () => {
      await result.current.fetchBooking()
    })

    // Assert
    expect(result.current.bookingStatus).toBe(true)
    expect(result.current.bookings).toEqual(mockBookings)
    expect(mockedUserService.getBooking).toHaveBeenCalledTimes(2)
  })

  describe('FetchBooking Integration with AuthStore', () => {
    it('should successfully fetch bookings - API module', async () => {
      // Mock the imported getBookings function
      mockedUserService.getBooking.mockResolvedValueOnce({
        success: true,
        bookings: mockBookings,
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

    it('Successful fetch bookings but with no listings', async () => {
      // Mock the imported getBookings function
      mockedUserService.getBooking.mockResolvedValueOnce({
        success: true,
        bookings: [],
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
      mockedUserService.getBooking.mockResolvedValueOnce({
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
      mockedUserService.getBooking.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useBookingStore())

      await act(async () => {
        await result.current.fetchBooking()
      })

      expect(result.current.bookings).toEqual([])
      expect(result.current.bookingStatus).toBe(false)
      expect(result.current.selectedBooking).toBeNull()
    })

    it('should handle missing access token', async () => {
      // Arrange - Mock AuthStore to return no token
      const mockGetState = useAuthStore.getState as ReturnType<typeof vi.fn>
      mockGetState.mockReturnValue({ accessToken: null })

      const { result } = renderHook(() => useBookingStore())

      // Act
      await act(async () => {
        await result.current.fetchBooking()
      })

      expect(mockedUserService.getBooking).toHaveBeenCalledWith(null)
      expect(result.current.bookingStatus).toBe(false)
      expect(result.current.bookings).toEqual([])
    })
  })
})
