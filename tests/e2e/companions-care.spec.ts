import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { confirmBackupImport } from './backup-ui';
async function backup(page: Page) {
  await page.goto('/config');
  const pending = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Exportar dados', exact: true })
    .click();
  return JSON.parse(await readFile((await (await pending).path())!, 'utf8'));
}
async function restore(page: Page, saved: any) {
  await page.goto('/config');
  await page.locator('input[type=file]').setInputFiles({
    name: 'jornada.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(saved)),
  });
  await confirmBackupImport(page);
}
async function seed(page: Page, fields: Record<string, unknown>) {
  const saved = await backup(page);
  Object.assign(saved.data.profile, fields);
  await restore(page, saved);
}

function pet(page: Page, name = 'Lobo Etéreo') {
  return page
    .locator('.collection-pet')
    .filter({ has: page.getByRole('heading', { name, exact: true }) });
}
async function capture(
  page: Page,
  name: string,
  project: string,
  fullPage = true,
) {
  if (!process.env.LMU_CAPTURE_DIR) return;
  await page.locator('img').evaluateAll(async (images) => {
    await Promise.all(
      images.map(async (element) => {
        const image = element as HTMLImageElement;
        image.loading = 'eager';
        try {
          await image.decode();
        } catch {
          /* Fallback is part of the test. */
        }
      }),
    );
  });
  await page.screenshot({
    path: process.env.LMU_CAPTURE_DIR + '/' + project + '-' + name + '.png',
    fullPage,
  });
}
test('evoluções de companhia bloqueada podem ser exploradas sem gastar nem selecionar e devolvem foco', async ({
  page,
}, info) => {
  const before = await backup(page);
  await page.goto('/bestiario');
  const trigger = page.getByRole('button', {
    name: 'Ver evoluções de Dragão Ancião',
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole('dialog', {
    name: 'Evoluções: Dragão Ancião',
    exact: true,
  });
  await expect(
    dialog.getByText(
      'Prévia visual. Não gasta Comida, não evolui nem seleciona a companhia.',
      { exact: true },
    ),
  ).toBeFocused();
  await expect(dialog.locator('.companion-evolution')).toHaveCount(3);
  await expect(dialog.getByText('+15% Gold', { exact: true })).toBeVisible();
  await expect(dialog.locator('img')).toHaveCount(3);
  await expect
    .poll(() =>
      dialog
        .locator('img')
        .evaluateAll(
          (images) =>
            images.length === 3 &&
            images.every(
              (image) =>
                (image as HTMLImageElement).naturalWidth > 0 &&
                (image as HTMLImageElement).currentSrc.includes(
                  '/art/companions-v2/dragon-',
                ),
            ),
        ),
    )
    .toBe(true);
  await capture(page, 'previa-dragao', info.project.name, false);
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(
    pet(page, 'Dragão Ancião').getByRole('button', {
      name: 'Disponível no nível 15',
      exact: true,
    }),
  ).toBeDisabled();
  expect((await backup(page)).data).toEqual(before.data);
});
test('cuidado parcial mostra saldo e progresso até o próximo estágio, sem descontar no cancelamento', async ({
  page,
}, info) => {
  const saved = await backup(page);
  saved.data.profile.food = 15;
  saved.data.companions[0].foodInvested = 95;
  await restore(page, saved);
  await page.goto('/bestiario');
  await expect(
    pet(page).getByText(/Faltam 5 Comida\s+investida/),
  ).toBeVisible();
  await pet(page)
    .getByRole('button', { name: 'Alimentar +10', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Confirmar cuidado',
    exact: true,
  });
  await expect(
    dialog.getByText('Saldo atual: 15 Comida. Após confirmar: 5 Comida.', {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    dialog.getByText('Novo bônus: +10% XP.', { exact: true }),
  ).toBeVisible();
  await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(
    page.getByText('15 Comida disponível', { exact: true }),
  ).toBeVisible();
  await pet(page)
    .getByRole('button', { name: 'Evoluir · 5 Comida', exact: true })
    .click();
  await dialog
    .getByRole('button', { name: 'Confirmar · 5 Comida', exact: true })
    .click();
  await expect(
    pet(page).getByText('Evolução 2 de 3 · +10% XP', { exact: true }),
  ).toBeVisible();
  await expect(pet(page).getByRole('progressbar')).toHaveAttribute(
    'value',
    '0',
  );
  await expect(pet(page).getByRole('progressbar')).toHaveAttribute(
    'max',
    '200',
  );
  await expect(
    pet(page).getByText(/saldo ainda precisa de 190\s+Comida/),
  ).toBeVisible();
  await capture(page, 'apos-cuidado', info.project.name);
  const after = await backup(page);
  expect(after.data.profile.food).toBe(10);
  expect(after.data.companions[0].careHistory).toHaveLength(1);
  expect(after.data.companions[0].careHistory[0].amount).toBe(5);
});
test('saldo alterado em outra aba bloqueia confirmação sem descontar alimento', async ({
  page,
  context,
}, info) => {
  await seed(page, { food: 100 });
  await page.goto('/bestiario');
  await pet(page)
    .getByRole('button', { name: 'Evoluir · 100 Comida', exact: true })
    .click();
  const other = await context.newPage();
  await seed(other, { food: 0 });
  await expect(page.getByRole('alert')).toContainText('Seu saldo mudou');
  await expect(
    page.getByRole('button', { name: 'Confirmar · 100 Comida', exact: true }),
  ).toBeDisabled();
  await capture(page, 'saldo-mudou', info.project.name, false);
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  const after = await backup(page);
  expect(after.data.profile.food).toBe(0);
  expect(after.data.companions[0].foodInvested ?? 0).toBe(0);
  expect(after.data.companions[0].careHistory ?? []).toHaveLength(0);
  await other.close();
});
test('cuidar de companhia inativa não troca a seleção nem promete bônus aplicado', async ({
  page,
}) => {
  await seed(page, { level: 5, food: 100 });
  await page.goto('/bestiario');
  await pet(page, 'Lorde Lich')
    .getByRole('button', { name: 'Evoluir · 100 Comida', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Confirmar cuidado',
    exact: true,
  });
  await expect(
    dialog.getByText(/Cuidar não escolhe a companhia/),
  ).toBeVisible();
  await expect(
    dialog.getByText('Novo bônus: +10% Comida.', { exact: true }),
  ).toBeVisible();
  await dialog
    .getByRole('button', { name: 'Confirmar · 100 Comida', exact: true })
    .click();
  // The dialog closes after feedCompanion commits to IndexedDB.
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Sua companhia atual' }),
  ).toContainText('Lobo Etéreo');
  const after = await backup(page);
  expect(after.data.profile.activeCompanionId).toBe(1);
  expect(
    after.data.companions.find((row: any) => row.id === 2).foodInvested,
  ).toBe(100);
});
test('evolução máxima e seleção indisponível explicam o estado sem cuidados extras', async ({
  page,
}, info) => {
  const saved = await backup(page);
  Object.assign(saved.data.profile, { activeCompanionId: 3, food: 300 });
  Object.assign(saved.data.companions[0], {
    evolutionStage: 3,
    foodInvested: 300,
  });
  await restore(page, saved);
  await page.goto('/bestiario');
  await expect(
    page.getByRole('region', { name: 'Sua companhia atual' }),
  ).toContainText('não concede bônus');
  await expect(
    pet(page, 'Dragão Ancião').getByRole('button', {
      name: 'Disponível no nível 15',
      exact: true,
    }),
  ).toBeDisabled();
  await expect(
    pet(page).getByText(/Evolução máxima. Você pode continuar/),
  ).toBeVisible();
  await expect(
    pet(page).getByRole('button', { name: 'Alimentar +10', exact: true }),
  ).toHaveCount(0);
  await capture(page, 'maxima-e-selecao-indisponivel', info.project.name);
});
test('prévia e confirmação cabem em 320px com texto ampliado e arte ausente', async ({
  page,
}, info) => {
  await seed(page, { food: 100 });
  await page.setViewportSize({ width: 320, height: 568 });
  await page.route('**/art/**', (route) => route.abort());
  await page.goto('/bestiario');
  await page.addStyleTag({ content: '.lmu-design {font-size:200%}' });
  const trigger = page.getByRole('button', {
    name: 'Ver evoluções de Lobo Etéreo',
    exact: true,
  });
  await trigger.click();
  const preview = page.getByRole('dialog', {
    name: 'Evoluções: Lobo Etéreo',
    exact: true,
  });
  await expect(preview.locator('.lmu-art-fallback')).toHaveCount(3);
  await preview
    .getByRole('button', { name: 'Fechar prévia', exact: true })
    .scrollIntoViewIfNeeded();
  await expect(
    preview.getByRole('button', { name: 'Fechar prévia', exact: true }),
  ).toBeInViewport();
  await capture(page, '320-previa-sem-arte', info.project.name, false);
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await pet(page)
    .getByRole('button', { name: 'Evoluir · 100 Comida', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Confirmar cuidado',
    exact: true,
  });
  await dialog
    .getByRole('button', { name: 'Cancelar', exact: true })
    .scrollIntoViewIfNeeded();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  );
  await capture(page, '320-confirmacao', info.project.name, false);
  await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click();
});

test('jornada antiga usa arte nova sem substituir caminhos legados, saldo ou investimento', async ({
  page,
}, info) => {
  const saved = await backup(page);
  Object.assign(saved.data.profile, { gold: 123, food: 77 });
  const names = ['lobo', 'lich', 'dragao', 'aberracao'];
  for (const row of saved.data.companions) {
    row.imagePath = '/art/pets/' + names[row.id - 1] + '-1.webp';
    delete row.key;
  }
  Object.assign(saved.data.companions[0], {
    foodInvested: 100,
    evolutionStage: 2,
  });
  await restore(page, saved);
  const before = await backup(page);
  await page.goto('/bestiario');
  const wolf = pet(page);
  await expect(
    wolf.getByText('Evolução 2 de 3 · +10% XP', { exact: true }),
  ).toBeVisible();
  await expect
    .poll(() =>
      wolf
        .locator('.collection-card-art img')
        .evaluate(
          (image: HTMLImageElement) =>
            image.naturalWidth > 0 &&
            image.currentSrc.includes('/art/companions-v2/wolf-2'),
        ),
    )
    .toBe(true);
  await page
    .getByRole('button', { name: 'Ver evoluções de Lobo Etéreo', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Evoluções: Lobo Etéreo',
    exact: true,
  });
  await expect(dialog.locator('img')).toHaveCount(3);
  await capture(page, 'legado-artes-novas', info.project.name, false);
  await dialog
    .getByRole('button', { name: 'Fechar prévia', exact: true })
    .click();
  expect((await backup(page)).data).toEqual(before.data);
  expect(before.data.companions[0].imagePath).toBe('/art/pets/lobo-1.webp');
  expect(before.data.profile.gold).toBe(123);
  expect(before.data.profile.food).toBe(77);
});
