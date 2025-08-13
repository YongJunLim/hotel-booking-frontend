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
      act(() => {
        render(<SustainabilityTips />)
      })

      expect(screen.getByText('💡 Sustainability Tip 1/4')).toBeInTheDocument()
      expect(screen.getByText('Transportation')).toBeInTheDocument()
      expect(screen.getByText('Choose eco-friendly transport options like trains or electric vehicles.')).toBeInTheDocument()
    })

    it('displays the correct number of progress indicators', () => {
      act(() => {
        render(<SustainabilityTips />)
      })

      const progressIndicators = screen.getAllByRole('generic').filter(el =>
        el.className.includes('h-1') && el.className.includes('rounded-full'),
      )

      expect(progressIndicators).toHaveLength(4)
    })

    it('highlights the correct progress indicator for current tip', () => {
      act(() => {
        render(<SustainabilityTips />)
      })

      const progressIndicators = screen.getAllByRole('generic').filter(el =>
        el.className.includes('h-1') && el.className.includes('rounded-full'),
      )

      expect(progressIndicators[0]).toHaveClass('bg-green-500')
      expect(progressIndicators[1]).toHaveClass('bg-green-200')
      expect(progressIndicators[2]).toHaveClass('bg-green-200')
      expect(progressIndicators[3]).toHaveClass('bg-green-200')
    })
  })

  describe('Timer Functionality', () => {
    it('advances to next tip after 10 seconds', () => {
      act(() => {
        render(<SustainabilityTips />)
      })

      expect(screen.getByText('💡 Sustainability Tip 1/4')).toBeInTheDocument()
      expect(screen.getByText('Transportation')).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(10000)
        vi.advanceTimersByTime(600)
        vi.advanceTimersByTime(100)
      })

      expect(screen.getByText('💡 Sustainability Tip 2/4')).toBeInTheDocument()
      expect(screen.getByText('Accommodation')).toBeInTheDocument()
      expect(screen.getByText('Stay in hotels with green certifications and sustainable practices.')).toBeInTheDocument()
    })

    it('cycles through all tips and returns to first', () => {
      act(() => {
        render(<SustainabilityTips />)
      })

      expect(screen.getByText('💡 Sustainability Tip 1/4')).toBeInTheDocument()

      for (let i = 0; i < 4; i++) {
        act(() => {
          vi.advanceTimersByTime(10000)
          vi.advanceTimersByTime(600)
          vi.advanceTimersByTime(100)
        })
        const expectedTipNumber = ((i + 1) % 4) + 1
        expect(screen.getByText(`💡 Sustainability Tip ${expectedTipNumber}/4`)).toBeInTheDocument()
      }

      expect(screen.getByText('💡 Sustainability Tip 1/4')).toBeInTheDocument()
      expect(screen.getByText('Transportation')).toBeInTheDocument()
    })

    it('cleans up interval on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

      let unmount: (() => void) | undefined
      act(() => {
        const result = render(<SustainabilityTips />)
        unmount = result.unmount
      })

      if (typeof unmount === 'function') {
        act(() => {
          (unmount as () => void)()
        })
      }

      expect(clearIntervalSpy).toHaveBeenCalled()

      clearIntervalSpy.mockRestore()
    })
  })

  describe('Animation and Transitions', () => {
    it('has fade transition during tip change', () => {
      act(() => {
        render(<SustainabilityTips />)
      })

      const contentDiv = screen.getByText('Transportation').parentElement

      expect(contentDiv).toHaveClass('opacity-100')

      act(() => {
        vi.advanceTimersByTime(10000)
        vi.advanceTimersByTime(300)
      })

      expect(contentDiv).toHaveClass('opacity-0')

      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(contentDiv).toHaveClass('opacity-100')
    })

    it('updates progress indicator when tip changes', () => {
      act(() => {
        render(<SustainabilityTips />)
      })

      let progressIndicators = screen.getAllByRole('generic').filter(el =>
        el.className.includes('h-1') && el.className.includes('rounded-full'),
      )

      expect(progressIndicators[0]).toHaveClass('bg-green-500')
      expect(progressIndicators[1]).toHaveClass('bg-green-200')

      act(() => {
        vi.advanceTimersByTime(10000)
        vi.advanceTimersByTime(600)
        vi.advanceTimersByTime(100)
      })

      progressIndicators = screen.getAllByRole('generic').filter(el =>
        el.className.includes('h-1') && el.className.includes('rounded-full'),
      )

      expect(progressIndicators[0]).toHaveClass('bg-green-200')
      expect(progressIndicators[1]).toHaveClass('bg-green-500')
    })
  })

  describe('Content Display', () => {
    it('displays all tip categories correctly', () => {
      act(() => {
        render(<SustainabilityTips />)
      })

      const expectedCategories = ['Transportation', 'Accommodation', 'Activities', 'Food']

      for (let i = 0; i < expectedCategories.length; i++) {
        if (i > 0) {
          act(() => {
            vi.advanceTimersByTime(10000)
            vi.advanceTimersByTime(600)
            vi.advanceTimersByTime(100)
            vi.advanceTimersByTime(100)
          })
        }

        expect(screen.getByText(expectedCategories[i])).toBeInTheDocument()

        const heading = screen.getByRole('heading', { level: 3 })
        expect(heading.textContent).toContain((i + 1).toString())
        expect(heading.textContent).toContain('💡 Sustainability Tip')
        expect(heading.textContent).toContain('/4')
      }
    })
  })

  describe('Styling and Layout', () => {
    it('has correct styling classes', () => {
      act(() => {
        render(<SustainabilityTips />)
      })

      const heading = screen.getByRole('heading', { level: 3 })
      const container = heading.closest('div')
      expect(container).toHaveClass('p-4', 'bg-green-50', 'rounded-lg')

      expect(heading).toHaveClass('text-lg', 'font-semibold', 'text-green-800', 'mb-2')

      const category = screen.getByText('Transportation')
      expect(category).toHaveClass('text-green-700', 'font-medium')

      const tip = screen.getByText('Choose eco-friendly transport options like trains or electric vehicles.')
      expect(tip).toHaveClass('text-sm', 'text-green-600', 'mt-1')
    })

    it('has proper accessibility structure', () => {
      act(() => {
        render(<SustainabilityTips />)
      })

      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toBeInTheDocument()
      expect(heading.textContent).toContain('💡 Sustainability Tip')

      const progressContainer = heading
        .closest('div')
        ?.querySelector('.flex.gap-1.mt-3')

      expect(progressContainer).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles component state correctly', () => {
      act(() => {
        render(<SustainabilityTips />)
      })

      expect(screen.getByText('💡 Sustainability Tip 1/4')).toBeInTheDocument()
      expect(screen.getByText('Transportation')).toBeInTheDocument()
    })

    it('handles rapid timer advances without errors', () => {
      act(() => {
        render(<SustainabilityTips />)
      })

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
      act(() => {
        render(<SustainabilityTips />)
      })

      act(() => {
        vi.advanceTimersByTime(10000)
        vi.advanceTimersByTime(300)
        vi.advanceTimersByTime(100)
      })

      const progressIndicators = screen.getAllByRole('generic').filter(el =>
        el.className.includes('h-1') && el.className.includes('rounded-full'),
      )
      expect(progressIndicators).toHaveLength(4)
    })
  })
})
