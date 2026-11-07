import { test, expect } from '@playwright/test';
import { worldData } from '../e2e/world-flow';

test('antigos links de aventura abrem o Mundo offline sem apagar o progresso', async ({
  page,
  context,
  request,
}) => {
  await request.post('/__network', { data: 'online' });
  await request.post('/__release', { data: 'a' });
  await page.goto('/mundo');
  await expect(
    page.getByRole('heading', { name: 'Mundo', exact: true }),
  ).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  const saved = await worldData(page);

  await request.post('/__network', { data: 'offline' });
  await context.setOffline(true);
  await page.goto('/aventura?campanha=ermos');
  await expect(page).toHaveURL(/\/mundo\/campanha$/);
  await expect(
    page.getByRole('heading', { name: 'Aventura nos Ermos', exact: true }),
  ).toBeVisible();
  await page.goto('/aventura');
  await expect(page).toHaveURL(/\/mundo$/);
  await expect(
    page.getByRole('heading', { name: 'Mundo', exact: true }),
  ).toBeVisible();

  const after = await worldData(page);
  expect(after.profile).toEqual(saved.profile);
  expect(after.events).toEqual(saved.events);
});
