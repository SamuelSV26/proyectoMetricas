const thresholds = {
  firstContentfulPaint: { good: 1800, warn: 3000 },   // <= 1.8s Bueno | > 1.8-3s Por mejorar | > 3s Deficiente
  largestContentfulPaint: { good: 2500, warn: 4000 }, // <= 2.5s Bueno | > 2.5-4s Por mejorar | > 4s Deficiente
  speedIndex: { good: 3400, warn: 5800 },             // <= 3.4s Bueno | > 3.4-5.8s Por mejorar | > 5.8s Deficiente
  performance: { good: 90, warn: 50 },                // 90-100 Bueno  | 50-89 Por mejorar      | 0-49 Deficiente
};

function classify(metric, value) {
  if (typeof value !== 'number') return 'Error';
  const limit = thresholds[metric];

  if (metric === 'performance') {
    if (value >= limit.good) return 'Bueno';
    if (value >= limit.warn) return 'Por mejorar';
    return 'Deficiente';
  }

  if (value <= limit.good) return 'Bueno';
  if (value <= limit.warn) return 'Por mejorar';
  return 'Deficiente';
}

module.exports = { thresholds, classify };
