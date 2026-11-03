import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
const output = 'D:/Codex-artifacts/garden-layer-proof-20261103';
await mkdir(join(output, 'captures'), { recursive: true });
const checks = [];
const screenshots = [];
const errors = [];
const external = [];
const check = (name) => {
  checks.push(name);
  console.log('PASS ' + name);
};
const names = ['Semente', 'Brotinho', 'Árvore Jovem', 'Floresta Anciã'];
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1100 },
  deviceScaleFactor: 1,
});
await context.addInitScript(() => {
  window.__dataAccess = { idb: 0, storage: 0 };
  IDBFactory.prototype.open = function () {
    window.__dataAccess.idb++;
    throw new Error('A prova não pode abrir bancos de jogador');
  };
  Storage.prototype.setItem = function () {
    window.__dataAccess.storage++;
    throw new Error('A prova não pode gravar dados de jogador');
  };
});
const page = await context.newPage();
page.on('pageerror', (e) => errors.push(e.message));
page.on('request', (request) => {
  if (
    !request.url().startsWith('http://127.0.0.1:5193') &&
    !request.url().startsWith('data:')
  )
    external.push(request.url());
});
async function ready() {
  await page
    .getByRole('button', { name: 'Estágio 4 — Floresta Anciã', exact: true })
    .waitFor();
  await page.waitForFunction(
    () =>
      !document.querySelector('button[aria-label="Estágio 4 — Floresta Anciã"]')
        .disabled,
  );
}
async function capture(file, locator) {
  const path = join(output, 'captures', file);
  if (locator) await locator.screenshot({ path });
  else await page.screenshot({ path, fullPage: true });
  screenshots.push(path);
}
await page.goto('http://127.0.0.1:5193');
await ready();
const baseSource = await page.locator('.scene-background').getAttribute('src');
const geometry = [];
for (let i = 1; i <= 4; i++) {
  await page
    .getByRole('button', {
      name: 'Estágio ' + i + ' — ' + names[i - 1],
      exact: true,
    })
    .click();
  assert.equal(
    await page
      .locator('[data-testid="layered-scene"]')
      .getAttribute('data-scene'),
    'garden-' + i,
  );
  await page
    .locator('img[data-layer="tree"]')
    .evaluate((image) => image.decode());
  assert.equal(
    await page.locator('.scene-background').getAttribute('src'),
    baseSource,
  );
  const box = await page.locator('[data-testid="layered-scene"]').boundingBox();
  const hotspot = await page.getByTestId('tree-hotspot').boundingBox();
  assert(box && hotspot);
  const x = (hotspot.x + hotspot.width / 2 - box.x) / box.width;
  const y = (hotspot.y - box.y) / box.height;
  assert(Math.abs(x - 0.512) < 0.002 && Math.abs(y - 0.805) < 0.002);
  geometry.push({ stage: i, scene: box, hotspot });
  await capture('stage-' + i + '-scene.png', page.getByTestId('layered-scene'));
  await capture('stage-' + i + '-desktop.png');
}
check('Quatro estágios com raiz/hotspot no mesmo referencial e fundo único');
for (const [xp, expected] of [
  [0, 1],
  [2499, 1],
  [2500, 2],
  [7499, 2],
  [7500, 3],
  [11999, 3],
  [12000, 4],
]) {
  await page.getByLabel('XP de teste', { exact: true }).fill(String(xp));
  assert.equal(
    await page
      .locator('[data-testid="layered-scene"]')
      .getAttribute('data-scene'),
    'garden-' + expected,
  );
}
check('Limites canônicos de XP refletidos imediatamente na cena');
await page.getByTestId('tree-hotspot').click();
assert(
  await page
    .getByRole('region', { name: 'Informações da árvore', exact: true })
    .isVisible(),
);
await page
  .getByRole('button', { name: 'Fechar informações da árvore', exact: true })
  .click();
check('Hotspot abre e fecha informações sintéticas');
await page
  .getByRole('button', { name: 'Inspecionar camadas', exact: true })
  .click();
await page.getByLabel('Árvore e sombra', { exact: true }).uncheck();
assert.equal(await page.locator('img[data-layer="tree"]').count(), 0);
await capture('base-sem-arvore.png', page.getByTestId('layered-scene'));
await page.getByLabel('Árvore e sombra', { exact: true }).check();
await capture('inspecao-camadas.png');
await page
  .getByRole('button', { name: 'Inspecionar camadas', exact: true })
  .click();
