import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { invalidateHeroModifiersCache } from './gearService';
import { saveTaskDefinition } from './taskDefinitionService';
import {
  beginTask,
  setTaskStep,
  isAvailable,
  planTask,
} from './journeyService';
import { completeTask, undoTask } from './taskService';
import { saveArea, deleteArea } from './areaService';
import { scheduledOn, nextPlannedDate, validateRecurrence } from './recurrence';
import { configureReview } from './reviewService';
import {
  createJourneyBackup,
  restoreJourneyBackup,
  validateBackup,
} from './backupDataService';

const day = (date: string) => vi.setSystemTime(new Date(`${date}T12:00:00`));
beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  day('2026-11-02');
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  invalidateHeroModifiersCache();
  await initializeJourney();
});
afterEach(() => vi.useRealTimers());
const routine = (
  extra: Partial<Parameters<typeof saveTaskDefinition>[0]> = {},
) =>
  saveTaskDefinition({
    title: 'Lavar a louça',
    requestId: crypto.randomUUID(),
    plannedDate: '2026-11-02',
    recurrence: { kind: 'daily', startDate: '2026-11-02' },
    ...extra,
  });

describe('organizador e recorrência cotidiana', () => {
  it('trocar uma rotina concluída por revisão não permite outra recompensa no mesmo dia', async () => {
    const id = await routine();
    const first = (await completeTask(id))!;
    const task = (await db.tasks.get(id))!;
    await saveTaskDefinition({
      title: task.title,
      requestId: crypto.randomUUID(),
      editId: id,
      expectedRevision: task.definitionRevision,
      recurrence: null,
    });
    await expect(
      configureReview(id, {
        enabled: true,
        intervalDays: 7,
        dueDate: '2026-11-02',
      }),
    ).rejects.toThrow('hoje');
    await configureReview(id, { enabled: true, intervalDays: 7 });
    expect(await completeTask(id)).toBeNull();
    expect((await db.profile.get(1))?.totalXpEarned).toBe(first.reward.xp);
  });
  it('trocar uma revisão por rotina no mesmo dia não permite outra recompensa', async () => {
    const id = await routine({ recurrence: null });
    await configureReview(id, { enabled: true, intervalDays: 7 });
    const review = (await completeTask(id))!;
    await configureReview(id, { enabled: false, intervalDays: 7 });
    const task = (await db.tasks.get(id))!;
    await saveTaskDefinition({
      title: task.title,
      requestId: crypto.randomUUID(),
      editId: id,
      expectedRevision: task.definitionRevision,
      recurrence: { kind: 'daily', startDate: '2026-11-02' },
    });
    expect(isAvailable((await db.tasks.get(id))!)).toBe(false);
    expect(await completeTask(id)).toBeNull();
    expect((await db.profile.get(1))?.totalXpEarned).toBe(review.reward.xp);
    await undoTask(id, review.id);
    expect(isAvailable((await db.tasks.get(id))!)).toBe(true);
    expect(await completeTask(id)).not.toBeNull();
    expect((await db.profile.get(1))?.totalXpEarned).toBe(review.reward.xp);
  });
  it('conclusões simultâneas concedem uma recompensa, reabrem no próximo dia e não acumulam dias perdidos', async () => {
    const id = await routine();
    const attempts = await Promise.all([
      completeTask(id),
      completeTask(id),
      completeTask(id),
    ]);
    const first = attempts.find(Boolean)!;
    expect(attempts.filter(Boolean)).toHaveLength(1);
    expect(await db.activityEvents.count()).toBe(1);
    expect(await db.profile.get(1)).toMatchObject({
      totalXpEarned: first.reward.xp,
      gold: first.reward.gold,
      food: first.reward.food,
    });
    expect(isAvailable((await db.tasks.get(id))!)).toBe(false);
    day('2026-11-03');
    expect(isAvailable((await db.tasks.get(id))!)).toBe(true);
    const second = await completeTask(id);
    expect(second?.occurrenceDate).toBe('2026-11-03');
    day('2026-12-01');
    expect(isAvailable((await db.tasks.get(id))!)).toBe(true);
    expect(await db.tasks.count()).toBe(1);
    expect(await db.activityEvents.count()).toBe(2);
    expect(await db.profile.get(1)).toMatchObject({
      totalXpEarned: first.reward.xp + second!.reward.xp,
    });
  });

  it('estorna somente a ocorrência escolhida e permite refazer sem afetar outra data', async () => {
    const id = await routine();
    const first = (await completeTask(id))!;
    day('2026-11-03');
    const second = (await completeTask(id))!;
    await undoTask(id, first.id);
    expect(
      (await db.activityEvents.get(second.id))?.reversedAt,
    ).toBeUndefined();
    expect(await db.tasks.get(id)).toMatchObject({
      lastOccurrenceDate: '2026-11-03',
      completionEventId: second.id,
    });
    expect(await completeTask(id)).toBeNull();
    expect(await db.profile.get(1)).toMatchObject({
      totalXpEarned: first.reward.xp + second.reward.xp,
      rewardDebt: {
        xp: first.reward.xp,
        gold: first.reward.gold,
        food: first.reward.food,
      },
    });
    await undoTask(id, second.id);
    const repeated = (await completeTask(id))!;
    expect(repeated.id).not.toBe(second.id);
    expect(repeated.occurrenceDate).toBe(second.occurrenceDate);
    expect(await db.profile.get(1)).toMatchObject({
      totalXpEarned: first.reward.xp + second.reward.xp,
    });
    const copy = JSON.parse(JSON.stringify(await createJourneyBackup()));
    expect(() => validateBackup(copy)).not.toThrow();
  });

  it('cada ocorrência exige passos próprios e recusa submissão que atravessou a meia-noite', async () => {
    const id = await routine({ steps: ['Limpar', 'Guardar'] });
    await beginTask(id);
    await setTaskStep(id, 0, true);
    await setTaskStep(id, 1, true);
    await completeTask(id, { occurrenceDate: '2026-11-02' });
    day('2026-11-03');
    await expect(
      completeTask(id, { occurrenceDate: '2026-11-02' }),
    ).rejects.toThrow('dia mudou');
    await expect(completeTask(id)).rejects.toThrow('passos');
    await beginTask(id);
    expect((await db.tasks.get(id))?.completedSubtasks).toEqual([]);
    await setTaskStep(id, 0, true);
    await setTaskStep(id, 1, true);
    expect((await completeTask(id))?.occurrenceDate).toBe('2026-11-03');
  });

  it('respeita dias escolhidos, datas futuras e semanas na troca de ano sem gerar ocorrências extras', async () => {
    const id = await routine({
      recurrence: {
        kind: 'weekdays',
        startDate: '2026-11-02',
        days: [1, 3, 5],
      },
    });
    const task = (await db.tasks.get(id))!;
    expect(scheduledOn(task, '2026-11-03')).toBe(false);
    expect(nextPlannedDate(task, '2026-11-02')).toBe('2026-11-04');
    day('2026-11-03');
    await expect(completeTask(id)).rejects.toThrow('prevista');
    const weekly = await routine({
      plannedDate: '2026-12-31',
      recurrence: { kind: 'weekly', startDate: '2026-12-31', days: [5] },
    });
    expect(nextPlannedDate((await db.tasks.get(weekly))!, '2026-12-30')).toBe(
      '2027-01-01',
    );
    const future = await routine({
      plannedDate: '2026-11-05',
      recurrence: null,
    });
    await expect(completeTask(future)).rejects.toThrow('futura');
    await planTask(future, true);
    expect(await completeTask(future)).not.toBeNull();
    expect(() =>
      validateRecurrence({
        kind: 'weekly',
        startDate: '2026-02-30',
        days: [1],
      }),
    ).toThrow();
  });

  it('editar rotina preserva recibos e não transforma revisão espaçada em recorrência', async () => {
    const id = await routine();
    const event = (await completeTask(id))!;
    const task = (await db.tasks.get(id))!;
    await saveTaskDefinition({
      title: 'Cuidar da cozinha',
      requestId: crypto.randomUUID(),
      editId: id,
      expectedRevision: task.definitionRevision,
      plannedDate: task.plannedDate,
      recurrence: { kind: 'weekdays', startDate: '2026-11-02', days: [1, 3] },
    });
    expect(await completeTask(id)).toBeNull();
    expect((await db.activityEvents.get(event.id))?.taskTitle).toBe(
      'Lavar a louça',
    );
    await expect(
      configureReview(id, { enabled: true, intervalDays: 7 }),
    ).rejects.toThrow('recorrência');
    const review = await routine({ recurrence: null });
    await configureReview(review, { enabled: true, intervalDays: 7 });
    const current = (await db.tasks.get(review))!;
    await expect(
      saveTaskDefinition({
        title: current.title,
        requestId: crypto.randomUUID(),
        editId: review,
        expectedRevision: current.definitionRevision,
        recurrence: { kind: 'daily', startDate: '2026-11-02' },
      }),
    ).rejects.toThrow('revisão');
  });

  it('áreas são atômicas, preservam missões e histórico e recusam uma edição aberta antes da transferência', async () => {
    const area = await saveArea('Casa');
    const id = await routine({ areaId: area });
    const event = (await completeTask(id))!;
    const old = (await db.tasks.get(id))!;
    await saveArea('Meu lar', area);
    expect((await db.areas.get(area))?.nome).toBe('Meu lar');
    await expect(saveArea('meu lar')).rejects.toThrow('Já existe');
    const target = await saveArea('Pessoal');
    await deleteArea(area, target);
    expect((await db.tasks.get(id))?.areaId).toBe(target);
    expect((await db.activityEvents.get(event.id))?.areaName).toBe('Casa');
    expect(
      (await db.xpLogs.where('eventId').equals(event.id).first())?.areaId,
    ).toBe(area);
    await expect(
      saveTaskDefinition({
        title: 'Alterada',
        requestId: crypto.randomUUID(),
        editId: id,
        expectedRevision: old.definitionRevision,
        areaId: target,
      }),
    ).rejects.toThrow('outra aba');
    const copy = JSON.parse(JSON.stringify(await createJourneyBackup()));
    await restoreJourneyBackup(copy);
    expect((await db.tasks.get(id))?.recurrence?.kind).toBe('daily');
    expect((await db.activityEvents.get(event.id))?.areaName).toBe('Casa');
  });

  it('restaura histórico de múltiplos dias e estornos e rejeita recibos de ocorrência duplicados', async () => {
    const id = await routine();
    const first = (await completeTask(id))!;
    day('2026-11-03');
    await completeTask(id);
    await undoTask(id, first.id);
    const copy = JSON.parse(JSON.stringify(await createJourneyBackup()));
    expect(() => validateBackup(copy)).not.toThrow();
    await restoreJourneyBackup(copy);
    expect(await completeTask(id)).toBeNull();
    const last = copy.data.activityEvents.find(
      (event: { kind: string; reversedAt?: string }) =>
        event.kind === 'task' && !event.reversedAt,
    );
    copy.data.activityEvents.push({ ...last, id: 'duplicate', sequence: 999 });
    copy.data.xpLogs.push({
      id: 999,
      eventId: 'duplicate',
      date: last.date,
      amount: last.reward.xp,
      goldDelta: last.reward.gold,
      foodDelta: last.reward.food,
    });
    expect(() => validateBackup(copy)).toThrow('duplicadas');
  });

  it('rotina associada a projeto não repete seu bônus a cada novo dia', async () => {
    const projectId = await db.projects.add({
      name: 'Uma entrega',
      status: 'em_andamento',
      createdAt: new Date(),
    });
    const id = await routine({ projectId });
    const first = (await completeTask(id))!;
    day('2026-11-03');
    const second = (await completeTask(id))!;
    expect(
      (
        await db.activityEvents.where('kind').equals('project').toArray()
      ).filter((event) => !event.reversedAt),
    ).toHaveLength(1);
    await undoTask(id, first.id);
    expect((await db.projects.get(projectId))?.rewardGranted).toBe(true);
    await undoTask(id, second.id);
    expect((await db.projects.get(projectId))?.rewardGranted).toBe(false);
    const finalProfile = (await db.profile.get(1))!;
    expect(finalProfile.totalXpEarned).toBe(111);
    expect(finalProfile.rewardDebt?.xp).toBe(111);
  });
});
