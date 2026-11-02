import type { Locator } from '@playwright/test';
export async function fillMissionSteps(form: Locator, text: string) {
  const controls = form.getByRole('button', { name: /^Remover passo \d+$/ });
  while (await controls.count()) await controls.last().click();
  for (const [index, label] of text
    .split('\n')
    .filter((value) => value.trim())
    .entries()) {
    await form
      .getByRole('button', { name: '+ Adicionar passo', exact: true })
      .click();
    await form
      .getByRole('textbox', { name: `Passo ${index + 1}`, exact: true })
      .fill(label);
  }
}
export async function chooseTracking(form: Locator, method: string) {
  if (method === 'direct' || method === 'steps')
    await form
      .getByRole('radio', {
        name:
          method === 'direct' ? 'Concluir de uma vez' : 'Concluir por passos',
        exact: false,
      })
      .check();
  else {
    await form
      .getByRole('radio', { name: 'Medir progresso', exact: false })
      .check();
    await form
      .getByRole('combobox', { name: 'O que medir?', exact: true })
      .selectOption(method);
  }
}
