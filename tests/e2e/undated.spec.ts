import { expect, test, type Page } from '@playwright/test';

// Domingo, 15 de novembro de 2026.
const TODAY = '2026-11-15';

async function seed(page: Page) {
  await page.clock.setFixedTime(new Date(`${TODAY}T09:00:00-03:00`));
  await page.goto('/missoes');
  await expect(
    page.getByRole('button', { name: 'Nova missão', exact: true }),
  ).toBeVisible();
  await page.evaluate(
    (today) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const tx = database.transaction(['tasks'], 'readwrite');
          const base = {
            source: 'personal',
            xp: 50,
            effort: 'small',
            rarity: 'common',
            completed: false,
            status: 'available',
            productivityVersion: 1,
            tracking: { method: 'direct' },
            recurrence: null,
            plannedDate: null,
            createdAt: `${today}T08:00:00.000Z`,
          };
          const tasks = tx.objectStore('tasks');
          tasks.put({ ...base, id: 9301, title: 'Comprar presente da Ana' });
          tasks.put({
            ...base,
            id: 9302,
            title: 'Pesquisar plano de saúde',
            createdAt: '2026-10-30T12:00:00.000Z',
          });
          tasks.put({
            ...base,
            id: 9303,
            title: 'Aprender a fazer pão',
            someday: true,
          });
          tasks.put({
            ...base,
            id: 9304,
            title: 'Pagar a conta de luz',
            plannedDate: today,
          });
          tx.oncomplete = () => {
            database.close();
            resolve();
          };
          tx.onerror = () => {
            database.close();
            reject(tx.error);
          };
        };
      }),
    TODAY,
  );
}

test('Sem dia separa a caixa de entrada do algum dia e fica fora do Hoje', async ({
  page,
}) => {
  await seed(page);
  await page.goto('/');
  const plan = page.getByRole('region', { name: /Plano do dia/ });
  await expect(plan.getByText('Pagar a conta de luz')).toBeVisible();
  // Nem no plano nem como próxima missão.
  await expect(page.locator('#next-title')).toHaveText('Pagar a conta de luz');
  await expect(plan.getByText('Comprar presente da Ana')).toHaveCount(0);
  await expect(plan.getByText('Aprender a fazer pão')).toHaveCount(0);
  await expect(page.getByLabel('Manter em destaque')).not.toContainText(
    'Comprar presente da Ana',
  );

  await page.goto('/missoes?view=semdia');
  const inbox = page.getByRole('region', { name: 'Caixa de entrada' });
  const someday = page.getByRole('region', { name: 'Algum dia' });
  await expect(page.getByRole('tab', { name: /Sem dia/ })).toContainText('3');
  await expect(inbox.getByRole('listitem')).toHaveCount(2);
  await expect(
    inbox.getByRole('listitem').filter({ hasText: 'Pesquisar plano de saúde' }),
  ).toContainText('na caixa há 16 dias');
  await expect(someday.getByRole('listitem')).toHaveText([
    /Aprender a fazer pão/,
  ]);
});

test('captura mostra o destino antes de confirmar e grava nele', async ({
  page,
}) => {
  await seed(page);
  await page.goto('/missoes?view=semdia');
  const field = page.getByLabel('Capturar uma missão');
  await field.fill('Ligar para o seguro 30min sex');
  const preview = page.locator('.capture-preview');
  await expect(preview).toContainText('Vai para: Sexta, 20 nov.');
  await expect(preview).toContainText('Ligar para o seguro');
  await expect(preview).toContainText('30 min');
  await page.getByRole('button', { name: 'Adicionar', exact: true }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Adicionada' }),
  ).toContainText('Sexta, 20 nov.');
  await expect(field).toHaveValue('');
  // Foi para um dia: não aparece na caixa.
  const inbox = page.getByRole('region', { name: 'Caixa de entrada' });
  await expect(inbox.getByText('Ligar para o seguro')).toHaveCount(0);

  await field.fill('Montar uma horta algum dia');
  await expect(preview).toContainText('Vai para: Algum dia');
  await field.press('Enter');
  const someday = page.getByRole('region', { name: 'Algum dia' });
  await expect(someday.getByText('Montar uma horta')).toBeVisible();

  // "Usar só o texto" desliga a leitura.
  await field.fill('Ler o livro Hoje 30min');
  await page.getByRole('button', { name: 'Usar só o texto' }).click();
  await expect(preview).toContainText('Vai para: Sem dia');
  await field.press('Enter');
  await expect(inbox.getByText('Ler o livro Hoje 30min')).toBeVisible();
});

test('mover da caixa para hoje, para um dia e para algum dia', async ({
  page,
}) => {
  await seed(page);
  await page.goto('/missoes?view=semdia');
  const inbox = page.getByRole('region', { name: 'Caixa de entrada' });
  const someday = page.getByRole('region', { name: 'Algum dia' });

  await inbox
    .getByRole('button', {
      name: 'Mover Pesquisar plano de saúde para Algum dia',
    })
    .click();
  await expect(someday.getByText('Pesquisar plano de saúde')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Caixa de entrada' }),
  ).toBeFocused();

  await inbox
    .getByRole('listitem')
    .filter({ hasText: 'Comprar presente da Ana' })
    .getByRole('button', { name: 'Escolher dia para Comprar presente da Ana' })
    .click();
  await page.getByRole('button', { name: /Terça, 17 nov\./ }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'foi para' }),
  ).toContainText('Terça, 17 nov.');
  await expect(inbox.getByRole('listitem')).toHaveCount(0);

  await someday
    .getByRole('button', { name: 'Escolher dia para Aprender a fazer pão' })
    .click();
  await page.getByRole('button', { name: /^Hoje/ }).click();
  // Espera a gravação antes de sair da página.
  await expect(
    page.getByRole('status').filter({ hasText: 'foi para' }),
  ).toContainText('Aprender a fazer pão foi para Hoje.');
  await expect(someday.getByRole('listitem')).toHaveCount(1);
  await page.goto('/');
  await expect(
    page
      .getByRole('region', { name: /Plano do dia/ })
      .getByText('Aprender a fazer pão'),
  ).toBeVisible();
});

test('captura do Hoje sem data entra no Dia', async ({ page }) => {
  await seed(page);
  await page.goto('/');
  const field = page.getByLabel('Adicionar ao dia');
  await field.fill('Regar as plantas 10min');
  await expect(page.locator('.capture-preview')).toContainText(
    'Vai para: Hoje',
  );
  await field.press('Enter');
  await expect(
    page
      .getByRole('region', { name: /Plano do dia/ })
      .getByRole('button', { name: 'Regar as plantas', exact: true }),
  ).toBeVisible();
});
