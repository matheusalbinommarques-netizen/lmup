import { test, expect, type Page, type Locator } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

async function capture(page: Page, name: string) {
  const folder = process.env.LMU_CONTROLS_CAPTURE_DIR;
  if (!folder) return;
  await mkdir(folder, { recursive: true });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.screenshot({
    path: join(
      folder,
      `after-${page.viewportSize()!.width}-controls-${name}.png`,
    ),
    animations: 'disabled',
  });
}
async function newMission(page: Page, title: string) {
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const form = page.getByRole('dialog', {
    name: 'Uma nova missão',
    exact: true,
  });
  await form.getByLabel('O que você quer fazer?').fill(title);
  return form;
}
async function save(form: Locator) {
  await form.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await expect(form).not.toBeVisible();
}
async function instrumentPicker(page: Page) {
  await page.addInitScript(() => {
    const original = HTMLInputElement.prototype.showPicker;
    (window as any).timePickerCalls = [];
    HTMLInputElement.prototype.showPicker = function () {
      const result = original.call(this);
      if (this.type === 'time')
        (window as any).timePickerCalls.push(
          this.getAttribute('aria-label') || this.type,
        );
      return result;
    };
  });
}
async function clickTime(page: Page, input: Locator, value: string) {
  await expect(input).toBeEnabled();
  await expect(input).toHaveAttribute('type', 'text');
  await expect(input).toHaveAttribute('inputmode', 'numeric');
  const before = await page.evaluate(
    () => (window as any).timePickerCalls.length,
  );
  await input.click();
  await expect(input).toBeFocused();
  await input.fill('');
  const [hours, minutes] = value.split(':');
  await input.pressSequentially(hours);
  await expect(input).toHaveValue(hours + ':');
  expect(
    await input.evaluate(
      (element) => (element as HTMLInputElement).selectionStart,
    ),
  ).toBe(3);
  await input.pressSequentially(minutes);
  await input.press('Tab');
  await expect(input).toHaveValue(value);
  expect(
    await page.evaluate(() => (window as any).timePickerCalls.length),
  ).toBe(before);
}

test('horário avança das horas aos minutos pelo teclado e preserva o valor ao salvar', async ({
  page,
}) => {
  await instrumentPicker(page);
  await page.goto('/missoes');
  const form = await newMission(page, 'Horário pelo teclado');
  await form.getByRole('tab', { name: 'Planejamento', exact: true }).click();
  const input = form.getByLabel('Início desejado', { exact: true });
  await clickTime(page, input, '14:45');
  await save(form);
  await expect(
    page
      .locator('.mission-task-row')
      .filter({ hasText: 'Horário pelo teclado' }),
  ).toContainText('14:45');
});

