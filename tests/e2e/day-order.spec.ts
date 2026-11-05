import { expect, test, type Locator, type Page } from '@playwright/test';

const TASKS = [
  { id: 9100, title: 'Ler às dez', plannedTime: '10:15' },
  { id: 9101, title: 'Caminhar cedo', plannedTime: '07:30' },
  { id: 9102, title: 'Responder e-mails', plannedTime: '09:00' },
  { id: 9103, title: 'Acordar e alongar', plannedTime: '06:30' },
];
const BY_TIME = [
  'Acordar e alongar',
  'Caminhar cedo',
  'Responder e-mails',
  'Ler às dez',
];

async function seed(page: Page, tasks: typeof TASKS) {
  await page.clock.setFixedTime(new Date('2026-11-02T05:00:00-03:00'));
  await page.goto('/missoes');
  await expect(
    page.getByRole('button', { name: 'Nova missão', exact: true }),
  ).toBeVisible();
  await page.evaluate(
    (tasks) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const tx = database.transaction('tasks', 'readwrite');
          for (const task of tasks)
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
              recurrence: { kind: 'daily', startDate: '2026-11-02' },
              plannedDate: '2026-11-02',
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
    tasks,
  );
}
// Visual order, independent of markup: sort the titles by their position.
async function visualOrder(scope: Locator, titles: string[]) {
  const rows = await Promise.all(
    titles.map(async (title) => ({
      title,
      y: (await scope.getByText(title, { exact: true }).first().boundingBox())!
        .y,
    })),
  );
  return rows.sort((a, b) => a.y - b.y).map((row) => row.title);
}

test('Plano do dia e Agenda seguem a ordem dos horários', async ({ page }) => {
  await seed(page, TASKS);
  await page.goto('/');
  const plan = page.locator('.today-plan');
  await expect(plan.getByText('Ler às dez', { exact: true })).toBeVisible();
  expect(await visualOrder(plan, BY_TIME)).toEqual(BY_TIME);

  await page.goto('/missoes?view=agenda');
  const timeline = page.locator('.timeline');
  await expect(
    timeline.getByText('Ler às dez', { exact: true }).first(),
  ).toBeVisible();
  expect(await visualOrder(timeline, BY_TIME)).toEqual(BY_TIME);
});

test('contagem do Plano do dia concorda com o número', async ({ page }) => {
  await seed(page, TASKS.slice(0, 1));
  await page.goto('/');
  await expect(page.locator('.today-plan')).toContainText(
    'Plano do dia (1 missão)',
  );
});
