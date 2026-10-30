const { defineConfig } = require('cypress');
const { lighthouse, prepareAudit } = require('@cypress-audit/lighthouse');
const { saveMetrics } = require('./scripts/saveMetrics');
const { syncToSheets } = require('./scripts/sync-to-sheets');

let lastReport = null;

module.exports = defineConfig({
  e2e: {
    pageLoadTimeout: 90000,
    taskTimeout: 180000,
    video: false,
    setupNodeEvents(on) {
      on('before:browser:launch', (browser = {}, launchOptions) => {
        prepareAudit(launchOptions);
        return launchOptions;
      });
      on('task', {
        lighthouse: lighthouse((report) => {
          lastReport = report;
        }),
        saveMetrics: (payload) => {
          const report = lastReport;
          lastReport = null;
          return saveMetrics(report, payload);
        },
        syncSheets: async () => {
          await syncToSheets().catch((err) => console.error('[Sheets]', err.message));
          return null;
        },
      });
    },
  },
});
