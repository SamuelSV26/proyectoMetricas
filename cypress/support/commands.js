Cypress.Commands.add('login', (username, password) => {
  cy.visit(Cypress.expose('urlPagina'));

  cy.get('#username').should('be.visible').clear().type(username);
  cy.get('#password').should('be.visible').clear().type(password, { log: false });
  cy.get('#submit').should('be.visible').click();
});