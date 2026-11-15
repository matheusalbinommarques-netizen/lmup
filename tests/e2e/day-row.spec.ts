import { expect, test, type Page } from '@playwright/test';

const TODAY = '2026-11-15';

async function seed(page: Page) {
  await page.clock.setFixedTime(new Date(`${TODAY}T09:00:00-03:00`));
  await page.goto('/missoes');
  await expect(
    page.getByRole('button', { name: 'Nova missão', exact: true }),
  ).toBeVisible();
  await page.evaluate(
    (today) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const tx = database.transaction(
            ['tasks', 'areas', 'profile'],
            'readwrite',
          );
          const base = {
            source: 'personal',
            xp: 50,
            effort: 'small',
            rarity: 'common',
            completed: false,
            status: 'available',
            productivityVersion: 1,
            tracking: { method: 'direct' },
            recurrence: null,
            createdAt: `${today}T08:00:00.000Z`,
            plannedDate: today,
          };
          tx.objectStore('areas').put({
            id: 6,
            nome: 'Família',
            domain: 'relations',
            ordem: 1,
          });
          const tasks = tx.objectStore('tasks');
          tasks.put({
            ...base,
            id: 9201,
            title: 'Primeira do dia',
            plannedTime: '06:00',
          });
          tasks.put({
            ...base,
            id: 9202,
            title: 'Ligar para a família',
            areaId: 6,
          });
          tasks.put({
            ...base,
            id: 9203,
            title: 'Renovar CNH',
            importance: 'high',
            createdAt: '2026-10-16T12:00:00.000Z',
            plannedDate: '2026-10-16',
          });
          const profiles = tx.objectStore('profile');
          const get = profiles.get(1);
          get.onsuccess = () => {
            if (get.result)
              profiles.put({
                ...get.result,
                lifeWheel: {
                  version: 1,
                  checkins: [],
                  focus: { relations: { since: `${today}T00:00:00.000Z` } },
                },
              });
          };
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
    TODAY,
  );
  await page.goto('/');
}

test('linha de missão mostra selos, agrupa paradas e conclui com um clique', async ({
  page,
}) => {
  await seed(page);
  const plan = page.locator('.day-plan');
  const family = plan.locator('.day-row', { hasText: 'Ligar para a família' });
  await expect(family).toContainText('Em foco');
  await expect(family).not.toContainText('Parada há');
  const stalled = plan.locator('.stalled');
  await expect(stalled).toContainText('Paradas há mais tempo');
  const cnh = stalled.locator('.day-row', { hasText: 'Renovar CNH' });
  await expect(cnh).toContainText('Parada há 30 dias');
  await expect(cnh).toContainText('Importância alta');
  await expect(page.locator('.hero-copy')).toContainText('0 de 3 feitos');
  await expect(page.locator('.hero-copy')).not.toContainText('seu futuro');

  await family
    .getByRole('button', { name: 'Concluir Ligar para a família' })
    .click();
  const toast = page.locator('.undo-toast');
  await expect(toast).toContainText('“Ligar para a família” concluída.');
  // Lote 2: the concluded row stays in its place in the day.
  await expect(
    plan.getByRole('button', {
      name: 'Desfazer conclusão de Ligar para a família',
    }),
  ).toBeVisible();
  await expect(page.locator('.hero-copy')).toContainText('1 de 3 feitos');

  await toast.getByRole('button', { name: 'Desfazer' }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'desfeita' }),
  ).toBeVisible();
  await expect(
    plan.getByRole('button', { name: 'Concluir Ligar para a família' }),
  ).toBeVisible();
  await expect(page.locator('.hero-copy')).toContainText('0 de 3 feitos');
});

test('criar outra missão em seguida não perde o que foi digitado', async ({
  page,
}) => {
  await seed(page);
  await page.getByRole('button', { name: 'Nova missão' }).first().click();
  const title = page.getByRole('textbox', { name: 'O que você quer fazer?' });
  await title.fill('Separar roupa suja');
  // Type the next title in the same task as the click, while the first save
  // is still awaiting IndexedDB: this is the race users hit when typing fast.
  await page.evaluate(() => {
    const input = document.activeElement as HTMLInputElement;
    const button = [...document.querySelectorAll('button')].find(
      (item) => item.textContent?.trim() === 'Salvar e criar outra',
    )!;
    button.click();
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )!.set!.call(input, 'Lavar a louça');
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(
    page.getByText(
      'Missão “Separar roupa suja” criada. Pronta para a próxima.',
    ),
  ).toBeVisible();
  await expect(title).toHaveValue('Lavar a louça');
  await title.press('Enter');
  await expect(
    page.getByText('Missão “Lavar a louça” criada. Pronta para a próxima.'),
  ).toBeVisible();
  const titles = await page.evaluate(
    () =>
      new Promise<string[]>((resolve) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onsuccess = () => {
          const all = request.result
            .transaction('tasks')
            .objectStore('tasks')
            .getAll();
          all.onsuccess = () => {
            request.result.close();
            resolve(all.result.map((task: { title: string }) => task.title));
          };
        };
      }),
  );
  expect(titles).toContain('Separar roupa suja');
  expect(titles).toContain('Lavar a louça');
});
