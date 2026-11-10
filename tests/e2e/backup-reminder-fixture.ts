import { expect, type Page } from '@playwright/test';

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
