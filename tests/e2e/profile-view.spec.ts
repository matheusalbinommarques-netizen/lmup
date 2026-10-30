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
async function seed(page: Page, fields: Record<string, unknown>) {
  const saved = await backup(page);
  Object.assign(saved.data.profile, fields);
  await page.locator('input[type=file]').setInputFiles({
    name: 'perfil.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(saved)),
  });
  await confirmBackupImport(page);
}
async function capture(page: Page, name: string, project: string) {
  if (!process.env.LMU_CAPTURE_DIR) return;
  await page.locator('img').evaluateAll(async (images) => {
    await Promise.all(
      images.map(async (element) => {
        const image = element as HTMLImageElement;
        image.loading = 'eager';
        try {
          await image.decode();
        } catch {
          /* Artwork provides a fallback when an image is unavailable. */
        }
      }),
    );
  });
  await page.screenshot({
    path: process.env.LMU_CAPTURE_DIR + '/' + project + '-' + name + '.png',
    fullPage: true,
  });
}
function reward(page: Page) {
  return page.getByLabel('Prévia de recompensa', { exact: true });
}

test('perfil vazio apresenta dados reais, mantém atalhos e não grava ao ser consultado', async ({
  page,
}, info) => {
  const before = await backup(page);
  await page.goto('/perfil');
  await expect(
    page.getByRole('heading', {
      name: 'Perfil e equipamentos',
      level: 1,
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: before.data.profile.name, exact: true }),
  ).toBeVisible();
  await expect(reward(page)).toContainText('+105 XP');
  await expect(page.getByText('Sem equipamento', { exact: true })).toHaveCount(
    6,
  );
  for (const [name, href] of [
    ['Ver meu progresso e histórico', '/progresso'],
    ['Gerenciar equipamentos', '/inventario'],
    ['Trocar companheiro', '/bestiario'],
    ['Loja', '/loja'],
    ['Conquistas', '/trofeus'],
    ['Refúgio', '/refugio'],
    ['Configurações e backup', '/config'],
  ]) {
    await expect(
      page.getByRole('main').getByRole('link', { name, exact: true }),
    ).toHaveAttribute('href', href);
  }
  await capture(page, 'perfil-inicial', info.project.name);
  const after = await backup(page);
  expect(after.data).toEqual(before.data);
});

test('equipar e guardar em outra aba atualiza itens, saldo e prévia sem recarregar o perfil', async ({
  page,
  context,
}, info) => {
  await seed(page, { gold: 20000, food: 500 });
  await page.goto('/perfil');
  await expect(reward(page)).toContainText('+105 XP');
  const other = await context.newPage();
  await other.goto('/loja');
  await other
    .getByRole('button', { name: 'Comprar Lâmina da Otimização', exact: true })
    .click();
  await other
    .getByRole('dialog', { name: 'Confirmar compra', exact: true })
    .getByRole('button', { name: /Confirmar ·/ })
    .click();
  await other
    .getByRole('button', { name: 'Equipar Lâmina da Otimização', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Lâmina da Otimização', exact: true }),
  ).toBeVisible();
  await expect(reward(page)).toContainText('+116 XP');
  await expect(page.locator('.profile-resources')).toContainText('16800');
  await capture(page, 'perfil-equipado', info.project.name);
  await other
    .getByRole('button', { name: 'Guardar Lâmina da Otimização', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Lâmina da Otimização', exact: true }),
  ).not.toBeVisible();
  await expect(reward(page)).toContainText('+105 XP');
  await other.close();
});

test('seleção de companhia em outra aba é refletida e uma seleção bloqueada não ganha bônus', async ({
  page,
  context,
}, info) => {
  await seed(page, {
    totalXpEarned: 1343,
    level: 5,
    xpCurrent: 0,
    xpNext: 520,
  });
  await page.goto('/perfil');
  const other = await context.newPage();
  await other.goto('/bestiario');
  const lich = other.locator('.collection-pet').filter({
    has: other.getByRole('heading', { name: 'Lorde Lich', exact: true }),
  });
  await lich
    .getByRole('button', { name: 'Escolher companhia', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Lorde Lich', exact: true }),
  ).toBeVisible();
  await expect(reward(page)).toContainText('+100 XP');
  await expect(page.getByText('+5% Comida', { exact: true })).toBeVisible();
  await capture(page, 'perfil-companhia', info.project.name);
  await other.close();
  await seed(page, {
    totalXpEarned: 0,
    level: 1,
    xpCurrent: 0,
    xpNext: 250,
    activeCompanionId: 3,
  });
  await page.goto('/perfil');
  await expect(
    page.getByRole('heading', { name: 'Dragão Ancião', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(/Esta seleção não tem bônus ativo/),
  ).toBeVisible();
  await expect(reward(page)).toContainText('+100 XP');
  await capture(page, 'perfil-selecao-indisponivel', info.project.name);
});

test('perfil no nível máximo, nome longo e modo foco funciona em 320px com texto 200%', async ({
  page,
}, info) => {
  await seed(page, {
    name: 'Uma identidade muito longa para conferir a leitura no celular',
    totalXpEarned: 250000,
    level: 30,
    xpCurrent: 0,
    xpNext: 0,
  });
  await page.evaluate(() =>
    localStorage.setItem(
      'lmup:neuro-prefs',
      JSON.stringify({
        focusMode: true,
        reducedMotion: true,
        lowStimulus: true,
      }),
    ),
  );
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/perfil');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  await expect(
    page.getByText(
      'Nível máximo disponível. Seu XP acumulado continua registrado.',
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.locator('#profile-level-progress')).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await capture(page, 'perfil-320-foco', info.project.name);
  const edit = page.getByRole('button', { name: 'Editar perfil', exact: true });
  await edit.click();
  await expect(
    page
      .getByRole('dialog', { name: 'Editar perfil', exact: true })
      .getByLabel('Nome do herói'),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(edit).toBeFocused();
});

test('falha de consulta ao vivo não desmonta o rascunho de identidade aberto', async ({
  page,
  context,
}, info) => {
  await page.goto('/perfil');
  await page
    .getByRole('button', { name: 'Editar perfil', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Editar perfil',
    exact: true,
  });
  await dialog
    .getByLabel('Nome do herói')
    .fill('Este rascunho precisa continuar aqui');
  await page.evaluate(() => {
    const get = IDBObjectStore.prototype.get;
    (window as any).profileReadFaults = 0;
    IDBObjectStore.prototype.get = function (key) {
      if (this.name === 'profile') {
        (window as any).profileReadFaults++;
        throw new DOMException(
          'Falha simulada de leitura do perfil',
          'SecurityError',
        );
      }
      return get.call(this, key);
    };
  });
  const other = await context.newPage();
  await other.goto('/perfil');
  await other
    .getByRole('button', { name: 'Editar perfil', exact: true })
    .click();
  const second = other.getByRole('dialog', {
    name: 'Editar perfil',
    exact: true,
  });
  await second.getByLabel('Nome do herói').fill('Nome confirmado na outra aba');
  await second
    .getByRole('button', { name: 'Salvar perfil', exact: true })
    .click();
  await expect(second).not.toBeVisible();
  await expect
    .poll(() => page.evaluate(() => (window as any).profileReadFaults))
    .toBeGreaterThan(0);
  await expect(
    page
      .locator('.journey-error')
      .filter({ hasText: 'Falha simulada de leitura do perfil' }),
  ).toBeVisible();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel('Nome do herói')).toHaveValue(
    'Este rascunho precisa continuar aqui',
  );
  await capture(page, 'perfil-falha-consulta', info.project.name);
  await other.close();
});
