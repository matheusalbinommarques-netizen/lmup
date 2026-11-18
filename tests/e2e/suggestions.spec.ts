import { expect, test, type Page } from '@playwright/test';
import { expectNoPageOverflow } from './layout-guards';

// Lote 6b: sugestões de horário e duração no passo 3 da revisão semanal e
// "Pôr no Dia aos domingos". Segunda, 16/11/2026: a revisão da vez é a
// semana de 8 a 14; a janela de horário vai de 25/10 a 14/11.

async function at(page: Page, day: string, path: string) {
  await page.clock.setFixedTime(new Date(`${day}T10:00:00-03:00`));
  await page.goto(path);
}

/**
 * "Treino": marcado às 06:30 com 30 min. Seis conclusões medidas pelo
 * cronômetro, de 9 a 14/11, começando entre 07:05 e 07:25 (mediana 07:15)
 * e levando 35–55 min (as 5 últimas: 40, 45, 45, 50, 55 → 45 min).
 */
async function seed(page: Page) {
  await at(page, '2026-11-16', '/evolucao');
  await expect(
    page.getByRole('region', { name: 'Revisão semanal' }),
  ).toBeVisible();
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const tx = database.transaction(
            [
              'tasks',
              'planVersions',
              'occurrences',
              'executionRecords',
              'profile',
            ],
            'readwrite',
          );
          const treino = {
            id: 9701,
            title: 'Treino',
            areaId: 0,
            source: 'personal',
            xp: 50,
            effort: 'small',
            rarity: 'common',
            completed: false,
            status: 'available',
            productivityVersion: 1,
            definitionRevision: 1,
            tracking: { method: 'direct' },
            plannedDate: '2026-11-01',
            plannedTime: '06:30',
            estimatedMinutes: 30,
            recurrence: { kind: 'daily', startDate: '2026-11-01' },
            createdAt: '2026-11-01T12:00:00.000Z',
          };
          tx.objectStore('tasks').put(treino);
          tx.objectStore('planVersions').put({
            sequence: 1,
            id: 'plan-9701',
            taskId: 9701,
            effectiveFrom: '2026-11-01',
            recordedAt: '2026-11-01T12:00:00.000Z',
            definition: treino,
          });
          const starts = ['07:05', '07:20', '07:10', '07:25', '07:15', '07:15'];
          const minutes = [35, 40, 45, 45, 50, 55];
          starts.forEach((start, i) => {
            const day = `2026-11-${String(9 + i).padStart(2, '0')}`;
            const began = new Date(`${day}T${start}:00-03:00`);
            const ended = new Date(began.getTime() + minutes[i] * 60000);
            const id = `mission:9701:${day}`;
            tx.objectStore('occurrences').put({
              id,
              taskId: 9701,
              originDate: day,
              plannedDate: day,
              originalTime: '06:30',
              plannedTime: '06:30',
              estimatedMinutes: 30,
              title: 'Treino',
              areaId: 0,
              baseXp: 50,
              steps: [],
              checkedSteps: [],
              value: 1,
              actualMinutes: minutes[i],
              due: { xp: 0, gold: 0, food: 0 },
              tracking: { method: 'direct' },
              status: 'completed',
              revision: 1,
              completedAt: ended.toISOString(),
              completedLocalDate: day,
              createdAt: began.toISOString(),
            });
            tx.objectStore('executionRecords').put({
              id: `exec-9701-${i}`,
              occurrenceId: id,
              before: 0,
              after: 1,
              minutes: minutes[i],
              startedAt: began.toISOString(),
              executedAt: ended.toISOString(),
              localDate: day,
              localTime: '08:00',
              timezone: 'America/Sao_Paulo',
              offsetMinutes: 180,
              recordedAt: ended.toISOString(),
              correction: false,
              revision: 1,
            });
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
}

async function stepThree(page: Page) {
  await page.goto('/revisao-semanal');
  await page.getByRole('button', { name: 'Pular este passo' }).click();
  await page.getByRole('button', { name: 'Pular este passo' }).click();
  await expect(
    page.getByRole('heading', { name: 'Ajustes para a próxima semana' }),
  ).toBeVisible();
}
const timeCard = (page: Page) =>
  page.getByRole('region', { name: 'Horário · observação do cronômetro' });
const durationCard = (page: Page) =>
  page.getByRole('region', { name: 'Duração · observação do cronômetro' });

test('aceitar o horário confirma no cartão e passa à duração', async ({
  page,
}) => {
  await seed(page);
  await stepThree(page);
  await expect(timeCard(page)).toContainText(
    '“Treino” está marcada para 06:30, e nos últimos 21 dias você começou por volta de 07:15.',
  );
  await expect(timeCard(page)).toContainText(
    '6 dias com início medido pelo cronômetro, todos entre 07:05 e 07:25.',
  );
  await expect(timeCard(page)).toContainText('Mais 1 observação');
  await expectNoPageOverflow(page);
  await timeCard(page).getByRole('button', { name: 'Usar 07:15' }).click();
  await expect(timeCard(page).getByRole('alertdialog')).toContainText(
    '“Treino” passa de 06:30 para 07:15 de hoje em diante.',
  );
  await timeCard(page).getByRole('button', { name: 'Confirmar' }).click();
  await expect(page.getByText('“Treino” agora fica às 07:15.')).toBeVisible();
  await expect(durationCard(page)).toContainText(
    '“Treino” está com 30 min, e as últimas 5 conclusões medidas levaram 40, 45, 45, 50 e 55 min.',
  );
  await expect(page.getByText('Feito: 07:15 de hoje em diante.')).toBeVisible();
  await durationCard(page).getByRole('button', { name: 'Usar 45 min' }).click();
  await durationCard(page).getByRole('button', { name: 'Confirmar' }).click();
  await expect(durationCard(page)).toHaveCount(0);
  await expect(
    page.getByText('Feito: 45 min de hoje em diante.'),
  ).toBeVisible();
  // A missão mudou de hoje em diante.
  await page.goto('/');
  await expect(
    page.locator('[data-day-row="mission:9701:2026-11-16"]'),
  ).toContainText('07:15');
});

test('"Agora não" volta ao reabrir; "Não sugerir mais" não volta', async ({
  page,
}) => {
  await seed(page);
  await stepThree(page);
  await timeCard(page).getByRole('button', { name: 'Agora não' }).click();
  await expect(timeCard(page)).toHaveCount(0);
  await expect(durationCard(page)).toBeVisible();
  await stepThree(page);
  await expect(timeCard(page)).toBeVisible();
  await timeCard(page)
    .getByRole('button', { name: 'Não sugerir mais' })
    .click();
  await expect(timeCard(page)).toHaveCount(0);
  await expect(page.getByText('Não sugerir mais horário.')).toBeVisible();
  // A duração continua sendo sugerida.
  await expect(durationCard(page)).toBeVisible();
  await stepThree(page);
  await expect(timeCard(page)).toHaveCount(0);
  await expect(durationCard(page)).toBeVisible();
});

test('Pôr no Dia aos domingos: linha só no domingo, fora da contagem, e reversível', async ({
  page,
}) => {
  await seed(page);
  await at(page, '2026-11-15', '/');
  const heading = page.getByRole('heading', { name: /Plano do dia/ });
  const before = await heading.textContent();
  const line = page.getByRole('group', { name: 'Revisão da semana' });
  await expect(line).toHaveCount(0);
  await page.goto('/evolucao');
  const card = page.getByRole('region', { name: 'Revisão semanal' });
  await card.getByRole('button', { name: 'Pôr no Dia aos domingos' }).click();
  await expect(card).toContainText('No Dia aos domingos, sem notificação.');
  await page.goto('/');
  await expect(line).toContainText('Revisão da semana');
  await expect(line).toContainText('Cerca de 5 min · 3 passos opcionais');
  await expect(heading).toHaveText(before!);
  await expect(page.locator('.day-list')).not.toContainText(
    'Revisão da semana',
  );
  await expectNoPageOverflow(page);
  await expect(line.getByRole('link', { name: 'Abrir' })).toHaveAttribute(
    'href',
    '/revisao-semanal',
  );
  // Na segunda não aparece.
  await at(page, '2026-11-16', '/');
  await expect(
    page.getByRole('heading', { name: /Plano do dia/ }),
  ).toBeVisible();
  await expect(line).toHaveCount(0);
  // De volta ao domingo: tirar pela própria linha.
  await at(page, '2026-11-15', '/');
  await line
    .getByRole('button', { name: 'Mais ações para Revisão da semana' })
    .click();
  await page.getByRole('button', { name: 'Tirar dos domingos' }).click();
  await expect(line).toHaveCount(0);
  await page.goto('/evolucao');
  await expect(
    card.getByRole('button', { name: 'Pôr no Dia aos domingos' }),
  ).toBeVisible();
});
