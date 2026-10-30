import { expect, test, type Page } from '@playwright/test';

async function completeRealMission(page: Page, title: string) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Uma nova missão' });
  await dialog.getByLabel('O que você quer fazer?').fill(title);
  await dialog.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await expect(page).toHaveURL(/\/missao\/\d+$/);
  await page.getByRole('button', { name: 'Concluir missão', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Esse passo é seu.' })).toBeVisible();
}

test('história inteira sem interrupção, escolha persistente e capítulo seguinte por XP real', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/aventura');
  await expect(page.getByRole('heading', { name: 'O outro lado da ponte' })).toBeVisible();
  for (let i = 0; i < 5; i++) {
    await page.getByRole('button', { name: 'Próxima cena', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Ajudar o guarda' }).click();
  await expect(page.getByRole('heading', { name: 'A promessa feita ao guarda' })).toBeVisible();
  await expect(page.getByRole('progressbar', { name: 'XP conquistado depois do capítulo 1' })).toHaveAttribute('value','0');

  await page.reload();
  await expect(page.getByRole('heading', { name: 'A promessa feita ao guarda' })).toBeVisible();
  await page.getByRole('button', { name: 'Rever capítulo 1' }).click();
  await expect(page.getByRole('heading', { name: 'Uma cidade que nunca dorme' })).toBeVisible();
  for (let i = 0; i < 5; i++) {
    await page.getByRole('button', { name: 'Próxima cena', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Rever o desfecho' }).click();
  await page.getByRole('button', { name: 'Voltar aos capítulos' }).click();

  for (let i=0;i<3;i++) await completeRealMission(page,'Missão real '+(i+1));
  await page.goto('/aventura');
  await expect(page.getByRole('button', { name: 'Iniciar capítulo 2' })).toBeVisible();
  await page.getByRole('button', { name: 'Iniciar capítulo 2' }).click();
  await expect(page.getByRole('heading', { name: 'Ecos da passagem' })).toBeVisible();
  await page.getByRole('button', { name: 'Próxima cena', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Uma lembrança inesperada' })).toBeVisible();
  expect(errors).toEqual([]);
});