check('Árvore pode ser removida independentemente do fundo e das pedras');
await page
  .getByRole('button', { name: 'Comparar quatro', exact: true })
  .click();
assert.equal(
  await page.getByTestId('comparison-grid').locator('figure').count(),
  4,
);
await capture('comparacao-quatro-desktop.png');
await page
  .getByRole('button', { name: 'Referência aprovada', exact: true })
  .click();
assert(
  await page
    .getByAltText(
      'Pintura aprovada do Jardim: árvore adulta, canteiro circular, pedras com runas e nascente à direita.',
    )
    .isVisible(),
);
await capture('referencia-aprovada-desktop.png');
await page
  .getByRole('button', { name: 'Referência aprovada', exact: true })
  .click();
check('Comparação dos quatro estágios e acesso à referência original');
await page
  .getByRole('button', { name: 'Estágio 2 — Brotinho', exact: true })
  .focus();
await page.keyboard.press('Enter');
assert.equal(
  await page
    .locator('[data-testid="layered-scene"]')
    .getAttribute('data-scene'),
  'garden-2',
);
check('Seleção acessível por teclado');
await page.emulateMedia({ reducedMotion: 'reduce' });
const animated = await page.evaluate(
  () =>
    Array.from(document.querySelectorAll('*')).filter(
      (element) =>
        getComputedStyle(element).animationName !== 'none' &&
        getComputedStyle(element).animationDuration !== '0s',
    ).length,
);
assert.equal(animated, 0);
check('Movimento reduzido sem animações contínuas');
assert.deepEqual(await page.evaluate(() => window.__dataAccess), {
  idb: 0,
  storage: 0,
});
assert.deepEqual(errors, []);
assert.deepEqual(external, []);
check('Nenhum acesso a IndexedDB/storage, erro de página ou recurso externo');
await page.waitForFunction(() => !!navigator.serviceWorker.controller);
await context.setOffline(true);
for (let i = 1; i <= 4; i++) {
  await page
    .getByRole('button', {
      name: 'Estágio ' + i + ' — ' + names[i - 1],
      exact: true,
    })
    .click();
  await page
    .locator('img[data-layer="tree"]')
    .evaluate((image) => image.decode());
}
await page.reload();
await ready();
assert.equal(
  await page
    .locator('[data-testid="layered-scene"]')
    .getAttribute('data-scene'),
  'garden-4',
);
check('Troca dos quatro estágios e recarga funcionam offline');
await context.setOffline(false);
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
  reducedMotion: 'reduce',
});
const mobilePage = await mobile.newPage();
await mobilePage.goto('http://127.0.0.1:5193');
await mobilePage.waitForFunction(
  () =>
    !document.querySelector('button[aria-label="Estágio 4 — Floresta Anciã"]')
      .disabled,
);
await mobilePage
  .getByRole('button', { name: 'Estágio 3 — Árvore Jovem', exact: true })
  .click();
const mobileBounds = await mobilePage.getByTestId('tree-hotspot').boundingBox();
assert(
  mobileBounds &&
    mobileBounds.x >= 0 &&
    mobileBounds.x + mobileBounds.width <= 390 &&
    mobileBounds.height >= 44,
);
assert(await mobilePage.locator('.mobile-hint').isVisible());
assert(
  await mobilePage.evaluate(
    () => document.documentElement.scrollWidth <= innerWidth,
  ),
);
await mobilePage.getByTestId('tree-hotspot').click();
assert(
  await mobilePage
    .getByRole('region', { name: 'Informações da árvore', exact: true })
    .isVisible(),
);
await mobilePage.screenshot({
  path: join(output, 'captures', 'mobile-390.png'),
  fullPage: true,
});
screenshots.push(join(output, 'captures', 'mobile-390.png'));
const mobileGeometry = {
  hotspot: mobileBounds,
  viewport: await mobilePage.locator('.scene-viewport').boundingBox(),
};
check(
  'Celular 390px: hotspot visível, deslocamento explícito e ausência de rolagem lateral da página',
);
await mobile.close();
await context.close();
await browser.close();
assert.deepEqual(errors, []);
await writeFile(
  join(output, 'browser-tests.json'),
  JSON.stringify(
    {
      passed: checks.length,
      checks,
      errors,
      external,
      geometry,
      mobileGeometry,
      screenshots,
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify({
    passed: checks.length,
    errors,
    screenshots: screenshots.length,
  }),
);
