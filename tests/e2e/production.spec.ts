import { expect, test } from '@playwright/test';

const routes = [
  ['/', 'Taverna do Herói'],
  ['/missoes', 'Quadro de Missões'],
  ['/projetos', 'Projetos do Herói'],
  ['/cla', 'Salão do Clã'],
  ['/santuario', 'Santuário da Natureza'],
  ['/config', 'Cofre Arcano'],
  ['/loja', 'Loja da Taverna'],
  ['/inventario', 'Inventário'],
  ['/bestiario', 'Bestiário de Companheiros'],
  ['/trofeus', 'Sala de Troféus'],
];

test('asset ausente retorna 404 sem receber o shell HTML', async ({
  request,
}) => {
  const response = await request.get('/_app/immutable/arquivo-inexistente.js');
  expect(response.status()).toBe(404);
});

for (const [route, title] of routes) {
  test(`produção abre e recarrega ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    expect((await page.goto(route))?.ok()).toBe(true);
    await expect(
      page.getByRole('heading', { name: title, exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole('heading', { name: title, exact: true }),
    ).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('projeto criado no navegador abre por URL interna e após recarga', async ({
  page,
}) => {
  await page.goto('/projetos');
  await page.getByRole('button', { name: 'Novo projeto', exact: true }).click();
  await page.getByLabel('Nome do projeto').fill('Projeto de teste de produção');
  await page
    .getByRole('button', { name: 'Criar projeto', exact: true })
    .click();
  const details = page.getByRole('link', {
    name: 'Detalhes do projeto',
    exact: true,
  });
  await expect(details).toBeVisible();
  const href = await details.getAttribute('href');
  expect(href).toMatch(/^\/projetos\/\d+$/);
  await page.goto(href!);
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Projeto de teste de produção',
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Projeto de teste de produção',
      exact: true,
    }),
  ).toBeVisible();
});
