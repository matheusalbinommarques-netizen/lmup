import { expect, test, type Page } from '@playwright/test';

async function completeRealMission(page: Page, title: string) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Uma nova missão' });
  await dialog.getByLabel('O que você quer fazer?').fill(title);
  await dialog
    .getByRole('button', { name: 'Criar missão', exact: true })
    .click();
  // Wait until the IndexedDB transaction finishes and the modal closes.
  // Navigating earlier could abort creation, especially under slower CI load.
  await expect(dialog).not.toBeVisible();
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Todas', exact: true }).click();
  await page.getByRole('link', { name: title, exact: true }).click();
  await expect(page).toHaveURL(/\/missao\/\d+$/);
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Missão concluída!' }),
  ).toBeVisible();
}

test('história inteira sem interrupção, escolha persistente e capítulo seguinte por XP real', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/aventura');
  await expect(
    page.getByRole('heading', { name: 'O outro lado da ponte' }),
  ).toBeVisible();
  for (let i = 0; i < 5; i++) {
    await page
      .getByRole('button', { name: 'Próxima cena', exact: true })
      .click();
  }
  await page.getByRole('button', { name: 'Ajudar o guarda' }).click();
  await expect(
    page.getByRole('heading', { name: 'A promessa feita ao guarda' }),
  ).toBeVisible();
  await expect(page.locator('#rpg-xp')).toHaveAttribute('value', '0');

  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'A promessa feita ao guarda' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Rever capítulo 1' }).click();
  await expect(
    page.getByRole('heading', { name: 'Uma cidade que nunca dorme' }),
  ).toBeVisible();
  for (let i = 0; i < 5; i++) {
    await page
      .getByRole('button', { name: 'Próxima cena', exact: true })
      .click();
  }
  await page.getByRole('button', { name: 'Rever o desfecho' }).click();
  await page.getByRole('button', { name: 'Voltar aos capítulos' }).click();

  for (let i = 0; i < 3; i++)
    await completeRealMission(page, 'Missão real ' + (i + 1));
  await page.goto('/aventura');
  await expect(
    page.getByRole('button', { name: 'Iniciar capítulo 2' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Iniciar capítulo 2' }).click();
  await expect(
    page.getByRole('heading', { name: 'Ecos da passagem' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Próxima cena', exact: true }).click();
  // Wait for the committed scene before testing persistence across reload.
  await expect(
    page.getByRole('heading', { name: 'Uma lembrança inesperada' }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Uma lembrança inesperada' }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test('aventura ocupa a janela e mantém controles acessíveis sem barra do organizador', async ({
  page,
}) => {
  await page.goto('/aventura');
  await expect(page.locator('.rpg-theater')).toBeVisible();
  const viewport = page.viewportSize()!;
  const rect = await page.locator('.rpg-theater').boundingBox();
  expect(rect).not.toBeNull();
  expect(rect!.width).toBeGreaterThanOrEqual(viewport.width - 2);
  expect(rect!.height).toBeGreaterThanOrEqual(viewport.height - 2);
  await expect(page.locator('.journey-sidebar')).toBeHidden();
  await expect(
    page.getByRole('link', { name: 'Voltar para Hoje' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Próxima cena' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});
