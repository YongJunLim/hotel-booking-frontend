import { SustainabilityTips } from '../../../src/components/ui/SustainabilityTips'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'

vi.mock('../../../src/data/sustainabilityTips.json', () => ({
  default: [
    {
      category: 'Transportation',
      tip: 'Choose eco-friendly transport options like trains or electric vehicles.',
    },
    {
      category: 'Accommodation',
      tip: 'Stay in hotels with green certifications and sustainable practices.',
    },
    {
      category: 'Activities',
      tip: 'Participate in local conservation efforts and eco-tours.',
    },
    {
      category: 'Food',
      tip: 'Eat at restaurants that source ingredients locally and sustainably.',
    },
  ],
}))

describe('SustainabilityTips Component Unit Test', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  describe('Initial Rendering', () => {
    it('renders the initial tip correctly', () => {
      render(<SustainabilityTips />)

      // Check header
      expect(screen.getByText('💡 Sustainability Tip 1/4')).toBeInTheDocument()

      // Check first tip content
      expect(screen.getByText('Transportation')).toBeInTheDocument()
      expect(screen.getByText('Choose eco-friendly transport options like trains or electric vehicles.')).toBeInTheDocument()
    })

    it('displays the correct number of progress indicators', () => {
      render(<SustainabilityTips />)

      const progressIndicators = screen.getAllByRole('generic').filter(el =>
        el.className.includes('h-1') && el.className.includes('rounded-full'),
      )

      expect(progressIndicators).toHaveLength(4)
    })

    it('highlights the correct progress indicator for current tip', () => {
      render(<SustainabilityTips />)

      const progressIndicators = screen.getAllByRole('generic').filter(el =>
        el.className.includes('h-1') && el.className.includes('rounded-full'),
      )

      // First indicator should be active (green)
      expect(progressIndicators[0]).toHaveClass('bg-green-500')
      // Others should be inactive (light green)
      expect(progressIndicators[1]).toHaveClass('bg-green-200')
      expect(progressIndicators[2]).toHaveClass('bg-green-200')
      expect(progressIndicators[3]).toHaveClass('bg-green-200')
    })
  })

  describe('Timer Functionality', () => {
    it('advances to next tip after 10 seconds', () => {
      render(<SustainabilityTips />)

      // Initially shows first tip
      expect(screen.getByText('💡 Sustainability Tip 1/4')).toBeInTheDocument()
      expect(screen.getByText('Transportation')).toBeInTheDocument()

      // Fast-forward time: 10 seconds (timer) + 300ms (fade out) + time for state update
      act(() => {
        vi.advanceTimersByTime(10000) // Timer interval
      })

      act(() => {
        vi.advanceTimersByTime(600) // Fade out duration
      })

      act(() => {
        vi.advanceTimersByTime(100) // State update time
      })

      // Should now show second tip
      expect(screen.getByText('💡 Sustainability Tip 2/4')).toBeInTheDocument()
      expect(screen.getByText('Accommodation')).toBeInTheDocument()
      expect(screen.getByText('Stay in hotels with green certifications and sustainable practices.')).toBeInTheDocument()
    })

    it('cycles through all tips and returns to first', () => {
      render(<SustainabilityTips />)

      // Start at tip 1
      expect(screen.getByText('💡 Sustainability Tip 1/4')).toBeInTheDocument()

      // Advance through all tips
      for (let i = 0; i < 4; i++) {
        act(() => {
          vi.advanceTimersByTime(10000) // Timer
          vi.advanceTimersByTime(600) // Fade
          vi.advanceTimersByTime(100) // State update
        })

        const expectedTipNumber = ((i + 1) % 4) + 1
        expect(screen.getByText(`💡 Sustainability Tip ${expectedTipNumber}/4`)).toBeInTheDocument()
      }

      // Should be back to tip 1
      expect(screen.getByText('💡 Sustainability Tip 1/4')).toBeInTheDocument()
      expect(screen.getByText('Transportation')).toBeInTheDocument()
    })

    it('cleans up interval on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

      const { unmount } = render(<SustainabilityTips />)

      unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()

      clearIntervalSpy.mockRestore()
    })
  })

  describe('Animation and Transitions', () => {
    it('has fade transition during tip change', () => {
      render(<SustainabilityTips />)

      const contentDiv = screen.getByText('Transportation').parentElement

      // Initially visible
      expect(contentDiv).toHaveClass('opacity-100')

      // Trigger the timer
      act(() => {
        vi.advanceTimersByTime(10000)
      })

      // During fade out
      act(() => {
        vi.advanceTimersByTime(300) // Half fade duration
      })

      expect(contentDiv).toHaveClass('opacity-0')

      // Complete fade and state update
      act(() => {
        vi.advanceTimersByTime(300) // Complete fade + state update
      })

      // Should be visible again with new content
      expect(contentDiv).toHaveClass('opacity-100')
    })

    it('updates progress indicator when tip changes', () => {
      render(<SustainabilityTips />)

      // Get initial progress indicators
      let progressIndicators = screen.getAllByRole('generic').filter(el =>
        el.className.includes('h-1') && el.className.includes('rounded-full'),
      )

      // Initially first indicator is active
      expect(progressIndicators[0]).toHaveClass('bg-green-500')
      expect(progressIndicators[1]).toHaveClass('bg-green-200')

      // Advance to next tip
      act(() => {
        vi.advanceTimersByTime(10000) // Timer
        vi.advanceTimersByTime(600) // Fade
        vi.advanceTimersByTime(100) // State update
      })

      // Re-query progress indicators after state change
      progressIndicators = screen.getAllByRole('generic').filter(el =>
        el.className.includes('h-1') && el.className.includes('rounded-full'),
      )

      expect(progressIndicators[0]).toHaveClass('bg-green-200')
      expect(progressIndicators[1]).toHaveClass('bg-green-500')
    })
  })

  describe('Content Display', () => {
    it('displays all tip categories correctly', () => {
      render(<SustainabilityTips />)

      const expectedCategories = ['Transportation', 'Accommodation', 'Activities', 'Food']

      for (let i = 0; i < expectedCategories.length; i++) {
        if (i > 0) {
          // Complete the full transition cycle
          act(() => {
            vi.advanceTimersByTime(10000) // Timer triggers
          })

          act(() => {
            vi.advanceTimersByTime(600) // Fade out completes
          })

          act(() => {
            vi.advanceTimersByTime(100) // State update happens
          })

          act(() => {
            vi.advanceTimersByTime(100) // Fade in completes
          })
        }

        // Test category content

        expect(screen.getByText(expectedCategories[i])).toBeInTheDocument()

        // Test heading contains the current tip number
        const heading = screen.getByRole('heading', { level: 3 })
        expect(heading.textContent).toContain((i + 1).toString())
        expect(heading.textContent).toContain('💡 Sustainability Tip')
        expect(heading.textContent).toContain('/4')
      }
    })
  })

  describe('Styling and Layout', () => {
    it('has correct styling classes', () => {
      render(<SustainabilityTips />)

      // Main container - find by heading first
      const heading = screen.getByRole('heading', { level: 3 })
      const container = heading.closest('div')
      expect(container).toHaveClass('p-4', 'bg-green-50', 'rounded-lg')

      // Header
      expect(heading).toHaveClass('text-lg', 'font-semibold', 'text-green-800', 'mb-2')

      // Category text
      const category = screen.getByText('Transportation')
      expect(category).toHaveClass('text-green-700', 'font-medium')

      // Tip text
      const tip = screen.getByText('Choose eco-friendly transport options like trains or electric vehicles.')
      expect(tip).toHaveClass('text-sm', 'text-green-600', 'mt-1')
    })

    it('has proper accessibility structure', () => {
      render(<SustainabilityTips />)

      // Should have heading structure
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toBeInTheDocument()
      expect(heading.textContent).toContain('💡 Sustainability Tip')

      // Progress indicators should be properly structured
      const progressContainer = heading
        .closest('div')
        ?.querySelector('.flex.gap-1.mt-3')

      expect(progressContainer).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles component state correctly', () => {
      render(<SustainabilityTips />)

      // Test basic functionality works
      expect(screen.getByText('💡 Sustainability Tip 1/4')).toBeInTheDocument()
      expect(screen.getByText('Transportation')).toBeInTheDocument()
    })

    it('handles rapid timer advances without errors', () => {
      render(<SustainabilityTips />)

      // Rapidly advance through multiple cycles
      expect(() => {
        for (let i = 0; i < 10; i++) {
          act(() => {
            vi.advanceTimersByTime(10000)
            vi.advanceTimersByTime(300)
            vi.advanceTimersByTime(100)
          })
        }
      }).not.toThrow()
    })

    it('maintains state consistency during transitions', () => {
      render(<SustainabilityTips />)

      // Advance to second tip
      act(() => {
        vi.advanceTimersByTime(10000)
        vi.advanceTimersByTime(300)
        vi.advanceTimersByTime(100)
      })

      // Should still have 4 progress indicators
      const progressIndicators = screen.getAllByRole('generic').filter(el =>
        el.className.includes('h-1') && el.className.includes('rounded-full'),
      )
      expect(progressIndicators).toHaveLength(4)
    })
  })
})
