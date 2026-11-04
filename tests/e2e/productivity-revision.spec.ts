import { test, expect, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
const day = '2026-11-02';
async function seed(page: Page, rollover = false) {
  await page.clock.install({
    time: new Date(`${day}T${rollover ? '23:59:00' : '12:00:00'}-03:00`),
  });
  await page.goto('/');
  await expect(page.locator('.today-hero')).toBeVisible();
  await page.evaluate(async (day) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const q = indexedDB.open('LevelMeUpDB');
      q.onsuccess = () => resolve(q.result);
      q.onerror = () => reject(q.error);
    });
    const tasks = [
      {
        id: 101,
        title: 'Objetivo pendente',
        plannedDate: '2026-11-01',
        areaId: 1,
      },
      {
        id: 102,
        title: 'Rotina da origem',
        plannedDate: day,
        plannedTime: '19:30',
        routineId: 'origem',
        areaId: 1,
        recurrence: { kind: 'weekdays', startDate: day, days: [1, 3, 5] },
      },
      {
        id: 103,
        title: 'Rotina do destino',
        plannedDate: day,
        plannedTime: '19:30',
        routineId: 'destino',
        areaId: 2,
        recurrence: { kind: 'weekdays', startDate: day, days: [2, 4] },
      },
      {
        id: 104,
        title: 'Conclusão antiga',
        plannedDate: '2026-11-01',
        completed: true,
        completedAt: '2026-11-01T15:00:00Z',
        completionEventId: 'historical-completion',
        areaId: 1,
      },
      {
        id: 105,
        title: 'Objetivo parcial',
        plannedDate: day,
        areaId: 1,
        tracking: { method: 'time', target: 40 },
      },
    ].map((task) => ({
      xp: 50,
      effort: 'small',
      rarity: 'common',
      productivityVersion: 1,
      completed: false,
      status: 'todo',
      createdAt: `${day}T12:00:00Z`,
      tracking: { method: 'direct' },
      ...task,
    }));
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(
        ['tasks', 'areas', 'routines', 'planVersions', 'activityEvents'],
        'readwrite',
      );
      for (const task of tasks) {
        tx.objectStore('tasks').put(task);
        tx.objectStore('planVersions').put({
          id: `seed:${task.id}`,
          taskId: task.id,
          sequence: 1,
          effectiveFrom: day,
          recordedAt: `${day}T12:00:00Z`,
          definition: task,
        });
      }
      tx.objectStore('areas').put({
        id: 1,
        nome: 'Origem',
        iconKey: 'estudo',
        descricao: 'Metadados da origem',
      });
      tx.objectStore('areas').put({
        id: 2,
        nome: 'Destino',
        iconKey: 'exercicio',
      });
      for (const [id, name, days, taskId] of [
        ['origem', 'Rotina Origem', [1, 3, 5], 102],
        ['destino', 'Rotina Destino', [2, 4], 103],
      ] as const)
        tx.objectStore('routines').put({
          id,
          name,
          days: [...days],
          description: '',
          startDate: day,
          status: 'active',
          entries: [{ taskId, time: '19:30', previousPlan: {} }],
          pauseQuota: 2,
          pausePeriodDays: 30,
          revision: 1,
          createdAt: `${day}T12:00:00Z`,
        });
      tx.objectStore('activityEvents').put({
        id: 'historical-completion',
        kind: 'task',
        sequence: 1,
        taskId: 104,
        taskTitle: 'Conclusão antiga',
        date: '2026-11-01',
        occurredAt: '2026-11-01T15:00:00Z',
        baseXp: 0,
        reward: { xp: 0, gold: 0, food: 0 },
        modifiers: { xpMultiplier: 1, goldMultiplier: 1, foodMultiplier: 1 },
        awardedStages: [],
        ecoClaimedBefore: 1,
        protectionDays: 0,
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    db.close();
  }, day);
  await page.reload();
  await expect(page.locator('.today-hero')).toBeVisible();
}
async function capture(page: Page, name: string, project: string) {
  if (!process.env.LMU_REVISION_CAPTURE_DIR) return;
  await mkdir(process.env.LMU_REVISION_CAPTURE_DIR, { recursive: true });
  await page.screenshot({
    path: join(process.env.LMU_REVISION_CAPTURE_DIR, `${name}-${project}.png`),
    fullPage: true,
  });
}
async function state(page: Page) {
  return page.evaluate(
    () =>
      new Promise<Record<string, any[]>>((resolve, reject) => {
        const q = indexedDB.open('LevelMeUpDB');
        q.onsuccess = () => {
          const db = q.result,
            names = [
              'tasks',
              'occurrences',
              'routines',
              'areas',
              'activityEvents',
              'savedMissionSessions',
              'profile',
            ];
          const tx = db.transaction(names),
            result: Record<string, any[]> = {};
          for (const name of names) {
            const read = tx.objectStore(name).getAll();
            read.onsuccess = () => (result[name] = read.result);
          }
          tx.oncomplete = () => {
            db.close();
            resolve(result);
          };
          tx.onerror = () => reject(tx.error);
        };
        q.onerror = () => reject(q.error);
      }),
  );
}

