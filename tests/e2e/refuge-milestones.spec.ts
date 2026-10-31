import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { confirmBackupImport } from './backup-ui';
async function backup(page: Page) {
  await page.goto('/config');
  const pending = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Exportar dados', exact: true })
    .click();
  return JSON.parse(await readFile((await (await pending).path())!, 'utf8'));
}
async function restore(page: Page, saved: any) {
  await page.goto('/config');
  await page.locator('input[type=file]').setInputFiles({
    name: 'jornada.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(saved)),
  });
  await confirmBackupImport(page);
}
async function seed(page: Page, fields: Record<string, unknown>) {
  const saved = await backup(page);
  Object.assign(saved.data.profile, fields);
  await restore(page, saved);
}
function milestone(page: Page, name: string) {
  return page
    .locator('.refuge-milestone')
    .filter({ has: page.getByRole('heading', { name, exact: true }) });
}
async function capture(page: Page, name: string, project: string) {
  if (!process.env.LMU_CAPTURE_DIR) return;
  await page.locator('img').evaluateAll(async (elements) => {
    await Promise.all(
      elements.map(async (element) => {
        const image = element as HTMLImageElement;
        image.loading = 'eager';
        try {
          await image.decode();
        } catch {
          /* The interface keeps its image fallback. */
        }
      }),
    );
  });
  await page.screenshot({
    path: process.env.LMU_CAPTURE_DIR + '/' + project + '-' + name + '.png',
    fullPage: !name.startsWith('previa-'),
  });
}

