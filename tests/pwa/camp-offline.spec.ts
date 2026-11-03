import { test, expect } from '@playwright/test';
import {
  campPoint,
  campReady,
  campSeed,
  campBuy,
  campData,
  campBack,
} from '../e2e/camp-flow';
test('primeira visita offline ao Centro permite construir e conserva as cenas, saldo e XP após recarga', async ({
  page,
  context,
  request,
}) => {
  await request.post('/__network', { data: 'online' });
  await request.post('/__release', { data: 'a' });
  await page.goto('/refugio');
  await campSeed(page, { gold: 100, food: 83, totalXpEarned: 12000 });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await request.post('/__network', { data: 'offline' });
  await context.setOffline(true);
  await page.goto('/refugio/acampamento');
  await campReady(page);
  await campBuy(page);
  await campPoint(page, 'garden', 'Jardim da Árvore');
  await expect(page.getByTestId('layered-scene')).toHaveAttribute(
    'data-scene',
    'garden-4',
  );
  await page
    .locator('img[data-layer="tree"]')
    .evaluate((image) => (image as HTMLImageElement).decode());
  await page.reload();
  await expect(page.getByTestId('layered-scene')).toHaveAttribute(
    'data-scene',
    'garden-4',
  );
  await campBack(page);
  await campPoint(page, 'interior', 'Aposentos');
  await campPoint(page, 'equipment', 'Equipamentos');
  await expect(page.getByRole('dialog')).toContainText('Minha coleção');
  const state = await campData(page);
  expect(state.profile.gold).toBe(50);
  expect(state.profile.food).toBe(83);
  expect(state.profile.totalXpEarned).toBe(12000);
  expect(
    state.audit.filter((row: any) => row.id === 'camp-settlement:built'),
  ).toHaveLength(1);
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
  await campPoint(other, 'caretaker', 'Caseiro');
  await expect(other.getByRole('dialog')).toBeVisible();
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
  await expect(other.getByRole('dialog')).toBeVisible();
  await other.keyboard.press('Escape');
  await expect(other.getByRole('dialog')).toHaveCount(0);
  await Promise.all([
    page.waitForEvent('domcontentloaded'),
    other.waitForEvent('domcontentloaded'),
    page.getByRole('button', { name: 'Atualizar agora', exact: true }).click(),
  ]);
  for (const tab of [page, other]) {
    await campReady(tab);
    await expect(tab.getByTestId('camp-balance')).toHaveText(
      '0 ouro · 0 comida',
    );
    expect((await campData(tab)).profile.campSettlement.residenceBuilt).toBe(
      false,
    );
  }
  await other.close();
});
