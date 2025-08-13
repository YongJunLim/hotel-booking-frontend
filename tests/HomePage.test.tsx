import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HomePage } from '../src/pages/HomePage'

// Mock the complex components that have their own tests
vi.mock('../src/components/ui/DestinationSearch', () => ({
  default: () => <div data-testid="destination-search">Destination Search</div>,
}))

vi.mock('../src/components/ui/SustinabilityTips', () => ({
  SustainabilityTips: () => <div data-testid="sustainability-tips">Sustainability Tips</div>,
}))

vi.mock('../src/components/layout/NavBar', () => ({
  NavBar: ({ pageTitle }: { pageTitle: string }) => <nav data-testid="navbar">{pageTitle}</nav>,
}))

describe('Unit Test for HomePage', () => {
  it('should render all main sections', () => {
    render(<HomePage />)

    // Check static content
    expect(screen.getByText('Welcome to our hotel booking platform!')).toBeInTheDocument()
    expect(screen.getByText(/Photo by/)).toBeInTheDocument()

    // Check components are rendered
    expect(screen.getByTestId('navbar')).toHaveTextContent('Hotel Booking')
    expect(screen.getByTestId('destination-search')).toBeInTheDocument()
    expect(screen.getByTestId('sustainability-tips')).toBeInTheDocument()

    // Check image
    expect(screen.getByRole('img')).toHaveAttribute('src', '/travel.jpg')
  })
})
