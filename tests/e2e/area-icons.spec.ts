import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

async function seedLegacy(page: Page) {
  await page.clock.setFixedTime(new Date('2026-11-02T15:00:00-03:00'));
  await page.goto('/missoes');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const tx = database.transaction(['areas', 'tasks'], 'readwrite');
          const areas = tx.objectStore('areas'),
            tasks = tx.objectStore('tasks');
          areas.put({ id: 1, nome: 'Estudos' });
          areas.put({ id: 2, nome: 'Atividade física' });
          areas.put({ id: 3, nome: 'Trabalho' });
          const rows = [
            ['Ler um capítulo', 1, 'estudo'],
            ['Revisar anotações', 1, 'estudo'],
            ['Alongar por dez minutos', 2, 'exercicio'],
            ['Preparar apresentação', 3, 'estudo'],
            ['Organizar documentos', 3, 'cozinha'],
            ['Uma tarefa sem área', 0, 'exercicio'],
          ];
          rows.forEach(([title, areaId, iconKey], index) =>
            tasks.put({
              id: index + 1,
              title,
              areaId,
              iconKey,
              xp: 50,
              rarity: 'common',
              completed: false,
              status: 'available',
              plannedDate: '2026-11-02',
              createdAt: '2026-11-02T15:00:00-03:00',
            }),
          );
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
  );
  await page.reload();
  await expect(
    page.getByRole('link', { name: 'Ler um capítulo', exact: true }),
  ).toBeVisible();
}

async function data(page: Page) {
  return page.evaluate(
    () =>
      new Promise<any>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onsuccess = () => {
          const db = request.result,
            tx = db.transaction(
              ['areas', 'tasks', 'profile', 'activityEvents'],
              'readonly',
            );
          const areas = tx.objectStore('areas').getAll(),
            tasks = tx.objectStore('tasks').getAll(),
            profile = tx.objectStore('profile').get(1),
            events = tx.objectStore('activityEvents').getAll();
          tx.oncomplete = () => {
            resolve({
              areas: areas.result,
              tasks: tasks.result,
              profile: profile.result,
              events: events.result,
              version: db.version,
            });
            db.close();
          };
          tx.onerror = () => reject(tx.error);
        };
        request.onerror = () => reject(request.error);
      }),
  );
}

