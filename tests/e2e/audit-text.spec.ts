import { expect, test } from '@playwright/test';
import { seedAuditText } from './audit-text-fixture';

test('A04: progresso apresenta meses, singular e datas acessíveis em português', async ({
  page,
}) => {
  await seedAuditText(page);
  await page.goto('/progresso');
  const report = page.locator('.productivity-progress');
  await report
    .getByText('Tendências semanais, mensais e horários', { exact: true })
    .click();
  await expect(
    report.getByText('outubro de 2026: 1 ocorrência concluída.', {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    report.getByText('novembro de 2026: 2 ocorrências concluídas.', {
      exact: true,
    }),
  ).toBeVisible();
  const labels = await report
    .locator('progress')
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('aria-label') ?? ''),
    );
  expect(labels.length).toBeGreaterThan(0);
  for (const label of labels)
    expect(label).toMatch(/^Conclusões na semana de \d{2}\/\d{2}\/\d{4}$/);
});

test('A04: recorrência individual não é apresentada como rotina', async ({
  page,
}) => {
  await seedAuditText(page);
  await page.goto('/missoes');
  await page.getByRole('tab', { name: 'Concluídas', exact: true }).click();
  const individual = page
    .locator('.history-row')
    .filter({ hasText: 'Caminhada recorrente sem rotina' });
  const routine = page
    .locator('.history-row')
    .filter({ hasText: 'Alongamento da rotina' });
  await expect(individual).toContainText('Concluída');
  await expect(individual).not.toContainText('Rotina realizada');
  await expect(routine).toContainText('Rotina realizada');
});
