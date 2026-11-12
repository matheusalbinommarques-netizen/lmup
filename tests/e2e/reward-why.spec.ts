import { expect, test, type Page } from '@playwright/test';

// "Por que ganhei isso?" — dados sintéticos em contexto descartável.
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
            profile.put({ ...read.result, activeCompanionId: 1 });
          tx.objectStore('tasks').put({
            id: 820,
            title: 'Organizar a mesa',
            xp: 50,
            effort: 'small',
            rarity: 'common',
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

test('a conta da recompensa aparece na conclusão e no histórico e fecha com o recebido', async ({
  page,
}) => {
  await seed(page);
  await page.goto('/missao/820');
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  const summary = page.getByRole('region', { name: 'Resumo da recompensa' });
  const received = summary.getByLabel('Recompensa recebida');
  await expect(received).toBeVisible();
  const xp = (await received.locator('.resource strong').first().innerText())
    .replace('+', '')
    .trim();

  await summary.getByText('Por que ganhei isso?').click();
  const table = summary.getByRole('table', { name: 'Conta da recompensa' });
  await expect(
    table.getByRole('row', { name: /Esforço Leve \+50 \+25 \+2/ }),
  ).toBeVisible();
  // Lobo ativo: o bônus aparece como linha própria.
  await expect(table.getByRole('row', { name: /Bônus ativos/ })).toBeVisible();
  await expect(
    table.getByRole('row', { name: new RegExp(`Total recebido \\+${xp} `) }),
  ).toBeVisible();

  await page.goto('/progresso');
  const entry = page
    .getByRole('listitem')
    .filter({ hasText: 'Organizar a mesa' });
  await entry.getByText('Por que ganhei isso?').click();
  await expect(
    entry
      .getByRole('table', { name: 'Conta da recompensa' })
      .getByRole('row', { name: new RegExp(`Total recebido \\+${xp} `) }),
  ).toBeVisible();
});
