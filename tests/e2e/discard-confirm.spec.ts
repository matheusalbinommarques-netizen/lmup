import { expect, test } from '@playwright/test';

async function openNew(page: import('@playwright/test').Page) {
  const trigger = page
    .getByRole('button', { name: 'Nova missão', exact: true })
    .first();
  await trigger.click();
  const form = page.getByRole('dialog', { name: 'Uma nova missão' });
  await expect(form).toBeVisible();
  return { trigger, form };
}

test('fechar sem preencher não pergunta; com texto, Esc, ✕ e Cancelar pedem confirmação', async ({
  page,
}) => {
  await page.goto('/missoes');
  const opened = await openNew(page);
  const { trigger } = opened;
  let { form } = opened;
  await page.keyboard.press('Escape');
  await expect(form).not.toBeVisible();
  await expect(trigger).toBeFocused();

  ({ form } = await openNew(page));
  const title = form.getByLabel('O que você quer fazer?');
  await title.fill('Rascunho importante');
  const keep = form.getByRole('button', {
    name: 'Continuar editando',
    exact: true,
  });
  await page.keyboard.press('Escape');
  await expect(keep).toBeFocused();
  // Esc again means "keep editing", never a forced close.
  await page.keyboard.press('Escape');
  await expect(keep).toHaveCount(0);
  await expect(form).toBeVisible();
  await expect(title).toHaveValue('Rascunho importante');

  await form
    .getByRole('button', { name: 'Fechar diálogo', exact: true })
    .click();
  await keep.click();
  await expect(form).toBeVisible();
  await form.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await form.getByRole('button', { name: 'Descartar', exact: true }).click();
  await expect(form).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(page.getByText('Rascunho importante')).toHaveCount(0);

  ({ form } = await openNew(page));
  await expect(form.getByLabel('O que você quer fazer?')).toHaveValue('');
});

test('descartar a missão dentro do editor de rotina mantém a rotina aberta', async ({
  page,
}) => {
  await page.goto('/missoes');
  await page.getByRole('tab', { name: 'Rotinas', exact: true }).click();
  await page.getByRole('button', { name: 'Nova rotina', exact: true }).click();
  const routine = page.locator('.routine-form');
  await routine.getByLabel('Nome da rotina', { exact: true }).fill('Noite');
  await page
    .getByRole('button', { name: 'Criar missão na rotina', exact: true })
    .click();
  const form = page.getByRole('dialog', { name: 'Uma nova missão' });
  await form.getByLabel('O que você quer fazer?').fill('Ler');
  await page.keyboard.press('Escape');
  await form.getByRole('button', { name: 'Descartar', exact: true }).click();
  await expect(form).not.toBeVisible();
  await expect(routine).toBeVisible();
  await expect(
    routine.getByLabel('Nome da rotina', { exact: true }),
  ).toHaveValue('Noite');
  await expect(routine.locator('.routine-sequence li')).toHaveCount(0);
});
