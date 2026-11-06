import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { confirmBackupImport } from './backup-ui';
import {
  campReady,
  campData,
  campSeed,
  campPoint,
  campBuy,
  campBack,
  campCapture,
} from './camp-flow';
test.beforeEach(async ({ page }) => {
  await page.goto('/acampamento');
  await campReady(page);
});
test('Centro normal não provisiona recursos nem oferece simulação ou reinício sintético', async ({
  page,
}, info) => {
  await expect(page.getByTestId('camp-balance')).toHaveText(
    '0 ouro · 0 comida',
  );
  await expect(page.locator('.simulation-tools')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Reiniciar demonstração', exact: true }),
  ).toHaveCount(0);
  const saved = await campData(page);
  expect(saved.profile.campPreview).toBeUndefined();
  expect(saved.profile.totalXpEarned).toBe(0);
  await campPoint(page, 'caretaker', 'Caseiro');
  await expect(
    page.getByRole('button', {
      name: 'Confirmar construção · 50 ouro',
      exact: true,
    }),
  ).toBeDisabled();
  await page.keyboard.press('Escape');
  await campCapture(page, info, 'normal-empty');
  await page.goto('/aposentos');
  await campReady(page);
  await expect(page.getByTestId('camp-scene')).toHaveAttribute(
    'data-scene',
    'center',
  );
  expect((await campData(page)).profile.gold).toBe(0);
});
test('compra habilita as três cenas e conserva o débito único em outra aba e na recarga', async ({
  page,
  context,
}, info) => {
  await campSeed(page, { gold: 100, food: 83, totalXpEarned: 123 });
  const before = await campData(page);
  const other = await context.newPage();
  await other.goto('/acampamento');
  await campReady(other);
  await campBuy(page);
  await expect(other.getByTestId('point-interior')).toBeAttached();
  await page.reload();
  await campReady(page);
  await expect(page.getByTestId('camp-balance')).toHaveText(
    '50 ouro · 83 comida',
  );
  const after = await campData(page);
  expect(after.profile.totalXpEarned).toBe(123);
  expect(after.profile.level).toBe(before.profile.level);
  expect(
    after.audit.filter((r: any) => r.id === 'camp-settlement:built'),
  ).toHaveLength(1);
  await campCapture(page, info, 'normal-built');
  await other.close();
});
test('Aposentos abre direto o interior, painéis são reutilizados e criaturas não descobertas ficam ocultas no Centro', async ({
  page,
}, info) => {
  await campSeed(page, { gold: 100 });
  await campBuy(page);
  await page.goto('/aposentos');
  await expect(page.getByTestId('camp-scene')).toHaveAttribute(
    'data-scene',
    'interior',
  );
  for (const [id, label, text] of [
    ['equipment', 'Equipamentos', 'Minha coleção'],
    ['collection', 'Coleção', 'Minha coleção'],
    ['trophies', 'Troféus', 'Conquistas'],
    ['records', 'Registros', 'Meu progresso'],
  ]) {
    await campPoint(page, id, label);
    await expect(page.getByRole('dialog')).toContainText(text);
    await expect(page.getByTestId('camp-scene')).toHaveAttribute(
      'data-scene',
      'interior',
    );
    await page
      .getByRole('button', { name: 'Fechar diálogo', exact: true })
      .click();
  }
  await campCapture(page, info, 'normal-interior');
  await campBack(page);
  await campPoint(page, 'bestiary', 'Bestiário');
  await campPoint(page, 'companions', 'Companheiros descobertos');
  await expect(
    page
      .locator('.collection-pet')
      .getByRole('heading', { name: 'Lobo Etéreo', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Lorde Lich', exact: true }),
  ).toHaveCount(0);
  await expect(page.locator('.collection-pet')).toHaveCount(1);
});
test('quatro estágios usam XP canônico nas duas cenas e ignoram simulação de backup da demonstração', async ({
  page,
}, info) => {
  await campSeed(page, {
    gold: 100,
    campPreview: {
      version: 1,
      epoch: 'synthetic-backup',
      revision: 0,
      caretakerMet: true,
      residenceBuilt: true,
      simulatedXp: 12000,
      discoveredCompanionIds: [],
    },
  });
  await campBuy(page);
  const initial = await campData(page);
  for (const [n, xp] of [
    [1, 0],
    [2, 2500],
    [3, 7500],
    [4, 12000],
  ]) {
    await campSeed(page, { totalXpEarned: xp });
    await expect(page.getByTestId('layered-scene')).toHaveAttribute(
      'data-scene',
      'center-built-' + n,
    );
    const source = await page
      .locator('img[data-layer="tree"]')
      .getAttribute('src');
    await campPoint(page, 'garden', 'Jardim da Árvore');
    await expect(page.getByTestId('layered-scene')).toHaveAttribute(
      'data-scene',
      'garden-' + n,
    );
    expect(
      await page.locator('img[data-layer="tree"]').getAttribute('src'),
    ).toBe(source);
    await page
      .locator('img[data-layer="tree"]')
      .evaluate((image) => (image as HTMLImageElement).decode());
    await campCapture(page, info, 'normal-garden-stage-' + n);
    await campPoint(page, 'tree', 'Árvore de Evolução');
    await expect(page.getByRole('dialog')).not.toContainText(
      'Simulação visual',
    );
    await page
      .getByRole('button', {
        name: 'Consultar registros do ambiente',
        exact: true,
      })
      .click();
    await expect(page.getByRole('dialog')).toContainText(
      'Transformações do ambiente',
    );
    await page
      .getByRole('button', { name: 'Fechar diálogo', exact: true })
      .click();
    await campBack(page);
  }
  const final = await campData(page);
  expect(final.profile.gold).toBe(initial.profile.gold);
  expect(final.audit).toEqual(initial.audit);
  expect(final.profile.ecoGoldClaimedUpToStage).toBe(
    initial.profile.ecoGoldClaimedUpToStage,
  );
});
test('backup e restauração conservam construção e saldo sem segunda cobrança', async ({
  page,
}) => {
  await campSeed(page, { gold: 100 });
  await campBuy(page);
  await page.goto('/config');
  const pending = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Exportar dados', exact: true })
    .click();
  const saved = JSON.parse(
    await readFile((await (await pending).path())!, 'utf8'),
  );
  expect(saved.data.profile.gold).toBe(50);
  expect(saved.data.profile.campSettlement.residenceBuilt).toBe(true);
  await page.locator('input[type=file]').setInputFiles({
    name: 'camp-synthetic.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(saved)),
  });
  await confirmBackupImport(page);
  await page.goto('/acampamento');
  await campReady(page);
  await expect(page.getByTestId('point-interior')).toBeAttached();
  expect((await campData(page)).profile.gold).toBe(50);
});
test('320 px mantém o retorno dentro da cena e as áreas em preparação sem interface econômica', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 740 });
  const back = page.getByRole('link', {
    name: 'Voltar ao Mundo',
    exact: false,
  });
  await expect(back).toBeVisible();
  const rect = await back.boundingBox(),
    frame = await page.locator('.scene-frame').boundingBox();
  expect(rect!.x - frame!.x).toBeCloseTo(16, 0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await campPoint(page, 'preparation', 'Outras áreas');
  await expect(
    page.getByRole('heading', { name: 'Região em preparação', exact: true }),
  ).toBeVisible();
  await expect(
    page.locator('.resource-panel,canvas.terrain-region'),
  ).toHaveCount(0);
  await campCapture(page, info, 'normal-preparation');
  await campBack(page);
});

