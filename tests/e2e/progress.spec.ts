import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

async function backup(page: Page) {
  await page.goto('/config');
  const downloading = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Exportar dados', exact: true })
    .click();
  const download = await downloading;
  return JSON.parse(await readFile((await download.path())!, 'utf8'));
}

test('primeiro acesso cria perfil; duas abas não duplicam conclusão; estorno persiste', async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/arquivo/missoes');
  await expect(
    page.getByRole('heading', { name: 'Quadro de Missões', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Nova Missão' }).click();
  await page.getByLabel('O que você quer fazer?').fill('Missão concorrente');
  await page.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await expect(page).toHaveURL(/\/missao\/\d+$/);
  await page.goto('/arquivo/missoes');
  await expect(
    page.getByRole('button', { name: 'Completar missão', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('+53 XP', { exact: true })).toHaveCount(2);
  const other = await context.newPage();
  await other.goto('/arquivo/missoes');
  await expect(
    other.getByRole('button', { name: 'Completar missão', exact: true }),
  ).toBeVisible();
  await Promise.all(
    [page, other].map((tab) =>
      tab
        .getByRole('button', { name: 'Completar missão', exact: true })
        .evaluate((button: HTMLButtonElement) => button.click()),
    ),
  );
  await page.getByRole('button', { name: 'Concluídas', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Voltar para disponível', exact: true }),
  ).toBeVisible();
  const completed = await backup(page);
  expect(completed.data.activityEvents).toHaveLength(1);
  expect(completed.data.profile).toMatchObject({
    totalXpEarned: 53,
    gold: 25,
    food: 2,
  });
  await page.goto('/arquivo/missoes');
  await page.getByRole('button', { name: 'Concluídas', exact: true }).click();
  await page
    .getByRole('button', { name: 'Voltar para disponível', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Voltar para disponível', exact: true }),
  ).not.toBeVisible();
  await page.reload();
  const reversed = await backup(page);
  expect(reversed.data.profile).toMatchObject({
    totalXpEarned: 0,
    gold: 0,
    food: 0,
    currentStreak: 0,
  });
  expect(reversed.data.activityEvents).toHaveLength(2);
  expect(reversed.data.tasks[0].completed).toBe(false);
  expect(errors).toEqual([]);
});

test('backup inválido é recusado na interface sem substituir o perfil', async ({
  page,
}) => {
  const original = await backup(page);
  await page.locator('input[type=file]').setInputFiles({
    name: 'invalido.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"data":{}}'),
  });
  await expect(page.getByRole('alert')).toContainText('Backup inválido');
  expect((await backup(page)).data).toEqual(original.data);
});
