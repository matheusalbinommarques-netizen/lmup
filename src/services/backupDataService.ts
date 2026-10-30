import {
  db,
  LEGACY_STORES,
  type Profile,
  type Task,
  type HeroProject,
  type ActivityEvent,
  type RecoverySnapshot,
} from './db';
import { createDefaultProfile, initializeJourney } from './profileService';
import { invalidateHeroModifiersCache } from './gearService';
import { calendarDate } from './calendar';
import { effortDefinition, type Effort } from './effort';

export const BACKUP_LIMIT = 25 * 1024 * 1024;
const tableNames = [...Object.keys(LEGACY_STORES), 'activityEvents'];
type Row = Record<string, any>;
export interface JourneyBackup {
  meta: { app: 'Level Me Up!'; formatVersion: number; exportedAt: string };
  data: { profile: Profile | null; [name: string]: unknown };
}

function fail(message: string): never {
  throw new Error(`Backup inválido: ${message}`);
}
function calendar(value: unknown, label: string) {
  if (value == null) return;
  if (typeof value !== 'string' && !(value instanceof Date))
    fail(`${label} inválida.`);
  try {
    calendarDate(value as string | Date);
  } catch {
    fail(`${label} inválida.`);
  }
}
function object(value: unknown, label: string): Row {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  )
    fail(`${label} precisa ser um objeto.`);
  return value as Row;
}
function integer(
  value: unknown,
  label: string,
  min = 0,
): asserts value is number {
  if (!Number.isSafeInteger(value) || (value as number) < min)
    fail(`${label} precisa ser um inteiro válido.`);
}
function text(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string' || !value.trim())
    fail(`${label} está ausente.`);
}
function date(value: unknown, label: string, optional = false) {
  if (optional && (value == null || value === '')) return;
  if (
    !(typeof value === 'string' || value instanceof Date) ||
    Number.isNaN(new Date(value).getTime())
  )
    fail(`${label} tem data inválida.`);
}
function safeTree(value: unknown, depth = 0) {
  if (depth > 40) fail('estrutura excessivamente profunda.');
  if (!value || typeof value !== 'object' || value instanceof Date) return;
  for (const [key, child] of Object.entries(value)) {
    if (['__proto__', 'prototype', 'constructor'].includes(key))
      fail('contém uma chave reservada.');
    safeTree(child, depth + 1);
  }
}
function rows(value: unknown, label: string): Row[] {
  if (!Array.isArray(value)) fail(`${label} precisa ser uma lista.`);
  const seen = new Set();
  return value.map((entry) => {
    const row = object(entry, label);
    if (label === 'activityEvents') text(row.id, `${label}.id`);
    else integer(row.id, `${label}.id`, 1);
    if (seen.has(row.id)) fail(`${label} tem IDs duplicados.`);
    seen.add(row.id);
    return row;
  });
}

