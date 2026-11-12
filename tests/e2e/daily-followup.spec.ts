import { test, expect, type Page } from '@playwright/test';

async function seed(page: Page) {
  await page.clock.setFixedTime(new Date('2026-11-02T15:00:00-03:00'));
  await page.goto('/missoes');
  await expect(
    page.getByRole('button', { name: 'Nova missão', exact: true }),
  ).toBeVisible();
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const tx = database.transaction('tasks', 'readwrite');
          for (const task of [
            {
              id: 9000,
              title: 'Fruta diária',
              recurrence: { kind: 'daily', startDate: '2026-11-02' },
              plannedDate: '2026-11-02',
              plannedTime: '08:00',
            },
            {
              id: 9001,
              title: 'Água diária',
              recurrence: { kind: 'daily', startDate: '2026-11-02' },
              plannedDate: '2026-11-02',
              plannedTime: '09:00',
            },
            { id: 9002, title: 'Organizar ontem', plannedDate: '2026-11-01' },
            { id: 9003, title: 'Revisar ontem', plannedDate: '2026-11-01' },
          ])
            tx.objectStore('tasks').put({
              source: 'personal',
              xp: 10,
              effort: 'micro',
              rarity: 'common',
              completed: false,
              status: 'available',
              createdAt: '2026-11-01T12:00:00.000Z',
              productivityVersion: 1,
              tracking: { method: 'direct' },
              ...task,
            });
          tx.oncomplete = () => {
            database.close();
            resolve();
          };
          tx.onerror = () => {
            database.close();
            reject(tx.error);
          };
        };
      }),
  );
  await page.reload();
  await expect(
    page.locator('.mission-task-row').filter({ hasText: 'Fruta diária' }),
  ).toBeVisible();
}

test('conclusão recorrente sai de Pendentes, mantém histórico e aparece marcada na Agenda', async ({
  page,
}) => {
  await seed(page);
  const row = page
    .locator('.mission-task-row')
    .filter({ hasText: 'Fruta diária' });
  await row.getByLabel('Ações para Fruta diária', { exact: true }).click();
  const menu = page.getByRole('dialog', {
    name: 'Menu: Ações para Fruta diária',
    exact: true,
  });
  const fonts = await menu
    .locator('button, a')
    .evaluateAll((controls) =>
      controls.map((control) => getComputedStyle(control).fontFamily),
    );
  expect(new Set(fonts).size).toBe(1);
  await page.keyboard.press('Escape');
  await row
    .getByRole('button', { name: 'Concluir Fruta diária', exact: true })
    .click();
  await expect(row).toHaveCount(0);
  await expect(page).toHaveURL(/\/missoes/);
  await page.getByRole('tab', { name: 'Todas', exact: true }).click();
  await expect(row).toBeVisible();
  await page.getByRole('tab', { name: 'Concluídas', exact: true }).click();
  await expect(
    page.locator('.history-row').filter({ hasText: 'Fruta diária' }),
  ).toBeVisible();
  await expect(page.locator('.history-period')).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Ferramentas de missões', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Histórico de missões', exact: true })
    .click();
  await expect(page.locator('.history-period')).toContainText(
    'Histórico de execuções',
  );
  for (const label of ['De', 'Até']) {
    const input = page
      .locator('.history-period')
      .getByLabel(label, { exact: true });
    await expect(input).toBeVisible();
    expect(await input.evaluate((el) => getComputedStyle(el).minHeight)).toBe(
      '42px',
    );
    expect((await input.boundingBox())!.width).toBeGreaterThanOrEqual(140);
  }
  await page
    .locator('.history-period')
    .getByLabel('De', { exact: true })
    .fill('2026-11-02');
  await page
    .locator('.history-period')
    .getByLabel('Até', { exact: true })
    .fill('2026-11-02');
  await expect(
    page.locator('.history-row').filter({ hasText: 'Fruta diária' }),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'Agenda', exact: true }).click();
  const agenda = page
    .locator('.occurrence-row')
    .filter({ hasText: 'Fruta diária' });
  await expect(
    agenda.getByLabel('Concluída: Fruta diária', { exact: true }),
  ).toBeVisible();
  await expect(agenda.getByRole('checkbox')).toHaveCount(0);
  await expect(
    page
      .locator('.occurrence-row')
      .filter({ hasText: 'Água diária' })
      .getByRole('checkbox'),
  ).not.toBeChecked();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.clock.setFixedTime(new Date('2026-11-03T15:00:00-03:00'));
  await page.goto('/missoes');
  await expect(
    page.locator('.mission-task-row').filter({ hasText: 'Fruta diária' }),
  ).toBeVisible();
});

test('pendências pontuais entram automaticamente em Hoje e preservam o menu de planejamento', async ({
  page,
}) => {
  await seed(page);
  await page.goto('/');
  await expect(page.locator('.next-mission .context-trigger')).toHaveCount(1);
  await expect(page.locator('.day-plan')).toContainText('Organizar ontem');
  await expect(page.locator('.day-plan')).toContainText('Revisar ontem');
  await expect(
    page.getByRole('button', { name: 'Trazer para hoje', exact: true }),
  ).toHaveCount(0);
  await page.locator('.next-mission .context-trigger').click();
  await page.getByLabel('Manter em destaque').selectOption('9001');
  await page.keyboard.press('Escape');
  await expect(page.locator('.next-mission')).toContainText('Água diária');
  await page.reload();
  await expect(page.locator('.day-plan')).toContainText('Organizar ontem');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});
