import { expect, test, type Page } from '@playwright/test';

// Lote 2 (Dia único): single order of the day, ≈ calculated times, fixed
// time edited on the row, ▲▼ / Alt + ↑↓, conflict and concluded rows in place.
const TODAY = '2026-11-15';

async function seed(page: Page) {
  await page.clock.setFixedTime(new Date(`${TODAY}T10:38:00-03:00`));
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
          const tx = database.transaction(['tasks', 'areas'], 'readwrite');
          tx.objectStore('areas').put({
            id: 5,
            nome: 'Casa',
            domain: 'home',
            ordem: 1,
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
          };
          const tasks = tx.objectStore('tasks');
          tasks.put({
            ...base,
            id: 9301,
            title: 'Dentista',
            plannedTime: '16:00',
            estimatedMinutes: 60,
          });
          tasks.put({
            ...base,
            id: 9302,
            title: 'Organizar documentos',
            estimatedMinutes: 45,
          });
          tasks.put({ ...base, id: 9303, title: 'Pagar conta de luz' });
          tasks.put({
            ...base,
            id: 9304,
            title: 'Alongar',
            plannedTime: '08:00',
            recurrence: { kind: 'daily', startDate: today },
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

const rows = (page: Page) =>
  page
    .locator('.day-list > li:not(.day-conflict)')
    .evaluateAll((items) =>
      items.map(
        (item) =>
          `${item.querySelector('.time')?.textContent?.replace(/\s+/g, ' ').trim()} ${item.querySelector('.title')?.textContent?.trim()}`,
      ),
    );

test('ordem única: horas ≈, mover com ▲▼ e teclado, guardar ao recarregar', async ({
  page,
}) => {
  await seed(page);
  await expect(page.locator('.day-legend')).toContainText(
    '2 itens sem duração (contam 15 min)',
  );
  expect(await rows(page)).toEqual([
    '08:00 · passou Alongar',
    '≈ 10:40 Organizar documentos',
    '≈ 11:25 Pagar conta de luz',
    '16:00 Dentista',
  ]);
  await expect(page.locator('#next-title')).toHaveText('Organizar documentos');

  await page.getByRole('button', { name: 'Reordenar' }).click();
  await page
    .getByRole('button', { name: 'Mover Pagar conta de luz para cima' })
    .click();
  await expect(
    page.getByRole('status').filter({ hasText: 'posição' }),
  ).toHaveText('Pagar conta de luz: posição 2 de 4.');
  await expect(
    page.getByRole('button', { name: 'Mover Pagar conta de luz para cima' }),
  ).toBeFocused();
  expect(await rows(page)).toEqual([
    '08:00 · passou Alongar',
    '≈ 10:40 Pagar conta de luz',
    '≈ 10:55 Organizar documentos',
    '16:00 Dentista',
  ]);
  await page.getByRole('button', { name: 'Pronto' }).click();

  const docs = page.getByRole('button', {
    name: 'Organizar documentos',
    exact: true,
  });
  await docs.focus();
  await page.keyboard.press('Alt+ArrowUp');
  await expect(docs).toBeFocused();
  await expect
    .poll(() => rows(page))
    .toEqual([
      '08:00 · passou Alongar',
      '≈ 10:40 Organizar documentos',
      '≈ 11:25 Pagar conta de luz',
      '16:00 Dentista',
    ]);
  await page.reload();
  await expect(page.locator('.day-list')).toBeVisible();
  await expect
    .poll(() => rows(page), { timeout: 10_000 })
    .toEqual([
      '08:00 · passou Alongar',
      '≈ 10:40 Organizar documentos',
      '≈ 11:25 Pagar conta de luz',
      '16:00 Dentista',
    ]);
});

test('hora na linha: fixar leva ao lugar da hora, avisa conflito e "só hoje" não muda a rotina', async ({
  page,
}) => {
  await seed(page);
  const dentist = page.getByRole('button', {
    name: 'Hora fixa 16:00. Alterar hora de Dentista',
  });
  await dentist.focus();
  await page.keyboard.press('F2');
  const input = page.getByLabel('Hora de Dentista');
  await expect(input).toBeFocused();
  await input.fill('11:00');
  await input.press('Enter');
  await expect(page.locator('.journey-banner')).toHaveText(
    'Hora de “Dentista” fixada em 11:00.',
  );
  await expect(
    page.getByRole('button', {
      name: 'Hora fixa 11:00. Alterar hora de Dentista',
    }),
  ).toBeFocused();
  await expect
    .poll(() => rows(page))
    .toEqual([
      '08:00 · passou Alongar',
      '≈ 10:40 Organizar documentos',
      '11:00 Dentista',
      '≈ 12:00 Pagar conta de luz',
    ]);
  // Every row before the fixed time has a real duration: conflict shown.
  await expect(page.locator('.day-conflict')).toHaveText(
    /Organizar documentos termina às 11:25 e invade Dentista \(11:00\) em 25 min\./,
  );

  // Recurring: "Só hoje" is the default and leaves the mission's time alone.
  await page
    .getByRole('button', {
      name: /Hora fixa 08:00, já passou\. Alterar hora de Alongar/,
    })
    .click();
  await expect(page.getByRole('button', { name: 'Só hoje' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByLabel('Hora de Alongar').fill('17:30');
  await page.getByRole('button', { name: 'Salvar hora' }).click();
  await expect(page.locator('.journey-banner')).toHaveText(
    'Hora de “Alongar” fixada em 17:30, só hoje.',
  );
  const stored = await page.evaluate(
    () =>
      new Promise<{ task: string | null; occurrence: string | null }>(
        (resolve) => {
          const request = indexedDB.open('LevelMeUpDB');
          request.onsuccess = () => {
            const tx = request.result.transaction(['tasks', 'occurrences']);
            const task = tx.objectStore('tasks').get(9304);
            const rows = tx.objectStore('occurrences').getAll();
            tx.oncomplete = () => {
              request.result.close();
              resolve({
                task: task.result.plannedTime,
                occurrence:
                  rows.result.find(
                    (row: { taskId: number }) => row.taskId === 9304,
                  )?.plannedTime ?? null,
              });
            };
          };
        },
      ),
  );
  expect(stored).toEqual({ task: '08:00', occurrence: '17:30' });
});

test('concluída fica no lugar e desfazer pelo círculo devolve a linha', async ({
  page,
}) => {
  await seed(page);
  await page
    .getByRole('button', { name: 'Concluir Organizar documentos' })
    .click();
  const undo = page.getByRole('button', {
    name: 'Desfazer conclusão de Organizar documentos',
  });
  await expect(undo).toBeVisible();
  expect(await rows(page)).toEqual([
    '08:00 · passou Alongar',
    '10:38 Organizar documentos',
    '≈ 10:40 Pagar conta de luz',
    '16:00 Dentista',
  ]);
  await page.getByRole('button', { name: 'Ocultar concluídas (1)' }).click();
  await expect(undo).toHaveCount(0);
  await page.getByRole('button', { name: 'Mostrar concluídas (1)' }).click();
  await undo.click();
  await expect(
    page.getByRole('button', { name: 'Concluir Organizar documentos' }),
  ).toBeVisible();
  await expect(page.locator('.hero-copy')).toContainText('0 de 4 feitos');
});

test('arrastar pela alça muda a ordem no desktop', async ({ page }, info) => {
  test.skip(info.project.name === 'mobile', 'Sem arrastar no toque: ▲▼.');
  await seed(page);
  const handle = page
    .locator('.day-list > li', { hasText: 'Pagar conta de luz' })
    .locator('.handle');
  await page
    .locator('.day-list > li', { hasText: 'Organizar documentos' })
    .hover();
  await handle.dragTo(
    page.locator('.day-list > li', { hasText: 'Organizar documentos' }),
  );
  await expect
    .poll(() => rows(page))
    .toEqual([
      '08:00 · passou Alongar',
      '≈ 10:40 Pagar conta de luz',
      '≈ 10:55 Organizar documentos',
      '16:00 Dentista',
    ]);
});
