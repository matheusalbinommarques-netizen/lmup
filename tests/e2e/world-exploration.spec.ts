import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import {
  worldData,
  interact,
  investigate,
  resolveInvestigation,
} from './world-flow';
test('Mundo entrega investigação completa, retomada, consequência e campanha sem mudar economia', async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/mundo');
  await expect(
    page.getByRole('heading', { name: 'Mundo', level: 1, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Entrar no assentamento', exact: true }),
  ).toBeEnabled();
  const before = await worldData(page);
  if (process.env.LMU_WORLD_CAPTURES) {
    await mkdir(process.env.LMU_WORLD_CAPTURES, { recursive: true });
    await page.screenshot({
      path: join(
        process.env.LMU_WORLD_CAPTURES,
        info.project.name + '-mapa.png',
      ),
      fullPage: true,
    });
  }
  await investigate(page);
  await page
    .getByRole('button', { name: 'Voltar ao mapa', exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Entrar no assentamento', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Continuar exploração', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Arredores do Oásis', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('✓ Pista registrada no diário', { exact: true }),
  ).toBeVisible();
  await resolveInvestigation(page);
  const after = await worldData(page);
  const { world, ...profile } = after.profile;
  const { world: old, ...oldProfile } = before.profile;
  expect(profile).toEqual(oldProfile);
  expect(after.events).toEqual(before.events);
  expect(world.resolution).toBe('route');
  expect(old.quest).toBe('new');
  await interact(page, 'Mesa de provisões');
  await expect(
    page.getByText('O registro da rota segura está sobre a mesa', {
      exact: false,
    }),
  ).toBeVisible();
  if (process.env.LMU_WORLD_CAPTURES)
    await page.screenshot({
      path: join(
        process.env.LMU_WORLD_CAPTURES,
        info.project.name + '-consequencia.png',
      ),
      fullPage: true,
    });
  await page
    .getByRole('button', { name: 'Voltar ao mapa', exact: true })
    .click();
  await page
    .getByRole('link', { name: 'Campanha e objetivos →', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Aventura nos Ermos', level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByText('Investigação concluída', { exact: true }),
  ).toBeVisible();
  const saved = await worldData(page);
  await page.reload();
  expect((await worldData(page)).profile.world).toEqual(saved.profile.world);
  await page
    .getByRole('link', { name: 'Piloto experimental de Védria →', exact: true })
    .click();
  await expect(page.locator('.rpg-chapter-state')).toBeVisible();
  expect((await worldData(page)).profile.world).toEqual(saved.profile.world);
  await page.goto('/progresso');
  await expect(
    page.getByRole('heading', { name: 'Meu progresso', level: 1, exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test('mapa e atlas funcionam com teclado, zoom e largura estreita', async ({
  page,
  isMobile,
}) => {
  await page.goto('/mundo');
  const zoom = page.getByRole('button', {
    name: 'Aproximar mapa',
    exact: true,
  });
  await zoom.press('Enter');
  await expect(page.locator('.map-art')).toHaveAttribute(
    'style',
    /scale\(1.2\)/,
  );
  await page.getByRole('button', { name: 'Enquadrar', exact: true }).click();
  await page
    .getByRole('navigation', {
      name: 'Selecionar localidade sem usar a pintura',
    })
    .getByRole('button', { name: 'Desfiladeiro do Norte', exact: true })
    .press('Enter');
  await expect(
    page.getByRole('heading', { name: 'Desfiladeiro do Norte', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Atlas', exact: true }).click();
  await expect(page.locator('.founder-grid article')).toHaveCount(4);
  for (const image of await page.locator('.founder-grid img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() => image.evaluate((el) => (el as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
  }
  if (isMobile) await page.setViewportSize({ width: 320, height: 740 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await page.goto('/aposentos');
  await expect(
    page.getByRole('heading', { name: 'Aposentos', level: 1, exact: true }),
  ).toBeVisible();
  await page.goto('/refugio');
  await expect(
    page.getByRole('heading', { name: 'Refúgio', level: 1, exact: true }),
  ).toBeVisible();
});
