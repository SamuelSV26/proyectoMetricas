const pages = require('../../config/pages');
const devices = require('../../config/devices');

const onlyDevice = Cypress.env('device'); // permite correr solo móvil o solo escritorio

describe('Métricas Lighthouse', () => {
  pages.filter((p) => p.enabled).forEach((page) => {
    devices
      .filter((d) => !onlyDevice || d.id === onlyDevice)
      .forEach((device) => {
        it(`${page.name} - ${device.id}`, () => {
          cy.visit(page.url);
          // umbral en 0: el taller clasifica, no hace fallar la prueba por mala nota
          cy.lighthouse({ performance: 0 }, device.opts);
          cy.task('saveMetrics', { url: page.url, deviceLabel: device.label });
        });
      });
  });
});