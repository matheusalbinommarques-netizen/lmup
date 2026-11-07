import { expect, test, type Page } from '@playwright/test';
import { investigate, resolveInvestigation, worldData } from './world-flow';

// E01 protects the playable Oásis investigation. These checks are deliberately
// scoped to current content; they do not certify unwritten future chapters.
const prohibitedGates = [
  /(?:conclua|complete|faça|realize)\s+(?:mais\s+)?\d+\s+(?:missões|tarefas|atividades)/i,
  /\b\d+\s*(?:missões|tarefas|atividades)\b.{0,80}\b(?:continuar|avançar|liberar|desbloquear|acessar)\b/i,
  /\b(?:precisa|exige|requer|alcance|acumule|ganhe|obtenha)\b.{0,60}\b\d+\s*XP\b.{0,80}\b(?:continuar|avançar|liberar|desbloquear|acessar)\b/i,
  /\b\d+\s*XP\b.{0,60}\b(?:para|até)\s+(?:continuar|avançar|liberar|desbloquear|acessar)/i,
  /(?:energia insuficiente|volte amanhã para jogar|tempo de jogo esgotado)/i,
  /(?:você perdeu.*por ficar sem jogar|penalidade por inatividade|dias sem jogar.*perdeu)/i,
];

async function expectFreeWorld(page: Page) {
  const content = await page.locator('.world-experience').innerText();
  for (const gate of prohibitedGates) expect(content).not.toMatch(gate);
  // Do not accidentally bring back the retired chapter progression.
  await expect(page.locator('.rpg-chapter-state')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Piloto experimental de Védria/ })).toHaveCount(0);
}

async function expectCampaign(page: Page) {
  await expect(page).toHaveURL(/\/mundo\/campanha$/);
  await expect(
    page.getByRole('heading', { name: 'Aventura nos Ermos', level: 1, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Investigação atual', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Diário da campanha', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Abrir Mundo', exact: true }))
    .toHaveAttribute('href', '/mundo');
  await expectFreeWorld(page);
}

async function taskCount(page: Page) {
  return page.evaluate(
    () =>
      new Promise<number>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('tasks', 'readonly');
          const count = tx.objectStore('tasks').count();
          tx.oncomplete = () => {
            db.close();
            resolve(count.result);
          };
          tx.onerror = () => {
            db.close();
            reject(tx.error);
          };
        };
      }),
  );
}

// Both endings must be obtainable with no real-life task or XP. The dialogue
// requirements (visiting places and gathering clues) are narrative choices,
// not a productivity gate.
for (const resolution of ['route', 'rescue'] as const) {
  test(`E01: Oásis chega ao desfecho ${resolution} com zero missões e preserva estado após meses`, async ({
    page,
  }) => {
    await page.clock.install({ time: new Date('2026-11-09T12:00:00-03:00') });
    await page.goto('/mundo/campanha');
    await expectCampaign(page);
    const before = await worldData(page);
    expect(before.profile.world.quest).toBe('new');
    expect(before.profile.totalXpEarned).toBe(0);
    expect(before.events).toHaveLength(0);
    expect(await taskCount(page)).toBe(0);

    await page.getByRole('link', { name: 'Abrir Mundo', exact: true }).click();
    await expectFreeWorld(page);
    await expect(
      page.getByRole('button', { name: 'Entrar no assentamento', exact: true }),
    ).toBeEnabled();
    await investigate(page);
    const active = (await worldData(page)).profile.world;
    expect(active.quest).toBe('active');
    expect(active.clues).toEqual(['axle', 'cargo', 'tracks']);
    await expectFreeWorld(page);

    // Resume from the canonical campaign after 45 days away.
    await page.clock.setFixedTime(new Date('2026-12-24T12:00:00-03:00'));
    await page.goto('/mundo/campanha');
    await expectCampaign(page);
    expect((await worldData(page)).profile.world).toEqual(active);
    expect(await taskCount(page)).toBe(0);
    await page.getByRole('link', { name: 'Abrir Mundo', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Continuar exploração', exact: true }),
    ).toBeVisible();
    await page
      .getByRole('button', { name: 'Continuar exploração', exact: true })
      .click();
    await resolveInvestigation(page, resolution);
    const solved = (await worldData(page)).profile.world;
    expect(solved.quest).toBe('solved');
    expect(solved.resolution).toBe(resolution);
    expect(solved.journal.some((entry: { id: string }) => entry.id === 'quest:solved'))
      .toBe(true);
    await expectFreeWorld(page);

    // Neither ending nor XP/resources may regress after a further absence.
    await page.clock.setFixedTime(new Date('2027-03-01T12:00:00-03:00'));
    await page.goto('/mundo/campanha');
    await expectCampaign(page);
    await expect(
      page.getByText('Investigação concluída', { exact: true }),
    ).toBeVisible();
    const after = await worldData(page);
    expect(after.profile.world).toEqual(solved);
    expect(after.events).toEqual(before.events);
    expect(await taskCount(page)).toBe(0);
    const { world: savedWorld, ...afterProfile } = after.profile;
    const { world: originalWorld, ...beforeProfile } = before.profile;
    expect(savedWorld.quest).toBe('solved');
    expect(originalWorld.quest).toBe('new');
    expect(afterProfile).toEqual(beforeProfile);
  });
}

test('E01: produtividade funciona sem visitar o Mundo nem depender de sua inicialização', async ({
  page,
}) => {
  // Fail accidental document requests to any World or retired adventure route.
  await page.route('**/mundo**', (route) => route.abort());
  await page.route('**/aventura**', (route) => route.abort());

  await page.goto('/missoes');
  const before = await worldData(page);
  expect(before.profile.world).toBeUndefined();

  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const form = page.getByRole('dialog', {
    name: 'Uma nova missão',
    exact: true,
  });
  await form
    .getByLabel('O que você quer fazer?')
    .fill('Beber água sem abrir o Mundo');
  await form.getByLabel('Esforço desta missão').selectOption('micro');
  await form.getByRole('button', { name: 'Criar missão', exact: true }).click();
  await expect(form).not.toBeVisible();

  await page.getByRole('button', { name: 'Rotinas', exact: true }).click();
  await page.getByRole('button', { name: 'Nova rotina', exact: true }).click();
  const routine = page.locator('.routine-form');
  await routine
    .getByLabel('Nome da rotina', { exact: true })
    .fill('Minha rotina independente');
  await routine.getByLabel('Recorrência da rotina').selectOption('daily');
  await routine
    .getByText('Adicionar missão existente', { exact: true })
    .click();
  await routine
    .locator('.mission-results')
    .getByRole('button')
    .filter({ hasText: 'Beber água sem abrir o Mundo' })
    .click();
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
  await page
    .getByRole('button', { name: 'Execução detalhada', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  // A one-mission session closes automatically and shows a session receipt.
  await expect(
    page.getByRole('heading', { name: 'Sessão concluída', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Resumo da sessão', exact: true }),
  ).toContainText('1 concluídas');

  await page.goto('/missoes');
  const after = await worldData(page);
  expect(after.profile.world).toBeUndefined();
  expect(await taskCount(page)).toBeGreaterThan(0);
  expect(after.events.length).toBeGreaterThan(before.events.length);
  expect(after.profile.totalXpEarned).toBeGreaterThan(before.profile.totalXpEarned);
});
