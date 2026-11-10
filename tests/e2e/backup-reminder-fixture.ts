import { expect, type BrowserContext, type Page } from '@playwright/test';

export const REMINDER_NOW = '2026-11-30T12:00:00Z';
export const OLD_EXPORT = '2026-11-01T12:00:00Z';

export async function seedBackupReminder(
  page: Page,
  lastExport: string | null = OLD_EXPORT,
) {
  await page.clock.install({ time: new Date(REMINDER_NOW) });
  await page.clock.setFixedTime(new Date(REMINDER_NOW));
  await page.goto('/');
  await expect(page.locator('.today-hero')).toBeVisible();
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const dialog = page.getByRole('dialog', {
    name: 'Uma nova missão',
    exact: true,
  });
  await dialog
    .getByLabel('O que você quer fazer?')
    .fill('Minha missão para proteger');
  await dialog
    .getByRole('button', { name: 'Criar missão', exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await page.goto('/');
  await expect(page.locator('.today-hero')).toBeVisible();
  if (lastExport) {
    await page.evaluate((value) => {
      // Model an existing journey with a previous export, rather than the
      // first-content grace period just created by the setup above.
      localStorage.removeItem('lmup:backup-reminder-started');
      localStorage.setItem('lmup:last-export', value);
    }, lastExport);
    await page.reload();
  }
}

export async function expectBackupSnooze(page: Page, context: BrowserContext) {
  // Playwright's clock belongs to the context: a second install would replace
  // the fixed clock already used by both tabs and invalidate the boundary.
  const other = await context.newPage();
  try {
    await other.goto('/config');
    for (const tab of [page, other])
      expect(await tab.evaluate(() => Date.now())).toBe(
        Date.parse(REMINDER_NOW),
      );
    const reminder = (tab: Page) =>
      tab.getByRole('complementary', { name: 'Lembrete de backup' });
    await expect(reminder(other)).toBeVisible();
    await reminder(page)
      .getByRole('button', { name: 'Lembrar em 14 dias' })
      .click();
    await expect(reminder(page)).toHaveCount(0);
    await expect(reminder(other)).toHaveCount(0);
    await page.reload();
    await expect(page.locator('.today-hero')).toBeVisible();
    await expect(reminder(page)).toHaveCount(0);
    await page.clock.setFixedTime(new Date('2026-12-14T12:00:00Z'));
    await page.reload();
    await expect(reminder(page)).toBeVisible();
  } finally {
    await other.close();
  }
}
