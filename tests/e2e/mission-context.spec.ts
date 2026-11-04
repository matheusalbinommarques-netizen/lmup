import { chooseTracking } from './mission-form';
import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { confirmBackupImport } from './backup-ui';

async function create(page: Page, title = 'Missão pessoal') {
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const form = page.getByRole('dialog', {
    name: 'Uma nova missão',
    exact: true,
  });
  await form.getByLabel('O que você quer fazer?').fill(title);
  await form.getByLabel('Esforço desta missão').selectOption('micro');
  await form.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await expect(form).not.toBeVisible();
}
async function state(page: Page) {
  return page.evaluate(
    () =>
      new Promise<Record<string, any[]>>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onsuccess = () => {
          const db = request.result,
            names = [
              'tasks',
              'profile',
              'occurrences',
              'activityEvents',
              'savedMissionSessions',
            ];
          const tx = db.transaction(names, 'readonly'),
            data: Record<string, any[]> = {};
          for (const name of names) {
            const query = tx.objectStore(name).getAll();
            query.onsuccess = () => (data[name] = query.result);
          }
          tx.oncomplete = () => {
            db.close();
            resolve(data);
          };
          tx.onerror = () => reject(tx.error);
        };
        request.onerror = () => reject(request.error);
      }),
  );
}
async function action(page: Page, title: string, name: string) {
  await page
    .getByRole('button', { name: `Ações para ${title}`, exact: true })
    .click();
  await page
    .getByRole('dialog', { name: `Menu: Ações para ${title}`, exact: true })
    .getByRole('button', { name, exact: true })
    .click();
  return page.getByRole('dialog', { name: 'Remover missão', exact: true });
}

