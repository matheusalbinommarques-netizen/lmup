import { expect, test, type Page } from '@playwright/test';

// Fase 1 — objetivo visível. Dados sintéticos em contexto descartável.
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
            profile.put({ ...read.result, gold: 250, activeCompanionId: null });
          tx.objectStore('tasks').put({
            id: 810,
            title: 'Revisar o orçamento',
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
  await page.reload();
}
const gold = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<number>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const read = db
            .transaction('profile', 'readonly')
            .objectStore('profile')
            .get(1);
          read.onsuccess = () => {
            db.close();
            resolve(read.result.gold);
          };
          read.onerror = () => reject(read.error);
        };
      }),
  );

test('escolher objetivo mostra a distância em Hoje e quanto a missão aproximou', async ({
  page,
}) => {
  await seed(page);
  const card = page.getByRole('region', { name: 'No que investir?' });
  await card.getByRole('button', { name: 'Escolher objetivo' }).click();
  const dialog = page.getByRole('dialog', { name: 'Escolher objetivo' });
  await expect(dialog).toContainText('Seu ouro continua livre');
  await dialog.getByRole('button', { name: /Cota da Rotina/ }).click();
  await expect(dialog).toBeHidden();

  const goal = page.getByRole('region', { name: 'Cota da Rotina' });
  const bar = goal.getByRole('progressbar', {
    name: 'Progresso para Cota da Rotina',
  });
  await expect(bar).toHaveAttribute('aria-valuenow', '50');
  await expect(bar).toHaveAttribute('aria-valuetext', 'Falta: 250 Ouro');
  await expect(goal).toContainText('250 / 500 Ouro');
  // Escolher não reserva nem gasta ouro.
  expect(await gold(page)).toBe(250);

  await page.goto('/missao/810');
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  const summary = page.getByRole('region', { name: 'Resumo da recompensa' });
  const after = await gold(page);
  expect(after).toBeGreaterThan(250);
  const progress = summary.getByRole('progressbar', {
    name: 'Objetivo · Cota da Rotina',
  });
  await expect(progress).toHaveAttribute(
    'aria-valuetext',
    `Falta: ${500 - after} Ouro`,
  );
  await expect(summary).toContainText('Antes: 50% do custo');

  await page.goto('/');
  await expect(
    page
      .getByRole('region', { name: 'Cota da Rotina' })
      .getByRole('progressbar'),
  ).toHaveAttribute('aria-valuetext', `Falta: ${500 - after} Ouro`);
});

test('trocar e limpar o objetivo; pré-requisito pendente nunca vira "pronto"', async ({
  page,
}) => {
  await seed(page);
  await page
    .getByRole('region', { name: 'No que investir?' })
    .getByRole('button', { name: 'Escolher objetivo' })
    .click();
  const dialog = page.getByRole('dialog', { name: 'Escolher objetivo' });
  await dialog.getByRole('button', { name: /Construir o acampamento/ }).click();
  const goal = page.getByRole('region', { name: 'Construir o acampamento' });
  await expect(goal.getByRole('progressbar')).toHaveAttribute(
    'aria-valuetext',
    'Falta: Conversar com o caseiro',
  );
  await expect(goal.getByText('Pronto para investir')).toHaveCount(0);
  await goal.getByRole('button', { name: 'Trocar objetivo' }).click();
  await dialog.getByRole('button', { name: 'Ficar sem objetivo' }).click();
  await expect(
    page.getByRole('region', { name: 'No que investir?' }),
  ).toBeVisible();
});
