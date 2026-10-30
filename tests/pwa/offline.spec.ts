import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test.beforeEach(async ({ request }) => {
  await request.post('/__network', { data: 'online' });
  await request.post('/__release', { data: 'a' });
});
async function ready(page: Page) {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
}
async function metadata(page: Page) {
  for (let attempt = 0; attempt < 5; attempt++)
    try {
      await page.waitForFunction(() => !!navigator.serviceWorker.controller);
      return await page.evaluate(
        () =>
          new Promise<any>((resolve) => {
            const channel = new MessageChannel();
            channel.port1.onmessage = (event) => {
              resolve(event.data);
              channel.port1.close();
            };
            navigator.serviceWorker.controller!.postMessage(
              { type: 'LMU_META' },
              [channel.port2],
            );
          }),
      );
    } catch (error) {
      if (attempt === 4 || !/context|navigation/i.test(String(error)))
        throw error;
      await page.waitForLoadState('domcontentloaded');
    }
  throw new Error('Não foi possível ler a revisão ativa.');
}
async function mission(page: Page, title = 'Uma missão offline') {
  await page.goto('/');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  await page.getByLabel('O que você quer fazer?').fill(title);
  await page.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await page.waitForURL(/missao/);
  return page.url();
}
async function backup(page: Page) {
  await page.goto('/config');
  const pending = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Exportar dados', exact: true })
    .click();
  return JSON.parse(await readFile((await (await pending).path())!, 'utf8'));
}
async function newVersion(page: Page, request: any, version = 'b') {
  await request.post('/__release', { data: version });
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    await registration!.update();
  });
  await expect(
    page.getByRole('complementary', {
      name: 'Atualização disponível',
      exact: true,
    }),
  ).toBeVisible();
}
test('abre URLs não visitadas, cria e salva notas com a rede desligada', async ({
  page,
  context,
  request,
}) => {
  await ready(page);
  await request.post('/__network', { data: 'offline' });
  await context.setOffline(true);
  await page.goto('/projetos/999');
  await expect(
    page.getByRole('heading', { name: 'Projeto não encontrado', exact: true }),
  ).toBeVisible();
  for (const [route, title] of [
    ['/progresso', 'Meu progresso'],
    ['/bestiario', 'Companheiros'],
    ['/config', 'Configurações'],
    ['/refugio', 'Refúgio'],
    ['/santuario', 'Refúgio'],
  ]) {
    await page.goto(route);
    await expect(
      page.getByRole('heading', { name: title, level: 1, exact: true }),
    ).toBeVisible();
  }
  await page
    .getByRole('button', {
      name: 'Ver paisagem de Floresta Anciã',
      exact: true,
    })
    .click();
  const preview = page.getByRole('dialog', {
    name: 'Prévia: Floresta Anciã',
    exact: true,
  });
  await expect(
    preview.getByText(
      'Prévia visual. Não altera o ambiente ativo, XP ou Gold.',
      { exact: true },
    ),
  ).toBeVisible();
  await expect
    .poll(() =>
      preview
        .locator('img')
        .evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0);
  await preview
    .getByRole('button', { name: 'Fechar prévia', exact: true })
    .click();
  const url = await mission(page);
  await page
    .getByLabel('Notas da missão')
    .fill('Este texto foi salvo sem internet.');
  await expect(
    page.getByText('Tudo salvo neste navegador', { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Notas da missão')).toHaveValue(
    'Este texto foi salvo sem internet.',
  );
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Esse passo é seu.', exact: true }),
  ).toBeVisible();
  const saved = await backup(page);
  expect(saved.data.profile.totalXpEarned).toBe(53);
  expect(saved.data.tasks[0].executionNotes).toBe(
    'Este texto foi salvo sem internet.',
  );
  await page.goto(url);
  await page
    .getByRole('button', { name: 'Desfazer conclusão', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Concluir missão', exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Notas da missão')).toHaveValue(
    'Este texto foi salvo sem internet.',
  );
});
test('revisão pronta espera formulário aberto e preserva URL e dados ao atualizar', async ({
  page,
  request,
}) => {
  await ready(page);
  const initial = await metadata(page);
  await mission(page, 'Continuar depois da atualização');
  await page.getByLabel('Notas da missão').fill('Uma nota preservada.');
  await expect(
    page.getByText('Tudo salvo neste navegador', { exact: true }),
  ).toBeVisible();
  await newVersion(page, request);
  await page
    .getByRole('button', { name: 'Editar missão', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Atualizar agora', exact: true })
    .evaluate((button: HTMLButtonElement) => button.click());
  await expect(
    page.getByText(/Há uma gravação, formulário ou aba sem resposta/),
  ).toBeVisible();
  expect((await metadata(page)).version).toBe(initial.version);
  await page
    .getByRole('dialog', { name: 'Editar missão', exact: true })
    .getByRole('button', { name: 'Cancelar', exact: true })
    .click();
  const url = page.url();
  await page
    .getByRole('button', { name: 'Atualizar agora', exact: true })
    .click();
  await expect
    .poll(async () => (await metadata(page)).version, { timeout: 15000 })
    .not.toBe(initial.version);
  await expect(page).toHaveURL(url);
  await expect(page.getByLabel('Notas da missão')).toHaveValue(
    'Uma nota preservada.',
  );
});
test('outra aba com notas não salvas bloqueia a troca até salvar', async ({
  page,
  context,
  request,
}) => {
  await ready(page);
  const url = await mission(page, 'Duas abas seguras');
  const other = await context.newPage();
  await other.goto(url);
  await other.evaluate(() => {
    const put = IDBObjectStore.prototype.put,
      update = IDBCursor.prototype.update;
    const fail = (value: any) =>
      value?.executionNotes === 'Rascunho que precisa salvar' &&
      !(window as any).allowNotes;
    IDBObjectStore.prototype.put = function (value: any, key?: IDBValidKey) {
      if (fail(value))
        throw new DOMException('Sem espaço', 'QuotaExceededError');
      return key === undefined
        ? put.call(this, value)
        : put.call(this, value, key);
    };
    IDBCursor.prototype.update = function (value: any) {
      if (fail(value))
        throw new DOMException('Sem espaço', 'QuotaExceededError');
      return update.call(this, value);
    };
  });
  await other.getByLabel('Notas da missão').fill('Rascunho que precisa salvar');
  await expect(other.getByText(/Seu texto continua aqui/)).toBeVisible();
  await newVersion(page, request);
  const before = (await metadata(page)).version;
  await page
    .getByRole('button', { name: 'Atualizar agora', exact: true })
    .click();
  await expect(
    page.getByText(/Há uma gravação, formulário ou aba sem resposta/),
  ).toBeVisible();
  expect((await metadata(page)).version).toBe(before);
  await expect(other.getByLabel('Notas da missão')).toHaveValue(
    'Rascunho que precisa salvar',
  );
  await other.evaluate(() => {
    (window as any).allowNotes = true;
  });
  await other
    .getByRole('button', {
      name: 'Usar minhas notas e tentar salvar',
      exact: true,
    })
    .click();
  await expect(
    other.getByText('Tudo salvo neste navegador', { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Atualizar agora', exact: true })
    .click();
  await expect
    .poll(async () => (await metadata(page)).version, { timeout: 15000 })
    .not.toBe(before);
  await expect
    .poll(async () => (await metadata(other)).version, { timeout: 15000 })
    .not.toBe(before);
  await expect(other.getByLabel('Notas da missão')).toHaveValue(
    'Rascunho que precisa salvar',
  );
});
test('revisão incompatível orienta backup e não força ativação', async ({
  page,
  request,
}) => {
  await ready(page);
  const original = (await metadata(page)).version;
  await page.goto('/config');
  await newVersion(page, request, 'incompatible');
  await expect(
    page.getByRole('button', { name: 'Atualizar aplicativo', exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByText(/Esta versão requer uma transição de dados/),
  ).toBeVisible();
  expect((await metadata(page)).version).toBe(original);
  await page.getByText('Sobre esta versão', { exact: true }).click();
  await expect(
    page
      .locator('details')
      .filter({ hasText: 'Revisão em uso:' })
      .locator('code'),
  ).toHaveText(original);
});
test('manifesto e controles de instalação oferecem caminho suportado e proteção opcional', async ({
  page,
}) => {
  await ready(page);
  const activeRevision = (await metadata(page)).version;
  const client = await page.context().newCDPSession(page);
  const result = await client.send('Page.getAppManifest');
  expect(result.errors).toEqual([]);
  const manifest = JSON.parse(result.data!);
  expect(manifest.display).toBe('standalone');
  expect(manifest.id).toBe('/');
  expect(manifest.icons.some((icon: any) => icon.purpose === 'maskable')).toBe(
    true,
  );
  await page.goto('/config');
  await expect(
    page.getByText(/O conteúdo essencial está disponível offline/),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Atualizar agora', exact: true }),
  ).not.toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Atualizar aplicativo', exact: true }),
  ).not.toBeVisible();
  await page.getByText('Sobre esta versão', { exact: true }).click();
  await expect(
    page
      .locator('details')
      .filter({ hasText: 'Revisão em uso:' })
      .locator('code'),
  ).toHaveText(activeRevision);
  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt', { cancelable: true });
    Object.assign(event, {
      prompt: async () => {
        (window as any).installPrompted = true;
      },
      userChoice: Promise.resolve({ outcome: 'dismissed' }),
    });
    window.dispatchEvent(event);
  });
  await page
    .getByRole('button', { name: 'Instalar aplicativo', exact: true })
    .click();
  expect(await page.evaluate(() => (window as any).installPrompted)).toBe(true);
  await page.evaluate(() => {
    navigator.storage.persist = async () => false;
  });
  await page
    .getByRole('button', {
      name: 'Solicitar proteção dos dados locais',
      exact: true,
    })
    .click();
  await expect(page.getByText(/não concedeu proteção adicional/)).toBeVisible();
});
test('negação do banco tem mensagem e permite recuperar ao reabrir sem apagar', async ({
  page,
}) => {
  await ready(page);
  await mission(page, 'Jornada que permanece');
  await page.addInitScript(() => {
    (indexedDB as any).open = () => {
      throw new DOMException('blocked', 'SecurityError');
    };
  });
  await page.reload();
  await expect(
    page.getByRole('heading', {
      name: 'Não foi possível abrir seus dados',
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByText(/armazenamento permitido/)).toBeVisible();
  const other = await page.context().newPage();
  await other.goto('/missoes');
  await expect(
    other.getByRole('link', { name: 'Jornada que permanece', exact: true }),
  ).toBeVisible();
});
test('falha ao preparar cache não impede a jornada online nem cria falsa prontidão', async ({
  page,
  request,
}) => {
  await request.post('/__release', { data: 'cache-failure' });
  await page.goto('/config');
  await expect(
    page.getByText(/Não foi possível preparar o uso offline/),
  ).toBeVisible();
  await mission(page, 'Posso continuar online');
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Esse passo é seu.', exact: true }),
  ).toBeVisible();
});

test('aba antiga sem protocolo impede a ativação até ser fechada', async ({
  page,
  context,
  request,
}) => {
  await ready(page);
  const before = (await metadata(page)).version;
  const legacy = await context.newPage();
  await legacy.goto('/legacy-tab.html');
  await newVersion(page, request);
  await page
    .getByRole('button', { name: 'Atualizar agora', exact: true })
    .click();
  await expect(
    page.getByText(/Há uma gravação, formulário ou aba sem resposta/),
  ).toBeVisible();
  expect((await metadata(page)).version).toBe(before);
  await legacy.close();
  await page.bringToFront();
  await page
    .getByRole('button', { name: 'Atualizar agora', exact: true })
    .click();
  await expect
    .poll(async () => (await metadata(page)).version, { timeout: 15000 })
    .not.toBe(before);
});
test('controle legado sem cache confirmado não aparece como pronto para offline', async ({
  page,
  request,
}) => {
  await request.post('/__release', { data: 'legacy' });
  await ready(page);
  await page.goto('/config');
  await expect(
    page.getByText(/Não foi possível confirmar o cache desta versão/),
  ).toBeVisible();
  await expect(
    page.getByText(/O conteúdo essencial está disponível offline/),
  ).not.toBeVisible();
  await newVersion(page, request, 'upgrade-legado');
  await page
    .getByRole('button', { name: 'Atualizar agora', exact: true })
    .click();
  await expect(
    page.getByText(/O conteúdo essencial está disponível offline/),
  ).toBeVisible();
});

test('cache opcional respeita limite e configuração cabe em 320px com texto ampliado', async ({
  page,
}) => {
  await ready(page);
  const art = await page.evaluate(async () => {
    const existing = (await caches.keys()).filter((key) =>
      key.startsWith('lmu-shell-'),
    );
    const shell = await caches.open(existing[0]);
    const essential = (await shell.keys()).length;
    for (let i = 0; i < 65; i++)
      await fetch(
        '/art/optimized/items-amuleto-do-cambista-160.webp?cache-test=' + i,
      );
    return essential;
  });
  expect(art).toBeGreaterThan(50);
  await expect
    .poll(() =>
      page.evaluate(
        async () => (await (await caches.open('lmu-art-v1')).keys()).length,
      ),
    )
    .toBeLessThanOrEqual(60);
  const optional = await page.evaluate(async () =>
    (await (await caches.open('lmu-art-v1')).keys()).map(
      (request) => request.url,
    ),
  );
  expect(optional.length).toBeGreaterThan(0);
  expect(
    optional.every((url) => new URL(url).pathname.startsWith('/art/')),
  ).toBe(true);
  await page.setViewportSize({ width: 320, height: 740 });
  await page.evaluate(() =>
    localStorage.setItem(
      'lmup:neuro-prefs',
      JSON.stringify({ largeText: true }),
    ),
  );
  await page.goto('/config');
  await expect(
    page.getByRole('heading', { name: 'Configurações', exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByText('Sobre esta versão', { exact: true }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test.afterEach(async ({ page }, info) => {
  if (process.env.LMU_CAPTURE_DIR && info.status === 'passed')
    await page.screenshot({
      path:
        process.env.LMU_CAPTURE_DIR +
        '/' +
        info.project.name +
        '-' +
        info.line +
        '.png',
      fullPage: true,
    });
});
