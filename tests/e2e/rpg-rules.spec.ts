import { expect, test, type Page } from '@playwright/test';
import { investigate, resolveInvestigation, worldData } from './world-flow';

// These rules cover the playable Oásis campaign. The old non-canonical
// /aventura pilot has an XP-gated chapter and needs a separate product decision.
const taskGate =
  /(?:conclua|complete|faça|realize)\s+\d+\s+(?:missões|tarefas|atividades)\s+para\s+(?:continuar|avançar|liberar|acessar)/i;

async function expectNoTaskGate(page: Page) {
  await expect(page.locator('body')).not.toContainText(taskGate);
  await expect(page.locator('body')).not.toContainText(
    /(?:energia insuficiente|volte amanhã para jogar)/i,
  );
}

async function realMissionCount(page: Page) {
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

test('E01: campanha do Oásis termina com zero missões e não regride após meses', async ({
  page,
}) => {
  // Fix the clock so the same test covers idle time on any calendar day.
  await page.clock.install({ time: new Date('2026-11-09T12:00:00-03:00') });
  await page.goto('/mundo');
  await expect(
    page.getByRole('button', { name: 'Entrar no assentamento', exact: true }),
  ).toBeEnabled();
  const before = await worldData(page);
  expect(await realMissionCount(page)).toBe(0);
  expect(before.events).toHaveLength(0);
  expect(before.profile.totalXpEarned ?? 0).toBe(0);
  await expectNoTaskGate(page);

  await investigate(page);
  const active = (await worldData(page)).profile.world;
  expect(active.quest).toBe('active');
  expect(active.clues).toEqual(['axle', 'cargo', 'tracks']);
  await expectNoTaskGate(page);

  // No visit for 45 days: clues, journal and choices remain exactly as saved.
  await page.clock.setFixedTime(new Date('2026-12-24T12:00:00-03:00'));
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Continuar exploração', exact: true }),
  ).toBeVisible();
  expect((await worldData(page)).profile.world).toEqual(active);

  await page
    .getByRole('button', { name: 'Continuar exploração', exact: true })
    .click();
  await resolveInvestigation(page);
  const solved = (await worldData(page)).profile.world;
  expect(solved.quest).toBe('solved');
  expect(solved.resolution).toBe('route');
  await expectNoTaskGate(page);

  // A further prolonged absence cannot undo a decision or expire resources.
  await page.clock.setFixedTime(new Date('2027-03-01T12:00:00-03:00'));
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Mundo', level: 1, exact: true }),
  ).toBeVisible();
  const after = await worldData(page);
  expect(after.profile.world).toEqual(solved);
  expect(await realMissionCount(page)).toBe(0);
  expect(after.events).toEqual(before.events);
  const { world: currentWorld, ...currentProfile } = after.profile;
  const { world: initialWorld, ...initialProfile } = before.profile;
  expect(currentWorld.quest).toBe('solved');
  expect(initialWorld.quest).toBe('new');
  expect(currentProfile).toEqual(initialProfile);
  await expectNoTaskGate(page);
});

test('E01: missões, rotina, sessão e recompensa funcionam sem abrir o Mundo', async ({
  page,
}) => {
  // World destinations are inaccessible throughout this productivity journey.
  await page.route('**/mundo**', (route) => route.abort());
  await page.route('**/aventura**', (route) => route.abort());

  await page.goto('/missoes');
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
  await expect(
    page.getByRole('region', { name: 'Resumo da recompensa' }),
  ).toBeVisible();

  await page.goto('/missoes');
  await expect(
    page.getByRole('button', { name: 'Rotinas', exact: true }),
  ).toBeVisible();
  const progress = await worldData(page);
  expect(progress.profile.world).toBeUndefined();
  expect(progress.events.length).toBeGreaterThan(0);
  expect(progress.profile.totalXpEarned).toBeGreaterThan(0);
});
