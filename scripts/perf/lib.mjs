// Versioned performance meter helpers. Synthetic data only, temporary browser profiles,
// its own port, results outside Git. Never the installed origin (5174) or a real profile.
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
export const PORT = Number(process.env.PERF_PORT ?? 5198);
if (!Number.isInteger(PORT) || PORT < 1024 || PORT > 65535 || PORT === 5174)
  throw new Error(
    'PERF_PORT inválida: use uma porta própria; 5174 é a origem instalada.',
  );
export const BASE = `http://127.0.0.1:${PORT}`;
export const RESULTS = path.join(root, 'perf-results');
const PROFILES = fs.mkdtempSync(path.join(os.tmpdir(), 'lmup-perf-'));
fs.mkdirSync(RESULTS, { recursive: true });

export const median = (values) => {
  const sorted = values.filter((x) => x != null).sort((a, b) => a - b);
  return sorted.length ? sorted[Math.floor(sorted.length / 2)] : null;
};
export const save = (name, data) =>
  fs.writeFileSync(path.join(RESULTS, name), JSON.stringify(data, null, 1));

/** Serves ./build on PORT. Run `npm run build` first. */
export async function startServer() {
  if (!fs.existsSync(path.join(root, 'build', '200.html')))
    throw new Error('Falta o build: rode `npm run build` antes de medir.');
  const child = spawn(process.execPath, ['scripts/serve-static.mjs'], {
    cwd: root,
    env: { ...process.env, LMU_PREVIEW_PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code) =>
      reject(
        new Error(`servidor encerrou (${code}); a porta ${PORT} está livre?`),
      ),
    );
    child.stdout.on(
      'data',
      (chunk) => String(chunk).includes('http://') && resolve(),
    );
  });
  return () => child.kill();
}

