import { db, type Task } from './db';
import { dateKey } from './rewardService';
import { saveTaskDefinition } from './taskDefinitionService';
import { reviewDueDate } from './reviewRules';
import { scheduledOn } from './recurrence';

export function taskSteps(task: Task) {
  return (task.subtasks ?? [])
    .map((label, index) => ({ label: label.trim(), index }))
    .filter((step) => step.label);
}
export function isAvailable(task: Task, now = new Date()): boolean {
  if (task.archived) return false;
  if (task.recurrence)
    return (
      scheduledOn(task, dateKey(now)) &&
      task.lastOccurrenceDate !== dateKey(now) &&
      task.lastReviewDate !== dateKey(now)
    );
  if (task.plannedDate && task.plannedDate > dateKey(now)) return false;
  if (!task.reviewEnabled)
    return !task.completed && task.status !== 'completed';
  return (
    task.lastReviewDate !== dateKey(now) && reviewDueDate(task) <= dateKey(now)
  );
}
export function selectNext(tasks: Task[], today = dateKey()) {
  const available = tasks
    .filter((task) => isAvailable(task, new Date(`${today}T12:00:00`)))
    .sort(
      (a, b) =>
        new Date(b.updatedAt ?? b.createdAt).getTime() -
          new Date(a.updatedAt ?? a.createdAt).getTime() ||
        (a.id ?? 0) - (b.id ?? 0),
    );
  const active = available.find(
    (task) =>
      task.executionState === 'active' || task.executionState === 'paused',
  );
  if (active)
    return {
      task: active,
      reason: 'Em andamento',
      explanation: 'Você já começou esta missão. Seus passos estão guardados.',
    };
  const pinned = available.find((task) => task.pinned);
  if (pinned)
    return {
      task: pinned,
      reason: 'Fixada por você',
      explanation: 'Você escolheu manter esta missão em destaque.',
    };
  const planned = available.find((task) => task.plannedDate === today);
  if (planned)
    return {
      task: planned,
      reason: 'No seu plano',
      explanation: 'Você escolheu esta missão para hoje.',
    };
  return available.length
    ? {
        task: available[available.length - 1],
        reason: 'Uma sugestão',
        explanation:
          'Uma das suas missões mais antigas disponíveis. Você pode escolher outra.',
      }
    : null;
}

async function editable(id: number) {
  const task = await db.tasks.get(id);
  if (!task || task.archived)
    throw new Error('Esta missão não está disponível.');
  return task;
}

export const createQuickTask = saveTaskDefinition;
export async function planTask(id: number, selected: boolean) {
  await db.transaction('rw', db.tasks, async () => {
    const task = await editable(id);
    await db.tasks.update(id, {
      plannedDate: selected ? dateKey() : null,
      ...(selected && task.recurrence && task.recurrence.startDate > dateKey()
        ? { recurrence: { ...task.recurrence, startDate: dateKey() } }
        : {}),
      ...(task.recurrence
        ? {
            skippedDate: selected ? null : dateKey(),
            occurrenceOverride: selected ? dateKey() : null,
          }
        : {}),
    });
  });
}
export async function pinTask(id: number, pinned: boolean) {
  await db.transaction('rw', db.tasks, async () => {
    await editable(id);
    if (pinned)
      await db.tasks.toCollection().modify((task) => {
        task.pinned = false;
      });
    await db.tasks.update(id, { pinned });
  });
}
export async function beginTask(id: number) {
  await db.transaction('rw', db.tasks, async () => {
    const task = await editable(id);
    if (!isAvailable(task))
      throw new Error(
        'Esta missão já foi concluída ou a revisão ainda não está disponível.',
      );
    const base = new Date(task.reviewStartedAt ?? task.createdAt).toISOString();
    const session = `${base}:${task.completionRevision ?? 0}`;
    const legacyInProgress =
      task.reviewSession === base &&
      ['active', 'paused'].includes(task.executionState ?? '');
    await db.tasks.update(id, {
      executionState: 'active',
      updatedAt: new Date(),
      ...(task.recurrence
        ? {
            occurrenceSession: dateKey(),
            ...(task.occurrenceSession !== dateKey()
              ? { completedSubtasks: [] }
              : {}),
          }
        : {}),
      ...(task.reviewEnabled
        ? {
            ...(task.reviewSession !== session && !legacyInProgress
              ? { completedSubtasks: [] }
              : {}),
            reviewSession: session,
          }
        : {}),
    });
  });
}
export async function setTaskStep(id: number, index: number, checked: boolean) {
  await db.transaction('rw', db.tasks, async () => {
    const task = await editable(id);
    if (!isAvailable(task))
      throw new Error('A missão mudou em outra aba. Reabra para continuar.');
    if (!taskSteps(task).some((step) => step.index === index))
      throw new Error('O passo foi alterado. Reabra a missão.');
    const completed = new Set(
      task.recurrence && task.occurrenceSession !== dateKey()
        ? []
        : (task.completedSubtasks ?? []),
    );
    if (checked) completed.add(index);
    else completed.delete(index);
    await db.tasks.update(id, {
      completedSubtasks: [...completed],
      ...(task.recurrence ? { occurrenceSession: dateKey() } : {}),
      executionState: 'active',
      updatedAt: new Date(),
    });
  });
}
export async function saveTaskNotes(
  id: number,
  notes: string,
  expectedRevision: number,
  overwrite = false,
): Promise<number> {
  if (notes.length > 20000)
    throw new Error('As notas precisam ter até 20 mil caracteres.');
  return db.transaction('rw', db.tasks, async () => {
    const task = await editable(id);
    if (!overwrite && (task.notesRevision ?? 0) !== expectedRevision)
      throw new Error(
        'As notas mudaram em outra aba. Seu texto continua aqui; copie-o ou escolha usar suas notas.',
      );
    const revision = (task.notesRevision ?? 0) + 1;
    await db.tasks.update(id, {
      executionNotes: notes,
      notesRevision: revision,
    });
    return revision;
  });
}
export async function pauseTask(id: number) {
  await db.transaction('rw', db.tasks, async () => {
    const task = await editable(id);
    if (!isAvailable(task)) return;
    await db.tasks.update(id, {
      executionState: 'paused',
      updatedAt: new Date(),
    });
  });
}
