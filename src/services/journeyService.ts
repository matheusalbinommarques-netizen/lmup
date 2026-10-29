import { db, type Task } from './db';
import { dateKey } from './rewardService';
import { buildHeroModifiersFromOwned } from './gearService';
import { getActiveCompanionBuffs } from './companionService';

export function taskSteps(task: Task) {
  return (task.subtasks ?? [])
    .map((label, index) => ({ label: label.trim(), index }))
    .filter((step) => step.label);
}
export function isAvailable(task: Task, now = new Date()): boolean {
  if (task.archived) return false;
  if (!task.reviewEnabled)
    return !task.completed && task.status !== 'completed';
  const base = new Date(task.reviewStartedAt ?? task.createdAt);
  return (
    now >=
    new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate() + (task.reviewIntervalDays ?? 7),
    )
  );
}
export function selectNext(tasks: Task[], today = dateKey()) {
  const available = tasks
    .filter((task) => isAvailable(task))
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

export async function createQuickTask(input: {
  title: string;
  requestId: string;
  steps?: string[];
  description?: string;
  projectId?: number | null;
  areaId?: number;
  planToday?: boolean;
  heroName?: string;
}): Promise<number> {
  const title = input.title.trim();
  if (!input.requestId || input.requestId.length > 100)
    throw new Error('Identificador de criação inválido. Reabra o formulário.');
  if (!title || title.length > 160)
    throw new Error('Escreva um título de até 160 caracteres.');
  const steps = (input.steps ?? []).map((step) => step.trim()).filter(Boolean);
  if (steps.length > 100 || steps.some((step) => step.length > 500))
    throw new Error('Use até 100 passos, com até 500 caracteres cada.');
  if ((input.description?.length ?? 0) > 10000)
    throw new Error('A descrição precisa ter até 10 mil caracteres.');
  return db.transaction(
    'rw',
    [
      db.tasks,
      db.profile,
      db.projects,
      db.areas,
      db.ownedShopItems,
      db.companions,
    ],
    async () => {
      const previous = await db.tasks
        .filter((task) => task.creationKey === input.requestId)
        .first();
      if (previous?.id) return previous.id;
      if (input.projectId && !(await db.projects.get(input.projectId)))
        throw new Error('O projeto não está mais disponível.');
      if (input.areaId && !(await db.areas.get(input.areaId)))
        throw new Error('A área não está mais disponível.');
      const mods = await buildHeroModifiersFromOwned();
      const buffs = await getActiveCompanionBuffs();
      const count =
        Math.max(1, steps.length) +
        mods.rarityThresholdDelta +
        (buffs?.raritySubtaskReduction ?? 0);
      const rarity =
        count >= 10
          ? 'legendary'
          : count >= 5
            ? 'epic'
            : count >= 3
              ? 'rare'
              : 'common';
      const now = new Date();
      const id = await db.tasks.add({
        title,
        subtasks: steps,
        description: input.description?.trim() ?? '',
        xp: { common: 50, rare: 100, epic: 250, legendary: 500 }[rarity],
        rarity,
        areaId: input.areaId ?? 0,
        projectId: input.projectId ?? null,
        completed: false,
        status: 'available',
        createdAt: now,
        updatedAt: now,
        creationKey: input.requestId,
        plannedDate: input.planToday ? dateKey() : null,
      });
      if (input.heroName?.trim())
        await db.profile.update(1, {
          name: input.heroName.trim().slice(0, 80),
        });
      return id;
    },
  );
}
export async function planTask(id: number, selected: boolean) {
  await db.transaction('rw', db.tasks, async () => {
    await editable(id);
    await db.tasks.update(id, { plannedDate: selected ? dateKey() : null });
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
    const session = new Date(
      task.reviewStartedAt ?? task.createdAt,
    ).toISOString();
    await db.tasks.update(id, {
      executionState: 'active',
      updatedAt: new Date(),
      ...(task.reviewEnabled && task.reviewSession !== session
        ? { completedSubtasks: [], reviewSession: session }
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
    const completed = new Set(task.completedSubtasks ?? []);
    if (checked) completed.add(index);
    else completed.delete(index);
    await db.tasks.update(id, {
      completedSubtasks: [...completed],
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
