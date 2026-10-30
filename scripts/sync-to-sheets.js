const fs = require('fs');
const path = require('path');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const pages = require('../config/pages');
const { classify } = require('../config/thresholds');

const METRICS_FILE = path.resolve(__dirname, '../cypress/fixtures/lighthouse-metrics.json');
const CREDS_FILE = path.resolve(__dirname, '../credentials.json');
const ENV_FILE = path.resolve(__dirname, '../.env');

const COLORS = {
  Bueno: { red: 0.85, green: 0.92, blue: 0.83 },
  'Por mejorar': { red: 1, green: 0.95, blue: 0.8 },
  Deficiente: { red: 0.96, green: 0.8, blue: 0.8 },
  Error: { red: 0.93, green: 0.93, blue: 0.93 },
};

const HEADERS = [
  'Fecha (Bogota)',
  'Pagina',
  'URL',
  'Dispositivo',
  'FCP (s)',
  'Estado FCP',
  'LCP (s)',
  'Estado LCP',
  'Speed Index (s)',
  'Estado SI',
  'Performance',
  'Estado Perf',
  'Status / Error',
];

function getEnv(key) {
  if (process.env[key]) return process.env[key];
  if (!fs.existsSync(ENV_FILE)) return '';
  const match = fs.readFileSync(ENV_FILE, 'utf8').match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim().replace(/^["']|["']$/g, '') : '';
}

function toRow(r) {
  const page = pages.find((p) => p.url === r.url);
  const ok = r.status === 'ok';
  const toSec = (ms) => (ok ? Number((ms / 1000).toFixed(2)) : 'N/A');

  return {
    'Fecha (Bogota)': new Date(r.timestamp).toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
    Pagina: page ? page.name : r.url,
    URL: r.url,
    Dispositivo: r.screenEmulation,
    'FCP (s)': toSec(r.firstContentfulPaint),
    'Estado FCP': ok ? classify('firstContentfulPaint', r.firstContentfulPaint) : 'Error',
    'LCP (s)': toSec(r.largestContentfulPaint),
    'Estado LCP': ok ? classify('largestContentfulPaint', r.largestContentfulPaint) : 'Error',
    'Speed Index (s)': toSec(r.speedIndex),
    'Estado SI': ok ? classify('speedIndex', r.speedIndex) : 'Error',
    Performance: ok ? r.performance : 'N/A',
    'Estado Perf': ok ? classify('performance', r.performance) : 'Error',
    'Status / Error': ok ? 'ok' : r.error || 'error',
  };
}

async function writeSheet(doc, title, rows) {
  let sheet = doc.sheetsByTitle[title];
  if (!sheet) {
    sheet = await doc.addSheet({ title, headerValues: HEADERS });
  } else {
    await sheet.clear();
    await sheet.setHeaderRow(HEADERS);
  }

  if (rows.length === 0) return;
  await sheet.addRows(rows);

  await sheet.loadCells({ startRowIndex: 0, endRowIndex: rows.length + 1, startColumnIndex: 0, endColumnIndex: HEADERS.length });
  for (let col = 0; col < HEADERS.length; col++) {
    sheet.getCell(0, col).textFormat = { bold: true };
  }
  for (let r = 1; r <= rows.length; r++) {
    for (const col of [5, 7, 9, 11]) {
      const statusCell = sheet.getCell(r, col);
      const valueCell = sheet.getCell(r, col - 1);
      const color = COLORS[statusCell.value];
      if (color) {
        statusCell.backgroundColor = color;
        valueCell.backgroundColor = color;
      }
    }
  }
  await sheet.saveUpdatedCells();
}

async function syncToSheets() {
  const sheetId = getEnv('GOOGLE_SHEET_ID');
  if (!sheetId || !fs.existsSync(CREDS_FILE)) {
    console.warn('[Sheets] Falta GOOGLE_SHEET_ID en .env o el archivo credentials.json.');
    return;
  }
  if (!fs.existsSync(METRICS_FILE)) return;

  const creds = JSON.parse(fs.readFileSync(CREDS_FILE, 'utf8'));
  const auth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(sheetId, auth);
  await doc.loadInfo();

  const records = JSON.parse(fs.readFileSync(METRICS_FILE, 'utf8'));
  const latestMap = new Map();
  records.forEach((r) => latestMap.set(`${r.url}|${r.screenEmulation}`, r));

  await writeSheet(doc, 'Resumen Actual', Array.from(latestMap.values()).map(toRow));
  await writeSheet(doc, 'Historial', [...records].reverse().map(toRow));

  console.log(`[Sheets] Informe actualizado en "${doc.title}" (${records.length} registros).`);
}

if (require.main === module) {
  syncToSheets().catch((err) => {
    console.error('[Sheets] Error:', err.message);
    process.exit(1);
  });
}

module.exports = { syncToSheets };
