import { test, expect } from '@playwright/test';
import {
  ready,
  buy,
  point,
  back,
  capture,
  readState,
  seedLegacy,
  seedKnownWolf,
  watchDatabase,
  personalSentinel,
} from './helpers';
test.beforeEach(async ({ context, page }) => {
  await watchDatabase(context);
  await page.goto('/acampamento');
  await ready(page);
});
test('Centro vazio, áreas bloqueadas e Região em preparação', async ({
  page,
}, info) => {
  await expect(page.getByTestId('camp-balance')).toHaveText(
    '50 ouro · 120 comida',
  );
  await expect(page.locator('[data-layer="tree"]')).toHaveCount(0);
  await expect(page.getByTestId('point-interior')).toHaveCount(0);
  for (const text of [
    'Ver cena inteira',
    'Ocultar indicações',
    'Olhar para a esquerda',
    'Olhar para a direita',
  ])
    await expect(
      page.getByRole('button', { name: text, exact: true }),
    ).toHaveCount(0);
  await capture(page, info, 'center-empty');
  await capture(page, info, 'center-empty-canvas', true);
  await point(page, 'preparation', 'Outras áreas', info);
  await expect(
    page.getByRole('heading', { name: 'Região em preparação', exact: true }),
  ).toBeVisible();
  await expect(page.locator('body')).not.toContainText(
    'Construções e produção existentes',
  );
  await capture(page, info, 'preparation');
  await back(page);
  await page.goto('/aposentos');
  await ready(page);
  await expect(page.getByTestId('camp-scene')).toHaveAttribute(
    'data-scene',
    'center',
  );
  await page.goto('/acampamento?legacy=1');
  await ready(page);
  await expect(page.getByTestId('camp-scene')).toHaveAttribute(
    'data-scene',
    'center',
  );
});
test('Compra única abre diretamente o interior e reutiliza painéis existentes', async ({
  page,
}, info) => {
  await point(page, 'caretaker', 'Caseiro', info);
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Aposentos');
  await expect(dialog).toContainText('Bestiário');
  await expect(dialog).toContainText('Jardim da Árvore');
  await expect(dialog).toContainText('Após construir');
  await capture(page, info, 'construction-confirmation');
  await page
    .getByRole('button', {
      name: 'Confirmar construção · 50 ouro',
      exact: true,
    })
    .click();
  await expect(page.getByTestId('point-interior')).toBeAttached();
  const state = await readState(page);
  expect(state.profile.gold).toBe(0);
  expect(
    state.audits.filter((row) => row.id === 'camp-preview:residence:built'),
  ).toHaveLength(1);
  await capture(page, info, 'center-built');
  await point(page, 'interior', 'Aposentos', info);
  await expect(page.getByTestId('camp-scene')).toHaveAttribute(
    'data-scene',
    'interior',
  );
  await capture(page, info, 'interior');
  for (const [id, label, content] of [
    ['equipment', 'Equipamentos', 'Minha coleção'],
    ['collection', 'Coleção', 'Minha coleção'],
    ['trophies', 'Troféus', 'Conquistas'],
    ['records', 'Registros', 'Meu progresso'],
  ]) {
    await point(page, id, label, info);
    await expect(page.getByRole('dialog')).toContainText(content);
    await expect(page.getByTestId('camp-scene')).toHaveAttribute(
      'data-scene',
      'interior',
    );
    await capture(page, info, 'panel-' + id);
    await page
      .getByRole('button', { name: 'Fechar diálogo', exact: true })
      .click();
  }
  await back(page);
  await point(page, 'bestiary', 'Bestiário', info);
  await capture(page, info, 'bestiary-empty');
  await point(page, 'companions', 'Companheiros descobertos', info);
  await expect(
    page.getByRole('heading', {
      name: 'Nenhum companheiro descoberto',
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator('.collection-pet')).toHaveCount(0);
  await capture(page, info, 'no-undiscovered-creatures');
  await page
    .getByRole('button', { name: 'Fechar diálogo', exact: true })
    .click();
  await back(page);
  await page.goto('/aposentos');
  await expect(page.getByTestId('camp-scene')).toHaveAttribute(
    'data-scene',
    'interior',
  );
});
test('Quatro estágios sincronizados, ancoragem dos rótulos e persistência sem recompensas', async ({
  page,
}, info) => {
  await buy(page, info);
  await page.locator('.simulation-tools summary').click();
  const names = ['Semente', 'Brotinho', 'Árvore Jovem', 'Floresta Anciã'];
  for (let n = 1; n <= 4; n++) {
    await page
      .getByRole('button', {
        name: 'Simular estágio ' + n + ' — ' + names[n - 1],
        exact: true,
      })
      .click();
    await expect(page.getByTestId('layered-scene')).toHaveAttribute(
      'data-scene',
      'center-built-' + n,
    );
    await page
      .locator('img[data-layer="tree"]')
      .evaluate((image) => (image as HTMLImageElement).decode());
    const source = await page
      .locator('img[data-layer="tree"]')
      .getAttribute('src');
    const box = await page.getByTestId('layered-scene').boundingBox();
    const garden = await page.getByTestId('point-garden').boundingBox();
    expect(box && garden).toBeTruthy();
    expect(
      Math.abs((garden!.x + garden!.width / 2 - box!.x) / box!.width - 0.793),
    ).toBeLessThan(0.002);
    expect(garden!.height).toBeGreaterThanOrEqual(44);
    await capture(page, info, 'center-stage-' + n);
    await capture(page, info, 'center-stage-' + n + '-canvas', true);
    await point(page, 'garden', 'Jardim da Árvore', info);
    await expect(page.getByTestId('layered-scene')).toHaveAttribute(
      'data-scene',
      'garden-' + n,
    );
    await page
      .locator('img[data-layer="tree"]')
      .evaluate((image) => (image as HTMLImageElement).decode());
    expect(
      await page.locator('img[data-layer="tree"]').getAttribute('src'),
    ).toBe(source);
    await capture(page, info, 'garden-stage-' + n);
    await capture(page, info, 'garden-stage-' + n + '-canvas', true);
    await back(page);
  }
  await page.reload();
  await ready(page);
  await expect(page.getByTestId('layered-scene')).toHaveAttribute(
    'data-scene',
    'center-built-4',
  );
  const state = await readState(page);
  expect(state.profile.gold).toBe(0);
  expect(state.profile.food).toBe(120);
  expect(state.profile.totalXpEarned).toBe(0);
  expect(state.profile.level).toBe(1);
  expect(state.profile.campPreview!.simulatedXp).toBe(12000);
  expect(
    state.audits.filter((row) => row.action === 'camp-preview:build'),
  ).toHaveLength(1);
  await expect
    .poll(() => page.evaluate(() => window.__unexpectedPersonalOpens))
    .toEqual([]);
});
test('Preserva o saldo e a construção do protótipo anterior', async ({
  page,
}, info) => {
  await seedLegacy(page);
  await page.reload();
  await ready(page);
  await expect(page.getByTestId('camp-balance')).toHaveText(
    '37 ouro · 88 comida',
  );
  await expect(page.getByTestId('point-interior')).toBeAttached();
  await point(page, 'caretaker', 'Caseiro', info);
  await expect(
    page.getByRole('button', {
      name: 'Confirmar construção · 50 ouro',
      exact: true,
    }),
  ).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Fechar diálogo', exact: true })
    .click();
  await page.reload();
  await ready(page);
  const state = await readState(page);
  expect(state.profile.gold).toBe(37);
  expect(state.profile.food).toBe(88);
  expect(state.profile.campPreview).toEqual({
    version: 1,
    epoch: 'legacy-demo-epoch',
    revision: 7,
    caretakerMet: true,
    residenceBuilt: true,
  });
  await capture(page, info, 'preserved-legacy-state');
});
test('Reinício exige confirmação, retorna ao Centro e preserva banco pessoal artificial', async ({
  page,
}, info) => {
  await personalSentinel(page, true);
  await buy(page, info);
  await page.locator('.simulation-tools summary').click();
  await page
    .getByRole('button', {
      name: 'Simular estágio 4 — Floresta Anciã',
      exact: true,
    })
    .click();
  await expect(page.getByTestId('layered-scene')).toHaveAttribute(
    'data-scene',
    'center-built-4',
  );
  await point(page, 'garden', 'Jardim da Árvore', info);
  const before = await readState(page);
  await page
    .getByRole('button', { name: 'Reiniciar demonstração', exact: true })
    .click();
  await capture(page, info, 'reset-confirmation');
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  expect((await readState(page)).profile).toEqual(before.profile);
  await page
    .getByRole('button', { name: 'Reiniciar demonstração', exact: true })
    .click();
  await page
    .getByRole('button', {
      name: 'Confirmar reinício da demonstração',
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/\/acampamento$/);
  await expect(page.getByTestId('camp-scene')).toHaveAttribute(
    'data-scene',
    'center',
  );
  await expect(page.getByTestId('camp-balance')).toHaveText(
    '50 ouro · 120 comida',
  );
  await expect(page.getByTestId('point-interior')).toHaveCount(0);
  const after = await readState(page);
  expect(after.profile.totalXpEarned).toBe(0);
  expect(after.profile.campPreview!.simulatedXp).toBeUndefined();
  expect(after.profile.campPreview!.discoveredCompanionIds).toEqual([]);
  expect(after.profile.campPreview!.epoch).not.toBe(
    before.profile.campPreview!.epoch,
  );
  expect(after.recoveries).toBe(1);
  expect(await personalSentinel(page)).toBe('synthetic-personal-sentinel');
  expect(await page.evaluate(() => window.__unexpectedPersonalOpens)).toEqual(
    [],
  );
  await capture(page, info, 'reset-finished');
});
test('Duas abas atualizam a mesma construção com um único débito', async ({
  page,
  context,
}, info) => {
  const other = await context.newPage();
  await other.goto('/acampamento');
  await ready(other);
  await point(page, 'caretaker', 'Caseiro', info);
  await point(other, 'caretaker', 'Caseiro', info);
  await page
    .getByRole('button', {
      name: 'Confirmar construção · 50 ouro',
      exact: true,
    })
    .click();
  await expect(other.getByTestId('camp-balance')).toHaveText(
    '0 ouro · 120 comida',
  );
  await expect(
    other.getByRole('button', {
      name: 'Confirmar construção · 50 ouro',
      exact: true,
    }),
  ).toHaveCount(0);
  await other
    .getByRole('button', { name: 'Fechar diálogo', exact: true })
    .click();
  const state = await readState(other);
  expect(
    state.audits.filter((row) => row.id === 'camp-preview:residence:built'),
  ).toHaveLength(1);
  await other.reload();
  await ready(other);
  await expect(other.getByTestId('point-interior')).toBeAttached();
  await other.close();
});
test('Teclado e acessos móveis mantêm alvos utilizáveis', async ({
  page,
}, info) => {
  const target =
    info.project.name === 'mobile'
      ? page
          .getByRole('navigation', { name: 'Acessos da cena' })
          .getByRole('button', { name: 'Caseiro', exact: true })
      : page.getByTestId('point-caretaker');
  await target.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  if (info.project.name === 'mobile') {
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const box of await page
      .getByRole('navigation', { name: 'Acessos da cena' })
      .locator('button')
      .all()) {
      const rect = await box.boundingBox();
      expect(rect!.height).toBeGreaterThanOrEqual(44);
    }
    await expect(page.locator('.mobile-hint')).toBeVisible();
    await capture(page, info, 'responsive-access');
  }
});
test.describe('primeiro carregamento completo offline', () => {
  test.use({ serviceWorkers: 'allow' });
  test('Navega, cuida de companhia descoberta, recarrega e reinicia sem internet', async ({
    page,
    context,
  }, info) => {
    await buy(page, info);
    await seedKnownWolf(page);
    await page.reload();
    await ready(page);
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await context.setOffline(true);
    await point(page, 'interior', 'Aposentos', info);
    await point(page, 'equipment', 'Equipamentos', info);
    await expect(page.getByRole('dialog')).toContainText('Minha coleção');
    await page
      .getByRole('button', { name: 'Fechar diálogo', exact: true })
      .click();
    await back(page);
    await point(page, 'bestiary', 'Bestiário', info);
    await point(page, 'companions', 'Companheiros descobertos', info);
    const portrait = page.locator('img[alt="Lobo Etéreo"]');
    await expect(portrait).toBeVisible();
    await expect
      .poll(() =>
        portrait.evaluate(
          (image) =>
            (image as HTMLImageElement).complete &&
            (image as HTMLImageElement).naturalWidth > 0,
        ),
      )
      .toBe(true);
    await expect(
      page.getByRole('heading', { name: 'Lorde Lich', exact: true }),
    ).toHaveCount(0);
    await expect(page.locator('.collection-pet')).toHaveCount(1);
    await page
      .getByRole('button', { name: 'Alimentar +10', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Confirmar · 10 Comida', exact: true })
      .click();
    await expect(page.getByTestId('camp-balance')).toHaveText(
      '0 ouro · 110 comida',
    );
    const afterCare = await readState(page);
    expect(afterCare.companions.find((pet) => pet.id === 1)?.foodInvested).toBe(
      10,
    );
    expect(afterCare.profile.totalXpEarned).toBe(0);
    await page
      .getByRole('button', { name: 'Fechar diálogo', exact: true })
      .click();
    await back(page);
    await point(page, 'garden', 'Jardim da Árvore', info);
    await page.locator('.simulation-tools summary').click();
    await page
      .getByRole('button', {
        name: 'Simular estágio 4 — Floresta Anciã',
        exact: true,
      })
      .click();
    await expect(page.getByTestId('layered-scene')).toHaveAttribute(
      'data-scene',
      'garden-4',
    );
    await page.reload();
    await expect(page.getByTestId('camp-scene')).toHaveAttribute(
      'data-scene',
      'garden',
    );
    await expect(page.getByTestId('layered-scene')).toHaveAttribute(
      'data-scene',
      'garden-4',
    );
    await capture(page, info, 'offline-garden');
    await page
      .getByRole('button', { name: 'Reiniciar demonstração', exact: true })
      .click();
    await page
      .getByRole('button', {
        name: 'Confirmar reinício da demonstração',
        exact: true,
      })
      .click();
    await expect(page.getByTestId('camp-balance')).toHaveText(
      '50 ouro · 120 comida',
    );
    await expect(page.getByTestId('point-interior')).toHaveCount(0);
    await page.reload();
    await ready(page);
    await expect(page.getByTestId('camp-balance')).toHaveText(
      '50 ouro · 120 comida',
    );
  });
});
