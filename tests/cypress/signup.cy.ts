describe('User Signup', () => {
  it('should successfully create a new account', () => {
    cy.visit('/signup')

    cy.get('input#name').type('E2E Test User')
    cy.get('input#email').type('e2e@test.com')
    cy.get('input#passwd').type('pass123')
    cy.get('button#signup').click()

    cy.url().should('include', '/login')
    cy.contains('User created successfully').should('be.visible')
  })
})
