// Diagnóstico de uma conclusão com histórico sintético: conta leituras do
// IndexedDB por tabela e grava um perfil de CPU em perf-results/. Dados
// sintéticos, perfil temporário, porta própria (nunca 5174).
// Uso: npm run build && node scripts/perf/profile-complete.mjs [anos]
import fs from 'node:fs';
import path from 'node:path';
import {
  BASE,
  RESULTS,
  cleanup,
  open,
  ready,
  seedHistory,
  startServer,
} from './lib.mjs';

const years = Number(process.argv[2] ?? 5);
const stop = await startServer();
try {
  const context = await open(`profile-${years}`);
  const page = context.pages()[0] ?? (await context.newPage());
  await page.goto(BASE + '/');
  await ready(page);
  const rows = years ? await seedHistory(page, years) : 0;
  await page.addInitScript(() => {
    const counts = {};
    const wrap = (proto, method) => {
      const original = proto[method];
      proto[method] = function (...args) {
        const store = this.objectStore ? this.objectStore.name : this.name;
        const key = `${store}.${method}${this.objectStore ? '(index)' : ''}`;
        counts[key] = (counts[key] ?? 0) + 1;
        return original.apply(this, args);
      };
    };
    for (const m of ['getAll', 'openCursor', 'get', 'count'])
      wrap(IDBObjectStore.prototype, m);
    for (const m of ['getAll', 'openCursor', 'get', 'count'])
      wrap(IDBIndex.prototype, m);
    window.__idb = counts;
  });
  await page.goto(BASE + '/missoes');
  await ready(page, 180000);
  await page.waitForTimeout(1500);
  await page
    .getByRole('button', { name: 'Nova missão', exact: true })
    .first()
    .click();
  const form = page.getByRole('dialog', { name: 'Uma nova missão' });
  await form.getByLabel('O que você quer fazer?').fill(`Perfil ${Date.now()}`);
  await form.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await form.waitFor({ state: 'hidden', timeout: 120000 });
  const button = page.getByRole('button', { name: /^Concluir Perfil/ }).first();
  await button.waitFor({ timeout: 120000 });
  await page.waitForTimeout(2000);
  const name = await button.getAttribute('aria-label');
  const cdp = await context.newCDPSession(page);
  await cdp.send('Profiler.enable');
  await cdp.send('Profiler.setSamplingInterval', { interval: 200 });
  await page.evaluate(() => {
    for (const k of Object.keys(window.__idb)) delete window.__idb[k];
  });
  await cdp.send('Profiler.start');
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
  const visible = Date.now() - t0;
  await page.waitForTimeout(3000);
  const { profile } = await cdp.send('Profiler.stop');
  const reads = await page.evaluate(() => ({ ...window.__idb }));
  const out = path.join(RESULTS, `profile-complete-${years}y.cpuprofile`);
  fs.writeFileSync(out, JSON.stringify(profile));
  // Tempo próprio por função (top 25).
  const self = new Map();
  const byId = new Map(profile.nodes.map((n) => [n.id, n]));
  const dt = profile.timeDeltas;
  profile.samples.forEach((id, i) => {
    const n = byId.get(id);
    const f = n.callFrame;
    const key = `${f.functionName || '(anon)'} ${f.url.split('/').pop()}:${f.lineNumber}`;
    self.set(key, (self.get(key) ?? 0) + (dt[i] ?? 0) / 1000);
  });
  const top = [...self]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([k, v]) => `${v.toFixed(0).padStart(6)} ms  ${k}`);
  console.log(
    JSON.stringify({ years, rows, visibleMs: visible, reads }, null, 1),
  );
  console.log(top.join('\n'));
  await context.close();
} finally {
  stop();
  cleanup();
}
