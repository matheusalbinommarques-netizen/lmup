import { test, expect, type Page } from '@playwright/test';

async function open(page: Page) {
  await page.goto('/perfil');
  await expect(
    page.getByRole('heading', { name: 'Herói', level: 1, exact: true }),
  ).toBeVisible();
}
// Fixture IndexedDB nativa; recarrega para a consulta reativa enxergar a mudança.
async function seed(
  page: Page,
  fields: Record<string, unknown>,
  itemIds: number[] = [],
) {
  await page.evaluate(
    ({ fields, itemIds }) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result,
            tx = db.transaction(['ownedShopItems', 'profile'], 'readwrite');
          const items = tx.objectStore('ownedShopItems');
          for (const itemId of itemIds)
            items.add({
              itemId,
              equipped: true,
              acquiredAt: new Date().toISOString(),
            });
          const profiles = tx.objectStore('profile'),
            row = profiles.get(1);
          row.onsuccess = () => profiles.put({ ...row.result, ...fields });
          tx.onerror = () => reject(tx.error);
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
        };
      }),
    { fields, itemIds },
  );
  await page.reload();
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}

test('estado inicial: retrato provisório identificado, nível 1, recursos zerados e seis espaços vazios', async ({
  page,
}) => {
  await open(page);
  await expect(
    page.getByText('Retrato provisório', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Nível 1 · Estudante', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('250 XP para o nível 2', { exact: false }),
  ).toBeVisible();
  const resources = page.locator('.resources');
  for (const label of ['XP acumulado', 'Gold disponível', 'Comida disponível'])
    await expect(resources.getByText(label, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /: vazio$/ })).toHaveCount(6);
  await expect(
    page.getByText('Nenhum item equipado.', { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Gerenciar equipamento', exact: true }),
  ).toHaveAttribute('href', '/inventario');
  await expect(
    page.getByRole('link', { name: 'Ver todas as conquistas', exact: true }),
  ).toHaveAttribute('href', '/trofeus');
});

test('espaços de equipamento funcionam por teclado e mostram as informações do item', async ({
  page,
}) => {
  await open(page);
  await seed(page, {}, [101, 105]);
  const armor = page.getByRole('button', {
    name: 'Armadura: Cota da Rotina',
    exact: true,
  });
  const weapon = page.getByRole('button', {
    name: 'Arma: Espada da Eficiência',
    exact: true,
  });
  await expect(armor).toBeVisible();
  await expect(page.getByRole('button', { name: /: vazio$/ })).toHaveCount(4);
  await expect(armor).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.getByRole('heading', { name: 'Cota da Rotina', exact: true }),
  ).toBeVisible();
  await weapon.focus();
  await expect(weapon).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(weapon).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.getByRole('heading', { name: 'Espada da Eficiência', exact: true }),
  ).toBeVisible();
  const empty = page.getByRole('button', { name: 'Anel: vazio', exact: true });
  await empty.focus();
  await page.keyboard.press('Space');
  await expect(
    page.getByText('Nenhum item neste espaço.', { exact: true }),
  ).toBeVisible();
  await page.getByText('Entender os efeitos ativos', { exact: true }).click();
  await expect(page.locator('.profile-effects')).toContainText(
    'Proteção de sequência',
  );
});

test('retrato enviado vence o provisório e o nível máximo mostra o aviso sem barra', async ({
  page,
}) => {
  await open(page);
  const png =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  await seed(page, {
    avatarUrl: png,
    level: 30,
    xpCurrent: 0,
    xpNext: 0,
    totalXpEarned: 250000,
  });
  await expect(page.getByRole('img', { name: /Retrato de/ })).toBeVisible();
  await expect(
    page.getByText('Retrato provisório', { exact: true }),
  ).toHaveCount(0);
  await expect(page.locator('#profile-level-progress')).toHaveCount(0);
  await expect(
    page.getByText('Nível máximo disponível', { exact: false }),
  ).toBeVisible();
});

for (const [width, height] of [
  [1366, 768],
  [1024, 768],
  [768, 1024],
  [390, 844],
  [320, 568],
] as const)
  test(`sem transbordo horizontal e com nome longo em ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await open(page);
    await seed(
      page,
      { name: 'Uma identidade muito longa para conferir a leitura no celular' },
      [101, 105, 109, 112, 113, 114],
    );
    await expect(
      page.getByRole('heading', { level: 2, name: /identidade muito longa/ }),
    ).toBeVisible();
    await noOverflow(page);
    await page.addStyleTag({ content: 'html { font-size: 200% }' });
    await noOverflow(page);
  });

test('sem imagens, as informações essenciais continuam disponíveis', async ({
  page,
}) => {
  await page.route('**/art/**', (route) => route.abort());
  await open(page);
  await seed(page, {}, [101]);
  await expect(
    page.getByRole('heading', { name: 'Cota da Rotina', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Retrato provisório', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Conquistas', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.resources')).toContainText('XP acumulado');
});

test('raridade real aparece em etiquetas, o selo mostra o nível e o botão principal é distinto', async ({
  page,
}) => {
  await open(page);
  await seed(page, { level: 7, xpCurrent: 180, xpNext: 520 }, [101, 105]);
  // Item equipado mostra a raridade do catálogo da loja; conquistas, a do catálogo de conquistas.
  await expect(
    page.locator('.detail').getByText('Comum', { exact: true }),
  ).toBeVisible();
  await expect(
    page.locator('.emblems').getByText('Comum', { exact: true }).first(),
  ).toBeVisible();
  await expect(page.locator('.seal-num')).toHaveText('7');
  const primary = page.getByRole('link', {
    name: 'Gerenciar equipamento',
    exact: true,
  });
  const secondary = page.getByRole('link', {
    name: 'Ver meu progresso e histórico',
    exact: true,
  });
  await expect(primary).toHaveClass(/lmu-button--primary/);
  await expect(secondary).toHaveClass(/lmu-button--secondary/);
  const fills = await Promise.all(
    [primary, secondary].map((link) =>
      link.evaluate(
        (el) =>
          getComputedStyle(el).backgroundImage +
          getComputedStyle(el).backgroundColor,
      ),
    ),
  );
  expect(fills[0]).not.toBe(fills[1]);
});

test('espaços ocupados e vazios se distinguem pela borda (sólida x tracejada)', async ({
  page,
}) => {
  await open(page);
  await seed(page, {}, [101]);
  const filled = page.getByRole('button', {
    name: 'Armadura: Cota da Rotina',
    exact: true,
  });
  const empty = page.getByRole('button', { name: 'Elmo: vazio', exact: true });
  expect(await filled.evaluate((el) => getComputedStyle(el).borderStyle)).toBe(
    'solid',
  );
  expect(await empty.evaluate((el) => getComputedStyle(el).borderStyle)).toBe(
    'dashed',
  );
});
