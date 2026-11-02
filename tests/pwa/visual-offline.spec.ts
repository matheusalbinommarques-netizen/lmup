import { test, expect } from '@playwright/test';

test('seis telas e biblioteca visual estão disponíveis na primeira navegação offline', async ({
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
  for (const path of [
    '/',
    '/missoes?view=list',
    '/missoes?view=agenda&mode=day',
    '/missoes?view=agenda&mode=week',
    '/missoes?view=routines',
    '/missoes?view=recovery',
  ]) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect
      .poll(() =>
        page
          .locator('img')
          .evaluateAll((imgs) =>
            (imgs as HTMLImageElement[])
              .filter((i) => i.complete && !i.naturalWidth)
              .map((i) => i.src),
          ),
      )
      .toEqual([]);
  }
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const missionForm = page.getByRole('dialog', { name: 'Uma nova missão' });
  await missionForm
    .getByRole('button', { name: 'Gerenciar áreas', exact: true })
    .click();
  const form = page.getByRole('dialog', { name: 'Minhas áreas', exact: true });
  await form.getByText('Ícone da área', { exact: true }).click();
  await form.getByLabel('Buscar ícone').fill('exercício');
  await expect(
    form.getByRole('button', { name: 'Exercício', exact: true }),
  ).toBeVisible();
  await expect
    .poll(() =>
      form
        .locator('img')
        .evaluateAll((imgs) =>
          (imgs as HTMLImageElement[])
            .filter((i) => i.complete && !i.naturalWidth)
            .map((i) => i.src),
        ),
    )
    .toEqual([]);
});
