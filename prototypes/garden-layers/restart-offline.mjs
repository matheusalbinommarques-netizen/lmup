import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { writeFile } from 'node:fs/promises';
const output = 'D:/Codex-artifacts/garden-layer-proof-20261103';
const profile = join(output, 'offline-test-profile');
let context = await chromium.launchPersistentContext(profile, {
  headless: true,
  viewport: { width: 1280, height: 1000 },
});
let page = context.pages()[0] ?? (await context.newPage());
await page.goto('http://127.0.0.1:5193');
await page.waitForFunction(() => !!navigator.serviceWorker.controller);
await page.waitForFunction(
  () =>
    !document.querySelector('button[aria-label="Estágio 4 — Floresta Anciã"]')
      .disabled,
);
await context.close();
context = await chromium.launchPersistentContext(profile, {
  headless: true,
  offline: true,
  viewport: { width: 1280, height: 1000 },
});
try {
  page = context.pages()[0] ?? (await context.newPage());
  await page.goto('http://127.0.0.1:5193');
  await page.waitForFunction(
    () =>
      !document.querySelector('button[aria-label="Estágio 1 — Semente"]')
        .disabled,
  );
  await page
    .getByRole('button', { name: 'Estágio 1 — Semente', exact: true })
    .click();
  await page
    .locator('img[data-layer="tree"]')
    .evaluate((image) => image.decode());
  assert.equal(
    await page.getByTestId('layered-scene').getAttribute('data-scene'),
    'garden-1',
  );
  await page
    .getByRole('button', { name: 'Estágio 4 — Floresta Anciã', exact: true })
    .click();
  await page
    .locator('img[data-layer="tree"]')
    .evaluate((image) => image.decode());
  assert.equal(
    await page.getByTestId('layered-scene').getAttribute('data-scene'),
    'garden-4',
  );
  await page.screenshot({
    path: join(output, 'captures', 'offline-apos-reabrir.png'),
    fullPage: true,
  });
  await writeFile(
    join(output, 'offline-restart.json'),
    JSON.stringify(
      {
        passed: true,
        profileIsolated: true,
        offlineAtRelaunch: true,
        stagesVerified: [1, 4],
        xpPersistence:
          'memory-only; intentionally resets to 12000 on a new page',
      },
      null,
      2,
    ),
  );
  console.log(
    'PASS Fechamento e reabertura do navegador de teste offline em perfil isolado',
  );
} finally {
  await context.close();
}
