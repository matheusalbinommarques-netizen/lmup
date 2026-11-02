import { expect, test, type Page } from '@playwright/test';

async function prepare(page: Page) {
  await page.goto('/missoes?view=areas');
  const areas = page.getByRole('region', {
    name: 'Gerenciar áreas',
    exact: true,
  });
  for (const name of ['Saúde', 'Casa']) {
    await areas.getByLabel('Nome da nova área').fill(name);
    await areas
      .getByRole('button', { name: 'Criar área', exact: true })
      .click();
    await expect(
      page.getByRole('button', { name: `Editar ${name}`, exact: true }),
    ).toBeVisible();
  }
  await page.getByRole('button', { name: 'Rotinas', exact: true }).click();
  await page.getByRole('button', { name: 'Nova rotina', exact: true }).click();
  const routine = page.locator('.routine-form');
  await routine
    .getByLabel('Nome da rotina', { exact: true })
    .fill('Cuidados da manhã');
  await routine
    .getByLabel('Área padrão para novas missões')
    .selectOption({ label: 'Saúde' });
  return routine;
}
async function add(page: Page, title: string) {
  await page
    .getByRole('button', { name: 'Criar missão na rotina', exact: true })
    .click();
  const form = page.getByRole('dialog', {
    name: 'Uma nova missão',
    exact: true,
  });
  await expect(
    form
      .getByRole('combobox', { name: 'Área', exact: true })
      .locator('option:checked'),
  ).toHaveText('Saúde');
  await form.getByLabel('O que você quer fazer?').fill(title);
  await form.getByLabel('Esforço desta missão').selectOption('micro');
  await form.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await expect(form).not.toBeVisible();
  await expect(page.locator('.routine-sequence')).toContainText(title);
}

test('área padrão, três heranças e edição aninhada preservam rascunho e persistência', async ({
  page,
}) => {
  const routine = await prepare(page);
  for (const title of ['Beber água', 'Comer uma fruta', 'Arrumar a cama'])
    await add(page, title);
  await expect(
    routine.getByLabel('Nome da rotina', { exact: true }),
  ).toHaveValue('Cuidados da manhã');
  await expect(routine.locator('.routine-sequence li')).toHaveCount(3);
  await routine
    .getByRole('button', { name: 'Editar Arrumar a cama', exact: true })
    .click();
  const edit = page.getByRole('dialog', { name: 'Editar missão', exact: true });
  await edit
    .getByRole('combobox', { name: 'Área', exact: true })
    .selectOption({ label: 'Casa' });
  await edit
    .getByLabel('Descrição (opcional)', { exact: true })
    .fill('Uma pequena ação para começar bem.');
  await edit
    .getByRole('button', { name: 'Salvar missão', exact: true })
    .click();
  await expect(edit).not.toBeVisible();
  await expect(
    routine
      .locator('.routine-sequence li')
      .filter({ hasText: 'Arrumar a cama' }),
  ).toContainText('Casa');
  await routine
    .getByRole('button', { name: 'Editar Beber água', exact: true })
    .click();
  await edit.getByLabel('O que você quer fazer?').fill('Rascunho cancelado');
  await edit.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(routine.locator('.routine-sequence')).toContainText(
    'Beber água',
  );
  await expect(routine.locator('.routine-sequence')).not.toContainText(
    'Rascunho cancelado',
  );
  await routine
    .getByRole('button', { name: 'Salvar rotina', exact: true })
    .click();
  await expect(routine).not.toBeVisible();
  await page.reload();
  await page
    .getByRole('button', { name: 'Editar rotina', exact: true })
    .click();
  await expect(
    routine
      .getByLabel('Área padrão para novas missões')
      .locator('option:checked'),
  ).toHaveText('Saúde');
  await routine
    .getByLabel('Área padrão para novas missões')
    .selectOption({ label: 'Casa' });
  await routine
    .getByRole('button', { name: 'Salvar rotina', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Editar rotina', exact: true })
    .click();
  await expect(
    routine
      .getByLabel('Área padrão para novas missões')
      .locator('option:checked'),
  ).toHaveText('Casa');
  for (const title of ['Beber água', 'Comer uma fruta'])
    await expect(
      routine.locator('.routine-sequence li').filter({ hasText: title }),
    ).toContainText('Saúde');
  await expect(
    routine
      .locator('.routine-sequence li')
      .filter({ hasText: 'Arrumar a cama' }),
  ).toContainText('Casa');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});

test('edição de missão vinculada preserva a configuração da sessão iniciada', async ({
  page,
}) => {
  const routine = await prepare(page);
  await add(page, 'Beber água');
  await routine
    .getByRole('button', { name: 'Salvar rotina', exact: true })
    .click();
  await page
    .locator('.routine-card')
    .getByText('Mais ações', { exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Executar rotina', exact: true })
    .click();
  await expect(page).toHaveURL(/\/sessoes$/);
  await page.getByRole('link', { name: 'Pausar sessão', exact: true }).click();
  await page.getByRole('button', { name: 'Rotinas', exact: true }).click();
  await page
    .getByRole('button', { name: 'Editar rotina', exact: true })
    .click();
  await routine
    .getByRole('button', { name: 'Editar Beber água', exact: true })
    .click();
  const edit = page.getByRole('dialog', { name: 'Editar missão', exact: true });
  await edit
    .getByLabel('O que você quer fazer?')
    .fill('Beber água com atenção');
  await edit.getByLabel('Esforço desta missão').selectOption('medium');
  await expect(edit.locator('.reward-preview')).toContainText('+50 Ouro');
  await edit.getByRole('tab', { name: 'Planejamento', exact: true }).click();
  await expect(edit.getByLabel('Recorrência', { exact: false })).toBeDisabled();
  await expect(
    edit.getByLabel('Início desejado', { exact: true }),
  ).toBeDisabled();
  await edit
    .getByRole('button', { name: 'Salvar missão', exact: true })
    .click();
  await expect(routine.locator('.routine-sequence')).toContainText(
    'Beber água com atenção',
  );
  await routine.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await page
    .getByRole('button', { name: 'Ferramentas de missões', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Sessões salvas', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Retomar sessão', exact: true })
    .click();
  await page
    .getByText('Configuração desta execução preservada', { exact: true })
    .click();
  await expect(
    page.getByText('Esta execução mantém a configuração anterior', {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Beber água', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Execução detalhada', exact: true })
    .click();
  await expect(page.locator('.occurrence-execution')).not.toContainText(
    'Beber água com atenção',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});
