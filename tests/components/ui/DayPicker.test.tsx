import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, vi, expect } from 'vitest'
import App from '../../../src/components/ui/DayPicker'
import DayPickerComponent from '../../../src/components/ui/DayPicker'
import { useFormStore } from '../../../src/stores/HotelSearchStore'

vi.mock('../../../src/stores/HotelSearchStore', () => {
  return {
    useFormStore: vi.fn(),
  }
})

const mockUseFormStore = vi.mocked(useFormStore)

describe('DayPicker Component Integration Test', () => {
  it('should render without crashing', () => {
    const { container } = render(<App />)
    expect(container).toBeInTheDocument()
  })

  it('should display the correct initial date range', () => {
    const { getByText } = render(<App />)
    expect(getByText('Start Date')).toBeInTheDocument()
    expect(getByText('End Date')).toBeInTheDocument()
  })

  it('calendar should pop up when the start date button is clicked', () => {
    render(<App />)
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
    const mockStoreState = {
      Adult: 1,
      setAdult: vi.fn(),
      Children: 0,
      setChildren: vi.fn(),
      Room: 1,
      setRoom: vi.fn(),
      range: {
        // from: new Date(
        //   "Thu Jul 31 2025 00:00:00 GMT+0800 (Singapore Standard Time)",
        // ),
        // to: new Date(
        //   "Fri Aug 1 2025 00:00:00 GMT+0800 (Singapore Standard Time)",
        // ),
        from: new Date(2025, 6, 31), // July 31, 2025 (month is 0-indexed)
        to: new Date(2025, 7, 1), // August 1, 2025
      },
      setRange: vi.fn(),
    }
    mockUseFormStore.mockImplementation(selector => selector(mockStoreState))
    render(<DayPickerComponent />)
    const startButton = screen.getByTestId('start-date-button')
    fireEvent.click(startButton)
    const endButton = screen.getByTestId('end-date-button')
    fireEvent.click(endButton)
    expect(startButton).toHaveTextContent('31/07/2025')
    expect(endButton).toHaveTextContent('01/08/2025')
  })
})
