import { expect, test, type Page } from '@playwright/test';
import { openQueue, skipForLater } from './execution';

// Lote 3 (Dia único): one execution screen, optional timer, queues that are
// slices of the Dia ("Iniciar dia", "Iniciar bloco") and fixed verbs.
const TODAY = '2026-11-15';

async function seed(page: Page) {
  await page.clock.install({ time: new Date(`${TODAY}T10:00:00-03:00`) });
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
            ['tasks', 'areas', 'routines'],
            'readwrite',
          );
          tx.objectStore('areas').put({
            id: 5,
            nome: 'Conhecimento',
            domain: 'knowledge',
            ordem: 1,
          });
          tx.objectStore('routines').put({
            id: 'r-ingles',
            name: 'Estudo de inglês',
            description: '',
            days: [0, 1, 2, 3, 4, 5, 6],
            startDate: today,
            status: 'active',
            entries: [9401, 9402, 9403].map((taskId) => ({
              taskId,
              time: null,
              previousPlan: {},
            })),
            pauseQuota: 0,
            pausePeriodDays: 7,
            revision: 1,
            createdAt: `${today}T08:00:00.000Z`,
          });
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
            areaId: 5,
            subtasks: [],
          };
          const tasks = tx.objectStore('tasks');
          const daily = { kind: 'daily', startDate: today };
          tasks.put({
            ...base,
            id: 9401,
            title: 'Revisão no Anki',
            estimatedMinutes: 15,
            recurrence: daily,
            routineId: 'r-ingles',
          });
          tasks.put({
            ...base,
            id: 9402,
            title: 'Aula 2 do curso',
            estimatedMinutes: 40,
            recurrence: daily,
            routineId: 'r-ingles',
            subtasks: ['Assistir', 'Anotar'],
            tracking: { method: 'steps' },
          });
          tasks.put({
            ...base,
            id: 9403,
            title: 'Ler um conto',
            recurrence: daily,
            routineId: 'r-ingles',
          });
          tasks.put({
            ...base,
            id: 9404,
            title: 'Pagar conta de luz',
            plannedTime: '18:00',
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
    TODAY,
  );
  await page.goto('/');
}

test('bloco: fila do Dia, cronômetro que sobrevive à recarga, concluir e desfazer', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await seed(page);

  await expect(page.locator('.block-head')).toContainText('Estudo de inglês');
  await expect(
    page.getByRole('button', { name: 'Iniciar dia', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Iniciar bloco', exact: true })
    .click();
  await expect(page).toHaveURL(/\/executar\/.+\?fila=bloco$/);
  await expect(
    page.getByText(/Bloco\s+Estudo de inglês · 1 de 3/),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Revisão no Anki' }),
  ).toBeVisible();
  const queue = page.getByRole('complementary', { name: 'Fila deste bloco' });
  await openQueue(page);
  await expect(queue.getByRole('listitem')).toHaveCount(3);

  // The timer starts off; it is optional and survives a reload.
  await expect(page.getByText('Cronômetro desligado.')).toBeVisible();
  await page
    .getByRole('button', { name: 'Ligar cronômetro', exact: true })
    .click();
  await page.clock.runFor(90_000);
  await expect(page.getByText('01:30', { exact: true })).toBeVisible();
  await page.reload();
  await page.clock.runFor(30_000);
  await expect(page.getByText(/^02:\d\d$/)).toBeVisible();

  // Concluding stores the real start and the measured minutes.
  await page.keyboard.press('Control+Enter');
  await expect(
    page.getByText(/Revisão no Anki concluída\. \+\d+ XP/),
  ).toBeVisible();
  await expect(page.getByText(/A seguir · ≈ \d\d:\d\d · 40 min/)).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Aula 2 do curso' }),
  ).toBeVisible();
  const record = await page.evaluate(
    () =>
      new Promise<{ minutes: number; startedAt?: string }>((resolve) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onsuccess = () => {
          const read = request.result
            .transaction('executionRecords')
            .objectStore('executionRecords')
            .getAll();
          read.onsuccess = () => resolve(read.result[0]);
        };
      }),
  );
  expect(record.minutes).toBeGreaterThanOrEqual(2);
  expect(record.minutes).toBeLessThan(2.5);
  // The real start is the moment the timer was turned on (fake clock).
  const started = Date.parse(record.startedAt!);
  const opened = Date.parse(`${TODAY}T10:00:00-03:00`);
  expect(started - opened).toBeGreaterThanOrEqual(0);
  expect(started - opened).toBeLessThan(60_000);

  // Undo turns the reward into debt and brings the mission back.
  await page.getByRole('button', { name: 'Desfazer', exact: true }).click();
  await expect(page.getByText(/Conclusão desfeita/)).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Concluir', exact: true }),
  ).toBeVisible();
  await page.keyboard.press('Control+Enter');
  await page.getByRole('link', { name: 'Iniciar', exact: true }).click();
  await expect(page).toHaveURL(/fila=bloco$/);
  await expect(page.getByText(/· 2 de 3/)).toBeVisible();

  // Steps: Concluir waits for every step; each check is saved at once.
  await expect(
    page.getByRole('button', { name: 'Concluir', exact: true }),
  ).toBeDisabled();
  await page.getByRole('checkbox', { name: 'Assistir' }).check();
  await page.reload();
  await expect(page.getByRole('checkbox', { name: 'Assistir' })).toBeChecked();
  await page.getByRole('checkbox', { name: 'Anotar' }).check();
  await expect(
    page.getByRole('button', { name: 'Concluir', exact: true }),
  ).toBeEnabled();

  await page.getByRole('link', { name: '← Dia' }).click();
  await expect(
    page.getByRole('button', { name: 'Continuar o dia', exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test('mover na fila muda o Dia; pular não muda a ordem', async ({ page }) => {
  await seed(page);
  await page.getByRole('button', { name: 'Iniciar dia', exact: true }).click();
  await expect(page).toHaveURL(/fila=dia$/);
  const queue = page.getByRole('complementary', { name: 'Fila do dia' });
  await openQueue(page);
  await expect(
    queue.getByText('Mudar a ordem aqui muda o Dia.', { exact: false }),
  ).toBeVisible();
  await queue
    .getByRole('button', { name: 'Mover Ler um conto para cima', exact: true })
    .click();
  await expect(queue.getByRole('listitem').nth(1)).toContainText(
    'Ler um conto',
  );

  await skipForLater(page);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Ler um conto' }),
  ).toBeVisible();
  await openQueue(page);
  await expect(queue.getByRole('listitem').nth(1)).toContainText(
    'Ler um conto',
  );

  await page.goto('/');
  await expect(page.locator('.day-list .title').first()).toBeVisible();
  const titles = await page.locator('.day-list .title').allTextContents();
  expect(titles.map((t) => t.trim()).slice(0, 3)).toEqual([
    'Revisão no Anki',
    'Ler um conto',
    'Aula 2 do curso',
  ]);
});

test('missão avulsa: sem fila, mostra a próxima do Dia e nada começa sozinho', async ({
  page,
}) => {
  await seed(page);
  await page
    .getByRole('button', { name: 'Pagar conta de luz', exact: true })
    .click();
  await expect(page).toHaveURL(/\/executar\/[^?]+$/);
  await expect(page.getByText('Missão avulsa', { exact: true })).toBeVisible();
  await expect(page.getByRole('complementary')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Pular para depois', exact: true }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Concluir', exact: true }).click();
  await expect(
    page.getByText('Nada começa sozinho.', { exact: false }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/executar\/[^?]+$/);
});
