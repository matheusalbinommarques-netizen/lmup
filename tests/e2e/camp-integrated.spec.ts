import { confirmBackupImport } from './backup-ui';
import { campLandmarks } from '../../src/lib/camp/campRegion';
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
  expect((await page.goto('/refugio/acampamento'))?.status()).toBe(200);
  await expect(
    page.getByRole('heading', { name: 'Acampamento', exact: true }),
  ).toBeVisible();
  await expect(page.locator('canvas.terrain-region')).toHaveAttribute(
    'data-ready',
    'true',
  );
  const mobile = info.project.name === 'mobile';
  const activate = async (locator: ReturnType<Page['locator']>) => {
    const label = await locator.getAttribute('aria-label');
    if (label?.startsWith('Selecionar ')) {
      const covered = await locator.evaluate((el) => {
        const r = el.getBoundingClientRect(),
          hit = document.elementFromPoint(
            r.x + r.width / 2,
            r.y + r.height / 2,
          );
        return (
          !el.contains(hit) &&
          !!hit?.closest('.building-utility,.resource-panel')
        );
      });
      if (covered) {
        for (const name of [
          'Fechar painel da construção',
          'Fechar painel de recursos',
          'Fechar missões demonstrativas',
        ]) {
          const close = page.getByRole('button', { name, exact: true });
          if (await close.isVisible()) {
            await close.click();
            break;
          }
        }
      }
    }
    if (!mobile && label === 'Cancelar') {
      const covered = await locator.evaluate((el) => {
        const r = el.getBoundingClientRect(),
          hit = document.elementFromPoint(
            r.x + r.width / 2,
            r.y + r.height / 2,
          );
        return !el.contains(hit);
      });
      if (covered) {
        await page.keyboard.press('Escape');
        return;
      }
    }
    if (mobile) await locator.tap();
    else await locator.click();
  };
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
    const target = campLandmarks.find((landmark) => landmark.name === name)!;
    const delta = await world.evaluate((node, target) => {
      const m = new DOMMatrix(getComputedStyle(node).transform);
      const v = node.parentElement!.getBoundingClientRect();
      return {
        x: v.width / 2 - m.e - target.x * m.a,
        y: v.height / 2 - m.f - target.y * m.a,
      };
    }, target);
    const bounds = (await viewport.boundingBox())!;
    const start = { x: bounds.x + 20, y: bounds.y + 235 };
    if (mobile) {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Input.synthesizeScrollGesture', {
        ...start,
        xDistance: delta.x,
        yDistance: delta.y,
        gestureSourceType: 'touch',
        speed: 600,
      });
    } else {
      await page.mouse.move(start.x, start.y);
      await page.mouse.down();
      await page.mouse.move(start.x + delta.x, start.y + delta.y, {
        steps: 10,
      });
      await page.mouse.up();
    }
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
  const selectedCamera = await c.world.getAttribute('style');
  await c.visit('Forjas');
  await expect(c.world).not.toHaveAttribute('style', selectedCamera!);
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

test('terreno integral, regiões navegáveis e profundidade sem slot fixo', async ({
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
  await expect(
    page.getByRole('button', {
      name: 'Selecionar Terreno disponível',
      exact: true,
    }),
  ).toHaveCount(0);
  const resources = await page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .filter((r) => r.name.includes('/art/camp/region/'))
      .map((r) => r.name),
  );
  expect(resources).toHaveLength(6);
  expect(new Set(resources).size).toBe(6);
  await c.clean();
});

test('destruir pelo modo global pede confirmação sobre o prédio e não reembolsa', async ({
  page,
  context,
}, info) => {
  test.skip(info.project.name !== 'desktop', 'Rodada de desktop.');
  const c = await camp(page, context, info);
  const click = (name: string) =>
    c.activate(page.getByRole('button', { name, exact: true }));
  const mode = page.getByRole('button', {
    name: 'Modo destruir construções',
    exact: true,
  });
  const stock = await page
    .locator('[data-stock-resource="wood"] strong')
    .textContent();
  await click('Modo destruir construções');
  await expect(mode).toHaveAttribute('aria-pressed', 'true');
  await click('Selecionar Forja');
  await expect(page.locator('.building-utility')).toHaveCount(0);
  await expect(page.locator('.construction-controls')).toContainText(
    'Sem reembolso',
  );
  const controls = (await page
    .locator('.construction-controls')
    .boundingBox())!;
  const image = (await page
    .locator('[data-instance-id="forge"] img')
    .boundingBox())!;
  expect(controls.y + controls.height).toBeLessThanOrEqual(image.y);
  await click('Cancelar destruição');
  await expect(c.sprites).toHaveCount(4);
  await click('Selecionar Forja');
  await click('Confirmar destruição');
  await expect(c.sprites).toHaveCount(3);
  await expect(page.locator('[data-stock-resource="wood"] strong')).toHaveText(
    stock!,
  );
  await click('Modo mover construções');
  await expect(mode).toHaveAttribute('aria-pressed', 'false');
  await click('Modo destruir construções');
  await click('Construir');
  await expect(mode).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.press('Escape');
  await click('Modo destruir construções');
  await c.activate(page.locator('[data-stock-resource="wood"]'));
  await expect(mode).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('.resource-panel')).toBeVisible();
  await c.clean();
});

