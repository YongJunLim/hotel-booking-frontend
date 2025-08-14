import type { Destination } from '../types/destination'
import epiData from '../data/epi2024results.json'

export const handleKeyDown = (
  e: React.KeyboardEvent<HTMLInputElement>,
  highlightedIndex: number | null,
  setHighlightedIndex: React.Dispatch<React.SetStateAction<number | null>>,
  suggestions: Destination[],
  startIndex: number,
  setStartIndex: React.Dispatch<React.SetStateAction<number>>,
  maxVisibleItems: number,
  handleSelect: (destination: Destination) => void,
) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    setHighlightedIndex((prev) => {
      const next = Math.min((prev ?? -1) + 1, suggestions.length - 1)
      if (next >= startIndex + maxVisibleItems) {
        setStartIndex(s => s + 1)
      }
      return next
    })
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault()
    setHighlightedIndex((prev) => {
      const next = Math.max((prev ?? 1) - 1, 0)
      if (next < startIndex) {
        setStartIndex(s => Math.max(s - 1, 0))
      }
      return next
    })
  }

  if (e.key === 'Enter') {
    e.preventDefault()
    if (
      highlightedIndex !== null
      && highlightedIndex >= 0
      && highlightedIndex < suggestions.length
    ) {
      const selectedItem = suggestions[highlightedIndex]
      handleSelect(selectedItem)
    }
  }
}

export const evaluateEpiData = (term: string) => {
  const lowerTerm = term.toLowerCase()
  const a = epiData.filter(item => lowerTerm.includes(item.country.toLowerCase()))
  if (a.length === 0 && lowerTerm != '') {
    return {
      message: 'There is no environmental data available for this destination.',
      level: 'none',
    }
  }
  else if (a.length === 0 && lowerTerm === '') {
    return {
      message: 'No destination selected.',
      level: 'none',
    }
  }
  else if (a[0]['EPI.new'] >= 67 && a[0]['EPI.new'] <= 100) {
    return {
      message: 'This destination is highly environmentally friendly!',
      level: 'high',
    }
  }
  else if (a[0]['EPI.new'] >= 34 && a[0]['EPI.new'] < 67) {
    return {
      message: 'This destination has moderate environmental friendliness.',
      level: 'moderate',
    }
  }
  else if (a[0]['EPI.new'] < 34 && a[0]['EPI.new'] >= 0) {
    return {
      message: 'This destination has low environmental friendliness.',
      level: 'low',
    }
  }
  else {
    return {
      message: 'This grading is impossible.',
      level: 'impossible',
    }
  }
}

export const fetcher = (url: string) => fetch(url).then(res => res.json())
