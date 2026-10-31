import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
async function capture(page: Page, name: string, project: string) {
  if (process.env.LMU_CAPTURE_DIR)
    await page.screenshot({
      path: process.env.LMU_CAPTURE_DIR + '/' + project + '-' + name + '.png',
      fullPage: true,
    });
}
async function task(page: Page, title: string) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Uma nova missão' });
  await dialog.getByLabel('O que você quer fazer?').fill(title);
  await dialog
    .getByRole('button', { name: 'Criar missão', exact: true })
    .click();
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Todas', exact: true }).click();
  await page.getByRole('link', { name: title, exact: true }).click();
  await expect(page).toHaveURL(/\/missao\/\d+$/);
  return Number(page.url().split('/').pop());
}
async function fixture(page: Page, id: number, patch: Record<string, unknown>) {
  await page.evaluate(
    ({ id, patch }) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result,
            tx = database.transaction('tasks', 'readwrite'),
            store = tx.objectStore('tasks'),
            item = store.get(id);
          item.onsuccess = () => {
            if (!item.result) {
              tx.abort();
              return;
            }
            store.put({ ...item.result, ...patch });
          };
          tx.oncomplete = () => {
            database.close();
            resolve();
          };
          tx.onabort = () => {
            database.close();
            reject(new Error('Fixture recusada'));
          };
        };
      }),
    { id, patch },
  );
  await page.goto('/');
  await page.reload();
}

test('exemplo é rascunho editável: cancelar não cria missão e salvar permite pausar, concluir e desfazer', async ({
  page,
}, info) => {
  await page.goto('/');
  await expect(
    page.getByRole('button', {
      name: 'Criar minha primeira missão',
      exact: true,
    }),
  ).toBeVisible();
  await capture(page, 'primeiro-uso', info.project.name);
  await page.getByText('Precisa de uma ideia?', { exact: true }).click();
  await page
    .getByRole('button', { name: 'Estudar uma ideia', exact: true })
    .click();
  const dialog = page.getByRole('dialog', { name: 'Uma nova missão' });
  await expect(dialog.getByLabel('O que você quer fazer?')).toHaveValue(
    'Ler duas páginas e anotar uma ideia',
  );
  await capture(page, 'rascunho', info.project.name);
  await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  await expect(dialog.getByLabel('O que você quer fazer?')).toHaveValue('');
  await dialog.getByText('Passos e outros detalhes', { exact: true }).click();
  await expect(dialog.getByLabel('Passos, um por linha')).toHaveValue('');
  await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await page
    .getByRole('button', { name: 'Destravar um projeto', exact: true })
    .click();
  await dialog
    .getByLabel('O que você quer fazer?')
    .fill('Meu rascunho de verdade');
  await expect(dialog.getByLabel('Passos, um por linha')).toBeVisible();
  await dialog
    .getByLabel('Passos, um por linha')
    .fill('Escolher uma parte\nFazer um rascunho');
  await dialog
    .getByRole('button', { name: 'Criar missão', exact: true })
    .click();
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Todas', exact: true }).click();
  await page.getByRole('link', { name: 'Meu rascunho de verdade', exact: true }).click();
  await expect(
    page.getByRole('heading', {
      name: 'Meu rascunho de verdade',
      level: 1,
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole('checkbox', { name: 'Escolher uma parte', exact: true })
    .check();
  await page
    .getByLabel('Notas da missão')
    .fill('Ainda posso mudar esta ideia.');
  await expect(
    page.getByText('Tudo salvo neste navegador', { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Pausar e voltar', exact: true })
    .click();
  await page.goto('/');
  await expect(
    page.getByText('Você já começou. Continue de onde parou.', { exact: true }),
  ).toBeVisible();
  await capture(page, 'retomada', info.project.name);
  await page
    .getByRole('link', { name: 'Continuar missão', exact: true })
    .click();
  await page
    .getByRole('checkbox', { name: 'Fazer um rascunho', exact: true })
    .check();
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', {
      name: 'Missão concluída!',
      level: 1,
      exact: true,
    }),
  ).toBeVisible();
  await capture(page, 'conclusao', info.project.name);
  const missionUrl = page.url();
  await page
    .getByRole('link', { name: 'Voltar às missões', exact: true })
    .first()
    .click();
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Você está em dia.', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      'O que você fez continua registrado. O próximo passo pode ficar para outra hora.',
      { exact: true },
    ),
  ).toBeVisible();
  await capture(page, 'sem-pendencias', info.project.name);
  await page.goto('/config');
  const download = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Exportar dados', exact: true })
    .click();
  const backup = JSON.parse(
    await readFile((await (await download).path())!, 'utf8'),
  );
  expect(backup.data.tasks).toHaveLength(1);
  expect(backup.data.tasks[0].title).toBe('Meu rascunho de verdade');
  expect(backup.data.tasks[0].executionNotes).toBe(
    'Ainda posso mudar esta ideia.',
  );
  await page.goto(missionUrl);
  await page
    .getByRole('button', { name: 'Desfazer conclusão', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Concluir missão', exact: true }),
  ).toBeEnabled();
  await page.reload();
  await expect(page.getByLabel('Notas da missão')).toHaveValue(
    'Ainda posso mudar esta ideia.',
  );
});

test('missões arquivadas e revisão futura não prometem uma próxima missão disponível', async ({
  page,
}, info) => {
  const id = await task(page, 'Uma missão guardada');
  await fixture(page, id, { archived: true });
  await expect(
    page.getByRole('heading', { name: 'Sem missões ativas.', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', {
      name: 'Criar minha primeira missão',
      exact: true,
    }),
  ).not.toBeVisible();
  await capture(page, 'arquivadas', info.project.name);
  await fixture(page, id, {
    archived: false,
    reviewEnabled: true,
    reviewDueDate: '2099-12-31',
  });
  await expect(
    page.getByRole('heading', {
      name: 'Suas revisões têm seu tempo.',
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Começar missão', exact: true }),
  ).not.toBeVisible();
  await expect(
    page.getByText('Próxima revisão: 31/12/2099', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Revisão realizada hoje', { exact: true }),
  ).not.toBeVisible();
  await capture(page, 'revisao-futura', info.project.name);
});

test('ideias e rascunho permanecem acessíveis em 320px e texto 200%', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  await page.getByText('Precisa de uma ideia?', { exact: true }).click();
  await page
    .getByRole('button', { name: 'Preparar meu espaço', exact: true })
    .click();
  const dialog = page.getByRole('dialog', { name: 'Uma nova missão' });
  await expect(dialog.getByLabel('O que você quer fazer?')).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  );
  await capture(page, '320-texto-ampliado', info.project.name);
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('button', { name: 'Preparar meu espaço', exact: true }),
  ).toBeFocused();
});
