describe('User page', () => {
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

  describe('Booking List Display and Functionality', () => {
    beforeEach(() => {
      // Mock booking data for tests
        cy.intercept('GET', 'http://localhost:9000/api/v1/bookings', {
            statusCode: 200,
            body: {
            success: true,
            bookings: [
                {
                _id: '123',
                roomType: 'Deluxe King Room',
                startDate: '2025-12-10',
                endDate: '2025-12-17',
                nights: 7,
                adults: 2,
                children: 1,
                status: 'Confirmed',
                messageToHotel: 'Early check-in requested',
                createdAt: '2025-08-01T10:00:00Z',
                },
                {
                _id: '456',
                roomType: 'Standard Twin Room',
                startDate: '2025-12-20',
                endDate: '2025-12-22',
                nights: 2,
                adults: 1,
                children: 0,
                status: 'Pending',
                messageToHotel: 'No special requests',
                createdAt: '2025-08-05T14:30:00Z',
                },
            ],
            },
        }).as('getBookings')
        
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

        //cy.intercept('GET', '**/api/v1/bookings').as('getBookings')
    })

    it('should display booking list table with correct headers and booking data', () => {
        cy.visit('/user')

        // Wait for bookings to load
        //cy.wait('@getBookings')
        cy.wait('@getBookings', {timeout: 5000})

        // Verify table headers
        cy.contains('Room Type').should('be.visible')
        cy.contains('Start Date').should('be.visible')
        cy.contains('End Date').should('be.visible')
        cy.contains('Nights').should('be.visible')
        cy.contains('More info').should('be.visible')

        // Verify first booking data
        cy.get('[data-testid="roomtype-0"]').should('contain', 'Deluxe King Room')
        cy.get('[data-testid="startdate-0"]').should('contain', '2025-12-10')
        cy.get('[data-testid="enddate-0"]').should('contain', '2025-12-17')
        cy.get('[data-testid="nights-0"]').should('contain', '7')
        cy.get('[data-testid="info-0"]').should('contain', 'View')

        // Verify second booking data
        cy.get('[data-testid="roomtype-1"]').should('contain', 'Standard Twin Room')
        cy.get('[data-testid="startdate-1"]').should('contain', '2025-12-20')
        cy.get('[data-testid="enddate-1"]').should('contain', '2025-12-22')
        cy.get('[data-testid="nights-1"]').should('contain', '2')
    })

    // it('should display booking data correctly in the table', () => {
    //     cy.visit('/user')

    //     // Wait for bookings to load
    //     cy.wait('@getBookings')

        
    // })

    it('should show detailed booking information when View is clicked', () => {
        cy.visit('/user')

        // Wait for bookings to load
        cy.wait('@getBookings', {timeout: 5000})

        // Click View on first booking
        cy.get('[data-testid="info-0"] a').click()

        // Verify detailed information is displayed
        cy.contains('Viewed Information:').should('be.visible')
        cy.contains('Room Type: Deluxe King Room').should('be.visible')
        cy.contains('Nights: 7').should('be.visible')
        cy.contains('Adults: 2 | Children: 1').should('be.visible')
        cy.contains('Status: Confirmed').should('be.visible')
        cy.contains('Message to Hotel: Early check-in requested').should('be.visible')

        // Verify close button works
        cy.contains('Close').click()
        cy.contains('Viewed Information:').should('not.exist')
        })

        it('should handle refresh booking list functionality', () => {
        cy.visit('/user')

        // Wait for initial load
        cy.wait('@getBookings')

        // Set up intercept for refresh
        cy.intercept('GET', '/api/v1/bookings', {
            statusCode: 200,
            body: {
            success: true,
            bookings: [
                {
                _id: '789',
                roomType: 'Presidential Suite',
                startDate: '2025-12-25',
                endDate: '2025-12-30',
                nights: 5,
                adults: 2,
                children: 0,
                status: 'Confirmed',
                messageToHotel: 'VIP treatment',
                createdAt: '2025-08-10T16:00:00Z',
                },
            ],
            },
        }).as('refreshBookings')

        // Click refresh button
        cy.contains('Refresh').click()

        // Wait for refresh call
        cy.wait('@refreshBookings', {timeout: 5000})

        // Verify updated booking data
        cy.get('[data-testid="roomtype-0"]').should('contain', 'Presidential Suite')
    })
  })

  describe('User profile', () => {
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
      cy.get('#passwd_edit').type('pass123')

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

    // Open the dropdown menu by clicking the three-dots button
    cy.get('button[aria-expanded]').click()

    // Delete button should be visible, then click
    cy.get('button#deleteButton', { timeout: 5000 })
      .should('be.visible')
      .click()

    // Click Delete Account button
    // cy.get('button#deleteButton').click()

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
