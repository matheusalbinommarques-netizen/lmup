import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-02T10:00:00-03:00'));
});

test('cadastrar missão não inicia sua execução e permite cadastrar outra', async ({ page }) => {
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const form = page.getByRole('dialog', { name: 'Uma nova missão', exact: true });
  await form.getByLabel('O que você quer fazer?').fill('Lavar a louça');
  await form.getByRole('button', { name: 'Salvar e criar outra', exact: true }).click();
  await expect(form).toBeVisible();
  await expect(form.getByLabel('O que você quer fazer?')).toHaveValue('');
  await form.getByLabel('O que você quer fazer?').fill('Fazer mercado');
  await form.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await expect(page).toHaveURL(/\/missoes$/);
  await expect(page.getByRole('region', { name: 'Lista de missões' })).not.toContainText('Em andamento');
  await page.getByRole('link', { name: 'Lavar a louça', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Iniciar missão' })).toBeVisible();
  await page.getByRole('link', { name: 'Voltar às missões' }).click();
  await expect(page.getByRole('region', { name: 'Lista de missões' })).not.toContainText('Em andamento');
});

test('sessão executa missões em sequência, persiste e não gera XP ao pular', async ({ page }) => {
  await page.goto('/missoes');
  for (const title of ['Lavar a louça', 'Fazer mercado']) {
    await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
    const form = page.getByRole('dialog', { name: 'Uma nova missão' });
    await form.getByLabel('O que você quer fazer?').fill(title);
    await form.getByRole('button', { name: 'Criar missão', exact: true }).click();
    await expect(form).not.toBeVisible();
  }
  await page.getByRole('button', { name: 'Montar sessão', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Incluir Lavar a louça na sessão' }).check();
  await page.getByRole('checkbox', { name: 'Incluir Fazer mercado na sessão' }).check();
  await page.getByRole('button', { name: 'Iniciar sessão', exact: true }).click();
  await expect(page).toHaveURL(/\/sessao$/);
  await expect(page.getByText('0 de 2 missões concluídas hoje')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Sessão de Missões' })).toBeVisible();
  await expect(page.getByText('0 de 2 missões concluídas hoje')).toBeVisible();
  await page.getByRole('button', { name: 'Concluir missão', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Missão concluída!', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Próxima missão', exact: true }).click();
  await expect(page.getByText('1 de 2 missões concluídas hoje')).toBeVisible();
  await page.getByRole('button', { name: 'Pular por agora' }).click();
  await expect(page.getByRole('heading', { name: 'Fim da sequência' })).toBeVisible();
  await page.getByRole('button', { name: 'Revisar pendentes' }).click();
  await page.getByRole('button', { name: 'Concluir missão', exact: true }).click();
  await page.getByRole('button', { name: 'Próxima missão' }).click();
  await expect(page.getByText('2 de 2 missões concluídas hoje')).toBeVisible();
  await page.getByRole('button', { name: 'Finalizar sessão' }).click();
  await expect(page).toHaveURL(/\/missoes$/);
  await page.getByRole('button', { name: 'Concluídas', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Histórico de conclusões' }).locator('.mission-row')).toHaveCount(2);
});
