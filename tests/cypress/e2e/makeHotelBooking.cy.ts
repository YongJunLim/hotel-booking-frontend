describe("Hotel Booking Home to ResultsPage flow", () => {
  it("loads HomePage, inputs parameters, and queries hotels/prices and hotels endpoints", () => {
    // Intercept hotel prices API
    cy.intercept(
      "GET",
      "http://localhost:9000/api/v1/hotels/prices?destination_id=RsBU&checkin=2025-12-10&checkout=2025-12-17&guests=2",
    ).as("getHotelPrices");

    // Intercept hotel list API
    cy.intercept(
      "GET",
      "http://localhost:9000/api/v1/hotels?destination_id=RsBU",
    ).as("getHotels");

    // Visit the homepage
    cy.visit("/");

    // Select destination (simulate typeahead selection)
    cy.get('input[role="combobox"]').type("Singapore");
    cy.contains("Singapore, Singapore").click();

    // Open the date picker popover
    cy.get('[data-testid="start-date-button"]').click();

    // Helper function to loop until December is visible
    function goToDecember() {
      cy.get(".rdp-caption_label").then(($caption) => {
        if (!$caption.text().includes("December")) {
          cy.get(".rdp-button_next").click();
          goToDecember();
        }
      });
    }
    goToDecember();

    // Select start date (10th December)
    cy.get(".react-day-picker").contains("10").click();
    // Select end date (17th December)
    cy.get(".react-day-picker").contains("17").click();
    cy.get('[data-testid="end-date-button"]').click();

    // Open guest/room dropdown and set guests/rooms
    cy.get('[data-testid="main-dropdown-button"]').click();
    cy.get('[data-testid="adult-increment-button"]').click();
    cy.get("body").click(0, 0);

    // Submit the search form
    cy.get('[data-testid="search-button"]').click();

    // Wait for navigation to ResultsPage and API calls
    cy.url().should("include", "/results/RsBU");
    cy.wait("@getHotelPrices");
    cy.wait("@getHotels");

    // Assert that hotel cards are rendered (optional)
    cy.get('[data-testid="hotel-card"]').should("exist");
  });
});
