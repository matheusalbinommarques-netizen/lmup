import {
  expect,
  test,
  type Page,
  type BrowserContext,
  type TestInfo,
} from '@playwright/test';

async function camp(page: Page, context: BrowserContext, info: TestInfo) {
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
  expect((await page.goto('/laboratorio/acampamento'))?.status()).toBe(200);
  await expect(
    page.getByRole('heading', { name: 'Acampamento navegável', exact: true }),
  ).toBeVisible();
  await expect(page.locator('canvas.terrain-region')).toHaveAttribute(
    'data-ready',
    'true',
  );
  const mobile = info.project.name === 'mobile';
  const activate = async (locator: ReturnType<Page['locator']>) =>
    mobile ? locator.tap() : locator.click();
  const viewport = page.getByRole('region', {
    name: 'Terreno do acampamento, arrastável',
    exact: true,
  });
  const world = page.locator('.world');
  const sprites = page.locator('.scene-sprite');
  const preview = page.locator('.placement-preview');
  const confirm = page.getByRole('button', {
    name: 'Confirmar posição',
    exact: true,
  });
  const cancel = page.getByRole('button', { name: 'Cancelar', exact: true });
  const point = async (x: number, y: number) =>
    world.evaluate(
      (node, p) => {
        const m = new DOMMatrix(getComputedStyle(node).transform),
          bounds = node.parentElement!.getBoundingClientRect();
        return {
          x: bounds.left + m.e + p.x * m.a,
          y: bounds.top + m.f + p.y * m.a,
        };
      },
      { x, y },
    );
  const place = async (x: number, y: number) => {
    const p = await point(x, y);
    expect(
      await page.evaluate(
        (p) => !!document.elementFromPoint(p.x, p.y)?.closest('.viewport'),
        p,
      ),
      'O terreno escolhido deve estar livre dos painéis',
    ).toBe(true);
    if (mobile) await page.touchscreen.tap(p.x, p.y);
    else await page.mouse.click(p.x, p.y);
  };
  const visit = async (name: string) => {
    await activate(page.locator('.landmarks summary'));
    await activate(page.getByRole('button', { name, exact: true }));
  };
  const build = async () => {
    await activate(
      page.getByRole('button', { name: 'Construir', exact: true }),
    );
    await expect(
      page.getByRole('heading', { name: 'Construções', exact: true }),
    ).toBeVisible();
    await activate(
      page.getByRole('button', { name: 'Escolher Forja', exact: true }),
    );
    await expect(preview.locator('img')).toBeVisible();
    const a = (await cancel.boundingBox())!,
      b = (await confirm.boundingBox())!;
    expect(
      Math.abs(a.y - b.y),
      'Confirmar e cancelar na mesma linha',
    ).toBeLessThan(1);
  };
  const drag = async () => {
    const bounds = (await viewport.boundingBox())!,
      start = { x: bounds.x + 20, y: bounds.y + 235 };
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
  };
  const capture = async (name: string) => {
    if (process.env.LMU_CAMP_CAPTURES)
      await page.screenshot({
        path: `${process.env.LMU_CAMP_CAPTURES}/${info.project.name}-${page.viewportSize()!.width}-${name}.png`,
        fullPage: true,
      });
  };
  const clean = async () => {
    expect(errors).toEqual([]);
    expect(
      await page.evaluate(
        () =>
          (window as unknown as { __labDatabaseCalls: string[] })
            .__labDatabaseCalls,
      ),
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  };
  return {
    activate,
    viewport,
    world,
    sprites,
    preview,
    confirm,
    cancel,
    place,
    visit,
    build,
    drag,
    capture,
    clean,
  };
}

test('câmera, seleção direta, reutilização de sprites e zoom continuam funcionando', async ({
  page,
  context,
}, info) => {
  const c = await camp(page, context, info);
  const before = await c.world.getAttribute('style');
  await c.drag();
  await expect(c.world).not.toHaveAttribute('style', before!);
  await expect(c.sprites.locator('[aria-pressed="true"]')).toHaveCount(0);
  await c.activate(
    page.getByRole('button', { name: 'Centralizar mapa', exact: true }),
  );
  const hall = page.getByRole('button', {
    name: 'Selecionar Salão do acampamento',
    exact: true,
  });
  await c.activate(hall);
  await expect(hall).toHaveAttribute('aria-pressed', 'true');
  await c.visit('Forjas');
  for (const name of ['Forja', 'Forja 2', 'Forja']) {
    const target = page.getByRole('button', {
      name: `Selecionar ${name}`,
      exact: true,
    });
    await c.activate(target);
    await expect(target).toHaveAttribute('aria-pressed', 'true');
    await expect(c.sprites.locator('[aria-pressed="true"]')).toHaveCount(1);
  }
  const forge = page.locator('[data-instance-id="forge"]');
  await forge.locator('button').focus();
  await page.keyboard.press('Enter');
  const copies = page.locator('.scene-sprite img[src$="forge-feudalwars.png"]');
  await expect(copies).toHaveCount(2);
  for (let i = 0; i < 8; i++)
    await c.activate(
      page.getByRole('button', { name: 'Aproximar', exact: true }),
    );
  await expect
    .poll(() =>
      copies.first().evaluate((img) => img.getBoundingClientRect().width),
    )
    .toBeCloseTo(300);
  for (let i = 0; i < 10; i++)
    await c.activate(
      page.getByRole('button', { name: 'Afastar', exact: true }),
    );
  expect(
    await c.world.evaluate(
      (el) => new DOMMatrix(getComputedStyle(el).transform).a,
    ),
  ).toBeCloseTo(0.45);
  expect(
    await page.evaluate(
      () =>
        performance
          .getEntriesByType('resource')
          .filter((r) => r.name.endsWith('/forge-feudalwars.png')).length,
    ),
  ).toBe(1);
  await c.clean();
});

test('terreno integral, regiões navegáveis, profundidade e terreno vazio', async ({
  page,
  context,
}, info) => {
  const c = await camp(page, context, info);
  const terrain = page.locator('canvas.terrain-region');
  expect(
    await terrain.evaluate((node) => {
      const canvas = node as HTMLCanvasElement,
        ctx = canvas.getContext('2d')!;
      return [1, 250, 600, 1000, 1500, 1849].every((x) =>
        [1, 300, 700, 1100, 1399].every(
          (y) =>
            ctx.getImageData(Math.floor(x * 1.5), Math.floor(y * 1.5), 1, 1)
              .data[3] === 255,
        ),
      );
    }),
  ).toBe(true);
  await expect(
    page.locator('.tree,.road,.clearing,.lake,.building-art'),
  ).toHaveCount(0);
  await expect(page.locator('.region-decoration')).toHaveCount(24);
  await expect
    .poll(() =>
      page
        .locator('.region-decoration')
        .evaluateAll((nodes) =>
          nodes.every(
            (n) =>
              (n as HTMLImageElement).complete &&
              (n as HTMLImageElement).naturalWidth === 384,
          ),
        ),
    )
    .toBe(true);
  const depths = await page
    .locator('.region-decoration')
    .evaluateAll((nodes) =>
      nodes.map((n) => Number(getComputedStyle(n).zIndex)),
    );
  expect(depths.some((y) => y < 700)).toBe(true);
  expect(depths.some((y) => y > 760)).toBe(true);
  await c.capture('mapa');
  for (const name of ['Praça', 'Lago', 'Clareira sul', 'Forjas']) {
    await c.activate(
      page.getByRole('button', { name: 'Aproximar', exact: true }),
    );
    await c.visit(name);
    await c.capture(
      name === 'Lago'
        ? 'lago'
        : name === 'Clareira sul'
          ? 'clareira'
          : name === 'Forjas'
            ? 'forjas'
            : 'praca',
    );
    await c.activate(
      page.getByRole('button', { name: 'Centralizar mapa', exact: true }),
    );
  }
  await c.visit('Forjas');
  await c.activate(
    page.getByRole('button', {
      name: 'Selecionar Terreno disponível',
      exact: true,
    }),
  );
  await expect(page.locator('.build-info')).toContainText('Terreno vazio');
  await c.activate(
    page.getByRole('button', { name: 'Construir aqui', exact: true }),
  );
  await expect(c.preview).toHaveCSS('left', '1330px');
  await c.activate(c.confirm);
  await expect(
    page.getByRole('button', {
      name: 'Selecionar Terreno disponível',
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(page.locator('[data-instance-id="forge-user-3"]')).toHaveClass(
    /constructing/,
  );
  await c.activate(page.getByRole('button', { name: 'Remover', exact: true }));
  await c.activate(
    page.getByRole('button', { name: 'Confirmar remoção', exact: true }),
  );
  await expect(
    page.getByRole('button', {
      name: 'Selecionar Terreno disponível',
      exact: true,
    }),
  ).toHaveCount(1);
  const resources = await page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .filter((r) => r.name.includes('/art/lab/camp/region/'))
      .map((r) => r.name),
  );
  expect(resources).toHaveLength(6);
  expect(new Set(resources).size).toBe(6);
  await c.clean();
});

for (const width of [undefined, 320])
  test(`construção, conclusão, movimento e remoção (${width ?? 'padrão'})`, async ({
    page,
    context,
  }, info) => {
    if (width) await page.setViewportSize({ width, height: 740 });
    const c = await camp(page, context, info);
    await expect(c.sprites).toHaveCount(4);
    await c.build();
    const proposal = await c.preview.getAttribute('style'),
      camera = await c.world.getAttribute('style');
    await c.drag();
    await expect(c.world).not.toHaveAttribute('style', camera!);
    await expect(c.preview).toHaveAttribute('style', proposal!);
    await expect(c.sprites).toHaveCount(4);
    await c.activate(c.cancel);
    await c.build();
    await c.place(1008, 976);
    const ghost = (await c.preview.locator('img').boundingBox())!;
    await c.capture('posicionar');
    await c.activate(c.confirm);
    const third = page.locator('[data-instance-id="forge-user-3"]');
    await expect(third).toHaveClass(/constructing/);
    await expect(third).toHaveCSS('left', '1008px');
    await expect(third).toHaveCSS('top', '976px');
    const image = (await third.locator('img').boundingBox())!;
    expect(image.x).toBeCloseTo(ghost.x, 1);
    expect(image.y).toBeCloseTo(ghost.y, 1);
    await expect(page.locator('.build-info')).toContainText('Em construção');
    await c.capture('em-construcao');
    await c.activate(
      page.getByRole('button', { name: 'Concluir construção', exact: true }),
    );
    await expect(third).not.toHaveClass(/constructing/);
    await expect(page.locator('.build-info')).toContainText('Concluído');
    await c.build();
    await c.place(1008, 944);
    await expect(c.preview).toHaveClass(/invalid/);
    await expect(c.confirm).toBeDisabled();
    await expect(page.getByRole('status')).toContainText('sobrepõe');
    await c.capture('invalida');
    await c.place(1200, 1008);
    await expect(c.confirm).toBeEnabled();
    await c.activate(c.confirm);
    const fourth = page.locator('[data-instance-id="forge-user-4"]');
    await expect(fourth).toHaveClass(/constructing/);
    await c.activate(
      page.getByRole('button', { name: 'Concluir construção', exact: true }),
    );
    await expect(c.sprites).toHaveCount(6);
    // Manage via map selection, with no growing shortcut list.
    await expect(page.locator('.shortcuts')).toHaveCount(0);
    await c.visit('Forjas');
    for (const name of ['Forja', 'Forja 2'])
      await c.activate(
        page.getByRole('button', { name: `Selecionar ${name}`, exact: true }),
      );
    await c.visit('Clareira sul');
    await c.activate(third.locator('button'));
    await expect(
      page.getByRole('heading', { name: 'Forja 3', exact: true }),
    ).toBeVisible();
    const original = await third.getAttribute('style');
    await c.activate(page.getByRole('button', { name: 'Mover', exact: true }));
    await expect(
      page.getByRole('button', { name: 'Confirmar mudança', exact: true }),
    ).toBeEnabled();
    await c.viewport.focus();
    await page.keyboard.press('ArrowRight');
    await c.activate(c.cancel);
    await expect(third).toHaveAttribute('style', original!);
    await c.activate(page.getByRole('button', { name: 'Mover', exact: true }));
    await c.viewport.focus();
    for (let i = 0; i < 20; i++) await page.keyboard.press('ArrowRight');
    await c.place(1424, 976);
    await c.capture('mover');
    await c.activate(
      page.getByRole('button', { name: 'Confirmar mudança', exact: true }),
    );
    await expect(third).toHaveCSS('left', '1424px');
    await expect(third).toHaveCSS('top', '976px');
    await expect(third).not.toHaveClass(/constructing/);
    await c.activate(page.getByRole('button', { name: 'Mover', exact: true }));
    await c.viewport.focus();
    for (let i = 0; i < 14; i++) await page.keyboard.press('ArrowLeft');
    for (let i = 0; i < 2; i++) await page.keyboard.press('ArrowDown');
    await expect(
      page.getByRole('button', { name: 'Confirmar mudança', exact: true }),
    ).toBeDisabled();
    await c.activate(c.cancel);
    await expect(third).toHaveCSS('left', '1424px');
    await c.activate(
      page.getByRole('button', { name: 'Remover', exact: true }),
    );
    await c.activate(
      page.getByRole('button', { name: 'Manter construção', exact: true }),
    );
    await expect(c.sprites).toHaveCount(6);
    await c.activate(
      page.getByRole('button', { name: 'Remover', exact: true }),
    );
    await c.activate(
      page.getByRole('button', { name: 'Confirmar remoção', exact: true }),
    );
    await expect(third).toHaveCount(0);
    await expect(fourth).toHaveCount(1);
    await expect(c.sprites).toHaveCount(5);
    await c.capture('removida');
    await c.build();
    await c.viewport.focus();
    for (let i = 0; i < 27; i++) await page.keyboard.press('ArrowDown');
    await expect(c.confirm).toBeDisabled();
    await expect(page.getByRole('status')).toContainText('dentro do mapa');
    await page.keyboard.press('Enter');
    await expect(c.sprites).toHaveCount(5);
    await page.keyboard.press('Escape');
    await expect(c.preview).toHaveCount(0);
    await c.activate(
      page.getByRole('button', { name: 'Centralizar mapa', exact: true }),
    );
    await c.clean();
  });
