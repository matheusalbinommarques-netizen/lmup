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
          const tx = database.transaction(['tasks'], 'readwrite');
          tx.objectStore('tasks').put({
            id: 9401,
            title: 'Pagar conta de luz',
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
}

const desktop = (page: Page) => page.viewportSize()!.width > 900;
const nav = (page: Page) =>
  page.getByRole('navigation', {
    name: desktop(page) ? 'Navegação principal' : 'Navegação móvel',
    exact: true,
  });

async function chooseLayer(page: Page, title: string) {
  await page.goto('/config');
  await page.getByRole('radio', { name: title, exact: true }).check();
  await expect(
    page.getByRole('status').filter({ hasText: title }),
  ).toContainText('Nada do seu progresso mudou');
}

test('camada Completa é o padrão: Jornada na barra e um cartão de jogo no Hoje', async ({
  page,
}) => {
  await seed(page);
  await page.goto('/');
  await expect(nav(page).getByRole('link')).toHaveText([
    'Hoje',
    'Missões',
    'Evolução',
    'Jornada',
  ]);
  const card = page.locator('.journey-card');
  await expect(card).toBeVisible();
  await expect(card).toContainText('Jornada · Nível 1');
  await expect(
    card.getByRole('link', { name: 'Abrir Jornada →' }),
  ).toBeVisible();
  await expect(page.locator('.game-line')).toHaveCount(0);
  // Caixas e "No que investir?" saíram do Hoje e moram no Acampamento.
  await expect(page.getByText('No que investir?')).toHaveCount(0);
  await expect(page.locator('.world-cards')).toHaveCount(0);
  await page.goto('/acampamento');
  await expect(
    page.getByRole('heading', { name: 'No que investir?' }),
  ).toBeVisible();
  await expect(page.getByText('construção, item ou melhoria')).toBeVisible();
});

test('camada Discreta: Jornada sai da barra, Hoje mostra só a linha de XP', async ({
  page,
}) => {
  await seed(page);
  await chooseLayer(page, 'Discreta');
  await page.goto('/');
  await expect(nav(page).getByRole('link')).toHaveText([
    'Hoje',
    'Missões',
    'Evolução',
  ]);
  await expect(page.locator('.journey-card')).toHaveCount(0);
  await expect(page.locator('.game-line')).toContainText('Hoje +0 XP');
  // Produtividade em superfície simples, sem moldura ornamentada.
  await expect
    .poll(() =>
      page
        .locator('.day-plan')
        .evaluate((el) => getComputedStyle(el).boxShadow),
    )
    .toBe('none');
  if (desktop(page)) {
    await page
      .locator('.journey-sidebar')
      .getByRole('link', { name: 'Jornada', exact: true })
      .click();
  } else {
    await nav(page).getByRole('button', { name: 'Mais', exact: true }).click();
    await page
      .getByRole('dialog', { name: 'Jornada' })
      .getByRole('link', { name: 'Herói', exact: true })
      .click();
  }
  await expect(page).toHaveURL(/\/perfil$/);
  await page.reload();
  await expect(nav(page).getByRole('link')).toHaveCount(3);
});

test('camada Desligada: nada de XP ou ouro na produtividade, e os registros continuam', async ({
  page,
}) => {
  await seed(page);
  await chooseLayer(page, 'Desligada');
  await page.goto('/');
  await expect(nav(page).getByRole('link')).toHaveCount(3);
  await expect(page.locator('.journey-card, .game-line')).toHaveCount(0);
  await page
    .locator('.day-plan')
    .getByRole('button', { name: 'Concluir Pagar conta de luz' })
    .click();
  const toast = page.locator('.undo-toast');
  await expect(toast).toContainText('“Pagar conta de luz” concluída.');
  await expect(toast).not.toContainText('XP');
  await expect(toast.getByRole('link')).toHaveCount(0);
  await expect(page.locator('.today-completions')).toContainText(
    'Realizada hoje',
  );
  await expect(page.locator('.today-completions')).not.toContainText(
    /XP|Ouro/,
    { useInnerText: true },
  );

  // O XP foi registrado mesmo sem aparecer: religar mostra o ganho do dia.
  await chooseLayer(page, 'Completa');
  await page.goto('/');
  await expect(page.locator('.journey-card .daily-rewards')).not.toContainText(
    '+0XP',
  );
  await expect(
    page.locator('.journey-card .daily-rewards span').first(),
  ).not.toContainText('+0');
});
