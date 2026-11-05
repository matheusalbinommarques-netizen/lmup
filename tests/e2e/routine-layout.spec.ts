import { expect, test, type Page } from '@playwright/test';
import {
  expectInsideParent,
  expectMaxLines,
  expectMinWidth,
  expectNoPageOverflow,
} from './layout-guards';

const SHORT = 'Beber água';
const COMMON = 'Revisar o orçamento mensal e separar os comprovantes';
const LONG = 'Organizar os documentos do trimestre '
  .repeat(5)
  .trim()
  .slice(0, 160);
const UNBROKEN = 'Paralelepipedo'.repeat(8);

const DESKTOP_WIDTHS = [900, 1024, 1100, 1280, 1366, 1536, 1600, 1920];
const MOBILE_WIDTHS = [320, 390, 768];

async function add(page: Page, title: string) {
  await page
    .getByRole('button', { name: 'Criar missão na rotina', exact: true })
    .click();
  const form = page.getByRole('dialog', {
    name: 'Uma nova missão',
    exact: true,
  });
  await form.getByLabel('O que você quer fazer?').fill(title);
  await form.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await expect(form).not.toBeVisible();
  await expect(page.locator('.routine-sequence')).toContainText(title);
}

// Same titles with and without custom days: both variants have failed before.
test('títulos da rotina continuam legíveis em todas as larguras', async ({
  page,
  isMobile,
}) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Rotinas', exact: true }).click();
  await page.getByRole('button', { name: 'Nova rotina', exact: true }).click();
  await page
    .locator('.routine-form')
    .getByLabel('Nome da rotina', { exact: true })
    .fill('Rotina de layout');
  const titles = [SHORT, COMMON, LONG, UNBROKEN];
  for (const title of titles) await add(page, title);
  for (const title of titles) await add(page, `${title.slice(0, 150)} B`);
  const rows = page.locator('.routine-sequence li');
  await expect(rows).toHaveCount(titles.length * 2);
  for (let index = titles.length; index < titles.length * 2; index += 1)
    await rows
      .nth(index)
      .getByRole('checkbox', { name: /^Usar dias personalizados/ })
      .check();

  for (const width of isMobile ? MOBILE_WIDTHS : DESKTOP_WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    await expectNoPageOverflow(page, `${width}px`);
    for (let index = 0; index < titles.length * 2; index += 1) {
      const row = rows.nth(index);
      const title = row.locator('.sequence-title');
      const context = `${width}px, linha ${index + 1}`;
      await expectMinWidth(title, 120, context);
      await expectInsideParent(title, context);
      await expectInsideParent(row.locator('.sequence-actions'), context);
      await expectInsideParent(row.locator('.entry-days'), context);
      if (index % titles.length < 2) await expectMaxLines(title, 3, context);
    }
  }
});

test('composição da linha acompanha a largura do editor', async ({
  page,
  isMobile,
}) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Rotinas', exact: true }).click();
  await page.getByRole('button', { name: 'Nova rotina', exact: true }).click();
  await page
    .locator('.routine-form')
    .getByLabel('Nome da rotina', { exact: true })
    .fill('Rotina de composição');
  for (const title of [SHORT, COMMON]) await add(page, title);
  const row = page.locator('.routine-sequence li').first();
  const box = async (selector: string) =>
    (await row.locator(selector).first().boundingBox())!;

  if (!isMobile) {
    const days = await box('.entry-days');
    const title = await box('.sequence-title');
    expect(Math.abs(days.x - title.x)).toBeLessThanOrEqual(1);
    await expect(row.getByRole('button', { name: /para cima/ })).toHaveCSS(
      'background-color',
      'rgba(0, 0, 0, 0)',
    );
    return;
  }

  // Narrow editors keep the time and the controls on one line when they fit.
  await page.setViewportSize({ width: 390, height: 844 });
  const time = await box('input[type="text"]');
  const actions = await box('.sequence-actions');
  expect(actions.y).toBeLessThan(time.y + time.height);
  for (const button of await row.locator('.sequence-actions button').all()) {
    const size = (await button.boundingBox())!;
    expect(size.height).toBeGreaterThanOrEqual(40);
    expect(size.width).toBeGreaterThanOrEqual(40);
  }

  // Below that, the controls wrap instead of overflowing.
  await page.setViewportSize({ width: 320, height: 700 });
  const narrowTime = await box('input[type="text"]');
  const narrowActions = await box('.sequence-actions');
  expect(narrowActions.y).toBeGreaterThanOrEqual(
    narrowTime.y + narrowTime.height,
  );
  await expectNoPageOverflow(page, '320px');
  await expectInsideParent(row.locator('.sequence-actions'), '320px');
});
