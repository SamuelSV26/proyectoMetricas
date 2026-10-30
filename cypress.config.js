const { defineConfig } = require('cypress');
const { lighthouse, prepareAudit } = require('@cypress-audit/lighthouse');
const { saveMetrics } = require('./scripts/saveMetrics');

let lastReport = null;

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on) {
      on('before:browser:launch', (browser = {}, launchOptions) => {
        prepareAudit(launchOptions);
      });
      on('task', {
        lighthouse: lighthouse((report) => { lastReport = report; }),
        saveMetrics: (payload) => saveMetrics(lastReport, payload),
      });
    },
  },
});