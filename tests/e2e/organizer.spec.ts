import { expect, test, type Page, type Locator } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { confirmBackupImport } from './backup-ui';

test.beforeEach(async ({ page }, info) => {
  if (info.project.name === 'desktop')
    await page.setViewportSize({ width: 1440, height: 900 });
  await page.clock.setFixedTime(new Date('2026-11-02T10:00:00-03:00'));
});
async function capture(page: Page, prefix: string, state: string) {
  const folder = 'docs/missoes-organizador-capturas';
  await mkdir(folder, { recursive: true });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: join(folder, `${prefix}-${state}.png`),
    fullPage: true,
    animations: 'disabled',
  });
}
async function create(
  page: Page,
  title: string,
  configure?: (form: Locator) => Promise<void>,
) {
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const form = page.getByRole('dialog', {
    name: 'Uma nova missão',
    exact: true,
  });
  await form.getByLabel('O que você quer fazer?').fill(title);
  await configure?.(form);
  await form.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await expect(form).not.toBeVisible();
  await page.getByRole('button', { name: 'Todas', exact: true }).click();
  await page.getByRole('link', { name: title, exact: true }).click();
  await expect(page).toHaveURL(/\/missao\/\d+$/);
  return page.url();
}
async function backup(page: Page) {
  await page.goto('/config');
  const pending = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Exportar dados', exact: true })
    .click();
  return JSON.parse(await readFile((await (await pending).path())!, 'utf8'));
}

test('áreas no cadastro, edição, exclusão com transferência e criação apenas pelo nome', async ({
  page,
}, info) => {
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const form = page.getByRole('dialog', {
    name: 'Uma nova missão',
    exact: true,
  });
  await form.getByLabel('O que você quer fazer?').fill('Organizar a cozinha');
  await form
    .getByRole('button', { name: 'Gerenciar áreas', exact: true })
    .click();
  const areas = page.getByRole('dialog', { name: 'Minhas áreas', exact: true });
  await areas.getByLabel('Nome da nova área').fill('Casa');
  await areas.getByRole('button', { name: 'Criar área', exact: true }).click();
  await expect(
    areas.getByRole('button', { name: 'Renomear Casa', exact: true }),
  ).toBeVisible();
  await capture(page, info.project.name, 'areas');
  await areas
    .getByRole('button', { name: 'Fechar diálogo', exact: true })
    .click();
  await expect(
    form.getByRole('combobox', { name: 'Área', exact: true }),
  ).not.toHaveValue('0');
  await capture(page, info.project.name, 'cadastro');
  await form.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await expect(form).not.toBeVisible();
  await expect(page).toHaveURL(/\/missoes$/);
  await page
    .getByRole('link', { name: 'Organizar a cozinha', exact: true })
    .click();
  const url = page.url();
  await expect(
    page.getByRole('heading', { name: 'Organizar a cozinha', exact: true }),
  ).toBeVisible();
  await capture(page, info.project.name, 'execucao');
  await page
    .getByRole('button', { name: 'Editar missão', exact: true })
    .click();
  const edit = page.getByRole('dialog', { name: 'Editar missão', exact: true });
  await edit
    .getByRole('button', { name: 'Gerenciar áreas', exact: true })
    .click();
  await areas.getByLabel('Nome da nova área').fill('Pessoal');
  await areas.getByRole('button', { name: 'Criar área', exact: true }).click();
  await areas
    .getByRole('button', { name: 'Fechar diálogo', exact: true })
    .click();
  await edit
    .getByRole('button', { name: 'Salvar missão', exact: true })
    .click();
  await expect(edit).not.toBeVisible();
  await page.reload();
  await expect(
    page.getByText('Pessoal · Sem repetição', { exact: false }),
  ).toBeVisible();
  await page.goto('/missoes');
  await page
    .getByRole('button', { name: 'Gerenciar áreas', exact: true })
    .click();
  await areas
    .getByRole('button', { name: 'Renomear Casa', exact: true })
    .click();
  await areas.getByLabel('Novo nome de Casa').fill('Meu lar');
  await areas.getByRole('button', { name: 'Salvar nome', exact: true }).click();
  await expect(
    areas.getByRole('button', { name: 'Excluir Meu lar', exact: true }),
  ).toBeVisible();
  await areas
    .getByRole('button', { name: 'Excluir Pessoal', exact: true })
    .click();
  await areas
    .getByRole('button', { name: 'Cancelar exclusão', exact: true })
    .click();
  await expect(
    areas.getByRole('button', { name: 'Excluir Pessoal', exact: true }),
  ).toBeVisible();
  await areas
    .getByRole('button', { name: 'Excluir Pessoal', exact: true })
    .click();
  await areas
    .getByRole('button', { name: 'Confirmar exclusão da área', exact: true })
    .click();
  await areas
    .getByRole('button', { name: 'Fechar diálogo', exact: true })
    .click();
  await page.goto(url);
  await expect(
    page.getByText('Geral · Sem repetição', { exact: false }),
  ).toBeVisible();
  await create(page, 'Uma ideia simples');
  await expect(
    page.getByRole('button', { name: 'Concluir missão', exact: true }),
  ).toBeEnabled();
  await page
    .getByRole('button', { name: 'Editar missão', exact: true })
    .click();
  await edit
    .getByRole('combobox', { name: 'Recorrência', exact: true })
    .selectOption('weekdays');
  await edit.getByRole('checkbox', { name: 'Quarta', exact: true }).check();
  await edit
    .getByRole('combobox', { name: 'Recorrência', exact: true })
    .selectOption('weekly');
  await edit
    .getByRole('button', { name: 'Salvar missão', exact: true })
    .click();
  await expect(edit).not.toBeVisible();
  const weekly = await backup(page);
  expect(
    weekly.data.tasks.find(
      (task: { title: string }) => task.title === 'Uma ideia simples',
    ).recurrence,
  ).toMatchObject({ kind: 'weekly', days: [1] });
});

