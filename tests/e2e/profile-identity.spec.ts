import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
async function edit(page: Page) {
  await page.goto('/perfil');
  await page
    .getByRole('button', { name: 'Editar perfil', exact: true })
    .click();
  return page.getByRole('dialog', { name: 'Editar perfil', exact: true });
}
async function capture(page: Page, name: string, project: string) {
  if (process.env.LMU_CAPTURE_DIR)
    await page.screenshot({
      path: process.env.LMU_CAPTURE_DIR + '/' + project + '-' + name + '.png',
      fullPage: name !== 'perfil-320',
    });
}

test('duas abas preservam o rascunho e recusam sobrescrever o mesmo nome', async ({
  page,
  context,
}, info) => {
  const first = await edit(page);
  await first.getByLabel('Nome do herói').fill('Meu rascunho');
  const other = await context.newPage();
  const second = await edit(other);
  await second.getByLabel('Nome do herói').fill('Nome da outra aba');
  await second
    .getByRole('button', { name: 'Salvar perfil', exact: true })
    .click();
  await expect(
    other.getByRole('heading', { name: 'Nome da outra aba', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Nome da outra aba', exact: true }),
  ).toBeVisible();
  await expect(first.getByLabel('Nome do herói')).toHaveValue('Meu rascunho');
  await first
    .getByRole('button', { name: 'Salvar perfil', exact: true })
    .click();
  await expect(first.getByRole('alert')).toContainText(
    'Seu perfil mudou em outra aba',
  );
  await expect(first.getByLabel('Nome do herói')).toHaveValue('Meu rascunho');
  await capture(page, 'perfil-conflito', info.project.name);
  await first.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await page
    .getByRole('button', { name: 'Editar perfil', exact: true })
    .click();
  await expect(first.getByLabel('Nome do herói')).toHaveValue(
    'Nome da outra aba',
  );
  await other.close();
});

test('salvar após quota mantém rascunho e preserva XP e avatar atualizados na outra aba', async ({
  page,
  context,
}, info) => {
  const first = await edit(page);
  await first.getByLabel('Nome do herói').fill('Minha jornada');
  const other = await context.newPage();
  await other.goto('/');
  await other.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const create = other.getByRole('dialog', { name: 'Uma nova missão' });
  await create.getByLabel('O que você quer fazer?').fill('Uma ação real');
  await create
    .getByRole('button', { name: 'Criar missão', exact: true })
    .click();
  await other.goto('/missoes');
  await other.getByRole('link', { name: 'Uma ação real', exact: true }).click();
  await other
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    other.getByRole('heading', { name: 'Missão concluída!', exact: true }),
  ).toBeVisible();
  const second = await edit(other);
  await second.getByLabel('Avatar (opcional)', { exact: true }).setInputFiles({
    name: 'avatar.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==',
      'base64',
    ),
  });
  await expect(
    second.getByRole('button', { name: 'Salvar perfil', exact: true }),
  ).toBeEnabled();
  await second
    .getByRole('button', { name: 'Salvar perfil', exact: true })
    .click();
  await expect(second).not.toBeVisible();
  await expect(first.getByLabel('Nome do herói')).toHaveValue('Minha jornada');
  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put;
    let fail = true;
    IDBObjectStore.prototype.put = function (...args: Parameters<typeof put>) {
      if (this.name === 'profile' && fail) {
        fail = false;
        throw new DOMException('Synthetic quota', 'QuotaExceededError');
      }
      return put.apply(this, args);
    };
  });
  await first
    .getByRole('button', { name: 'Salvar perfil', exact: true })
    .click();
  await expect(first.getByRole('alert')).toContainText(
    'O espaço de armazenamento está cheio',
  );
  await expect(first.getByLabel('Nome do herói')).toHaveValue('Minha jornada');
  await capture(page, 'perfil-falha-recuperavel', info.project.name);
  await first
    .getByRole('button', { name: 'Salvar perfil', exact: true })
    .click();
  await expect(first).not.toBeVisible();
  await page.goto('/config');
  const downloading = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Exportar dados', exact: true })
    .click();
  const backup = JSON.parse(
    await readFile((await (await downloading).path())!, 'utf8'),
  );
  expect(backup.data.profile).toMatchObject({
    name: 'Minha jornada',
    totalXpEarned: 53,
    gold: 25,
    food: 2,
  });
  expect(backup.data.profile.avatarUrl).toMatch(/^data:image\/png;base64,/);
  await other.close();
});

test('edição tem foco, validação e fechamento por teclado em 320px e texto 200%', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/perfil');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  const trigger = page.getByRole('button', {
    name: 'Editar perfil',
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole('dialog', {
    name: 'Editar perfil',
    exact: true,
  });
  await expect(dialog.getByLabel('Nome do herói')).toBeFocused();
  for (const label of ['Cancelar', 'Salvar perfil']) {
    expect(
      await dialog
        .getByRole('button', { name: label, exact: true })
        .evaluate((button) => {
          const style = getComputedStyle(button);
          return (
            button.getBoundingClientRect().height <=
            Number.parseFloat(style.lineHeight) * 2 +
              Number.parseFloat(style.paddingTop) +
              Number.parseFloat(style.paddingBottom) +
              3
          );
        }),
    ).toBe(true);
  }
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  );
  await dialog.getByLabel('Nome do herói').fill('   ');
  await dialog
    .getByRole('button', { name: 'Salvar perfil', exact: true })
    .click();
  await expect(dialog.getByRole('alert')).toContainText('1 e 80 caracteres');
  await capture(page, 'perfil-320', info.project.name);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
