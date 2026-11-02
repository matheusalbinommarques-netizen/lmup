import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const screens = [
  ['hoje', '/'],
  ['lista', '/missoes?view=list'],
  ['dia', '/missoes?view=agenda&mode=day'],
  ['semana', '/missoes?view=agenda&mode=week'],
  ['rotinas', '/missoes?view=routines'],
  ['recuperacao', '/missoes?view=recovery'],
];

test('seis telas finais carregam artes e ações sem erros ou transbordamento', async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const [name, path] of screens) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect
      .poll(() =>
        page
          .locator('img')
          .evaluateAll((imgs) =>
            (imgs as HTMLImageElement[])
              .filter((i) => i.complete && !i.naturalWidth)
              .map((i) => i.src),
          ),
      )
      .toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (process.env.LMU_VISUAL_CAPTURE_DIR) {
      await mkdir(process.env.LMU_VISUAL_CAPTURE_DIR, { recursive: true });
      await page.screenshot({
        path: join(
          process.env.LMU_VISUAL_CAPTURE_DIR,
          `${info.project.name}-${name}.png`,
        ),
        fullPage: true,
      });
    }
  }
  for (const path of [
    '/projetos',
    '/perfil',
    '/refugio',
    '/revisoes',
    '/config',
  ]) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('Hoje conserva criação e escolha manual com duas missões sem data', async ({
  page,
}) => {
  await page.goto('/');
  for (const title of ['Uma ideia flexível', 'Outra ideia flexível']) {
    await page
      .getByRole('button', { name: 'Nova missão', exact: true })
      .click();
    const form = page.getByRole('dialog', { name: 'Uma nova missão' });
    await form.getByLabel('O que você quer fazer?').fill(title);
    await form.getByRole('tab', { name: 'Planejamento', exact: true }).click();
    await form.getByRole('button', { name: 'Sem data', exact: true }).click();
    await form
      .getByRole('button', { name: 'Criar missão', exact: true })
      .click();
    await expect(form).not.toBeVisible();
  }
  await page.locator('.next-mission .context-trigger').click();
  await page
    .getByLabel('Manter em destaque')
    .selectOption({ label: 'Outra ideia flexível · Flexível' });
  await expect(page.locator('#next-title')).toHaveText('Outra ideia flexível');
  await page.reload();
  await expect(page.locator('#next-title')).toHaveText('Outra ideia flexível');
  await expect(
    page.getByRole('button', { name: 'Nova missão', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Começar', exact: true }).click();
  await expect(page).toHaveURL(/\/missao\/\d+$/);
});

test('Hoje abre execução legada preservando notas e sem criar ocorrência ou recompensa', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const id = await page.evaluate(
    () =>
      new Promise<number>((resolve, reject) => {
        const req = indexedDB.open('LevelMeUpDB');
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const db = req.result,
            tx = db.transaction('tasks', 'readwrite');
          const add = tx.objectStore('tasks').add({
            title: 'Rascunho legado',
            xp: 50,
            rarity: 'common',
            createdAt: new Date(),
            completed: false,
            executionState: 'paused',
            executionNotes: 'Notas legadas preservadas',
          });
          tx.oncomplete = () => {
            db.close();
            resolve(Number(add.result));
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
  );
  await page.reload();
  await expect(page.locator('#next-title')).toHaveText('Rascunho legado');
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await expect(page).toHaveURL(new RegExp('/missao/' + id + '$'));
  const saved = await page.evaluate(
    (key) =>
      new Promise<any>((resolve, reject) => {
        const req = indexedDB.open('LevelMeUpDB');
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const db = req.result,
            tx = db.transaction(
              ['tasks', 'occurrences', 'activityEvents'],
              'readonly',
            ),
            task = tx.objectStore('tasks').get(key),
            rows = tx.objectStore('occurrences').count(),
            events = tx.objectStore('activityEvents').count();
          tx.oncomplete = () => {
            db.close();
            resolve({
              task: task.result,
              occurrences: rows.result,
              events: events.result,
            });
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
    id,
  );
  expect(saved.task.executionNotes).toBe('Notas legadas preservadas');
  expect(saved.occurrences).toBe(0);
  expect(saved.events).toBe(0);
});
