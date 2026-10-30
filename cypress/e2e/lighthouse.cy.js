const pages = require('../../config/pages');
const devices = require('../../config/devices');

Cypress.on('uncaught:exception', () => false);

const deviceEnv = Cypress.env('device'); // ej. 'mobile' o 'mobile,desktop'
const pageEnv = Cypress.env('pages');    // ej. 'Donaciones,Graduados'

const deviceList = deviceEnv ? String(deviceEnv).split(',') : null;
const pageList = pageEnv ? String(pageEnv).split(',') : null;

describe('Métricas Lighthouse', () => {
  let current = null;
  let saved = false;

  afterEach(function () {
    if (this.currentTest?.state === 'failed' && current && !saved) {
      const msg = (this.currentTest.err?.message || 'Error en evaluación').split('\n')[0];
      cy.task('saveMetrics', { ...current, error: msg });
    }
  });

  after(() => {
    cy.task('syncSheets');
  });

  pages
    .filter((p) => p.enabled && (!pageList || pageList.includes(p.name)))
    .forEach((page) => {
      devices
        .filter((d) => !deviceList || deviceList.includes(d.id))
        .forEach((device) => {
          it(`${page.name} - ${device.id}`, () => {
            current = { url: page.url, deviceLabel: device.label };
            saved = false;

            cy.visit(page.url);
            cy.lighthouse({ performance: 0 }, device.opts);
            cy.task('saveMetrics', current).then(() => {
              saved = true;
            });
          });
        });
    });
});
