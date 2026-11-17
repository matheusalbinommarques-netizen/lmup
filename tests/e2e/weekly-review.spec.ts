import { expect, test, type Page } from '@playwright/test';
import { expectNoPageOverflow } from './layout-guards';

// Segunda, 16 de novembro de 2026: a revisão da vez é a semana de 8 a 14.
const TODAY = '2026-11-16';

async function open(page: Page) {
  await page.clock.setFixedTime(new Date(`${TODAY}T10:00:00-03:00`));
  await page.goto('/evolucao');
  await expect(
    page.getByRole('region', { name: 'Revisão semanal' }),
  ).toBeVisible();
}

/** Revisão antiga, uma rotina parada e uma captura antiga na caixa. */
async function seed(page: Page) {
  await open(page);
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const tx = database.transaction(
            ['tasks', 'planVersions', 'routines', 'profile'],
            'readwrite',
          );
          const base = {
            source: 'personal',
            xp: 50,
            effort: 'small',
            rarity: 'common',
            completed: false,
            status: 'available',
            productivityVersion: 1,
            tracking: { method: 'direct' },
            plannedTime: null,
            estimatedMinutes: null,
            createdAt: '2026-10-20T12:00:00.000Z',
          };
          const tasks = tx.objectStore('tasks');
          const stretch = {
            ...base,
            id: 9601,
            title: 'Alongar',
            routineId: 'noite',
            plannedDate: '2026-11-01',
            recurrence: {
              kind: 'weekdays',
              startDate: '2026-11-01',
              days: [0, 1, 2, 3, 4, 5, 6],
            },
          };
          tasks.put(stretch);
          // Sem versão registrada o app não deduz o plano de dias passados.
          tx.objectStore('planVersions').put({
            sequence: 1,
            id: 'plan-9601',
            taskId: 9601,
            effectiveFrom: '2026-11-01',
            recordedAt: '2026-11-01T12:00:00.000Z',
            definition: stretch,
          });
          tasks.put({
            ...base,
            id: 9602,
            title: 'Trocar a lâmpada da área',
            plannedDate: null,
            recurrence: null,
          });
          tx.objectStore('routines').put({
            id: 'noite',
            name: 'Rotina da noite',
            description: '',
            defaultAreaId: 0,
            days: [0, 1, 2, 3, 4, 5, 6],
            startDate: '2026-11-01',
            status: 'active',
            entries: [{ taskId: 9601, time: null, previousPlan: {} }],
            pauseQuota: 2,
            pausePeriodDays: 30,
            revision: 1,
            createdAt: '2026-11-01T12:00:00.000Z',
          });
          const profile = tx.objectStore('profile');
          const get = profile.get(1);
          get.onsuccess = () =>
            profile.put({
              ...get.result,
              weeklyReview: {
                version: 1,
                reviews: [
                  {
                    week: '2026-10-25',
                    startedAt: '2026-11-01T13:00:00.000Z',
                    doneAt: '2026-11-01T13:05:00.000Z',
                    skipped: [],
                    decisions: [],
                  },
                ],
              },
            });
          tx.oncomplete = () => {
            database.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
  );
  await page.reload();
}

const card = (page: Page) =>
  page.getByRole('region', { name: 'Revisão semanal' });

test('nunca feita: dá para pular os três passos e concluir', async ({
  page,
}) => {
  await open(page);
  await expect(card(page)).toContainText('Uma vez por semana');
  await card(page).getByRole('link', { name: 'Experimentar agora' }).click();
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'A semana de 8 a 14 de novembro',
    }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Pular este passo' }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Como estão as áreas?' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Pular este passo' }).click();
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Ajustes para a próxima semana',
    }),
  ).toBeVisible();
  await expect(page.getByText('Nada pede ajuste nesta semana.')).toBeVisible();
  await page.getByRole('button', { name: 'Pular e concluir' }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Revisão concluída' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Voltar à Evolução' }).click();
  await expect(card(page)).toContainText(
    'Revisão da semana feita em 16 de nov.',
  );
  await expect(card(page)).toContainText(
    'Próxima: a partir de sábado, 21 de nov.',
  );
  // Sem contar atraso nem acumular semanas: só a semana da vez.
  await page.reload();
  await expect(
    card(page).getByRole('link', { name: 'Fazer agora' }),
  ).toBeVisible();
});