test('rotina persiste por data, impede duplicação entre abas, preserva histórico e integra recompensa e backup', async ({
  page,
  context,
}, info) => {
  const url = await create(page, 'Lavar a louça', async (form) => {
    await form
      .getByRole('combobox', { name: 'Recorrência', exact: true })
      .selectOption('daily');
  });
  const other = await context.newPage();
  await other.clock.setFixedTime(new Date('2026-11-02T10:00:00-03:00'));
  await other.goto(url);
  for (const tab of [page, other])
    await expect(
      tab.getByRole('button', { name: 'Concluir missão', exact: true }),
    ).toBeEnabled();
  await Promise.all(
    [page, other].map((tab) =>
      tab
        .getByRole('button', { name: 'Concluir missão', exact: true })
        .evaluate((button: HTMLButtonElement) => button.click()),
    ),
  );
  await expect(
    page.getByRole('region', { name: 'Resumo da recompensa' }),
  ).toBeVisible();
  await capture(page, info.project.name, 'recompensa');
  const first = await backup(page);
  expect(
    first.data.activityEvents.filter(
      (event: { kind: string }) => event.kind === 'task',
    ),
  ).toHaveLength(1);
  await page.clock.setFixedTime(new Date('2026-11-03T10:00:00-03:00'));
  await page.goto('/');
  await expect(
    page.getByRole('region', { name: 'Lista de missões', exact: true }),
  ).toContainText('Lavar a louça');
  await capture(page, info.project.name, 'home-novo-dia');
  await page.goto(url);
  await expect(
    page.getByRole('button', { name: 'Concluir missão', exact: true }),
  ).toBeEnabled();
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('region', { name: 'Resumo da recompensa' }),
  ).toBeVisible();
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Concluídas', exact: true }).click();
  const history = page.getByRole('region', {
    name: 'Histórico de conclusões',
    exact: true,
  });
  await expect(
    history.getByRole('link', { name: 'Lavar a louça', exact: true }),
  ).toHaveCount(2);
  await capture(page, info.project.name, 'historico');
  await history
    .getByRole('button', {
      name: 'Desfazer Lavar a louça de 02/11/2026',
      exact: true,
    })
    .click();
  await page
    .getByRole('button', { name: 'Confirmar correção', exact: true })
    .click();
  await expect(history).toContainText('Corrigida');
  await page.goto(url);
  await expect(
    page.getByRole('region', { name: 'Resumo da recompensa' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Editar missão', exact: true })
    .click();
  const edit = page.getByRole('dialog', { name: 'Editar missão', exact: true });
  await edit.getByLabel('O que você quer fazer?').fill('Cuidar da cozinha');
  await edit
    .getByRole('combobox', { name: 'Recorrência', exact: true })
    .selectOption('weekdays');
  await edit.getByRole('checkbox', { name: 'Quarta', exact: true }).check();
  await capture(page, info.project.name, 'recorrencia');
  await expect(
    edit.getByRole('combobox', { name: 'Recorrência', exact: true }),
  ).toHaveValue('weekdays');
  await edit
    .getByRole('button', { name: 'Salvar missão', exact: true })
    .click();
  // The modal only closes after the IndexedDB definition transaction commits.
  await expect(edit).not.toBeVisible();
  const copy = await backup(page);
  expect(copy.data.tasks).toHaveLength(1);
  expect(copy.data.tasks[0].recurrence.kind).toBe('weekdays');
  expect(
    copy.data.activityEvents.filter(
      (event: { kind: string }) => event.kind === 'task',
    ),
  ).toHaveLength(2);
  await page.locator('input[type="file"]').setInputFiles({
    name: 'organizador.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(copy)),
  });
  await confirmBackupImport(page);
  const restored = await backup(page);
  expect(restored.data.profile.totalXpEarned).toBe(
    copy.data.profile.totalXpEarned,
  );
  expect(restored.data.activityEvents).toEqual(copy.data.activityEvents);
  await other.close();
});

test('hoje, amanhã, outra data e dias da semana mostram agenda real em desktop e celular', async ({
  page,
}, info) => {
  await create(page, 'Estudar uma ideia', async (form) => {
    await form
      .getByRole('combobox', { name: 'Recorrência', exact: true })
      .selectOption('weekdays');
    await form.getByRole('checkbox', { name: 'Quarta', exact: true }).check();
  });
  await create(page, 'Treinar amanhã', async (form) => {
    await form.getByRole('button', { name: 'Amanhã', exact: true }).click();
  });
  await create(page, 'Consulta futura', async (form) => {
    await form.getByRole('button', { name: 'Outra data', exact: true }).click();
    await form.getByLabel('Data planejada', { exact: true }).fill('2026-12-08');
  });
  await create(page, 'Ideia sem compromisso', async (form) => {
    await form.getByRole('button', { name: 'Sem data', exact: true }).click();
  });
  await page.goto('/');
  const home = page.getByRole('region', {
    name: 'Suas missões',
    exact: true,
  });
  await expect(home).toContainText('Estudar uma ideia');
  await expect(home).not.toContainText('Treinar amanhã');
  await expect(home).not.toContainText('Consulta futura');
  await expect(home).not.toContainText('Ideia sem compromisso');
  await page.goto('/missoes');
  const list = page.getByRole('region', {
    name: 'Lista de missões',
    exact: true,
  });
  await expect(
    list.getByRole('link', { name: 'Estudar uma ideia', exact: true }),
  ).toBeVisible();
  await expect(
    list.getByRole('link', { name: 'Treinar amanhã', exact: true }),
  ).toHaveCount(0);
  await capture(page, info.project.name, 'hoje');
  await page.getByRole('button', { name: 'Próximas', exact: true }).click();
  await expect(list).toContainText('Treinar amanhã');
  await expect(list).toContainText('08/12/2026');
  await capture(page, info.project.name, 'proximas');
  await page.getByRole('button', { name: 'Todas', exact: true }).click();
  await expect(list.getByRole('link')).toHaveCount(4);
  await page
    .getByLabel('Buscar missão', { exact: true })
    .fill('sem compromisso');
  await expect(list.getByRole('link')).toHaveCount(1);
  await page
    .getByRole('button', { name: 'Limpar filtros', exact: true })
    .click();
  await page.getByText('Mais filtros', { exact: true }).click();
  await page
    .getByRole('checkbox', { name: 'Agrupar por área', exact: true })
    .check();
  await expect(
    list.getByRole('heading', { name: 'Geral', exact: true }),
  ).toBeVisible();
  if (info.project.name === 'mobile') {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.evaluate(
      () => (document.documentElement.style.fontSize = '200%'),
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
