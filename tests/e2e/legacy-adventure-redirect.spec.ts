import { expect, test, type Page } from '@playwright/test';
import { worldData } from './world-flow';

// Real user records may still carry this retired, non-canonical pilot state.
// Redirects may initialize the current World, but may never erase or migrate it.
const historicalPilot = {
  scene: 6,
  choice: 'help',
  chapterOneEndXp: 150,
  chapterTwoUnlocked: true,
  chapterTwoScene: 1,
};

async function seedHistoricalPilot(page: Page) {
  await page.goto('/');
  await expect(
    page.getByRole('region', { name: 'Seu personagem', exact: true }),
  ).toBeVisible();
  await page.evaluate(
    (pilot) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('profile', 'readwrite');
          const profile = tx.objectStore('profile');
          const old = profile.get(1);
          old.onsuccess = () =>
            profile.put({ ...old.result, rpgPilot: pilot });
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
    historicalPilot,
  );
}

for (const route of [
  { old: '/aventura', current: '/mundo', heading: 'Mundo' },
  {
    old: '/aventura?campanha=ermos',
    current: '/mundo/campanha',
    heading: 'Aventura nos Ermos',
  },
]) {
  test(`URL antiga ${route.old} abre o Mundo e preserva o histórico do piloto`, async ({
    page,
  }) => {
    await seedHistoricalPilot(page);
    const before = await worldData(page);
    expect(before.profile.rpgPilot).toEqual(historicalPilot);
    await page.goto(route.old);
    await expect(page).toHaveURL(new RegExp(route.current + '$'));
    await expect(
      page.getByRole('heading', { name: route.heading, exact: true }),
    ).toBeVisible();
    const after = await worldData(page);
    expect(after.profile.rpgPilot).toEqual(before.profile.rpgPilot);
    expect(after.profile.totalXpEarned).toBe(before.profile.totalXpEarned);
    expect(after.profile.gold).toBe(before.profile.gold);
    expect(after.profile.food).toBe(before.profile.food);
    expect(after.events).toEqual(before.events);
  });
}

test('a campanha atual mantém objetivos, diário e apresentação integrada', async ({
  page,
}) => {
  await page.goto('/mundo/campanha');
  await expect(
    page.getByRole('heading', { name: 'Aventura nos Ermos', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Diário da campanha', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Investigação atual', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Abrir Mundo' })).toHaveAttribute(
    'href',
    '/mundo',
  );
  await expect(page.locator('.journey-sidebar')).toBeHidden();
  await expect(page.locator('.journey-mobile-header')).toBeHidden();
  await expect(page.locator('.journey-bottom-nav')).toBeHidden();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});
