import { expect, test, type Page } from '@playwright/test';

// Onda D: caixas de suprimentos. Dados sintéticos em contexto descartável.
async function seed(page: Page) {
  await page.goto('/');
  await expect(
    page.getByRole('region', { name: 'Seu personagem', exact: true }),
  ).toBeVisible();
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction(['profile', 'tasks'], 'readwrite');
          const profile = tx.objectStore('profile');
          const read = profile.get(1);
          read.onsuccess = () =>
            profile.put({ ...read.result, activeCompanionId: null });
          for (const [id, xp, effort] of [
            [950, 250, 'deep'],
            [951, 150, 'large'],
          ] as const)
            tx.objectStore('tasks').put({
              id,
              title: `Missão da caixa ${id}`,
              xp,
              effort,
              rarity: 'epic',
              status: 'available',
              completed: false,
              createdAt: new Date().toISOString(),
            });
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
  );
}
const stock = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<unknown>((resolve) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onsuccess = () => {
          const read = request.result
            .transaction('profile')
            .objectStore('profile')
            .get(1);
          read.onsuccess = () => {
            request.result.close();
            resolve(read.result.materials ?? null);
          };
        };
      }),
  );

test('400 XP de missões rendem uma caixa; abrir guarda o material escolhido uma vez', async ({
  page,
}) => {
  await seed(page);
  const card = page.getByRole('region', { name: /Caixas de hoje/ });
  await expect(card).toContainText('Caixas de hoje: 0 de 5');
  await expect(card.getByRole('button', { name: /Abrir caixa/ })).toHaveCount(
    0,
  );
  for (const id of [950, 951]) {
    await page.goto(`/missao/${id}`);
    await page
      .getByRole('button', { name: 'Concluir missão', exact: true })
      .click();
    await expect(
      page.getByRole('region', { name: 'Resumo da recompensa' }),
    ).toBeVisible();
  }
  await page.goto('/');
  await expect(card).toContainText('Caixas de hoje: 1 de 5');
  await expect(
    card.getByRole('progressbar', { name: 'Progresso até a próxima caixa' }),
  ).toHaveAttribute('aria-valuenow', '0');
  await card.getByRole('button', { name: 'Abrir caixa' }).click();
  const dialog = page.getByRole('dialog', {
    name: 'Abrir caixa de suprimentos',
  });
  await expect(dialog).toContainText('Caixa 1 de 5');
  await dialog.getByRole('button', { name: '6 Pedra', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(card).toContainText('+6 Pedra guardados.');
  await expect(card.getByRole('button', { name: /Abrir caixa/ })).toHaveCount(
    0,
  );
  expect(await stock(page)).toEqual({ wood: 0, stone: 6, ore: 0 });
  await page.reload();
  await expect(
    page.getByRole('list', { name: 'Materiais guardados' }),
  ).toContainText('6 Pedra');
  expect(await stock(page)).toEqual({ wood: 0, stone: 6, ore: 0 });
});
