import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('Home RPG mantém cena, personagem e atlas disponíveis sem conexão', async ({
  page,
  context,
}) => {
  await ready(page);
  await expect(
    page.getByRole('region', { name: 'Seu personagem', exact: true }),
  ).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole('region', { name: 'Seu personagem', exact: true }),
  ).toBeVisible();
  const offlineFonts = await page.evaluate(async () => {
    const faces = await document.fonts.load(
      '500 24px "LMUP Cormorant"',
      'Missões, Refúgio e Védria',
    );
    return faces.map((face) => face.status);
  });
  expect(offlineFonts.length).toBeGreaterThan(0);
  expect(offlineFonts.every((status) => status === 'loaded')).toBe(true);
  const scene = page.getByRole('img', {
    name: 'Viajante diante de Védria, representação visual provisória',
    exact: true,
  });
  await expect(scene).toBeVisible();
  await expect
    .poll(() => scene.evaluate((el) => (el as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  const atlas = page.locator('#home-map img');
  await atlas.scrollIntoViewIfNeeded();
  await expect
    .poll(() => atlas.evaluate((el) => (el as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  await expect(
    page.getByRole('link', { name: 'Ver lugares do refúgio', exact: true }),
  ).toHaveAttribute('href', '/refugio');
  await page
    .getByRole('link', { name: 'Ver lugares do refúgio', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Refúgio', level: 1, exact: true }),
  ).toBeVisible();
});
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

test('ao voltar ao app, encontra uma publicação nova sem aplicar durante o uso', async ({
  page,
  request,
}) => {
  await ready(page);
  const initial = await metadata(page);
  await request.post('/__release', { data: 'b' });
  const time = await page.evaluate(() => Date.now());
  await page.clock.setFixedTime(new Date(time + 61000));
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(
    page.getByRole('complementary', {
      name: 'Atualização disponível',
      exact: true,
    }),
  ).toBeVisible();
  expect((await metadata(page)).version).toBe(initial.version);
});

test('busca automática indisponível fica silenciosa e preserva a jornada offline', async ({
  page,
  context,
}) => {
  await ready(page);
  await context.setOffline(true);
  const time = await page.evaluate(() => Date.now());
  await page.clock.setFixedTime(new Date(time + 61000));
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(
    page.getByRole('region', { name: 'Seu personagem', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      'Não foi possível buscar uma atualização agora. Seus dados locais continuam disponíveis.',
      { exact: true },
    ),
  ).toHaveCount(0);
  await expect(
    page.getByRole('link', { name: 'Recarregar para atualizar', exact: true }),
  ).toHaveCount(0);
});
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

test('organizador cria área e rotina offline, vira o dia e preserva ocorrências e backup', async ({
  page,
  context,
  request,
}) => {
  await page.clock.setFixedTime(new Date('2026-11-02T10:00:00-03:00'));
  await ready(page);
  await request.post('/__network', { data: 'offline' });
  await context.setOffline(true);
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const form = page.getByRole('dialog', {
    name: 'Uma nova missão',
    exact: true,
  });
  await form
    .getByLabel('O que você quer fazer?')
    .fill('Cuidar da casa sem conexão');
  await form
    .getByRole('button', { name: 'Gerenciar áreas', exact: true })
    .click();
  const areas = page.getByRole('dialog', { name: 'Minhas áreas', exact: true });
  await areas.getByLabel('Nome da nova área').fill('Minha casa');
  await areas.getByRole('button', { name: 'Criar área', exact: true }).click();
  await expect(
    areas.getByRole('button', { name: 'Renomear Minha casa', exact: true }),
  ).toBeVisible();
  await areas
    .getByRole('button', { name: 'Fechar diálogo', exact: true })
    .click();
  await form
    .getByRole('combobox', { name: 'Recorrência', exact: true })
    .selectOption('daily');
  await form.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await page.waitForURL(/\/missao\/\d+$/);
  const url = page.url();
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('region', { name: 'Resumo da recompensa' }),
  ).toBeVisible();
  await page.clock.setFixedTime(new Date('2026-11-03T10:00:00-03:00'));
  await page.goto('/');
  await expect(
    page.getByRole('region', { name: 'Lista de missões', exact: true }),
  ).toContainText('Cuidar da casa sem conexão');
  await page.goto(url);
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('region', { name: 'Resumo da recompensa' }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('region', { name: 'Resumo da recompensa' }),
  ).not.toHaveClass(/celebrate/);
  const copy = await backup(page);
  expect(copy.data.tasks).toHaveLength(1);
  expect(copy.data.areas[0].nome).toBe('Minha casa');
  expect(
    copy.data.activityEvents
      .filter((event: { kind: string }) => event.kind === 'task')
      .map((event: { occurrenceDate: string }) => event.occurrenceDate)
      .sort(),
  ).toEqual(['2026-11-02', '2026-11-03']);
});

test('Recompensa Viva conclui, compara estágios e estorna inteiramente offline', async ({
  page,
  context,
  request,
}) => {
  await ready(page);
  const url = await mission(page, 'Cultivar uma nova paisagem');
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('profile', 'readwrite');
          const profile = tx.objectStore('profile');
          const read = profile.get(1);
          read.onsuccess = () =>
            profile.put({ ...read.result, totalXpEarned: 2499 });
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
  );
  await page.reload();
  await request.post('/__network', { data: 'offline' });
  await context.setOffline(true);
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  const summary = page.getByRole('region', { name: 'Resumo da recompensa' });
  await expect(
    summary.getByRole('heading', { name: 'Refúgio evoluiu!', exact: true }),
  ).toBeVisible();
  await expect
    .poll(() =>
      summary
        .getByRole('img')
        .evaluateAll(
          (images) =>
            images.length === 2 &&
            images.every((img) => (img as HTMLImageElement).naturalWidth > 0),
        ),
    )
    .toBe(true);
  await page.reload();
  await expect(summary).toBeVisible();
  await expect(summary).not.toHaveClass(/celebrate/);
  await summary.getByRole('link', { name: 'Continuar', exact: true }).click();
  await expect(page).toHaveURL('/');
  await page.goto(url);
  await page
    .getByRole('button', { name: 'Desfazer conclusão', exact: true })
    .click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Recompensa estornada' }),
  ).toBeVisible();
  const exported = await backup(page);
  expect(exported.data.profile.totalXpEarned).toBe(2499);
  expect(
    exported.data.activityEvents.filter(
      (event: { kind: string }) => event.kind === 'reversal',
    ),
  ).toHaveLength(1);
});
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
  await page.goto('/bestiario');
  for (const name of [
    'Lobo Etéreo',
    'Lorde Lich',
    'Dragão Ancião',
    'Aberração Abissal',
  ]) {
    await page
      .getByRole('button', { name: 'Ver evoluções de ' + name, exact: true })
      .click();
    const evolutions = page.getByRole('dialog', {
      name: 'Evoluções: ' + name,
      exact: true,
    });
    await expect(evolutions.locator('.companion-evolution')).toHaveCount(3);
    await expect(evolutions.locator('img')).toHaveCount(3);
    await expect
      .poll(() =>
        evolutions
          .locator('img')
          .evaluateAll(
            (images) =>
              images.length === 3 &&
              images.every(
                (image) => (image as HTMLImageElement).naturalWidth > 0,
              ),
          ),
      )
      .toBe(true);
    await evolutions
      .getByRole('button', { name: 'Fechar prévia', exact: true })
      .click();
  }
  const compactWidth = await page.evaluate(async () => {
    const response = await fetch('/art/companions-v2/dragon-3-320.webp');
    if (!response.ok) return 0;
    const bitmap = await createImageBitmap(await response.blob());
    return bitmap.width;
  });
  expect(compactWidth).toBe(160);
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
    page.getByRole('heading', { name: 'Missão concluída!', exact: true }),
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
    page.getByRole('heading', { name: 'Missão concluída!', exact: true }),
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
