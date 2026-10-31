import { confirmBackupImport } from './backup-ui';
import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

async function create(page: Page, title: string, steps = '', projectName = '') {
  await page.goto('/');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Uma nova missão' });
  await dialog.getByLabel('O que você quer fazer?').fill(title);
  if (steps || projectName) {
    await dialog.getByText('Passos e outros detalhes', { exact: true }).click();
    if (steps) await dialog.getByLabel('Passos, um por linha').fill(steps);
    if (projectName)
      await dialog
        .getByRole('combobox', { name: 'Projeto', exact: true })
        .selectOption({ label: projectName });
  }
  await dialog
    .getByRole('button', { name: 'Criar missão', exact: true })
    .click();
  // Creation now stays on the organizer; wait for the IndexedDB commit.
  await expect(dialog).not.toBeVisible();
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Todas', exact: true }).click();
  await page.getByRole('link', { name: title, exact: true }).click();
  await expect(page).toHaveURL(/\/missao\/\d+$/);
  await expect(
    page.getByRole('heading', { level: 1, name: title, exact: true }),
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

test('primeira missão real persiste passos e notas, retoma, conclui e desfaz após recarga', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const url = await create(
    page,
    'Aprender com uma ideia',
    'Escolher referência\nCriar um rascunho',
  );
  await expect(
    page.getByRole('button', { name: 'Concluir missão', exact: true }),
  ).toBeDisabled();
  await page
    .getByRole('checkbox', { name: 'Escolher referência', exact: true })
    .check();
  await page
    .getByLabel('Notas da missão')
    .fill('Minha descoberta fica guardada.');
  await expect(page.getByRole('status')).toHaveText(
    'Tudo salvo neste navegador',
  );
  await page
    .getByRole('button', { name: 'Pausar e voltar', exact: true })
    .click();
  await page.goto('/');
  await expect(page.getByText('Em andamento', { exact: true })).toBeVisible();
  const contrast = await page
    .getByRole('link', { name: 'Continuar missão', exact: true })
    .evaluate((element) => {
      const style = getComputedStyle(element);
      const luminance = (color: string) => {
        const values = color
          .match(/[\d.]+/g)!
          .slice(0, 3)
          .map((value) => {
            const channel = Number(value) / 255;
            return channel <= 0.04045
              ? channel / 12.92
              : ((channel + 0.055) / 1.055) ** 2.4;
          });
        return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
      };
      const a = luminance(style.color),
        b = luminance(style.backgroundColor);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
  await page
    .getByRole('link', { name: 'Continuar missão', exact: true })
    .click();
  await expect(page).toHaveURL(url);
  await page.reload();
  await expect(
    page.getByRole('checkbox', { name: 'Escolher referência', exact: true }),
  ).toBeChecked();
  await expect(page.getByLabel('Notas da missão')).toHaveValue(
    'Minha descoberta fica guardada.',
  );
  await page
    .getByRole('checkbox', { name: 'Criar um rascunho', exact: true })
    .check();
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Missão concluída!', exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Missão concluída!', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Desfazer conclusão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Aprender com uma ideia', level: 1 }),
  ).toBeVisible();
  await expect(page.getByLabel('Notas da missão')).toHaveValue(
    'Minha descoberta fica guardada.',
  );
  const result = await backup(page);
  expect(result.data.tasks).toHaveLength(1);
  expect(result.data.tasks[0]).toMatchObject({
    completed: false,
    executionNotes: 'Minha descoberta fica guardada.',
    completedSubtasks: [0, 1],
  });
  expect(result.data.profile).toMatchObject({
    totalXpEarned: 0,
    gold: 0,
    food: 0,
  });
  await page.goto(url);
  await expect(
    page.getByRole('button', { name: 'Concluir missão', exact: true }),
  ).toBeEnabled();
  expect(errors).toEqual([]);
});

test('falha de gravação preserva o rascunho e permite tentar salvar novamente', async ({
  page,
}) => {
  await page.addInitScript(() => {
    (window as any).allowNotes = sessionStorage.getItem('allowNotes') === '1';
    const originalPut = IDBObjectStore.prototype.put;
    const originalUpdate = IDBCursor.prototype.update;
    const shouldFail = (value: any) =>
      value?.executionNotes === 'rascunho seguro' &&
      !(window as any).allowNotes;
    IDBObjectStore.prototype.put = function (value: any, key?: IDBValidKey) {
      if (shouldFail(value))
        throw new DOMException('Falha simulada', 'QuotaExceededError');
      return key === undefined
        ? originalPut.call(this, value)
        : originalPut.call(this, value, key);
    };
    IDBCursor.prototype.update = function (value: any) {
      if (shouldFail(value))
        throw new DOMException('Falha simulada', 'QuotaExceededError');
      return originalUpdate.call(this, value);
    };
  });
  await create(page, 'Missão com recuperação');
  await page.getByLabel('Notas da missão').fill('rascunho seguro');
  await expect(page.getByRole('status')).toHaveText('Notas ainda não salvas');
  await expect(page.getByLabel('Notas da missão')).toHaveValue(
    'rascunho seguro',
  );
  await expect(
    page.getByRole('button', { name: 'Concluir missão', exact: true }),
  ).toBeDisabled();
  const other = await page.context().newPage();
  await other.goto(page.url());
  await other
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Missão concluída!', exact: true }),
  ).toBeVisible();
  await page.evaluate(() => {
    (window as any).allowNotes = true;
    sessionStorage.setItem('allowNotes', '1');
  });
  await page
    .getByRole('button', {
      name: 'Usar minhas notas e tentar salvar',
      exact: true,
    })
    .click();
  await expect(
    page.getByRole('button', {
      name: 'Usar minhas notas e tentar salvar',
      exact: true,
    }),
  ).not.toBeVisible();
  await page.reload();
  await expect(
    page.getByText('rascunho seguro', { exact: true }),
  ).toBeVisible();
});

test('backup antigo abre na nova jornada com saldos preservados e passos legados executáveis', async ({
  page,
}) => {
  await page.goto('/config');
  const fixture = {
    meta: {
      app: 'Level Me Up!',
      formatVersion: 2,
      exportedAt: '2026-10-28T12:00:00Z',
    },
    data: {
      profile: {
        id: 1,
        name: 'Meu herói antigo',
        level: 2,
        xpCurrent: 27,
        xpNext: 300,
        totalXpEarned: 777,
        gold: 321,
        food: 11,
        currentStreak: 0,
        activeCompanionId: 1,
        ecoGoldClaimedUpToStage: 1,
      },
      areas: [],
      companions: [],
      xpLogs: [],
      tasks: [
        {
          id: 77,
          title: 'Missão que já existia',
          xp: 50,
          rarity: 'common',
          areaId: 0,
          completed: false,
          status: 'available',
          createdAt: '2026-10-20T12:00:00Z',
          subtasks: [' Ler uma página ', '', 'Anotar uma descoberta'],
        },
        {
          id: 78,
          title: 'Conquista antiga',
          xp: 50,
          rarity: 'common',
          completed: true,
          status: 'completed',
          createdAt: '2026-10-20T12:00:00Z',
        },
      ],
    },
  };
  await page.locator('input[type=file]').setInputFiles({
    name: 'legado.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(fixture)),
  });
  await confirmBackupImport(page);
  await page.goto('/');
  await expect(
    page.getByText('Meu herói antigo', { exact: true }),
  ).toBeVisible();
  const original = await backup(page);
  expect(original.data.profile).toMatchObject({
    totalXpEarned: 777,
    gold: 321,
    food: 11,
  });
  expect(original.data.activityEvents).toHaveLength(0);
  await page.goto('/missao/78');
  await expect(page.getByText(/anterior ao histórico detalhado/)).toBeVisible();
  await page.goto('/missao/77');
  await page
    .getByRole('checkbox', { name: 'Ler uma página', exact: true })
    .check();
  await page
    .getByRole('checkbox', { name: 'Anotar uma descoberta', exact: true })
    .check();
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Missão concluída!', exact: true }),
  ).toBeVisible();
  const result = await backup(page);
  expect(result.data.profile).toMatchObject({
    totalXpEarned: 830,
    gold: 346,
    food: 13,
  });
  expect(
    result.data.tasks.find((task: any) => task.id === 77).completedSubtasks,
  ).toEqual([0, 2]);
});

