import { expect, test } from '@playwright/test';

test('arraste não seleciona no soltar e o próximo clique ou toque seleciona a construção', async ({
  page,
  context,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/laboratorio/acampamento');
  await expect(
    page.getByRole('heading', { name: 'Acampamento navegável', exact: true }),
  ).toBeVisible();
  const viewport = page.getByRole('region', {
    name: 'Terreno do acampamento, arrastável',
    exact: true,
  });
  const world = page.locator('.world');
  const before = await world.getAttribute('style');
  const bounds = (await viewport.boundingBox())!;
  const hall = page.getByRole('button', {
    name: 'Selecionar Salão do acampamento',
    exact: true,
  });
  const hallBounds = (await hall.boundingBox())!;
  const start = { x: bounds.x + 25, y: bounds.y + 200 };
  const end = {
    x: hallBounds.x + hallBounds.width / 2,
    y: hallBounds.y + hallBounds.height / 2,
  };
  if (info.project.name === 'mobile') {
    const touch = await context.newCDPSession(page);
    await touch.send('Input.synthesizeScrollGesture', {
      x: start.x,
      y: start.y,
      xDistance: start.x - end.x,
      yDistance: start.y - end.y,
      gestureSourceType: 'touch',
      speed: 600,
    });
  } else {
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(end.x, end.y, { steps: 8 });
    await page.mouse.up();
  }
  await expect(world).not.toHaveAttribute('style', before!);
  await expect(page.locator('.building[aria-pressed="true"]')).toHaveCount(0);
  const reset = page.getByRole('button', {
    name: 'Centralizar mapa',
    exact: true,
  });
  if (info.project.name === 'mobile') await reset.tap();
  else await reset.click();
  if (info.project.name === 'mobile') await hall.tap();
  else await hall.click();
  await expect(hall).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.getByRole('heading', { name: 'Salão do acampamento', exact: true }),
  ).toBeVisible();
  const forge = page.getByRole('button', {
    name: 'Selecionar Forja',
    exact: true,
  });
  await forge.focus();
  await page.keyboard.press('Enter');
  await expect(forge).toHaveAttribute('aria-pressed', 'true');
  await expect(hall).toHaveAttribute('aria-pressed', 'false');
  await expect(
    page.getByRole('heading', { name: 'Forja', exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test('duas forjas compartilham o sprite e preservam seleção, profundidade e zoom', async ({
  page,
}, info) => {
  await page.goto('/laboratorio/acampamento');
  const sprites = page.locator('.scene-sprite');
  await expect(sprites).toHaveCount(2);
  await expect
    .poll(() =>
      sprites
        .locator('img')
        .evaluateAll((images) =>
          images.every(
            (image) =>
              (image as HTMLImageElement).complete &&
              (image as HTMLImageElement).naturalWidth === 305,
          ),
        ),
    )
    .toBe(true);
  const sources = await sprites
    .locator('img')
    .evaluateAll((images) =>
      images.map((image) => (image as HTMLImageElement).src),
    );
  expect(new Set(sources).size).toBe(1);
  for (const name of ['Forja', 'Forja 2', 'Forja']) {
    const shortcut = page.getByRole('button', { name, exact: true });
    if (info.project.name === 'mobile') await shortcut.tap();
    else await shortcut.click();
    const footprint = page.getByRole('button', {
      name: `Selecionar ${name}`,
      exact: true,
    });
    if (info.project.name === 'mobile') await footprint.tap();
    else await footprint.click();
    await expect(footprint).toHaveAttribute('aria-pressed', 'true');
    await expect(
      page.getByRole('heading', { name, exact: true }),
    ).toBeVisible();
    await expect(sprites.locator('[aria-pressed="true"]')).toHaveCount(1);
  }
  const geometry = await sprites.evaluateAll((nodes) =>
    nodes.map((node) => {
      const image = node.querySelector('img')!.getBoundingClientRect();
      return {
        depth: Number(getComputedStyle(node).zIndex),
        left: image.left,
        right: image.right,
        top: image.top,
        bottom: image.bottom,
      };
    }),
  );
  expect(geometry[1].depth).toBeGreaterThan(geometry[0].depth);
  expect(Math.min(geometry[0].right, geometry[1].right)).toBeGreaterThan(
    Math.max(geometry[0].left, geometry[1].left),
  );
  expect(Math.min(geometry[0].bottom, geometry[1].bottom)).toBeGreaterThan(
    Math.max(geometry[0].top, geometry[1].top),
  );
  for (let i = 0; i < 8; i++) {
    const zoom = page.getByRole('button', { name: 'Aproximar', exact: true });
    if (info.project.name === 'mobile') await zoom.tap();
    else await zoom.click();
  }
  await expect
    .poll(() =>
      sprites
        .locator('img')
        .evaluateAll((images) =>
          images.every(
            (image) => Math.abs(image.getBoundingClientRect().width - 300) < 1,
          ),
        ),
    )
    .toBe(true);
  expect(
    await page.evaluate(
      () =>
        performance
          .getEntriesByType('resource')
          .filter((resource) => resource.name.endsWith('/forge-feudalwars.png'))
          .length,
    ),
  ).toBe(1);
});
