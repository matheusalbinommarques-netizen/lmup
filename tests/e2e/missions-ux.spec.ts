import { fillMissionSteps, chooseTracking } from './mission-form';
import { expect, test, type Page } from '@playwright/test';

async function create(page: Page, title = 'Missão de avaliação') {
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const form = page.getByRole('dialog', {
    name: 'Uma nova missão',
    exact: true,
  });
  await form.getByLabel('O que você quer fazer?').fill(title);
  await form.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await expect(form).not.toBeVisible();
}
async function edit(page: Page, title = 'Missão de avaliação') {
  await page.getByLabel(`Ações para ${title}`, { exact: true }).click();
  await page
    .getByRole('dialog', { name: `Menu: Ações para ${title}`, exact: true })
    .getByRole('button', { name: 'Editar missão', exact: true })
    .click();
  return page.getByRole('dialog', { name: 'Editar missão', exact: true });
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
}

test('navegação principal e ferramentas preservam todos os destinos', async ({
  page,
}) => {
  await create(page);
  const nav = page.getByRole('navigation', {
    name: 'Visualização das missões',
  });
  await expect(nav.getByRole('button')).toHaveCount(4);
  for (const name of ['Agenda', 'Rotinas', 'Áreas', 'Lista']) {
    await nav.getByRole('button', { name, exact: true }).click();
    await expect(
      nav.getByRole('button', { name, exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    await noOverflow(page);
  }
  for (const name of [
    'Recuperar ocorrências',
    'Sessões salvas',
    'Arquivadas',
  ]) {
    await page
      .getByRole('button', { name: 'Ferramentas de missões', exact: true })
      .click();
    await page
      .getByRole('dialog', {
        name: 'Menu: Ferramentas de missões',
        exact: true,
      })
      .getByRole('button', { name, exact: true })
      .click();
    await expect(
      page.getByRole('dialog', {
        name: 'Menu: Ferramentas de missões',
        exact: true,
      }),
    ).not.toBeVisible();
    await noOverflow(page);
  }
  await nav.getByRole('button', { name: 'Lista', exact: true }).click();
  await page.getByRole('button', { name: 'Pendentes', exact: true }).click();
  await page.getByText('Mais filtros', { exact: false }).click();
  await page.getByLabel('Filtrar por data').selectOption('undated');
  await expect(
    page.getByRole('link', { name: 'Missão de avaliação', exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Limpar filtros', exact: true })
    .click();
  await expect(
    page.getByRole('link', { name: 'Missão de avaliação', exact: true }),
  ).toBeVisible();
});

test('menu ancorado não desloca a linha e fecha por Escape ou clique fora', async ({
  page,
}) => {
  await create(page);
  const row = page.locator('.mission-task-row');
  const trigger = page.getByLabel('Ações para Missão de avaliação', {
    exact: true,
  });
  const before = await row.boundingBox();
  await trigger.focus();
  await trigger.press('ArrowDown');
  const menu = page.getByRole('dialog', {
    name: 'Menu: Ações para Missão de avaliação',
    exact: true,
  });
  await expect(menu).toBeVisible();
  expect((await row.boundingBox())!.height).toBe(before!.height);
  await expect(
    menu.getByRole('button', { name: 'Editar missão', exact: true }),
  ).toBeFocused();
  await menu.press('Escape');
  await expect(menu).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page
    .getByRole('heading', { name: 'Lista de Missões', exact: true })
    .click();
  await expect(menu).not.toBeVisible();
  await noOverflow(page);
});

test('formulário preserva valores entre seções, edição e recarga', async ({
  page,
}) => {
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const form = page.getByRole('dialog', {
    name: 'Uma nova missão',
    exact: true,
  });
  await form.getByLabel('O que você quer fazer?').fill('Ler com atenção');
  await form
    .getByLabel('Descrição (opcional)', { exact: true })
    .fill('Preservar o rascunho completo');
  await form.getByLabel('Esforço desta missão').selectOption('medium');
  await form.getByRole('tab', { name: 'Planejamento', exact: true }).click();
  await expect(form.getByLabel('O que você quer fazer?')).not.toBeVisible();
  await form.getByRole('button', { name: 'Amanhã', exact: true }).click();
  await form.getByLabel('Recorrência', { exact: false }).selectOption('daily');
  await form.getByLabel('Início desejado', { exact: true }).fill('09:30');
  await form.getByLabel('Importância', { exact: false }).selectOption('high');
  await form.getByLabel('Prazo final opcional').fill('2026-11-15T18:00');
  await form.getByRole('tab', { name: 'Acompanhamento', exact: true }).click();
  await form.getByLabel('Duração estimada (minutos)').fill('30');
  await chooseTracking(form, 'quantity');
  await form.getByLabel('Quantidade da meta').fill('20');
  await form.getByLabel('Unidade (páginas, exercícios…)').fill('páginas');
  await form
    .getByRole('tab', { name: 'Passos e detalhes', exact: true })
    .click();
  await fillMissionSteps(form, 'Escolher capítulo\nAnotar ideias');
  await form.getByLabel('Fixar missão em destaque').check();
  await form.getByRole('tab', { name: 'Geral', exact: true }).click();
  await expect(
    form.getByLabel('Descrição (opcional)', { exact: true }),
  ).toHaveValue('Preservar o rascunho completo');
  await expect(form.locator('.save-summary')).toHaveCount(0);
  await form.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await expect(form).not.toBeVisible();
  await page.reload();
  const editor = await edit(page, 'Ler com atenção');
  await expect(
    editor.getByRole('tab', { name: 'Geral', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(editor.getByLabel('Esforço desta missão')).toHaveValue('medium');
  await editor
    .getByLabel('O que você quer fazer?')
    .fill('Ler com atenção editada');
  await expect(editor.locator('.save-summary')).toHaveCount(0);
  await editor.getByRole('tab', { name: 'Planejamento', exact: true }).click();
  await expect(
    editor.getByLabel('Início desejado', { exact: true }),
  ).toHaveValue('09:30');
  await expect(editor.getByLabel('Recorrência', { exact: false })).toHaveValue(
    'daily',
  );
  await expect(editor.getByLabel('Importância', { exact: false })).toHaveValue(
    'high',
  );
  await expect(editor.getByLabel('Prazo final opcional')).toHaveValue(
    '2026-11-15T18:00',
  );
  await editor
    .getByRole('tab', { name: 'Acompanhamento', exact: true })
    .click();
  await expect(editor.getByLabel('Quantidade da meta')).toHaveValue('20');
  await expect(editor.getByLabel('Duração estimada (minutos)')).toHaveValue(
    '30',
  );
  await editor
    .getByRole('tab', { name: 'Passos e detalhes', exact: true })
    .click();
  await expect(
    editor.getByRole('textbox', { name: 'Passo 1', exact: true }),
  ).toHaveValue('Escolher capítulo');
  await expect(
    editor.getByRole('textbox', { name: 'Passo 2', exact: true }),
  ).toHaveValue('Anotar ideias');
  await editor
    .getByRole('button', { name: 'Salvar missão', exact: true })
    .click();
  await expect(editor).not.toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Ler com atenção editada', exact: true }),
  ).toBeVisible();
  await noOverflow(page);
});

test('criação mínima, Microação e salvar outra mantêm padrões e validação', async ({
  page,
}) => {
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const form = page.getByRole('dialog', {
    name: 'Uma nova missão',
    exact: true,
  });
  await expect(form.locator('.save-summary')).toHaveCount(0);
  await expect(form.locator('.save-summary')).toHaveCount(0);
  await form.getByRole('tab', { name: 'Planejamento', exact: true }).click();
  await form.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await expect(form.getByLabel('O que você quer fazer?')).toBeFocused();
  await expect(form.getByRole('alert')).toContainText('nome');
  await form.getByLabel('O que você quer fazer?').fill('Beber água');
  await form.getByLabel('Esforço desta missão').selectOption('micro');
  await expect(form.locator('.reward-preview')).toContainText('+5 Ouro');
  await form
    .getByRole('button', { name: 'Salvar e criar outra', exact: true })
    .click();
  await expect(form.getByLabel('O que você quer fazer?')).toHaveValue('');
  await expect(form.getByLabel('O que você quer fazer?')).toBeFocused();
  await expect(form.getByLabel('Esforço desta missão')).toHaveValue('micro');
  await expect(form.getByRole('status')).toContainText('Beber água');
  await form.getByLabel('O que você quer fazer?').fill('Comer uma fruta');
  await form.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await expect(form).not.toBeVisible();
  await expect(page.locator('.mission-task-row')).toHaveCount(2);
  await noOverflow(page);
});

test('área criada em diálogo aninhado preserva o rascunho e o ícone herdado', async ({
  page,
}) => {
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const form = page.getByRole('dialog', {
    name: 'Uma nova missão',
    exact: true,
  });
  await form.getByLabel('O que você quer fazer?').fill('Cuidar da casa');
  await form
    .getByRole('button', { name: 'Gerenciar áreas', exact: true })
    .click();
  const areas = page.getByRole('dialog', { name: 'Minhas áreas', exact: true });
  await areas.getByLabel('Nome da nova área').fill('Casa');
  await areas.getByRole('button', { name: 'Criar área', exact: true }).click();
  await expect(
    areas.getByRole('button', { name: 'Editar Casa', exact: true }),
  ).toBeVisible();
  await areas
    .getByRole('button', { name: 'Fechar diálogo', exact: true })
    .click();
  await expect(form.getByLabel('O que você quer fazer?')).toHaveValue(
    'Cuidar da casa',
  );
  await expect(
    form.getByRole('combobox', { name: 'Área', exact: true }),
  ).not.toHaveValue('0');
  await form.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await page.getByRole('button', { name: 'Áreas', exact: true }).click();
  await expect(
    page.getByRole('region', { name: 'Gerenciar áreas', exact: true }),
  ).toContainText('Casa');
  await noOverflow(page);
});

test('histórico filtra a data realizada e mantém conclusão consultável', async ({
  page,
}) => {
  await create(page);
  await page
    .getByRole('button', { name: 'Concluir Missão de avaliação', exact: true })
    .click();
  await expect(page).toHaveURL(/\/missoes$/);
  await expect(
    page.getByRole('status', { name: 'Recompensa da conclusão' }),
  ).toBeVisible();
  await page.goto('/missoes');
  await expect(
    page.getByRole('link', { name: 'Missão de avaliação', exact: true }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Todas', exact: true }).click();
  await expect(
    page.getByRole('link', { name: 'Missão de avaliação', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Concluídas', exact: true }).click();
  await expect(
    page.getByRole('region', { name: 'Histórico de conclusões', exact: true }),
  ).toContainText('Missão de avaliação');
  await page.getByLabel('De', { exact: true }).fill('2099-01-01');
  await expect(
    page.getByRole('region', { name: 'Histórico de conclusões', exact: true }),
  ).toContainText('Nenhuma conclusão');
  await page
    .getByRole('button', { name: 'Limpar filtros', exact: true })
    .click();
  await expect(
    page.getByRole('region', { name: 'Histórico de conclusões', exact: true }),
  ).toContainText('Missão de avaliação');
  await noOverflow(page);
});
