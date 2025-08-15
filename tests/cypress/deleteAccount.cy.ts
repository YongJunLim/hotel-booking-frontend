describe('Account Deletion', () => {
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
  // Go to user account page
  cy.visit('/user')

  // Click Delete Account button
  cy.get('button#deleteButton').click()

  // Enter password in the confirmation dialog
  cy.get('input#passwd_del').type('pass123')

  // Confirm deletion
  cy.get('a#deleteAccount').click()

  // Assert toast message
  cy.contains('Your account has been deleted successfully.', {
    timeout: 3000,
  }).should('be.visible')
})
