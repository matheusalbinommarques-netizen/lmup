import { test, expect, type Page } from '@playwright/test';

async function seed(page: Page) {
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
          const now = new Date();
          const day = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          for (let i = 0; i < 20; i++)
            tx.objectStore('tasks').put({
              id: 500 + i,
              source: 'personal',
              title: `Organizar etapa ${i + 1}`,
              xp: 50,
              rarity: 'common',
              completed: false,
              status: 'available',
              plannedDate: day,
              createdAt: now.toISOString(),
              productivityVersion: 1,
              tracking: { method: 'direct' },
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
  await expect(page.locator('.next-mission')).toContainText('Organizar etapa');
}

test('banner de Hoje reaproveita a pintura e mantém a próxima ação na primeira dobra', async ({
  page,
}) => {
  await seed(page);
  const hero = page.locator('.today-hero');
  await expect(hero).toHaveClass(/journey-heading/);
  await expect(hero.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(hero.locator(':scope > img')).toHaveAttribute(
    'src',
    '/art/approved/paintings/01_Hoje_Vedria_panorama.webp',
  );
  await expect
    .poll(() =>
      hero
        .locator(':scope > img')
        .evaluate((img) => (img as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  const box = (await hero.boundingBox())!;
  expect(box.height).toBeLessThanOrEqual(210);
  const next = (await page
    .getByRole('button', { name: 'Começar missão', exact: true })
    .boundingBox())!;
  expect(next.y + next.height).toBeLessThan(page.viewportSize()!.height - 62);
  await expect(
    page.getByRole('region', { name: 'Concluídas hoje', exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});

test('sidebar permanece acessível ao rolar Hoje e Missões, com rolagem própria em janela baixa', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'A navegação lateral é exclusiva do desktop.');
  await page.setViewportSize({ width: 1280, height: 800 });
  await seed(page);
  const side = page.getByRole('complementary', {
    name: 'Navegação lateral',
    exact: true,
  });
  for (const route of ['/', '/missoes']) {
    await page.goto(route);
    if (route === '/')
      await expect(page.locator('.next-mission')).toContainText(
        'Organizar etapa',
      );
    else await expect(page.locator('.mission-row')).toHaveCount(20);
    await expect(
      side.getByRole('link', { name: 'Missões', exact: true }),
    ).toBeVisible();
    await expect
      .poll(() => side.evaluate((el) => getComputedStyle(el).position))
      .toBe('sticky');
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight),
    );
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
    await expect
      .poll(() =>
        side.evaluate((el) => Math.abs(el.getBoundingClientRect().top)),
      )
      .toBeLessThanOrEqual(1);
    await expect(
      side.getByRole('button', { name: 'Perfil e mais', exact: true }),
    ).toBeInViewport();
  }
  await page.setViewportSize({ width: 1280, height: 400 });
  await page.goto('/');
  await expect(side).toBeVisible();
  expect(await side.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(
    true,
  );
  await side.getByRole('link', { name: 'Hoje', exact: true }).focus();
  const links = await side.getByRole('navigation').getByRole('link').count();
  for (let i = 0; i < links; i++) await page.keyboard.press('Tab');
  const more = side.getByRole('button', { name: 'Perfil e mais', exact: true });
  await expect(more).toBeFocused();
  await expect(more).toBeInViewport();
  expect(await side.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('dialog', { name: 'Seu espaço', exact: true }),
  ).toBeVisible();
});

test('banner aceita texto ampliado e mobile conserva Hoje, Missões, Mundo e Mais', async ({
  page,
  isMobile,
}) => {
  await seed(page);
  await page.evaluate(() => (document.documentElement.style.fontSize = '32px'));
  const hero = page.locator('.today-hero');
  const heading = hero.getByRole('heading', { level: 1 });
  const box = (await hero.boundingBox())!,
    text = (await heading.boundingBox())!;
  expect(text.y + text.height).toBeLessThanOrEqual(box.y + box.height);
  expect(
    await hero.evaluate(
      (el) =>
        el.scrollWidth <= el.clientWidth + 1 &&
        el.scrollHeight <= el.clientHeight + 1,
    ),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  if (isMobile) {
    await expect(page.locator('.journey-sidebar')).not.toBeVisible();
    const nav = page.getByRole('navigation', {
      name: 'Navegação móvel',
      exact: true,
    });
    for (const name of ['Hoje', 'Missões', 'Mundo'])
      await expect(
        nav.getByRole('link', { name, exact: true }),
      ).toBeInViewport();
    await nav.getByRole('button', { name: 'Mais', exact: true }).click();
    await expect(
      page.getByRole('dialog', { name: 'Seu espaço', exact: true }),
    ).toBeVisible();
  }
});
