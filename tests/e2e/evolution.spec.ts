import { expect, test, type Page } from '@playwright/test';

const TODAY = '2026-11-15';

async function open(page: Page) {
  await page.clock.setFixedTime(new Date(`${TODAY}T09:00:00-03:00`));
  await page.goto('/missoes');
  await expect(
    page.getByRole('button', { name: 'Nova missão', exact: true }),
  ).toBeVisible();
}

async function seed(page: Page) {
  await open(page);
  await page.evaluate(
    (today) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const tx = database.transaction(
            ['tasks', 'areas', 'profile', 'projects'],
            'readwrite',
          );
          tx.objectStore('areas').put({
            id: 5,
            nome: 'Casa',
            domain: 'home',
            ordem: 1,
          });
          const projects = tx.objectStore('projects');
          const project = {
            vision: '',
            stages: [],
            rewardGranted: false,
            rewardPolicy: 'effort-v1',
            revision: 1,
          };
          projects.put({
            ...project,
            id: 1,
            name: 'Organizar documentos',
            status: 'em_andamento',
            areaId: 5,
            createdAt: `${today}T08:00:00.000Z`,
          });
          projects.put({
            ...project,
            id: 2,
            name: 'Reserva de emergência',
            status: 'planejando',
            areaId: null,
            createdAt: '2026-10-23T12:00:00.000Z',
          });
          const base = {
            source: 'personal',
            xp: 50,
            effort: 'small',
            rarity: 'common',
            completed: false,
            status: 'available',
            productivityVersion: 1,
            tracking: { method: 'direct' },
            recurrence: null,
            plannedDate: null,
            createdAt: `${today}T08:00:00.000Z`,
          };
          const tasks = tx.objectStore('tasks');
          tasks.put({
            ...base,
            id: 9301,
            title: 'Separar documentos do carro',
            projectId: 1,
            areaId: 5,
          });
          tasks.put({
            ...base,
            id: 9302,
            title: 'Listar contas fixas do mês',
            projectId: 2,
            createdAt: '2026-10-23T12:00:00.000Z',
          });
          const profiles = tx.objectStore('profile');
          const get = profiles.get(1);
          get.onsuccess = () => {
            if (get.result)
              profiles.put({
                ...get.result,
                lifeWheel: {
                  version: 1,
                  checkins: [
                    {
                      id: 'c1',
                      at: '2026-11-09T12:00:00.000Z',
                      ratings: { home: 3 },
                    },
                  ],
                  focus: {
                    home: {
                      since: '2026-11-09T12:00:00.000Z',
                      intention: 'Receber visita sem correria.',
                    },
                  },
                },
              });
          };
          tx.oncomplete = () => {
            database.close();
            resolve();
          };
          tx.onerror = () => {
            database.close();
            reject(tx.error);
          };
        };
      }),
    TODAY,
  );
}

const nav = (page: Page) =>
  page.getByRole('navigation', {
    name:
      page.viewportSize()!.width > 900
        ? 'Navegação principal'
        : 'Navegação móvel',
    exact: true,
  });

