import { expect, test, type Page } from '@playwright/test';

// Segunda, 16 de novembro de 2026.
const TODAY = '2026-11-16';

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
          const tx = database.transaction(['tasks'], 'readwrite');
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
            plannedDate: null,
            plannedTime: null,
            estimatedMinutes: null,
            createdAt: `${today}T08:00:00.000Z`,
          };
          const tasks = tx.objectStore('tasks');
          tasks.put({
            ...base,
            id: 9401,
            title: 'Reunião de equipe',
            plannedDate: '2026-11-17',
            plannedTime: '09:00',
            estimatedMinutes: 60,
          });
          tasks.put({
            ...base,
            id: 9402,
            title: 'Responder contador',
            plannedDate: '2026-11-17',
          });
          tasks.put({
            ...base,
            id: 9403,
            title: 'Consertar a torneira',
            plannedDate: '2026-11-18',
          });
          tasks.put({ ...base, id: 9404, title: 'Comprar presente da Ana' });
          tasks.put({
            ...base,
            id: 9405,
            title: 'Meditar',
            plannedDate: today,
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
  await page.goto('/missoes?view=agenda');
  await expect(
    page.getByRole('heading', { name: 'Próximos 7 dias' }),
  ).toBeVisible();
}

/** No celular, um dia aberto por vez: abre o dia se estiver recolhido. */
async function day(page: Page, label: string) {
  const region = page.getByRole('region', { name: label, exact: true });
  const toggle = region.locator('.fold-toggle');
  if (
    (await toggle.count()) &&
    (await toggle.getAttribute('aria-expanded')) === 'false'
  )
    await toggle.click();
  return region;
}

test('Semana mostra sete dias, soma só durações reais e recolhe recorrentes', async ({
  page,
}) => {
  await seed(page);
  await expect(page.getByText('16 a 22 de novembro')).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Semana' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  const tomorrow = await day(page, 'Amanhã');
  await expect(tomorrow).toContainText('2 pendentes · 1 h com duração · 1 sem');
  await expect(tomorrow.getByRole('listitem')).toHaveText([
    /09:00\s*Reunião de equipe\s*1 h/,
    /sem hora\s*Responder contador\s*15 min\*/,
  ]);
  // A caixa de entrada não entra na Semana.
  await expect(
    page.locator('.week').getByText('Comprar presente da Ana'),
  ).toHaveCount(0);
  await expect(page.getByText('1 na caixa')).toBeVisible();

  const today = await day(page, 'Hoje');
  await expect(today).toContainText('1 recorrente');
  await expect(today.getByText('Meditar')).toHaveCount(0);
  await page.getByRole('button', { name: 'Mostrar rotinas' }).click();
  await expect(today.getByText('Meditar')).toBeVisible();
});

test('mover pelo ⋯, voltar para Sem dia e reordenar', async ({ page }) => {
  await seed(page);
  const wednesday = await day(page, 'Quarta, 18 nov.');
  await wednesday
    .getByRole('button', { name: 'Mais ações para Consertar a torneira' })
    .click();
  await page.getByRole('button', { name: /^Sexta, 20 nov\./ }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'foi para' }),
  ).toHaveText('Consertar a torneira foi para Sexta, 20 nov.');
  const friday = await day(page, 'Sexta, 20 nov.');
  await expect(friday.getByText('Consertar a torneira')).toBeVisible();

  await friday
    .getByRole('button', { name: 'Mais ações para Consertar a torneira' })
    .click();
  await page.getByRole('button', { name: 'Sem dia', exact: true }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'voltou' }),
  ).toHaveText('Consertar a torneira voltou para a Caixa de entrada.');
  await expect(page.getByText('2 na caixa')).toBeVisible();

  const tomorrow = await day(page, 'Amanhã');
  if (test.info().project.name === 'mobile') {
    await page.getByRole('button', { name: 'Reordenar' }).click();
    await tomorrow
      .getByRole('button', { name: 'Subir Responder contador' })
      .click();
  } else {
    await tomorrow.getByRole('link', { name: 'Responder contador' }).focus();
    await page.keyboard.press('Alt+ArrowUp');
  }
  await expect(
    page.getByRole('status').filter({ hasText: 'posição' }),
  ).toHaveText('Responder contador: posição 1 de 2.');
  await expect(tomorrow.getByRole('listitem').first()).toContainText(
    'Responder contador',
  );
  if (test.info().project.name !== 'mobile')
    await expect(
      tomorrow.getByRole('link', { name: 'Responder contador' }),
    ).toBeFocused();
});

test('teclado e arrastar mudam o dia no desktop', async ({ page }) => {
  test.skip(test.info().project.name === 'mobile', 'Sem arrastar no celular.');
  await seed(page);
  const tomorrow = page.getByRole('region', { name: 'Amanhã', exact: true });
  await tomorrow.getByRole('link', { name: 'Responder contador' }).focus();
  await page.keyboard.press('Alt+ArrowRight');
  await expect(
    page.getByRole('status').filter({ hasText: 'foi para' }),
  ).toHaveText('Responder contador foi para Quarta, 18 nov.');
  const wednesday = page.getByRole('region', {
    name: 'Quarta, 18 nov.',
    exact: true,
  });
  await expect(
    wednesday.getByRole('link', { name: 'Responder contador' }),
  ).toBeFocused();

  await tomorrow
    .getByRole('listitem')
    .filter({ hasText: 'Reunião de equipe' })
    .dragTo(page.getByRole('region', { name: 'Sábado, 21 nov.', exact: true }));
  await expect(
    page.getByRole('status').filter({ hasText: 'foi para' }),
  ).toHaveText('Reunião de equipe foi para Sábado, 21 nov.');
  await expect(
    page
      .getByRole('region', { name: 'Sábado, 21 nov.', exact: true })
      .getByText('Reunião de equipe'),
  ).toBeVisible();
});

test('abrir um dia leva à visão de dia e volta à semana', async ({ page }) => {
  await seed(page);
  const tomorrow = await day(page, 'Amanhã');
  await tomorrow
    .getByRole('link', { name: /^(Ter 17|Abrir o dia →)$/ })
    .click();
  await expect(page).toHaveURL(/mode=day&date=2026-11-17/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dia');
  await expect(page.getByLabel('Data da agenda')).toHaveValue('2026-11-17');
  await page.getByRole('button', { name: 'Ver a semana' }).click();
  await expect(
    page.getByRole('heading', { name: 'Próximos 7 dias' }),
  ).toBeVisible();
});
