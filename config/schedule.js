module.exports = [
  {
    id: 'mobile-job',
    enabled: true,
    startDate: '2026-10-29',
    time: '08:00',
    timezone: 'America/Bogota',
    frequency: 'daily', // 'once' | 'daily' | 'weekly'
    devices: ['mobile'],
    pages: ['Donaciones', 'Graduados'],
  },
  {
    id: 'desktop-job',
    enabled: true,
    startDate: '2026-10-29',
    time: '08:15',
    timezone: 'America/Bogota',
    frequency: 'daily',
    devices: ['desktop'],
    pages: ['Donaciones', 'Graduados'],
  },
];
