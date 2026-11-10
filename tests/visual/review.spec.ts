import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { seedAuditText } from '../e2e/audit-text-fixture';
import {
  OLD_EXPORT,
  REMINDER_NOW,
  seedBackupReminder,
} from '../e2e/backup-reminder-fixture';

const scope = process.env.LMU_VISUAL_SCOPE ?? 'world';
const world = scope === 'world' || scope === 'all';
const core = scope === 'core' || scope === 'all';

test.beforeEach(async ({ context }) => {
  // Only the compiled LMUP on the disposable CI loopback server is reachable.
  // No production installation, account, personal backup or remote API.
  await context.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      !['127.0.0.1', 'localhost'].includes(url.hostname)
    ) {
      return route.abort();
    }
    return route.continue();
  });
});

async function capture(
  page: Page,
  info: TestInfo,
  name: string,
  fullPage = true,
) {
  const directory = join('visual-review', info.project.name);
  await mkdir(directory, { recursive: true });
  await page.evaluate(async () => {
    await document.fonts.ready;
    window.scrollTo(0, 0);
  });
  await page.screenshot({
    path: join(directory, name + '.png'),
    fullPage,
    animations: 'disabled',
  });
  const details = await page.evaluate(() => ({
    title: document.title,
    heading: document.querySelector('h1')?.textContent?.trim() ?? null,
    horizontalOverflowPx: Math.max(
      0,
      document.documentElement.scrollWidth - window.innerWidth,
    ),
    brokenImages: [...document.images]
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.getAttribute('src')),
  }));
  const metadata = {
    scene: name,
    viewport: page.viewportSize(),
    path: new URL(page.url()).pathname + new URL(page.url()).search,
    ...details,
  };
  await writeFile(
    join(directory, name + '.json'),
    JSON.stringify(metadata, null, 2),
  );
  // Full-page mobile images show fixed navigation midway through the long
  // screenshot. Preserve a real viewport shot as well to inspect the fold.
  if (fullPage && info.project.name.startsWith('mobile-')) {
    const viewportName = name + '-viewport';
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: join(directory, viewportName + '.png'),
      animations: 'disabled',
    });
    await writeFile(
      join(directory, viewportName + '.json'),
      JSON.stringify({ ...metadata, scene: viewportName }, null, 2),
    );
  }
  // Keep imperfect screenshots as evidence; metadata records layout issues.
}

if (world) {
  test('Mundo: mapa, atlas e diário', async ({ page }, info) => {
    await page.goto('/mundo');
    await expect(
      page.getByRole('heading', { name: 'Mundo', level: 1, exact: true }),
    ).toBeVisible();
    await capture(page, info, '01-mundo-mapa');
    await page.getByRole('button', { name: 'Atlas', exact: true }).click();
    await capture(page, info, '02-mundo-atlas');
    await page
      .getByRole('button', { name: 'História do Mundo', exact: true })
      .click();
    await capture(page, info, '03-mundo-diario');
  });

  test('Mundo: campanha real e seus objetivos', async ({ page }, info) => {
    await page.goto('/mundo');
    await page
      .getByRole('link', { name: 'Campanha e objetivos →', exact: true })
      .click();
    await expect(
      page.getByRole('heading', {
        name: 'Aventura nos Ermos',
        level: 1,
        exact: true,
      }),
    ).toBeVisible();
    await capture(page, info, '04-campanha-objetivos');
  });

  test('Mundo: cena de exploração do Oásis', async ({ page }, info) => {
    await page.goto('/mundo');
    await page
      .getByRole('button', { name: 'Entrar no assentamento', exact: true })
      .click();
    await expect(
      page.getByRole('dialog', { name: 'Exploração do Oásis', exact: true }),
    ).toBeVisible();
    await capture(page, info, '05-oasis-exploracao', false);
  });
}

if (core) {
  test('A14: lembrete de backup em Hoje e Configurações, antes e depois', async ({
    page,
  }, info) => {
    await seedBackupReminder(page, REMINDER_NOW);
    await capture(page, info, '14-a14-hoje-antes');
    await page.goto('/config');
    await expect(
      page.getByRole('heading', { name: 'Configurações', exact: true }),
    ).toBeVisible();
    await capture(page, info, '15-a14-config-antes');
    await page.evaluate(
      (value) => localStorage.setItem('lmup:last-export', value),
      OLD_EXPORT,
    );
    await page.reload();
    await expect(
      page.getByRole('complementary', { name: 'Lembrete de backup' }),
    ).toBeVisible();
    await capture(page, info, '15-a14-config-depois');
    await page.goto('/');
    await expect(
      page.getByRole('complementary', { name: 'Lembrete de backup' }),
    ).toBeVisible();
    await capture(page, info, '14-a14-hoje-depois');
  });

  test('Auditoria A04: progresso e histórico com dados sintéticos', async ({
    page,
  }, info) => {
    await seedAuditText(page);
    await page.goto('/progresso');
    const report = page.locator('.productivity-progress');
    await report
      .getByText('Tendências semanais, mensais e horários', { exact: true })
      .click();
    await expect(
      report.getByText('outubro de 2026: 1 ocorrência concluída.', {
        exact: true,
      }),
    ).toBeVisible();
    await capture(page, info, '12-a04-progresso');
    await page.goto('/missoes');
    await page.getByRole('button', { name: 'Concluídas', exact: true }).click();
    await expect(
      page
        .locator('.history-row')
        .filter({ hasText: 'Caminhada recorrente sem rotina' }),
    ).toContainText('Concluída');
    await capture(page, info, '13-a04-historico');
  });

  test('Hoje: vazio e criação de uma missão sintética', async ({
    page,
  }, info) => {
    await page.goto('/');
    await expect(
      page.getByRole('button', { name: 'Nova missão', exact: true }),
    ).toBeVisible();
    await capture(page, info, '06-hoje-vazio');
    await page
      .getByRole('button', { name: 'Nova missão', exact: true })
      .click();
    const dialog = page.getByRole('dialog', { name: 'Uma nova missão' });
    await expect(dialog).toBeVisible();
    await capture(page, info, '07-criar-missao');
    await dialog
      .getByLabel('O que você quer fazer?')
      .fill('Exemplo sintético de missão');
    await dialog.getByRole('button', { name: 'Criar missão' }).click();
    await expect(dialog).not.toBeVisible();
    await page.goto('/');
    await expect(
      page.getByText('Exemplo sintético de missão', { exact: true }).first(),
    ).toBeVisible();
    await capture(page, info, '08-hoje-com-missao');
  });

  test('Missões: organização inicial', async ({ page }, info) => {
    await page.goto('/missoes');
    await expect(
      page.getByRole('button', { name: 'Nova missão', exact: true }),
    ).toBeVisible();
    await capture(page, info, '09-missoes');
  });

  test('Herói: ficha inicial', async ({ page }, info) => {
    await page.goto('/perfil');
    await expect(
      page.getByRole('heading', { name: 'Herói', level: 1, exact: true }),
    ).toBeVisible();
    await capture(page, info, '10-heroi');
  });

  test('Acampamento: centro inicial', async ({ page }, info) => {
    await page.goto('/acampamento');
    await expect(page.getByTestId('point-caretaker')).toBeAttached();
    await capture(page, info, '11-acampamento');
  });
}
