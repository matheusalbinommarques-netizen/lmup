import { expect, test } from '@playwright/test';
import {
  investigate,
  resolveInvestigation,
  worldData,
} from '../e2e/world-flow';
test('primeira exploração de Mundo funciona offline, inclusive arte, diálogo e conclusão persistente', async ({
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
  await page.goto('/mundo');
  await expect(
    page.getByRole('button', { name: 'Entrar no assentamento', exact: true }),
  ).toBeEnabled();
  await expect
    .poll(() =>
      page
        .locator('.map-art>img')
        .evaluate((el) => (el as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  await investigate(page);
  await resolveInvestigation(page);
  await expect
    .poll(() =>
      page
        .locator('.character-portrait img')
        .evaluate((el) => (el as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  await page.reload();
  await page
    .getByRole('button', { name: 'Continuar exploração', exact: true })
    .click();
  await expect(
    page.getByText('Investigação concluída', { exact: true }),
  ).toBeVisible();
  expect((await worldData(page)).profile.world.resolution).toBe('route');
  await page
    .getByRole('button', { name: 'Voltar ao mapa', exact: true })
    .click();
  await page.getByRole('button', { name: 'Atlas', exact: true }).click();
  for (const img of await page.locator('.founder-grid img').all()) {
    await img.scrollIntoViewIfNeeded();
    await expect
      .poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
  }
});
