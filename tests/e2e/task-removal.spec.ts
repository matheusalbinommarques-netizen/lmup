import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
async function create(page: Page, title: string) {
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const form = page.getByRole('dialog', {
    name: 'Uma nova missão',
    exact: true,
  });
  await form.getByLabel('O que você quer fazer?').fill(title);
  await form.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await expect(form).not.toBeVisible();
}
async function data(page: Page) {
  return page.evaluate(
    () =>
      new Promise<any>((resolve, reject) => {
        const r = indexedDB.open('LevelMeUpDB');
        r.onsuccess = () => {
          const d = r.result,
            t = d.transaction(
              ['tasks', 'profile', 'activityEvents', 'xpLogs'],
              'readonly',
            ),
            tasks = t.objectStore('tasks').getAll(),
            p = t.objectStore('profile').get(1),
            e = t.objectStore('activityEvents').getAll(),
            x = t.objectStore('xpLogs').getAll();
          t.oncomplete = () => {
            resolve({
              tasks: tasks.result,
              profile: p.result,
              events: e.result,
              logs: x.result,
            });
            d.close();
          };
          t.onerror = () => reject(t.error);
        };
      }),
  );
}
async function request(
  page: Page,
  title: string,
  mode = 'Excluir definitivamente',
) {
  const row = page.locator('.mission-row').filter({ hasText: title });
  await row
    .getByRole('button', { name: `Ações para ${title}`, exact: true })
    .click();
  await row.getByRole('button', { name: mode, exact: true }).click();
  return page.getByRole('dialog', { name: 'Remover missão', exact: true });
}
async function capture(page: Page, name: string) {
  if (!process.env.LMU_REMOVAL_CAPTURES) return;
  await mkdir(process.env.LMU_REMOVAL_CAPTURES, { recursive: true });
  await page.screenshot({
    path: join(process.env.LMU_REMOVAL_CAPTURES, name + '.png'),
    fullPage: false,
  });
}
test('excluir sem histórico confirma, permite cancelar e não altera saldos', async ({
  page,
}, info) => {
  await create(page, 'Cadastro sem uso');
  const before = await data(page);
  let dialog = await request(page, 'Cadastro sem uso');
  await expect(
    dialog.getByRole('button', {
      name: 'Excluir definitivamente',
      exact: true,
    }),
  ).toBeVisible();
  await capture(page, info.project.name + '-excluir');
  await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click();
  expect((await data(page)).tasks).toHaveLength(1);
  dialog = await request(page, 'Cadastro sem uso');
  await dialog
    .getByRole('button', { name: 'Excluir definitivamente', exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await page.reload();
  const after = await data(page);
  expect(after.tasks).toHaveLength(0);
  expect(after.profile).toMatchObject(before.profile);
  expect(after.events).toEqual(before.events);
});
test('arquivar conclusão preserva economia, consulta e não aparece em atividades ativas', async ({
  page,
}, info) => {
  await create(page, 'Missão com história');
  await page
    .getByRole('button', { name: 'Concluir Missão com história', exact: true })
    .click();
  await expect(page).toHaveURL(/\/missoes$/);
  await expect(
    page.getByRole('status', { name: 'Recompensa da conclusão' }),
  ).toBeVisible();
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Todas', exact: true }).click();
  const before = await data(page);
  const dialog = await request(page, 'Missão com história', 'Arquivar missão');
  await expect(
    dialog.getByRole('button', { name: 'Arquivar missão', exact: true }),
  ).toBeVisible();
  await capture(page, info.project.name + '-arquivar');
  await dialog
    .getByRole('button', { name: 'Arquivar missão', exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('.mission-row')).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Ferramentas de missões', exact: true })
    .click();
  await page.getByRole('button', { name: 'Arquivadas', exact: true }).click();
  await expect(page.locator('.mission-row')).toContainText(
    'Missão com história',
  );
  const after = await data(page);
  expect(after.tasks[0].archived).toBe(true);
  for (const key of ['profile', 'events', 'logs'])
    expect(after[key]).toEqual(before[key]);
  await page
    .getByRole('link', { name: 'Missão com história', exact: true })
    .click();
  await expect(page).toHaveURL(/\/missao\/\d+$/);
  await expect(
    page.getByText('Missão arquivada.', { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Concluir missão', exact: true }),
  ).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Registros preservados' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});
