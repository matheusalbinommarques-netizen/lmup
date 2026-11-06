import { test, expect } from '@playwright/test';
import { campData, campReady, campSeed } from '../e2e/camp-flow';

test('endereços antigos do Refúgio, Santuário e Bestiário abrem o Acampamento offline sem alterar dados', async ({
  page,
  context,
  request,
}) => {
  await request.post('/__network', { data: 'online' });
  await request.post('/__release', { data: 'a' });
  await page.goto('/acampamento');
  await campSeed(page, { gold: 321, food: 12, totalXpEarned: 500 });
  await campReady(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  const before = await campData(page);
  await request.post('/__network', { data: 'offline' });
  await context.setOffline(true);
  for (const old of [
    '/refugio',
    '/refugio/acampamento',
    '/santuario',
    '/bestiario',
  ]) {
    await page.goto(old);
    await expect(page).toHaveURL(/\/acampamento$/);
    await campReady(page);
  }
  const after = await campData(page);
  expect(after.profile).toEqual(before.profile);
  expect(after.audit).toEqual(before.audit);
  expect(after.pets).toEqual(before.pets);
  expect(after.profile.gold).toBe(321);
});
