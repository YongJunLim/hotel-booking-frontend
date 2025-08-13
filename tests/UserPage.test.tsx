import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, MockedFunction } from 'vitest'
import useAuthStore from '../src/stores/AuthStore'
import useBookingStore from '../src/stores/BookingStore'
import useToastStore from '../src/stores/ToastStore'
import { UserPage } from '../src/pages/UserPage'
import { UpdateUserRequest, userResponse } from '../src/types/user'
import { bookingResponse } from '../src/types/booking'

// Test data factories - reuse from your store tests
const createTestUser = (overrides = {}) => ({
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '12345678',
  salutation: 'Mr',
  isAdmin: false,
  password: '123456',
  ...overrides,
})
// const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OTAyNTQ0OWM0Mjg4N2JkMDlkNjllNSIsImV4cCI6MTc1NDQ4Njk0M30.SsUFhg-PsRIScNP_4WAVofRjDzq12jzOteBwbr3aJpg'

const createTestBookings = () => [
  {
    _id: '1',
    guestId: '507f191e810c19729de860ea',
    roomType: 'Deluxe Room',
    startDate: '2025-08-15',
    endDate: '2025-08-17',
    nights: 2,
    adults: 2,
    children: 0,
    status: 'confirmed',
    messageToHotel: 'Late check-in',
    createdAt: '2025-08-01T10:00:00Z',
    updatedAt: '2025-08-06T10:00:00Z',
  },
  {
    _id: '2',
    guestId: '507f191e810c19729de860ea',
    roomType: 'Standard Room',
    startDate: '2025-09-01',
    endDate: '2025-09-03',
    nights: 2,
    adults: 1,
    children: 1,
    status: 'pending',
    messageToHotel: 'Early check-in',
    createdAt: '2025-08-05T14:30:00Z',
    updatedAt: '2025-08-07T10:00:00Z',
  },
]

