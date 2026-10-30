const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://practicetestautomation.com/practice-test-login/",
    pageLoadTimeout: 120000,
    supportFile: "cypress/support/e2e.js",
    video: true,
    screenshotOnRunFailure: true,
  },
  expose: {
    urlPagina: "http://practicetestautomation.com/practice-test-login/",
    urlHome: "https://practicetestautomation.com/logged-in-successfully/",
  },
});
