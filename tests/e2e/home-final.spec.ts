import { expect, test, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// All fixtures live only in the isolated browser context, never in runtime UI.
async function setTasks(page: Page, completed: boolean | null) {
  await expect(
    page.getByRole('region', { name: 'Seu personagem', exact: true }),
  ).toBeVisible();
  await page.evaluate(
    (done) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onblocked = () =>
          reject(new Error('Banco de teste bloqueado durante a preparação.'));
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
          tx.onabort = () => {
            db.close();
            reject(tx.error ?? new Error('Preparação interrompida.'));
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

test('Home final mantém navegação inteira e estados claros nas cinco resoluções', async ({
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
    await setTasks(page, null);
    await expect(
      page.getByRole('button', { name: 'Nova missão', exact: true }),
    ).toHaveCount(1);
    await setTasks(page, false);
    await expect(page.locator('.day-plan li')).toHaveCount(1);
    const geometry = await page.evaluate(() => ({
      width: innerWidth,
      overflow: document.documentElement.scrollWidth > innerWidth,
      scale: visualViewport!.scale,
      listScroll:
        document.querySelector('.day-plan')!.scrollHeight -
        document.querySelector('.day-plan')!.clientHeight,
      nextScroll:
        document.querySelector('.next-mission')!.scrollHeight -
        document.querySelector('.next-mission')!.clientHeight,
    }));
    metrics.push(geometry);
    expect(geometry.scale).toBe(1);
    expect(geometry.overflow).toBe(false);
    expect(geometry.listScroll).toBeLessThanOrEqual(1);
    expect(geometry.nextScroll).toBeLessThanOrEqual(1);
    if (size.width > 900) {
      const nav = page.getByRole('navigation', {
        name: 'Navegação principal',
        exact: true,
      });
      await expect(
        nav.getByRole('link', { name: 'Acampamento', exact: true }),
      ).toBeInViewport();
      await expect(
        page
          .locator('.journey-sidebar')
          .getByRole('button', { name: 'Perfil e mais', exact: true }),
      ).toBeInViewport();
    }
    await capture(page, `${size.width}x${size.height}-pendentes`);
    await setTasks(page, true);
    await expect(page.locator('#next-title')).toHaveText(
      'Seu plano está em dia',
    );
    await expect(page.locator('.daily-summary')).toContainText(
      '2 de 2 missões',
    );
    await expect(page.locator('.day-plan li')).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: 'Nova missão', exact: true }),
    ).toHaveCount(1);
    await expect(
      page.getByRole('link', { name: 'Ver todas as missões', exact: true }),
    ).toHaveAttribute('href', '/missoes');
    await setTasks(page, false);
    await page
      .getByRole('button', { name: 'Começar missão', exact: true })
      .focus();
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

test('Home mantém identidade de todas as companhias e navegação acessível sem o antigo sprite sobreposto', async ({
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
      await expect(page.locator('.hero-profile')).toContainText(name);
      await expect(page.locator('.hero-profile')).toHaveAttribute(
        'href',
        '/perfil',
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      ).toBe(false);
    }
  await capture(page, info.project.name + '-companheiro-nome-longo');
  await page.route('**/art/approved/paintings/**', (route) => route.abort());
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Nova missão', exact: true }),
  ).toBeVisible();
  if (info.project.name === 'desktop') {
    const camp = page
      .getByRole('navigation', { name: 'Navegação principal', exact: true })
      .getByRole('link', { name: 'Acampamento', exact: true });
    await camp.focus();
    await expect(camp).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/refugio\/acampamento$/);
    await expect(page.getByTestId('point-caretaker')).toBeAttached();
    const more = page.getByRole('button', {
      name: 'Perfil e mais',
      exact: true,
    });
    await more.focus();
    await page.keyboard.press('Enter');
    const companions = page
      .getByRole('dialog', { name: 'Seu espaço', exact: true })
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
