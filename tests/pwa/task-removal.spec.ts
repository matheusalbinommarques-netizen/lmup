import { expect, test } from '@playwright/test';
test('exclusão de cadastro sem uso funciona offline e permanece após recarga', async ({
  page,
  context,
  request,
}) => {
  await request.post('/__network', { data: 'online' });
  await request.post('/__release', { data: 'a' });
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await request.post('/__network', { data: 'offline' });
  await context.setOffline(true);
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const form = page.getByRole('dialog', {
    name: 'Uma nova missão',
    exact: true,
  });
  await form.getByLabel('O que você quer fazer?').fill('Apagar offline');
  await form.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await expect(form).not.toBeVisible();
  const row = page
    .locator('.mission-row')
    .filter({ hasText: 'Apagar offline' });
  await row.getByLabel('Ações para Apagar offline', { exact: true }).click();
  await row
    .getByRole('button', { name: 'Excluir missão', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Remover missão',
    exact: true,
  });
  await dialog
    .getByRole('button', { name: 'Excluir definitivamente', exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await page.reload();
  await expect(page.locator('.mission-row')).toHaveCount(0);
});
