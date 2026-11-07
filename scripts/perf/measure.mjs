// Versioned performance meter. Usage: node scripts/perf/measure.mjs <load|scale> [--quick]
// Needs a production build (`npm run build`). Synthetic profiles only; results in perf-results/.
import fs from 'node:fs';
import {
  BASE,
  PORT,
  RESULTS,
  cleanup,
  coldLoad,
  median,
  open,
  ready,
  save,
  seedHistory,
  startServer,
} from './lib.mjs';

const mode = process.argv[2];
const quick = process.argv.includes('--quick');
if (!['load', 'scale'].includes(mode)) {
  console.error('Uso: node scripts/perf/measure.mjs <load|scale> [--quick]');
  process.exit(2);
}
const ROUTES = [
  '/',
  '/missoes',
  '/missoes?view=agenda',
  '/sessoes',
  '/mundo',
  '/acampamento',
  '/perfil',
  '/projetos',
  '/progresso',
  '/config',
  '/loja',
];
const KEYS = [
  'appReady',
  'lcp',
  'blockingMs',
  'longestTaskMs',
  'cls',
  'mb',
  'requests',
  'heapMb',
];
const repeats = quick ? 1 : 3;

async function load() {
  const results = [];
  const context = await open('load');
  const first = context.pages()[0] ?? (await context.newPage());
  await first.goto(BASE + '/');
  await ready(first);
  for (const route of ROUTES)
    for (const rate of quick ? [1] : [1, 4]) {
      const rows = [];
      for (let i = 0; i < repeats; i++)
        rows.push(await coldLoad(context, route, rate));
      const row = { route, rate };
      for (const key of KEYS) row[key] = median(rows.map((r) => r[key]));
      results.push(row);
      console.log(
        route.padEnd(24),
        `x${rate}`,
        'pronto',
        Math.round(row.appReady),
        'ms · bloqueio',
        Math.round(row.blockingMs),
        'ms · peso',
        row.mb.toFixed(1),
        'MB',
      );
    }
  await context.close();
  return results;
}

async function scale() {
  const results = [];
  for (const years of quick ? [0, 1] : [0, 1, 3, 5]) {
    const context = await open(`scale-${years}`);
    const page = context.pages()[0] ?? (await context.newPage());
    await page.goto(BASE + '/');
    await ready(page);
    const rows = years ? await seedHistory(page, years) : 0;
    const row = { years, rowsPerTable: rows };
    await page.goto(BASE + '/config');
    await ready(page);
    const raw = [];
    for (let i = 0; i < repeats; i++)
      raw.push(
        await page.evaluate(async () => {
          const db = await new Promise((res) => {
            const r = indexedDB.open('LevelMeUpDB');
            r.onsuccess = () => res(r.result);
          });
          const t0 = performance.now();
          const tx = db.transaction([...db.objectStoreNames]);
          await Promise.all(
            [...db.objectStoreNames].map(
              (n) =>
                new Promise((res) => {
                  tx.objectStore(n).getAll().onsuccess = res;
                }),
            ),
          );
          const d = performance.now() - t0;
          db.close();
          return d;
        }),
      );
    row.rawReadAllMs = Math.round(median(raw));
    const home = [];
    const missions = [];
    for (let i = 0; i < repeats; i++)
      for (const [list, route] of [
        [home, '/'],
        [missions, '/missoes'],
      ]) {
        const t = Date.now();
        await page.goto(BASE + route, { waitUntil: 'commit' });
        await ready(page, 180000);
        list.push(Date.now() - t);
      }
    row.openHomeMs = median(home);
    row.openMissionsMs = median(missions);
    const completes = [];
    for (let i = 0; i < repeats; i++) {
      await page.goto(BASE + '/missoes');
      await ready(page, 180000);
      await page.waitForTimeout(400);
      await page
        .getByRole('button', { name: 'Nova missão', exact: true })
        .first()
        .click();
      const form = page.getByRole('dialog', { name: 'Uma nova missão' });
      await form
        .getByLabel('O que você quer fazer?')
        .fill(`Medição ${i} ${Date.now()}`);
      await form
        .getByRole('button', { name: 'Criar missão', exact: true })
        .click();
      await form.waitFor({ state: 'hidden', timeout: 120000 });
      const button = page
        .getByRole('button', { name: /^Concluir Medição/ })
        .first();
      await button.waitFor({ timeout: 120000 });
      const name = await button.getAttribute('aria-label');
      const t0 = Date.now();
      await button.click();
      await page.waitForFunction(
        (n) =>
          ![...document.querySelectorAll('button')].some(
            (b) => b.getAttribute('aria-label') === n,
          ),
        name,
        { timeout: 120000 },
      );
      completes.push(Date.now() - t0);
      await page.waitForTimeout(300);
    }
    row.completeMs = median(completes);
    row.storageMb = +(
      await page.evaluate(
        async () => (await navigator.storage.estimate()).usage / 1048576,
      )
    ).toFixed(1);
    results.push(row);
    console.log(JSON.stringify(row));
    await context.close();
  }
  return results;
}

const stop = await startServer();
try {
  const results = mode === 'load' ? await load() : await scale();
  const meta = {
    mode,
    quick,
    port: PORT,
    date: new Date().toISOString(),
    node: process.version,
    note: 'Dados sintéticos; compare tendências, não milissegundos.',
  };
  const file = `${mode}-${meta.date.slice(0, 19).replace(/[:T]/g, '-')}.json`;
  save(file, { meta, results });
  console.log(`Resultado salvo em perf-results/${file}`);
} finally {
  stop();
  cleanup();
}
if (!fs.existsSync(RESULTS)) process.exitCode = 1;