test('Evolução mostra focos da Roda, projetos ativos e põe a próxima ação no dia', async ({
  page,
}) => {
  await seed(page);
  await nav(page).getByRole('link', { name: 'Evolução', exact: true }).click();
  await expect(page).toHaveURL(/\/evolucao$/);
  await expect(
    page.getByRole('heading', { name: 'Evolução', level: 1 }),
  ).toBeVisible();
  await expect(
    nav(page).getByRole('link', { name: 'Evolução', exact: true }),
  ).toHaveAttribute('aria-current', 'page');

  const focus = page.locator('.evolution-focus');
  await expect(focus).toHaveCount(1);
  await expect(focus).toContainText('Casa e Ambiente');
  await expect(focus).toContainText('Receber visita sem correria.');
  await expect(page.getByText('da Roda, avaliada em 09/11/2026')).toBeVisible();

  const rows = page.locator('.evolution-project');
  await expect(rows).toHaveCount(2);
  const reserve = rows.filter({ hasText: 'Reserva de emergência' });
  await expect(reserve).toContainText('Sem área');
  await expect(reserve).toContainText('Parada há 23 dias');
  const docs = rows.filter({ hasText: 'Organizar documentos' });
  await expect(docs).toContainText('Casa');
  await expect(docs).toContainText('0 de 1 missões');
  await expect(docs).not.toContainText('Parada');

  await docs
    .getByRole('button', { name: 'Pôr no dia: Separar documentos do carro' })
    .click();
  await expect(docs.getByText('✓ No dia de hoje')).toBeVisible();
  await expect(page.getByRole('status').first()).toContainText(
    '"Separar documentos do carro" está no dia de hoje.',
  );
  await nav(page).getByRole('link', { name: 'Hoje', exact: true }).click();
  await expect(page.locator('.day-plan')).toContainText(
    'Separar documentos do carro',
  );
  await expect(page.locator('.day-plan')).not.toContainText(
    'Listar contas fixas do mês',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});

test('Evolução vazia convida sem cobrar; "Agora não" recolhe o convite da Roda', async ({
  page,
}) => {
  await open(page);
  await page.goto('/evolucao');
  await expect(page.getByText('Sem focos por enquanto')).toBeVisible();
  await expect(page.getByText('Nenhum projeto ativo')).toBeVisible();
  await expect(page.getByText('Ainda pouco registrado')).toBeVisible();
  await page.getByRole('button', { name: 'Agora não', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Agora não', exact: true }),
  ).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole('link', { name: 'Avaliar a Roda' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Agora não', exact: true }),
  ).toHaveCount(0);
});

test('projeto criado na Evolução guarda a área escolhida e a edição a preserva', async ({
  page,
}) => {
  await seed(page);
  await page.goto('/evolucao');
  await page
    .locator('.evolution-section-head')
    .getByRole('button', { name: 'Novo projeto', exact: true })
    .click();
  const dialog = page.getByRole('dialog', { name: 'Novo projeto' });
  await dialog.getByLabel('Nome do projeto').fill('Horta na varanda');
  await dialog.getByLabel('Área (opcional)').selectOption({ label: 'Casa' });
  await dialog.getByRole('button', { name: 'Criar projeto' }).click();
  await expect(dialog).toBeHidden();
  const row = page
    .locator('.evolution-project')
    .filter({ hasText: 'Horta na varanda' });
  await expect(row).toContainText('Casa');
  await expect(row).toContainText('Nenhuma missão ainda');

  await page.goto('/projetos');
  const card = page
    .locator('.project-list-card')
    .filter({ hasText: 'Horta na varanda' });
  await expect(card).toContainText('Casa ·');
  await card.getByRole('button', { name: 'Editar projeto' }).click();
  const edit = page.getByRole('dialog', { name: 'Editar projeto' });
  await expect(edit.getByLabel('Área (opcional)')).toHaveValue('5');
  await edit.getByLabel('Área (opcional)').selectOption({ label: 'Sem área' });
  await edit.getByRole('button', { name: 'Salvar projeto' }).click();
  await expect(edit).toBeHidden();
  await expect(card).toContainText('Sem área ·');
});

test('Jornada reúne Herói, Acampamento, Mundo e Loja em abas', async ({
  page,
}) => {
  await open(page);
  await nav(page).getByRole('link', { name: 'Jornada', exact: true }).click();
  await expect(page).toHaveURL(/\/perfil$/);
  const tabs = page.getByRole('navigation', { name: 'Jornada', exact: true });
  await expect(tabs.getByRole('link')).toHaveText([
    'Herói',
    'Acampamento',
    'Mundo',
    'Loja',
  ]);
  await expect(tabs.getByRole('link', { name: 'Herói' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await tabs.getByRole('link', { name: 'Loja', exact: true }).click();
  await expect(page).toHaveURL(/\/loja$/);
  await expect(tabs.getByRole('link', { name: 'Loja' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(
    nav(page).getByRole('link', { name: 'Jornada', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await page.goto('/evolucao');
  await expect(tabs).toHaveCount(0);
});
