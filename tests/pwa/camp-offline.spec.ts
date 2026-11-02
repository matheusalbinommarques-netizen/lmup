import { test, expect } from '@playwright/test';
test('primeira visita offline ao acampamento conserva terreno, fabricação e estoque após recarga', async ({
  page,
  context,
  request,
}) => {
  await request.post('/__network', { data: 'online' });
  await request.post('/__release', { data: 'a' });
  await page.goto('/refugio');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await request.post('/__network', { data: 'offline' });
  await context.setOffline(true);
  await page.goto('/refugio/acampamento');
  await expect(
    page.getByRole('heading', { name: 'Acampamento', exact: true }),
  ).toBeVisible();
  await expect(page.locator('canvas.terrain-region')).toHaveAttribute(
    'data-ready',
    'true',
  );
  await page
    .getByRole('button', { name: 'Selecionar Forja', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Fabricar espada de treino', exact: true })
    .click();
  await expect(page.locator('[data-resource="trainingSword"]')).toHaveText('1');
  await page.reload();
  await expect(page.locator('[data-stock-resource="wood"] strong')).toHaveText(
    '10',
  );
  await expect(page.locator('[data-stock-resource="gold"] strong')).toHaveText(
    '0',
  );
  await page
    .getByRole('button', { name: 'Selecionar Forja', exact: true })
    .click();
  await expect(page.locator('[data-resource="trainingSword"]')).toHaveText('1');
  await expect
    .poll(() =>
      page
        .locator('.scene-sprite img,.region-decoration')
        .evaluateAll((nodes) =>
          nodes.every(
            (n) =>
              (n as HTMLImageElement).complete &&
              (n as HTMLImageElement).naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
  await context.setOffline(false);
  await request.post('/__network', { data: 'online' });
});

test('prévia de construção em outra aba bloqueia atualização e cancelar libera sem cobrar', async ({
  page,
  context,
  request,
}) => {
  test.slow();
  await request.post('/__network', { data: 'online' });
  await request.post('/__release', { data: 'a' });
  await page.goto('/refugio/acampamento');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  const other = await context.newPage();
  await other.goto('/refugio/acampamento');
  await other.getByRole('button', { name: 'Construir', exact: true }).click();
  await other
    .getByRole('button', { name: 'Escolher Serraria', exact: true })
    .click();
  await expect(other.locator('.placement-preview img')).toBeVisible();
  await request.post('/__release', { data: 'camp-update' });
  await page.evaluate(async () => {
    await (await navigator.serviceWorker.getRegistration())!.update();
  });
  await expect(
    page.getByRole('complementary', {
      name: 'Atualização disponível',
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Atualizar agora', exact: true })
    .click();
  await expect(
    page.getByText(/Há uma gravação, formulário ou aba sem resposta/),
  ).toBeVisible();
  await expect(other.locator('.placement-preview img')).toBeVisible();
  await other.keyboard.press('Escape');
  await expect(other.locator('.placement-preview')).toHaveCount(0);
  await Promise.all([
    page.waitForEvent('domcontentloaded'),
    other.waitForEvent('domcontentloaded'),
    page.getByRole('button', { name: 'Atualizar agora', exact: true }).click(),
  ]);
  for (const tab of [page, other]) {
    await expect(tab.locator('[data-stock-resource="wood"] strong')).toHaveText(
      '12',
    );
    await expect(tab.locator('.scene-sprite')).toHaveCount(4);
  }
  await other.close();
});
