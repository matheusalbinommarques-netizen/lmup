import { expect, type Page } from '@playwright/test';
export async function confirmBackupImport(page: Page) {
  await page
    .getByRole('dialog', { name: 'Importar este backup?', exact: true })
    .getByRole('button', {
      name: 'Substituir pelos dados do backup',
      exact: true,
    })
    .click();
  await expect(
    page
      .getByRole('status')
      .filter({ hasText: 'Backup importado com sucesso' }),
  ).toBeVisible();
}
