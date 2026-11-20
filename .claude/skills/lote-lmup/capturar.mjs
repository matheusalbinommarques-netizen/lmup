// Capturas da prévia do LMUP sem janela: node capturar.mjs <porta> <saida> [rota ...]
// Rotas sem barra inicial (o Git Bash converte "/x" em caminho do Windows): hoje missoes roda.
// Semeia uma persona sintética numa origem nova. Nunca use a porta 5174.
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const [port, out, ...routesArg] = process.argv.slice(2);
if (!port || !out) {
  console.error('Uso: node capturar.mjs <porta> <saida> [rota ...]');
  process.exit(1);
}
if (port === '5174') throw new Error('A porta 5174 é a instalação pessoal.');
const routes = (routesArg.length ? routesArg : ['hoje']).map((name) => {
  const clean = name.replace(/^.*?:\/[^/]*\//, '').replace(/^\/+/, '');
  return clean === 'hoje' || clean === '' ? '/' : `/${clean}`;
});

async function seed() {
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open('LevelMeUpDB');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  const names = ['tasks', 'planVersions', 'areas', 'profile'];
  const tx = db.transaction(names, 'readwrite');
  const s = Object.fromEntries(names.map((n) => [n, tx.objectStore(n)]));
  const iso = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const daysAgo = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d;
  };
  const start = daysAgo(90);
  const startKey = iso(start);
  const created = start.toISOString();
  [
    [1, 'Saúde', 'health', 'exercicio'],
    [2, 'Mente', 'emotional', 'bem_estar'],
    [4, 'Trabalho', 'career', 'agenda'],
    [5, 'Casa', 'home', 'limpeza'],
    [6, 'Família e amigos', 'relations', 'social'],
    [7, 'Finanças', 'finance', 'pessoal'],
  ].forEach(([id, nome, domain, iconKey], i) =>
    s.areas.put({ id, nome, domain, iconKey, ordem: i + 1 }),
  );
  const base = (extra) => ({
    source: 'personal',
    plannedTime: null,
    estimatedMinutes: null,
    importance: 'normal',
    deadline: null,
    tracking: { method: 'direct' },
    productivityVersion: 1,
    pinned: false,
    subtasks: [],
    description: '',
    projectId: null,
    xp: 50,
    rarity: 'common',
    effort: 'small',
    definitionRevision: 1,
    completed: false,
    status: 'available',
    executionState: 'idle',
    ...extra,
  });
  const put = (task, from) => {
    s.tasks.put(task);
    s.planVersions.put({
      id: `seed:${task.id}`,
      sequence: 1,
      taskId: task.id,
      effectiveFrom: from,
      recordedAt: task.createdAt,
      definition: task,
    });
  };
  const daily = (id, title, areaId, extra = {}) =>
    put(
      base({
        id,
        title,
        areaId,
        plannedDate: startKey,
        recurrence: { kind: 'daily', startDate: startKey },
        createdAt: created,
        updatedAt: created,
        ...extra,
      }),
      startKey,
    );
  daily(1, 'Treino 30 min', 1, { plannedTime: '06:30', estimatedMinutes: 30 });
  daily(2, 'Meditar 10 min', 2, { estimatedMinutes: 10 });
  daily(4, 'Revisar e-mails e planejar o dia', 4, { plannedTime: '08:00' });
  daily(5, 'Arrumar a cozinha', 5);
  daily(6, 'Mandar mensagem para a família', 6);
  for (const [id, title, areaId, createdAgo, plannedAgo, importance] of [
    [8, 'Renovar CNH', 0, 45, 30, 'high'],
    [9, 'Declarar imposto de renda', 7, 40, 20, 'high'],
    [11, 'Marcar dentista', 1, 25, 16, 'normal'],
    [12, 'Organizar o armário', 5, 3, 0, 'normal'],
    [15, 'Ligar para o seguro', 7, 35, 18, 'normal'],
  ]) {
    const at = daysAgo(createdAgo).toISOString();
    put(
      base({
        id,
        title,
        areaId,
        importance,
        plannedDate: iso(daysAgo(plannedAgo)),
        recurrence: null,
        createdAt: at,
        updatedAt: at,
      }),
      iso(daysAgo(createdAgo)),
    );
  }
  const profile = await new Promise((resolve) => {
    const request = s.profile.get(1);
    request.onsuccess = () => resolve(request.result);
  });
  if (profile)
    s.profile.put({
      ...profile,
      name: 'Teste Sintético',
      lifeWheel: {
        version: 1,
        checkins: [],
        focus: {
          relations: { since: daysAgo(40).toISOString() },
          home: { since: daysAgo(40).toISOString() },
        },
      },
    });
  await new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
for (const [name, viewport, mobile] of [
  ['desktop', { width: 1440, height: 900 }, false],
  ['mobile', { width: 390, height: 844 }, true],
]) {
  const context = await browser.newContext({
    viewport,
    isMobile: mobile,
    hasTouch: mobile,
    locale: 'pt-BR',
    serviceWorkers: 'block',
  });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${port}/`);
  await page.waitForLoadState('networkidle');
  await page.evaluate(seed);
  for (const route of routes) {
    await page.goto(`http://127.0.0.1:${port}${route}`);
    await page.waitForLoadState('networkidle');
    const slug =
      route === '/' ? 'hoje' : route.replace(/\W+/g, '-').replace(/^-|-$/g, '');
    await page.screenshot({
      path: `${out}/${name}-${slug}.png`,
      fullPage: true,
    });
  }
  await context.close();
}
await browser.close();
console.log(`Capturas em ${out}`);