test('modo global arrasta prédios, mantém câmera e exige confirmar; terreno e Esc saem', async ({
  page,
  context,
}, info) => {
  test.skip(info.project.name !== 'desktop', 'Rodada de desktop.');
  const c = await camp(page, context, info);
  const mode = page.getByRole('button', {
    name: 'Modo mover construções',
    exact: true,
  });
  const forge = page.locator('[data-instance-id="forge"]');
  const moveConfirm = page.getByRole('button', {
    name: 'Confirmar mudança',
    exact: true,
  });
  const client = (point: { x: number; y: number }) =>
    c.world.evaluate((el, p) => {
      const m = new DOMMatrix(getComputedStyle(el).transform),
        v = el.parentElement!.getBoundingClientRect();
      return { x: v.left + m.e + p.x * m.a, y: v.top + m.f + p.y * m.a };
    }, point);
  const dragBuilding = async (id: string, x: number, y: number) => {
    const from = await page
      .locator(`[data-instance-id="${id}"]`)
      .evaluate((el) => ({
        x: parseFloat((el as HTMLElement).style.left),
        y: parseFloat((el as HTMLElement).style.top),
      }));
    const start = await client({ x: from.x + 16, y: from.y - 30 });
    const end = await client({ x: x + 16, y: y - 30 });
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(end.x, end.y, { steps: 8 });
    await page.mouse.up();
  };
  const bounds = (await page.locator('.build-tools').boundingBox())!;
  const viewportBounds = (await c.viewport.boundingBox())!;
  expect(bounds.y).toBeGreaterThan(
    viewportBounds.y + viewportBounds.height * 0.8,
  );
  await c.activate(mode);
  await expect(mode).toHaveAttribute('aria-pressed', 'true');
  const original = await forge.getAttribute('style');
  const camera = await c.world.getAttribute('style');
  await dragBuilding('forge', 1008, 976);
  await expect(c.world).toHaveAttribute('style', camera!);
  await expect(forge).toHaveAttribute('style', original!);
  await expect(c.preview).toHaveCSS('left', '1008px');
  await expect(moveConfirm).toBeEnabled();
  await c.activate(page.getByRole('button', { name: 'Girar', exact: true }));
  await c.activate(moveConfirm);
  await expect(forge).toHaveCSS('left', '1008px');
  await expect(forge).toHaveCSS('top', '976px');
  await expect(forge).toHaveAttribute('data-rotation', '180');
  await expect(mode).toHaveAttribute('aria-pressed', 'true');
  await dragBuilding('hall', 1008, 976);
  await expect(moveConfirm).toBeDisabled();
  await expect(c.preview).toHaveClass(/invalid/);
  await page.keyboard.press('Escape');
  await expect(c.preview).toHaveCount(0);
  await expect(mode).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
  await expect(mode).toHaveAttribute('aria-pressed', 'false');
  await c.activate(mode);
  await c.drag();
  await expect(mode).toHaveAttribute('aria-pressed', 'true');
  await c.place(400, 800);
  await expect(mode).toHaveAttribute('aria-pressed', 'false');
  await c.activate(
    page.getByRole('button', { name: 'Centralizar mapa', exact: true }),
  );
  await c.activate(mode);
  await dragBuilding('forge', 1056, 832);
  await c.place(400, 800);
  await expect(c.preview).toHaveCount(0);
  await expect(mode).toHaveAttribute('aria-pressed', 'false');
  await expect(forge).toHaveCSS('left', '1008px');
  await expect(forge).toHaveAttribute('data-rotation', '180');
  await c.build();
  await c.activate(mode);
  await expect(c.preview).toHaveCount(0);
  await c.activate(
    page.getByRole('button', { name: 'Construir', exact: true }),
  );
  await expect(mode).toHaveAttribute('aria-pressed', 'false');
  await expect(
    page.getByRole('heading', { name: 'Construções', exact: true }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await c.clean();
});

test('produção, trabalhadores, fabricação, recarga, outra aba e backup preservam a jornada', async ({
  page,
  context,
}, info) => {
  await page.clock.install({ time: new Date('2026-11-02T12:00:00-03:00') });
  await page.goto('/refugio');
  await expect(
    page.getByRole('heading', { name: 'Refúgio', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('link', { name: 'Entrar no acampamento →', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Acampamento', exact: true }),
  ).toBeVisible();
  const c = await camp(page, context, info);
  const click = (name: string) =>
    c.activate(page.getByRole('button', { name, exact: true }));
  const stock = (resource: string) =>
    page.locator(`[data-stock-resource="${resource}"] strong`);
  await click('Construir');
  await click('Escolher Serraria');
  await c.activate(c.confirm);
  const sawmill = page.locator('[data-instance-id="sawmill-user-3"]');
  await expect(sawmill.locator('button')).toBeVisible();
  await click('Concluir construção');
  await expect(page.getByLabel('Trabalhador de Serraria 3')).toBeVisible();
  await page.getByLabel('Trabalhador de Serraria 3').selectOption('lia');
  await expect(page.getByLabel('Trabalhador de Serraria 3')).toHaveValue('lia');
  await page.clock.fastForward(10000);
  await expect(stock('wood')).toHaveText('6');
  await click('Fechar painel da construção');
  await c.visit('Forjas');
  await click('Selecionar Forja');
  await click('Fabricar espada de treino');
  await expect(page.locator('[data-resource="trainingSword"]')).toHaveText('1');
  await expect(stock('gold')).toHaveText('0');
  await page.reload();
  await expect(stock('wood')).toHaveText('4');
  await expect(sawmill.locator('button')).toBeVisible();
  await c.visit('Forjas');
  await click('Selecionar Forja');
  await expect(page.locator('[data-resource="trainingSword"]')).toHaveText('1');
  const other = await context.newPage();
  await other.goto('/refugio/acampamento');
  await expect(other.locator('[data-stock-resource="wood"] strong')).toHaveText(
    '4',
  );
  await expect(
    page.getByRole('button', {
      name: 'Fabricar espada de treino',
      exact: true,
    }),
  ).toBeDisabled();
  await other
    .getByRole('button', { name: 'Selecionar Serraria 3', exact: true })
    .click();
  await other.getByLabel('Trabalhador de Serraria 3').selectOption('');
  await click('Fechar painel da construção');
  await click('Selecionar Serraria 3');
  await expect(page.getByLabel('Trabalhador de Serraria 3')).toHaveValue('');
  await page.goto('/config');
  const pending = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Exportar dados', exact: true })
    .click();
  const { readFile } = await import('node:fs/promises');
  const backup = JSON.parse(
    await readFile((await (await pending).path())!, 'utf8'),
  );
  expect(backup.data.profile.camp.inventory.trainingSword).toBe(1);
  expect(backup.data.profile.gold).toBe(0);
  expect(backup.data.profile.totalXpEarned).toBe(0);
  expect(backup.data.tasks).toEqual([]);
  expect(backup.data.activityEvents).toEqual([]);
  await other.close();
  await page.locator('input[type=file]').setInputFiles({
    name: 'camp-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await confirmBackupImport(page);
  await page.goto('/refugio/acampamento');
  await c.visit('Forjas');
  await click('Selecionar Forja');
  await expect(page.locator('[data-resource="trainingSword"]')).toHaveText('1');
  await expect(stock('wood')).toHaveText('4');
  await c.capture('persistencia-fabricacao');
  await page.goto('/refugio');
  await expect(
    page.getByRole('progressbar', {
      name: 'Progresso do ambiente',
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText('Comida disponível', { exact: false }),
  ).toBeVisible();
});

test('acampamento em 320 px mantém terreno, controles e saída acessíveis', async ({
  page,
  context,
}, info) => {
  await page.setViewportSize({ width: 320, height: 740 });
  const c = await camp(page, context, info);
  for (const label of await page.locator('.resource-name').all())
    expect(
      await label.evaluate((el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        return range.getClientRects().length;
      }),
    ).toBe(1);

  await expect(
    page.getByRole('button', { name: 'Construir', exact: true }),
  ).toBeVisible();
  await c.activate(
    page.getByRole('button', { name: 'Construir', exact: true }),
  );
  await expect(
    page.getByRole('button', { name: 'Escolher Serraria', exact: true }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('link', { name: 'Voltar ao Refúgio', exact: true }),
  ).toBeVisible();
  await c.capture('controles-320');
  await c.clean();
});