test('conclusão de missão atualiza imediatamente Centro e Jardim já abertos, sem simulação', async ({
  page,
  context,
}, info) => {
  await campSeed(page, { gold: 100, totalXpEarned: 2490 });
  await campBuy(page);
  const garden = await context.newPage();
  await garden.goto('/acampamento?scene=garden');
  await expect(garden.getByTestId('layered-scene')).toHaveAttribute(
    'data-scene',
    'garden-1',
  );
  const mission = await context.newPage();
  await mission.goto('/');
  await mission
    .getByRole('button', { name: 'Nova missão', exact: true })
    .click();
  const dialog = mission.getByRole('dialog', { name: 'Uma nova missão' });
  await dialog
    .getByLabel('O que você quer fazer?')
    .fill('Crescer a árvore por XP da jornada');
  await dialog
    .getByRole('button', { name: 'Criar missão', exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await mission.goto('/missoes');
  await mission.getByRole('button', { name: 'Todas', exact: true }).click();
  await mission
    .getByRole('link', {
      name: 'Crescer a árvore por XP da jornada',
      exact: true,
    })
    .click();
  await mission
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    mission.getByRole('heading', { name: 'Missão concluída!', exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId('layered-scene')).toHaveAttribute(
    'data-scene',
    'center-built-2',
  );
  await expect(garden.getByTestId('layered-scene')).toHaveAttribute(
    'data-scene',
    'garden-2',
  );
  const state = await campData(page);
  expect(state.profile.totalXpEarned).toBeGreaterThanOrEqual(2500);
  expect(state.profile.campPreview).toBeUndefined();
  expect(
    state.audit.filter((row: any) => row.id === 'camp-settlement:built'),
  ).toHaveLength(1);
  await campCapture(page, info, 'normal-xp-updated');
  await garden.close();
  await mission.close();
});
