import { test, expect, type Page } from '@playwright/test';
async function prepare(page: Page) {
  await page.goto('/missoes');
  for (const title of ['Beber água', 'Comer uma fruta']) {
    await page
      .getByRole('button', { name: 'Nova missão', exact: true })
      .click();
    const form = page.getByRole('dialog', {
      name: 'Uma nova missão',
      exact: true,
    });
    await form.getByLabel('O que você quer fazer?').fill(title);
    await form.getByLabel('Esforço desta missão').selectOption('micro');
    await form
      .getByRole('button', { name: 'Criar missão', exact: true })
      .click();
    await expect(form).not.toBeVisible();
  }
  await page
    .getByRole('button', { name: 'Selecionar para sessão', exact: true })
    .click();
  for (const title of ['Beber água', 'Comer uma fruta'])
    await page
      .getByLabel(`Incluir ${title} na sessão`, { exact: true })
      .check();
  await page
    .getByRole('button', { name: 'Iniciar sessão', exact: true })
    .click();
  await expect(page).toHaveURL(/\/sessoes$/);
}
async function data(page: Page) {
  return page.evaluate(
    () =>
      new Promise<Record<string, any[]>>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onsuccess = () => {
          const db = request.result,
            names = [
              'profile',
              'occurrences',
              'activityEvents',
              'savedMissionSessions',
            ],
            tx = db.transaction(names),
            result: Record<string, any[]> = {};
          for (const name of names) {
            const q = tx.objectStore(name).getAll();
            q.onsuccess = () => (result[name] = q.result);
          }
          tx.oncomplete = () => {
            db.close();
            resolve(result);
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
  );
}
test('conclusão rápida avança na sessão, pausa e retoma com progresso real e sem prêmio duplicado', async ({
  page,
}) => {
  await prepare(page);
  await expect(
    page.getByRole('button', { name: 'Conclusão rápida', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  const complete = page.getByRole('button', {
    name: 'Concluir missão',
    exact: true,
  });
  const box = await complete.boundingBox();
  expect(box!.y + box!.height).toBeLessThan(page.viewportSize()!.height - 70);
  await complete.click();
  await expect(
    page.getByRole('heading', { name: 'Comer uma fruta', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.session-progress')).toContainText(
    '1 de 2 concluídas',
  );
  await expect(page.getByRole('status')).toContainText('Beber água concluída');
  await expect(page).toHaveURL(/\/sessoes$/);
  const balance = (await data(page)).profile[0];
  await page.getByRole('button', { name: 'Anterior', exact: true }).click();
  await page
    .getByRole('button', { name: 'Execução detalhada', exact: true })
    .click();
  await expect(
    page.getByRole('region', { name: 'Resumo da recompensa' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Conclusão rápida', exact: true })
    .click();
  expect((await data(page)).profile[0]).toEqual(balance);
  await page
    .getByRole('button', { name: 'Pausar sessão', exact: true })
    .click();
  await expect(page).toHaveURL(/view=sessions/);
  await page.goto('/missoes?view=sessions');
  const card = page.locator('.saved-session-card');
  await expect(card).toContainText('1 de 2 concluídas');
  await expect(card).toContainText('Pausada');
  await card.getByRole('button', { name: 'Retomar', exact: true }).click();
  await page
    .getByRole('button', { name: 'Próxima atividade', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Sessão concluída', exact: true }),
  ).toBeVisible();
  const before = (await data(page)).profile[0];
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Nenhuma sessão em foco.', exact: true }),
  ).toBeVisible();
  expect((await data(page)).profile[0]).toEqual(before);
  expect((await data(page)).activityEvents).toHaveLength(2);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});
test('sequência permite organizar, remover vínculo e registrar progresso no próprio contexto', async ({
  page,
}) => {
  await prepare(page);
  const queue = page.locator('.queue-panel');
  if (!(await queue.evaluate((el) => (el as HTMLDetailsElement).open)))
    await queue.locator('summary').click();
  await page
    .getByRole('button', { name: 'Organizar Beber água', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Mover Beber água para baixo', exact: true })
    .click();
  await expect
    .poll(async () => (await data(page)).savedMissionSessions[0].cursor)
    .toBe(1);
  await page
    .getByRole('button', {
      name: 'Ações da atividade selecionada',
      exact: true,
    })
    .click();
  await page
    .getByRole('button', { name: 'Registrar progresso parcial', exact: true })
    .click();
  await expect(page.locator('.occurrence-execution')).toBeVisible();
  await page
    .getByRole('button', { name: 'Conclusão rápida', exact: true })
    .click();
  await page
    .getByRole('button', {
      name: 'Ações da atividade selecionada',
      exact: true,
    })
    .click();
  await page
    .getByRole('dialog', {
      name: 'Menu: Ações da atividade selecionada',
      exact: true,
    })
    .getByRole('button', { name: 'Remover da sessão', exact: true })
    .click();
  await expect
    .poll(
      async () =>
        (await data(page)).savedMissionSessions[0].occurrenceIds.length,
    )
    .toBe(1);
  expect((await data(page)).occurrences).toHaveLength(2);
  expect((await data(page)).activityEvents).toHaveLength(0);
  await expect(page).toHaveURL(/\/sessoes$/);
});
