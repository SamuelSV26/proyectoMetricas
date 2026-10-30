const { spawn } = require('child_process');
const path = require('path');
const cron = require('node-cron');
const jobs = require('./config/schedule');

const CYPRESS_BIN = path.resolve(__dirname, 'node_modules/cypress/bin/cypress');
let queue = Promise.resolve();

function getCronExpression(job) {
  const [hour, minute] = job.time.split(':').map(Number);
  if (job.frequency === 'daily') return `${minute} ${hour} * * *`;
  if (job.frequency === 'weekly') {
    const dayOfWeek = job.dayOfWeek ?? new Date(`${job.startDate}T00:00:00`).getDay();
    return `${minute} ${hour} * * ${dayOfWeek}`;
  }
  if (job.frequency === 'once') {
    const [, month, day] = job.startDate.split('-').map(Number);
    return `${minute} ${hour} ${day} ${month} *`;
  }
  throw new Error(`Frecuencia inválida en ${job.id}: ${job.frequency}`);
}

function todayInTimezone(tz) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
}

function runJob(job) {
  queue = queue.then(
    () =>
      new Promise((resolve) => {
        console.log(`\n[Scheduler] Ejecutando ${job.id} (${job.devices.join(',')})...`);
        const args = [CYPRESS_BIN, 'run', '--browser', 'chrome', '--spec', 'cypress/e2e/lighthouse.cy.js'];

        const child = spawn(process.execPath, args, {
          cwd: __dirname,
          stdio: 'inherit',
          env: {
            ...process.env,
            CYPRESS_device: job.devices.join(','),
            CYPRESS_pages: job.pages.join(','),
          },
        });
        child.on('close', () => resolve());
      })
  );
  return queue;
}

if (process.argv.includes('--now')) {
  jobs.filter((j) => j.enabled).forEach((job) => runJob(job));
} else {
  jobs.forEach((job) => {
    if (!job.enabled) return;
    const tz = job.timezone || 'America/Bogota';
    const expr = getCronExpression(job);

    const task = cron.schedule(
      expr,
      () => {
        const today = todayInTimezone(tz);
        if (today < job.startDate) return;
        runJob(job);
        if (job.frequency === 'once') task.stop();
      },
      { timezone: tz }
    );

    console.log(`[Scheduler] Activo: ${job.id} | ${job.frequency} ${job.time} (${tz}) | Inicio: ${job.startDate}`);
  });
}