function row(page: Page, title: string) {
  return page.locator('.mission-row').filter({ hasText: title });
}
async function assertIcon(page: Page, title: string, key: string) {
  await expect(row(page, title).locator('.approved-icon img')).toHaveAttribute(
    'src',
    new RegExp(key),
  );
}
async function manage(page: Page) {
  await page
    .getByRole('button', { name: 'Ferramentas de missões', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Gerenciar áreas', exact: true })
    .click();
  return page.getByRole('dialog', { name: 'Minhas áreas', exact: true });
}

test('adoção e conflitos preservam dados e ícones da área atualizam Lista, Hoje, agenda e outra aba', async ({
  page,
  context,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await seedLegacy(page);
  const before = await data(page);
  expect(before.areas.find((a: any) => a.id === 1).iconKey).toBe('estudo');
  expect(before.areas.find((a: any) => a.id === 3)).toMatchObject({
    iconKey: null,
    iconConflict: true,
  });
  await assertIcon(page, 'Ler um capítulo', '/estudo/');
  await assertIcon(page, 'Uma tarefa sem área', 'Missoes_64');
  const other = await context.newPage();
  await other.goto('/');
  const areas = await manage(page);
  await expect(
    areas.getByText('Ícones anteriores diferentes.', { exact: false }),
  ).toBeVisible();
  await areas
    .getByRole('button', { name: 'Editar Estudos', exact: true })
    .click();
  const edit = areas
    .locator('li')
    .filter({ has: page.getByLabel('Novo nome de Estudos', { exact: true }) });
  await edit.getByText('Ícone da área', { exact: true }).click();
  await edit.getByRole('button', { name: 'Exercício', exact: true }).click();
  await edit.getByRole('button', { name: 'Salvar área', exact: true }).click();
  await areas
    .getByRole('button', { name: 'Fechar diálogo', exact: true })
    .click();
  await assertIcon(page, 'Ler um capítulo', '/exercicio/');
  await assertIcon(page, 'Revisar anotações', '/exercicio/');
  await expect(
    other
      .locator('.next-mission .approved-icon img[src*="/exercicio/"]')
      .first(),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Agenda', exact: true }).click();
  await page.getByRole('button', { name: 'Dia', exact: true }).click();
  const agendaRow = page
    .locator('.occurrence-row')
    .filter({ hasText: 'Ler um capítulo' });
  await expect(agendaRow.locator('img[src*="/exercicio/"]')).toBeVisible();
  const after = await data(page);
  expect(after.tasks).toEqual(before.tasks);
  expect(after.profile).toEqual(before.profile);
  expect(after.events).toEqual(before.events);
  expect(after.version).toBe(before.version);
  await page.reload();
  await expect(agendaRow.locator('img[src*="/exercicio/"]')).toBeVisible();
  expect(errors).toEqual([]);
  if (process.env.LMU_AREA_ICON_CAPTURES) {
    await mkdir(process.env.LMU_AREA_ICON_CAPTURES, { recursive: true });
    await page.screenshot({
      path: join(
        process.env.LMU_AREA_ICON_CAPTURES,
        `${testInfo.project.name}-agenda.png`,
      ),
      fullPage: true,
    });
  }
});

test('editor configura conflitos; criação e edição herdam área sem sobrescrever ícone legado', async ({
  page,
}, testInfo) => {
  await seedLegacy(page);
  const areas = await manage(page);
  await areas
    .getByRole('button', { name: 'Editar Trabalho', exact: true })
    .click();
  const edit = areas.locator('li').filter({
    has: page.getByLabel('Novo nome de Trabalho', { exact: true }),
  });
  await edit.getByText('Ícone da área', { exact: true }).click();
  await edit.getByRole('button', { name: 'Exercício', exact: true }).click();
  await edit.getByRole('button', { name: 'Salvar área', exact: true }).click();
  await expect(
    areas.getByText('Ícones anteriores diferentes.', { exact: false }),
  ).not.toBeVisible();
  if (process.env.LMU_AREA_ICON_CAPTURES) {
    await mkdir(process.env.LMU_AREA_ICON_CAPTURES, { recursive: true });
    await page.screenshot({
      path: join(
        process.env.LMU_AREA_ICON_CAPTURES,
        `${testInfo.project.name}-areas.png`,
      ),
      fullPage: true,
    });
  }
  await areas
    .getByRole('button', { name: 'Fechar diálogo', exact: true })
    .click();
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const form = page.getByRole('dialog', {
    name: 'Uma nova missão',
    exact: true,
  });
  await form.getByLabel('O que você quer fazer?').fill('Nova missão com área');
  await form
    .getByRole('combobox', { name: 'Área', exact: true })
    .selectOption('3');
  await expect(form.locator('.area-icon-preview img')).toHaveAttribute(
    'src',
    /exercicio/,
  );
  await form
    .getByRole('tab', { name: 'Passos e detalhes', exact: true })
    .click();
  await expect(
    form.getByText('Ícone da missão (opcional)', { exact: true }),
  ).toHaveCount(0);
  await form.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await assertIcon(page, 'Nova missão com área', '/exercicio/');
  const existing = row(page, 'Ler um capítulo');
  await existing
    .getByLabel('Ações para Ler um capítulo', { exact: true })
    .click();
  await existing
    .getByRole('button', { name: 'Editar missão', exact: true })
    .click();
  const editor = page.getByRole('dialog', {
    name: 'Editar missão',
    exact: true,
  });
  await editor
    .getByRole('combobox', { name: 'Área', exact: true })
    .selectOption('2');
  await editor
    .getByRole('button', { name: 'Salvar missão', exact: true })
    .click();
  await assertIcon(page, 'Ler um capítulo', '/exercicio/');
  const saved = await data(page);
  expect(saved.tasks.find((t: any) => t.id === 1).iconKey).toBe('estudo');
  expect(
    saved.tasks.find((t: any) => t.title === 'Nova missão com área').iconKey,
  ).toBeUndefined();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await page.reload();
  await assertIcon(page, 'Ler um capítulo', '/exercicio/');
});