export function validateBackup(input: unknown): JourneyBackup {
  safeTree(input);
  const envelope = object(input, 'arquivo');
  const meta = object(envelope.meta, 'meta');
  if (meta.app !== 'Level Me Up!' || ![1, 2, 3].includes(meta.formatVersion))
    fail('aplicativo ou versão não reconhecidos.');
  date(meta.exportedAt, 'meta.exportedAt');
  const data = object(envelope.data, 'data');
  if (!Object.hasOwn(data, 'profile')) fail('perfil ausente.');
  const lists: Record<string, Row[]> = {};
  const required = ['areas', 'tasks', 'companions', 'xpLogs'];
  for (const name of tableNames.filter((key) => key !== 'profile')) {
    const needed = required.includes(name) || meta.formatVersion === 3;
    lists[name] = rows(data[name] ?? (needed ? undefined : []), name);
  }
  const profile = data.profile == null ? null : object(data.profile, 'profile');
  if (profile) {
    if (profile.id !== 1) fail('o perfil deve ter ID 1.');
    text(profile.name, 'profile.name');
    for (const field of [
      'level',
      'xpCurrent',
      'xpNext',
      'totalXpEarned',
      'gold',
      'currentStreak',
    ])
      integer(profile[field], `profile.${field}`);
    if (profile.level < 1 || profile.level > 30)
      fail('nível do perfil fora da progressão suportada.');
    if (profile.food != null) integer(profile.food, 'profile.food');
    if (profile.avatarUrl != null && typeof profile.avatarUrl !== 'string')
      fail('avatar inválido.');
    if (profile.rpgPilot != null) {
      const pilot = object(profile.rpgPilot, 'profile.rpgPilot');
      integer(pilot.scene, 'profile.rpgPilot.scene');
      if (pilot.scene > 6) fail('cena do piloto inválida.');
      if (pilot.choice != null && !['help', 'follow'].includes(pilot.choice))
        fail('escolha do piloto inválida.');
      if (pilot.scene === 6 && !pilot.choice)
        fail('piloto concluído sem decisão.');
    }
    date(profile.lastCompletionDate, 'profile.lastCompletionDate', true);
    if (profile.ecoGoldClaimedUpToStage != null) {
      integer(
        profile.ecoGoldClaimedUpToStage,
        'profile.ecoGoldClaimedUpToStage',
        1,
      );
      if (profile.ecoGoldClaimedUpToStage > 4) fail('estágio inválido.');
    }
    if (
      profile.activeCompanionId != null &&
      ![1, 2, 3, 4, ...lists.companions.map((row) => row.id)].includes(
        profile.activeCompanionId,
      )
    )
      fail('companheiro ativo não encontrado.');
  }
  for (const area of lists.areas) text(area.nome, 'areas.nome');
  const areaIds = new Set([0, ...lists.areas.map((row) => row.id)]);
  const projectIds = new Set(lists.projects.map((row) => row.id));
  for (const task of lists.tasks) {
    text(task.title, 'tasks.title');
    integer(task.xp, 'tasks.xp', 1);
    date(task.createdAt, 'tasks.createdAt');
    if (!['common', 'rare', 'epic', 'legendary'].includes(task.rarity))
      fail('raridade de missão inválida.');
    if (
      task.status != null &&
      !['available', 'todo', 'completed'].includes(task.status)
    )
      fail('status de missão inválido.');
    if (task.areaId != null && !areaIds.has(task.areaId))
      fail('missão referencia área inexistente.');
    if (task.projectId != null && !projectIds.has(task.projectId))
      fail('missão referencia projeto inexistente.');
    for (const key of ['completed', 'archived', 'reviewEnabled'])
      if (task[key] != null && typeof task[key] !== 'boolean')
        fail(`tasks.${key} inválido.`);
    if (task.description != null && typeof task.description !== 'string')
      fail('descrição de missão inválida.');
    if (
      task.subtasks != null &&
      (!Array.isArray(task.subtasks) ||
        task.subtasks.some((step: unknown) => typeof step !== 'string'))
    )
      fail('passos inválidos.');
    if (task.completionRevision != null)
      integer(task.completionRevision, 'tasks.completionRevision');
    if (task.notesRevision != null)
      integer(task.notesRevision, 'tasks.notesRevision');
    if (task.definitionRevision != null)
      integer(task.definitionRevision, 'tasks.definitionRevision');
    for (const key of ['reviewDueDate', 'lastReviewDate'])
      calendar(task[key], `tasks.${key}`);
    if (task.effort != null) {
      if (!['small', 'medium', 'large', 'deep'].includes(task.effort))
        fail('esforço inválido.');
      const definition = effortDefinition(task.effort as Effort);
      if (task.xp !== definition.xp || task.rarity !== definition.rarity)
        fail('esforço e recompensa não correspondem.');
    }
    if (task.projectStageId != null) {
      const project = lists.projects.find((item) => item.id === task.projectId);
      if (
        !Array.isArray(project?.stages) ||
        !project.stages.some((stage: Row) => stage.id === task.projectStageId)
      )
        fail('etapa de projeto inexistente.');
    }
    if (
      task.executionNotes != null &&
      (typeof task.executionNotes !== 'string' ||
        task.executionNotes.length > 20000)
    )
      fail('notas de execução inválidas.');
    if (
      task.executionState != null &&
      !['idle', 'active', 'paused'].includes(task.executionState)
    )
      fail('estado de execução inválido.');
    if (task.pinned != null && typeof task.pinned !== 'boolean')
      fail('destaque inválido.');
    if (
      task.plannedDate != null &&
      (typeof task.plannedDate !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(task.plannedDate))
    )
      fail('data do plano inválida.');
    if (
      task.creationKey != null &&
      (typeof task.creationKey !== 'string' ||
        !task.creationKey ||
        task.creationKey.length > 100)
    )
      fail('identificador de criação inválido.');
    if (
      task.reviewSession != null &&
      (typeof task.reviewSession !== 'string' ||
        task.reviewSession.length > 160)
    )
      fail('identificador de sessão inválido.');
    if (
      task.completedSubtasks != null &&
      (!Array.isArray(task.completedSubtasks) ||
        task.completedSubtasks.some(
          (index: unknown) =>
            !Number.isSafeInteger(index) ||
            (index as number) < 0 ||
            (index as number) >= (task.subtasks?.length ?? 0),
        ))
    )
      fail('progresso de passos inválido.');
    if (task.reviewIntervalDays != null)
      integer(task.reviewIntervalDays, 'tasks.reviewIntervalDays', 1);
    for (const key of ['completedAt', 'updatedAt', 'reviewStartedAt'])
      date(task[key], `tasks.${key}`, true);
  }
  for (const project of lists.projects) {
    text(project.name, 'projects.name');
    date(project.createdAt, 'projects.createdAt');
    if (
      ![
        'planejando',
        'em_andamento',
        'concluido',
        'pausado',
        'arquivado',
      ].includes(project.status)
    )
      fail('status de projeto inválido.');
    date(project.targetDate, 'projects.targetDate', true);
    calendar(project.targetDate, 'projects.targetDate');
    if (project.revision != null)
      integer(project.revision, 'projects.revision');
    if (project.rewardPolicy != null && project.rewardPolicy !== 'effort-v1')
      fail('política de projeto desconhecida.');
    if (
      project.creationKey != null &&
      (typeof project.creationKey !== 'string' ||
        !project.creationKey ||
        project.creationKey.length > 100)
    )
      fail('identificador de projeto inválido.');
    if (project.stages != null) {
      if (!Array.isArray(project.stages) || project.stages.length > 50)
        fail('etapas inválidas.');
      const ids = new Set();
      for (const raw of project.stages) {
        const stage = object(raw, 'etapa');
        text(stage.id, 'etapa.id');
        text(stage.title, 'etapa.title');
        if (ids.has(stage.id)) fail('etapas duplicadas.');
        ids.add(stage.id);
      }
    }
    if (
      project.rewardGranted != null &&
      typeof project.rewardGranted !== 'boolean'
    )
      fail('recompensa de projeto inválida.');
    if (project.rewardRevision != null)
      integer(project.rewardRevision, 'projects.rewardRevision');
  }
  for (const pet of lists.companions) {
    text(pet.name, 'companions.name');
    if (pet.careHistory != null) {
      if (!Array.isArray(pet.careHistory) || pet.careHistory.length > 10000)
        fail('histórico de cuidado inválido.');
      const ids = new Set();
      let invested = 0;
      for (const raw of pet.careHistory) {
        const entry = object(raw, 'cuidado');
        text(entry.id, 'cuidado.id');
        date(entry.occurredAt, 'cuidado.data');
        integer(entry.amount, 'cuidado.comida', 1);
        if (
          ids.has(entry.id) ||
          ![1, 2, 3].includes(entry.fromStage) ||
          ![1, 2, 3].includes(entry.toStage) ||
          entry.toStage < entry.fromStage
        )
          fail('recibo de cuidado inválido.');
        ids.add(entry.id);
        invested += entry.amount;
      }
      if (invested > (pet.foodInvested ?? 0))
        fail('histórico excede investimento do companheiro.');
    }
    if (pet.foodInvested != null)
      integer(pet.foodInvested, 'companions.foodInvested');
    if (pet.evolutionStage != null && ![1, 2, 3].includes(pet.evolutionStage))
      fail('estágio de companheiro inválido.');
    if (pet.requiredLevel != null)
      integer(pet.requiredLevel, 'companions.requiredLevel', 1);
    if (pet.unlocked != null && typeof pet.unlocked !== 'boolean')
      fail('desbloqueio de companheiro inválido.');
  }
  for (const name of ['inventory', 'shopItems'])
    for (const row of lists[name]) {
      text(row.key, `${name}.key`);
      text(row.name, `${name}.name`);
      if (
        ![
          'frame',
          'avatar',
          'background',
          'aura',
          'weapon-skin',
          'gear',
        ].includes(row.type)
      )
        fail('tipo de item inválido.');
      if (name === 'shopItems') integer(row.price, 'shopItems.price');
      else if (typeof row.owned !== 'boolean') fail('posse de item inválida.');
    }
  for (const row of lists.ownedShopItems) {
    integer(row.itemId, 'ownedShopItems.itemId', 1);
    date(row.acquiredAt, 'ownedShopItems.acquiredAt');
    if (typeof row.equipped !== 'boolean') fail('equipamento inválido.');
    if (row.price != null) integer(row.price, 'ownedShopItems.price');
  }
  if (
    new Set(lists.ownedShopItems.map((row) => row.itemId)).size !==
    lists.ownedShopItems.length
  )
    fail('itens comprados duplicados.');
  for (const item of lists.items) {
    text(item.titulo, 'items.titulo');
    if (item.xp != null) integer(item.xp, 'items.xp');
  }
  const events = lists.activityEvents;
  const byId = new Map(events.map((event) => [event.id, event]));
  const sequence = new Set<number>();
  for (const event of events) {
    if (
      !['task', 'review', 'project', 'adjustment', 'reversal'].includes(
        event.kind,
      )
    )
      fail('tipo de evento inválido.');
    integer(event.sequence, 'activityEvents.sequence', 1);
    if (sequence.has(event.sequence)) fail('ordem de eventos duplicada.');
    sequence.add(event.sequence);
    date(event.occurredAt, 'activityEvents.occurredAt');
    date(event.date, 'activityEvents.date');
    date(event.reversedAt, 'activityEvents.reversedAt', true);
    if (
      event.reviewOutcome != null &&
      !['recalled', 'partial', 'again'].includes(event.reviewOutcome)
    )
      fail('resultado da revisão inválido.');
    if (event.reviewStateBefore != null) {
      const state = object(event.reviewStateBefore, 'reviewStateBefore');
      if (typeof state.completed !== 'boolean')
        fail('estado anterior da revisão inválido.');
      if (
        state.status != null &&
        !['available', 'todo', 'completed'].includes(state.status)
      )
        fail('status anterior inválido.');
      for (const key of ['completedAt', 'reviewStartedAt'])
        date(state[key], `reviewStateBefore.${key}`, true);
      for (const key of ['reviewDueDate', 'lastReviewDate'])
        calendar(state[key], `reviewStateBefore.${key}`);
      if (state.completionEventId != null) {
        const prior = byId.get(state.completionEventId);
        if (
          !prior ||
          prior.taskId !== event.taskId ||
          !['task', 'review'].includes(prior.kind)
        )
          fail('origem anterior da revisão inválida.');
      }
    }
    if (!Number.isSafeInteger(event.baseXp))
      fail('XP base de evento inválido.');
    const reward = object(event.reward, 'activityEvents.reward');
    for (const resource of ['xp', 'gold', 'food']) {
      if (!Number.isSafeInteger(reward[resource])) fail('recompensa inválida.');
      if (
        ['task', 'review', 'project'].includes(event.kind) &&
        reward[resource] < 0
      )
        fail('recompensa de execução negativa.');
    }
    const modifiers = object(event.modifiers, 'activityEvents.modifiers');
    for (const key of ['xpMultiplier', 'goldMultiplier', 'foodMultiplier'])
      if (!Number.isFinite(modifiers[key]) || modifiers[key] < 0)
        fail('modificador inválido.');
    if (
      !Array.isArray(event.awardedStages) ||
      event.awardedStages.some(
        (stage: unknown) => ![1, 2, 3, 4].includes(stage as number),
      )
    )
      fail('estágios de evento inválidos.');
    integer(event.ecoClaimedBefore, 'activityEvents.ecoClaimedBefore', 1);
    integer(event.protectionDays, 'activityEvents.protectionDays');
    if (event.streakBefore) {
      integer(event.streakBefore.currentStreak, 'activityEvents.streakBefore');
      date(
        event.streakBefore.lastCompletionDate,
        'activityEvents.streakBefore.date',
        true,
      );
    }
    if (event.kind === 'reversal') {
      const source = byId.get(event.sourceEventId);
      if (!source || source.kind === 'reversal' || !source.reversedAt)
        fail('estorno sem evento de origem.');
      for (const key of ['xp', 'gold', 'food'])
        if (reward[key] !== -source.reward?.[key])
          fail('estorno difere da recompensa original.');
    }
  }
  const paidUpTo = events
    .filter((event) => event.kind !== 'reversal' && !event.reversedAt)
    .reduce(
      (max, event) =>
        event.awardedStages.reduce(
          (highest: number, stage: number) => Math.max(highest, stage),
          max,
        ),
      1,
    );
  if ((profile?.ecoGoldClaimedUpToStage ?? 1) < paidUpTo)
    fail('marcos recebidos não correspondem ao perfil.');
  const reversals = events.filter((event) => event.kind === 'reversal');
  if (
    new Set(reversals.map((event) => event.sourceEventId)).size !==
    reversals.length
  )
    fail('estornos duplicados.');
  for (const event of events.filter((entry) => entry.reversedAt))
    if (!reversals.some((reversal) => reversal.sourceEventId === event.id))
      fail('evento estornado sem registro de reversão.');
  const logged = new Set<string>();
  for (const log of lists.xpLogs) {
    date(log.date, 'xpLogs.date');
    if (!Number.isSafeInteger(log.amount))
      fail('quantidade de XP do histórico inválida.');
    if (log.eventId != null) {
      const event = byId.get(log.eventId);
      if (
        !event ||
        logged.has(log.eventId) ||
        event.reward.xp !== log.amount ||
        event.reward.gold !== log.goldDelta ||
        event.reward.food !== log.foodDelta
      )
        fail('histórico não corresponde ao evento.');
      logged.add(log.eventId);
    }
  }
  if (events.some((event) => !logged.has(event.id)))
    fail('evento sem histórico de XP.');
  for (const task of lists.tasks)
    if (task.completionEventId != null) {
      const event = byId.get(task.completionEventId);
      if (
        !event ||
        event.taskId !== task.id ||
        !['task', 'review'].includes(event.kind) ||
        event.reversedAt ||
        !task.completed
      )
        fail('conclusão não corresponde à missão.');
    }
  for (const project of lists.projects)
    if (project.rewardEventId != null) {
      const event = byId.get(project.rewardEventId);
      if (
        !event ||
        event.projectId !== project.id ||
        event.kind !== 'project' ||
        event.reversedAt ||
        !project.rewardGranted
      )
        fail('bônus não corresponde ao projeto.');
    }
  return structuredClone({
    meta: {
      app: 'Level Me Up!',
      formatVersion: 3,
      exportedAt: meta.exportedAt,
    },
    data: { ...lists, profile: profile as Profile | null },
  });
}

