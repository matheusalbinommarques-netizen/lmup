import { test, expect, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const day = '2026-11-03';
async function seed(page: Page) {
  await page.clock.install({ time: new Date(`${day}T15:00:00-03:00`) });
  await page.goto('/');
  await expect(page.locator('.today-hero')).toBeVisible();
  await page.evaluate(async (day) => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('LevelMeUpDB');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = database.transaction(
          ['profile', 'tasks', 'routines'],
          'readwrite',
        );
        const profiles = tx.objectStore('profile');
        const profile = profiles.get(1);
        profile.onsuccess = () =>
          profiles.put({ ...profile.result, name: 'Viajante de teste' });
        tx.objectStore('tasks').put({
          id: 501,
          title: 'Caminhar pelo jardim',
          xp: 50,
          effort: 'small',
          status: 'todo',
          completed: false,
          areaId: 0,
          productivityVersion: 1,
          plannedDate: day,
          plannedTime: '08:00',
          routineId: 'rotina-teste',
          recurrence: { kind: 'daily', startDate: day },
          tracking: { method: 'direct' },
          createdAt: `${day}T12:00:00Z`,
        });
        tx.objectStore('routines').put({
          id: 'rotina-teste',
          name: 'Rotina de teste',
          description: '',
          days: [0, 1, 2, 3, 4, 5, 6],
          startDate: day,
          status: 'active',
          entries: [{ taskId: 501, time: '08:00', previousPlan: {} }],
          pauseQuota: 2,
          pausePeriodDays: 30,
          revision: 1,
          createdAt: `${day}T12:00:00Z`,
        });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
    } finally {
      database.close();
    }
  }, day);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Boa tarde, Viajante de teste.' }),
  ).toBeVisible();
}

async function capture(page: Page, name: string) {
  const dir = process.env.LMU_LOTE1_CAPTURE_DIR;
  if (!dir) return;
  await mkdir(dir, { recursive: true });
  await page.screenshot({ path: join(dir, name + '.png'), fullPage: true });
}

test('Hoje preserva identidade e composição vertical nas larguras suportadas', async ({
  page,
}, info) => {
  await seed(page);
  await expect(
    page.getByText(
      'Suas missões te aguardam, e seu futuro depende apenas de você!',
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByText('Seu plano de hoje, em um só lugar.', { exact: true }),
  ).toHaveCount(0);
  await expect(page.locator('.hero-copy .lmu-eyebrow')).toHaveCount(0);
  const start = page.getByRole('button', {
    name: 'Começar missão',
    exact: true,
  });
  await expect(start).toBeVisible();
  await expect(start.locator('img')).toHaveCount(0);
  await expect(
    page.locator('.next-mission > .approved-icon img'),
  ).toBeVisible();
  const sizes =
    info.project.name === 'desktop' ? [1366, 1440, 1920] : [320, 390];
  for (const width of sizes) {
    await page.setViewportSize({
      width,
      height: info.project.name === 'desktop' ? 900 : 844,
    });
    const geometry = await page.locator('.daily-summary').evaluate((card) => {
      const ring = card.querySelector('.day-ring')!.getBoundingClientRect();
      const caption = card
        .querySelector('.day-progress > span:last-child')!
        .getBoundingClientRect();
      const resources = [...card.querySelectorAll('.daily-rewards > span')].map(
        (el) => el.getBoundingClientRect().toJSON(),
      );
      const rect = card.getBoundingClientRect();
      return {
        ring: ring.toJSON(),
        caption: caption.toJSON(),
        resources,
        rect: rect.toJSON(),
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    expect(
      Math.abs(
        geometry.ring.x +
          geometry.ring.width / 2 -
          geometry.rect.x -
          geometry.rect.width / 2,
      ),
    ).toBeLessThan(2);
    expect(geometry.caption.y).toBeGreaterThanOrEqual(geometry.ring.bottom);
    expect(
      Math.abs(
        geometry.caption.x +
          geometry.caption.width / 2 -
          geometry.rect.x -
          geometry.rect.width / 2,
      ),
    ).toBeLessThan(2);
    expect(geometry.resources[0].y).toBeGreaterThan(geometry.caption.bottom);
    expect(
      Math.max(...geometry.resources.map((r) => r.y)) -
        Math.min(...geometry.resources.map((r) => r.y)),
    ).toBeLessThan(2);
    expect(geometry.overflow).toBe(false);
    await expect(page.locator('.daily-summary')).toContainText(
      '0 de 1 missões',
    );
    await capture(page, `hoje-${width}`);
  }
  await start.click();
  await expect(page).toHaveURL(/\/missao\/501$/);
});

test('Geral persiste seu ícone e campos de área permanecem compactos', async ({
  page,
}, info) => {
  await seed(page);
  await page.goto('/missoes?view=areas');
  await page
    .getByRole('button', { name: 'Editar ícone de Geral', exact: true })
    .click();
  const general = page
    .locator('.area-workspace .area-list > li')
    .filter({ hasText: 'Área padrão' });
  await general.locator('summary').filter({ hasText: 'Ícone da área' }).click();
  await general.getByRole('button', { name: 'Estudo', exact: true }).click();
  await general
    .getByRole('button', { name: 'Salvar ícone', exact: true })
    .click();
  await expect(page.getByRole('status')).toContainText(
    'Ícone de Geral atualizado.',
  );
  await expect(general.locator('strong img')).toHaveAttribute(
    'src',
    '/art/approved/icons/estudo/64.png',
  );
  const icon = await general.locator('strong img').getAttribute('src');
  const name = page
    .locator('.area-workspace')
    .getByLabel('Nome da nova área', { exact: true });
  const description = page.locator('.area-workspace .area-create textarea');
  await description.fill('Uma descrição longa. '.repeat(150));
  const a = await name.boundingBox(),
    b = await description.boundingBox();
  expect(Math.abs(a!.width - b!.width)).toBeLessThan(2);
  expect(b!.height).toBeLessThanOrEqual(80);
  await capture(page, `areas-${info.project.name}`);
  await page.reload();
  await expect(general.locator('strong img')).toHaveAttribute('src', icon!);
  await page.goto('/');
  await expect(
    page.locator('.next-mission > .approved-icon img'),
  ).toHaveAttribute('src', icon!);
});

test('horário de rotina aceita correção pelo teclado e valida HH:mm', async ({
  page,
}, info) => {
  await seed(page);
  await page.goto('/missoes?view=routines');
  await page
    .getByRole('button', { name: 'Editar rotina', exact: true })
    .click();
  const time = page.getByRole('textbox', {
    name: 'Horário de Caminhar pelo jardim',
    exact: true,
  });
  await expect(time).toHaveAttribute('type', 'text');
  await time.fill('19:30');
  await time.press('End');
  await time.press('Backspace');
  await time.press('5');
  await expect(time).toHaveValue('19:35');
  await time.fill('25:90');
  await page
    .getByRole('button', { name: 'Salvar rotina', exact: true })
    .click();
  await expect(page.locator('.routine-form')).toBeVisible();
  await time.fill('19:30');
  await page
    .getByRole('button', { name: 'Salvar rotina', exact: true })
    .click();
  await expect(page.locator('.routine-form')).toHaveCount(0);
  await page.reload();
  await page
    .getByRole('button', { name: 'Editar rotina', exact: true })
    .click();
  await expect(time).toHaveValue('19:30');
  await capture(page, `horario-${info.project.name}`);
});
