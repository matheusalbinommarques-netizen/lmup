import { expect, test } from '@playwright/test';

test('área configurada e seus ícones funcionam na primeira navegação offline e após recarga', async ({
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
  await page
    .getByRole('button', { name: 'Ferramentas de missões', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Gerenciar áreas', exact: true })
    .click();
  const areas = page.getByRole('dialog', { name: 'Minhas áreas', exact: true });
  await areas.getByLabel('Nome da nova área').fill('Estudos offline');
  await areas
    .getByRole('button', { name: 'Editar ícone da área', exact: true })
    .click();
  await areas.getByRole('button', { name: 'Estudo', exact: true }).click();
  await areas.getByRole('button', { name: 'Criar área', exact: true }).click();
  await expect(
    areas.getByText('Estudos offline', { exact: true }),
  ).toBeVisible();
  await areas
    .getByRole('button', { name: 'Fechar diálogo', exact: true })
    .click();
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const form = page.getByRole('dialog', {
    name: 'Uma nova missão',
    exact: true,
  });
  await form.getByLabel('O que você quer fazer?').fill('Ler offline');
  await form
    .getByRole('combobox', { name: 'Área', exact: true })
    .selectOption({ label: 'Estudos offline' });
  await form.getByRole('button', { name: 'Criar missão', exact: true }).click();
  const row = page.locator('.mission-row').filter({ hasText: 'Ler offline' });
  await expect(row.locator('img[src*="/estudo/"]')).toBeVisible();
  await page.reload();
  const icon = row.locator('img[src*="/estudo/"]');
  await expect(icon).toBeVisible();
  await expect
    .poll(() => icon.evaluate((el) => (el as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
});
