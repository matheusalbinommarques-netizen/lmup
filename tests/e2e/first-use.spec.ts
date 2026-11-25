import { expect, test, type Page } from '@playwright/test';
import { existingUser } from './existing-user';

const TODAY = '2026-11-25';

const panel = (page: Page) =>
  page.getByRole('region', { name: 'Ajustar o LMUP para você' });
const layer = (page: Page) =>
  page.locator('html').getAttribute('data-game-layer');

async function openNew(page: Page, time = '09:00') {
  await page.clock.setFixedTime(new Date(`${TODAY}T${time}:00-03:00`));
  await page.goto('/');
  await expect(panel(page)).toBeVisible();
}

function readProfile(page: Page) {
  return page.evaluate(
    () =>
      new Promise<Record<string, unknown>>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const get = database
            .transaction('profile')
            .objectStore('profile')
            .get(1);
          get.onsuccess = () => {
            database.close();
            resolve(get.result);
          };
          get.onerror = () => {
            database.close();
            reject(get.error);
          };
        };
      }),
  );
}

function seedPlan(page: Page) {
  return page.evaluate(
    (today) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const tx = database.transaction(['tasks'], 'readwrite');
          [
            ['Responder e-mails', 30, null],
            ['Ler 10 páginas', 25, null],
          ].forEach(([title, minutes, time], index) =>
            tx.objectStore('tasks').put({
              id: 9701 + index,
              title,
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
              estimatedMinutes: minutes,
              plannedTime: time,
            }),
          );
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
}

test('perfil novo começa na Discreta e o Hoje continua usável com o painel', async ({
  page,
}) => {
  await openNew(page);
  expect(await layer(page)).toBe('discreta');
  await expect(panel(page)).toContainText('passo 1 de 3');
  await expect(
    page.getByRole('button', { name: 'Nova missão', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.journey-card')).toHaveCount(0);
});

test('"Agora não" recolhe sem concluir e Configurações retoma no mesmo passo', async ({
  page,
}) => {
  await openNew(page);
  await panel(page).getByRole('button', { name: 'Pular passo' }).click();
  await expect(panel(page)).toContainText('passo 2 de 3');
  await panel(page).getByRole('button', { name: 'Agora não' }).click();
  await expect(page.getByRole('status').first()).toContainText(
    'continue em Configurações',
  );
  await expect(panel(page)).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Plano do dia' }),
  ).toBeVisible();
  await expect(panel(page)).toHaveCount(0);
  const postponed = await readProfile(page);
  expect(postponed.firstUse).toMatchObject({
    status: 'pending',
    postponed: true,
    steps: { areas: 'skipped' },
  });
  await page.goto('/config');
  await page.getByRole('button', { name: 'Continuar a preparação' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(panel(page)).toContainText('passo 2 de 3');
  await expect(panel(page)).toContainText(
    'Quando seu dia costuma começar e terminar?',
  );
});

test('jornada completa: áreas, horários e camada escolhida', async ({
  page,
}) => {
  await openNew(page);
  await panel(page).getByRole('button', { name: /Saúde/ }).click();
  await expect(
    panel(page).getByRole('button', { name: /Saúde/ }),
  ).toHaveAttribute('aria-pressed', 'true');
  await panel(page).getByLabel('Outra área').fill('Violão');
  await panel(page).getByRole('button', { name: 'Adicionar' }).click();
  await panel(page).getByRole('button', { name: 'Criar 2 áreas' }).click();
  await expect(page.getByRole('status').first()).toContainText(
    '2 áreas criadas',
  );

  await expect(panel(page)).toContainText('passo 2 de 3');
  await panel(page).getByLabel('Começa').fill('22:00');
  await panel(page).getByLabel('Termina').fill('07:00');
  await expect(panel(page).getByRole('alert')).toContainText(
    'O fim do dia precisa ser depois do início',
  );
  await expect(
    panel(page).getByRole('button', { name: 'Salvar horários' }),
  ).toBeDisabled();
  await panel(page).getByLabel('Começa').fill('07:30');
  await panel(page).getByLabel('Termina').fill('22:00');
  await panel(page).getByRole('button', { name: 'Salvar horários' }).click();

  await expect(panel(page)).toContainText('passo 3 de 3');
  await expect(
    panel(page).getByRole('radio', { name: /Discreta/ }),
  ).toBeChecked();
  await panel(page)
    .getByRole('radio', { name: /Completa/ })
    .check();
  await panel(page).getByRole('button', { name: 'Usar Completa' }).click();
  await expect(page.getByRole('status').first()).toContainText(
    'ficam em Configurações',
  );
  await expect(panel(page)).toHaveCount(0);
  await expect(page.locator('.journey-card')).toBeVisible();
  expect(await layer(page)).toBe('completa');

  const saved = await readProfile(page);
  expect(saved.dayHours).toEqual({ start: '07:30', end: '22:00' });
  expect(saved.firstUse).toMatchObject({
    status: 'done',
    steps: { areas: 'done', day: 'done', layer: 'done' },
  });
  await page.reload();
  await expect(page.locator('.journey-card')).toBeVisible();
  await expect(panel(page)).toHaveCount(0);
});

test('"Pular tudo" encerra na Discreta e não volta', async ({ page }) => {
  await openNew(page);
  await panel(page).getByRole('button', { name: 'Pular tudo' }).click();
  await expect(panel(page)).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Plano do dia' }),
  ).toBeVisible();
  await expect(panel(page)).toHaveCount(0);
  expect(await layer(page)).toBe('discreta');
  await page.goto('/config');
  await expect(
    page.getByRole('button', { name: 'Continuar a preparação' }),
  ).toHaveCount(0);
});

test('início do dia move as horas ≈ e o fim avisa; limpar volta ao de antes', async ({
  page,
}) => {
  await openNew(page, '06:10');
  await seedPlan(page);
  await panel(page).getByRole('button', { name: 'Pular tudo' }).click();
  const plan = page.getByRole('region', { name: /Plano do dia/ });
  await expect(plan).toContainText('≈ 06:10');
  await page.goto('/config');
  const day = page.locator('#dia');
  await day.getByLabel('Começa').fill('07:30');
  await day.getByLabel('Termina').fill('08:15');
  await day.getByRole('button', { name: 'Salvar horários' }).click();
  await expect(day.getByRole('status')).toContainText('Horários do dia salvos');
  await page.goto('/');
  await expect(plan).toContainText('≈ 07:30');
  await expect(plan).toContainText('≈ 08:00');
  await expect(plan).not.toContainText('≈ 06:10');
  await expect(plan.getByRole('note')).toContainText(
    'o plano vai até 08:25, 10 min depois do fim do dia (08:15)',
  );
  await page.goto('/config');
  await page
    .locator('#dia')
    .getByRole('button', { name: 'Limpar horários' })
    .click();
  await page.goto('/');
  await expect(plan).toContainText('≈ 06:10');
  await expect(plan.getByRole('note')).toHaveCount(0);
  // Fim do dia já passou e ainda há plano: o aviso continua, só informativo.
  await page.goto('/config');
  await page.locator('#dia').getByLabel('Termina').fill('06:00');
  await page
    .locator('#dia')
    .getByRole('button', { name: 'Salvar horários' })
    .click();
  await page.goto('/');
  await expect(plan.getByRole('note')).toHaveText(
    'Seu fim do dia (06:00) já passou. Pela estimativa, o que falta vai até 07:05.',
  );
  await expect(plan).toContainText('≈ 06:10');
});

test('ordem do documento segue a ordem visual: próxima missão antes do painel no mobile', async ({
  page,
}) => {
  await openNew(page);
  const order = () =>
    page.evaluate(() => {
      const next = document.querySelector('.next-mission')!;
      const panel = document.querySelector('.first-use')!;
      const plan = document.querySelector('.day-plan')!;
      const before = (a: Element, b: Element) =>
        !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
      return {
        nextBeforePanel: before(next, panel),
        panelBeforePlan: before(panel, plan),
        inAside: !!panel.closest('.today-aside'),
      };
    });
  if (page.viewportSize()!.width <= 760) {
    expect(await order()).toEqual({
      nextBeforePanel: true,
      panelBeforePlan: true,
      inAside: false,
    });
  } else {
    // Desktop: coluna principal (próxima missão, plano) e depois a lateral.
    expect(await order()).toEqual({
      nextBeforePanel: true,
      panelBeforePlan: false,
      inAside: true,
    });
  }
  // Teclado: a ação principal do Hoje vem antes das saídas do painel.
  const create = page.getByRole('button', { name: 'Nova missão', exact: true });
  const later = panel(page).getByRole('button', { name: 'Agora não' });
  expect(
    await create.evaluate(
      (a, b) =>
        !!(a.compareDocumentPosition(b!) & Node.DOCUMENT_POSITION_FOLLOWING),
      await later.elementHandle(),
    ),
  ).toBe(true);
});

test('painel cabe em 320 px com texto a 200% nos três passos', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await openNew(page);
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  const fits = () =>
    page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
  expect(await fits()).toBe(true);
  await panel(page).getByRole('button', { name: /Saúde/ }).click();
  expect(await fits()).toBe(true);
  await panel(page).getByRole('button', { name: 'Pular passo' }).click();
  await expect(panel(page)).toContainText('passo 2 de 3');
  await panel(page).getByLabel('Começa').fill('08:00');
  await panel(page).getByLabel('Termina').fill('07:00');
  await expect(panel(page).getByRole('alert')).toBeVisible();
  expect(await fits()).toBe(true);
  await panel(page).getByRole('button', { name: 'Pular passo' }).click();
  await expect(panel(page)).toContainText('passo 3 de 3');
  expect(await fits()).toBe(true);
});

test('perfil antigo com outra camada continua nela, sem painel', async ({
  page,
}) => {
  await existingUser({ page });
  await page.goto('/config');
  await page.getByRole('radio', { name: 'Desligada', exact: true }).check();
  await expect(
    page.getByRole('status').filter({ hasText: 'Desligada' }),
  ).toContainText('Nada do seu progresso mudou');
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Plano do dia' }),
  ).toBeVisible();
  expect(await layer(page)).toBe('desligada');
  await expect(panel(page)).toHaveCount(0);
  const saved = await readProfile(page);
  expect(saved.gameLayer).toBe('desligada');
  expect(saved.firstUse).toBeUndefined();
});
