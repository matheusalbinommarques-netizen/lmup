import { expect, test } from '@playwright/test';
import { interact, investigate, worldData } from './world-flow';
const stage = (page: import('@playwright/test').Page) =>
  page.getByRole('dialog', { name: 'Exploração do Oásis', exact: true });
async function start(page: import('@playwright/test').Page) {
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
}
test('arredores voltam ao Oásis, sem lista fixa; aviso é informativo e não uma obrigação', async ({
  page,
}) => {
  await start(page);
  await interact(page, 'Caminho dos arredores');
  await expect(
    stage(page).getByRole('heading', {
      name: 'Arredores do Oásis',
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    stage(page).getByRole('navigation', {
      name: 'Interações da cena',
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(stage(page).locator('.scene-point')).toHaveCount(5);
  await stage(page)
    .getByRole('navigation', { name: 'Controles da exploração', exact: true })
    .getByRole('button', { name: 'Voltar ao Oásis', exact: true })
    .click();
  await expect(
    stage(page).getByRole('heading', {
      name: 'Oásis dos Fundadores',
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Entrar no assentamento', exact: true }),
  ).toHaveCount(0);
  await interact(page, 'Quadro de avisos');
  await expect(
    stage(page).getByRole('heading', { name: 'Aviso de retorno', exact: true }),
  ).toBeVisible();
  await expect(
    stage(page).getByText(
      'A carga restante ficou junto à carroça avariada, nos arredores.',
      { exact: false },
    ),
  ).toBeVisible();
  await expect(
    stage(page).getByText('Observe de perto', { exact: true }),
  ).toHaveCount(0);
  expect((await worldData(page)).profile.world.clues).toEqual([]);
  await page.reload();
  await page
    .getByRole('button', { name: 'Continuar exploração', exact: true })
    .click();
  await expect(
    stage(page).getByRole('heading', { name: 'Aviso de retorno', exact: true }),
  ).toBeVisible();
  await interact(page, 'Conversar com Lucan');
  await expect(
    stage(page).getByRole('button', {
      name: 'Vou ajudar a recuperar a carga restante.',
      exact: false,
    }),
  ).toHaveCount(0);
  await stage(page)
    .getByRole('button', { name: 'Voltar à exploração', exact: true })
    .click();
  await interact(page, 'Caminho dos arredores');
  await page.keyboard.press('Escape');
  await expect(
    stage(page).getByRole('heading', {
      name: 'Oásis dos Fundadores',
      exact: true,
    }),
  ).toBeVisible();
  expect((await worldData(page)).profile.world.quest).toBe('active');
});
test('decisão resume as três evidências e divide tarefas; recuperação persiste sem ler o aviso', async ({
  page,
}) => {
  await page.goto('/mundo');
  await expect(
    page.getByRole('button', { name: 'Entrar no assentamento', exact: true }),
  ).toBeEnabled();
  const before = await worldData(page);
  await investigate(page);
  await interact(page, 'Voltar ao Oásis');
  await interact(page, 'Conversar com Lucan');
  await expect(stage(page).getByRole('definition')).toHaveCount(3);
  await expect(
    stage(page).getByText('Por que parou', { exact: true }),
  ).toBeVisible();
  await expect(
    stage(page).getByText('Como transportaram', { exact: true }),
  ).toBeVisible();
  await expect(
    stage(page).getByText('Por onde voltaram', { exact: true }),
  ).toBeVisible();
  await expect(
    stage(page).getByText(
      'A carga restante está junto à carroça, nos arredores.',
      { exact: false },
    ),
  ).toBeVisible();
  expect((await worldData(page)).profile.world.clues).toEqual([
    'axle',
    'cargo',
    'tracks',
  ]);
  await stage(page)
    .getByRole('button', {
      name: 'Vou ajudar a recuperar a carga restante.',
      exact: false,
    })
    .click();
  const confirm = page.getByRole('dialog', {
    name: 'Registrar sua decisão',
    exact: true,
  });
  await expect(
    confirm.getByText('Lucan preparará a rota das próximas entregas.', {
      exact: false,
    }),
  ).toBeVisible();
  await confirm
    .getByRole('button', { name: 'Confirmar decisão', exact: true })
    .click();
  await expect(confirm).not.toBeVisible();
  await expect(
    stage(page).getByText(
      'você acompanha a recuperação dos sacos junto à carroça.',
      { exact: false },
    ),
  ).toBeVisible();
  const saved = await worldData(page);
  const { world, ...profile } = saved.profile;
  const { world: old, ...oldProfile } = before.profile;
  expect(profile).toEqual(oldProfile);
  expect(saved.events).toEqual(before.events);
  expect(old.quest).toBe('new');
  expect(world.resolution).toBe('rescue');
  expect(
    world.journal.filter((x: { id: string }) => x.id === 'quest:solved'),
  ).toHaveLength(1);
  await page.reload();
  await page
    .getByRole('button', { name: 'Continuar exploração', exact: true })
    .click();
  expect((await worldData(page)).profile.world).toEqual(world);
  await interact(page, 'Mesa de provisões');
  await expect(
    stage(page).getByText(
      'Lucan ficou com o esboço das marcações do caminho alto.',
      { exact: false },
    ),
  ).toBeVisible();
  await expect(stage(page).locator('.overline')).toHaveCount(0);
});
