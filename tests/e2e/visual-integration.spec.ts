import { expect, test, type Page } from '@playwright/test';

async function readVisualData(page: Page) {
  return page.evaluate(
    () =>
      new Promise<{
        tasks: any[];
        routines: any[];
        sessions: any[];
        profile: any;
        events: number;
        version: number;
      }>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const tx = database.transaction(
            [
              'tasks',
              'routines',
              'savedMissionSessions',
              'profile',
              'activityEvents',
            ],
            'readonly',
          );
          const tasks = tx.objectStore('tasks').getAll(),
            routines = tx.objectStore('routines').getAll(),
            sessions = tx.objectStore('savedMissionSessions').getAll(),
            profile = tx.objectStore('profile').get(1),
            events = tx.objectStore('activityEvents').count();
          tx.oncomplete = () => {
            resolve({
              tasks: tasks.result,
              routines: routines.result,
              sessions: sessions.result,
              profile: profile.result,
              events: events.result,
              version: database.version,
            });
            database.close();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
  );
}

test('criação dentro da rotina preserva rascunho, herança de ícone, sequência e não inicia sessão nem premia', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/missoes?view=routines');
  await page.getByRole('button', { name: 'Nova rotina', exact: true }).click();
  const editor = page.locator('.routine-form');
  await editor
    .getByLabel('Nome da rotina', { exact: true })
    .fill('Rotina preservada');
  await editor
    .getByText('Descrição e pausas justificadas', { exact: true })
    .click();
  await editor
    .getByLabel('Descrição', { exact: true })
    .fill('Meu rascunho continua aqui');
  const before = await readVisualData(page);
  await editor
    .getByRole('button', { name: 'Criar missão na rotina', exact: true })
    .click();
  const form = page.getByRole('dialog', { name: 'Uma nova missão' });
  await form
    .getByLabel('O que você quer fazer?')
    .fill('Missão criada sem sair');
  await expect(form.locator('.area-icon-preview')).toContainText(
    'Ícone herdado da área.',
  );
  await form.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await expect(form).not.toBeVisible();
  await expect(
    editor.getByLabel('Nome da rotina', { exact: true }),
  ).toHaveValue('Rotina preservada');
  await expect(editor.getByLabel('Descrição', { exact: true })).toHaveValue(
    'Meu rascunho continua aqui',
  );
  await expect(editor.locator('.routine-sequence')).toContainText(
    'Missão criada sem sair',
  );
  await editor
    .getByRole('button', { name: 'Salvar rotina', exact: true })
    .click();
  await expect(editor).not.toBeVisible();
  const saved = await readVisualData(page);
  expect(
    saved.tasks.find((task) => task.title === 'Missão criada sem sair')
      ?.iconKey,
  ).toBeUndefined();
  expect(saved.routines[0].entries).toHaveLength(1);
  expect(saved.sessions).toHaveLength(0);
  expect(saved.events).toBe(before.events);
  expect(saved.profile.totalXpEarned).toBe(before.profile.totalXpEarned);
  expect(saved.profile.gold).toBe(before.profile.gold);
  expect(saved.version).toBe(before.version);
  await page.reload();
  await page
    .getByRole('button', { name: 'Editar rotina', exact: true })
    .click();
  await expect(page.locator('.routine-sequence')).toContainText(
    'Missão criada sem sair',
  );
  await editor
    .getByRole('button', { name: 'Criar missão na rotina', exact: true })
    .click();
  await form.getByLabel('O que você quer fazer?').fill('Não salvar');
  await form.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(
    editor.getByLabel('Nome da rotina', { exact: true }),
  ).toHaveValue('Rotina preservada');
  expect((await readVisualData(page)).tasks).toHaveLength(saved.tasks.length);
  expect(errors).toEqual([]);
});

