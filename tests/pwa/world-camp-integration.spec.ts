import { expect, test } from '@playwright/test';
import { worldData, interact } from '../e2e/world-flow';
test('Mundo, Aposentos e acampamento coexistem na primeira navegação offline sem perder a exploração', async ({
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
  await page
    .getByRole('button', { name: 'Entrar no assentamento', exact: true })
    .click();
  await interact(page, 'Conversar com Lucan');
  await page
    .getByRole('button', { name: 'Vou investigar os arredores.', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Voltar à exploração', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Voltar ao mapa', exact: true })
    .click();
  const saved = (await worldData(page)).profile.world;
  await page.goto('/aposentos');
  await expect(
    page.getByRole('heading', { name: 'Acampamento — Centro', exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId('point-caretaker')).toBeAttached();
  await expect(page.getByTestId('point-interior')).toHaveCount(0);
  await page.goto('/acampamento');
  await expect(page.getByTestId('layered-scene')).toHaveAttribute(
    'data-scene',
    'center-empty',
  );
  expect((await worldData(page)).profile.world).toEqual(saved);
  await page.goto('/mundo');
  await page
    .getByRole('button', { name: 'Continuar exploração', exact: true })
    .click();
  expect((await worldData(page)).profile.world).toEqual(saved);
  await context.setOffline(false);
  await request.post('/__network', { data: 'online' });
});
