import { test, expect, type Page, type Locator } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-02T15:00:00-03:00'));
});
async function create(
  page: Page,
  title: string,
  configure?: (form: Locator) => Promise<void>,
) {
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const form = page.getByRole('dialog', {
    name: 'Uma nova missão',
    exact: true,
  });
  await form.getByLabel('O que você quer fazer?').fill(title);
  await configure?.(form);
  await form.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await expect(form).not.toBeVisible();
}
async function advanced(form: Locator) {
  await form.getByLabel('Esforço desta missão').selectOption('medium');
  await form.getByLabel('Recorrência').selectOption('daily');
  await form
    .getByText('Horário, prioridade e acompanhamento', { exact: true })
    .click();
  await form.getByLabel('Início desejado', { exact: true }).fill('19:00');
  await form.getByLabel('Duração estimada (minutos)').fill('45');
  await form.getByLabel('Importância').selectOption('high');
  await form.getByLabel('Acompanhar progresso por').selectOption('time');
  await form.getByLabel('Meta de tempo recompensável (minutos)').fill('40');
}
async function saveTime(page: Page, value: number, correction = false) {
  await page.getByLabel('Minutos acumulados realizados').fill(String(value));
  await page
    .getByLabel('Corrigir registro anterior', { exact: true })
    .setChecked(correction);
  await page
    .getByRole('button', {
      name: correction ? 'Revisar correção' : 'Registrar progresso',
      exact: true,
    })
    .click();
  await page
    .getByRole('button', { name: 'Confirmar registro', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Impacto da alteração' }),
  ).not.toBeVisible();
}
async function stored(page: Page) {
  return page.evaluate(
    () =>
      new Promise<Record<string, any[]>>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const names = [
            'profile',
            'tasks',
            'occurrences',
            'executionRecords',
            'activityEvents',
            'savedMissionSessions',
            'routines',
            'recoverySnapshots',
          ];
          const tx = database.transaction(names, 'readonly'),
            data: Record<string, any[]> = {};
          for (const name of names) {
            const query = tx.objectStore(name).getAll();
            query.onsuccess = () => (data[name] = query.result);
          }
          tx.oncomplete = () => {
            database.close();
            resolve(data);
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
  );
}
test('criação avançada, parcelas, correção, compensação e persistência em outra aba', async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await create(page, 'Inglês por 40 minutos', advanced);
  await page.getByRole('button', { name: 'Agenda', exact: true }).click();
  await page.getByRole('button', { name: 'Dia', exact: true }).click();
  await page
    .getByRole('button', { name: 'Executar agora', exact: true })
    .click();
  await saveTime(page, 10);
  await expect(
    page.getByText('25% · Parcialmente realizada', { exact: true }),
  ).toBeVisible();
  const other = await context.newPage();
  await other.goto(page.url());
  await expect(
    other.getByText('25% · Parcialmente realizada', { exact: true }),
  ).toBeVisible();
  await saveTime(page, 40);
  await expect(
    other.getByText('100% · Concluída', { exact: true }),
  ).toBeVisible();
  await saveTime(page, 20, true);
  const corrected = await stored(page);
  expect(corrected.profile[0].rewardDebt).toEqual({
    xp: 52,
    gold: 25,
    food: 2,
  });
  expect(corrected.profile[0].totalXpEarned).toBe(105);
  await saveTime(page, 40);
  const resumed = await stored(page);
  expect(resumed.profile[0].rewardDebt).toEqual({ xp: 0, gold: 0, food: 0 });
  expect(resumed.profile[0].totalXpEarned).toBe(105);
  await page.reload();
  await expect(
    page.getByText('100% · Concluída', { exact: true }),
  ).toBeVisible();
  await page.goto('/progresso');
  await expect(
    page.getByRole('heading', { name: 'Sua evolução nas atividades' }),
  ).toBeVisible();
  expect(errors).toEqual([]);
  await other.close();
});
test('rotina semanal vira sessão persistente e aceita pausa, retomada e conclusão fora da ordem', async ({
  page,
}) => {
  await create(page, 'Lavar louça');
  await create(page, 'Ler um livro');
  await page.getByRole('button', { name: 'Rotinas', exact: true }).click();
  await page.getByRole('button', { name: 'Nova rotina', exact: true }).click();
  await page
    .getByLabel('Nome da rotina', { exact: true })
    .fill('Noite produtiva');
  await page
    .getByRole('checkbox', { name: 'Lavar louça', exact: true })
    .check();
  await page
    .getByRole('checkbox', { name: 'Ler um livro', exact: true })
    .check();
  await page
    .getByLabel('Horário de Lavar louça', { exact: true })
    .fill('19:00');
  await page
    .getByLabel('Horário de Ler um livro', { exact: true })
    .fill('20:00');
  await page
    .getByRole('button', { name: 'Salvar rotina', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Noite produtiva', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Executar rotina', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Noite produtiva', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Visão geral', exact: true }).click();
  await page
    .getByRole('button', { name: 'Mover Lavar louça para baixo', exact: true })
    .click();
  await page
    .getByRole('complementary', { name: 'Fila de missões' })
    .getByRole('button')
    .filter({ hasText: 'Ler um livro' })
    .click();
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Missão concluída!', exact: true }),
  ).toBeVisible();
  expect(
    (await stored(page)).occurrences.filter(
      (row) => row.status === 'completed',
    ),
  ).toHaveLength(1);
  await page.getByRole('link', { name: 'Pausar sessão', exact: true }).click();
  await page.clock.setFixedTime(new Date('2026-11-03T15:00:00-03:00'));
  await page
    .getByRole('button', { name: 'Sessões salvas', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Retomar sessão', exact: true })
    .click();
  const data = await stored(page);
  expect(data.savedMissionSessions).toHaveLength(1);
  expect(data.savedMissionSessions[0].occurrenceIds).toHaveLength(2);
  expect(data.occurrences.every((row) => row.originDate === '2026-11-02')).toBe(
    true,
  );
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Noite produtiva', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Encerrar sessão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Nenhuma sessão em foco.' }),
  ).toBeVisible();
  expect((await stored(page)).tasks).toHaveLength(2);
});
test('recuperação reagendada convive com a ocorrência do dia sem duplicação', async ({
  page,
}) => {
  await create(page, 'Praticar inglês', advanced);
  await page.clock.setFixedTime(new Date('2026-11-03T15:00:00-03:00'));
  await page
    .getByRole('button', { name: 'Recuperar ocorrências', exact: true })
    .click();
  await page.getByLabel('Consultar ocorrências de').fill('2026-11-02');
  await page
    .getByRole('button', { name: 'Recuperar ocorrência', exact: true })
    .click();
  await page.getByText('Reagendar e organizar', { exact: true }).click();
  await page.getByLabel('Nova data', { exact: true }).fill('2026-11-03');
  await page
    .getByRole('button', { name: 'Reagendar esta ocorrência', exact: true })
    .click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Ocorrência reagendada' }),
  ).toBeVisible();
  await saveTime(page, 40);
  const first = await stored(page);
  expect(first.occurrences[0]).toMatchObject({
    originDate: '2026-11-02',
    plannedDate: '2026-11-03',
    recovered: true,
    status: 'completed',
  });
  await page.goto('/missoes?view=agenda');
  await page.getByRole('button', { name: 'Dia', exact: true }).click();
  await expect(page.locator('.agenda-item')).toHaveCount(2);
  await page
    .getByRole('button', { name: 'Executar agora', exact: true })
    .click();
  await saveTime(page, 40);
  const final = await stored(page);
  expect(
    final.occurrences.filter((row) => row.status === 'completed'),
  ).toHaveLength(2);
  expect(final.profile[0].totalXpEarned).toBe(210);
});
test('upgrade real do navegador preserva banco v5 e cria recuperação antes de usar v6', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const open = indexedDB.open('LevelMeUpDB', 50);
    open.onupgradeneeded = () => {
      const database = open.result;
      const stores: Record<string, string> = {
        profile: '++id',
        tasks:
          '++id, areaId, projectId, status, completed, archived, createdAt, completedAt, reviewEnabled',
        xpLogs: '++id, date, areaId, createdAt, eventId',
        areas: '++id',
        inventory: '++id, key, type, owned, equipped',
        shopItems: '++id, key, type, price',
        ownedShopItems: '++id, itemId',
        companions: '++id, key, rarity, unlocked',
        items: '++id, areaId',
        projects: '++id, status, createdAt, targetDate',
        activityEvents:
          'id, sequence, kind, taskId, projectId, sourceEventId, date',
        recoverySnapshots: 'id, createdAt, reason',
      };
      for (const [name, schema] of Object.entries(stores)) {
        const keys = schema.split(',').map((key) => key.trim()),
          primary = keys.shift()!;
        const store = database.createObjectStore(name, {
          keyPath: primary.replace('++', ''),
          autoIncrement: primary.startsWith('++'),
        });
        for (const key of keys) store.createIndex(key, key);
      }
      open.transaction!.objectStore('profile').put({
        id: 1,
        name: 'Perfil sintético legado',
        level: 3,
        xpCurrent: 227,
        xpNext: 360,
        totalXpEarned: 777,
        gold: 321,
        food: 3,
        currentStreak: 2,
        lastCompletionDate: '2026-11-01',
        activeCompanionId: 1,
        ecoGoldClaimedUpToStage: 1,
      });
      open.transaction!.objectStore('tasks').put({
        id: 77,
        title: 'Missão legada preservada',
        xp: 50,
        rarity: 'common',
        completed: true,
        status: 'completed',
        createdAt: '2026-10-01T12:00:00Z',
        completedAt: '2026-11-01T12:00:00Z',
      });
    };
    open.onsuccess = () => open.result.close();
    open.onerror = () => {};
  });
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Todas', exact: true }).click();
  await expect(
    page.getByRole('link', { name: 'Missão legada preservada', exact: true }),
  ).toBeVisible();
  const data = await stored(page);
  expect(data.profile[0]).toMatchObject({
    name: 'Perfil sintético legado',
    totalXpEarned: 777,
    gold: 321,
    food: 3,
    level: 3,
  });
  expect(data.tasks.find((row) => row.id === 77).completed).toBe(true);
  expect(data.activityEvents).toHaveLength(0);
  expect(
    data.recoverySnapshots.find((row) => row.id === 'migration-v5').data
      .tasks[0].id,
  ).toBe(77);
});
