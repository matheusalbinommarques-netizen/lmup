import { chromium, expect } from '@playwright/test';
import { mkdtemp, writeFile } from 'node:fs/promises';
const root = 'D:/Codex-artifacts/camp-modular-20261103';
const profile = await mkdtemp(root + '/offline-profile-');
const options = {
  headless: true,
  viewport: { width: 1440, height: 1100 },
  reducedMotion: 'reduce',
  serviceWorkers: 'allow',
};
let context;
try {
  context = await chromium.launchPersistentContext(profile, options);
  let page = context.pages()[0];
  await page.goto('http://127.0.0.1:5318/acampamento');
  await page.getByTestId('point-caretaker').click();
  await page
    .getByRole('button', {
      name: 'Confirmar construção · 50 ouro',
      exact: true,
    })
    .click();
  await expect(page.getByTestId('point-interior')).toBeAttached();
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
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, {
    timeout: 60000,
  });
  await context.close();
  context = await chromium.launchPersistentContext(profile, {
    ...options,
    offline: true,
  });
  page = context.pages()[0];
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto('http://127.0.0.1:5318/acampamento?scene=garden', {
    waitUntil: 'domcontentloaded',
  });
  await expect(page.getByTestId('layered-scene')).toHaveAttribute(
    'data-scene',
    'garden-4',
  );
  await expect(page.getByTestId('camp-balance')).toHaveText(
    '0 ouro · 120 comida',
  );
  await page
    .locator('img[data-layer="tree"]')
    .evaluate((image) => image.decode());
  await page.screenshot({
    path: root + '/captures/offline-after-browser-restart.png',
    fullPage: true,
  });
  await page
    .getByRole('button', { name: 'Voltar ao Centro', exact: false })
    .click();
  await expect(page.getByTestId('layered-scene')).toHaveAttribute(
    'data-scene',
    'center-built-4',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.scene-scroll').evaluate((element) => {
    element.scrollLeft = element.scrollWidth;
  });
  await page.evaluate(async () => {
    window.scrollTo(0, 0);
    await document.fonts.ready;
  });
  await page.screenshot({
    path: root + '/captures/mobile-center-pan-right.png',
    fullPage: true,
  });
  const state = await page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpCampCinematicPreview');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const row = db.transaction('profile').objectStore('profile').get(1);
          row.onerror = () => reject(row.error);
          row.onsuccess = () => {
            db.close();
            resolve(row.result);
          };
        };
      }),
  );
  expect(state.gold).toBe(0);
  expect(state.totalXpEarned).toBe(0);
  expect(state.campPreview.residenceBuilt).toBe(true);
  expect(pageErrors).toEqual([]);
  const result = {
    passed: true,
    closedAndReopenedBrowser: true,
    offline: true,
    actualXp: state.totalXpEarned,
    syntheticGold: state.gold,
    stage: 4,
    built: true,
    pageErrors,
  };
  await writeFile(
    root + '/offline-restart.json',
    JSON.stringify(result, null, 2),
  );
  console.log(JSON.stringify(result));
} finally {
  await context?.close();
}
