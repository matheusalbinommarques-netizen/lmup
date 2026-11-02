import { expect, test, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const states = [
  'novo',
  'prioridade',
  'planejadas',
  'concluidas',
  'rotina',
  'progresso',
] as const;
type HomeState = (typeof states)[number];
const today = '2026-11-02';

async function seed(page: Page, state: HomeState) {
  await page.goto('/');
  await expect(page.locator('.horizons')).toBeVisible();
  if (state === 'novo') return;
  await page.evaluate(
    async ({ state, today }) => {
      const database = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      try {
        await new Promise<void>((resolve, reject) => {
          const tx = database.transaction(
            [
              'tasks',
              'profile',
              'routines',
              'ownedShopItems',
              'achievementReceipts',
            ],
            'readwrite',
          );
          const count =
            state === 'planejadas'
              ? 5
              : state === 'rotina'
                ? 3
                : state === 'concluidas'
                  ? 2
                  : 1;
          if (state !== 'progresso')
            for (let i = 0; i < count; i++)
              tx.objectStore('tasks').put({
                id: 501 + i,
                title: [
                  'Preparar uma proposta para o próximo projeto',
                  'Revisar anotações e organizar referências',
                  'Caminhar e registrar ideias',
                  'Planejar a próxima semana',
                  'Organizar o espaço de trabalho',
                ][i],
                xp: 50,
                rarity: 'common',
                createdAt: new Date(`${today}T12:00:00Z`),
                completed: false,
                productivityVersion: 1,
                tracking: { method: 'direct' },
                plannedDate: today,
                plannedTime: `${String(9 + i * 2).padStart(2, '0')}:00`,
                estimatedMinutes: 25,
                areaId: 0,
                iconKey: 'estudo',
                ...(state === 'rotina'
                  ? {
                      routineId: 'home-polish-routine',
                      recurrence: { kind: 'daily', startDate: today },
                    }
                  : {}),
              });
          if (state === 'rotina')
            tx.objectStore('routines').put({
              id: 'home-polish-routine',
              name: 'Manhã com intenção',
              description: '',
              days: [1, 2, 3, 4, 5],
              startDate: today,
              status: 'active',
              entries: [501, 502, 503].map((taskId, i) => ({
                taskId,
                time: `${String(9 + i * 2).padStart(2, '0')}:00`,
                previousPlan: {},
              })),
              pauseQuota: 0,
              pausePeriodDays: 7,
              revision: 1,
              createdAt: `${today}T12:00:00Z`,
            });
          if (state === 'progresso') {
            const store = tx.objectStore('profile'),
              request = store.get(1);
            request.onsuccess = () =>
              store.put({
                ...request.result,
                name: 'Helena da Aurora',
                title: 'Arquimago Grão-Mestre',
                level: 11,
                totalXpEarned: 8000,
                xpCurrent: 1484,
                xpNext: 1559,
                gold: 735,
                food: 24,
              });
            tx.objectStore('ownedShopItems').put({
              id: 91,
              itemId: 101,
              equipped: true,
              acquiredAt: `${today}T12:00:00Z`,
            });
            tx.objectStore('achievementReceipts').put({
              id: 'primeiro-marco-projeto',
              earnedAt: `${today}T12:00:00Z`,
            });
          }
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
          tx.onabort = () => reject(tx.error);
        });
      } finally {
        database.close();
      }
      if (state === 'prioridade')
        localStorage.setItem('lmup.home-priority.v1', '501');
    },
    { state, today },
  );
  if (state === 'concluidas') {
    for (const id of [501, 502]) {
      await page.goto(`/missao/${id}`);
      await page
        .getByRole('button', { name: 'Concluir missão', exact: true })
        .click();
      await expect(
        page.getByRole('heading', { name: 'Missão concluída!', exact: true }),
      ).toBeVisible();
    }
  }
  await page.goto('/');
  await expect(page.locator('.horizons')).toBeVisible();
}

for (const state of states)
  test(`acabamento da Home: ${state}`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.clock.setFixedTime(new Date(`${today}T10:00:00-03:00`));
    await seed(page, state);
    for (const width of info.project.name === 'desktop'
      ? [1536, 1024]
      : [390, 320]) {
      await page.setViewportSize({ width, height: width > 900 ? 1024 : 844 });
      await page.evaluate(() => document.fonts.ready);
      if (width > 900) {
        const sidebar = page.locator('.journey-sidebar');
        for (const label of [
          sidebar.locator('.journey-brand > span'),
          sidebar
            .getByRole('link', { name: 'Companheiros', exact: true })
            .locator('.journey-nav-label'),
        ]) {
          expect(
            await label.evaluate((el) => {
              const text = Array.from(el.childNodes).find(
                (node) =>
                  node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
              )!;
              const range = document.createRange();
              range.selectNodeContents(text);
              return range.getClientRects().length;
            }),
          ).toBe(1);
        }
        expect(
          await sidebar
            .getByRole('link', { name: 'Companheiros', exact: true })
            .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
        ).toBe(true);
      }

      await expect(page.locator('.world-card')).toHaveCount(3);
      for (const heading of await page.locator('.world-card h2').all())
        expect(
          await heading.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
        ).toBe(true);
      for (const heading of await page.locator('.world-card h2').all())
        expect(
          await heading.evaluate((el) => {
            const text = Array.from(el.childNodes).find(
              (node) =>
                node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
            )!;
            const range = document.createRange();
            range.selectNodeContents(text);
            return range.getClientRects().length;
          }),
        ).toBe(1);

      await expect(
        page.getByRole('region', { name: 'Seu personagem', exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole('progressbar', { name: 'Evolução do ambiente' }),
      ).toBeVisible();
      await expect(
        page.getByRole('progressbar', { name: 'Experiência do personagem' }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      for (const selector of ['.next-mission', '.day-plan', '.horizons'])
        expect(
          await page
            .locator(selector)
            .evaluate((el) => el.scrollHeight <= el.clientHeight + 1),
        ).toBe(true);
      if (state === 'novo' || state === 'concluidas' || state === 'progresso') {
        await expect(
          page.getByRole('button', { name: 'Nova missão', exact: true }),
        ).toHaveCount(1);
        await expect(page.locator('.day-plan li')).toHaveCount(0);
      } else {
        await expect(
          page.getByRole('button', { name: 'Começar', exact: true }),
        ).toBeVisible();
        await expect(page.locator('#next-title')).toHaveText(
          'Preparar uma proposta para o próximo projeto',
        );
      }
      if (state === 'prioridade')
        await expect(page.locator('.mission-meta')).toContainText(
          'Escolhida por você',
        );
      if (state === 'planejadas')
        await expect(page.locator('.day-plan li')).toHaveCount(4);
      if (state === 'rotina') {
        await expect(page.locator('.mission-meta')).toContainText('09:00');
        await expect(page.locator('.time-chip')).toHaveText(['11:00', '13:00']);
      }
      if (state === 'concluidas') {
        await expect(page.locator('.daily-summary')).toContainText(
          '2 de 2 ocorrências',
        );
        await expect(page.locator('.daily-rewards')).toContainText('+106 XP');
        await expect(page.locator('.daily-rewards')).toContainText('+50 Ouro');
      }
      if (state === 'progresso') {
        await expect(page.locator('.horizon-hero')).toContainText(
          'Helena da Aurora',
        );
        await expect(page.locator('.horizon-hero')).toContainText('735 Gold');
        await expect(page.locator('.horizon-hero')).toContainText('24 Comida');
        const earned = await page.evaluate(
          () =>
            new Promise<number>((resolve, reject) => {
              const request = indexedDB.open('LevelMeUpDB');
              request.onerror = () => reject(request.error);
              request.onsuccess = () => {
                const database = request.result,
                  tx = database.transaction('achievementReceipts', 'readonly');
                const rows = tx.objectStore('achievementReceipts').getAll();
                tx.oncomplete = () => {
                  database.close();
                  resolve(
                    rows.result.filter((row) => !row.invalidatedAt).length,
                  );
                };
                tx.onerror = () => reject(tx.error);
              };
            }),
        );
        expect(earned).toBeGreaterThan(0);
        await expect(page.locator('.horizons')).toContainText(
          `${earned} conquistadas`,
        );
        await expect(
          page.getByRole('link', { name: 'Equipado: Cota da Rotina' }),
        ).toBeVisible();
      }
      if (process.env.LMU_HOME_POLISH_CAPTURE_DIR) {
        const folder = process.env.LMU_HOME_POLISH_CAPTURE_DIR;
        await mkdir(folder, { recursive: true });
        const name = `${state}-${width}`;
        await page.screenshot({
          path: join(folder, `${name}.png`),
          fullPage: true,
          animations: 'disabled',
        });
        await writeFile(
          join(folder, `${name}.json`),
          JSON.stringify(
            await page.evaluate(() =>
              Object.fromEntries(
                ['.next-mission', '.horizons', '.horizon-hero'].map(
                  (selector) => [
                    selector,
                    document
                      .querySelector(selector)!
                      .getBoundingClientRect()
                      .toJSON(),
                  ],
                ),
              ),
            ),
            null,
            2,
          ),
        );
      }
    }
    if (state === 'novo') {
      await page
        .getByRole('button', { name: 'Nova missão', exact: true })
        .click();
      await expect(page.getByLabel('O que você quer fazer?')).toBeFocused();
      await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
      await expect(
        page.getByRole('button', { name: 'Nova missão', exact: true }),
      ).toBeFocused();
    }
    if (state === 'prioridade') {
      await page.getByRole('button', { name: 'Começar', exact: true }).click();
      await expect(page).toHaveURL(/\/missao\/501$/);
    }
    expect(errors).toEqual([]);
  });
