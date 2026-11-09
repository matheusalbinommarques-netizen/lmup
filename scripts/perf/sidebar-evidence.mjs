// CI capture of the actual comparison page; app code and personal data are unused.
import { chromium, expect } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { once } from 'node:events';
import { server } from './sidebar-preview.mjs';

if (!server.listening) await once(server, 'listening');
await mkdir('c05-evidence', { recursive: true });
const browser = await chromium.launch();
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    serviceWorkers: 'block',
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:5208');
  await expect(page.getByRole('status')).toContainText('menos pixels');
  await page.screenshot({
    path: 'c05-evidence/comparacao-1x.png',
    fullPage: true,
  });
  const download = page.waitForEvent('download');
  await page
    .getByRole('link', { name: 'Baixar variante menor', exact: true })
    .click();
  await (await download).saveAs('c05-evidence/sidebar-map-432.webp');
  await page
    .getByRole('button', { name: '2x — ampliar detalhes', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: '2x — ampliar detalhes', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.screenshot({
    path: 'c05-evidence/comparacao-2x.png',
    fullPage: true,
  });
  const text = await page.locator('.stats').allTextContents();
  await writeFile(
    'c05-evidence/medidas.json',
    JSON.stringify(
      {
        alternatives: text,
        summary: await page.getByRole('status').innerText(),
        sha: process.env.GITHUB_SHA,
        note: 'Prévia da barra lateral; não é medição de navegação ou de pré-cache do app.',
      },
      null,
      2,
    ),
  );
  let html = await readFile('prototypes/audit-c05/index.html', 'utf8');
  for (const [url, path] of [
    ['/source.webp', 'static/art/approved/paintings/05_Cartao_Mapa.webp'],
    ['/compressed.webp', 'prototypes/audit-c05/full.webp'],
  ]) {
    html = html.replace(
      `'${url}'`,
      `'data:image/webp;base64,${(await readFile(path)).toString('base64')}'`,
    );
  }
  await writeFile('c05-evidence/Comparacao_C05.html', html);
  console.log(JSON.stringify(text));
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
