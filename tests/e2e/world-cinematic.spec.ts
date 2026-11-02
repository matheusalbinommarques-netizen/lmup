import { test, expect } from '@playwright/test';
import { worldData, interact } from './world-flow';
const oasis = (page: import('@playwright/test').Page) =>
  page.getByRole('dialog', { name: 'Exploração do Oásis', exact: true });
async function enter(page: import('@playwright/test').Page) {
  await page.goto('/mundo');
  await page
    .getByRole('button', { name: 'Entrar no assentamento', exact: true })
    .click();
  await expect(oasis(page)).toBeVisible();
}
test('Oásis imersivo preserva escolhas, interação por teclado e retorno ao contexto', async ({
  page,
  isMobile,
}) => {
  await enter(page);
  const stage = oasis(page);
  await expect(stage.locator('.scene-point')).toHaveCount(4);
  await expect(stage.locator('.point-label').first()).toBeHidden();
  await expect(stage.locator('.scene-point').first()).not.toHaveText(/^1/);
  await stage
    .getByRole('button', { name: 'Revelar pontos', exact: false })
    .click();
  await expect(stage.locator('.point-label').first()).toBeVisible();
  const lucan = stage.getByRole('button', {
    name: 'Conversar com Lucan',
    exact: true,
  });
  if (isMobile) await lucan.tap();
  else await lucan.click();
  await expect(
    stage.getByRole('heading', { name: 'Lucan Dorian', exact: true }),
  ).toBeVisible();
  await stage
    .getByRole('button', { name: 'Voltar à exploração', exact: false })
    .click();
  await lucan.focus();
  await lucan.press('ArrowRight');
  await expect(
    stage.getByRole('button', { name: 'Quadro de avisos', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('e');
  await expect(
    stage.getByRole('heading', { name: 'Quadro de avisos', exact: true }),
  ).toBeVisible();
  await stage
    .getByRole('button', { name: 'Fechar inspeção', exact: true })
    .click();
  await interact(page, 'Conversar com Lucan');
  const portrait = stage.locator('.character-portrait img');
  await expect(portrait).toHaveAttribute('src', '/art/world/lucan-dorian.webp');
  await expect(
    stage.getByRole('heading', { name: 'Lucan Dorian', exact: true }),
  ).toBeFocused();
  await stage
    .getByRole('button', {
      name: 'O que sabemos sobre a entrega?',
      exact: true,
    })
    .click();
  expect((await worldData(page)).profile.world.dialogue).toBe('briefing');
  await stage
    .getByRole('button', {
      name: 'Vou procurar sinais verificáveis.',
      exact: true,
    })
    .click();
  expect((await worldData(page)).profile.world.quest).toBe('active');
  await stage
    .getByRole('button', { name: 'Voltar à exploração', exact: false })
    .click();
  await expect(stage.locator('.cinematic-conversation')).toHaveCount(0);
  await expect(lucan).toBeFocused();
  await stage
    .getByRole('button', { name: 'Voltar ao mapa', exact: true })
    .click();
  await expect(stage).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Continuar exploração', exact: true }),
  ).toBeFocused();
  await page
    .getByRole('link', { name: 'Meu progresso →', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Meu progresso', level: 1 }),
  ).toBeVisible();
});
test('diário é somente consulta e retomada restaura diálogo sem duplicar estado', async ({
  page,
}) => {
  await enter(page);
  await interact(page, 'Conversar com Lucan');
  const stage = oasis(page);
  await stage
    .getByRole('button', {
      name: 'O que sabemos sobre a entrega?',
      exact: true,
    })
    .click();
  const before = await worldData(page);
  await stage.getByRole('button', { name: 'Diário', exact: false }).click();
  await expect(
    stage.getByRole('heading', { name: 'Diário da campanha', exact: true }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  expect((await worldData(page)).profile.world).toEqual(before.profile.world);
  await stage
    .getByRole('button', { name: 'Voltar ao mapa', exact: true })
    .click();
  await page.reload();
  await expect(oasis(page)).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Continuar exploração', exact: true })
    .click();
  await expect(
    stage.getByRole('button', {
      name: 'Vou procurar sinais verificáveis.',
      exact: true,
    }),
  ).toBeVisible();
  expect((await worldData(page)).profile.world).toEqual(before.profile.world);
  await stage.getByRole('button', { name: 'Áudio', exact: true }).click();
  await expect(
    stage.getByText('A aventura também pode ser jogada sem som.', {
      exact: true,
    }),
  ).toBeVisible();
  await stage
    .getByRole('button', { name: 'Fechar painel', exact: true })
    .click();
  await page.keyboard.press('Escape');
  await expect(stage.locator('.cinematic-conversation')).toHaveCount(0);
  expect((await worldData(page)).profile.world.quest).toBe('new');
  await page.keyboard.press('Escape');
  await expect(stage).toHaveCount(0);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
    'hidden',
  );
});
test('cena responsiva mantém pontos acessíveis, movimento reduzido e saída para o aplicativo', async ({
  page,
  isMobile,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  if (isMobile) await page.setViewportSize({ width: 320, height: 740 });
  await enter(page);
  const stage = oasis(page);
  expect(await stage.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(
    false,
  );
  expect(
    await stage
      .locator('.scene-painting')
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none');
  if (isMobile) {
    const panorama = stage.locator('.scene-canvas');
    expect(
      await panorama.evaluate((el) => el.scrollWidth > el.clientWidth),
    ).toBe(true);
    const cdp = await page.context().newCDPSession(page);
    const box = (await panorama.boundingBox())!;
    const y = box.y + box.height * 0.35;
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: 260, y }],
    });
    for (const x of [210, 155, 95])
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x, y }],
      });
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    });
    await expect
      .poll(() => panorama.evaluate((el) => el.scrollLeft))
      .toBeGreaterThan(0);
    await cdp.detach();
    await stage
      .getByRole('button', { name: 'Ver cena inteira', exact: true })
      .click();
    expect(
      await panorama.evaluate((el) => el.scrollWidth > el.clientWidth),
    ).toBe(false);
  }
  await interact(page, 'Mesa de provisões');
  await expect(
    stage.getByRole('heading', { name: 'Mesa de provisões', exact: true }),
  ).toBeVisible();
  await stage
    .getByRole('button', { name: 'Fechar inspeção', exact: true })
    .click();
  if (isMobile) await page.setViewportSize({ width: 844, height: 390 });
  await stage
    .getByRole('link', { name: 'Sair da exploração', exact: false })
    .click();
  await expect(page).toHaveURL(/\/$/);
  await expect(stage).toHaveCount(0);
});