test('conclusão real distingue bônus de projeto e desfaz os dois eventos juntos', async ({
  page,
}) => {
  await page.goto('/projetos');
  await page.getByRole('button', { name: 'Novo projeto', exact: true }).click();
  await page.getByLabel('Nome do projeto').fill('Minha primeira entrega');
  await page
    .getByRole('button', { name: 'Criar projeto', exact: true })
    .click();
  await expect(
    page.getByRole('link', { name: 'Detalhes do projeto', exact: true }),
  ).toBeVisible();
  await create(
    page,
    'Entregar uma primeira versão',
    '',
    'Minha primeira entrega',
  );
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Projeto concluído', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Desfazer conclusão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', {
      name: 'Entregar uma primeira versão',
      level: 1,
      exact: true,
    }),
  ).toBeVisible();
  const result = await backup(page);
  expect(result.data.profile).toMatchObject({
    totalXpEarned: 0,
    gold: 0,
    food: 0,
  });
  expect(result.data.projects[0]).toMatchObject({
    status: 'em_andamento',
    rewardGranted: false,
  });
  expect(result.data.activityEvents).toHaveLength(4);
});

test('duas abas concluem uma missão real uma única vez', async ({
  page,
  context,
}) => {
  const url = await create(page, 'Conquista compartilhada entre abas');
  const other = await context.newPage();
  await other.goto(url);
  await expect(
    other.getByRole('button', { name: 'Concluir missão', exact: true }),
  ).toBeEnabled();
  await Promise.all(
    [page, other].map((tab) =>
      tab
        .getByRole('button', { name: 'Concluir missão', exact: true })
        .evaluate((button: HTMLButtonElement) => button.click()),
    ),
  );
  await expect(
    page.getByRole('heading', { name: 'Missão concluída!', exact: true }),
  ).toBeVisible();
  const result = await backup(page);
  expect(result.data.activityEvents).toHaveLength(1);
  expect(result.data.profile).toMatchObject({
    totalXpEarned: 53,
    gold: 25,
    food: 2,
  });
});