vi.mock('wouter', () => ({
  Link: ({
    href,
    children,
    className,
  }: {
    href: string
    children: React.ReactNode
    className?: string
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
  useLocation: vi.fn(() => ['/user', vi.fn()]),
}))

vi.mock('./DeleteAccount', () => ({
  default: ({ onClose }: { open: boolean, onClose: () => void }) => (
    <button onClick={onClose} data-testid="close-delete">
      Close Delete
    </button>
  ),
}))

vi.mock('../components/ui/Redirect', () => ({
  RedirectToast: () => <div data-testid="redirect-toast">Please log in</div>,
}))

// Mock the userService to control API responses
const mockUserService = {
  getProfile: vi.fn(),
  editProfile: vi.fn(),
  getBooking: vi.fn(),
}

vi.mock('../utils/userService', () => ({
  userService: mockUserService,
}))

describe('UserPage Integration Tests', () => {
  let mockFetchBookings: MockedFunction<() => Promise<unknown>>

  let mockgetProfile: MockedFunction<() => Promise<boolean | undefined>>
  let mockeditProfile: MockedFunction<
    (reqbody: UpdateUserRequest) => Promise<userResponse>
  >

  beforeEach(() => {
    vi.clearAllMocks()

    // Reset all stores to initial state
    useAuthStore.getState().logout()
    useBookingStore.getState().clearBooking()
    mockFetchBookings = vi.spyOn(
      useBookingStore.getState(),
      'fetchBooking',
    ) as MockedFunction<() => Promise<unknown>>
    mockeditProfile = vi.spyOn(
      useAuthStore.getState(),
      'editProfile',
    ) as MockedFunction<(reqbody: UpdateUserRequest) => Promise<userResponse>>
    mockgetProfile = vi.spyOn(
      useAuthStore.getState(),
      'getProfile',
    ) as MockedFunction<() => Promise<boolean | undefined>>

    // useToastStore.getState().setToast

    // Setup default successful responses
    mockUserService.getProfile.mockResolvedValue({
      success: true,
      data: createTestUser(),
    })

    mockUserService.getBooking.mockResolvedValue({
      success: true,
      bookings: createTestBookings(),
    })

    mockUserService.editProfile.mockResolvedValue({
      success: true,
      message: 'Profile updated successfully',
    })

    mockgetProfile.mockImplementation(async () => {
      try {
        const token = useAuthStore.getState().accessToken
        const response = (await mockUserService.getProfile(
          token,
        )) as userResponse
        if (response.success) {
          useAuthStore.setState({ userDetails: response.data })
          return true
        }
        else {
          return false
        }
      }
      catch {
        //
      }
    })

    mockeditProfile.mockImplementation(async (reqbody: UpdateUserRequest) => {
      const token = useAuthStore.getState().accessToken
      const response = (await mockUserService.editProfile(
        token,
        reqbody,
      )) as userResponse
      return response
    })

    // Setup fetchBookings mock to simulate successful booking fetch
    mockFetchBookings.mockImplementation(async () => {
      try {
        // Get token from auth store (since fetchBooking doesn't take parameters)
        const token = useAuthStore.getState().accessToken
        // Simulate calling userService.getBooking
        const response = (await mockUserService.getBooking(
          token,
        )) as bookingResponse
        if (response.success) {
          useBookingStore.setState({ bookings: response.bookings })
          return response.bookings
        }
        else {
          useBookingStore.setState({ bookings: [] })
          return []
        }
      }
      catch (error) {
        useBookingStore.setState({ bookings: [] })
        throw error
      }
    })
  })

  describe('Authentication Integration', () => {
    it('should redirect when not authenticated', () => {
      // Since stores are unit tested, we trust logout() works correctly
      useAuthStore.getState().logout()
      render(<UserPage></UserPage>)

      expect(screen.getByTestId('redirect-toast')).toBeInTheDocument()
      expect(screen.queryByText('Account Page')).not.toBeInTheDocument()
    })

    it('should display user page when authenticated', async () => {
      const testUser = createTestUser()
      const testBookings = createTestBookings()

      // Setup mocks
      mockUserService.getProfile.mockResolvedValue({
        success: true,
        data: testUser,
      })

      mockUserService.getBooking.mockResolvedValue({
        success: true,
        bookings: testBookings,
      })

      // Login user
      act(() => {
        useAuthStore.getState().login(testUser, 'valid-token')
      })

      // Render component
      render(<UserPage />)

      // Wait for component to render with user data
      await waitFor(() => {
        expect(screen.getByText('Account Page')).toBeInTheDocument()
        const usernameElement = screen.getByTestId('username')
        expect(usernameElement).toHaveTextContent(
          `${testUser.salutation} ${testUser.firstName} ${testUser.lastName}`,
        )
      })

      // Verify fetchBooking was called (no parameters)
      await waitFor(() => {
        expect(mockFetchBookings).toHaveBeenCalledWith()
      })

      // Check bookings are displayed
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()

        // Debug: Log current store state
        console.log(
          'Current bookings in store:',
          useBookingStore.getState().bookings,
        )

        // Check that both room types are present
        expect(screen.getByText('Deluxe Room')).toBeInTheDocument()
        expect(screen.getByText('Standard Room')).toBeInTheDocument()

        // Check dates are present
        expect(screen.getByText('2025-08-15')).toBeInTheDocument()
        expect(screen.getByText('2025-09-01')).toBeInTheDocument()

        // Verify we have the expected number of rows (2 bookings = 2 rows)
        const rows = screen.getAllByRole('row')
        expect(rows).toHaveLength(3) // 1 header + 2 data rows

        // Verify View buttons are present
        const viewButtons = screen.getAllByText('View')
        expect(viewButtons).toHaveLength(2)
      })
    })
  })

  describe('Profile Management Integration', () => {
    beforeEach(() => {
      const testUser = createTestUser()
      useAuthStore.getState().login(testUser, 'valid-token')
    })

    it('should display user profile data correctly', async () => {
      render(<UserPage />)
      console.log('After login:', useAuthStore.getState())
      // Wait for data to load via store integration
      await waitFor(() => {
        expect(screen.getByText('Mr John Doe')).toBeInTheDocument()
        expect(screen.getByText('test@example.com')).toBeInTheDocument()
        expect(screen.getByText('12345678')).toBeInTheDocument()
      })
    })

    it('should handle profile editing flow', async () => {
      render(<UserPage />)
      // console.log('Hanlde profile After login:', useAuthStore.getState())

      // Open edit form
      await openEditForm()

      // Fill and submit form
      await fillEditForm({
        firstName: 'Jane',
        email: 'jane@example.com',
        password: '123456',
      })

      await submitEditForm()

      // Verify API call
      expect(mockUserService.editProfile).toHaveBeenCalledWith('valid-token', {
        firstName: 'Jane',
        email: 'jane@example.com',
        password: '123456',
      })

      // Verify profile refresh

      await waitFor(() => {
        expect(mockUserService.getProfile).toHaveBeenCalledTimes(2) // Initial + refresh
      })
    })

    it('should handle profile edit failures', async () => {
      mockUserService.editProfile.mockResolvedValue({
        success: false,
        message: 'Update failed',
      })

      render(<UserPage />)

      await openEditForm()
      await fillEditForm({ password: 'password123' })
      await submitEditForm()

      const toastStore = useToastStore.getState()
      const setToastSpy = vi.spyOn(toastStore, 'setToast')

      await waitFor(() => {
        expect(setToastSpy).toHaveBeenCalledWith('Update failed', 'error')
      })
    })
  })

  describe('Booking Management Integration', () => {
    beforeEach(() => {
      const testUser = createTestUser()
      useAuthStore.getState().login(testUser, 'valid-token')
    })

    it('should display booking list correctly', async () => {
      render(<UserPage />)

      await waitFor(() => {
        expect(screen.getByText('Deluxe Room')).toBeInTheDocument()
        expect(screen.getByText('Standard Room')).toBeInTheDocument()
        expect(screen.getByText('2025-08-15')).toBeInTheDocument()
      })
    })

    it('should handle booking selection', async () => {
      render(<UserPage />)

      // Wait for bookings to load
      await waitFor(() => {
        expect(screen.getByText('Deluxe Room')).toBeInTheDocument()
      })

      // Select first booking
      const viewButtons = screen.getAllByText('View')
      await userEvent.click(viewButtons[0])

      // Verify booking store integration
      const bookingStore = useBookingStore.getState()
      expect(bookingStore.selectedBooking).toEqual(createTestBookings()[0])

      // Verify UI update
      expect(screen.getByText('Viewed Information:')).toBeInTheDocument()
      expect(screen.getByText('Late check-in')).toBeInTheDocument()
    })

    it('should handle booking fetch refresh', async () => {
      render(<UserPage />)

      const refreshButton = screen.getByText('Refresh')
      await userEvent.click(refreshButton)

      expect(mockUserService.getBooking).toHaveBeenCalledTimes(2) // Initial + refresh
    })

    it('should handle empty booking list', async () => {
      mockUserService.getBooking.mockResolvedValue({
        success: false,
        bookings: [],
      })

      render(<UserPage />)

      await waitFor(() => {
        expect(
          screen.getByText('No bookings found or failed to load bookings.'),
        ).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling Integration', () => {
    beforeEach(() => {
      const testUser = createTestUser()
      act(() => {
        useAuthStore.getState().login(testUser, 'valid-token')
      })
    })

    it('should handle profile fetch errors', async () => {
      mockUserService.getProfile.mockResolvedValue({
        success: false,
        data: null,
      })

      const testUser = createTestUser()
      act(() => {
        useAuthStore.getState().login(testUser, 'valid-token')
      })

      render(<UserPage />)

      const toastStore = useToastStore.getState()
      const setToastSpy = vi.spyOn(toastStore, 'setToast')

      await waitFor(() => {
        expect(setToastSpy).toHaveBeenCalledWith(
          'Failed to retrieve user details',
          'error',
        )
      })
    })

    it('should handle booking fetch errors', async () => {
      mockUserService.getBooking.mockRejectedValue(new Error('Network error'))

      render(<UserPage />)

      const toastStore = useToastStore.getState()
      const setToastSpy = vi.spyOn(toastStore, 'setToast')
      await waitFor(() => {
        expect(setToastSpy).toHaveBeenCalledWith(
          'Failed to fetch Booking list',
          'error',
        )
      })
    })
  })

  // Simplified test helpers that focus on UI interactions only
  // Store logic is already tested in unit tests
  async function openEditForm() {
    const dropdownButton = screen.getByRole('button', { expanded: false })
    await userEvent.click(dropdownButton)
    // const editButton = screen.getByText('Edit Profile')
    const editButton = screen.getByTestId('open-edit')
    await userEvent.click(editButton)
  }

  async function fillEditForm(data: {
    firstName?: string
    lastName?: string
    email?: string
    password: string
  }) {
    if (data.firstName) {
      const input = screen.getByPlaceholderText('John')
      await userEvent.clear(input)
      await userEvent.type(input, data.firstName)
    }
    if (data.lastName) {
      const input = screen.getByPlaceholderText('Doe')
      await userEvent.clear(input)
      await userEvent.type(input, data.lastName)
    }
    if (data.email) {
      const input = screen.getByPlaceholderText('john@example.com')
      await userEvent.clear(input)
      await userEvent.type(input, data.email)
    }
    const passwordInput = screen.getByPlaceholderText('••••••••')
    await userEvent.type(passwordInput, data.password)
  }

  async function submitEditForm() {
    // const saveButton = screen.getByText('Save Changes')
    const saveButton = screen.getByTestId('submit-edit')
    await userEvent.click(saveButton)
  }
})

// Focused Component-Level Tests (Keep these separate and minimal)
describe('UserPage Component Behavior', () => {
  // Only test component-specific logic that isn't covered by integration tests

  it('should validate password requirement in edit form', async () => {
    const testUser = {
      email: 'test@test.com',
      firstName: 'Test',
      isAdmin: false,
    }
    useAuthStore.getState().login(testUser, 'valid-token')

    render(<UserPage></UserPage>)

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByText('Account Page')).toBeInTheDocument()
    })

    // Open edit form
    const dropdownButton = screen.getByRole('button', { expanded: false })
    await userEvent.click(dropdownButton)
    // const editButton = screen.getByText('Edit Profile')
    const editButton = screen.getByTestId('open-edit')
    await userEvent.click(editButton)

    // Try to submit without password
    // const saveButton = screen.getByText('Save Changes')
    const saveButton = screen.getByTestId('submit-edit')
    await userEvent.click(saveButton)

    expect(screen.getByText('Password is required')).toBeInTheDocument()
  })

  it('should toggle UI states correctly', async () => {
    const testUser = {
      email: 'test@test.com',
      firstName: 'Test',
      isAdmin: false,
    }
    useAuthStore.getState().login(testUser, 'valid-token')

    render(<UserPage></UserPage>)

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByText('Account Page')).toBeInTheDocument()
    })

    // Test delete toast UI state
    const dropdownButton = screen.getByRole('button', { expanded: false })
    await userEvent.click(dropdownButton)

    // const deleteButton = screen.getByText('Delete Account')
    const deleteButton = screen.getByTestId('close-delete')
    await userEvent.click(deleteButton)

    expect(screen.getByTestId('delete-toast')).toBeVisible()

    // Test opacity change
    const detailDiv = screen.getByTestId('detail')
    expect(detailDiv).toHaveClass('opacity-50')
  })
})
