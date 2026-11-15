import { beforeEach, describe, expect, it } from 'vitest';
import { db, type Area, type Profile, type Task } from './db';
import type { ExecutionRecord, Occurrence } from './productivityTypes';
import { canCompleteInline, inFocus, staleDays, STALE_DAYS } from './dayRow';
import { initializeJourney } from './profileService';
import { createQuickTask } from './journeyService';
import { completeTask, undoTask } from './taskService';
import { invalidateHeroModifiersCache } from './gearService';
import { dateKey } from './rewardService';

const task = (extra: Partial<Task> = {}): Task =>
  ({
    id: 1,
    title: 'Renovar CNH',
    xp: 50,
    rarity: 'common',
    completed: false,
    status: 'available',
    createdAt: '2026-10-01T12:00:00',
    plannedDate: '2026-10-01',
    recurrence: null,
    ...extra,
  }) as Task;
const row = (extra: Partial<Occurrence> = {}): Occurrence =>
  ({
    id: 'mission:1:once',
    taskId: 1,
    originDate: '2026-11-15',
    plannedDate: '2026-11-15',
    status: 'planned',
    steps: [],
    value: 0,
    tracking: { method: 'direct' },
    ...extra,
  }) as Occurrence;

describe('parada', () => {
  it('conta dias desde a última ação em missão avulsa com dia', () => {
    expect(staleDays(task(), '2026-11-15', [], [])).toBe(45);
  });
  it('não marca antes do limite nem missão sem dia, recorrente ou concluída', () => {
    const recent = task({
      createdAt: '2026-11-05T12:00:00',
      plannedDate: '2026-11-05',
    });
    expect(staleDays(recent, '2026-11-15', [], [])).toBeNull();
    expect(
      staleDays(task({ plannedDate: null }), '2026-11-15', [], []),
    ).toBeNull();
    expect(
      staleDays(
        task({
          recurrence: { kind: 'daily', startDate: '2026-10-01' },
        } as Partial<Task>),
        '2026-11-15',
        [],
        [],
      ),
    ).toBeNull();
    expect(
      staleDays(task({ completed: true }), '2026-11-15', [], []),
    ).toBeNull();
  });
  it('zera ao editar, remarcar ou registrar progresso', () => {
    expect(
      staleDays(
        task({ updatedAt: '2026-11-10T09:00:00' }),
        '2026-11-15',
        [],
        [],
      ),
    ).toBeNull();
    expect(
      staleDays(task({ plannedDate: '2026-11-14' }), '2026-11-15', [], []),
    ).toBeNull();
    const occurrence = row({ id: 'mission:1:once' });
    const record = {
      occurrenceId: 'mission:1:once',
      localDate: '2026-11-12',
    } as ExecutionRecord;
    expect(staleDays(task(), '2026-11-15', [occurrence], [record])).toBeNull();
  });
  it('o limite é de 14 dias', () => {
    expect(STALE_DAYS).toBe(14);
    const edge = task({
      createdAt: '2026-11-01T12:00:00',
      plannedDate: '2026-11-01',
    });
    expect(staleDays(edge, '2026-11-15', [], [])).toBe(14);
    expect(staleDays(edge, '2026-11-14', [], [])).toBeNull();
  });
});

describe('em foco', () => {
  const areas = [{ id: 6, nome: 'Família', domain: 'relations' }] as Area[];
  const profile = {
    lifeWheel: {
      version: 1,
      checkins: [],
      focus: { relations: { since: '2026-11-01T00:00:00Z' } },
    },
    generalAreaDomain: 'home',
  } as unknown as Profile;
  it('segue o domínio da área', () => {
    expect(inFocus(6, areas, profile)).toBe(true);
    expect(inFocus(0, areas, profile)).toBe(false);
    expect(inFocus(6, areas, undefined)).toBe(false);
  });
});

describe('concluir pela linha', () => {
  it('aceita só missões diretas, sem passos e do dia', () => {
    expect(canCompleteInline(task(), row(), '2026-11-15')).toBe(true);
    expect(
      canCompleteInline(
        task(),
        row({ tracking: { method: 'steps' } } as Partial<Occurrence>),
        '2026-11-15',
      ),
    ).toBe(false);
    expect(canCompleteInline(task(), row({ steps: ['a'] }), '2026-11-15')).toBe(
      false,
    );
    expect(
      canCompleteInline(task({ reviewEnabled: true }), row(), '2026-11-15'),
    ).toBe(false);
    expect(
      canCompleteInline(
        task({ plannedDate: '2026-11-20' }),
        row(),
        '2026-11-15',
      ),
    ).toBe(false);
    expect(
      canCompleteInline(task(), row({ status: 'completed' }), '2026-11-15'),
    ).toBe(false);
    const routine = task({
      recurrence: { kind: 'daily', startDate: '2026-10-01' },
    } as Partial<Task>);
    expect(
      canCompleteInline(
        routine,
        row({ originDate: '2026-11-14' }),
        '2026-11-15',
      ),
    ).toBe(false);
    expect(canCompleteInline(routine, row(), '2026-11-15')).toBe(true);
  });
});

describe('conclusão rápida no Hoje: saldo, duplicidade e desfazer', () => {
  beforeEach(async () => {
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) await table.clear();
    });
    invalidateHeroModifiersCache();
    await initializeJourney();
  });
  it('concluir duas vezes não paga duas vezes e desfazer devolve o saldo', async () => {
    const id = await createQuickTask({
      title: 'Pagar conta de luz',
      requestId: crypto.randomUUID(),
      planToday: true,
      plannedDate: dateKey(),
    } as never);
    const before = (await db.profile.get(1))!;
    const [first, second] = await Promise.all([
      completeTask(id),
      completeTask(id),
    ]);
    const event = first ?? second;
    expect(event).toBeTruthy();
    expect([first, second].filter(Boolean)).toHaveLength(1);
    const paid = (await db.profile.get(1))!;
    expect(paid.totalXpEarned - before.totalXpEarned).toBe(event!.reward.xp);
    expect(paid.gold - before.gold).toBe(event!.reward.gold);
    await undoTask(id, event!.id);
    // The app reverses by recording a debt that future gains compensate;
    // the net position returns to where it was before the completion.
    const after = (await db.profile.get(1))!;
    const debt = after.rewardDebt ?? { xp: 0, gold: 0, food: 0 };
    expect(after.totalXpEarned - debt.xp).toBe(before.totalXpEarned);
    expect(after.gold - debt.gold).toBe(before.gold);
    expect((await db.tasks.get(id))!.completed).toBe(false);
    expect(await completeTask(id)).toBeTruthy();
  });
});
