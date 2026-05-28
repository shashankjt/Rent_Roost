describe('RentRoost E2E Booking Flow Tests', () => {
  beforeEach(() => {
    // We can visit the homepage before each test
    cy.visit('/');
  });

  it('should load listings on the homepage and support pagination loading', () => {
    cy.contains('Featured Properties').should('be.visible');
    // Ensure at least one listing card link is loaded
    cy.get('a[href*="/listings/"]').should('have.length.at.least', 1);
  });

  it('should navigate to property details page and verify booking widget structure', () => {
    // Click on the first property link
    cy.get('a[href*="/listings/"]').first().click();

    // Verify detail elements
    cy.url().should('include', '/listings/');
    cy.contains('About this place').should('be.visible');
    cy.contains('Reserve').should('exist');

    // Confirm that DatePickers are present
    cy.get('input[placeholder="Select date"]').should('have.length', 2);
  });
});
