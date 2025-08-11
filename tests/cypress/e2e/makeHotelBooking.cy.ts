describe('Make Hotel Room(s) Booking', () => {
  beforeEach(() => {
    cy.intercept('GET', /\/api\/v1\/hotels\/prices.*/).as('getHotelPrices')

    cy.intercept('GET', /\/api\/v1\/hotels\?destination_id=[^&]+.*$/).as(
      'getHotels',
    )

    cy.intercept('GET', /\/api\/v1\/hotels\/[^/]+$/).as('getHotelDetail')

    cy.intercept('GET', /\/api\/v1\/hotels\/[^/]+\/price.*/).as(
      'getHotelPrice',
    )
  })

  it('Main Flow', () => {
    // Visit the homepage
    cy.visit('/')

    // Select destination (simulate typeahead selection)
    cy.get('input[role="combobox"]').type('Singapore')
    cy.contains('Singapore, Singapore').click()

    // Open the date picker popover and navigate to December
    cy.get('[data-testid="start-date-button"]').click()
    function goToDecember() {
      cy.get('.rdp-caption_label').then(($caption) => {
        if (!$caption.text().includes('December')) {
          cy.get('.rdp-button_next').click()
          goToDecember()
        }
      })
    }
    goToDecember()

    // Select start date (10th December)
    cy.get('.react-day-picker').contains('10').click()
    // Select end date (17th December)
    cy.get('.react-day-picker').contains('17').click()
    // Close the popover by clicking the button again
    cy.get('[data-testid="end-date-button"]').click()

    // Open guest/room dropdown and set guests/rooms
    cy.get('[data-testid="main-dropdown-button"]').click()
    cy.get('[data-testid="adult-increment-button"]').click()
    cy.get('[data-testid="child-increment-button"]').click()
    cy.get('[data-testid="room-increment-button"]').click()
    cy.get('[data-testid="child-decrement-button"]').click()
    cy.get('body').click(0, 0)

    // Submit the search form
    cy.get('[data-testid="search-button"]').click()

    cy.window().then(
      win =>
        expect(win.sessionStorage.getItem('form-storage')).to.not.be.null,
    )
    cy.window().then(
      win =>
        expect(win.sessionStorage.getItem('country-storage')).to.not.be.null,
    )

    // Wait for navigation to ResultsPage and API calls
    cy.url().should('include', '/results/RsBU')
    cy.wait('@getHotelPrices', { timeout: 20000 })
      .its('response.body.completed')
      .should('eq', true)
    cy.wait('@getHotels', { timeout: 10000 })

    // Wait until hotel cards are loaded
    cy.get('[data-testid="hotel-card"]', { timeout: 20000 }).should('exist')

    // Drag the price slider max handle to the left (lower max price)
    cy.get('[data-testid="price-range-slider"] .MuiSlider-track').click(
      150, // width of 220px
      10,
      { force: true },
    )

    // Filter for only 4 to 5 star hotels
    cy.get('[data-testid="min-rating-star-4"]').click()
    cy.get('[data-testid="max-rating-star-5"]').click()

    // Click 'View Hotel Details' on the first hotel card
    cy.get('[data-testid="hotel-card"]')
      .first()
      .within(() => {
        cy.contains('View Hotel Details').click()
      })

    // Assert navigation to the hotel details page
    cy.url().should('include', '/hotels/detail')

    // Wait for hotel detail API to load
    cy.wait('@getHotelDetail', { timeout: 20000 })

    // wait for the price API to also intercept it
    cy.wait('@getHotelPrice', { timeout: 20000 })

    // Ensure "Add Room" button is disabled if not logged in
    cy.get('.card .btn-primary')
      .should('be.disabled')
      .and('contain', 'Add Room')
  })

  it('Alternative Flow 1 and 2: Navigate to hotel results page via browser history and Filter out of range', () => {
    // Alternative Flow 1
    // Directly visit ResultsPage with parameters
    cy.visit(
      '/results/RsBU?checkin=2025-12-10&checkout=2025-12-17&lang=en_US&currency=SGD&country_code=SG&guests=2|2',
    )
    // Check that DestinationSearch is loaded (typeahead input and search button)
    cy.get('input[role="combobox"]').should('exist')
    cy.get('[data-testid="search-button"]').should('exist')

    cy.window().then(
      win => expect(win.sessionStorage.getItem('form-storage')).to.be.null,
    )
    cy.window().then(
      win => expect(win.sessionStorage.getItem('country-storage')).to.be.null,
    )

    // Check that skeleton card is loaded (loading state)
    cy.get('.skeleton', { timeout: 5000 }).should('exist')

    // Wait until all skeletons disappear (loading finished)
    cy.get('.skeleton', { timeout: 20000 }).should('not.exist')

    // Wait until hotel cards are loaded
    cy.get('[data-testid="hotel-card"]', { timeout: 20000 }).should('exist')

    // Alternative Flow 2
    // Restrict to maximum 1 star
    cy.get('[data-testid="max-rating-star-1"]').click()

    // Drag the price slider min handle to the right (set to high price)
    cy.get('[data-testid="price-range-slider"] .MuiSlider-track').click(
      110, // width of 220px
      10,
      { force: true },
    )

    // Wait for the "No matching hotels found" message to appear
    cy.contains(
      'No matching hotels found. Please try a different criteria!',
    ).should('be.visible')
  })

  it('Alternative Flow 3: Navigate to hotel details page via browser history', () => {
    // Visit hotel details page directly
    cy.visit(
      '/hotels/detail/qO6Y?destination_id=RsBU&checkin=2025-12-10&checkout=2025-12-17&lang=en_US&currency=SGD&country_code=SG&guests=2|2',
    )
    // Wait for hotel detail and price APIs to load
    cy.wait('@getHotelDetail', { timeout: 20000 })
    cy.wait('@getHotelPrice', { timeout: 20000 })

    // Assert that room cards are rendered
    cy.get('.card .btn-primary', { timeout: 20000 }).should('exist')

    // Assert that "Add Room" is disabled if not logged in
    cy.get('.card .btn-primary')
      .should('be.disabled')
      .and('contain', 'Add Room')
  })
})
