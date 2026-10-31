import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

// Synthetic data in disposable contexts; never use the user's 5174 origin.
async function seed(page: Page, total: number, xp = 50, project = false) {
  await page.goto('/');
  await expect(
    page.getByRole('region', { name: 'Seu personagem', exact: true }),
  ).toBeVisible();
  await page.evaluate(
    ({ total, xp, project }) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction(
            ['profile', 'tasks', 'projects'],
            'readwrite',
          );
          const profile = tx.objectStore('profile');
          const read = profile.get(1);
          read.onsuccess = () =>
            profile.put({
              ...read.result,
              totalXpEarned: total,
              activeCompanionId: null,
              ecoGoldClaimedUpToStage: 1,
            });
          tx.objectStore('tasks').put({
            id: 800,
            title: 'Estudar por 30 minutos',
            xp,
            effort: 'small',
            rarity: 'common',
            status: 'available',
            completed: false,
            createdAt: new Date().toISOString(),
            ...(project ? { projectId: 800 } : {}),
          });
          if (project)
            tx.objectStore('projects').put({
              id: 800,
              name: 'Caderno de estudos',
              status: 'em_andamento',
              difficulty: 'medium',
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
    { total, xp, project },
  );
  await page.goto('/missao/800');
  await expect(
    page.getByRole('button', { name: 'Concluir missão', exact: true }),
  ).toBeEnabled();
}

async function receipt(page: Page) {
  return page.evaluate(
    () =>
      new Promise<{
        total: number;
        gold: number;
        food: number;
        events: number;
        xp: number;
      }>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction(['profile', 'activityEvents'], 'readonly');
          const profile = tx.objectStore('profile').get(1);
          const events = tx.objectStore('activityEvents').getAll();
          tx.oncomplete = () => {
            db.close();
            resolve({
              total: profile.result.totalXpEarned,
              gold: profile.result.gold,
              food: profile.result.food,
              events: events.result.length,
              xp: events.result[0]?.reward.xp,
            });
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
  );
}

async function capture(page: Page, name: string) {
  const directory = 'docs/recompensa-viva-capturas';
  await mkdir(directory, { recursive: true });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: join(directory, name + '.png'),
    fullPage: true,
    animations: 'disabled',
  });
}

for (const state of [
  { name: 'comum', total: 0, level: false, refuge: false },
  { name: 'nivel', total: 230, level: true, refuge: false },
  { name: 'refugio', total: 2490, level: false, refuge: true },
]) {
  test(`recompensa ${state.name}: recibo real, retorno e reabertura sem duplicação`, async ({
    page,
  }, info) => {
    await seed(page, state.total);
    await page
      .getByRole('button', { name: 'Concluir missão', exact: true })
      .click();
    const summary = page.getByRole('region', { name: 'Resumo da recompensa' });
    await expect(
      summary.getByRole('heading', { name: 'Missão concluída!', exact: true }),
    ).toBeVisible();
    await expect(summary).toHaveClass(/celebrate/);
    await expect(
      summary.getByRole('region', { name: 'Subida de nível' }),
    ).toHaveCount(state.level ? 1 : 0);
    await expect(
      summary.getByRole('region', { name: 'Evolução do Refúgio' }),
    ).toHaveCount(state.refuge ? 1 : 0);
    await expect(summary.getByRole('progressbar')).toHaveCount(2);
    const granted = await receipt(page);
    expect(granted.total).toBe(state.total + granted.xp);
    await expect(summary.getByLabel('Recompensa recebida')).toContainText(
      `+${granted.xp}`,
    );
    await expect(summary.getByLabel('Recompensa recebida')).toContainText(
      `+${granted.gold}`,
    );
    if (state.refuge) {
      await expect(summary.getByRole('img')).toHaveCount(2);
      expect(
        await summary
          .getByRole('img')
          .evaluateAll((images) =>
            images.every(
              (img) =>
                (img as HTMLImageElement).complete &&
                (img as HTMLImageElement).naturalWidth > 0,
            ),
          ),
      ).toBe(true);
    }
    await capture(page, `${info.project.name}-${state.name}`);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await summary.getByRole('button', { name: 'Pular efeitos' }).click();
    await expect(summary).not.toHaveClass(/celebrate/);
    await summary
      .getByRole('link', { name: 'Continuar', exact: true })
      .press('Enter');
    await expect(page).toHaveURL('/');
    await expect(
      page.getByRole('region', { name: 'Seu personagem', exact: true }),
    ).toContainText(String(granted.gold));
    await capture(page, `${info.project.name}-${state.name}-home`);
    await page.goto('/missao/800');
    await expect(summary).toBeVisible();
    await expect(summary).not.toHaveClass(/celebrate/);
    await page.reload();
    await expect(summary).toBeVisible();
    await expect(
      summary.getByRole('button', { name: 'Pular efeitos' }),
    ).toHaveCount(0);
    expect(await receipt(page)).toEqual(granted);
    await page
      .getByRole('button', { name: 'Desfazer conclusão', exact: true })
      .click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Recompensa estornada' }),
    ).toBeVisible();
    await expect(summary).toHaveCount(0);
    expect(await receipt(page)).toMatchObject({
      total: state.total,
      gold: 0,
      food: 0,
    });
  });
}

test('movimento reduzido, marcos simultâneos e saída imediata', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await seed(page, 2400, 250);
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  const summary = page.getByRole('region', { name: 'Resumo da recompensa' });
  await expect(
    summary.getByRole('heading', { name: 'Novo nível!', exact: true }),
  ).toBeVisible();
  await expect(
    summary.getByRole('heading', { name: 'Refúgio evoluiu!', exact: true }),
  ).toBeVisible();
  expect(
    await summary
      .locator('.conquest-seal')
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none');
  expect(
    await summary
      .getByRole('progressbar')
      .locator('span')
      .evaluateAll((bars) =>
        bars.map((bar) => getComputedStyle(bar).animationName),
      ),
  ).toEqual(['none', 'none']);
  await summary.getByRole('link', { name: 'Continuar', exact: true }).click();
  await expect(page).toHaveURL('/');
});

test('bônus de projeto participa do progresso e conclusões antigas não fabricam barras', async ({
  page,
}) => {
  await seed(page, 200, 50, true);
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  const summary = page.getByRole('region', { name: 'Resumo da recompensa' });
  await expect(summary).toContainText('Caderno de estudos');
  await expect(
    summary.getByRole('heading', { name: 'Novo nível!', exact: true }),
  ).toBeVisible();
  expect((await receipt(page)).events).toBe(2);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('activityEvents', 'readwrite');
          const cursor = tx.objectStore('activityEvents').openCursor();
          cursor.onsuccess = () => {
            if (cursor.result) {
              const value = cursor.result.value;
              delete value.progress;
              cursor.result.update(value);
              cursor.result.continue();
            }
          };
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
        };
      }),
  );
  await page.reload();
  await expect(summary.getByRole('progressbar')).toHaveCount(0);
  await expect(summary).toContainText('Esta conclusão antiga');
});
