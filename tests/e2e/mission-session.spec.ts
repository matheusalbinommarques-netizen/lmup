import { expect, test, type Page } from '@playwright/test';

async function storedData(page: Page) {
  return page.evaluate(async () => {
    const databases = await indexedDB.databases();
    return Promise.all(
      databases.map(
        ({ name }) =>
          new Promise((resolve, reject) => {
            const open = indexedDB.open(name!);
            open.onerror = () => reject(open.error);
            open.onsuccess = () => {
              const db = open.result;
              const names = [...db.objectStoreNames].filter(
                (name) => name !== 'savedMissionSessions',
              );
              const transaction = db.transaction(names, 'readonly');
              const data: Record<string, unknown> = {};
              for (const store of names) {
                const request = transaction.objectStore(store).getAll();
                request.onsuccess = () => {
                  data[store] = request.result;
                };
              }
              transaction.oncomplete = () => {
                db.close();
                resolve({ name, data });
              };
              transaction.onerror = () => {
                db.close();
                reject(transaction.error);
              };
            };
          }),
      ),
    );
  });
}

async function createSession(page: Page) {
  await page.goto('/missoes');
  for (const title of ['Primeira', 'Intermediária', 'Última']) {
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
  await page
    .getByRole('button', { name: 'Montar sessão', exact: true })
    .click();
  for (const title of ['Primeira', 'Intermediária', 'Última']) {
    await page
      .getByRole('checkbox', { name: `Incluir ${title} na sessão` })
      .check();
  }
  await page
    .getByRole('button', { name: 'Iniciar sessão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Primeira', exact: true }),
  ).toBeVisible();
}

for (const removed of ['Primeira', 'Intermediária', 'Última']) {
  test(`remover ${removed} preserva dados, foco, contador e sessão após recarregar`, async ({
    page,
  }) => {
    await createSession(page);
    await page.getByLabel('Notas da missão').fill('Meu progresso preservado');
    await expect(page.getByText('Tudo salvo neste navegador')).toBeVisible();
    const before = await storedData(page);
    await page
      .getByRole('button', {
        name: `Remover da sessão: ${removed}`,
        exact: true,
      })
      .click();
    await expect(page.getByText('0 de 2 missões concluídas')).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: removed === 'Primeira' ? 'Intermediária' : 'Primeira',
        exact: true,
      }),
    ).toBeVisible();
    await page.reload();
    await expect(page.getByText('0 de 2 missões concluídas')).toBeVisible();
    await expect(
      page.getByRole('complementary', { name: 'Fila de missões' }),
    ).not.toContainText(removed);
    expect(await storedData(page)).toEqual(before);
    await page
      .getByRole('link', { name: 'Pausar sessão', exact: true })
      .click();
    await page.getByRole('button', { name: 'Todas', exact: true }).click();
    await expect(
      page.getByRole('link', { name: removed, exact: true }),
    ).toBeVisible();
  });
}

test('remover todas as pendentes limpa a sessão e mantém as missões', async ({
  page,
}) => {
  await createSession(page);
  const before = await storedData(page);
  for (const title of ['Primeira', 'Intermediária', 'Última']) {
    await page
      .getByRole('button', { name: `Remover da sessão: ${title}`, exact: true })
      .click();
  }
  await expect(
    page.getByRole('heading', { name: 'Nenhuma sessão em foco.' }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Nenhuma sessão em foco.' }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem('lmup.mission-session.v1')),
  ).toBeNull();
  expect(await storedData(page)).toEqual(before);
  await page
    .getByRole('link', { name: 'Escolher missões', exact: true })
    .click();
  await page.getByRole('button', { name: 'Todas', exact: true }).click();
  for (const title of ['Primeira', 'Intermediária', 'Última']) {
    await expect(
      page.getByRole('link', { name: title, exact: true }),
    ).toBeVisible();
  }
});

test('pular fica junto de editar e revisão e preserva os dados da missão', async ({
  page,
}, info) => {
  await createSession(page);
  const actions = page.locator('.journey-actions').filter({
    has: page.getByRole('button', { name: 'Editar missão', exact: true }),
  });
  await expect(
    actions.getByRole('button', { name: 'Configurar revisão', exact: true }),
  ).toBeVisible();
  const skip = actions.getByRole('button', {
    name: 'Pular por agora',
    exact: true,
  });
  await expect(skip).toBeVisible();
  await expect(
    page.locator('.session-current-heading').getByRole('button'),
  ).toHaveCount(0);
  await skip.scrollIntoViewIfNeeded();
  for (const button of await actions.getByRole('button').all()) {
    const box = (await button.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  }
  await page.screenshot({
    path: `test-results/session-actions-${info.project.name}.png`,
    fullPage: true,
  });
  const before = await storedData(page);
  await skip.click();
  await expect(
    page.getByRole('heading', { name: 'Intermediária', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('0 de 3 missões concluídas')).toBeVisible();
  expect(await storedData(page)).toEqual(before);
});

test('remoção preserva recompensas, histórico e progresso das outras missões', async ({
  page,
}) => {
  await createSession(page);
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Missão concluída!', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', {
      name: 'Remover da sessão: Primeira',
      exact: true,
    }),
  ).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Próxima missão', exact: true })
    .click();
  await page.getByLabel('Notas da missão').fill('Retomar daqui');
  await expect(page.getByText('Tudo salvo neste navegador')).toBeVisible();
  const before = await storedData(page);
  await page
    .getByRole('button', { name: 'Remover da sessão: Última', exact: true })
    .click();
  await expect(page.getByText('1 de 2 missões concluídas')).toBeVisible();
  await expect(page.getByLabel('Notas da missão')).toHaveValue('Retomar daqui');
  await page.reload();
  await expect(page.getByText('1 de 2 missões concluídas')).toBeVisible();
  expect(await storedData(page)).toEqual(before);
});

test('falha ao persistir remoção mantém a fila até conseguir salvar', async ({
  page,
}) => {
  await createSession(page);
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (
      this: IDBObjectStore,
      ...args: Parameters<IDBObjectStore['put']>
    ) {
      if (this.name === 'savedMissionSessions')
        throw new DOMException(
          'Armazenamento indisponível',
          'QuotaExceededError',
        );
      return original.apply(this, args);
    };
  });
  await page
    .getByRole('button', { name: 'Remover da sessão: Primeira', exact: true })
    .click();
  await expect(page.getByRole('alert')).toContainText(
    'Não foi possível salvar a sessão',
  );
  await expect(page.getByText('0 de 3 missões concluídas')).toBeVisible();
  await page.reload();
  await expect(page.getByText('0 de 3 missões concluídas')).toBeVisible();
  await page
    .getByRole('button', { name: 'Remover da sessão: Primeira', exact: true })
    .click();
  await page
    .getByRole('button', {
      name: 'Remover da sessão: Intermediária',
      exact: true,
    })
    .click();
  await expect(page.getByText('0 de 1 missões concluídas')).toBeVisible();
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (
      this: IDBObjectStore,
      ...args: Parameters<IDBObjectStore['put']>
    ) {
      if (this.name === 'savedMissionSessions')
        throw new DOMException(
          'Armazenamento indisponível',
          'QuotaExceededError',
        );
      return original.apply(this, args);
    };
  });
  await page
    .getByRole('button', { name: 'Remover da sessão: Última', exact: true })
    .click();
  await expect(page.getByRole('alert')).toContainText(
    'Não foi possível salvar a sessão',
  );
  await expect(page.getByText('0 de 1 missões concluídas')).toBeVisible();
  await page.reload();
  await expect(page.getByText('0 de 1 missões concluídas')).toBeVisible();
});

