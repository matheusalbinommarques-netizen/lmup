import { test, expect, type Page } from '@playwright/test';
import { chooseTracking } from './mission-form';

async function create(page: Page, title: string, partial = false) {
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const form = page.getByRole('dialog', {
    name: 'Uma nova missão',
    exact: true,
  });
  await form.getByLabel('O que você quer fazer?').fill(title);
  if (partial) {
    await form
      .getByRole('tab', { name: 'Acompanhamento', exact: true })
      .click();
    await chooseTracking(form, 'time');
    await form.getByLabel('Meta de tempo recompensável (minutos)').fill('10');
  }
  await form.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await expect(form).not.toBeVisible();
}
async function start(page: Page, titles: string[]) {
  await page
    .getByRole('button', { name: 'Selecionar para sessão', exact: true })
    .click();
  const selector = page.getByRole('dialog', {
    name: 'Montar sessão',
    exact: true,
  });
  for (const title of titles)
    await selector
      .getByRole('checkbox', {
        name: `Incluir ${title} na sessão`,
        exact: true,
      })
      .check();
  await selector
    .getByRole('button', { name: 'Iniciar sessão', exact: true })
    .click();
  await expect(page).toHaveURL(/\/sessoes$/);
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Sessão de Missões',
      exact: true,
    }),
  ).toBeVisible();
}
async function capture(page: Page, screen: string, project: string) {
  if (!process.env.LMU_SESSION_CAPTURE_DIR) return;
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.screenshot({
    path: `${process.env.LMU_SESSION_CAPTURE_DIR}/${project}-${screen}.png`,
    fullPage: false,
  });
}
async function state(page: Page) {
  return page.evaluate(
    () =>
      new Promise<Record<string, any[]>>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result,
            names = [
              'savedMissionSessions',
              'occurrences',
              'tasks',
              'activityEvents',
              'profile',
              'executionRecords',
            ];
          const tx = database.transaction(names);
          const data: Record<string, any[]> = {};
          for (const name of names) {
            const q = tx.objectStore(name).getAll();
            q.onsuccess = () => (data[name] = q.result);
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
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
}

test('aba direta, inclusão no fim, pausa e encerramento liberam pendências sem perda de progresso', async ({
  page,
}, info) => {
  for (const name of ['Primeira', 'Segunda', 'Nova atividade'])
    await create(page, name);
  await capture(page, 'lista', info.project.name);
  await start(page, ['Primeira', 'Segunda']);
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(page.locator('.session-progress')).toContainText(
    '1 de 2 concluídas',
  );
  const before = await state(page);
  await page
    .getByRole('button', { name: '+ Adicionar missões', exact: true })
    .click();
  const add = page.getByRole('dialog', {
    name: 'Adicionar missões à sessão',
    exact: true,
  });
  await expect(
    add.getByRole('checkbox', {
      name: 'Incluir Segunda na sessão',
      exact: true,
    }),
  ).toHaveCount(0);
  await add
    .getByRole('checkbox', {
      name: 'Incluir Nova atividade na sessão',
      exact: true,
    })
    .check();
  await capture(page, 'adicionar', info.project.name);
  await add
    .getByRole('button', { name: 'Adicionar 1 missão', exact: true })
    .click();
  await expect(add).not.toBeVisible();
  await expect(page.locator('.session-progress')).toContainText(
    '1 de 3 concluídas',
  );
  await expect(page.locator('.activity-panel')).toContainText('Segunda');
  const added = await state(page);
  expect(added.savedMissionSessions[0].occurrenceIds.slice(0, 2)).toEqual(
    before.savedMissionSessions[0].occurrenceIds,
  );
  expect(added.savedMissionSessions[0].cursor).toBe(
    before.savedMissionSessions[0].cursor,
  );
  expect(added.activityEvents).toEqual(before.activityEvents);
  expect(added.profile).toEqual(before.profile);
  await capture(page, 'execucao', info.project.name);
  await page
    .getByRole('button', { name: 'Pausar sessão', exact: true })
    .click();
  await expect(page).toHaveURL(/view=sessions/);
  await expect(
    page.getByRole('tab', { name: 'Sessões ativas', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
  const card = page.locator('.saved-session-card');
  await expect(card).toContainText('Pausada');
  await capture(page, 'ativas', info.project.name);
  await card.getByRole('button', { name: 'Retomar', exact: true }).click();
  await page
    .getByRole('button', { name: 'Encerrar sessão', exact: true })
    .click();
  await expect(
    page.getByRole('dialog', { name: 'Encerrar sessão?', exact: true }),
  ).toHaveCount(0);
  await expect(page).toHaveURL(/\/missoes$/);
  await expect(
    page.locator('.mission-task-row').filter({ hasText: 'Segunda' }),
  ).toBeVisible();
  await expect(
    page.locator('.mission-task-row').filter({ hasText: 'Nova atividade' }),
  ).toBeVisible();
  const closed = await state(page);
  expect(closed.savedMissionSessions[0]).toMatchObject({
    status: 'ended',
    occurrenceIds: [],
    cursor: 0,
  });
  expect(closed.activityEvents).toEqual(before.activityEvents);
  expect(closed.profile).toEqual(before.profile);
  await page.reload();
  await start(page, ['Segunda', 'Nova atividade']);
  const resumed = await state(page);
  expect(
    resumed.savedMissionSessions.filter((s) => s.status === 'active')[0].id,
  ).not.toBe(closed.savedMissionSessions[0].id);
  await noOverflow(page);
});

test('última conclusão mostra resumo, encerra de fato e não oferece retomar', async ({
  page,
}, info) => {
  await create(page, 'Final');
  await start(page, ['Final']);
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Sessão concluída', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: '+ Adicionar missões', exact: true }),
  ).toHaveCount(0);
  await capture(page, 'concluida', info.project.name);
  const closed = await state(page);
  expect(closed.savedMissionSessions[0]).toMatchObject({
    status: 'ended',
    closedReason: 'completed',
    occurrenceIds: [],
  });
  await page
    .getByRole('link', { name: 'Voltar às missões', exact: true })
    .last()
    .click();
  await page.getByRole('tab', { name: 'Sessões ativas', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Nenhuma sessão ativa', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.saved-session-card')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.saved-session-card')).toHaveCount(0);
  expect((await state(page)).profile).toEqual(closed.profile);
  await noOverflow(page);
});

test('sessão encerrada em outra aba não pode receber missões e organização antiga redireciona', async ({
  page,
  context,
}) => {
  await create(page, 'Reservada');
  await create(page, 'Livre');
  await start(page, ['Reservada']);
  const other = await context.newPage();
  await other.goto('/missoes?view=sessions');
  await page
    .getByRole('button', { name: '+ Adicionar missões', exact: true })
    .click();
  const add = page.getByRole('dialog', {
    name: 'Adicionar missões à sessão',
    exact: true,
  });
  await add
    .getByRole('checkbox', { name: 'Incluir Livre na sessão', exact: true })
    .check();
  await other
    .locator('.saved-session-card')
    .getByRole('button', { name: 'Encerrar sessão', exact: true })
    .click();
  await expect(add).not.toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Nenhuma sessão em foco.', exact: true }),
  ).toBeVisible();
  await page.goto('/arquivo/missoes');
  await expect(page).toHaveURL(/\/missoes$/);
  await expect(
    page.getByRole('link', { name: 'Organização avançada', exact: true }),
  ).toHaveCount(0);
  await expect(page.locator('.mission-task-row')).toHaveCount(2);
});
