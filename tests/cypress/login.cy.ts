describe('User Login', () => {

  it('should log in successfully', () => {
    cy.visit('/login')
    
    cy.get('input#email').type('e2e@test.com')
    cy.get('input#passwd').type('pass123')
    cy.get('button#login').click()

    cy.url().should('eq', Cypress.config().baseUrl + '/')
    cy.window().its('localStorage.auth-storage').should('exist')
  })
})