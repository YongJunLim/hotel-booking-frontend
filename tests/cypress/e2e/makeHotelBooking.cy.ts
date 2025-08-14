import type { RoomDetails } from '../../../src/stores/RoomBookingStore'

describe('Make Hotel Room(s) Booking', () => {
  before(() => {
    // Visit the signup page
    cy.visit('/signup')

    // Fill in the signup form
    cy.get('input#first_name').type('E2E Test User')
    cy.get('input#email').type('e2e@test.com')
    cy.get('input#passwd').type('pass123')
    cy.get('input#conf_passwd').type('pass123')

    // Submit the signup form
    cy.get('button#signup').click()

    // Ensure redirection to /login
    cy.url({ timeout: 10000 }).should(
      'eq',
      `${Cypress.config().baseUrl}/login`,
    )

    cy.contains('User created successfully', { timeout: 3000 }).should(
      'be.visible',
    )
  })

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
    // easier to see
    cy.wait(500)

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
      100, // width of 220px
      10,
      { force: true },
    )

    // Wait for the "No matching hotels found" message to appear
    cy.contains(
      'No matching hotels found. Please try a different criteria!',
    ).should('be.visible')
  })

  it('Alternative Flow 3: Navigate to hotel details page via browser history and Main Flow (continued)', () => {
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

    // Click the Login button in the NavBar/MyAccountDropdown
    cy.get('.navbar').within(() => {
      cy.contains('Login').click()
    })

    // Ensure redirect to /login
    cy.url({ timeout: 10000 }).should(
      'eq',
      `${Cypress.config().baseUrl}/Login`,
    )

    // Login with test account
    cy.get('input#email').type('e2e@test.com')
    cy.get('input#passwd').type('pass123')
    cy.get('button#login').click()
    cy.url({ timeout: 10000 }).should('include', Cypress.config().baseUrl)

    // Should redirect back to hotel details page (because of redirectUrl logic)
    cy.url({ timeout: 10000 }).should('include', '/hotels/detail/qO6Y')

    // 1. Ensure "Add Room" is enabled
    cy.get('.card .btn-primary')
      .should('not.be.disabled')
      .and('contain', 'Add Room')

    // 2. Add 1 Room
    cy.get('.card .btn-primary').first().click()

    // 3. Ensure selected room appears in 'Room Selection Summary'
    cy.get('.mb-6.p-4.bg-base-200.rounded-lg').should('be.visible')
    cy.get(
      '.mb-6.p-4.bg-base-200.rounded-lg .flex.justify-between.items-center',
    )
      .filter(':not(:contains("Total:"))')
      .should('have.length', 1)

    // 4. Remove the same room
    cy.get('.card .btn-outline.btn-error').first().click()

    // 5. Ensure 'Room Selection Summary' is gone
    cy.get('.mb-6.p-4.bg-base-200.rounded-lg').should('not.exist')

    // 6. Add 2 more rooms
    cy.get('.card .btn-primary').eq(0).click()
    cy.get('.card .btn-primary').eq(1).click()

    // 7. Ensure both rooms are in 'Room Selection Summary'
    cy.get(
      '.mb-6.p-4.bg-base-200.rounded-lg .flex.justify-between.items-center',
    )
      .filter(':not(:contains("Total:"))')
      .should('have.length', 2)

    // 8. Ensure all "Add Room" buttons are disabled
    cy.get('.card .btn-primary').should('be.disabled')

    // 9. Ensure 'Book Selected Rooms (2)' button is shown
    cy.get('button.btn.btn-primary')
      .contains('Book Selected Rooms (2)')
      .should('be.visible')
      .click()

    // 10. Ensure navigation to BookingPage
    cy.url({ timeout: 10000 }).should('include', '/booking/')

    // 11. Ensure RoomBookingStore is populated in sessionStorage
    type PersistedRoomBooking = {
      state: {
        selectedRooms: RoomDetails[]
      }
    }
    cy.window().then((win) => {
      const bookingStore = win.sessionStorage.getItem('room-booking-storage')
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(bookingStore).to.not.be.null
      const parsed = JSON.parse(bookingStore!) as PersistedRoomBooking
      expect(parsed.state.selectedRooms).to.have.length(2)
    })

    // 12. Assert that Checkout Summary is shown
    cy.get('.p-4.border.rounded-md.shadow-md.bg-base-200.max-w-md.w-full')
      .should('be.visible')
      .and('contain.text', 'Your Booking Summary')
  })

  describe("User profile", () => {
    it('should display user account page with correct user details and edit profile', () => {
      // Log in as E2E Test User
      cy.visit('/login')
      cy.get('input#email').type('e2e@test.com')
      cy.get('input#passwd').type('pass123')
      cy.get('button#login').click()

      // Wait for login and redirect to home
      cy.url({ timeout: 10000 }).should('include', Cypress.config().baseUrl)
      cy.window().should(
        win => expect(win.localStorage.getItem('auth-storage')).to.not.be.null,
      )
      cy.wait(500)
      
      cy.visit('/user')

      cy.get('[data-testid="username"]').should('contain', 'E2E Test User')
      cy.contains('e2e@test.com').should('be.visible')
      cy.contains('Booking list').should('be.visible')

      // Open edit modal
      cy.get('button[aria-expanded]').click()
      cy.get('[data-testid="open-edit"]').click()
      
      // Fill in updated information
      cy.get('#first_name').clear().type('E2E')
      cy.get('#last_name').clear().type('Test1 User')
      cy.get('#salutation').select('Dr')
      cy.get('#phone').clear().type('87654321')
      cy.get('#email').clear().type('updated-E2E@test.com')
      cy.get('#passwd_edit').type("pass123")
      
      // Submit the form
      cy.get('[data-testid="submit-edit"]').click()
      
      // Verify success toast (assuming toast appears)
      // This might need adjustment based on your actual toast implementation
      cy.contains('Profile updated successfully', { timeout: 5000 }).should('be.visible')
      
      // Verify updated details are reflected on the page
      cy.get('[data-testid="username"]').should('contain', 'Dr E2E Test1 User')
      cy.contains('updated-E2E@test.com').should('be.visible')
      cy.contains('87654321').should('be.visible')
    })

    // it('should successfully update user profile with valid data', () => {
      
    //   cy.visit('/user')
      
      
    // })

    // it('should display booking list table with correct headers', () => {
    //   cy.visit('/user')
      
    //   // Wait for bookings to load
      
    //   // Verify table headers
    //   cy.get('typeheader').should('contain', 'Room Type')
    //   cy.get('startheader').should('contain', 'Start Date')
    //   cy.get('endheader').should('contain', 'End Date')
    //   cy.get('nightheader').should('contain', 'Nights')
    //   cy.get('infoheader').should('contain', 'More info')
    //   // cy.contains('Room Type').should('be.visible')
    //   // cy.contains('Start Date').should('be.visible')
    //   // cy.contains('End Date').should('be.visible')
    //   // cy.contains('Nights').should('be.visible')
    //   // cy.contains('More info').should('be.visible')
    // })
  })

  // Delete Test account
  after(() => {
    // Log in as E2E Test User
    cy.visit('/login')
    cy.get('input#email').type('updated-E2E@test.com')
    cy.get('input#passwd').type('pass123')
    cy.get('button#login').click()

    // Wait for login and redirect to home
    cy.url({ timeout: 10000 }).should('include', Cypress.config().baseUrl)
    cy.window().should(
      win => expect(win.localStorage.getItem('auth-storage')).to.not.be.null,
    )
    cy.wait(500)
    // Go to user account page
    cy.visit('/user')

    //Open the dropdown menu by clicking the three-dots button
    cy.get('button[aria-expanded]').click()

    //Delete button should be visible, then click
    cy.get('button#deleteButton', { timeout: 5000 })
    .should('be.visible')
    .click()

    // Click Delete Account button
    //cy.get('button#deleteButton').click()

    // Enter password in the confirmation dialog
    cy.get('input#passwd_del').type('pass123')

    // Confirm deletion
    cy.get('a#deleteAccount').click()

    // Assert toast message
    cy.contains('Your account has been deleted successfully.', {
      timeout: 3000,
    }).should('be.visible')
  })
})
