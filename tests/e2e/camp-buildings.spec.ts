import { expect, test } from '@playwright/test';
import { campBuy, campData, campReady, campSeed } from './camp-flow';

// Onda E: construções do acampamento (lógica primeiro; arte depois).
test('serraria: construir, produzir offline e coletar; campo de caça espera madeira', async ({
  page,
}) => {
  await page.goto('/acampamento');
  await campReady(page);
  await campSeed(page, { gold: 600 });
  await campReady(page);
  await campBuy(page);
  const panel = page.getByRole('region', { name: 'Construções' });
  const sawmill = panel.getByRole('listitem', { name: 'Serraria' });
  const hunting = panel.getByRole('listitem', { name: 'Campo de caça' });
  await expect(sawmill).toContainText('lenhadora de confiança');
  await expect(hunting).toContainText('Construa primeiro: Serraria.');

  await sawmill.getByRole('button', { name: 'Construir' }).click();
  await expect(panel).toContainText('Serraria construída.');
  await expect(sawmill).toContainText('Nível 1');
  let data = await campData(page);
  expect(data.profile.gold).toBe(600 - 50 - 150);
  expect(
    data.audit.some(
      (row: { id: string }) => row.id === 'camp-building:sawmill:1',
    ),
  ).toBe(true);

  // Campo de caça: custo com madeira em falta, botão desligado.
  await expect(
    hunting.getByRole('button', { name: 'Construir' }),
  ).toBeDisabled();
  await expect(hunting).toContainText('12 Madeira');

  // Dois dias depois (simulados no registro), há 20 madeira para coletar.
  const past = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
  await campSeed(page, {
    campBuildings: {
      ...data.profile.campBuildings,
      sawmill: { ...data.profile.campBuildings.sawmill, collectedAt: past },
    },
  });
  await page.reload();
  await campReady(page);
  await sawmill.getByRole('button', { name: 'Coletar 20 Madeira' }).click();
  await expect(panel).toContainText('+20 Madeira coletados.');
  await expect(
    sawmill.getByRole('button', { name: 'Coletar 0 Madeira' }),
  ).toBeDisabled();
  data = await campData(page);
  expect(data.profile.materials.wood).toBe(20);

  await hunting.getByRole('button', { name: 'Construir' }).click();
  await expect(hunting).toContainText('Nível 1');
  data = await campData(page);
  expect(data.profile.materials.wood).toBe(8);
  expect(data.profile.gold).toBe(400 - 350);
});