test('disponível: aceitar executa com confirmação, recusar só registra e nada se repete', async ({
  page,
}) => {
  await seed(page);
  await expect(card(page)).toContainText('Disponível desde sábado, 14 de nov.');
  await expect(card(page)).toContainText('Última: domingo, 1 de nov.');
  await card(page).getByRole('link', { name: 'Fazer a revisão' }).click();

  // Passo 1: a rotina não foi feita; nada concluído, nenhum dia com ação.
  await expect(page.getByText('0 de 7', { exact: true })).toHaveCount(2);
  await page.getByRole('button', { name: 'Próximo: a Roda' }).click();

  // Passo 2: a nota só é gravada ao sair do passo.
  await page
    .getByRole('combobox', { name: 'Sentimento em Casa' })
    .selectOption('6');
  await page.getByRole('button', { name: 'Próximo: a próxima semana' }).click();

  // Passo 3: a rotina pede confirmação antes de mudar.
  const routine = page.locator('section.card', { hasText: 'Rotina da noite' });
  await expect(routine).toContainText('concluída em 0 de 7 dias');
  await routine.getByRole('button', { name: 'Só dias úteis' }).click();
  const confirm = page.getByRole('alertdialog', { name: 'Confirmar' });
  await expect(confirm).toContainText('passa a valer de segunda a sexta');
  await confirm.getByRole('button', { name: 'Cancelar' }).click();
  await expect(confirm).toHaveCount(0);
  await routine.getByRole('button', { name: 'Só dias úteis' }).click();
  await confirm.getByRole('button', { name: 'Confirmar' }).click();
  await expect(routine).toContainText('Feito: só dias úteis.');

  // Triagem: escolher Algum dia executa; nada é arquivado sem confirmar.
  const triage = page.locator('li', { hasText: 'Trocar a lâmpada da área' });
  await expect(triage).toContainText('na caixa há 27 dias');
  await triage.getByRole('button', { name: 'Algum dia' }).click();
  // Sai da caixa; o aviso diz o que foi feito.
  await expect(page.getByRole('status')).toHaveText(
    'Trocar a lâmpada da área foi para Algum dia.',
  );
  await expect(triage).toHaveCount(0);
  await page.getByRole('button', { name: 'Concluir revisão' }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Revisão concluída' }),
  ).toBeVisible();

  // O que mudou de fato: rotina, caixa e Roda.
  const stored = await page.evaluate(
    () =>
      new Promise<{
        days: number[];
        someday: boolean;
        rating: number;
        review: {
          week: string;
          decisions: { id: string; outcome: string }[];
        }[];
      }>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const tx = database.transaction(
            ['routines', 'tasks', 'profile'],
            'readonly',
          );
          const out: Record<string, unknown> = {};
          const r = tx.objectStore('routines').get('noite');
          r.onsuccess = () => (out.days = r.result.days);
          const t = tx.objectStore('tasks').get(9602);
          t.onsuccess = () => (out.someday = !!t.result.someday);
          const p = tx.objectStore('profile').get(1);
          p.onsuccess = () => {
            const wheel = p.result.lifeWheel;
            out.rating = wheel.checkins.at(-1).ratings.home;
            out.review = p.result.weeklyReview.reviews;
          };
          tx.oncomplete = () => {
            database.close();
            resolve(out as never);
          };
        };
      }),
  );
  expect(stored.days).toEqual([1, 2, 3, 4, 5]);
  expect(stored.someday).toBe(true);
  expect(stored.rating).toBe(6);
  expect(stored.review.map((row) => row.week)).toEqual([
    '2026-10-25',
    '2026-11-08',
  ]);
  expect(stored.review[1].decisions).toEqual([
    expect.objectContaining({ id: 'routine:noite', outcome: 'accepted' }),
    expect.objectContaining({ id: 'triage:9602', outcome: 'accepted' }),
  ]);

  // Refazer a mesma semana mostra o que foi decidido e não aplica de novo.
  await page.goto('/revisao-semanal');
  await page.getByRole('button', { name: 'Pular este passo' }).click();
  await page.getByRole('button', { name: 'Pular este passo' }).click();
  await expect(
    page.locator('section.card', { hasText: 'Rotina da noite' }),
  ).toContainText('Feito: só dias úteis.');
  await expect(page.getByText('Trocar a lâmpada da área')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Só dias úteis' })).toHaveCount(
    0,
  );
});

test('recusar registra a decisão e ignorar não grava nada', async ({
  page,
}) => {
  await seed(page);
  await page.goto('/revisao-semanal');
  await page.getByRole('button', { name: 'Pular este passo' }).click();
  await page.getByRole('button', { name: 'Pular este passo' }).click();
  const routine = page.locator('section.card', { hasText: 'Rotina da noite' });
  await routine.getByRole('button', { name: 'Manter' }).click();
  await expect(routine).toContainText('Decidido: manter como está.');
  // A captura antiga fica sem ação: ignorar.
  await page.getByRole('button', { name: 'Concluir revisão' }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Revisão concluída' }),
  ).toBeVisible();
  const review = await page.evaluate(
    () =>
      new Promise<{
        days: number[];
        entry: {
          skipped: string[];
          decisions: { id: string; outcome: string }[];
        };
      }>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const tx = database.transaction(['routines', 'profile'], 'readonly');
          const out: Record<string, unknown> = {};
          const r = tx.objectStore('routines').get('noite');
          r.onsuccess = () => (out.days = r.result.days);
          const p = tx.objectStore('profile').get(1);
          p.onsuccess = () =>
            (out.entry = p.result.weeklyReview.reviews.find(
              (row: { week: string }) => row.week === '2026-11-08',
            ));
          tx.oncomplete = () => {
            database.close();
            resolve(out as never);
          };
        };
      }),
  );
  expect(review.days).toEqual([0, 1, 2, 3, 4, 5, 6]);
  expect(review.entry.skipped).toEqual(['week', 'wheel']);
  expect(review.entry.decisions).toEqual([
    expect.objectContaining({ id: 'routine:noite', outcome: 'declined' }),
  ]);
});

test('320 px com texto a 200%: cartão e passos sem transbordo', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await seed(page);
  await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
  await card(page).scrollIntoViewIfNeeded();
  await expectNoPageOverflow(page, 'cartão');
  await card(page).getByRole('link', { name: 'Fazer a revisão' }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: /A semana de/ }),
  ).toBeVisible();
  await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
  await expectNoPageOverflow(page, 'passo 1');
  await page.getByRole('button', { name: 'Próximo: a Roda' }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Como estão as áreas?' }),
  ).toBeVisible();
  await expectNoPageOverflow(page, 'passo 2');
  await page.getByRole('button', { name: 'Próximo: a próxima semana' }).click();
  await page
    .locator('section.card', { hasText: 'Rotina da noite' })
    .getByRole('button', { name: 'Só dias úteis' })
    .click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await expectNoPageOverflow(page, 'passo 3 com confirmação');
});
