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

test('região texturizada usa atlas reutilizados e não intercepta a seleção', async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/laboratorio/acampamento');
  const terrain = page.locator('[data-region="forge-clearing"]');
  await expect(terrain).toHaveCount(1);
  await expect(terrain.locator('[data-material="grass"]')).not.toHaveCount(0);
  await expect(terrain.locator('[data-material="dirt"]')).not.toHaveCount(0);
  expect(
    await terrain.evaluate((node) => getComputedStyle(node).pointerEvents),
  ).toBe('none');
  const trees = page.locator('.region-decoration');
  await expect(trees).toHaveCount(3);
  await expect
    .poll(() =>
      trees.evaluateAll((nodes) =>
        nodes.every(
          (node) =>
            (node as HTMLImageElement).complete &&
            (node as HTMLImageElement).naturalWidth === 384,
        ),
      ),
    )
    .toBe(true);
  const depths = await trees.evaluateAll((nodes) =>
    nodes.map((node) => Number(getComputedStyle(node).zIndex)),
  );
  expect(depths.some((y) => y < 700)).toBe(true);
  expect(depths.some((y) => y > 760)).toBe(true);
  for (const name of ['Forja', 'Forja 2']) {
    const shortcut = page.getByRole('button', { name, exact: true });
    const footprint = page.getByRole('button', {
      name: `Selecionar ${name}`,
      exact: true,
    });
    if (info.project.name === 'mobile') {
      await shortcut.tap();
      await footprint.tap();
    } else {
      await shortcut.click();
      await footprint.click();
    }
    await expect(footprint).toHaveAttribute('aria-pressed', 'true');
  }
  const resources = await page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .filter((resource) => resource.name.includes('/art/lab/camp/region/'))
      .map((resource) => resource.name),
  );
  expect(new Set(resources).size).toBe(4);
  expect(resources.length).toBe(4);
  expect(errors).toEqual([]);
});