export async function open(name, options = {}) {
  const dir = path.join(PROFILES, name);
  fs.rmSync(dir, { recursive: true, force: true });
  const context = await chromium.launchPersistentContext(dir, {
    channel: process.env.LMU_BROWSER_CHANNEL || undefined,
    headless: true,
    viewport: options.viewport ?? { width: 1366, height: 768 },
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    serviceWorkers: 'block',
    acceptDownloads: true,
  });
  await context.addInitScript(() => {
    window.__perf = { lcp: null, longTasks: [], cls: 0 };
    try {
      new PerformanceObserver((list) => {
        const e = list.getEntries().at(-1);
        window.__perf.lcp = { t: e.startTime };
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((list) => {
        for (const e of list.getEntries())
          window.__perf.longTasks.push({ d: e.duration });
      }).observe({ type: 'longtask', buffered: true });
      new PerformanceObserver((list) => {
        for (const e of list.getEntries())
          if (!e.hadRecentInput) window.__perf.cls += e.value;
      }).observe({ type: 'layout-shift', buffered: true });
    } catch {
      /* Observers are optional. */
    }
  });
  return context;
}

export function cleanup() {
  fs.rmSync(PROFILES, { recursive: true, force: true });
}

export async function ready(page, timeout = 90000) {
  await page.waitForFunction(
    () => {
      const m = document.querySelector('main') ?? document.body;
      const t = m.innerText ?? '';
      return (
        t.trim().length > 40 &&
        !/Abrindo|Carregando|Preparando/.test(t.slice(0, 200))
      );
    },
    null,
    { timeout },
  );
  await page.evaluate(
    () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
}

export async function coldLoad(context, route, rate = 1) {
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Performance.enable');
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  if (rate > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate });
  let bytes = 0;
  let requests = 0;
  cdp.on('Network.responseReceived', () => requests++);
  cdp.on('Network.loadingFinished', (e) => (bytes += e.encodedDataLength));
  const t0 = Date.now();
  await page.goto(BASE + route, { waitUntil: 'commit' });
  await ready(page);
  const appReady = Date.now() - t0;
  await page.waitForLoadState('load', { timeout: 120000 }).catch(() => {});
  await page.waitForTimeout(rate > 1 ? 1500 : 700);
  const data = await page.evaluate(() => {
    const p = window.__perf;
    return {
      lcp: p.lcp?.t ?? null,
      cls: p.cls,
      blockingMs: p.longTasks.reduce((a, t) => a + Math.max(0, t.d - 50), 0),
      longestTaskMs: Math.max(0, ...p.longTasks.map((t) => t.d)),
    };
  });
  const heap = (await cdp.send('Performance.getMetrics')).metrics.find(
    (m) => m.name === 'JSHeapUsedSize',
  );
  await page.close();
  return {
    route,
    rate,
    appReady,
    ...data,
    mb: bytes / 1048576,
    requests,
    heapMb: (heap?.value ?? 0) / 1048576,
  };
}

/** Inserts synthetic history directly, with the same shapes the services write. */
export async function seedHistory(page, years, tasks = 8) {
  return page.evaluate(
    async ({ years, tasks }) => {
      const db = await new Promise((res, rej) => {
        const r = indexedDB.open('LevelMeUpDB');
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
      const names = [
        'tasks',
        'occurrences',
        'activityEvents',
        'xpLogs',
        'executionRecords',
        'productivityAudit',
        'planVersions',
      ];
      const tx = db.transaction(names, 'readwrite');
      const s = Object.fromEntries(names.map((n) => [n, tx.objectStore(n)]));
      const iso = (d) => d.toISOString().slice(0, 10);
      const start = new Date();
      start.setDate(start.getDate() - Math.round(365 * years));
      const startKey = iso(start);
      const res = { xp: 100, gold: 50, food: 4 };
      const mods = { xpMultiplier: 1, goldMultiplier: 1, foodMultiplier: 1 };
      for (let t = 1; t <= tasks; t++) {
        const task = {
          id: t,
          title: `Rotina sintética ${t}`,
          xp: 100,
          rarity: 'common',
          completed: false,
          status: 'available',
          createdAt: new Date().toISOString(),
          source: 'personal',
          areaId: 0,
          productivityVersion: 1,
          tracking: { method: 'direct' },
          recurrence: { kind: 'daily', startDate: startKey },
          definitionRevision: 0,
        };
        s.tasks.put(task);
        s.planVersions.put({
          id: `seed:${t}`,
          sequence: 0,
          taskId: t,
          effectiveFrom: startKey,
          recordedAt: new Date().toISOString(),
          definition: task,
        });
      }
      let seq = 1;
      const days = Math.round(365 * years);
      for (let d = 0; d < days; d++) {
        const day = new Date(start);
        day.setDate(start.getDate() + d);
        const key = iso(day);
        const at = `${key}T12:00:00.000Z`;
        for (let t = 1; t <= tasks; t++) {
          const id = `mission:${t}:${key}`;
          const eventId = `progress:seed-${t}-${key}`;
          s.occurrences.put({
            id,
            taskId: t,
            originDate: key,
            plannedDate: key,
            originalTime: null,
            title: `Rotina sintética ${t}`,
            areaId: 0,
            baseXp: 100,
            definitionRevision: 0,
            steps: [],
            checkedSteps: [],
            value: 1,
            actualMinutes: 0,
            due: res,
            status: 'completed',
            revision: 1,
            legacyCompletionOnly: false,
            reconstructed: false,
            createdAt: at,
            tracking: { method: 'direct' },
            modifiers: mods,
            completedAt: at,
            completedLocalDate: key,
            completionEventId: eventId,
          });
          s.activityEvents.put({
            id: eventId,
            kind: 'task',
            sequence: seq++,
            occurredAt: at,
            date: key,
            taskId: t,
            baseXp: 100,
            reward: res,
            grossReward: res,
            modifiers: mods,
            awardedStages: [],
            ecoClaimedBefore: 1,
            protectionDays: 0,
            occurrenceId: id,
            occurrenceDate: key,
            taskTitle: `Rotina sintética ${t}`,
            areaId: 0,
            areaName: 'Geral',
            executionComplete: true,
          });
          s.xpLogs.put({
            date: key,
            amount: 100,
            areaId: 0,
            createdAt: at,
            eventId,
            kind: 'task',
            taskId: t,
            goldDelta: 50,
            foodDelta: 4,
          });
          s.executionRecords.put({
            id: `seed-${t}-${key}`,
            occurrenceId: id,
            before: 0,
            after: 1,
            minutes: 0,
            method: 'direct',
            localDate: key,
            executedAt: at,
            recordedAt: at,
            correction: false,
            revision: 1,
            source: 'individual',
          });
          s.productivityAudit.put({
            id: `progress:seed-${t}-${key}`,
            entityId: id,
            action: 'progress',
            recordedAt: at,
            before: { value: 0 },
            after: { value: 1 },
          });
        }
      }
      await new Promise((r, j) => {
        tx.oncomplete = r;
        tx.onerror = () => j(tx.error);
        tx.onabort = () => j(tx.error);
      });
      db.close();
      return days * tasks;
    },
    { years, tasks },
  );
}