async function cross(page: Page) {
  await seed(page, {
    totalXpEarned: 2490,
    ecoGoldClaimedUpToStage: 1,
    gold: 0,
    food: 0,
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Uma nova missão' });
  await dialog
    .getByLabel('O que você quer fazer?')
    .fill('Alcançar uma nova paisagem');
  await dialog
    .getByRole('button', { name: 'Criar missão', exact: true })
    .click();
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Todas', exact: true }).click();
  await page.getByRole('link', { name: 'Alcançar uma nova paisagem', exact: true }).click();
  await expect(page).toHaveURL(/\/missao\/\d+$/);
  const url = page.url();
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Missão concluída!', exact: true }),
  ).toBeVisible();
  return url;
}

test('explorar paisagem futura não muda ambiente, saldo ou registros e devolve o foco', async ({
  page,
}, info) => {
  const before = await backup(page);
  await page.goto('/santuario');
  await expect(
    page.getByRole('heading', { name: 'Refúgio', level: 1, exact: true }),
  ).toBeVisible();
  await expect(page.locator('.refuge-stage-thumbnail img')).toHaveCount(4);
  const trigger = page.getByRole('button', {
    name: 'Ver paisagem de Floresta Anciã',
    exact: true,
  });
  await trigger.click();
  const preview = page.getByRole('dialog', {
    name: 'Prévia: Floresta Anciã',
    exact: true,
  });
  await expect(
    preview.getByText(
      'Prévia visual. Não altera o ambiente ativo, XP ou Gold.',
      { exact: true },
    ),
  ).toBeFocused();
  await expect
    .poll(() =>
      preview
        .locator('img')
        .evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0);
  await capture(page, 'previa-futura', info.project.name);
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(
    page
      .locator('.collection-scene')
      .getByRole('heading', { name: 'Semente', exact: true }),
  ).toBeVisible();
  await expect(
    milestone(page, 'Brotinho').getByText('Ainda por alcançar', {
      exact: true,
    }),
  ).toBeVisible();
  const after = await backup(page);
  expect(after.data).toEqual(before.data);
});

test('marco recebido tem recibo e estorno restaura paisagem e recursos sem esconder sua origem', async ({
  page,
}, info) => {
  const url = await cross(page);
  await page.goto('/refugio');
  const sprout = milestone(page, 'Brotinho');
  await expect(
    sprout.getByText('Recompensa registrada', { exact: true }),
  ).toBeVisible();
  await sprout.getByText('Ver registro deste marco', { exact: true }).click();
  await expect(
    sprout.getByText(/Recompensa total da ação:.*225 Gold/),
  ).toBeVisible();
  await capture(page, 'marco-registrado', info.project.name);
  await page.goto(url);
  await page
    .getByRole('button', { name: 'Desfazer conclusão', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Concluir missão', exact: true }),
  ).toBeVisible();
  await page.goto('/refugio');
  await expect(
    sprout.getByText('Registro estornado', { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .locator('.collection-scene')
      .getByRole('heading', { name: 'Semente', exact: true }),
  ).toBeVisible();
  await capture(page, 'marco-estornado', info.project.name);
  const saved = await backup(page);
  expect(saved.data.profile.gold).toBe(0);
  expect(saved.data.profile.totalXpEarned).toBe(2490);
});

test('prêmio legado permanece marcado com XP abaixo do marco e XP sem recibo fica pendente', async ({
  page,
}, info) => {
  await seed(page, {
    totalXpEarned: 2490,
    ecoGoldClaimedUpToStage: 2,
    gold: 1000,
  });
  await page.goto('/refugio');
  await expect(
    milestone(page, 'Brotinho').getByText('Marcado como recebido', {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page
      .locator('.refuge-next')
      .getByText(
        'O prêmio deste marco já consta como recebido. Alcançá-lo novamente não gera outro Gold.',
        { exact: true },
      ),
  ).toBeVisible();
  await capture(page, 'marco-legado', info.project.name);
  const legacy = await backup(page);
  expect(legacy.data.profile.gold).toBe(1000);
  expect(legacy.data.activityEvents).toHaveLength(0);
  Object.assign(legacy.data.profile, {
    totalXpEarned: 2600,
    ecoGoldClaimedUpToStage: 1,
  });
  await restore(page, legacy);
  await page.goto('/refugio');
  await expect(
    milestone(page, 'Brotinho').getByText('Sem recompensa registrada', {
      exact: true,
    }),
  ).toBeVisible();
  await capture(page, 'marco-pendente', info.project.name);
  const pending = await backup(page);
  expect(pending.data.profile.gold).toBe(1000);
  expect(pending.data.activityEvents).toHaveLength(0);
});

test('backup que perde marca de prêmio já registrado é recusado antes de substituir a jornada', async ({
  page,
}, info) => {
  await cross(page);
  const before = await backup(page);
  const invalid = structuredClone(before);
  invalid.data.profile.ecoGoldClaimedUpToStage = 1;
  await page.locator('input[type=file]').setInputFiles({
    name: 'incoerente.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(invalid)),
  });
  await expect(page.getByRole('alert')).toContainText(
    'marcos recebidos não correspondem ao perfil',
  );
  await expect(
    page.getByRole('dialog', { name: 'Importar este backup?', exact: true }),
  ).not.toBeVisible();
  await capture(page, 'backup-recusado', info.project.name);
  const after = await backup(page);
  expect(after.data).toEqual(before.data);
});

test('prévia e marcos funcionam sem arte em 320px com texto 200%', async ({
  page,
}, info) => {
  await page.route('**/art/**', (route) => route.abort());
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/refugio');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  expect(
    await page.locator('.collection-scene').evaluate((scene) => {
      const bounds = scene.getBoundingClientRect(),
        caption = scene
          .querySelector('.collection-scene-copy')!
          .getBoundingClientRect();
      return caption.top >= bounds.top && caption.bottom <= bounds.bottom;
    }),
  ).toBe(true);
  const trigger = page.getByRole('button', {
    name: 'Ver paisagem de Floresta Anciã',
    exact: true,
  });
  await trigger.click();
  const preview = page.getByRole('dialog', {
    name: 'Prévia: Floresta Anciã',
    exact: true,
  });
  await expect(
    preview.getByRole('img', {
      name: 'Prévia da paisagem Floresta Anciã',
      exact: true,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    await preview.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
  await capture(page, 'previa-320-sem-arte', info.project.name);
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});