for (const width of [undefined, 320]) {
  test(`construção: confirmar, selecionar, colidir, cancelar e explorar (${width ?? 'padrão'})`, async ({
    page,
    context,
  }, info) => {
    if (width) await page.setViewportSize({ width, height: 740 });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    await context.addInitScript(() => {
      Object.defineProperty(window, '__labDatabaseCalls', { value: [] });
      IDBFactory.prototype.open = function (name: string): IDBOpenDBRequest {
        (
          window as unknown as { __labDatabaseCalls: string[] }
        ).__labDatabaseCalls.push(name);
        throw new Error('Laboratório não deve abrir IndexedDB');
      };
    });
    const response = await page.goto('/laboratorio/acampamento');
    expect(response?.status()).toBe(200);
    const mobile = info.project.name === 'mobile';
    const activate = async (locator: ReturnType<typeof page.getByRole>) =>
      mobile ? locator.tap() : locator.click();
    const viewport = page.getByRole('region', {
      name: 'Terreno do acampamento, arrastável',
      exact: true,
    });
    const preview = page.locator('.placement-preview');
    const sprites = page.locator('.scene-sprite');
    const build = page.getByRole('button', {
      name: '+ Construir forja',
      exact: true,
    });
    const confirm = page.getByRole('button', {
      name: 'Confirmar posição',
      exact: true,
    });
    const cancel = page.getByRole('button', { name: 'Cancelar', exact: true });
    const point = async (x: number, y: number) =>
      page.locator('.world').evaluate(
        (node, p) => {
          const m = new DOMMatrix(getComputedStyle(node).transform);
          const bounds = node.parentElement!.getBoundingClientRect();
          return {
            x: bounds.left + m.e + p.x * m.a,
            y: bounds.top + m.f + p.y * m.a,
          };
        },
        { x, y },
      );
    const place = async (x: number, y: number) => {
      const p = await point(x, y);
      if (mobile) await page.touchscreen.tap(p.x, p.y);
      else await page.mouse.click(p.x, p.y);
    };
    await expect(build).toBeVisible();
    await activate(build);
    await expect(preview.locator('img')).toBeVisible();
    await expect(confirm).toBeEnabled();
    // Cancellation of a real active pointer must not reposition the ghost.
    const beforeCancel = await preview.getAttribute('style');
    const bounds = (await viewport.boundingBox())!;
    const cancelPoint = { x: bounds.x + 20, y: bounds.y + 210 };
    if (mobile) {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [cancelPoint],
      });
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchCancel',
        touchPoints: [],
      });
    } else {
      await page.mouse.move(cancelPoint.x, cancelPoint.y);
      await page.mouse.down();
      await viewport.dispatchEvent('pointercancel', {
        pointerId: 1,
        ...cancelPoint,
      });
      await page.mouse.up();
    }
    await expect(preview).toHaveAttribute('style', beforeCancel!);
    // A real drag changes the camera, without changing the proposal or creating a building.
    const beforeCamera = await page.locator('.world').getAttribute('style');
    const start = { x: bounds.x + 20, y: bounds.y + 210 };
    if (mobile) {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Input.synthesizeScrollGesture', {
        ...start,
        xDistance: -70,
        yDistance: -25,
        gestureSourceType: 'touch',
        speed: 600,
      });
    } else {
      await page.mouse.move(start.x, start.y);
      await page.mouse.down();
      await page.mouse.move(start.x + 70, start.y + 25, { steps: 8 });
      await page.mouse.up();
    }
    await expect(page.locator('.world')).not.toHaveAttribute(
      'style',
      beforeCamera!,
    );
    await expect(preview).toHaveAttribute('style', beforeCancel!);
    await expect(sprites).toHaveCount(2);
    await activate(cancel);
    await activate(build);
    await viewport.focus();
    for (let i = 0; i < 20; i++) await page.keyboard.press('ArrowUp');
    await place(1170, 672);
    await expect(confirm).toBeDisabled();
    await expect(page.getByRole('status')).toContainText('sobrepõe');
    await viewport.focus();
    for (let i = 0; i < 22; i++) await page.keyboard.press('ArrowLeft');
    for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowUp');
    await place(830, 600);
    await expect(confirm).toBeDisabled();
    await expect(page.getByRole('status')).toContainText('sobrepõe');
    await activate(cancel);
    await activate(build);
    await place(1008, 976);
    await expect(preview).toHaveCSS('left', '1008px');
    await expect(preview).toHaveCSS('top', '976px');
    await expect(confirm).toBeEnabled();
    if (process.env.LMU_CAMP_CAPTURES)
      await page.screenshot({
        path: `${process.env.LMU_CAMP_CAPTURES}/${info.project.name}-${width ?? 'padrao'}-previa.png`,
        fullPage: true,
      });
    const previewImage = await preview.locator('img').boundingBox();
    await activate(confirm);
    const created = page.locator('[data-instance-id="forge-user-3"]');
    await expect(created).toHaveCSS('left', '1008px');
    await expect(created).toHaveCSS('top', '976px');
    const builtImage = (await created.locator('img').boundingBox())!;
    expect(builtImage.x).toBeCloseTo(previewImage!.x, 1);
    expect(builtImage.y).toBeCloseTo(previewImage!.y, 1);
    await expect(sprites).toHaveCount(3);
    await expect(
      page.getByRole('heading', { name: 'Forja 3', exact: true }),
    ).toBeVisible();
    await activate(build);
    // Click/touch an existing building footprint: it must reject placement, not select it.
    await place(1008, 944);
    await expect(preview).toHaveClass(/invalid/);
    await expect(confirm).toBeDisabled();
    await expect(page.getByRole('status')).toContainText('sobrepõe');
    await place(1200, 1008);
    await expect(confirm).toBeEnabled();
    await activate(confirm);
    await expect(sprites).toHaveCount(4);
    for (const name of ['Forja', 'Forja 2', 'Forja 3', 'Forja 4']) {
      await activate(page.getByRole('button', { name, exact: true }));
      await activate(
        page.getByRole('button', { name: `Selecionar ${name}`, exact: true }),
      );
      await expect(sprites.locator('[aria-pressed="true"]')).toHaveCount(1);
      await expect(
        page.getByRole('heading', { name, exact: true }),
      ).toBeVisible();
    }
    if (process.env.LMU_CAMP_CAPTURES)
      await page.screenshot({
        path: `${process.env.LMU_CAMP_CAPTURES}/${info.project.name}-${width ?? 'padrao'}-construidas.png`,
        fullPage: true,
      });
    await activate(build);
    await viewport.focus();
    for (let i = 0; i < 27; i++) await page.keyboard.press('ArrowDown');
    await expect(confirm).toBeDisabled();
    await expect(page.getByRole('status')).toContainText('dentro do mapa');
    await page.keyboard.press('Enter');
    await expect(sprites).toHaveCount(4);
    await page.keyboard.press('Escape');
    await expect(preview).toHaveCount(0);
    await expect(sprites).toHaveCount(4);
    const worldBeforeZoom = await page.locator('.world').getAttribute('style');
    await activate(
      page.getByRole('button', { name: 'Aproximar', exact: true }),
    );
    await expect(page.locator('.world')).not.toHaveAttribute(
      'style',
      worldBeforeZoom!,
    );
    await activate(
      page.getByRole('button', { name: 'Centralizar mapa', exact: true }),
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      await page.evaluate(
        () =>
          (window as unknown as { __labDatabaseCalls: string[] })
            .__labDatabaseCalls,
      ),
    ).toEqual([]);
    expect(errors).toEqual([]);
  });
}