test('formulário alinha áreas e passos, permite digitar horário e organiza grupos da Agenda', async ({
  page,
}) => {
  await instrumentPicker(page);
  await page.goto('/missoes');
  const form = await newMission(page, 'Organizar o dia');
  const manage = form.getByRole('button', {
    name: 'Gerenciar áreas',
    exact: true,
  });
  await expect(manage).toHaveClass(/lmu-button--secondary/);
  await capture(page, 'form');
  await manage.click();
  const areas = page.getByRole('dialog', { name: 'Minhas áreas', exact: true });
  await expect(areas).toBeVisible();
  await areas
    .getByRole('button', { name: 'Fechar diálogo', exact: true })
    .click();
  await expect(form.getByLabel('O que você quer fazer?')).toHaveValue(
    'Organizar o dia',
  );
  await form
    .getByRole('tab', { name: 'Passos e detalhes', exact: true })
    .click();
  const add = form.getByRole('button', {
    name: '+ Adicionar passo',
    exact: true,
  });
  await add.click();
  await form.getByLabel('Passo 1', { exact: true }).fill('Separar o material');
  await add.click();
  await form.getByLabel('Passo 2', { exact: true }).fill('Organizar a mesa');
  await form
    .getByRole('button', { name: 'Mover passo 2 para cima', exact: true })
    .click();
  await expect(form.getByLabel('Passo 1', { exact: true })).toHaveValue(
    'Organizar a mesa',
  );
  const listBox = (await form.locator('.step-builder ol').boundingBox())!;
  const addBox = (await add.boundingBox())!;
  expect(addBox.y - (listBox.y + listBox.height)).toBeGreaterThanOrEqual(12);
  await add.scrollIntoViewIfNeeded();
  await capture(page, 'steps');
  await form.getByRole('tab', { name: 'Planejamento', exact: true }).click();
  await clickTime(
    page,
    form.getByLabel('Início desejado', { exact: true }),
    '08:30',
  );
  await capture(page, 'planning');
  await save(form);
  await save(await newMission(page, 'Respirar com calma'));
  await page.getByRole('tab', { name: 'Agenda', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Com horário 1', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Horário flexível 1', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.timeline')).toContainText('08:30');
  await capture(page, 'agenda');
  await page.getByRole('tab', { name: 'Lista', exact: true }).click();
  await page
    .getByRole('button', { name: 'Ações para Respirar com calma', exact: true })
    .click();
  const menu = page.getByRole('dialog', {
    name: 'Menu: Ações para Respirar com calma',
    exact: true,
  });
  await expect(
    menu.getByRole('button', { name: 'Tirar de hoje', exact: true }),
  ).toBeVisible();
  await capture(page, 'menu');
  await page.keyboard.press('Escape');
  await expect(menu).not.toBeVisible();
});

test('horário da missão nova na rotina é editável, herdado na sequência e persistido', async ({
  page,
}) => {
  await instrumentPicker(page);
  await page.goto('/missoes?view=routines');
  await page.getByRole('button', { name: 'Nova rotina', exact: true }).click();
  const routine = page.locator('.routine-form');
  await routine
    .getByLabel('Nome da rotina', { exact: true })
    .fill('Cuidar do meu dia');
  await routine
    .getByRole('button', { name: 'Criar missão na rotina', exact: true })
    .click();
  const form = page.getByRole('dialog', {
    name: 'Uma nova missão',
    exact: true,
  });
  await form.getByLabel('O que você quer fazer?').fill('Pausa consciente');
  await form.getByRole('tab', { name: 'Planejamento', exact: true }).click();
  await clickTime(
    page,
    form.getByLabel('Início desejado', { exact: true }),
    '11:15',
  );
  await save(form);
  const time = routine.getByLabel('Horário de Pausa consciente', {
    exact: true,
  });
  await expect(time).toHaveValue('11:15');
  await clickTime(page, time, '12:30');
  await capture(page, 'routine');
  await routine
    .getByRole('button', { name: 'Salvar rotina', exact: true })
    .click();
  await expect(routine).not.toBeVisible();
  await page.reload();
  await page
    .getByRole('button', { name: 'Editar rotina', exact: true })
    .click();
  await expect(time).toHaveValue('12:30');
});

test('gestão fica após a execução e exclusão continua exigindo confirmação explícita', async ({
  page,
}) => {
  await page.goto('/missoes');
  await save(await newMission(page, 'Comer uma maçã'));
  await page.getByRole('link', { name: 'Comer uma maçã', exact: true }).click();
  const heading = page.getByRole('heading', {
    name: 'Comer uma maçã',
    exact: true,
  });
  await expect(heading).toBeVisible();
  const url = page.url();
  await capture(page, 'execution');
  const management = page.getByRole('region', {
    name: 'Gestão da missão',
    exact: true,
  });
  const completeBox = (await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .boundingBox())!;
  const manageBox = (await management.boundingBox())!;
  expect(manageBox.y).toBeGreaterThan(completeBox.y + completeBox.height);
  await expect(
    management.getByRole('button', { name: 'Arquivar missão', exact: true }),
  ).toBeVisible();
  await management.scrollIntoViewIfNeeded();
  await capture(page, 'management');
  await management
    .getByRole('button', { name: 'Excluir definitivamente', exact: true })
    .click();
  const confirmation = page.getByRole('dialog', {
    name: 'Remover missão',
    exact: true,
  });
  await expect(confirmation).toContainText('irreversível');
  await confirmation
    .getByRole('button', { name: 'Cancelar', exact: true })
    .click();
  await expect(heading).toBeVisible();
  await expect(page).toHaveURL(url);
});

test('editor aproveita o espaço e altera o horário da rotina pela Lista sem perder rascunho ou execução', async ({
  page,
}) => {
  await instrumentPicker(page);
  await page.goto('/missoes');
  const create = await newMission(page, 'Alongar');
  await create.getByLabel('Esforço desta missão').selectOption('micro');
  await save(create);
  await page.getByRole('tab', { name: 'Rotinas', exact: true }).click();
  await page.getByRole('button', { name: 'Nova rotina', exact: true }).click();
  const routine = page.locator('.routine-form');
  await routine
    .getByLabel('Nome da rotina', { exact: true })
    .fill('Rotina diária');
  await routine
    .getByText('Adicionar missão existente', { exact: true })
    .click();
  await routine
    .locator('.mission-results')
    .getByRole('button')
    .filter({ hasText: 'Alongar' })
    .click();
  await routine.getByLabel('Recorrência da rotina').selectOption('daily');
  await routine.getByLabel('Horário de Alongar', { exact: true }).fill('08:30');
  await routine
    .getByRole('button', { name: 'Salvar rotina', exact: true })
    .click();
  await expect(routine).not.toBeVisible();
  await page
    .locator('.routine-card')
    .getByText('Mais ações', { exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Executar rotina', exact: true })
    .click();
  await expect(page).toHaveURL(/\/sessoes$/);
  await page.goto('/missoes');
  await page.getByRole('tab', { name: 'Todas', exact: true }).click();
  await expect(
    page.getByRole('link', { name: 'Em sessão · Rotina diária', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Ações para Alongar', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Editar missão', exact: true })
    .click();
  const edit = page.getByRole('dialog', { name: 'Editar missão', exact: true });
  await expect(
    edit.getByText('Como as alterações são aplicadas', { exact: true }),
  ).toHaveCount(0);
  const panel = (await edit.locator('.mission-editor').boundingBox())!;
  const footer = (await edit.locator('footer').boundingBox())!;
  expect(footer.y - panel.y - panel.height).toBeGreaterThanOrEqual(8);
  expect(footer.y - panel.y - panel.height).toBeLessThanOrEqual(24);
  await capture(page, 'edit-layout');
  await edit.getByRole('tab', { name: 'Planejamento', exact: true }).click();
  await clickTime(
    page,
    edit.getByLabel('Início desejado', { exact: true }),
    '14:45',
  );
  await capture(page, 'edit-time');
  await edit
    .getByRole('button', { name: 'Salvar missão', exact: true })
    .click();
  await expect(edit).not.toBeVisible();
  await expect(page).toHaveURL(/\/missoes$/);
  await expect(
    page.locator('.mission-row').filter({ hasText: 'Alongar' }),
  ).toContainText('14:45');
  await page.goto('/missoes?view=routines');
  await page
    .getByRole('button', { name: 'Editar rotina', exact: true })
    .click();
  await expect(
    routine.getByLabel('Horário de Alongar', { exact: true }),
  ).toHaveValue('14:45');
  await routine
    .getByLabel('Nome da rotina', { exact: true })
    .fill('Rascunho preservado');
  await routine
    .getByRole('button', { name: 'Editar Alongar', exact: true })
    .click();
  await edit.getByRole('tab', { name: 'Planejamento', exact: true }).click();
  await edit.getByLabel('Início desejado', { exact: true }).fill('15:10');
  await edit
    .getByRole('button', { name: 'Salvar missão', exact: true })
    .click();
  await expect(edit).not.toBeVisible();
  await expect(
    routine.getByLabel('Nome da rotina', { exact: true }),
  ).toHaveValue('Rascunho preservado');
  await expect(
    routine.getByLabel('Horário de Alongar', { exact: true }),
  ).toHaveValue('15:10');
  await routine
    .getByRole('button', { name: 'Salvar rotina', exact: true })
    .click();
  await expect(routine).not.toBeVisible();
  await page.goto('/sessoes');
  await expect(page.locator('.activity-identity')).toContainText('08:30');
});
