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
  await expect(list.getByRole('listitem')).toHaveCount(24);
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
    await list.focus();
    await page.keyboard.press('PageDown');
    await expect
      .poll(() => list.evaluate((el) => el.scrollTop))
      .toBeGreaterThan(0);
    await page.keyboard.press('Home');
    await expect.poll(() => list.evaluate((el) => el.scrollTop)).toBe(0);
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
  ).toBe(true);
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
  const filters = page.getByRole('group', {
    name: 'Filtrar missões da Home',
    exact: true,
  });
  await filters
    .getByRole('button', { name: 'Concluídas', exact: true })
    .click();
  await expect(list.getByRole('listitem')).toHaveCount(8);
  await filters.getByRole('button', { name: /^Hoje / }).click();
  await expect(list.getByRole('listitem')).toHaveCount(32);
  await filters.getByRole('button', { name: 'Todas', exact: true }).click();
  await expect(list.getByRole('listitem')).toHaveCount(96);
});
