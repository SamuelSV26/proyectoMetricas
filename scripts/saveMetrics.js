const fs = require('fs');
const FILE = 'cypress/fixtures/lighthouse-metrics.json';

function saveMetrics(report, { url, deviceLabel, error }) {
  const record = { url, screenEmulation: deviceLabel, timestamp: new Date().toISOString() };

  if (error || !report) {
    Object.assign(record, { status: 'error', error: error || 'Sin reporte de Lighthouse' });
  } else {
    const a = report.lhr.audits;
    Object.assign(record, {
      firstContentfulPaint: Math.round(a['first-contentful-paint'].numericValue),
      largestContentfulPaint: Math.round(a['largest-contentful-paint'].numericValue),
      speedIndex: Math.round(a['speed-index'].numericValue),
      performance: Math.round(report.lhr.categories.performance.score * 100),
      status: 'ok',
    });
  }

  const history = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : [];
  history.push(record);
  fs.writeFileSync(FILE, JSON.stringify(history, null, 2));
  return null; // los tasks de Cypress no pueden devolver undefined
}

module.exports = { saveMetrics };