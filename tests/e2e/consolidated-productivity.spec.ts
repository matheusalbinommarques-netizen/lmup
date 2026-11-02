import { test, expect, type Page } from '@playwright/test';
import { chooseTracking } from './mission-form';
const today = '2026-11-02';
async function create(
  page: Page,
  title: string,
  time = false,
  future?: string,
) {
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const form = page.getByRole('dialog', {
    name: 'Uma nova missão',
    exact: true,
  });
  await form.getByLabel('O que você quer fazer?').fill(title);
  if (time) {
    await form
      .getByRole('tab', { name: 'Acompanhamento', exact: true })
      .click();
    await chooseTracking(form, 'time');
    await form.getByLabel('Meta de tempo recompensável (minutos)').fill('40');
  }
  if (future) {
    await form.getByRole('tab', { name: 'Planejamento', exact: true }).click();
    await form.getByRole('button', { name: 'Outra data', exact: true }).click();
    await form.getByLabel('Data planejada', { exact: true }).fill(future);
  }
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
              'occurrences',
              'profile',
              'activityEvents',
              'savedMissionSessions',
              'executionRecords',
            ],
            tx = db.transaction(names),
            out: Record<string, any[]> = {};
          for (const name of names) {
            const q = tx.objectStore(name).getAll();
            q.onsuccess = () => (out[name] = q.result);
          }
          tx.oncomplete = () => {
            db.close();
            resolve(out);
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
  );
}
async function homeAction(page: Page, title: string, action: string) {
  await page
    .getByRole('button', { name: `Ações de hoje para ${title}`, exact: true })
    .click();
  await page
    .getByRole('dialog', {
      name: `Menu: Ações de hoje para ${title}`,
      exact: true,
    })
    .getByRole('button', { name: action, exact: true })
    .click();
}
test('Hoje separa atividades antigas, conclusões realizadas e retirada persistente entre abas', async ({
  page,
  context,
}) => {
  await page.clock.setFixedTime(new Date('2026-11-01T15:00:00-03:00'));
  await create(page, 'Atividade antiga');
  await page.clock.setFixedTime(new Date(today + 'T15:00:00-03:00'));
  await create(page, 'Plano atual');
  await page.goto('/');
  await expect(
    page.getByRole('progressbar', {
      name: 'Ocorrências concluídas',
      exact: true,
    }),
  ).toHaveAttribute('aria-valuenow', '0');
  await page
    .getByText('Atividades de outros dias (1)', { exact: true })
    .click();
  await page
    .getByRole('button', {
      name: 'Organizar atividade antiga Atividade antiga',
      exact: true,
    })
    .click();
  await page
    .getByRole('button', { name: 'Retomar atividade', exact: true })
    .click();
  await expect(page).toHaveURL(/\/ocorrencia\//);
  await page
    .getByRole('combobox', { name: 'Conclusão', exact: true })
    .selectOption('1');
  await page
    .getByRole('button', { name: 'Registrar progresso', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Confirmar registro', exact: true })
    .click();
  await expect(
    page.getByText('100% · Concluída', { exact: true }),
  ).toBeVisible();
  await page.goto('/');
  await expect(
    page.getByRole('region', { name: 'Concluídas hoje', exact: true }),
  ).toContainText('Atividade antiga');
  await expect(
    page.getByRole('progressbar', {
      name: 'Ocorrências concluídas',
      exact: true,
    }),
  ).toHaveAttribute('aria-valuenow', '0');
  const other = await context.newPage();
  await other.clock.setFixedTime(new Date(today + 'T15:00:00-03:00'));
  await other.goto('/');
  const before = await state(page);
  await homeAction(page, 'Plano atual', 'Remover de hoje');
  await expect(
    page.getByRole('dialog', { name: 'Remover somente de hoje?', exact: true }),
  ).toHaveCount(0);
  await expect(page.locator('.next-mission')).not.toContainText('Plano atual');
  await expect(other.locator('.next-mission')).not.toContainText('Plano atual');
  await page.reload();
  await expect(page.locator('.next-mission')).not.toContainText('Plano atual');
  const after = await state(page);
  expect(after.profile).toEqual(before.profile);
  expect(after.activityEvents).toEqual(before.activityEvents);
  expect(after.tasks).toEqual(before.tasks);
  await page.getByText('Removidas de hoje (1)', { exact: true }).click();
  await page
    .getByRole('button', { name: 'Devolver a hoje', exact: true })
    .click();
  await expect(page.locator('.next-mission')).toContainText('Plano atual');
  await other.close();
});
test('reagendar atividade parcial preserva recursos e a seleção explica indisponibilidade', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date(today + 'T15:00:00-03:00'));
  await create(page, 'Leitura parcial', true);
  await page.getByRole('button', { name: 'Agenda', exact: true }).click();
  await page
    .getByRole('button', { name: 'Executar agora', exact: true })
    .click();
  await page.getByLabel('Minutos acumulados realizados').fill('10');
  await page
    .getByRole('button', { name: 'Registrar progresso', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Confirmar registro', exact: true })
    .click();
  await expect(
    page.getByText('25% · Parcialmente realizada', { exact: true }),
  ).toBeVisible();
  const before = await state(page);
  await page.goto('/');
  await homeAction(page, 'Leitura parcial', 'Reagendar');
  const dialog = page.getByRole('dialog', {
    name: 'Reagendar ocorrência',
    exact: true,
  });
  await dialog.getByLabel('Nova data', { exact: true }).fill('2026-11-03');
  await dialog
    .getByRole('button', { name: 'Confirmar reagendamento', exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  const after = await state(page);
  expect(after.profile).toEqual(before.profile);
  expect(after.activityEvents).toEqual(before.activityEvents);
  expect(after.occurrences[0]).toMatchObject({
    id: before.occurrences[0].id,
    originDate: today,
    plannedDate: '2026-11-03',
    value: 10,
    due: before.occurrences[0].due,
  });
  await page.goto('/missoes');
  await page
    .getByRole('button', { name: 'Selecionar para sessão', exact: true })
    .click();
  const selection = page.getByRole('dialog', {
    name: 'Montar sessão',
    exact: true,
  });
  await expect(
    selection.getByLabel('Incluir Leitura parcial na sessão', { exact: true }),
  ).toBeDisabled();
  await expect(selection).toContainText('Planejada para outra data');
  expect((await state(page)).occurrences).toEqual(after.occurrences);
});
test('rotina reutiliza sessão, identifica conclusão externa e mantém datas ao retomar no dia seguinte', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date(today + 'T15:00:00-03:00'));
  for (const title of ['Água', 'Alongamento']) await create(page, title);
  await page.getByRole('button', { name: 'Rotinas', exact: true }).click();
  await page.getByRole('button', { name: 'Nova rotina', exact: true }).click();
  const form = page.locator('.routine-form');
  await form
    .getByLabel('Nome da rotina', { exact: true })
    .fill('Rotina diária');
  await form
    .getByRole('combobox', { name: 'Recorrência da rotina', exact: true })
    .selectOption('daily');
  await form.getByText('Adicionar missão existente', { exact: true }).click();
  for (const title of ['Água', 'Alongamento'])
    await form
      .locator('.mission-results')
      .getByRole('button')
      .filter({ hasText: title })
      .click();
  await form
    .getByRole('button', { name: 'Salvar rotina', exact: true })
    .click();
  await expect(form).not.toBeVisible();
  const run = async () => {
    await page.goto('/missoes?view=routines');
    await page
      .locator('.routine-card')
      .getByText('Mais ações', { exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Executar rotina', exact: true })
      .click();
    await expect(page).toHaveURL(/\/sessoes$/);
  };
  await run();
  const initial = (await state(page)).savedMissionSessions[0];
  await run();
  expect((await state(page)).savedMissionSessions).toHaveLength(1);
  await page.getByRole('link', { name: 'Pausar sessão', exact: true }).click();
  await expect(page).toHaveURL(/\/missoes$/);
  await page
    .getByRole('button', { name: 'Concluir Água', exact: true })
    .click();
  await page.getByRole('status', { name: 'Recompensa da conclusão' }).waitFor();
  await page.goto('/missoes?view=sessions');
  await page
    .getByRole('button', { name: 'Retomar sessão', exact: true })
    .click();
  await expect(
    page.getByText('Concluída individualmente, fora desta sessão.', {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Resumo da sessão', exact: true }),
  ).toContainText('1 concluídas');
  const before = await state(page);
  await page.clock.setFixedTime(new Date('2026-11-03T15:00:00-03:00'));
  await page.reload();
  await expect(
    page.getByText('Execução anterior:', { exact: false }),
  ).toBeVisible();
  expect((await state(page)).savedMissionSessions[0].occurrenceIds).toEqual(
    initial.occurrenceIds,
  );
  await run();
  expect((await state(page)).savedMissionSessions).toHaveLength(2);
  await run();
  expect((await state(page)).savedMissionSessions).toHaveLength(2);
  expect((await state(page)).profile).toEqual(before.profile);
  await page.goto('/missoes?view=sessions');
  await expect(
    page.getByRole('heading', { name: 'Execuções do dia atual', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Execuções anteriores', exact: true }),
  ).toBeVisible();
});
test('navegação principal concentra exploração em Mundo e mantém destinos acessíveis por Mais', async ({
  page,
}) => {
  await page.goto('/');
  const desktop = page.getByRole('navigation', {
    name: 'Navegação principal',
    exact: true,
  });
  if (page.viewportSize()!.width > 1000) {
    await expect(
      desktop.getByRole('link', { name: 'Mapa', exact: true }),
    ).toHaveCount(0);
    await expect(
      desktop.getByRole('link', { name: 'Aventura', exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole('button', { name: 'Perfil e mais', exact: true })
      .click();
  } else {
    const mobile = page.getByRole('navigation', {
      name: 'Navegação móvel',
      exact: true,
    });
    await expect(mobile.getByRole('link')).toHaveCount(3);
    await expect(
      mobile.getByRole('link', { name: 'Projetos', exact: true }),
    ).toHaveCount(0);
    await mobile.getByRole('button', { name: 'Mais', exact: true }).click();
  }
  const more = page.getByRole('dialog', { name: 'Seu espaço', exact: true });
  for (const title of [
    'Projetos',
    'Herói e equipamentos',
    'Aposentos',
    'Companheiros',
  ])
    await expect(
      more.getByRole('link', { name: title, exact: true }),
    ).toBeVisible();
  await more
    .getByRole('button', { name: 'Fechar diálogo', exact: true })
    .click();
  await page.goto('/mundo');
  await expect(page).toHaveURL(/\/mundo$/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});
