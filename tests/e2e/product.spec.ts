import { fillMissionSteps } from './mission-form';
import { confirmBackupImport } from './backup-ui';
import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
async function createProject(
  page: Page,
  name = 'Projeto com direção',
  stages: string[] = [],
  target = '2026-12-10',
) {
  await page.goto('/projetos');
  await page.getByRole('button', { name: 'Novo projeto', exact: true }).click();
  const dialog = page.getByRole('dialog', {
    name: 'Novo projeto',
    exact: true,
  });
  await dialog.getByLabel('Nome do projeto').fill(name);
  await dialog
    .getByLabel('Resultado que quero alcançar')
    .fill('Uma primeira versão que eu consiga experimentar.');
  await dialog.getByLabel('Data desejada (opcional)').fill(target);
  for (const [index, title] of stages.entries()) {
    await dialog
      .getByRole('button', { name: 'Adicionar etapa', exact: true })
      .click();
    await dialog.getByLabel(`Etapa ${index + 1}`, { exact: true }).fill(title);
  }
  await dialog
    .getByRole('button', { name: 'Criar projeto', exact: true })
    .click();
  const link = page.getByRole('link', {
    name: 'Detalhes do projeto',
    exact: true,
  });
  await expect(link).toBeVisible();
  const href = (await link.getAttribute('href'))!;
  await page.goto(href);
  await expect(
    page.getByRole('heading', { name, level: 1, exact: true }),
  ).toBeVisible();
  return href;
}
async function createTask(
  page: Page,
  title = 'Missão de projeto',
  options: {
    project?: string;
    stage?: string;
    steps?: string;
    effort?: string;
  } = {},
) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const dialog = page.getByRole('dialog', {
    name: 'Uma nova missão',
    exact: true,
  });
  await dialog.getByLabel('O que você quer fazer?').fill(title);
  if (options.effort)
    await dialog
      .getByRole('combobox', { name: 'Esforço desta missão', exact: true })
      .selectOption(options.effort);
  if (options.project || options.steps) {
    await dialog
      .getByRole('tab', { name: 'Passos e detalhes', exact: true })
      .click();
    if (options.steps) await fillMissionSteps(dialog, options.steps);
    if (options.project)
      await dialog
        .getByRole('combobox', { name: 'Projeto', exact: true })
        .selectOption({ label: options.project });
    if (options.stage)
      await dialog
        .getByRole('combobox', { name: 'Etapa do projeto', exact: true })
        .selectOption({ label: options.stage });
  }
  await dialog
    .getByRole('button', { name: 'Criar missão', exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await page.goto('/missoes');
  await page.getByRole('tab', { name: 'Todas', exact: true }).click();
  await page.getByRole('link', { name: title, exact: true }).click();
  await expect(page).toHaveURL(/\/missao\/\d+$/);
  await expect(
    page.getByRole('heading', { name: title, level: 1, exact: true }),
  ).toBeVisible();
  return page.url();
}
async function backup(page: Page) {
  await page.goto('/config');
  const downloading = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Exportar dados', exact: true })
    .click();
  return JSON.parse(
    await readFile((await (await downloading).path())!, 'utf8'),
  );
}
test('projeto com objetivo, datas e etapas mantém a próxima missão clara', async ({
  page,
}) => {
  const href = await createProject(page, 'Uma primeira entrega', [
    'Explorar',
    'Construir',
  ]);
  await expect(page.getByText('10/12/2026', { exact: true })).toBeVisible();
  await createTask(page, 'Explorar uma direção', {
    project: 'Uma primeira entrega',
    stage: 'Explorar',
  });
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Missão concluída!', exact: true }),
  ).toBeVisible();
  await page.goto(href);
  await expect(
    page.getByRole('button', { name: 'Reabrir e estornar bônus', exact: true }),
  ).not.toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Concluir projeto', exact: true }),
  ).not.toBeVisible();
  await expect(
    page.getByRole('progressbar', { name: 'Etapas concluídas', exact: true }),
  ).toHaveAttribute('value', '1');
  await expect(
    page.getByRole('progressbar', { name: 'Etapas concluídas', exact: true }),
  ).toHaveAttribute('max', '2');
  await page
    .getByRole('button', { name: 'Editar projeto', exact: true })
    .click();
  const edit = page.getByRole('dialog', {
    name: 'Editar projeto',
    exact: true,
  });
  await edit.getByLabel('Etapa 2', { exact: true }).fill('Publicar');
  await edit
    .getByRole('button', { name: 'Salvar projeto', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Publicar', exact: true }),
  ).toBeVisible();
  await createTask(page, 'Publicar a primeira versão', {
    project: 'Uma primeira entrega',
    stage: 'Publicar',
  });
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Projeto concluído', exact: true }),
  ).toBeVisible();
  const result = await backup(page);
  expect(result.data.projects[0]).toMatchObject({
    status: 'concluido',
    targetDate: '2026-12-10',
  });
  expect(result.data.profile.totalXpEarned).toBe(117);
  expect(result.data.tasks.every((task: any) => !!task.projectStageId)).toBe(
    true,
  );
});
test('associação, reabertura e arquivamento preservam missões e recibos', async ({
  page,
}) => {
  const href = await createProject(page, 'Projeto que continua');
  await createTask(page, 'Atividade já registrada');
  await page.goto(href);
  await page
    .getByRole('button', { name: 'Associar missão existente', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Associar missão',
    exact: true,
  });
  await dialog
    .getByRole('combobox', { name: 'Missão disponível', exact: true })
    .selectOption({ label: 'Atividade já registrada' });
  await dialog
    .getByRole('button', { name: 'Associar missão', exact: true })
    .click();
  await expect(
    page.getByRole('link', { name: 'Atividade já registrada', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('link', { name: 'Atividade já registrada', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Projeto concluído', exact: true }),
  ).toBeVisible();
  await page.goto(href);
  await page
    .getByRole('button', { name: 'Reabrir e estornar bônus', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Concluir projeto', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Concluir projeto', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Reabrir e estornar bônus', exact: true }),
  ).toBeVisible();
  await page.goto('/projetos');
  await page.getByRole('button', { name: 'Arquivar', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'Arquivar projeto?', exact: true })
    .getByRole('button', { name: 'Arquivar projeto', exact: true })
    .click();
  await page.getByRole('button', { name: 'Arquivados', exact: true }).click();
  await page
    .getByRole('link', { name: 'Detalhes do projeto', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Restaurar projeto', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Reabrir e estornar bônus', exact: true }),
  ).toBeVisible();
  const result = await backup(page);
  expect(result.data.tasks).toHaveLength(1);
  expect(result.data.tasks[0].projectId).toBe(result.data.projects[0].id);
  expect(result.data.profile.totalXpEarned).toBe(58);
});
test('missão concluída preserva notas e não oferece novas revisões no dia seguinte', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date('2026-10-10T12:00:00-03:00'));
  const url = await createTask(page, 'Relembrar um conceito', {
    steps: 'Explicar de memória\nConferir uma referência',
  });
  await page
    .getByLabel('Notas da missão')
    .fill('Uma descoberta que quero retomar.');
  await expect(page.getByRole('status')).toHaveText(
    'Tudo salvo neste navegador',
  );
  await expect(
    page.getByRole('button', { name: 'Configurar revisão', exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole('checkbox', { name: 'Explicar de memória', exact: true })
    .check();
  await page
    .getByRole('checkbox', { name: 'Conferir uma referência', exact: true })
    .check();
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('region', { name: 'Resumo da recompensa' }),
  ).toBeVisible();
  await page.clock.setFixedTime(new Date('2026-10-11T12:00:00-03:00'));
  await page.goto(url);
  await expect(
    page.getByRole('button', { name: 'Concluir missão', exact: true }),
  ).not.toBeVisible();
  const result = await backup(page);
  expect(result.data.tasks).toHaveLength(1);
  expect(result.data.tasks[0].executionNotes).toBe(
    'Uma descoberta que quero retomar.',
  );
  expect(
    result.data.activityEvents.filter((event: any) => event.kind === 'review'),
  ).toHaveLength(0);
  expect(result.data.profile.totalXpEarned).toBe(53);
});
test('esforço define a recompensa e editar passos não fabrica XP', async ({
  page,
}) => {
  const url = await createTask(page, 'Um esforço escolhido', {
    steps: Array.from({ length: 20 }, (_, index) => `Passo ${index + 1}`).join(
      '\n',
    ),
    effort: 'medium',
  });
  await page
    .getByRole('button', { name: 'Editar missão', exact: true })
    .click();
  const edit = page.getByRole('dialog', { name: 'Editar missão', exact: true });
  await expect(edit.locator('.reward-preview')).toContainText('+105 XP');
  await expect(edit.locator('.reward-preview')).toContainText('+50 Ouro');
  await expect(edit.locator('.reward-preview')).toContainText('+4 Comida');
  await edit
    .getByRole('tab', { name: 'Passos e detalhes', exact: true })
    .click();
  await fillMissionSteps(edit, 'Um passo de verdade');
  await edit
    .getByRole('button', { name: 'Salvar missão', exact: true })
    .click();
  await expect(
    page.getByRole('checkbox', { name: 'Um passo de verdade', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('checkbox', { name: 'Um passo de verdade', exact: true })
    .check();
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Missão concluída!', exact: true }),
  ).toBeVisible();
  const result = await backup(page);
  expect(result.data.tasks[0]).toMatchObject({ effort: 'medium', xp: 100 });
  expect(result.data.profile.totalXpEarned).toBe(105);
  await page.goto(url);
  await expect(page.getByLabel('Recompensa recebida')).toContainText('+105');
});
test('datas de projeto novas e legadas não mudam entre fusos', async ({
  browser,
  page,
  baseURL,
}) => {
  for (const timezoneId of [
    'America/Sao_Paulo',
    'America/Los_Angeles',
    'Pacific/Auckland',
  ]) {
    const context = await browser.newContext({
      baseURL,
      timezoneId,
      viewport: page.viewportSize() ?? { width: 1280, height: 900 },
      serviceWorkers: 'block',
    });
    const tab = await context.newPage();
    await createProject(tab, 'Projeto com data');
    await tab.reload();
    await expect(tab.getByText('10/12/2026', { exact: true })).toBeVisible();
    await tab
      .getByRole('button', { name: 'Editar projeto', exact: true })
      .click();
    await expect(tab.getByLabel('Data desejada (opcional)')).toHaveValue(
      '2026-12-10',
    );
    await tab.keyboard.press('Escape');
    await tab.goto('/config');
    const legacy = {
      meta: {
        app: 'Level Me Up!',
        formatVersion: 2,
        exportedAt: '2026-10-29T12:00:00Z',
      },
      data: {
        profile: null,
        tasks: [],
        areas: [],
        companions: [],
        xpLogs: [],
        projects: [
          {
            id: 77,
            name: 'Prazo antigo',
            status: 'planejando',
            createdAt: '2026-10-01T12:00:00Z',
            targetDate: '2026-12-10T00:00:00.000Z',
          },
        ],
      },
    };
    await tab.locator('input[type=file]').setInputFiles({
      name: 'antigo.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(legacy)),
    });
    await confirmBackupImport(tab);
    await tab.goto('/projetos/77');
    await expect(tab.getByText('10/12/2026', { exact: true })).toBeVisible();
    await context.close();
  }
});
test('edição de projeto em duas abas recusa sobrescrita e preserva o rascunho', async ({
  page,
  context,
}) => {
  const href = await createProject(page, 'Projeto compartilhado entre abas');
  const other = await context.newPage();
  await other.goto(href);
  await page
    .getByRole('button', { name: 'Editar projeto', exact: true })
    .click();
  await other
    .getByRole('button', { name: 'Editar projeto', exact: true })
    .click();
  const first = page.getByRole('dialog', {
    name: 'Editar projeto',
    exact: true,
  });
  const second = other.getByRole('dialog', {
    name: 'Editar projeto',
    exact: true,
  });
  await first.getByLabel('Nome do projeto').fill('Mudança salva');
  await second.getByLabel('Nome do projeto').fill('Meu rascunho');
  await first
    .getByRole('button', { name: 'Salvar projeto', exact: true })
    .click();
  await expect(first).not.toBeVisible();
  await second
    .getByRole('button', { name: 'Salvar projeto', exact: true })
    .click();
  await expect(second.getByRole('alert')).toContainText('outra aba');
  await expect(second.getByLabel('Nome do projeto')).toHaveValue(
    'Meu rascunho',
  );
});
test('projetos e revisões funcionam em 320x568 com texto ampliado', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await createProject(page, 'Projeto pequeno', ['Começar']);
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '32px';
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page
    .getByRole('button', { name: 'Editar projeto', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Editar projeto',
    exact: true,
  });
  await expect(dialog.getByLabel('Etapa 1', { exact: true })).toBeVisible();
  expect(
    await dialog.evaluate(
      (element) => element.scrollWidth <= element.clientWidth + 1,
    ),
  ).toBe(true);
  await page.keyboard.press('Escape');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '16px';
  });
  await createTask(page, 'Missão sem revisões');
  await expect(
    page.getByRole('button', { name: 'Configurar revisão', exact: true }),
  ).toHaveCount(0);
});