test('pendências, conclusões de hoje e histórico usam conjuntos distintos', async ({
  page,
}, info) => {
  await seed(page);
  await expect(page.locator('.daily-summary')).toContainText('0 de 3 missões');
  await capture(page, 'hoje', info.project.name);
  await expect(
    page.getByRole('button', { name: 'Objetivo pendente', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(/Atividades de outros dias|Trazer para hoje/),
  ).toHaveCount(0);
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Concluídas', exact: true }).click();
  await expect(
    page
      .getByRole('region', { name: 'Histórico de conclusões' })
      .getByText('Conclusão antiga', { exact: true }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Pendentes', exact: true }).click();
  await page
    .getByRole('button', { name: 'Concluir Objetivo pendente', exact: true })
    .click();
  await page.getByRole('button', { name: 'Concluídas', exact: true }).click();
  await expect(page.locator('.history-row')).toContainText('Objetivo pendente');
  await page.getByRole('button', { name: 'Todas', exact: true }).click();
  await expect(page.locator('.mission-task-row')).toHaveCount(3);
  await page
    .getByRole('button', { name: 'Ferramentas de missões', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Gerenciar áreas', exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Histórico de missões', exact: true })
    .click();
  await expect(
    page.locator('.history-row').filter({ hasText: 'Conclusão antiga' }),
  ).toBeVisible();
  await capture(page, 'historico', info.project.name);
  await page.goto('/revisoes');
  await expect(page).toHaveURL(/view=history/);
  await expect(
    page.getByRole('button', { name: 'Configurar revisão', exact: true }),
  ).toHaveCount(0);
});

test('pulo reversível e dias individuais funcionam na rotina', async ({
  page,
}, info) => {
  await seed(page);
  await page.goto('/missoes?view=routines');
  const card = page
    .locator('.routine-card')
    .filter({ hasText: 'Rotina Origem' });
  await card.getByText('Missões vigentes', { exact: true }).click();
  await card.getByRole('button', { name: 'Pular missão', exact: true }).click();
  await expect(
    card.getByRole('button', { name: 'Desfazer pulo', exact: true }),
  ).toBeVisible();
  const skipped = await state(page);
  expect(skipped.activityEvents).toHaveLength(1);
  await page.goto('/');
  await expect(page.locator('.daily-summary')).toContainText('0 de 2 missões');
  await page.goto('/missoes?view=routines');
  await card.getByText('Missões vigentes', { exact: true }).click();
  await card
    .getByRole('button', { name: 'Desfazer pulo', exact: true })
    .click();
  await card
    .getByRole('button', { name: 'Editar rotina', exact: true })
    .click();
  const entry = page.locator('.routine-sequence > li');
  await entry
    .getByRole('checkbox', { name: 'Usar dias personalizados', exact: true })
    .check();
  for (const label of ['Seg', 'Qua', 'Sex'])
    await entry.getByRole('checkbox', { name: label, exact: true }).uncheck();
  for (const label of ['Ter', 'Qui'])
    await entry.getByRole('checkbox', { name: label, exact: true }).check();
  await capture(page, 'dias-individuais', info.project.name);
  await page
    .getByRole('button', { name: 'Salvar rotina', exact: true })
    .click();
  expect(
    (await state(page)).tasks.find((task) => task.id === 102).recurrence.days,
  ).toEqual([2, 4]);
  await page.reload();
  await card
    .getByRole('button', { name: 'Editar rotina', exact: true })
    .click();
  await expect(
    entry.getByRole('checkbox', { name: 'Ter', exact: true }),
  ).toBeChecked();
});

test('mescla áreas com prévia, confirmação dos conflitos e arquivo da origem', async ({
  page,
}, info) => {
  await seed(page);
  await page.goto('/missoes?view=areas');
  const source = page
    .locator('.area-workspace .area-list > li')
    .filter({ has: page.locator('strong').filter({ hasText: 'Origem' }) });
  await source
    .getByRole('button', { name: 'Mesclar área', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Mesclar áreas',
    exact: true,
  });
  await dialog
    .getByRole('combobox', { name: 'Destino', exact: true })
    .selectOption({ label: 'Destino' });
  await dialog
    .getByRole('button', { name: 'Visualizar resultado', exact: true })
    .click();
  await expect(dialog).toContainText('4 missões');
  await expect(
    dialog.getByRole('button', { name: 'Confirmar mesclagem', exact: true }),
  ).toBeDisabled();
  await dialog.getByRole('checkbox').check();
  await capture(page, 'mesclar-areas', info.project.name);
  await dialog
    .getByRole('button', { name: 'Confirmar mesclagem', exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  const result = await state(page);
  expect(result.areas.find((area) => area.id === 1)).toMatchObject({
    archived: true,
    mergedInto: 2,
  });
  expect(result.tasks.filter((task) => task.areaId === 1)).toHaveLength(0);
  expect(result.activityEvents).toHaveLength(1);
  await expect(source).toHaveCount(0);
});

test('mescla rotinas preservando dias e mantém a configuração individual após recarga', async ({
  page,
}, info) => {
  await seed(page);
  await page.goto('/missoes?view=routines');
  const source = page
    .locator('.routine-card')
    .filter({ hasText: 'Rotina Origem' });
  await source
    .getByRole('button', { name: 'Mesclar rotina', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Mesclar rotinas',
    exact: true,
  });
  await dialog
    .getByRole('combobox', { name: 'Destino', exact: true })
    .selectOption({ label: 'Rotina Destino' });
  await dialog
    .getByRole('button', { name: 'Visualizar resultado', exact: true })
    .click();
  await expect(dialog).toContainText('Seg, Qua, Sex');
  await capture(page, 'mesclar-rotinas', info.project.name);
  await dialog
    .getByRole('button', { name: 'Confirmar mesclagem', exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await page.reload();
  await expect(source).toHaveCount(0);
  await page
    .locator('.routine-card')
    .filter({ hasText: 'Rotina Destino' })
    .getByRole('button', { name: 'Editar rotina', exact: true })
    .click();
  await expect(
    page
      .locator('.routine-sequence > li')
      .filter({ hasText: 'Rotina da origem' })
      .getByRole('checkbox', { name: 'Usar dias personalizados', exact: true }),
  ).toBeChecked();
});

test('virada de dia remove recorrência antiga da sessão sem encerrar a pontual', async ({
  page,
}) => {
  await seed(page, true);
  await page.goto('/missoes');
  await page
    .getByRole('button', { name: 'Selecionar para sessão', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Montar sessão',
    exact: true,
  });
  await dialog
    .getByRole('checkbox', {
      name: 'Incluir Objetivo pendente na sessão',
      exact: true,
    })
    .check();
  await dialog
    .getByRole('checkbox', {
      name: 'Incluir Rotina da origem na sessão',
      exact: true,
    })
    .check();
  await dialog
    .getByRole('button', { name: 'Iniciar sessão', exact: true })
    .click();
  await expect(page).toHaveURL(/\/sessoes$/);
  const before = await state(page);
  await page.clock.fastForward(61_000);
  expect(
    (await state(page)).savedMissionSessions[0].occurrenceIds,
  ).toHaveLength(2);
  await page.clock.fastForward(24 * 60 * 60 * 1000);
  await expect
    .poll(
      async () =>
        (await state(page)).savedMissionSessions[0].occurrenceIds.length,
    )
    .toBe(1);
  const after = await state(page);
  expect(after.savedMissionSessions[0].status).toBe('active');
  expect(after.profile).toEqual(before.profile);
  expect(after.activityEvents).toEqual(before.activityEvents);
  expect(after.occurrences.find((row) => row.taskId === 102).supersededBy).toBe(
    '2026-11-04',
  );
  await page.goto('/missoes');
  await expect(
    page.locator('.mission-task-row').filter({ hasText: 'Objetivo pendente' }),
  ).toContainText('Em sessão');
});

test('pontual pode recomeçar com compensação e sem apagar sua execução parcial', async ({
  page,
}, info) => {
  await seed(page);
  await page.goto('/missoes');
  await page
    .getByRole('link', { name: 'Objetivo parcial', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Registrar progresso parcial', exact: true })
    .click();
  await page
    .getByRole('spinbutton', { name: 'Minutos acumulados realizados' })
    .fill('20');
  await page
    .getByRole('button', { name: 'Registrar progresso', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Confirmar registro', exact: true })
    .click();
  await expect
    .poll(
      async () =>
        (await state(page)).occurrences.find((row) => row.taskId === 105)
          ?.value,
    )
    .toBe(20);
  await page.goto('/missoes');
  await page
    .getByRole('button', { name: 'Ações para Objetivo parcial', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Recomeçar do zero', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Recomeçar missão?',
    exact: true,
  });
  await expect(dialog).toContainText('Compensação');
  await capture(page, 'reinicio', info.project.name);
  await dialog
    .getByRole('button', { name: 'Confirmar reinício', exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  const result = await state(page);
  expect(result.occurrences.find((row) => row.taskId === 105).value).toBe(0);
  expect(result.profile[0].rewardDebt.xp).toBeGreaterThan(0);
});
