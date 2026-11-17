import { expect, test, type Page } from '@playwright/test';
import { legacySession } from './legacy-session';

// Sábado, 14 de novembro de 2026 (design P3); a Faxina é de dias úteis.
const TODAY = '2026-11-14';

async function seed(page: Page) {
  await page.clock.setFixedTime(new Date(`${TODAY}T10:00:00-03:00`));
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
          const tx = database.transaction(['tasks', 'routines'], 'readwrite');
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
            plannedDate: today,
            plannedTime: null,
            estimatedMinutes: null,
            createdAt: `${today}T08:00:00.000Z`,
          };
          const tasks = tx.objectStore('tasks');
          tasks.put({ ...base, id: 9501, title: 'Pagar conta de luz' });
          tasks.put({ ...base, id: 9502, title: 'Ler 20 páginas' });
          tasks.put({
            ...base,
            id: 9503,
            title: 'Buscar Ana na escola',
            plannedTime: '13:30',
            estimatedMinutes: 30,
          });
          const weekdays = {
            kind: 'weekdays',
            startDate: today,
            days: [1, 2, 3, 4, 5],
          };
          const routineTask = {
            ...base,
            routineId: 'faxina',
            recurrence: weekdays,
          };
          tasks.put({
            ...routineTask,
            id: 9504,
            title: 'Varrer a casa',
            estimatedMinutes: 20,
          });
          tasks.put({ ...routineTask, id: 9505, title: 'Limpar o banheiro' });
          tasks.put({
            ...routineTask,
            id: 9506,
            title: 'Trocar a roupa de cama',
          });
          tx.objectStore('routines').put({
            id: 'faxina',
            name: 'Faxina',
            description: '',
            defaultAreaId: 0,
            days: [1, 2, 3, 4, 5],
            startDate: today,
            status: 'active',
            entries: [9504, 9505, 9506].map((taskId) => ({
              taskId,
              time: null,
              previousPlan: {},
            })),
            pauseQuota: 2,
            pausePeriodDays: 30,
            revision: 1,
            createdAt: `${today}T08:00:00.000Z`,
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
  await expect(page.locator('.day-list')).toContainText('Buscar Ana na escola');
}

const dayTitles = (page: Page) =>
  page.locator('.day-list li[data-day-row] .title').allInnerTexts();

test('Inserir bloco traz a rotina para hoje, depois da missão escolhida e só hoje', async ({
  page,
}) => {
  await seed(page);
  expect(await dayTitles(page)).not.toContain('Varrer a casa');
  await page
    .getByRole('button', { name: 'Inserir bloco de rotina', exact: true })
    .click();
  const panel = page.getByRole('dialog', { name: 'Inserir bloco' });
  await expect(panel.getByRole('radio', { name: /Faxina/ })).toBeChecked();
  await panel
    .getByRole('checkbox', { name: /Trocar a roupa de cama/ })
    .uncheck();
  await panel.getByRole('radio', { name: /Depois de/ }).check();
  await panel
    .getByRole('combobox', { name: 'Depois de qual missão' })
    .selectOption('mission:9501:once');
  await expect(panel.getByRole('status')).toContainText(
    'Fica antes de Buscar Ana na escola (13:30).',
  );
  await panel
    .getByRole('button', { name: 'Inserir 2 itens', exact: true })
    .click();
  await expect(panel).not.toBeVisible();
  await expect(page.locator('.journey-banner')).toContainText(
    'Faxina entrou no Dia: 2 itens, só hoje.',
  );
  const expected = [
    'Pagar conta de luz',
    'Varrer a casa',
    'Limpar o banheiro',
    'Ler 20 páginas',
    'Buscar Ana na escola',
  ];
  await expect.poll(() => dayTitles(page)).toEqual(expected);
  await page.reload();
  await expect.poll(() => dayTitles(page)).toEqual(expected);
  // The block header of the routine appears in the Dia.
  await expect(page.locator('.block-head')).toContainText('Faxina');

  // From a row's ⋯: the panel opens after that row; inserted items are taken.
  await page
    .getByRole('button', {
      name: 'Mais ações para Ler 20 páginas',
      exact: true,
    })
    .click();
  await page
    .getByRole('button', { name: 'Inserir bloco depois desta', exact: true })
    .click();
  await expect(panel.getByRole('radio', { name: /Depois de/ })).toBeChecked();
  await expect(
    panel.getByRole('combobox', { name: 'Depois de qual missão' }),
  ).toHaveValue('mission:9502:once');
  await expect(
    panel.getByRole('checkbox', { name: /Varrer a casa/ }),
  ).toBeDisabled();
  await expect(panel).toContainText('já no Dia');
  await expect(
    panel.getByRole('button', { name: 'Inserir 1 item', exact: true }),
  ).toBeEnabled();
  await panel.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(panel).not.toBeVisible();

  // The routine itself and its days did not change.
  const routine = await page.evaluate(
    () =>
      new Promise<{ days: number[]; revision: number }>((resolve) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onsuccess = () => {
          const read = request.result
            .transaction('routines')
            .objectStore('routines')
            .get('faxina');
          read.onsuccess = () => {
            request.result.close();
            resolve(read.result);
          };
        };
      }),
  );
  expect(routine).toMatchObject({ days: [1, 2, 3, 4, 5], revision: 1 });
  const width = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth,
    view: innerWidth,
  }));
  expect(width.page).toBeLessThanOrEqual(width.view);
});

test('Salvar como rotina abre o editor com as missões da sessão, sem horário', async ({
  page,
}) => {
  await seed(page);
  await legacySession(page, ['Pagar conta de luz', 'Ler 20 páginas']);
  await page
    .getByRole('button', { name: 'Salvar como rotina', exact: true })
    .click();
  await expect(page).toHaveURL(/view=routines$/);
  const form = page.locator('.routine-form');
  await expect(form).toBeVisible();
  await expect(form.getByLabel('Nome da rotina', { exact: true })).toHaveValue(
    'Sessão de Missões',
  );
  await expect(form.getByRole('status')).toContainText(
    'Missões da sessão “Sessão de Missões”, sem horário.',
  );
  const sequence = form.locator('.routine-sequence');
  await expect(sequence).toContainText('Pagar conta de luz');
  await expect(sequence).toContainText('Ler 20 páginas');
  await form.getByLabel('Nome da rotina', { exact: true }).fill('Manhã');
  await form
    .getByRole('button', { name: 'Salvar rotina', exact: true })
    .click();
  await expect(form).not.toBeVisible();
  await expect(
    page.locator('.routine-card').filter({ hasText: 'Manhã' }),
  ).toContainText('2 atividades');
  // The session stays in the history.
  await page.goto('/missoes?view=sessions');
  await expect(page.locator('.saved-session-card')).toHaveCount(1);
});
