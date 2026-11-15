// Lote 3: every mission is executed on the single screen /executar/<id>.
import { expect, type Page } from '@playwright/test';

/** From the mission page (/missao/<id>), open the execution screen. */
export async function startFromDetail(page: Page) {
  await page
    .getByRole('link', { name: /^(Iniciar|Retomar)$/ })
    .or(page.getByRole('button', { name: 'Iniciar', exact: true }))
    .first()
    .click();
  await expect(page).toHaveURL(/\/executar\//);
}

/** From the Hoje, open the execution of a row by its title. */
export async function startFromHome(page: Page, title: string) {
  await page.getByRole('button', { name: title, exact: true }).first().click();
  await expect(page).toHaveURL(/\/executar\//);
}

export const concludeButton = (page: Page) =>
  page.getByRole('button', { name: 'Concluir', exact: true });

/** Concludes on the execution screen and waits for the receipt line. */
export async function conclude(page: Page) {
  await concludeButton(page).click();
  await expect(page.getByText(/concluída\./).first()).toBeVisible();
}

/** Undoes the conclusion just shown on the execution screen. */
export async function undoConclusion(page: Page) {
  await page.getByRole('button', { name: 'Desfazer', exact: true }).click();
  await expect(page.getByText(/Conclusão desfeita/)).toBeVisible();
}

/**
 * From the mission page: start, conclude and open the receipt ("Por quê?"),
 * which shows the full reward summary like the old in-page conclusion.
 */
export async function concludeFromDetail(page: Page) {
  await startFromDetail(page);
  await conclude(page);
  await openReceipt(page);
}

/** Opens the receipt of the conclusion just shown ("Por quê?"). */
export async function openReceipt(page: Page) {
  await page.getByRole('link', { name: 'Por quê?', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Missão concluída!', exact: true }),
  ).toBeVisible();
}

/** On mobile the secondary actions live in the "Mais ações" menu (E3). */
async function secondary(page: Page, name: string) {
  const direct = page.getByRole('button', { name, exact: true }).first();
  if (await direct.isVisible()) return direct.click();
  await page.getByRole('button', { name: 'Mais ações', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'Menu: Mais ações', exact: true })
    .getByRole('button', { name, exact: true })
    .click();
}

export const registerPart = (page: Page) => secondary(page, 'Registrar parte');
export const skipForLater = (page: Page) =>
  secondary(page, 'Pular para depois');

/** The queue starts folded on mobile (E3); opens it when needed. */
export async function openQueue(page: Page) {
  const details = page.locator('aside.queue details');
  if (!(await details.evaluate((el) => (el as HTMLDetailsElement).open)))
    await details.locator('summary').click();
}