test('remover a última missão em foco permite voltar às pendentes', async ({
  page,
}) => {
  await createSession(page);
  await page
    .getByRole('complementary', { name: 'Fila de missões' })
    .getByRole('button', { name: /Última Pendente/ })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Última', exact: true }),
  ).toBeVisible();
  const before = await storedData(page);
  await page
    .getByRole('button', { name: 'Remover da sessão: Última', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Fim da sequência', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('0 de 2 missões concluídas')).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Fim da sequência', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Revisar pendentes', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Primeira', exact: true }),
  ).toBeVisible();
  expect(await storedData(page)).toEqual(before);
});

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-02T10:00:00-03:00'));
});

test('cadastrar missão não inicia sua execução e permite cadastrar outra', async ({
  page,
}) => {
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const form = page.getByRole('dialog', {
    name: 'Uma nova missão',
    exact: true,
  });
  await form.getByLabel('O que você quer fazer?').fill('Lavar a louça');
  await form
    .getByRole('button', { name: 'Salvar e criar outra', exact: true })
    .click();
  await expect(form).toBeVisible();
  await expect(form.getByLabel('O que você quer fazer?')).toHaveValue('');
  await form.getByLabel('O que você quer fazer?').fill('Fazer mercado');
  await form.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await expect(page).toHaveURL(/\/missoes$/);
  await expect(
    page.getByRole('region', { name: 'Lista de missões' }),
  ).not.toContainText('Em andamento');
  await page.getByRole('link', { name: 'Lavar a louça', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Iniciar missão' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Voltar às missões' }).click();
  await expect(
    page.getByRole('region', { name: 'Lista de missões' }),
  ).not.toContainText('Em andamento');
});

test('sessão executa missões em sequência, persiste e não gera XP ao pular', async ({
  page,
}) => {
  await page.goto('/missoes');
  for (const title of ['Lavar a louça', 'Fazer mercado']) {
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
  await page
    .getByRole('button', { name: 'Montar sessão', exact: true })
    .click();
  await page
    .getByRole('checkbox', { name: 'Incluir Lavar a louça na sessão' })
    .check();
  await page
    .getByRole('checkbox', { name: 'Incluir Fazer mercado na sessão' })
    .check();
  await page
    .getByRole('button', { name: 'Iniciar sessão', exact: true })
    .click();
  await expect(page).toHaveURL(/\/sessoes$/);
  await expect(page.getByText('0 de 2 missões concluídas')).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Sessão de Missões' }),
  ).toBeVisible();
  await expect(page.getByText('0 de 2 missões concluídas')).toBeVisible();
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Missão concluída!', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Próxima missão', exact: true })
    .click();
  await expect(page.getByText('1 de 2 missões concluídas')).toBeVisible();
  await page.getByRole('button', { name: 'Pular por agora' }).click();
  await expect(
    page.getByRole('heading', { name: 'Fim da sequência' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Revisar pendentes' }).click();
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await page.getByRole('button', { name: 'Próxima missão' }).click();
  await expect(page.getByText('2 de 2 missões concluídas')).toBeVisible();
  await page.getByRole('button', { name: 'Finalizar sessão' }).click();
  await expect(page).toHaveURL(/\/missoes$/);
  await page.getByRole('button', { name: 'Concluídas', exact: true }).click();
  await expect(
    page
      .getByRole('region', { name: 'Histórico de conclusões' })
      .locator('.mission-row'),
  ).toHaveCount(2);
});
