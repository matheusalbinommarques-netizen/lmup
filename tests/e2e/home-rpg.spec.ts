import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

async function populateTasks(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const tx = database.transaction('tasks', 'readwrite');
          const now = new Date();
          const today = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0'),
          ].join('-');
          for (let i = 0; i < 96; i++)
            tx.objectStore('tasks').put({
              id: 100 + i,
              title: `Atividade real ${i + 1}`,
              xp: 50,
              effort: 'small',
              rarity: 'common',
              status: i % 4 === 0 ? 'completed' : 'todo',
              completed: i % 4 === 0,
              plannedDate: i % 3 === 0 ? today : null,
              createdAt: new Date(now.getTime() - i * 60000).toISOString(),
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
  );
  await page.reload();
}

test('Home RPG alinha a primeira faixa e os quatro destinos, sem espaço abaixo das missões', async ({
  page,
}, info) => {
  const desktop = info.project.name === 'desktop';
  await page.setViewportSize(
    desktop ? { width: 1536, height: 1024 } : { width: 390, height: 844 },
  );
  await page.clock.setFixedTime(new Date('2026-10-30T19:00:00-03:00'));
  await page.goto('/');
  await expect(
    page.getByRole('region', { name: 'Seu personagem', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', {
      name: 'Boa noite, Herói sem nome.',
      exact: true,
    }),
  ).toBeVisible();
  await populateTasks(page);
  const list = page.getByRole('region', {
    name: 'Lista de missões',
    exact: true,
  });
  await expect(list.getByRole('listitem')).toHaveCount(2);
  const world = (await page
    .getByRole('region', { name: 'Personagem e mundo', exact: true })
    .boundingBox())!;
  const missions = (await page
    .getByRole('region', { name: 'Suas missões', exact: true })
    .boundingBox())!;
  const cards = await Promise.all(
    ['Aventura', 'Refúgio', 'Projetos', 'Mapa'].map((name) =>
      page.getByRole('region', { name, exact: true }).boundingBox(),
    ),
  );
  if (desktop) {
    expect(Math.abs(world.height - missions.height)).toBeLessThanOrEqual(1);
    expect(
      Math.abs(world.y + world.height - missions.y - missions.height),
    ).toBeLessThanOrEqual(1);
    expect(world.x + world.width).toBeLessThan(missions.x);
    for (const card of cards)
      expect(Math.abs(card!.y - cards[0]!.y)).toBeLessThanOrEqual(1);
    const gap = cards[3]!.y - missions.y - missions.height;
    expect(gap).toBeGreaterThanOrEqual(12);
    expect(gap).toBeLessThanOrEqual(16);
    await page
      .getByRole('heading', { name: 'Boa noite, Herói sem nome.', exact: true })
      .click();
  } else {
    expect(world.y + world.height).toBeLessThan(missions.y);
    const next = (await page
      .getByRole('link', { name: 'Começar missão', exact: true })
      .boundingBox())!;
    const nav = (await page
      .getByRole('navigation', { name: 'Navegação móvel', exact: true })
      .boundingBox())!;
    expect(next.y + next.height).toBeLessThan(nav.y);
  }
  expect(
    await list.evaluate((el) => el.scrollHeight > el.clientHeight + 100),
  ).toBe(false);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await expect(
    page.getByText(
      'Mapa explorável em preparação. As paisagens do refúgio já estão disponíveis.',
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Ver lugares do refúgio', exact: true }),
  ).toHaveAttribute('href', '/refugio');
  const documentBounds = await page.evaluate(() => ({
    document: document.documentElement.scrollHeight,
    shell: document.querySelector('.journey-shell')!.getBoundingClientRect()
      .height,
  }));
  expect(documentBounds.document).toBeLessThanOrEqual(
    Math.ceil(documentBounds.shell) + 1,
  );
  if (process.env.LMU_HOME_CAPTURE_DIR) {
    await mkdir(process.env.LMU_HOME_CAPTURE_DIR, { recursive: true });
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({
      path: join(
        process.env.LMU_HOME_CAPTURE_DIR,
        info.project.name + '-rpg-muitas-missoes.png',
      ),
      fullPage: desktop,
    });
    if (desktop) {
      for (const viewport of [
        { width: 1440, height: 900 },
        { width: 1366, height: 768 },
      ]) {
        await page.setViewportSize(viewport);
        await page.evaluate(() =>
          window.scrollTo({ top: 0, behavior: 'instant' }),
        );
        const geometry = await page.evaluate(() => {
          const world = document
            .querySelector('.rpg-world-panel')!
            .getBoundingClientRect();
          const missions = document
            .querySelector('.rpg-missions')!
            .getBoundingClientRect();
          const cards = Array.from(
            document.querySelectorAll('.rpg-destination'),
            (el) => el.getBoundingClientRect().y,
          );
          return {
            overflow: document.documentElement.scrollWidth > innerWidth,
            worldBottom: world.bottom,
            missionsBottom: missions.bottom,
            cards,
            zoom: window.visualViewport!.scale,
            fontSize: getComputedStyle(document.documentElement).fontSize,
          };
        });
        expect(geometry.zoom).toBe(1);
        expect(geometry.fontSize).toBe('16px');
        expect(geometry.overflow).toBe(false);
        expect(
          Math.abs(geometry.worldBottom - geometry.missionsBottom),
        ).toBeLessThanOrEqual(1);
        expect(
          Math.max(...geometry.cards) - Math.min(...geometry.cards),
        ).toBeLessThanOrEqual(1);
        const label = `${viewport.width}x${viewport.height}`;
        await page.screenshot({
          path: join(process.env.LMU_HOME_CAPTURE_DIR, `desktop-${label}.png`),
        });
        await page.screenshot({
          path: join(
            process.env.LMU_HOME_CAPTURE_DIR,
            `desktop-${label}-completa.png`,
          ),
          fullPage: true,
        });
      }
    }
  }
  await expect(
    page.getByRole('group', { name: 'Filtrar missões da Home' }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('link', { name: 'Ver todas', exact: true }),
  ).toHaveAttribute('href', '/missoes');
});

test('prioridade manual persiste, não duplica e volta ao automático ao concluir, arquivar ou excluir', async ({
  page,
}) => {
  await page.goto('/');
  await expect(
    page.getByRole('region', { name: 'Seu personagem', exact: true }),
  ).toBeVisible();
  await populateTasks(page);
  const priority = page.locator('.rpg-priority');
  for (const change of ['completed', 'archived', 'deleted']) {
    const row = page.locator('.rpg-task-list li').first();
    const title = await row.locator('strong').innerText();
    await row
      .getByRole('button', {
        name: `Fixar ${title} como prioritária`,
        exact: true,
      })
      .focus();
    await page.keyboard.press('Enter');
    await expect(
      priority.getByRole('heading', { name: title, exact: true }),
    ).toBeVisible();
    await expect(priority.getByText('Manual', { exact: true })).toBeVisible();
    await expect(
      page.locator('.rpg-task-list').getByText(title, { exact: true }),
    ).toHaveCount(0);
    await page.reload();
    await expect(
      priority.getByRole('heading', { name: title, exact: true }),
    ).toBeVisible();
    await page.evaluate(
      (change) =>
        new Promise<void>((resolve, reject) => {
          const request = indexedDB.open('LevelMeUpDB');
          request.onerror = () => reject(request.error);
          request.onsuccess = () => {
            const database = request.result;
            const tx = database.transaction('tasks', 'readwrite');
            const store = tx.objectStore('tasks');
            const id = Number(localStorage.getItem('lmup.home-priority.v1'));
            const task = store.get(id);
            task.onsuccess = () => {
              if (change === 'deleted') store.delete(id);
              else store.put({ ...task.result, [change]: true });
            };
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
      change,
    );
    await page.reload();
    await expect(
      priority.getByText('Automática', { exact: true }),
    ).toBeVisible();
    await expect(
      priority.getByRole('heading', { name: title, exact: true }),
    ).toHaveCount(0);
    expect(
      await page.evaluate(() => localStorage.getItem('lmup.home-priority.v1')),
    ).toBeNull();
  }
  await priority.getByRole('button', { name: /^Fixar / }).click();
  await expect(priority.getByText('Manual', { exact: true })).toBeVisible();
  await priority
    .getByRole('button', { name: 'Voltar à prioridade automática' })
    .click();
  await expect(priority.getByText('Automática', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  await expect(
    page.getByRole('dialog', { name: 'Uma nova missão' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('link', { name: 'Ver todas', exact: true }).click();
  await expect(page).toHaveURL(/\/missoes$/);
});

test('recorrências contam a ocorrência de hoje e não reutilizam etapas antigas nem executam missão futura', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date('2026-10-31T19:00:00-03:00'));
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
          const database = request.result;
          const tx = database.transaction('tasks', 'readwrite');
          const store = tx.objectStore('tasks');
          store.clear();
          const base = {
            xp: 50,
            rarity: 'common',
            effort: 'small',
            createdAt: '2026-10-30T12:00:00Z',
          };
          store.put({
            ...base,
            id: 201,
            title: 'Rotina concluída hoje',
            completed: true,
            recurrence: { kind: 'daily', startDate: '2026-10-30' },
            lastOccurrenceDate: '2026-10-31',
          });
          store.put({
            ...base,
            id: 202,
            title: 'Rotina pausada',
            completed: true,
            executionState: 'paused',
            recurrence: { kind: 'daily', startDate: '2026-10-30' },
            lastOccurrenceDate: '2026-10-30',
            occurrenceSession: '2026-10-30',
            subtasks: ['Primeiro passo', 'Segundo passo'],
            completedSubtasks: [0, 1],
          });
          store.put({
            ...base,
            id: 203,
            title: 'Missão futura',
            plannedDate: '2026-11-01',
          });
          localStorage.setItem('lmup.home-priority.v1', '203');
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
  const panel = page.getByRole('region', { name: 'Suas missões', exact: true });
  await expect(panel).toContainText('1 de 2 concluídas hoje');
  await expect(
    panel.getByRole('link', { name: 'Continuar missão', exact: true }),
  ).toHaveAttribute('href', '/missao/202');
  await expect(
    panel.getByRole('progressbar', { name: 'Etapas da missão prioritária' }),
  ).toHaveAttribute('value', '0');
  await expect(panel.getByText('Automática', { exact: true })).toBeVisible();
  await expect(panel).not.toContainText('Missão futura');
  await expect(panel.getByRole('listitem')).toHaveCount(0);
});
