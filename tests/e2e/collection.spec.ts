import { confirmBackupImport } from './backup-ui';
import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
async function backup(page: Page) {
  await page.goto('/config');
  const pending = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Exportar dados', exact: true })
    .click();
  return JSON.parse(await readFile((await (await pending).path())!, 'utf8'));
}
async function restore(page: Page, data: any) {
  await page.goto('/config');
  await page.locator('input[type=file]').setInputFiles({
    name: 'colecao.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(data)),
  });
  await confirmBackupImport(page);
}
async function seed(
  page: Page,
  fields: Record<string, number> = { gold: 20000, food: 500 },
) {
  const data = await backup(page);
  Object.assign(data.data.profile, fields);
  await restore(page, data);
}
function item(page: Page, name: string) {
  return page
    .locator('.collection-item')
    .filter({ has: page.getByRole('heading', { name, exact: true }) });
}
function pet(page: Page, name = 'Lobo Etéreo') {
  return page
    .locator('.collection-pet')
    .filter({ has: page.getByRole('heading', { name, exact: true }) });
}
async function buy(page: Page, name: string) {
  await page
    .getByRole('button', { name: 'Comprar ' + name, exact: true })
    .click();
  await page
    .getByRole('dialog', { name: 'Confirmar compra', exact: true })
    .getByRole('button', { name: /Confirmar ·/ })
    .click();
  await expect(
    item(page, name).getByRole('button', {
      name: 'Equipar ' + name,
      exact: true,
    }),
  ).toBeVisible();
}
test('compra confirma custo, troca de espaço e prévia coincidem com missão real', async ({
  page,
}) => {
  await seed(page);
  await page.goto('/loja');
  await page
    .getByRole('button', { name: 'Comprar Espada da Eficiência', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Confirmar compra',
    exact: true,
  });
  await expect(
    dialog.getByText('Saldo após a compra: 18200 Gold.', { exact: true }),
  ).toBeVisible();
  await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(
    page.getByText('20000 Gold disponível', { exact: true }),
  ).toBeVisible();
  await buy(page, 'Espada da Eficiência');
  await page
    .getByRole('button', { name: 'Equipar Espada da Eficiência', exact: true })
    .click();
  await buy(page, 'Lâmina da Otimização');
  await page
    .getByRole('button', { name: 'Equipar Lâmina da Otimização', exact: true })
    .click();
  await expect(
    item(page, 'Lâmina da Otimização').getByText('Equipado', { exact: true }),
  ).toBeVisible();
  await expect(
    item(page, 'Espada da Eficiência').getByText('Na sua coleção', {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    item(page, 'Lâmina da Otimização').getByText(
      'Ao equipar, missão de 100 XP base: +116 XP · +50 Gold · +4 Comida.',
      { exact: true },
    ),
  ).toBeVisible();
  await page.goto('/');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  await page
    .getByLabel('O que você quer fazer?')
    .fill('Experimentar os novos bônus');
  await page
    .getByRole('combobox', { name: 'Esforço desta missão', exact: true })
    .selectOption('medium');
  await page.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await page.waitForURL(/missao/);
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(page.getByLabel('Recompensa recebida')).toContainText('+116');
  const saved = await backup(page);
  expect(saved.data.profile.gold).toBe(15050);
  expect(
    saved.data.ownedShopItems
      .filter((row: any) => row.equipped)
      .map((row: any) => row.itemId),
  ).toEqual([106]);
});
test('duas abas compram um equipamento uma vez e preservam o saldo', async ({
  page,
  context,
}) => {
  await seed(page);
  await page.goto('/loja');
  const other = await context.newPage();
  await other.goto('/loja');
  for (const tab of [page, other])
    await tab
      .getByRole('button', {
        name: 'Comprar Espada da Eficiência',
        exact: true,
      })
      .click();
  await Promise.all(
    [page, other].map((tab) =>
      tab
        .getByRole('dialog', { name: 'Confirmar compra', exact: true })
        .getByRole('button', { name: 'Confirmar · 1800 Gold', exact: true })
        .evaluate((button: HTMLButtonElement) => button.click()),
    ),
  );
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(other.getByRole('dialog')).not.toBeVisible();
  const saved = await backup(page);
  expect(saved.data.profile.gold).toBe(18200);
  expect(saved.data.ownedShopItems).toHaveLength(1);
});
test('evolução confirma comida e bônus, persiste e restaura recibo', async ({
  page,
}) => {
  await seed(page);
  await page.goto('/bestiario');
  await pet(page)
    .getByRole('button', { name: 'Evoluir · 100 Comida', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Confirmar cuidado',
    exact: true,
  });
  await expect(
    dialog.getByText('Novo bônus: +10% XP.', { exact: true }),
  ).toBeVisible();
  await dialog
    .getByRole('button', { name: 'Confirmar · 100 Comida', exact: true })
    .click();
  await expect(
    page.getByText('400 Comida disponível', { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    pet(page).getByText('Evolução 2 de 3 · +10% XP', { exact: true }),
  ).toBeVisible();
  await expect(
    pet(page, 'Dragão Ancião').getByRole('button', {
      name: 'Disponível no nível 15',
      exact: true,
    }),
  ).toBeDisabled();
  const saved = await backup(page);
  expect(saved.data.companions[0].careHistory).toHaveLength(1);
  await restore(page, saved);
  await page.goto('/bestiario');
  await pet(page).getByText('Últimos cuidados', { exact: true }).click();
  await expect(pet(page).getByText(/100 Comida · evolução 2/)).toBeVisible();
  await expect(
    page.getByText('400 Comida disponível', { exact: true }),
  ).toBeVisible();
});
test('prévia de cuidado aberta em duas abas não gasta duas vezes', async ({
  page,
  context,
}) => {
  await seed(page);
  await page.goto('/bestiario');
  const other = await context.newPage();
  await other.goto('/bestiario');
  for (const tab of [page, other])
    await pet(tab)
      .getByRole('button', { name: 'Evoluir · 100 Comida', exact: true })
      .click();
  await page
    .getByRole('dialog', { name: 'Confirmar cuidado', exact: true })
    .getByRole('button', { name: 'Confirmar · 100 Comida', exact: true })
    .click();
  await expect(other.getByRole('alert')).toContainText('outra aba');
  await expect(
    other
      .getByRole('dialog', { name: 'Confirmar cuidado', exact: true })
      .getByRole('button', { name: 'Confirmar · 100 Comida', exact: true }),
  ).toBeDisabled();
  await other
    .getByRole('button', { name: 'Atualizar prévia', exact: true })
    .click();
  await expect(
    other
      .getByRole('dialog', { name: 'Confirmar cuidado', exact: true })
      .getByRole('button', { name: 'Confirmar · 200 Comida', exact: true }),
  ).toBeEnabled();
  await other.getByRole('button', { name: 'Cancelar', exact: true }).click();
  const saved = await backup(page);
  expect(saved.data.profile.food).toBe(400);
  expect(saved.data.companions[0].careHistory).toHaveLength(1);
});
test('transformação usa recibo e estorno devolve o ambiente anterior', async ({
  page,
}) => {
  await seed(page, { gold: 0, food: 0, totalXpEarned: 2490 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  await page
    .getByLabel('O que você quer fazer?')
    .fill('Cultivar um marco real');
  await page.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await page.waitForURL(/missao/);
  const url = page.url();
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Missão concluída!', exact: true }),
  ).toBeVisible();
  await page.goto('/refugio');
  await expect(
    page
      .locator('.collection-scene')
      .getByRole('heading', { name: 'Brotinho', exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/Recibo de origem preservado/)).toBeVisible();
  await page.goto(url);
  await page
    .getByRole('button', { name: 'Desfazer conclusão', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Concluir missão', exact: true }),
  ).toBeVisible();
  await page.goto('/refugio');
  await expect(
    page
      .locator('.collection-scene')
      .getByRole('heading', { name: 'Semente', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Registro estornado', { exact: true }),
  ).toBeVisible();
});
test('conquistas de coleção acompanham posse e saldo; metas futuras ficam separadas', async ({
  page,
}) => {
  await seed(page, { gold: 5000, food: 0 });
  await page.goto('/trofeus');
  await page.getByRole('button', { name: /Conquistadas ·/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Pão-Duro', exact: true }),
  ).toBeVisible();
  await page.goto('/loja');
  await buy(page, 'Espada da Eficiência');
  await page.goto('/trofeus');
  await page.getByRole('button', { name: /Conquistadas ·/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Primeira Compra', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Pão-Duro', exact: true }),
  ).not.toBeVisible();
  await page.getByRole('button', { name: 'Futuras', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Semideus', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Primeira Compra', exact: true }),
  ).not.toBeVisible();
});
test('lista funcional continua acessível sem arte em 320x568 e texto ampliado', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.route('**/art/**', (route) => route.abort());
  for (const [route, title] of [
    ['/refugio', 'Refúgio'],
    ['/bestiario', 'Companheiros'],
    ['/loja', 'Loja'],
    ['/inventario', 'Minha coleção'],
    ['/trofeus', 'Conquistas'],
  ]) {
    await page.goto(route);
    await expect(
      page.getByRole('heading', { name: title, level: 1, exact: true }),
    ).toBeVisible();
    await page.addStyleTag({ content: '.lmu-design {font-size:200%}' });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(
      page.getByRole('navigation', { name: 'Explorar o Refúgio', exact: true }),
    ).toBeVisible();
  }
  await page.goto('/refugio');
  await expect(
    page.getByRole('link', { name: 'Cuidar dos companheiros', exact: true }),
  ).toBeVisible();
});
