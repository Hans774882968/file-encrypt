// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
Cypress.Commands.add(
  'forceSelectPDF',
  { prevSubject: 'element' },
  (element, path) => cy.wrap(element).selectFile(path, { force: true }),
);

Cypress.Commands.add(
  'forceClick',
  { prevSubject: 'element' },
  (element) => cy.wrap(element).click({ force: true }),
);

Cypress.Commands.add(
  'forceInput',
  { prevSubject: 'element' },
  (element, text) => cy.wrap(element).clear().type(`${text}{enter}`, { force: true }),
);

Cypress.Commands.add(
  'forceInputWithoutEnter',
  { prevSubject: 'element' },
  (element, text) => cy.wrap(element).clear().type(text, { force: true }),
);

Cypress.Commands.add(
  'pressEnter',
  { prevSubject: 'element' },
  (element) => cy.wrap(element).type('{enter}', { force: true }),
);
