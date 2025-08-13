import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, vi, expect, beforeEach } from 'vitest'
import App from '../../../src/components/ui/DayPicker'
import DayPickerComponent from '../../../src/components/ui/DayPicker'
import { useFormStore } from '../../../src/stores/HotelSearchStore'
import { DateRange } from 'react-day-picker'

vi.mock('../../../src/stores/HotelSearchStore', () => {
  return {
    useFormStore: vi.fn(),
  }
})

const mockUseFormStore = vi.mocked(useFormStore)

interface MockStoreState {
  Adult: number
  setAdult: ReturnType<typeof vi.fn>
  Children: number
  setChildren: ReturnType<typeof vi.fn>
  Room: number
  setRoom: ReturnType<typeof vi.fn>
  range: {
    from: Date | undefined
    to: Date | undefined
  }
  setRange: ReturnType<typeof vi.fn>
}

describe('DayPicker Component UI Test', () => {
  let mockStoreState: MockStoreState

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock store state
    mockStoreState = {
      Adult: 1,
      setAdult: vi.fn(),
      Children: 0,
      setChildren: vi.fn(),
      Room: 1,
      setRoom: vi.fn(),
      range: {
        from: undefined,
        to: undefined,
      },
      setRange: vi.fn(),
    }

    // Set up the mock implementation
    mockUseFormStore.mockImplementation(selector => selector(mockStoreState))
  })

  it('should render without crashing', () => {
    const { container } = render(<App />)
    expect(container).toBeInTheDocument()
  })

  it('should display the correct initial date range', () => {
    render(<DayPickerComponent />)
    expect(screen.getByText('Start Date')).toBeInTheDocument()
    expect(screen.getByText('End Date')).toBeInTheDocument()
  })

  it('calendar should pop up when the start date button is clicked', () => {
    render(<DayPickerComponent />)
    const startButton = screen.getByTestId('start-date-button')
    fireEvent.click(startButton)
    expect(screen.getByRole('calendar')).toBeVisible()
  })

  it('calendar should pop up when the end date button is clicked', () => {
    render(<App />)
    const endButton = screen.getByTestId('end-date-button')
    fireEvent.click(endButton)
    expect(screen.getByRole('calendar')).toBeVisible()
  })

  it('should update the date range when a start date and an end date is selected', () => {
    const mockStateWithDates: MockStoreState = {
      ...mockStoreState,
      range: {
        from: new Date(2025, 6, 31), // July 31, 2025
        to: new Date(2025, 7, 1), // August 1, 2025
      },
    }
    mockUseFormStore.mockImplementation(selector => selector(mockStateWithDates))
    render(<DayPickerComponent />)
    const startButton = screen.getByTestId('start-date-button')
    fireEvent.click(startButton)
    const endButton = screen.getByTestId('end-date-button')
    fireEvent.click(endButton)
    expect(startButton).toHaveTextContent('31/07/2025')
    expect(endButton).toHaveTextContent('01/08/2025')
  })

  it('should select a start date and end date which are the same when clicking on a calendar date once', async () => {
    render(<DayPickerComponent />)
    const startButton = screen.getByTestId('start-date-button')
    fireEvent.click(startButton)

    await waitFor(() => {
      expect(screen.getByRole('calendar')).toBeInTheDocument()
    })

    const dayButtons = screen.getAllByRole('button').filter(btn =>
      /^\d+$/.test(btn.textContent || ''),
    )
    const startDateButton = dayButtons.find(btn => parseInt(btn.textContent || '0') === 15) || dayButtons[10]

    expect(startDateButton).toBeInTheDocument()
    fireEvent.click(startDateButton)

    await waitFor(() => {
      expect(mockStoreState.setRange).toHaveBeenCalledTimes(1)
    }, { timeout: 3000 })

    const firstCall = mockStoreState.setRange.mock.calls[0][0] as DateRange
    expect(firstCall.from).toBeInstanceOf(Date)
    expect(firstCall.to).toBeInstanceOf(Date)

    if (firstCall.from && firstCall.to) {
      const firstFromDate = firstCall.from.getDate()
      const firstToDate = firstCall.to.getDate()

      expect(firstFromDate).toBe(15)
      expect(firstToDate).toBe(15)

      expect(firstCall.from.getTime()).toBe(firstCall.to.getTime())
    }
  })

  it('should update to while keeping from constant if second date is later than first date', async () => {
    const { rerender } = render(<DayPickerComponent />)

    const startButton = screen.getByTestId('start-date-button')
    fireEvent.click(startButton)

    await waitFor(() => {
      expect(screen.getByRole('calendar')).toBeInTheDocument()
    })

    const dayButtons = screen.getAllByRole('button').filter(btn =>
      /^\d+$/.test(btn.textContent || ''),
    )
    const startDateButton = dayButtons.find(btn => parseInt(btn.textContent || '0') === 15) || dayButtons[10]

    expect(startDateButton).toBeInTheDocument()
    fireEvent.click(startDateButton)

    await waitFor(() => {
      expect(mockStoreState.setRange).toHaveBeenCalledTimes(1)
    }, { timeout: 3000 })

    const firstCall = mockStoreState.setRange.mock.calls[0][0] as DateRange
    expect(firstCall.from).toBeInstanceOf(Date)
    expect(firstCall.to).toBeInstanceOf(Date)

    if (firstCall.from && firstCall.to) {
      const firstFromDate = firstCall.from.getDate()
      const firstToDate = firstCall.to.getDate()

      expect(firstFromDate).toBe(15)
      expect(firstToDate).toBe(15)

      expect(firstCall.from.getTime()).toBe(firstCall.to.getTime())
    }

    mockStoreState.range = {
      from: firstCall.from,
      to: firstCall.to,
    }
    mockUseFormStore.mockImplementation(selector => selector(mockStoreState))

    rerender(<DayPickerComponent />)

    fireEvent.click(startButton)

    await waitFor(() => {
      expect(screen.getByRole('calendar')).toBeInTheDocument()
    })

    const endDateButton = dayButtons.find(btn => parseInt(btn.textContent || '0') === 25) || dayButtons[10]

    fireEvent.click(endDateButton)

    await waitFor(() => {
      expect(mockStoreState.setRange).toHaveBeenCalledTimes(2)
    }, { timeout: 3000 })

    const secondCall = mockStoreState.setRange.mock.calls[1][0] as DateRange
    expect(secondCall.from).toBeInstanceOf(Date)
    expect(secondCall.to).toBeInstanceOf(Date)
    if (secondCall.from && secondCall.to) {
      const secondFromDate = secondCall.from.getDate()
      const secondToDate = secondCall.to.getDate()

      expect(secondFromDate).toBe(15)
      expect(secondToDate).toBe(25)

      expect(secondCall.from.getTime()).toBeLessThan(secondCall.to.getTime())
    }
  })

  it('should update from while keeping to constant if second date is earlier than first date', async () => {
    const { rerender } = render(<DayPickerComponent />)

    const startButton = screen.getByTestId('start-date-button')
    fireEvent.click(startButton)

    await waitFor(() => {
      expect(screen.getByRole('calendar')).toBeInTheDocument()
    })

    const dayButtons = screen.getAllByRole('button').filter(btn =>
      /^\d+$/.test(btn.textContent || ''),
    )
    const startDateButton = dayButtons.find(btn => parseInt(btn.textContent || '0') === 25) || dayButtons[10] // fallback to 11th button

    expect(startDateButton).toBeInTheDocument()
    fireEvent.click(startDateButton)

    await waitFor(() => {
      expect(mockStoreState.setRange).toHaveBeenCalledTimes(1)
    }, { timeout: 3000 })

    const firstCall = mockStoreState.setRange.mock.calls[0][0] as DateRange
    expect(firstCall.from).toBeInstanceOf(Date)
    expect(firstCall.to).toBeInstanceOf(Date)
    if (firstCall.from && firstCall.to) {
      const firstFromDate = firstCall.from.getDate()
      const firstToDate = firstCall.to.getDate()

      expect(firstFromDate).toBe(25)
      expect(firstToDate).toBe(25)

      expect(firstCall.from.getTime()).toBe(firstCall.to.getTime())
    }

    mockStoreState.range = {
      from: firstCall.from,
      to: firstCall.to,
    }
    mockUseFormStore.mockImplementation(selector => selector(mockStoreState))

    rerender(<DayPickerComponent />)

    fireEvent.click(startButton)

    await waitFor(() => {
      expect(screen.getByRole('calendar')).toBeInTheDocument()
    })

    const endDateButton = screen.getByRole('button', { name: /15/ })

    fireEvent.click(endDateButton)

    await waitFor(() => {
      expect(mockStoreState.setRange).toHaveBeenCalledTimes(2)
    }, { timeout: 3000 })

    const secondCall = mockStoreState.setRange.mock.calls[1][0] as DateRange
    expect(secondCall.from).toBeInstanceOf(Date)
    expect(secondCall.to).toBeInstanceOf(Date)

    if (secondCall.from && secondCall.to) {
      const secondFromDate = secondCall.from.getDate()
      const secondToDate = secondCall.to.getDate()

      expect(secondFromDate).toBe(15)
      expect(secondToDate).toBe(25)

      expect(secondCall.from.getTime()).toBeLessThan(secondCall.to.getTime())
    }
  })

  it('should handle selecting dates in different months for range', async () => {
    const { rerender } = render(<DayPickerComponent />)

    const startButton = screen.getByTestId('start-date-button')
    fireEvent.click(startButton)

    await waitFor(() => {
      expect(screen.getByRole('calendar')).toBeInTheDocument()
    })

    const dayButtons = screen.getAllByRole('button').filter(btn =>
      /^\d+$/.test(btn.textContent || ''),
    )
    const startDateButton = dayButtons.find(btn => parseInt(btn.textContent || '0') === 25) || dayButtons[10] // fallback to 11th button

    expect(startDateButton).toBeInTheDocument()
    fireEvent.click(startDateButton)

    await waitFor(() => {
      expect(mockStoreState.setRange).toHaveBeenCalledTimes(1)
    }, { timeout: 3000 })

    const firstCall = mockStoreState.setRange.mock.calls[0][0] as DateRange
    mockStoreState.range = {
      from: firstCall.from,
      to: firstCall.to,
    }
    mockUseFormStore.mockImplementation(selector => selector(mockStoreState))

    rerender(<DayPickerComponent />)

    fireEvent.click(startButton)

    await waitFor(() => {
      expect(screen.getByRole('calendar')).toBeInTheDocument()
    })

    const nextButton = screen.getByRole('button', { name: /next/i })

    if (nextButton) {
      fireEvent.click(nextButton)
    }

    await waitFor(() => {
      expect(screen.getByRole('calendar')).toBeInTheDocument()
    })

    const endDateButton = screen.getByRole('button', { name: /15/ })

    fireEvent.click(endDateButton)

    await waitFor(() => {
      expect(mockStoreState.setRange).toHaveBeenCalledTimes(2)
    }, { timeout: 3000 })

    const secondCall = mockStoreState.setRange.mock.calls[1][0] as DateRange
    expect(secondCall.from).toBeInstanceOf(Date)
    expect(secondCall.to).toBeInstanceOf(Date)
    if (secondCall.from && secondCall.to) {
      const fromDate = secondCall.from.getDate()
      const toDate = secondCall.to.getDate()
      const fromMonth = secondCall.from.getMonth()
      const toMonth = secondCall.to.getMonth()

      expect(fromDate).toBe(25)
      expect(toDate).toBe(15)

      expect(fromMonth).not.toBe(toMonth)

      expect(secondCall.from.getTime()).toBeLessThan(secondCall.to.getTime())
    }
  })

  it('should display selected dates in buttons after selection', () => {
    const mockStoreState = {
      Adult: 1,
      setAdult: vi.fn(),
      Children: 0,
      setChildren: vi.fn(),
      Room: 1,
      setRoom: vi.fn(),
      range: {
        from: undefined,
        to: undefined,
      },
      setRange: vi.fn(),
    }

    const mockStateWithDates = {
      ...mockStoreState,
      range: {
        from: new Date(2025, 6, 31), // July 31, 2025
        to: new Date(2025, 7, 1), // August 1, 2025
      },
    }

    mockUseFormStore.mockImplementation(selector => selector(mockStateWithDates))

    render(<DayPickerComponent />)

    const startButton = screen.getByTestId('start-date-button')
    const endButton = screen.getByTestId('end-date-button')

    expect(startButton).toHaveTextContent('31/07/2025')
    expect(endButton).toHaveTextContent('01/08/2025')
  })
})