test('edição mantém ícone e navegação por data/aba funciona com Voltar e mobile sem overflow', async ({
  page,
}) => {
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const form = page.getByRole('dialog', { name: 'Uma nova missão' });
  await form.getByLabel('O que você quer fazer?').fill('Escolha visual');
  await expect(
    form.getByText('Ícone da missão (opcional)', { exact: true }),
  ).not.toBeVisible();
  await expect(form.locator('.area-icon-preview')).toContainText(
    'Ícone herdado da área.',
  );
  await form.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await expect(form).not.toBeVisible();
  const row = page
    .locator('.mission-row')
    .filter({ hasText: 'Escolha visual' });
  await row
    .getByRole('button', { name: 'Ações para Escolha visual', exact: true })
    .click();
  await row.getByRole('button', { name: 'Editar missão', exact: true }).click();
  const edit = page.getByRole('dialog', { name: 'Editar missão' });
  await edit
    .getByLabel('O que você quer fazer?')
    .fill('Escolha visual editada');
  await edit
    .getByRole('button', { name: 'Salvar missão', exact: true })
    .click();
  await expect(edit).not.toBeVisible();
  expect(
    (await readVisualData(page)).tasks.find(
      (task) => task.title === 'Escolha visual editada',
    )?.iconKey,
  ).toBeUndefined();
  await page.goto('/missoes?view=agenda&mode=week&date=2026-11-01');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Agenda — Semana',
  );
  await page
    .getByRole('button', { name: 'Abrir dia 2026-11-01', exact: true })
    .click();
  await expect(page).toHaveURL(/mode=day/);
  await expect(page.getByLabel('Data da agenda')).toHaveValue('2026-11-01');
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Agenda — Semana',
  );
  await page
    .getByRole('button', { name: 'Ferramentas de missões', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Recuperar ocorrências', exact: true })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Recuperar Ocorrências',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('dia vazio tem saudação neutra sem renomear o perfil e uma única criação principal', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).not.toContainText(
    'Herói sem nome',
  );
  await expect(
    page.getByText('Sem missões planejadas', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('0 de 0 missões', { exact: true })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole('button', { name: 'Nova missão', exact: true }),
  ).toHaveCount(1);
  expect((await readVisualData(page)).profile.name).toBe('Herói sem nome');
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onsuccess = () => {
          const database = request.result;
          const tx = database.transaction('profile', 'readwrite');
          const store = tx.objectStore('profile');
          const profile = store.get(1);
          profile.onsuccess = () => store.put({ ...profile.result, name: '' });
          tx.oncomplete = () => {
            database.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
        request.onerror = () => reject(request.error);
      }),
  );
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    /^(Bom dia|Boa tarde|Boa noite)\.$/,
  );
  const card = page.locator('.upcoming-achievement');
  const box = await card.boundingBox();
  if (page.viewportSize()!.width < 700) expect(box!.width).toBeGreaterThan(330);
});

test('lista compacta preserva busca, filtros e seleção sem iniciar execução', async ({
  page,
}) => {
  await page.goto('/missoes');
  for (const title of ['Estudar idioma', 'Organizar material']) {
    await page
      .getByRole('button', { name: 'Nova missão', exact: true })
      .click();
    const form = page.getByRole('dialog', { name: 'Uma nova missão' });
    await form.getByLabel('O que você quer fazer?').fill(title);
    await form
      .getByRole('button', { name: 'Criar missão', exact: true })
      .click();
    await expect(form).not.toBeVisible();
  }
  const before = await readVisualData(page);
  await page
    .getByRole('searchbox', { name: 'Buscar missão', exact: true })
    .fill('idioma');
  await expect(page.locator('.mission-row')).toHaveCount(1);
  await expect(page.locator('.mission-row')).toContainText('Estudar idioma');
  await page
    .getByRole('button', { name: 'Limpar filtros', exact: true })
    .click();
  await expect(page.locator('.mission-row')).toHaveCount(2);
  await page.getByText('Mais filtros', { exact: false }).click();
  await expect(
    page.getByRole('button', { name: 'Áreas', exact: true }),
  ).toBeVisible();
  await page.getByLabel('Agrupar por área').check();
  await expect(page.locator('.area-group')).toContainText('Geral');
  await page.getByText('Mais filtros', { exact: false }).click();
  await page
    .getByRole('button', { name: 'Selecionar para sessão', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Iniciar sessão', exact: true }),
  ).toBeDisabled();
  await page
    .getByRole('checkbox', {
      name: 'Incluir Estudar idioma na sessão',
      exact: true,
    })
    .check();
  await expect(
    page.getByRole('button', { name: 'Iniciar sessão', exact: true }),
  ).toBeEnabled();
  await page
    .getByRole('button', { name: 'Cancelar seleção', exact: true })
    .click();
  const after = await readVisualData(page);
  expect(after.events).toBe(before.events);
  expect(after.sessions).toHaveLength(0);
  expect(after.profile.gold).toBe(before.profile.gold);
  const first = await page.locator('.mission-row').first().boundingBox();
  expect(first!.y).toBeLessThan(page.viewportSize()!.width < 700 ? 650 : 500);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
