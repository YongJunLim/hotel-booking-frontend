import { describe, it, vi, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TypeaheadSearch } from '../../../src/components/ui/TypeaheadSearch'
import { act } from 'react'

describe('TypeaheadSearch Unit Test', () => {
  it('should not search for empty input', async () => {
    render(<TypeaheadSearch />)

    const input = screen.getByRole('combobox')

    act(() => {
      fireEvent.change(input, { target: { value: '' } })
    })

    await waitFor(() => {
      expect(screen.queryByText(/Searching.../i)).not.toBeInTheDocument()
    })
  })

  it('should not display when query is below 2 characters', async () => {
    render(<TypeaheadSearch />)

    const input = screen.getByRole('combobox')

    act(() => {
      fireEvent.change(input, { target: { value: 'A' } })
    })

    await waitFor(() => {
      expect(screen.queryByText(/Searching.../i)).not.toBeInTheDocument()
    })
  })

  it('shows loading state when fetching from backend', async () => {
    render(<TypeaheadSearch />)
    const input = screen.getByRole('combobox')

    act(() => {
      fireEvent.change(input, { target: { value: 'Singapore' } })
    })

    expect(screen.getByText(/Searching.../i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Singapore, Singapore')).toBeInTheDocument()
    })
  })

  it('should display results for 2+ characters input', async () => {
    render(<TypeaheadSearch />)

    const input = screen.getByRole('combobox')

    act(() => {
      fireEvent.change(input, { target: { value: 'Singapore' } })
    })

    await waitFor(() => {
      expect(screen.getByText('Singapore, Singapore')).toBeInTheDocument()
    })
  })

  it('should display autocorrected destination from backend', async () => {
    const misspelledTerm = 'Sgapore'
    const mockOnSelect = vi.fn()
    render(<TypeaheadSearch onSelect={mockOnSelect} />)

    const input = screen.getByRole('combobox')

    act(() => {
      fireEvent.change(input, { target: { value: misspelledTerm } })
    })

    await waitFor(() => {
      expect(screen.getByText('Singapore, Singapore')).toBeInTheDocument()
    }, { timeout: 5000 })

    const singaporeButton = screen.getByText('Singapore, Singapore').closest('button')

    act(() => {
      fireEvent.click(singaporeButton!)
    })

    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        term: 'Singapore, Singapore',
      }),
    )

    expect((input as HTMLInputElement).value).toBe('Singapore, Singapore')
  })

  it('selects an option and closes the dropdown', async () => {
    const mockOnSelect = vi.fn()
    render(<TypeaheadSearch onSelect={mockOnSelect} />)
    const input = screen.getByRole('combobox')

    act(() => {
      fireEvent.change(input, { target: { value: 'Singapore' } })
    })

    const option = await screen.findByText('Singapore, Singapore')

    act(() => {
      fireEvent.click(option)
    })

    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.objectContaining({ term: 'Singapore, Singapore' }),
    )

    await waitFor(() => {
      expect(screen.queryByText('Singapore, Singapore')).not.toBeInTheDocument()
    })
  })

  it('navigates and selects with keyboard using handleKeyDown', async () => {
    const mockOnSelect = vi.fn()
    render(<TypeaheadSearch onSelect={mockOnSelect} />)
    const input = screen.getByRole('combobox')
    act(() => {
      fireEvent.change(input, { target: { value: 'Singapore' } })
    })

    await screen.findByText('Singapore, Singapore')

    fireEvent.keyDown(input, { key: 'ArrowDown' })

    fireEvent.keyDown(input, { key: 'ArrowDown' })

    fireEvent.keyDown(input, { key: 'Enter' })

    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.objectContaining({ term: 'Singapore, Singapore' }),
    )
  })
})
