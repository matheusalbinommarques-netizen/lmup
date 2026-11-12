import { expect, test } from '@playwright/test';

// D04: abas não são ações. Dados sintéticos em contexto descartável.
test('abas de Missões têm papel de aba, setas do teclado e visual distinto da ação', async ({
  page,
}) => {
  await page.goto('/missoes');
  const views = page.getByRole('tablist', {
    name: 'Visualização das missões',
  });
  const list = views.getByRole('tab', { name: 'Lista', exact: true });
  await expect(list).toHaveAttribute('aria-selected', 'true');
  // Roving tabindex: só a aba selecionada entra na ordem do Tab.
  await expect(views.locator('[role="tab"][tabindex="0"]')).toHaveCount(1);

  await list.focus();
  await page.keyboard.press('ArrowRight');
  const agenda = views.getByRole('tab', { name: 'Agenda', exact: true });
  await expect(agenda).toBeFocused();
  await expect(agenda).toHaveAttribute('aria-selected', 'true');
  await expect(page).toHaveURL(/view=agenda/);
  await page.keyboard.press('End');
  await expect(
    views.getByRole('tab', { name: 'Áreas', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(list).toBeFocused();
  await expect(list).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Home');
  await expect(list).toHaveAttribute('aria-selected', 'true');

  // A aba selecionada não usa o gradiente do botão de ação.
  const action = page
    .getByRole('button', { name: 'Nova missão', exact: true })
    .first();
  const [tabFill, actionFill] = await Promise.all([
    list.evaluate((node) => getComputedStyle(node).backgroundImage),
    action.evaluate((node) => getComputedStyle(node).backgroundImage),
  ]);
  expect(actionFill).toContain('gradient');
  expect(tabFill).toBe('none');

  const status = page.getByRole('tablist', { name: 'Agenda de missões' });
  await status.getByRole('tab', { name: 'Concluídas', exact: true }).click();
  await expect(
    status.getByRole('tab', { name: 'Concluídas', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(
    status.getByRole('tab', { name: 'Pendentes', exact: true }),
  ).toHaveAttribute('aria-selected', 'false');
});
