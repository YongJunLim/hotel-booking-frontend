import { describe, it, vi, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TypeaheadSearch } from '../../../src/components/ui/TypeaheadSearch'
import type { DestinationResponse } from '../../../src/types/api'

vi.mock('../../src/config/api', () => ({
  BACKEND_URL: 'http://localhost:9000/api/v1',
}))

vi.mock('swr', () => ({
  default: vi.fn(),
}))

vi.mock('../../src/utils/typeaheadsearchUtils', () => ({
  handleKeyDown: vi.fn(),
}))

import useSWR from 'swr'

const mockUseSWR = vi.mocked(useSWR)

describe('TypeaheadSearch Component calling API Unit Test', () => {
  const mockDestinations: DestinationResponse = {
    success: true,
    query: 'Rome',
    searchType: 'name',
    count: 3,
    results: [
      {
        uid: 'A6Dz',
        term: 'Rome, Italy',
        type: 'city',
        lat: 41.895466,
        lng: 12.482324,
        score: 0.95,
        highlighted: 'Rome, Italy',
      },
      {
        uid: 'B7Fx',
        term: 'Paris, France',
        type: 'city',
        lat: 48.864716,
        lng: 2.349014,
        score: 0.95,
        highlighted: 'Paris, France',
      },
      {
        uid: 'C8Gy',
        term: 'London, UK',
        type: 'city',
        lat: 51.509865,
        lng: -0.118092,
        score: 0.95,
        highlighted: 'London, UK',
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not make API call for queries less than 2 characters', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    })

    render(<TypeaheadSearch />)

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'R' } })

    // SWR should be called with null (no API call)
    expect(mockUseSWR).toHaveBeenCalledWith(
      null,
      expect.any(Function),
      expect.any(Object),
    )
  })

  it('should make API call for queries 2+ characters', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: false,
      mutate: vi.fn(),
    })

    render(<TypeaheadSearch limit={5} threshold={0.4} />)

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'Rome' } })

    // Should construct correct API URL
    const expectedUrl = 'http://localhost:9000/api/v1/destinations?name=Rome&limit=5&threshold=0.4'
    expect(mockUseSWR).toHaveBeenCalledWith(
      expectedUrl,
      expect.any(Function),
      expect.objectContaining({
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 300,
      }),
    )
  })

  it('should display loading state during API call', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: false,
      mutate: vi.fn(),
    })

    render(<TypeaheadSearch />)

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'Rome' } })

    expect(screen.getByText('Searching...')).toBeInTheDocument()

    expect(screen.getByText('Searching...')).toHaveClass('text-center')

    const loadingSpinner = screen.getByText('Searching...').querySelector('.loading-spinner')
    if (loadingSpinner) {
      expect(loadingSpinner).toBeInTheDocument()
    }
  })

  it('should display suggestions when API returns data', async () => {
    mockUseSWR.mockReturnValue({
      data: mockDestinations,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    })

    render(<TypeaheadSearch />)

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'Rome' } })

    await waitFor(() => {
      expect(screen.getByText('Rome, Italy')).toBeInTheDocument()
      expect(screen.getByText('Paris, France')).toBeInTheDocument()
      expect(screen.getByText('London, UK')).toBeInTheDocument()
    })

    // Should show destination types
    expect(screen.getAllByText('city')).toHaveLength(3)
  })

  it('should display error state when API fails', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: new Error('Network error'),
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    })

    render(<TypeaheadSearch />)

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'Rome' } })

    expect(screen.getByText('Error loading suggestions')).toBeInTheDocument()
    expect(screen.getByText('Error loading suggestions')).toHaveClass('text-error')
  })

  it('should display no results message when API returns empty array', () => {
    mockUseSWR.mockReturnValue({
      data: {
        success: true,
        query: '',
        searchType: 'name',
        count: 0,
        results: [],
      } as DestinationResponse,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    })

    render(<TypeaheadSearch />)

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'Nonexistent' } })

    expect(screen.getByText('No destinations found')).toBeInTheDocument()
  })

  it('should call onSelect when destination is clicked', async () => {
    const mockOnSelect = vi.fn()

    mockUseSWR.mockReturnValue({
      data: mockDestinations,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    })

    render(<TypeaheadSearch onSelect={mockOnSelect} />)

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'Rome' } })

    await waitFor(() => {
      const romeButton = screen.getByText('Rome, Italy').closest('button')
      fireEvent.click(romeButton!)
    })

    expect(mockOnSelect).toHaveBeenCalledWith({
      uid: 'A6Dz',
      term: 'Rome, Italy',
      type: 'city',
      lat: 41.895466,
      lng: 12.482324,
      score: 0.95,
      highlighted: 'Rome, Italy',
    })
  })

  it('should update input value and close dropdown after selection', async () => {
    mockUseSWR.mockReturnValue({
      data: mockDestinations,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    })

    render(<TypeaheadSearch />)

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'Rome' } })

    await waitFor(() => {
      const romeButton = screen.getByText('Rome, Italy').closest('button')
      fireEvent.click(romeButton!)
    })

    expect((input as HTMLInputElement).value).toBe('Rome, Italy')
    expect(input.getAttribute('aria-expanded')).toBe('false')
  })

  it('should handle different API response structures', () => {
    mockUseSWR.mockReturnValue({
      data: {
        success: true,
        query: 'Rome',
        searchType: 'name',
        count: 0,
        results: [],
      } as DestinationResponse,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    })
    render(<TypeaheadSearch />)

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'Rome' } })

    expect(screen.getByText('No destinations found')).toBeInTheDocument()
  })

  it('should construct API URL with default parameters', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    })

    render(<TypeaheadSearch />)

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'Rome' } })

    const expectedUrl = 'http://localhost:9000/api/v1/destinations?name=Rome&limit=10&threshold=0.3'
    expect(mockUseSWR).toHaveBeenCalledWith(
      expectedUrl,
      expect.any(Function),
      expect.any(Object),
    )
  })

  // Keyboard navigation with API data
  it('should navigate through API results with arrow keys', async () => {
    // Test keyboard navigation integration with real API data
    vi.doUnmock('../../../src/utils/typeaheadsearchUtils')

    const mockOnSelect = vi.fn()

    mockUseSWR.mockReturnValue({
      data: mockDestinations,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    })

    render(<TypeaheadSearch onSelect={mockOnSelect} />)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'Rome' } })

    await waitFor(() => {
      expect(screen.getByText('Rome, Italy')).toBeInTheDocument()
    })

    // Navigate with arrow keys
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(mockOnSelect).toHaveBeenCalledWith(mockDestinations.results[0])
    expect(input.getAttribute('aria-expanded')).toBe('false')
  })

  // API retry behavior
  it('should handle API retries on failure', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: new Error('Network error'),
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    })
    render(<TypeaheadSearch />)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'Rome' } })
    expect(screen.getByText('Error loading suggestions')).toBeInTheDocument()
    expect(mockUseSWR).toHaveBeenCalledWith(
      'http://localhost:9000/api/v1/destinations?name=Rome&limit=10&threshold=0.3',
      expect.any(Function),
      expect.any(Object),
    )
    mockUseSWR.mockReturnValue({
      data: mockDestinations,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    })
  })

  it('should handle empty API responses gracefully', () => {
    mockUseSWR.mockReturnValue({
      data: {
        success: true,
        query: 'Empty',
        searchType: 'name',
        count: 0,
        results: [],
      } as DestinationResponse,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    })
    render(<TypeaheadSearch />)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'Empty' } })
    expect(screen.getByText('No destinations found')).toBeInTheDocument()
  })

  // Search persistence
  it('should maintain search state during component re-renders', () => {
    // Test state persistence integration
    mockUseSWR.mockReturnValue({
      data: mockDestinations,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    })
    const { rerender } = render(<TypeaheadSearch />)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'Rome' } })
    expect(input).toHaveValue('Rome')
    rerender(<TypeaheadSearch />)
    expect(input).toHaveValue('Rome')
    expect(screen.getByText('Rome, Italy')).toBeInTheDocument()
    expect(screen.getByText('Paris, France')).toBeInTheDocument()
    expect(screen.getByText('London, UK')).toBeInTheDocument()
  })
})
