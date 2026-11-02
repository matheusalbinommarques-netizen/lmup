import { expect, test, type Page } from '@playwright/test';

async function populateTasks(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const tx = database.transaction('tasks', 'readwrite');
          const now = new Date();
          const today = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0'),
          ].join('-');
          for (let i = 0; i < 96; i++)
            tx.objectStore('tasks').put({
              id: 100 + i,
              title: `Atividade real ${i + 1}`,
              xp: 50,
              effort: 'small',
              rarity: 'common',
              status: i % 4 === 0 ? 'completed' : 'todo',
              completed: i % 4 === 0,
              plannedDate: i % 3 === 0 ? today : null,
              createdAt: new Date(now.getTime() - i * 60000).toISOString(),
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
}

test('Home aprovada mantém saudação, três sugestões, destinos e ações sem rolagem interna', async ({
  page,
}, info) => {
  const desktop = info.project.name === 'desktop';
  await page.setViewportSize(
    desktop ? { width: 1536, height: 1024 } : { width: 390, height: 844 },
  );
  await page.clock.setFixedTime(new Date('2026-10-30T19:00:00-03:00'));
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Boa noite.', exact: true }),
  ).toBeVisible();
  await populateTasks(page);
  await expect(page.locator('.day-plan li')).toHaveCount(3);
  await expect(page.locator('.world-card')).toHaveCount(4);
  const boxes = await page
    .locator('.world-card')
    .evaluateAll((nodes) =>
      nodes.map((el) => el.getBoundingClientRect().toJSON()),
    );
  if (desktop)
    expect(
      Math.max(...boxes.map((b) => b.y)) - Math.min(...boxes.map((b) => b.y)),
    ).toBeLessThanOrEqual(1);
  else {
    const action = await page
      .getByRole('button', { name: 'Começar', exact: true })
      .boundingBox();
    const nav = await page
      .getByRole('navigation', { name: 'Navegação móvel', exact: true })
      .boundingBox();
    expect(action!.y + action!.height).toBeLessThan(nav!.y);
  }
  for (const selector of ['.next-mission', '.day-plan'])
    expect(
      await page
        .locator(selector)
        .evaluate((el) => el.scrollHeight - el.clientHeight),
    ).toBeLessThanOrEqual(1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await expect(page.locator('#home-map')).toHaveAttribute('href', '/refugio');
  await expect(
    page.getByRole('link', { name: 'Ver todas as missões', exact: true }),
  ).toHaveAttribute('href', '/missoes');
  await expect(
    page.getByRole('group', { name: 'Filtrar missões da Home' }),
  ).toHaveCount(0);
});

test('prioridade manual persiste, não duplica e volta ao automático ao concluir, arquivar ou excluir', async ({
  page,
}) => {
  await page.goto('/');
  await expect(
    page.getByRole('region', { name: 'Seu personagem', exact: true }),
  ).toBeVisible();
  await populateTasks(page);
  for (const [id, change] of [
    [103, 'completed'],
    [106, 'archived'],
    [109, 'deleted'],
  ] as const) {
    const title = `Atividade real ${id - 99}`;
    await page.getByLabel('Escolher próxima missão').click();
    const picker = page.getByLabel('Manter em destaque');
    await picker.selectOption(String(id));
    await expect(page.locator('#next-title')).toHaveText(title);
    await expect(page.locator('.next-mission')).toContainText(
      'Escolhida por você',
    );
    await expect(
      page.locator('.day-plan .text-action').filter({ hasText: title }),
    ).toHaveCount(0);
    await page.reload();
    await expect(page.locator('#next-title')).toHaveText(title);
    expect(
      await page.evaluate(() => localStorage.getItem('lmup.home-priority.v1')),
    ).toBe(String(id));
    await page.evaluate(
      ({ id, change }) =>
        new Promise<void>((resolve, reject) => {
          const req = indexedDB.open('LevelMeUpDB');
          req.onerror = () => reject(req.error);
          req.onsuccess = () => {
            const db = req.result,
              tx = db.transaction('tasks', 'readwrite'),
              store = tx.objectStore('tasks'),
              get = store.get(id);
            get.onsuccess = () =>
              change === 'deleted'
                ? store.delete(id)
                : store.put({ ...get.result, [change]: true });
            tx.oncomplete = () => {
              db.close();
              resolve();
            };
            tx.onerror = () => reject(tx.error);
          };
        }),
      { id, change },
    );
    await page.reload();
    await expect(page.locator('#next-title')).not.toHaveText(title);
    await expect
      .poll(() =>
        page.evaluate(() => localStorage.getItem('lmup.home-priority.v1')),
      )
      .toBeNull();
  }
  await page.getByLabel('Escolher próxima missão').click();
  await page.getByLabel('Manter em destaque').selectOption('102');
  await expect(page.locator('.next-mission')).toContainText(
    'Escolhida por você',
  );
  await page.getByLabel('Manter em destaque').selectOption('');
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem('lmup.home-priority.v1')),
    )
    .toBeNull();
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  await expect(
    page.getByRole('dialog', { name: 'Uma nova missão' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await page
    .getByRole('link', { name: 'Ver todas as missões', exact: true })
    .click();
  await expect(page).toHaveURL(/\/missoes$/);
});

test('recorrências contam a ocorrência de hoje e não reutilizam etapas antigas nem executam missão futura', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date('2026-10-31T19:00:00-03:00'));
  await page.goto('/');
  await expect(
    page.getByRole('region', { name: 'Seu personagem', exact: true }),
  ).toBeVisible();
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const tx = database.transaction('tasks', 'readwrite');
          const store = tx.objectStore('tasks');
          store.clear();
          const base = {
            xp: 50,
            rarity: 'common',
            effort: 'small',
            createdAt: '2026-10-30T12:00:00Z',
          };
          store.put({
            ...base,
            id: 201,
            title: 'Rotina concluída hoje',
            completed: true,
            recurrence: { kind: 'daily', startDate: '2026-10-30' },
            lastOccurrenceDate: '2026-10-31',
          });
          store.put({
            ...base,
            id: 202,
            title: 'Rotina pausada',
            completed: true,
            executionState: 'paused',
            recurrence: { kind: 'daily', startDate: '2026-10-30' },
            lastOccurrenceDate: '2026-10-30',
            occurrenceSession: '2026-10-30',
            subtasks: ['Primeiro passo', 'Segundo passo'],
            completedSubtasks: [0, 1],
          });
          store.put({
            ...base,
            id: 203,
            title: 'Missão futura',
            plannedDate: '2026-11-01',
          });
          localStorage.setItem('lmup.home-priority.v1', '203');
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
  await expect(page.locator('.daily-summary')).toContainText('1 de 2 missões');
  await expect(page.locator('#next-title')).toHaveText('Rotina pausada');
  await expect(page.locator('.today-plan')).not.toContainText('Missão futura');
  await expect(page.locator('.day-plan li')).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem('lmup.home-priority.v1')),
    )
    .toBeNull();
  await page.getByRole('button', { name: 'Começar', exact: true }).click();
  await expect(page).toHaveURL(/\/missao\/202$/);
  await page
    .getByRole('button', { name: /^(Iniciar|Retomar) missão$/ })
    .click();
  await expect(
    page.getByRole('checkbox', { name: 'Primeiro passo', exact: true }),
  ).not.toBeChecked();
  await expect(
    page.getByRole('checkbox', { name: 'Segundo passo', exact: true }),
  ).not.toBeChecked();
});
