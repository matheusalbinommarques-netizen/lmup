import { expect, test, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// All fixtures live only in the isolated browser context, never in runtime UI.
async function setTasks(page: Page, completed: boolean | null) {
  await page.evaluate(
    (done) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('tasks', 'readwrite');
          const tasks = tx.objectStore('tasks');
          tasks.clear();
          for (let i = 0; i < (done === null ? 0 : 2); i++)
            tasks.put({
              id: 100 + i,
              title: ['Estudar por 30 minutos', 'Organizar a semana'][i],
              xp: 50,
              effort: 'small',
              rarity: 'common',
              status: done ? 'completed' : 'todo',
              completed: done,
              plannedDate: [
                new Date().getFullYear(),
                String(new Date().getMonth() + 1).padStart(2, '0'),
                String(new Date().getDate()).padStart(2, '0'),
              ].join('-'),
              createdAt: new Date().toISOString(),
            });
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => {
            db.close();
            reject(tx.error);
          };
        };
      }),
    completed,
  );
  await page.reload();
  await expect(
    page.getByRole('region', { name: 'Seu personagem', exact: true }),
  ).toBeVisible();
}

async function capture(page: Page, name: string, fullPage = false) {
  if (!process.env.LMU_HOME_CAPTURE_DIR) return;
  await mkdir(process.env.LMU_HOME_CAPTURE_DIR, { recursive: true });
  await page.evaluate(async () => {
    await document.fonts.ready;
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.screenshot({
    path: join(process.env.LMU_HOME_CAPTURE_DIR, name + '.png'),
    fullPage,
  });
}

test('Home final mantém navegação inteira, poucas missões sem rolagem interna e estados claros nas cinco resoluções', async ({
  page,
}, info) => {
  const sizes =
    info.project.name === 'desktop'
      ? [
          { width: 1366, height: 768 },
          { width: 1440, height: 900 },
          { width: 1920, height: 1080 },
        ]
      : [
          { width: 390, height: 844 },
          { width: 320, height: 568 },
        ];
  const metrics = [];
  await page.clock.setFixedTime(new Date('2026-10-30T19:00:00-03:00'));
  for (const size of sizes) {
    await page.setViewportSize(size);
    await page.goto('/');
    await expect(
      page.getByRole('region', { name: 'Seu personagem', exact: true }),
    ).toBeVisible();
    await setTasks(page, null);
    await expect(
      page.getByRole('button', { name: 'Criar minha primeira missão' }),
    ).toBeVisible();
    if (size.width === 1440 || size.width === 320)
      await capture(page, `${size.width}x${size.height}-inicial`);
    await setTasks(page, false);
    const list = page.getByRole('region', {
      name: 'Lista de missões',
      exact: true,
    });
    await expect(list.getByRole('listitem')).toHaveCount(1);
    const geometry = await page.evaluate(() => {
      const sidebar = document.querySelector('.journey-sidebar')!;
      const list = document.querySelector('.rpg-mission-content')!;
      const next = document.querySelector('.rpg-priority')!;
      const world = document
        .querySelector('.rpg-world-panel')!
        .getBoundingClientRect();
      const missions = document
        .querySelector('.rpg-missions')!
        .getBoundingClientRect();
      const labels = Array.from(
        sidebar.querySelectorAll('.journey-nav-label'),
        (el) => {
          const rect = el.getBoundingClientRect();
          return {
            height: rect.height,
            lineHeight: parseFloat(getComputedStyle(el).lineHeight),
          };
        },
      );
      return {
        size: { width: innerWidth, height: innerHeight },
        scale: visualViewport!.scale,
        overflow: document.documentElement.scrollWidth > innerWidth,
        sidebarScroll: sidebar.scrollHeight - sidebar.clientHeight,
        listScroll: list.scrollHeight - list.clientHeight,
        nextScroll: next.scrollHeight - next.clientHeight,
        aligned: Math.abs(world.bottom - missions.bottom),
        labels,
      };
    });
    metrics.push(geometry);
    expect(geometry.scale).toBe(1);
    expect(geometry.overflow).toBe(false);
    expect(geometry.listScroll).toBeLessThanOrEqual(1);
    expect(geometry.nextScroll).toBeLessThanOrEqual(1);
    if (size.width > 760) {
      expect(geometry.aligned).toBeLessThanOrEqual(1);
      expect(geometry.sidebarScroll).toBeLessThanOrEqual(1);
      for (const label of geometry.labels)
        expect(label.height).toBeLessThanOrEqual(label.lineHeight + 1);
      const sidebar = page.locator('.journey-sidebar');
      await expect(
        sidebar.getByRole('link', { name: 'Companheiros', exact: true }),
      ).toBeInViewport();
      await expect(
        sidebar.getByRole('button', { name: 'Perfil e mais', exact: true }),
      ).toBeInViewport();
    }
    await capture(page, `${size.width}x${size.height}-pendentes`);
    if (size.width === 390 || size.width === 1366)
      await capture(page, `${size.width}x${size.height}-completa`, true);
    await setTasks(page, true);
    await expect(
      page.getByRole('heading', { name: 'Você está em dia.', exact: true }),
    ).toBeVisible();
    await expect(list.getByRole('listitem')).toHaveCount(0);
    const empty = await page.locator('.rpg-empty').boundingBox();
    expect(empty!.height).toBeLessThan(150);
    if (size.width === 390 || size.width === 1366)
      await capture(page, `${size.width}x${size.height}-em-dia`);
    await expect(
      page.getByRole('link', { name: 'Ver todas', exact: true }),
    ).toHaveAttribute('href', '/missoes');
    await setTasks(page, false);
    const action = page.getByRole('link', {
      name: 'Começar missão',
      exact: true,
    });
    await action.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/missao\/100$/);
    await expect(
      page.getByRole('heading', {
        name: 'Estudar por 30 minutos',
        exact: true,
      }),
    ).toBeVisible();
  }
  if (process.env.LMU_HOME_CAPTURE_DIR)
    await writeFile(
      join(
        process.env.LMU_HOME_CAPTURE_DIR,
        info.project.name + '-medidas.json',
      ),
      JSON.stringify(metrics, null, 2),
    );
});

test('painel provisório suporta nomes longos, todas as espécies e estágios e navegação compacta acessível', async ({
  page,
}, info) => {
  await page.setViewportSize(
    info.project.name === 'desktop'
      ? { width: 1024, height: 768 }
      : { width: 320, height: 568 },
  );
  await page.goto('/');
  await expect(
    page.getByRole('region', { name: 'Seu personagem', exact: true }),
  ).toBeVisible();
  for (const key of ['wolf', 'dragon', 'lich', 'aberration'])
    for (const stage of [1, 2, 3]) {
      const name = `${key} — Guardião das Memórias da Floresta e das Montanhas Distantes`;
      await page.evaluate(
        ({ key, stage, name }) =>
          new Promise<void>((resolve, reject) => {
            const request = indexedDB.open('LevelMeUpDB');
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
              const db = request.result;
              const tx = db.transaction(['companions', 'profile'], 'readwrite');
              tx.objectStore('companions').put({
                id: 90,
                key,
                name,
                unlocked: true,
                evolutionStage: stage,
              });
              const profile = tx.objectStore('profile').get(1);
              profile.onsuccess = () =>
                tx
                  .objectStore('profile')
                  .put({ ...profile.result, activeCompanionId: 90 });
              tx.oncomplete = () => {
                db.close();
                resolve();
              };
              tx.onerror = () => {
                db.close();
                reject(tx.error);
              };
            };
          }),
        { key, stage, name },
      );
      await page.reload();
      const companion = page.getByRole('link', {
        name: `Seu companheiro: ${name}`,
        exact: true,
      });
      await expect(companion).toBeVisible();
      await expect(companion.locator('img')).toHaveAttribute(
        'src',
        new RegExp(`${key}-${stage}-160.webp`),
      );
      const bounds = await page.evaluate(() => {
        const caption = document
          .querySelector('.rpg-scene-caption')!
          .getBoundingClientRect();
        const companion = document
          .querySelector('.rpg-scene-companion')!
          .getBoundingClientRect();
        const scene = document
          .querySelector('.rpg-scene')!
          .getBoundingClientRect();
        return {
          gap: companion.left - caption.right,
          top: companion.top - scene.top,
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      expect(bounds.gap).toBeGreaterThanOrEqual(0);
      expect(bounds.top).toBeGreaterThanOrEqual(0);
      expect(bounds.overflow).toBe(false);
    }
  await capture(page, info.project.name + '-companheiro-nome-longo');
  await page.route('**/art/companions-v2/aberration-3*', (route) =>
    route.abort(),
  );
  await page.reload();
  await expect(
    page.locator('.rpg-scene-companion .lmu-art-fallback'),
  ).toBeVisible();
  if (info.project.name === 'desktop') {
    const companions = page
      .getByRole('navigation', { name: 'Navegação principal', exact: true })
      .getByRole('link', { name: 'Companheiros', exact: true });
    await companions.focus();
    await expect(companions).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/bestiario$/);
  } else {
    await page
      .getByRole('button', { name: 'Nova missão', exact: true })
      .focus();
    await page.keyboard.press('Enter');
    await expect(
      page
        .getByRole('dialog', { name: 'Uma nova missão' })
        .getByLabel('O que você quer fazer?'),
    ).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(
      page.getByRole('button', { name: 'Nova missão', exact: true }),
    ).toBeFocused();
  }
});
