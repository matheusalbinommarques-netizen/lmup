import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { confirmBackupImport } from './backup-ui';
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
    name: 'alpha2.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(data)),
  });
  await confirmBackupImport(page);
}
async function seed(
  page: Page,
  fields: Record<string, any> = { gold: 20000, food: 500 },
) {
  const data = await backup(page);
  Object.assign(data.data.profile, fields);
  await restore(page, data);
  return data;
}
async function mission(page: Page, title = 'Um passo registrado') {
  await page.goto('/');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  await page.getByLabel('O que você quer fazer?').fill(title);
  await page.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await page.waitForURL(/missao/);
  return page.url();
}
async function complete(page: Page) {
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Esse passo é seu.', exact: true }),
  ).toBeVisible();
}
function metric(page: Page, label: string) {
  return page
    .locator('.progress-metrics .lmu-card')
    .filter({ hasText: label })
    .locator('strong');
}
test('histórico separa missão e revisão e mantém concessão e estorno no líquido', async ({
  page,
}) => {
  const url = await mission(page);
  await complete(page);
  await page
    .getByRole('button', { name: 'Configurar revisão', exact: true })
    .click();
  const form = page.getByRole('dialog', {
    name: 'Revisões desta missão',
    exact: true,
  });
  const today = await page.evaluate(() =>
    new Date().toLocaleDateString('en-CA'),
  );
  await form.getByLabel('Próxima revisão', { exact: true }).fill(today);
  await form
    .getByRole('button', { name: 'Salvar revisões', exact: true })
    .click();
  await complete(page);
  await page.goto('/progresso');
  await expect(metric(page, 'Missões distintas')).toHaveText('1');
  await expect(metric(page, 'Sessões de revisão válidas')).toHaveText('1');
  await expect(metric(page, 'XP líquido no período')).toHaveText('+106');
  await page.goto(url);
  await page
    .getByRole('button', { name: 'Desfazer última sessão', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Concluir missão', exact: true }),
  ).toBeVisible();
  await page.goto('/progresso');
  await expect(metric(page, 'XP líquido no período')).toHaveText('+53');
  await expect(metric(page, 'Missões distintas')).toHaveText('1');
  await expect(metric(page, 'Sessões de revisão válidas')).toHaveText('0');
  await page.getByLabel('Mostrar', { exact: true }).selectOption('reversal');
  await expect(page.locator('.progress-ledger>li')).toHaveCount(1);
  await expect(page.locator('.progress-receipt')).toHaveText(
    '-53 XP · -25 Gold · -2 Comida',
  );
});
test('compras e cuidado entram como gasto sem fabricar XP e saldos correspondem ao backup', async ({
  page,
}) => {
  await seed(page);
  await mission(page);
  await complete(page);
  await page.goto('/loja');
  await page
    .getByRole('button', { name: 'Comprar Cota da Rotina', exact: true })
    .click();
  await page
    .getByRole('dialog', { name: 'Confirmar compra', exact: true })
    .getByRole('button', { name: 'Confirmar · 500 Gold', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Equipar Cota da Rotina', exact: true }),
  ).toBeVisible();
  await page.goto('/bestiario');
  await page
    .locator('.collection-pet')
    .first()
    .getByRole('button', { name: 'Evoluir · 100 Comida', exact: true })
    .click();
  await page
    .getByRole('dialog', { name: 'Confirmar cuidado', exact: true })
    .getByRole('button', { name: 'Confirmar · 100 Comida', exact: true })
    .click();
  await expect(
    page.getByText('402 Comida disponível', { exact: true }),
  ).toBeVisible();
  const saved = await backup(page);
  await page.goto('/progresso');
  await expect(metric(page, 'XP líquido no período')).toHaveText('+53');
  await expect(page.locator('.progress-ledger>li')).toHaveCount(3);
  await expect(
    page.getByText('Saldo atual: ' + saved.data.profile.gold, { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Saldo atual: ' + saved.data.profile.food, { exact: true }),
  ).toBeVisible();
  await page.getByLabel('Mostrar', { exact: true }).selectOption('purchase');
  await expect(page.locator('.progress-receipt')).toHaveText(
    '0 XP · -500 Gold · 0 Comida',
  );
  await page.getByLabel('Mostrar', { exact: true }).selectOption('care');
  await expect(page.locator('.progress-receipt')).toHaveText(
    '0 XP · 0 Gold · -100 Comida',
  );
});
test('legado preserva saldo sem gerar movimentos ou sessões fictícias', async ({
  page,
}) => {
  const data = await seed(page, { totalXpEarned: 777, gold: 321, food: 11 });
  data.data.tasks = [
    {
      id: 77,
      title: 'Uma missão antiga',
      xp: 777,
      rarity: 'common',
      areaId: 0,
      completed: true,
      status: 'completed',
      createdAt: '2026-10-01T12:00:00Z',
    },
  ];
  data.data.xpLogs = [{ id: 1, date: '2026-10-01', amount: 777 }];
  await restore(page, data);
  await page.goto('/progresso');
  await page
    .getByRole('button', { name: 'Todo o histórico', exact: true })
    .click();
  await expect(metric(page, 'XP líquido no período')).toHaveText('0');
  await expect(metric(page, 'Missões distintas')).toHaveText('0');
  await expect(
    page.getByText('Anterior ou sem registro: +777', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(/1 registros antigos de XP sem recibo vinculado/),
  ).toBeVisible();
  await expect(page.locator('.progress-ledger>li')).toHaveCount(0);
});
test('preferências valem no acesso direto, recarga e outra aba sem ocultar ícones', async ({
  page,
  context,
}) => {
  await page.goto('/config');
  const other = await context.newPage();
  await other.goto('/refugio');
  for (const name of ['Modo foco', 'Texto maior', 'Reduzir movimento'])
    await page.getByRole('checkbox', { name, exact: true }).check();
  await expect(other.locator('html')).toHaveAttribute(
    'data-neuro-focus',
    'true',
  );
  await expect(other.locator('.collection-scene img')).not.toBeVisible();
  await expect(other.locator('html')).toHaveAttribute(
    'data-neuro-large-text',
    'true',
  );
  expect(
    await other.evaluate(
      () => getComputedStyle(document.documentElement).fontSize,
    ),
  ).toBe('18.5px');
  expect(
    await other
      .locator('nav:visible svg')
      .first()
      .evaluate((el) => getComputedStyle(el).opacity),
  ).toBe('1');
  await other.reload();
  await expect(other.locator('html')).toHaveAttribute(
    'data-reduced-motion',
    'true',
  );
  await page
    .getByRole('checkbox', { name: 'Modo foco', exact: true })
    .uncheck();
  await expect(other.locator('html')).toHaveAttribute(
    'data-neuro-focus',
    'false',
  );
  await page.goto('/missoes');
  expect(
    await page
      .locator('.lmu-button')
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe('0s');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/config');
  await page
    .getByRole('checkbox', { name: 'Reduzir movimento', exact: true })
    .uncheck();
  expect(
    await page
      .locator('.lmu-button')
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe('0s');
});
test('importação permite conferir e cancelar, valida erro e atualiza sem recarga', async ({
  page,
}) => {
  await mission(page, 'Missão que será preservada');
  const original = await backup(page);
  const incoming = structuredClone(original);
  incoming.data.profile.name = 'Jornada restaurada';
  await page.locator('input[type=file]').setInputFiles({
    name: 'revisar.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(incoming)),
  });
  const dialog = page.getByRole('dialog', {
    name: 'Importar este backup?',
    exact: true,
  });
  await expect(
    dialog.getByText('Jornada de Jornada restaurada.', { exact: true }),
  ).toBeVisible();
  await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click();
  expect((await backup(page)).data).toEqual(original.data);
  await page.locator('input[type=file]').setInputFiles({
    name: 'corrompido.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{bad json'),
  });
  await expect(page.getByRole('alert')).toContainText('JSON válido');
  expect((await backup(page)).data).toEqual(original.data);
  await restore(page, incoming);
  await page.goto('/');
  await expect(
    page.getByText('Jornada restaurada', { exact: true }),
  ).toBeVisible();
  await page.goto('/config');
  await expect(
    page.getByText(/Última exportação iniciada neste navegador:/),
  ).toBeVisible();
  await expect(
    page.getByRole('button', {
      name: 'Exportar recuperação mais recente',
      exact: true,
    }),
  ).toBeVisible();
});
test('reinício exige confirmação, preserva identidade e conforto e permite recuperar', async ({
  page,
}) => {
  const avatar =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
  await seed(page, {
    name: 'Matheus',
    avatarUrl: avatar,
    gold: 20000,
    food: 500,
  });
  await mission(page, 'Uma jornada a recuperar');
  await complete(page);
  await page.goto('/loja');
  await page
    .getByRole('button', { name: 'Comprar Cota da Rotina', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Confirmar · 500 Gold', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Equipar Cota da Rotina', exact: true }),
  ).toBeVisible();
  const original = await backup(page);
  await page
    .getByRole('checkbox', { name: 'Texto maior', exact: true })
    .check();
  await page
    .getByRole('button', { name: 'Reiniciar jornada', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Reiniciar a jornada?',
    exact: true,
  });
  await expect(
    dialog.getByRole('button', { name: 'Confirmar reinício', exact: true }),
  ).toBeDisabled();
  await dialog.getByLabel('Digite REINICIAR para confirmar').fill('REINICIAR');
  await dialog
    .getByRole('button', { name: 'Confirmar reinício', exact: true })
    .click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Jornada reiniciada.' }),
  ).toBeVisible();
  const reset = await backup(page);
  expect(reset.data.profile.name).toBe('Matheus');
  expect(reset.data.profile.avatarUrl).toBe(avatar);
  expect(reset.data.profile.totalXpEarned).toBe(0);
  expect(reset.data.tasks).toEqual([]);
  expect(reset.data.ownedShopItems).toEqual([]);
  await expect(
    page.getByRole('checkbox', { name: 'Texto maior', exact: true }),
  ).toBeChecked();
  const downloading = page.waitForEvent('download');
  await page
    .getByRole('button', {
      name: 'Exportar recuperação mais recente',
      exact: true,
    })
    .click();
  const recovered = JSON.parse(
    await readFile((await (await downloading).path())!, 'utf8'),
  );
  expect(recovered.data).toEqual(original.data);
  await restore(page, recovered);
  expect((await backup(page)).data).toEqual(original.data);
  await expect(
    page.getByRole('checkbox', { name: 'Texto maior', exact: true }),
  ).toBeChecked();
});
test('falha em guardar preferências mantém controle utilizável e permite exportação', async ({
  page,
}) => {
  await page.goto('/config');
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error('storage blocked');
    };
  });
  await page
    .getByRole('checkbox', { name: 'Texto maior', exact: true })
    .check();
  await expect(
    page.getByText(/navegador não permitiu guardá-las/),
  ).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute(
    'data-neuro-large-text',
    'true',
  );
  const pending = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Exportar dados', exact: true })
    .click();
  expect((await pending).suggestedFilename()).toMatch(/^lmup-backup-/);
  await expect(
    page.getByText(/Exportação iniciada. Confira se o arquivo/),
  ).toBeVisible();
});
test('histórico e configurações funcionam em 320x568 com fonte em 200%', async ({
  page,
}) => {
  await seed(page);
  await mission(page);
  await complete(page);
  await page.setViewportSize({ width: 320, height: 568 });
  for (const route of ['/progresso', '/config']) {
    await page.goto(route);
    await page.addStyleTag({ content: 'html{font-size:32px!important}' });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page
    .getByRole('button', { name: 'Reiniciar jornada', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Reiniciar a jornada?',
    exact: true,
  });
  await expect(
    dialog.getByLabel('Digite REINICIAR para confirmar'),
  ).toBeVisible();
  const bounds = await dialog.boundingBox();
  expect(bounds!.width).toBeLessThanOrEqual(320);
  expect(bounds!.height).toBeLessThanOrEqual(568);
  await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click();
});
