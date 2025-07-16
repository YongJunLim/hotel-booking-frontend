// https://www.learnui.design/blog/4-rules-intuitive-ux.html#2-abd-anything-but-dropdowns
import { useState, useEffect, useRef } from 'react'
import useSWR from 'swr'
import type { Destination } from '../../types/destination'
import type { DestinationResponse } from '../../types/api'
import { BACKEND_URL } from '../../config/api'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface TypeaheadSearchProps {
  onSelect?: (destination: Destination) => void
  placeholder?: string
  className?: string
  limit?: number
  threshold?: number
}

export const TypeaheadSearch = ({
  onSelect,
  placeholder = 'Search destinations...',
  className = '',
  limit = 10,
  threshold = 0.3,
}: TypeaheadSearchProps) => {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  // Build API URL with limit and threshold parameters
  const apiUrl
    = query.length >= 2
      ? (() => {
        const params = new URLSearchParams({
          name: query,
          limit: limit.toString(),
          threshold: threshold.toString(),
        })
        return `${BACKEND_URL}destinations?${params.toString()}`
      })()
      : null
  const { data, error, isLoading } = useSWR<DestinationResponse, Error>(
    apiUrl,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300, // Dedupe requests within 300ms
    },
  )
  const suggestions = data?.results || []
  useEffect(() => {
    if (query.length >= 2) {
      setIsOpen(true)
    }
    else {
      setIsOpen(false)
    }
  }, [query, data])
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }
  const handleSelect = (destination: Destination) => {
    setQuery(destination.term)
    setIsOpen(false)
    onSelect?.(destination)
  }
  return (
    <div className={`dropdown relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="input w-full"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      />

      {isOpen && query.length >= 2 && (
        <ul
          ref={listRef}
          className="menu dropdown-content bg-base-100 rounded-box z-1 w-full p-2 shadow-md"
        >
          {isLoading && (
            <li>
              <span className="text-center">
                <span className="loading loading-spinner loading-sm mr-2"></span>
                Searching...
              </span>
            </li>
          )}

          {error && (
            <li>
              <span className="text-error">Error loading suggestions</span>
            </li>
          )}

          {!isLoading && !error && suggestions.length === 0 && (
            <li>
              <span className="text-base-content/70">
                No destinations found
              </span>
            </li>
          )}

          {!isLoading
            && !error
            && suggestions.map((destination, index) => (
              <li key={`${destination.uid}-${index}`}>
                <button onClick={() => handleSelect(destination)}>
                  <div className="flex-1 min-w-0 max-w-full">
                    <p className="truncate">{destination.term}</p>
                    <p className="text-sm opacity-70 capitalize">
                      {destination.type}
                    </p>
                  </div>
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}