test('plano e fixação são explícitos; navegação secundária preserva acesso às funções antigas', async ({
  page,
  isMobile,
}) => {
  const url = await create(page, 'Escolher meu dia');
  await page
    .getByRole('button', { name: 'Voltar às missões', exact: true })
    .click();
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Todas', exact: true }).click();
  await page.getByText('⋯', { exact: true }).click();
  await page
    .getByRole('button', { name: 'Tirar de hoje', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Planejar para hoje', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Fixar', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Desafixar', exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Todas', exact: true }).click();
  await page.getByText('⋯', { exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Desafixar', exact: true }),
  ).toBeVisible();
  const nav = page.getByRole('navigation', {
    name: isMobile ? 'Navegação móvel' : 'Navegação principal',
    exact: true,
  });
  await nav.getByRole('link', { name: 'Refúgio', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Refúgio', level: 1, exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Perfil e mais', exact: true })
    .click();
  await page
    .getByRole('dialog', { name: 'Seu espaço' })
    .getByRole('link', { name: 'Perfil e equipamentos', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Perfil e equipamentos', exact: true }),
  ).toBeVisible();
  await page.goto(url);
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Missão concluída!', exact: true }),
  ).toBeVisible();
});

test('execução real funciona em 320x568 com texto ampliado e rota inexistente se explica', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  const url = await create(page, 'Missão pequena', 'Um passo\nOutro passo');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '32px';
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.getByRole('checkbox', { name: 'Um passo', exact: true }).check();
  await page
    .getByRole('checkbox', { name: 'Outro passo', exact: true })
    .check();
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Missão concluída!', exact: true }),
  ).toBeVisible();
  await page.goto('/missao/999999');
  await expect(
    page.getByRole('heading', { name: 'Missão não encontrada', exact: true }),
  ).toBeVisible();
  await page.goto(url);
  await expect(
    page.getByRole('heading', { name: 'Missão concluída!', exact: true }),
  ).toBeVisible();
});
