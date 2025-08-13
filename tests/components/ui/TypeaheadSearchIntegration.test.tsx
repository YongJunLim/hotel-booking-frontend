import { describe, it, vi, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { TypeaheadSearch } from '../../../src/components/ui/TypeaheadSearch'
import type { DestinationResponse } from '../../../src/types/api'

// MSW server setup
const server = setupServer()

beforeAll(() => server.listen())

afterEach(() => {
  server.resetHandlers()
  cleanup()
  vi.clearAllMocks()
})

afterAll(() => server.close())

describe('TypeaheadSearch Component calling Destination Service Integration Test (searchDestinations())', () => {
  it('should handle real end-to-end search flow', async () => {
    const uniqueTerm = `Rome${Date.now()}`

    server.use(
      http.get('http://localhost:9000/api/v1/destinations', ({ request }) => {
        const url = new URL(request.url)
        const name = url.searchParams.get('name')

        if (name === uniqueTerm) {
          const response: DestinationResponse = {
            success: true,
            query: uniqueTerm,
            searchType: 'name',
            count: 2,
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
                score: 0.85,
                highlighted: 'Paris, France',
              },
            ],
          }
          return HttpResponse.json(response)
        }

        return HttpResponse.json({
          success: true,
          query: name || '',
          searchType: 'name',
          count: 0,
          results: [],
        })
      }),
    )

    const mockOnSelect = vi.fn()
    render(<TypeaheadSearch onSelect={mockOnSelect} />)

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: uniqueTerm } })

    await waitFor(() => {
      expect(screen.getByText('Rome, Italy')).toBeInTheDocument()
      expect(screen.getByText('Paris, France')).toBeInTheDocument()
    }, { timeout: 5000 })

    const romeButton = screen.getByText('Rome, Italy').closest('button')
    fireEvent.click(romeButton!)

    expect(mockOnSelect).toHaveBeenCalledWith({
      uid: 'A6Dz',
      term: 'Rome, Italy',
      type: 'city',
      lat: 41.895466,
      lng: 12.482324,
      score: 0.95,
      highlighted: 'Rome, Italy',
    })

    expect((input as HTMLInputElement).value).toBe('Rome, Italy')
  })

  it('should handle network errors gracefully', async () => {
    const errorTerm = `Error${Date.now()}`

    server.use(
      http.get('http://localhost:9000/api/v1/destinations', () => {
        return HttpResponse.error()
      }),
    )

    render(<TypeaheadSearch />)

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: errorTerm } })

    await waitFor(() => {
      expect(screen.getByText('Error loading suggestions')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('should handle slow API responses', async () => {
    const slowTerm = `Slow${Date.now()}`

    server.use(
      http.get('http://localhost:9000/api/v1/destinations', async () => {
        await new Promise(resolve => setTimeout(resolve, 500))
        return HttpResponse.json({
          success: true,
          query: slowTerm,
          searchType: 'name',
          count: 1,
          results: [
            {
              uid: 'SLOW123',
              term: `${slowTerm} City`,
              type: 'city',
              lat: 41.895466,
              lng: 12.482324,
              score: 0.95,
              highlighted: `${slowTerm} City`,
            },
          ],
        })
      }),
    )

    render(<TypeaheadSearch />)

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: slowTerm } })

    await waitFor(() => {
      expect(screen.getByText(`${slowTerm} City`)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should test that requests are actually being made', async () => {
    let requestCount = 0
    const uniqueTerm = `Test${Date.now()}`

    server.use(
      http.get('http://localhost:9000/api/v1/destinations', () => {
        requestCount++
        return HttpResponse.json({
          success: true,
          query: uniqueTerm,
          searchType: 'name',
          count: 1,
          results: [
            {
              uid: 'TEST123',
              term: `${uniqueTerm} City`,
              type: 'city',
              lat: 41.895466,
              lng: 12.482324,
              score: 0.95,
              highlighted: `${uniqueTerm} City`,
            },
          ],
        })
      }),
    )

    render(<TypeaheadSearch />)

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: uniqueTerm } })

    await waitFor(() => {
      expect(screen.getByText(`${uniqueTerm} City`)).toBeInTheDocument()
    }, { timeout: 5000 })

    expect(requestCount).toBeGreaterThan(0)
  })

  it('should test SWR caching behavior with different terms', async () => {
    let requestCount = 0
    const timestamp = Date.now()

    server.use(
      http.get('http://localhost:9000/api/v1/destinations', ({ request }) => {
        requestCount++
        const url = new URL(request.url)
        const name = url.searchParams.get('name')

        return HttpResponse.json({
          success: true,
          query: name || '',
          searchType: 'name',
          count: 1,
          results: [
            {
              uid: `CACHE${requestCount}`,
              term: `${name} Result`,
              type: 'city',
              lat: 41.895466,
              lng: 12.482324,
              score: 0.95,
              highlighted: `${name} Result`,
            },
          ],
        })
      }),
    )

    render(<TypeaheadSearch />)

    const input = screen.getByRole('combobox')

    const firstTerm = `Cache${timestamp}A`
    fireEvent.change(input, { target: { value: firstTerm } })

    await waitFor(() => {
      expect(screen.getByText(`${firstTerm} Result`)).toBeInTheDocument()
    }, { timeout: 5000 })

    fireEvent.change(input, { target: { value: '' } })
    await waitFor(() => {
      expect(screen.queryByText(`${firstTerm} Result`)).not.toBeInTheDocument()
    })

    const secondTerm = `Cache${timestamp}B`
    fireEvent.change(input, { target: { value: secondTerm } })

    await waitFor(() => {
      expect(screen.getByText(`${secondTerm} Result`)).toBeInTheDocument()
    }, { timeout: 5000 })

    expect(requestCount).toBeGreaterThanOrEqual(2)
  })

  it('should make HTTP request when typing', async () => {
    let requestMade = false
    const uniqueTerm = `HTTP${Date.now()}`

    server.use(
      http.get('http://localhost:9000/api/v1/destinations', () => {
        requestMade = true
        return HttpResponse.json({
          success: true,
          query: uniqueTerm,
          searchType: 'name',
          count: 1,
          results: [
            {
              uid: 'HTTP123',
              term: `${uniqueTerm} City`,
              type: 'city',
              lat: 0,
              lng: 0,
              score: 1,
              highlighted: `${uniqueTerm} City`,
            },
          ],
        })
      }),
    )

    render(<TypeaheadSearch />)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: uniqueTerm } })

    await waitFor(() => {
      expect(screen.getByText(`${uniqueTerm} City`)).toBeInTheDocument()
    }, { timeout: 5000 })

    expect(requestMade).toBe(true)
  })

  it('should capture fetch calls', async () => {
    const originalFetch = global.fetch
    const fetchCalls: string[] = []
    const uniqueTerm = `Fetch${Date.now()}`

    const mockFetch = vi.fn().mockImplementation(async (url: string, ...args: [RequestInit?]) => {
      fetchCalls.push(url)
      return originalFetch(url, ...args)
    })

    global.fetch = mockFetch

    server.use(
      http.get('http://localhost:9000/api/v1/destinations', () => {
        return HttpResponse.json({
          success: true,
          query: uniqueTerm,
          searchType: 'name',
          count: 1,
          results: [
            {
              uid: 'FETCH123',
              term: `${uniqueTerm} City`,
              type: 'city',
              lat: 41.895466,
              lng: 12.482324,
              score: 0.95,
              highlighted: `${uniqueTerm} City`,
            },
          ],
        })
      }),
    )

    render(<TypeaheadSearch />)
    const input = screen.getByRole('combobox')

    fireEvent.change(input, { target: { value: uniqueTerm } })

    await waitFor(() => {
      expect(screen.getByText(`${uniqueTerm} City`)).toBeInTheDocument()
    }, { timeout: 5000 })

    global.fetch = originalFetch

    expect(fetchCalls.length).toBeGreaterThan(0)
  })

  it('should handle no results scenario', async () => {
    const noResultsTerm = `NoResults${Date.now()}`

    server.use(
      http.get('http://localhost:9000/api/v1/destinations', () => {
        return HttpResponse.json({
          success: true,
          query: noResultsTerm,
          searchType: 'name',
          count: 0,
          results: [],
        })
      }),
    )

    render(<TypeaheadSearch />)
    const input = screen.getByRole('combobox')

    fireEvent.change(input, { target: { value: noResultsTerm } })

    await waitFor(() => {
      expect(screen.getByText('No destinations found')).toBeInTheDocument()
    }, { timeout: 5000 })
  })
})
