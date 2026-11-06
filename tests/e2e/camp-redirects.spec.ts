import { test, expect } from '@playwright/test';
import { campData, campSeed, openMilestones } from './camp-flow';

test('links antigos não alteram dados existentes, com acampamento construído e saldos', async ({
  page,
}) => {
  await page.goto('/acampamento');
  await expect(page.getByTestId('layered-scene')).toBeVisible();
  await campSeed(page, { gold: 777, food: 55, totalXpEarned: 2600 });
  await openMilestones(page);
  const before = await campData(page);
  for (const old of [
    '/refugio',
    '/refugio/acampamento',
    '/santuario',
    '/bestiario',
  ]) {
    await page.goto(old);
    await expect(page).toHaveURL(/\/acampamento$/);
    await expect(page.getByTestId('layered-scene')).toBeVisible();
  }
  const after = await campData(page);
  expect(after.profile).toEqual(before.profile);
  expect(after.audit).toEqual(before.audit);
  expect(after.pets).toEqual(before.pets);
  expect(after.profile.gold).toBe(777);
  expect(after.profile.food).toBe(55);
});