test('concluir na Lista preserva URL, busca, aba e recompensa no contexto', async ({
  page,
}) => {
  await create(page, 'Lista · Beber água');
  await create(page, 'Outra missão');
  await page.getByRole('button', { name: 'Todas', exact: true }).click();
  await page
    .getByRole('searchbox', { name: 'Buscar missão', exact: true })
    .fill('Lista');
  const url = page.url();
  await page
    .getByRole('button', { name: 'Concluir Lista · Beber água', exact: true })
    .click();
  await expect(page).toHaveURL(url);
  await expect(
    page.getByRole('button', { name: 'Todas', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.getByRole('searchbox', { name: 'Buscar missão', exact: true }),
  ).toHaveValue('Lista');
  await expect(
    page.getByRole('status', { name: 'Recompensa da conclusão' }),
  ).toContainText('+5 Ouro');
  expect((await state(page)).activityEvents).toHaveLength(1);
  await page.getByRole('button', { name: 'Pendentes', exact: true }).click();
  await expect(page.locator('.mission-task-row')).toHaveCount(0);
  await expect(page).toHaveURL(url);
});

for (const archived of [false, true])
  test(`exclusão real ${archived ? 'arquivada' : 'ativa'} com histórico preserva saldos e outra aba`, async ({
    page,
    context,
  }) => {
    await create(page);
    await create(page, 'Outra missão preservada');
    await page
      .getByRole('button', { name: 'Concluir Missão pessoal', exact: true })
      .click();
    await expect(
      page.getByRole('status', { name: 'Recompensa da conclusão' }),
    ).toBeVisible();
    await page
      .getByRole('button', {
        name: 'Fechar feedback de conclusão',
        exact: true,
      })
      .click();
    await page.getByRole('button', { name: 'Todas', exact: true }).click();
    if (archived) {
      const archive = await action(page, 'Missão pessoal', 'Arquivar missão');
      await archive
        .getByRole('button', { name: 'Arquivar missão', exact: true })
        .click();
      await expect(archive).not.toBeVisible();
      await page
        .getByRole('button', { name: 'Ferramentas de missões', exact: true })
        .click();
      await page
        .getByRole('button', { name: 'Arquivadas', exact: true })
        .click();
    }
    const before = await state(page),
      url = page.url();
    const other = await context.newPage();
    await other.goto('/missoes');
    await other.getByRole('button', { name: 'Todas', exact: true }).click();
    const dialog = await action(
      page,
      'Missão pessoal',
      'Excluir definitivamente',
    );
    await expect(dialog).toContainText('irreversível');
    await expect(dialog).toContainText('recibos contábeis');
    expect((await state(page)).tasks).toHaveLength(2);
    await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click();
    expect((await state(page)).tasks).toHaveLength(2);
    const confirmation = await action(
      page,
      'Missão pessoal',
      'Excluir definitivamente',
    );
    await confirmation
      .getByRole('button', { name: 'Excluir definitivamente', exact: true })
      .click();
    await expect(confirmation).not.toBeVisible();
    await expect(page).toHaveURL(url);
    await expect(
      other.getByRole('link', { name: 'Missão pessoal', exact: true }),
    ).toHaveCount(0);
    await page.reload();
    const after = await state(page);
    expect(after.tasks).toHaveLength(1);
    expect(after.tasks[0].title).toBe('Outra missão preservada');
    expect(
      after.occurrences.filter(
        (row) =>
          row.taskId ===
          before.tasks.find((row) => row.title === 'Missão pessoal').id,
      ),
    ).toHaveLength(0);
    for (const field of ['totalXpEarned', 'gold', 'food', 'level'])
      expect(after.profile[0][field]).toBe(before.profile[0][field]);
    expect(after.activityEvents).toHaveLength(before.activityEvents.length);
    expect(after.activityEvents[0].taskId).toBeUndefined();
    expect(after.activityEvents[0].taskTitle).toBeUndefined();
    await other.close();
  });

test('execução individual iniciada em Hoje conclui e exclui sem mudar de página', async ({
  page,
}) => {
  await create(page);
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Começar missão', exact: true })
    .click();
  await expect(page).toHaveURL(/\/missao\/\d+$/);
  const url = page.url();
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('region', { name: 'Resumo da recompensa' }),
  ).toContainText('Missão concluída!');
  await expect(page).toHaveURL(url);
  await page
    .getByRole('button', { name: 'Excluir definitivamente', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Remover missão',
    exact: true,
  });
  await dialog
    .getByRole('button', { name: 'Excluir definitivamente', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Missão não encontrada', exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(url);
});

test('restaurar arquivo anterior não ressuscita a missão excluída nem perde outra missão', async ({
  page,
}) => {
  await create(page);
  await create(page, 'Outra missão preservada');
  await page
    .getByRole('button', { name: 'Concluir Missão pessoal', exact: true })
    .click();
  await expect(
    page.getByRole('status', { name: 'Recompensa da conclusão' }),
  ).toBeVisible();
  await page.goto('/config');
  const download = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Exportar dados', exact: true })
    .click();
  const old = await readFile((await (await download).path())!);
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Todas', exact: true }).click();
  const dialog = await action(
    page,
    'Missão pessoal',
    'Excluir definitivamente',
  );
  await dialog
    .getByRole('button', { name: 'Excluir definitivamente', exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  const before = await state(page);
  await page.goto('/config');
  await page.locator('input[type="file"]').setInputFiles({
    name: 'anterior.json',
    mimeType: 'application/json',
    buffer: old,
  });
  await expect(
    page.getByRole('dialog', { name: 'Importar este backup?', exact: true }),
  ).toContainText('continuarão excluídas');
  await confirmBackupImport(page);
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Todas', exact: true }).click();
  await expect(
    page.getByRole('link', { name: 'Missão pessoal', exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('link', { name: 'Outra missão preservada', exact: true }),
  ).toBeVisible();
  const after = await state(page);
  for (const field of ['totalXpEarned', 'gold', 'food', 'level'])
    expect(after.profile[0][field]).toBe(before.profile[0][field]);
});

test('execução aberta pela Agenda registra conclusão sem navegação', async ({
  page,
}) => {
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const form = page.getByRole('dialog', {
    name: 'Uma nova missão',
    exact: true,
  });
  await form.getByLabel('O que você quer fazer?').fill('Progresso percentual');
  await form.getByRole('tab', { name: 'Acompanhamento', exact: true }).click();
  await chooseTracking(form, 'percentage');
  await form.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await expect(form).not.toBeVisible();
  await page.getByRole('button', { name: 'Agenda', exact: true }).click();
  await page
    .getByRole('button', { name: 'Executar agora', exact: true })
    .click();
  await expect(page).toHaveURL(/\/ocorrencia\//);
  const url = page.url();
  await page.getByLabel('Porcentagem realizada').fill('100');
  await page
    .getByRole('button', { name: 'Registrar progresso', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Confirmar registro', exact: true })
    .click();
  await expect(
    page.getByText('100% · Concluída', { exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(url);
});

test('rotina e sessão permanecem na atividade até o avanço explícito', async ({
  page,
}) => {
  await create(page, 'Primeira atividade');
  await create(page, 'Segunda atividade');
  await page.getByRole('button', { name: 'Rotinas', exact: true }).click();
  await page.getByRole('button', { name: 'Nova rotina', exact: true }).click();
  await page
    .getByLabel('Nome da rotina', { exact: true })
    .fill('Minha sequência');
  await page.getByText('Adicionar missão existente', { exact: true }).click();
  for (const name of ['Primeira atividade', 'Segunda atividade'])
    await page
      .locator('.mission-results')
      .getByRole('button')
      .filter({ hasText: name })
      .click();
  await page
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
  const url = page.url();
  await page
    .getByRole('button', { name: 'Execução detalhada', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('region', { name: 'Resumo da recompensa' }),
  ).toBeVisible();
  await expect(page).toHaveURL(url);
  expect((await state(page)).savedMissionSessions[0].cursor).toBe(0);
  await page
    .getByRole('button', { name: 'Próxima missão', exact: true })
    .click();
  await expect
    .poll(async () => (await state(page)).savedMissionSessions[0].cursor)
    .toBe(1);
  await expect(page).toHaveURL(url);
});
