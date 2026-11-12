import { test, expect, type Page } from '@playwright/test';
import { fillMissionSteps, chooseTracking } from './mission-form';
async function mission(page: Page, title: string, area?: string) {
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const form = page.getByRole('dialog', {
    name: 'Uma nova missão',
    exact: true,
  });
  await form.getByLabel('O que você quer fazer?').fill(title);
  if (area)
    await form
      .getByRole('combobox', { name: 'Área', exact: true })
      .selectOption({ label: area });
  return form;
}
async function stored(page: Page) {
  return page.evaluate(
    () =>
      new Promise<Record<string, any[]>>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onsuccess = () => {
          const db = request.result,
            names = [
              'tasks',
              'areas',
              'routines',
              'profile',
              'activityEvents',
              'occurrences',
              'savedMissionSessions',
            ],
            tx = db.transaction(names),
            data: Record<string, any[]> = {};
          for (const name of names) {
            const q = tx.objectStore(name).getAll();
            q.onsuccess = () => (data[name] = q.result);
          }
          tx.oncomplete = () => {
            db.close();
            resolve(data);
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
  );
}
test('formulário simplificado, passos adicionáveis e edição preservam o acompanhamento', async ({
  page,
}) => {
  const form = await mission(page, 'Preparar a semana');
  await expect(form.locator('.save-summary')).toHaveCount(0);
  await form.getByRole('tab', { name: 'Acompanhamento', exact: true }).click();
  await expect(form.getByRole('radio')).toHaveCount(3);
  await expect(form.getByLabel('O que medir?', { exact: true })).toHaveCount(0);
  await chooseTracking(form, 'quantity');
  await form.getByLabel('Quantidade da meta').fill('12');
  await form.getByLabel('Unidade (páginas, exercícios…)').fill('páginas');
  await chooseTracking(form, 'steps');
  await form
    .getByRole('button', { name: 'Organizar passos', exact: true })
    .click();
  await fillMissionSteps(form, 'Escolher prioridades\nPlanejar horários');
  await form
    .getByRole('textbox', { name: 'Passo 2', exact: true })
    .press('Enter');
  await expect(
    form.getByRole('textbox', { name: 'Passo 3', exact: true }),
  ).toBeFocused();
  await form
    .getByRole('textbox', { name: 'Passo 3', exact: true })
    .fill('Separar materiais');
  await form
    .getByRole('button', { name: 'Mover passo 3 para cima', exact: true })
    .click();
  await expect(
    form.getByRole('textbox', { name: 'Passo 2', exact: true }),
  ).toHaveValue('Separar materiais');
  await form
    .getByRole('button', { name: 'Remover passo 1', exact: true })
    .click();
  await form.getByRole('tab', { name: 'Geral', exact: true }).click();
  await form
    .getByRole('tab', { name: 'Passos e detalhes', exact: true })
    .click();
  await expect(
    form.getByRole('textbox', { name: 'Passo 1', exact: true }),
  ).toHaveValue('Separar materiais');
  await form.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await expect(form).not.toBeVisible();
  await page
    .getByRole('link', { name: 'Preparar a semana', exact: true })
    .click();
  const finish = page.getByRole('button', {
    name: 'Concluir missão',
    exact: true,
  });
  await expect(finish).toBeDisabled();
  await page
    .getByRole('checkbox', { name: 'Separar materiais', exact: true })
    .check();
  await page
    .getByRole('checkbox', { name: 'Planejar horários', exact: true })
    .check();
  await expect(finish).toBeEnabled();
  await finish.click();
  await expect(
    page.getByRole('region', { name: 'Resumo da recompensa' }),
  ).toBeVisible();
  await page.reload();
  expect((await stored(page)).tasks[0].subtasks).toEqual([
    'Separar materiais',
    'Planejar horários',
  ]);
});
test('áreas editam descrição e ícone, transferem em lote e excluem preservando cadastros e rotina', async ({
  page,
}) => {
  await page.goto('/missoes?view=areas');
  const areas = page.getByRole('region', {
    name: 'Gerenciar áreas',
    exact: true,
  });
  const icon = areas.getByRole('button', {
      name: 'Editar ícone da área',
      exact: true,
    }),
    create = areas.getByRole('button', { name: 'Criar área', exact: true });
  const iconBox = await icon.boundingBox(),
    createBox = await create.boundingBox();
  if (page.viewportSize()!.width > 600)
    expect(iconBox!.x).toBeLessThan(createBox!.x);
  await icon.click();
  const picker = page.getByRole('dialog', {
    name: 'Escolher ícone da área',
    exact: true,
  });
  await picker.getByRole('button', { name: 'Exercício', exact: true }).click();
  await expect(picker).not.toBeVisible();
  await areas.getByLabel('Nome da nova área').fill('Saúde');
  await areas
    .getByLabel('Descrição da área (opcional)', { exact: true })
    .fill('Cuidados diários');
  await create.click();
  await expect(
    areas.getByText('Cuidados diários', { exact: true }),
  ).toBeVisible();
  await areas.getByLabel('Nome da nova área').fill('Casa');
  await create.click();
  await areas
    .getByRole('button', { name: 'Editar Saúde', exact: true })
    .click();
  const editor = areas
    .locator('form')
    .filter({ has: page.getByLabel('Novo nome de Saúde', { exact: true }) });
  await editor
    .getByLabel('Descrição da área (opcional)', { exact: true })
    .fill('Saúde e disposição');
  await editor
    .getByRole('button', { name: 'Salvar área', exact: true })
    .click();
  await expect(editor).not.toBeVisible();
  await expect(
    areas.getByText('Saúde e disposição', { exact: true }),
  ).toBeVisible();
  for (const title of ['Ativa', 'Concluída', 'Arquivada']) {
    const form = await mission(page, title, 'Saúde');
    await form
      .getByRole('button', { name: 'Criar missão', exact: true })
      .click();
    await expect(form).not.toBeVisible();
  }
  await page
    .getByRole('button', { name: 'Concluir Concluída', exact: true })
    .click();
  await page.getByRole('status', { name: 'Recompensa da conclusão' }).waitFor();
  await page
    .getByRole('button', { name: 'Ações para Arquivada', exact: true })
    .click();
  await page
    .getByRole('dialog', { name: 'Menu: Ações para Arquivada', exact: true })
    .getByRole('button', { name: 'Arquivar missão', exact: true })
    .click();
  await page
    .getByRole('dialog', { name: 'Remover missão', exact: true })
    .getByRole('button', { name: 'Arquivar missão', exact: true })
    .click();
  await page.getByRole('tab', { name: 'Rotinas', exact: true }).click();
  await page.getByRole('button', { name: 'Nova rotina', exact: true }).click();
  await page.getByLabel('Nome da rotina', { exact: true }).fill('Cuidados');
  await page
    .getByLabel('Área padrão para novas missões')
    .selectOption({ label: 'Saúde' });
  await page.getByText('Adicionar missão existente', { exact: true }).click();
  await page
    .locator('.mission-results')
    .getByRole('button')
    .filter({ hasText: 'Ativa' })
    .click();
  await page
    .getByRole('button', { name: 'Salvar rotina', exact: true })
    .click();
  await page.getByRole('tab', { name: 'Áreas', exact: true }).click();
  const before = await stored(page);
  await areas.getByLabel('Buscar área', { exact: true }).fill('Saúde');
  await expect(
    areas.getByText('Saúde e disposição', { exact: true }),
  ).toBeVisible();
  await expect(
    areas.getByRole('button', { name: 'Editar Casa', exact: true }),
  ).toHaveCount(0);
  await areas.getByLabel('Buscar área', { exact: true }).fill('');
  await areas.getByText('Transferir várias missões', { exact: true }).click();
  await areas.getByLabel('Transferir Concluída', { exact: true }).check();
  await areas.getByLabel('Transferir Arquivada', { exact: true }).check();
  await areas
    .getByRole('combobox', { name: 'Área de destino', exact: true })
    .selectOption({ label: 'Casa' });
  await areas
    .getByRole('button', { name: 'Revisar transferência (2)', exact: true })
    .click();
  await areas
    .getByRole('button', { name: 'Confirmar transferência', exact: true })
    .click();
  await expect
    .poll(
      async () =>
        (await stored(page)).tasks.filter(
          (t) => t.areaId === before.areas.find((a) => a.nome === 'Casa').id,
        ).length,
    )
    .toBe(2);
  await areas
    .getByRole('button', { name: 'Excluir Saúde', exact: true })
    .click();
  await expect(
    areas.getByRole('button', {
      name: 'Confirmar exclusão da área',
      exact: true,
    }),
  ).toBeDisabled();
  await areas
    .getByRole('combobox', { name: 'Transferir missões para', exact: true })
    .selectOption({ label: 'Casa' });
  await areas
    .getByRole('button', { name: 'Confirmar exclusão da área', exact: true })
    .click();
  await expect(
    areas.getByRole('button', { name: 'Editar Saúde', exact: true }),
  ).toHaveCount(0);
  await page.reload();
  const after = await stored(page),
    target = after.areas.find((a) => a.nome === 'Casa').id;
  expect(after.tasks.every((t) => t.areaId === target)).toBe(true);
  expect(after.routines[0].defaultAreaId).toBe(target);
  expect(after.profile).toEqual(before.profile);
  expect(after.activityEvents).toEqual(before.activityEvents);
  expect(after.occurrences).toEqual(before.occurrences);
  await page
    .getByRole('button', { name: 'Ver missões de Casa', exact: true })
    .click();
  await expect(
    page.getByRole('combobox', { name: 'Área', exact: true }),
  ).toHaveValue(String(target));
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});
test('execução detalhada prioriza conclusão e recompensa, mantendo notas e a sessão atual', async ({
  page,
}) => {
  const form = await mission(page, 'Ler no jardim');
  await form.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await expect(form).not.toBeVisible();
  await page
    .getByRole('button', { name: 'Selecionar para sessão', exact: true })
    .click();
  await page
    .getByLabel('Incluir Ler no jardim na sessão', { exact: true })
    .check();
  await page
    .getByRole('button', { name: 'Iniciar sessão', exact: true })
    .click();
  await page
    .getByRole('tab', { name: 'Execução detalhada', exact: true })
    .click();
  await expect(page.locator('.execution-reward')).toContainText('Ouro');
  await expect(
    page.getByRole('heading', {
      name: 'Um passo simples já conta.',
      exact: true,
    }),
  ).toHaveCount(0);
  const complete = page.getByRole('button', {
    name: 'Concluir missão',
    exact: true,
  });
  await complete.scrollIntoViewIfNeeded();
  const box = await complete.boundingBox();
  expect(box!.width).toBeGreaterThan(220);
  await page.locator('details.journey-notes > summary').click();
  await page
    .getByLabel('Notas da missão', { exact: true })
    .fill('Retomar pelo capítulo dois');
  await expect(
    page.getByText('Tudo salvo neste navegador', { exact: true }),
  ).toBeVisible();
  await complete.click();
  await expect(
    page.getByRole('heading', { name: 'Sessão concluída', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Resumo da sessão', exact: true }),
  ).toContainText('Ouro');
  await expect(page).toHaveURL(/\/sessoes$/);
  const completed = await stored(page);
  expect(completed.savedMissionSessions[0]).toMatchObject({
    status: 'ended',
    occurrenceIds: [],
  });
  await page.reload();
  expect((await stored(page)).tasks[0].executionNotes).toBe(
    'Retomar pelo capítulo dois',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});