async function readTables(): Promise<Record<string, unknown[]>> {
  const result: Record<string, unknown[]> = {};
  for (const name of tableNames) result[name] = await db.table(name).toArray();
  return result;
}

function envelope(data: Record<string, unknown[]>): JourneyBackup {
  return {
    meta: {
      app: 'Level Me Up!',
      formatVersion: 3,
      exportedAt: new Date().toISOString(),
    },
    data: {
      ...data,
      activityEvents: data.activityEvents ?? [],
      profile: (data.profile[0] as Profile) ?? null,
    },
  };
}

export async function createJourneyBackup(): Promise<JourneyBackup> {
  return db.transaction('r', db.tables, async () =>
    envelope(await readTables()),
  );
}

async function saveRecovery(reason: RecoverySnapshot['reason']) {
  await db.recoverySnapshots.add({
    id: crypto.randomUUID(),
    reason,
    createdAt: new Date().toISOString(),
    data: await readTables(),
  });
  const records = await db.recoverySnapshots.orderBy('createdAt').toArray();
  const removable = records
    .filter((record) => record.reason !== 'migration-v4')
    .slice(0, -5);
  if (removable.length)
    await db.recoverySnapshots.bulkDelete(removable.map((record) => record.id));
}

export async function restoreJourneyBackup(input: unknown): Promise<void> {
  const backup = validateBackup(input);
  await db.transaction('rw', db.tables, async () => {
    await saveRecovery('before-import');
    for (const name of tableNames) await db.table(name).clear();
    for (const name of tableNames.filter((name) => name !== 'profile')) {
      const data = backup.data[name] as Row[];
      if (data.length) await db.table(name).bulkPut(data);
    }
    await db.profile.put(backup.data.profile ?? createDefaultProfile());
    await initializeJourney();
  });
  invalidateHeroModifiersCache();
}

export async function resetJourney(): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    const old = await db.profile.get(1);
    await saveRecovery('before-reset');
    for (const name of tableNames) await db.table(name).clear();
    const profile = createDefaultProfile();
    if (old) {
      profile.name = old.name;
      profile.avatarUrl = old.avatarUrl;
    }
    await db.profile.put(profile);
    await initializeJourney();
  });
  invalidateHeroModifiersCache();
}

export async function latestRecoveryBackup(): Promise<JourneyBackup | null> {
  const record = await db.recoverySnapshots.orderBy('createdAt').last();
  return record ? envelope(record.data) : null;
}

export function inspectJourneyBackup(input: unknown) {
  const backup = validateBackup(input);
  return {
    tasks: (backup.data.tasks as Task[]).length,
    projects: (backup.data.projects as HeroProject[]).length,
    events: (backup.data.activityEvents as ActivityEvent[]).length,
    name: backup.data.profile?.name ?? 'Novo herói',
  };
}
