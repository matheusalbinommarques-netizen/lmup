import { expect, test, type Page } from '@playwright/test';

const TITLES = ['Beber água', 'Alongar o corpo', 'Ler um capítulo'];

async function openDraft(page: Page, titles = TITLES) {
  await page.goto('/missoes');
  await page.getByRole('tab', { name: 'Rotinas', exact: true }).click();
  await page.getByRole('button', { name: 'Nova rotina', exact: true }).click();
  await page
    .locator('.routine-form')
    .getByLabel('Nome da rotina', { exact: true })
    .fill('Rotina de teclado');
  for (const title of titles) {
    await page
      .getByRole('button', { name: 'Criar missão na rotina', exact: true })
      .click();
    const form = page.getByRole('dialog', {
      name: 'Uma nova missão',
      exact: true,
    });
    await form.getByLabel('O que você quer fazer?').fill(title);
    await form
      .getByRole('button', { name: 'Criar missão', exact: true })
      .click();
    await expect(form).not.toBeVisible();
    await expect(page.locator('.routine-sequence')).toContainText(title);
  }
}
const order = (page: Page) =>
  page
    .locator('.routine-sequence .sequence-title')
    .evaluateAll((rows) =>
      rows.map((row) => row.childNodes[0].textContent?.trim()),
    );
const control = (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true });

test('mover pelo teclado mantém o foco para movimentos consecutivos', async ({
  page,
}) => {
  await openDraft(page);
  const down = control(page, 'Mover Beber água para baixo');
  await down.focus();
  await page.keyboard.press('Enter');
  await expect(down).toBeFocused();
  expect(await order(page)).toEqual([TITLES[1], TITLES[0], TITLES[2]]);

  await page.keyboard.press('Space');
  expect(await order(page)).toEqual([TITLES[1], TITLES[2], TITLES[0]]);
  // The down arrow is now disabled, so focus stays on the same mission.
  const up = control(page, 'Mover Beber água para cima');
  await expect(up).toBeFocused();

  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  expect(await order(page)).toEqual(TITLES);
  await expect(down).toBeFocused();
});

test('remover pelo teclado leva o foco a um controle existente', async ({
  page,
}) => {
  await openDraft(page);
  await control(page, 'Remover Alongar o corpo da sequência').focus();
  await page.keyboard.press('Enter');
  expect(await order(page)).toEqual([TITLES[0], TITLES[2]]);
  await expect(control(page, 'Editar Ler um capítulo')).toBeFocused();

  await control(page, 'Remover Ler um capítulo da sequência').focus();
  await page.keyboard.press('Enter');
  expect(await order(page)).toEqual([TITLES[0]]);
  await expect(control(page, 'Editar Beber água')).toBeFocused();

  await control(page, 'Remover Beber água da sequência').focus();
  await page.keyboard.press('Enter');
  expect(await order(page)).toEqual([]);
  await expect(control(page, 'Criar missão na rotina')).toBeFocused();
});

test('cada checkbox de dias tem nome próprio e mantém o texto visível', async ({
  page,
}) => {
  await openDraft(page, TITLES.slice(0, 2));
  for (const title of TITLES.slice(0, 2))
    await expect(
      page.getByRole('checkbox', {
        name: `Usar dias personalizados para ${title}`,
        exact: true,
      }),
    ).toBeVisible();
  await expect(page.locator('.entry-days label').first()).toHaveText(
    'Usar dias personalizados',
  );
});
