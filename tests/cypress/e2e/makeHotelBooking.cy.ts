describe('Hotel Booking Home to ResultsPage flow', () => {
  it('loads HomePage, inputs parameters, filters, and navigates to hotel details', () => {
    // Intercept hotel prices API with fixture data
    cy.intercept(
      'GET',
      'http://localhost:9000/api/v1/hotels/prices*',
      // { fixture: "hotels_prices.json" },
    ).as('getHotelPrices')

    // Intercept hotel list API with fixture data
    cy.intercept(
      'GET',
      'http://localhost:9000/api/v1/hotels?destination_id=*',
      // { fixture: "hotels_list.json" },
    ).as('getHotels')

    // Intercept hotel detail API (e.g., /api/v1/hotels/12345)
    cy.intercept(
      'GET',
      /\/api\/v1\/hotels\/[^/]+$/, // matches /api/v1/hotels/{hotelId}
      // { fixture: 'hotel_detail.json' }
    ).as('getHotelDetail')

    // Intercept hotel price API (e.g., /api/v1/hotels/{hotelId}/price?...)
    cy.intercept(
      'GET',
      /\/api\/v1\/hotels\/[^/]+\/price.*/, // matches /api/v1/hotels/{hotelId}/price?...
      // { fixture: 'hotel_price.json' }
    ).as('getHotelPrice')

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

    // Wait for navigation to ResultsPage and API calls
    cy.url().should('include', '/results/RsBU')
    cy.wait('@getHotelPrices', { timeout: 20000 })
      .its('response.body.completed')
      .should('eq', true)
    cy.wait('@getHotels')

    // Wait until hotel cards are loaded
    cy.get('[data-testid="hotel-card"]', { timeout: 20000 }).should('exist')

    // Filter for only 4 to 5 star hotels
    cy.get('[data-testid="min-rating-star-4"]').click()
    cy.get('[data-testid="max-rating-star-5"]').click()

    // Drag the price slider max handle to the left (lower max price)
    cy.get('[data-testid="price-range-slider"] .MuiSlider-thumb')
      .last()
      .trigger('mousedown', { which: 1, pageX: 400, force: true })
      .trigger('mousemove', { which: 1, pageX: 200, force: true })
      .trigger('mouseup', { force: true })

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
})
