import { expect, test, type Page } from '@playwright/test';

// Roda da Vida: dados sintéticos em contexto descartável.
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
          const tx = db.transaction(['areas', 'tasks'], 'readwrite');
          tx.objectStore('areas').put({ id: 70, nome: 'Família' });
          tx.objectStore('areas').put({ id: 71, nome: 'Trabalho' });
          tx.objectStore('tasks').put({
            id: 970,
            title: 'Ligar para minha mãe',
            xp: 50,
            effort: 'small',
            rarity: 'common',
            status: 'available',
            completed: false,
            areaId: 70,
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

test('avaliar parte das áreas, ligar área, focar com intenção e criar missão no domínio', async ({
  page,
}) => {
  await seed(page);
  await page.goto('/missao/970');
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('region', { name: 'Resumo da recompensa' }),
  ).toBeVisible();

  await page.goto('/roda');
  await expect(
    page.getByRole('heading', { name: 'Roda da Vida', level: 1 }),
  ).toBeVisible();
  const relations = page.getByRole('listitem', {
    name: 'Relações',
    exact: true,
  });
  await expect(relations).toContainText('Nenhuma área ligada');

  // Ligar Família a Relações: a ação já registrada passa a contar.
  await relations
    .getByLabel('Ligar uma área a Relações')
    .selectOption({ label: 'Família' });
  await expect(relations).toContainText('Áreas: Família');
  await expect(relations).toContainText('1 dias com ação nos últimos 30');

  // Avaliação parcial: só duas áreas.
  await page.getByRole('button', { name: 'Fazer uma avaliação' }).click();
  const dialog = page.getByRole('dialog', {
    name: 'Como você se sente em cada área?',
  });
  await dialog.getByLabel('Relações', { exact: true }).selectOption('3');
  await dialog
    .getByLabel('Observação sobre Relações')
    .fill('Quase não falo com a família');
  await dialog
    .getByLabel('Trabalho e Carreira', { exact: true })
    .selectOption('7');
  await dialog.getByRole('button', { name: 'Salvar avaliação' }).click();
  await expect(dialog).toBeHidden();
  await expect(relations).toContainText('3/10');
  await expect(
    page.getByRole('listitem', { name: 'Saúde Física', exact: true }),
  ).toContainText('Sem avaliação');

  // Foco e intenção.
  await relations.getByLabel('Em foco').check();
  const intention = relations.getByLabel('O que eu quero melhorar aqui');
  await intention.fill('Estar mais presente na família');
  await intention.press('Tab');
  await expect(page.getByRole('status')).toContainText('Intenção salva.');
  await page.reload();
  await expect(
    page
      .getByRole('listitem', { name: 'Relações', exact: true })
      .getByLabel('O que eu quero melhorar aqui'),
  ).toHaveValue('Estar mais presente na família');

  // Transformar intenção em ação: a nova missão nasce na área ligada.
  await page
    .getByRole('listitem', { name: 'Relações', exact: true })
    .getByRole('button', { name: 'Nova missão aqui' })
    .click();
  const create = page.getByRole('dialog', { name: 'Uma nova missão' });
  await expect(create).toBeVisible();
  await expect(create.locator('.area-field select')).toHaveValue('70');
});
