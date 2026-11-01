import { calendarDate } from './calendar';
import {
  occurrenceDue,
  validatePlanning,
  validateTime,
} from './productivityRules';
import type { Occurrence } from './productivityTypes';
import { ECO_STAGES } from './ecoConfig';
export const PRODUCTIVITY_TABLES = [
  'occurrences',
  'routines',
  'planVersions',
  'executionRecords',
  'productivityAudit',
  'savedMissionSessions',
  'achievementReceipts',
];
type Row = Record<string, any>;
function requireValue(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(`Backup inválido: ${message}.`);
}
function resources(value: Row) {
  requireValue(
    value &&
      ['xp', 'gold', 'food'].every(
        (key) => Number.isSafeInteger(value[key]) && value[key] >= 0,
      ),
    'recursos ou débitos inválidos',
  );
}
export function validateProductivityBackup(
  lists: Record<string, Row[]>,
  profile: Row | null,
) {
  const tasks = new Set(lists.tasks.map((row) => row.id));
  const routines = new Map(lists.routines.map((row) => [row.id, row]));
  const occurrences = new Map(lists.occurrences.map((row) => [row.id, row]));
  for (const task of lists.tasks)
    if (task.productivityVersion) validatePlanning(task, task.subtasks ?? []);
  for (const row of lists.occurrences) {
    requireValue(tasks.has(row.taskId), 'ocorrência sem missão');
    requireValue(
      calendarDate(row.originDate) && calendarDate(row.plannedDate),
      'data de ocorrência inválida',
    );
    requireValue(
      Number.isSafeInteger(row.revision) &&
        row.revision >= 0 &&
        Number.isSafeInteger(row.baseXp) &&
        row.baseXp > 0,
      'revisão ou orçamento inválido',
    );
    requireValue(
      Array.isArray(row.steps) &&
        row.steps.every((step: unknown) => typeof step === 'string') &&
        Array.isArray(row.checkedSteps),
      'etapas inválidas',
    );
    requireValue(
      [
        'planned',
        'active',
        'paused',
        'partial',
        'completed',
        'discarded',
        'excused',
      ].includes(row.status),
      'estado de ocorrência inválido',
    );
    validatePlanning(row, row.steps);
    validateTime(row.originalTime);
    if (row.modifiers)
      for (const key of ['xpMultiplier', 'goldMultiplier', 'foodMultiplier'])
        requireValue(
          Number.isFinite(row.modifiers[key]) && row.modifiers[key] >= 0,
          'modificador inválido',
        );
    requireValue(
      row.value === 0 || row.modifiers,
      'progresso sem modificadores fixados',
    );
    resources(row.due);
    const due = occurrenceDue(row as Occurrence);
    requireValue(
      ['xp', 'gold', 'food'].every(
        (key) => due[key as keyof typeof due] === row.due[key],
      ),
      'orçamento não corresponde ao progresso',
    );
    requireValue(
      !['discarded', 'excused'].includes(row.status) || row.value === 0,
      'pausa ou descarte com execução',
    );
    const history = lists.executionRecords
      .filter((record) => record.occurrenceId === row.id)
      .sort((a, b) => a.revision - b.revision);
    if (history.length)
      requireValue(
        history.at(-1)!.after === row.value,
        'progresso difere do histórico',
      );
    if (row.actualMinutes !== undefined) {
      const actual = history.reduce(
        (sum, record) =>
          sum +
          (record.minutes ??
            ((record.method ?? row.tracking?.method) === 'time'
              ? record.after - record.before
              : 0)),
        0,
      );
      requireValue(
        Number.isFinite(row.actualMinutes) &&
          row.actualMinutes >= 0 &&
          Math.abs(actual - row.actualMinutes) < 0.000001,
        'tempo realizado difere do histórico',
      );
    }
  }
  const bound = new Set<number>();
  for (const row of lists.routines) {
    requireValue(
      typeof row.name === 'string' &&
        row.name.trim() &&
        Array.isArray(row.days) &&
        row.days.length &&
        new Set(row.days).size === row.days.length &&
        row.days.every(
          (day: number) => Number.isInteger(day) && day >= 0 && day <= 6,
        ),
      'rotina inválida',
    );
    requireValue(
      ['active', 'paused', 'archived'].includes(row.status) &&
        calendarDate(row.startDate),
      'planejamento de rotina inválido',
    );
    requireValue(
      Number.isSafeInteger(row.pauseQuota) &&
        row.pauseQuota >= 0 &&
        Number.isSafeInteger(row.pausePeriodDays) &&
        row.pausePeriodDays > 0,
      'cota de pausas inválida',
    );
    requireValue(Array.isArray(row.entries), 'atividades de rotina inválidas');
    for (const entry of row.entries) {
      requireValue(
        tasks.has(entry.taskId) && !bound.has(entry.taskId),
        'missão em mais de uma rotina',
      );
      bound.add(entry.taskId);
      validateTime(entry.time);
      requireValue(
        entry.previousPlan && typeof entry.previousPlan === 'object',
        'planejamento anterior ausente',
      );
    }
  }
  for (const task of lists.tasks)
    if (task.routineId)
      requireValue(
        routines
          .get(task.routineId)
          ?.entries.some((entry: Row) => entry.taskId === task.id),
        'vínculo com rotina inválido',
      );
  for (const row of lists.planVersions)
    requireValue(
      tasks.has(row.taskId) &&
        calendarDate(row.effectiveFrom) &&
        row.definition?.id === row.taskId &&
        Number.isFinite(Date.parse(row.recordedAt)),
      'versão de planejamento inválida',
    );
  for (const row of lists.executionRecords) {
    requireValue(
      occurrences.has(row.occurrenceId) &&
        Number.isSafeInteger(row.revision) &&
        row.revision > 0,
      'execução sem ocorrência',
    );
    requireValue(
      Number.isFinite(row.before) &&
        row.before >= 0 &&
        Number.isFinite(row.after) &&
        row.after >= 0 &&
        typeof row.correction === 'boolean',
      'progresso de execução inválido',
    );
    requireValue(
      calendarDate(row.localDate) &&
        validateTime(row.localTime) &&
        typeof row.timezone === 'string' &&
        Number.isFinite(row.offsetMinutes),
      'contexto temporal inválido',
    );
    requireValue(
      Number.isFinite(Date.parse(row.executedAt)) &&
        Number.isFinite(Date.parse(row.recordedAt)) &&
        Date.parse(row.executedAt) <= Date.parse(row.recordedAt),
      'execução futura ou inválida',
    );
    requireValue(
      row.minutes === null ||
        (Number.isFinite(row.minutes) && (row.minutes >= 0 || row.correction)),
      'tempo realizado inválido',
    );
  }
  let active = 0;
  for (const row of lists.savedMissionSessions) {
    requireValue(
      Array.isArray(row.occurrenceIds) &&
        (row.occurrenceIds.length || row.status === 'ended') &&
        new Set(row.occurrenceIds).size === row.occurrenceIds.length &&
        row.occurrenceIds.every((id: string) => occurrences.has(id)),
      'sessão sem ocorrências válidas',
    );
    requireValue(
      Number.isSafeInteger(row.cursor) &&
        row.cursor >= 0 &&
        row.cursor <= row.occurrenceIds.length &&
        ['active', 'paused', 'ended'].includes(row.status) &&
        ['focus', 'overview'].includes(row.mode),
      'estado de sessão inválido',
    );
    if (row.status === 'active') active++;
  }
  requireValue(active <= 1, 'mais de uma sessão em foco');
  const debt = { xp: 0, gold: 0, food: 0 };
  const claimedStages = new Set(
    lists.activityEvents
      .filter(
        (event) =>
          !event.grossReward &&
          (!event.reversedAt || event.reversalPolicy === 'debt'),
      )
      .flatMap((event) => event.awardedStages),
  );
  for (const event of [...lists.activityEvents].sort(
    (a, b) => a.sequence - b.sequence,
  )) {
    requireValue(
      new Set(event.awardedStages).size === event.awardedStages.length,
      'marcos duplicados no recibo',
    );
    if (event.milestoneGold !== undefined)
      requireValue(
        Number.isSafeInteger(event.milestoneGold) &&
          event.milestoneGold >= 0 &&
          event.milestoneGold ===
            event.awardedStages.reduce(
              (sum: number, id: number) =>
                sum +
                (ECO_STAGES.find((stage) => stage.id === id)
                  ?.goldRewardOnEnter ?? 0),
              0,
            ),
        'prêmio de marco inválido',
      );
    if (event.executionComplete !== undefined)
      requireValue(
        typeof event.executionComplete === 'boolean',
        'estado da execução inválido',
      );
    if (event.reversalPolicy !== undefined)
      requireValue(
        event.reversalPolicy === 'debt',
        'política de correção inválida',
      );
    if (event.grossReward)
      for (const id of event.awardedStages) {
        requireValue(!claimedStages.has(id), 'marco concedido novamente');
        claimedStages.add(id);
      }
    if (event.occurrenceId)
      requireValue(
        occurrences.has(event.occurrenceId),
        'recompensa sem ocorrência',
      );
    if (event.grossReward) {
      resources(event.grossReward);
      resources(event.compensation);
      for (const key of ['xp', 'gold', 'food'] as const)
        requireValue(
          event.grossReward[key] - event.compensation[key] ===
            event.reward[key],
          'ganho líquido não corresponde ao bruto',
        );
    }
    if (event.debtAdded) {
      resources(event.debtAdded);
      if (event.kind === 'reversal') {
        const source = lists.activityEvents.find(
          (row) => row.id === event.sourceEventId,
        );
        requireValue(source, 'débito sem origem');
        const gross = source.grossReward ?? source.reward;
        const stageGold =
          source.milestoneGold ??
          source.awardedStages.reduce(
            (sum: number, id: number) =>
              sum + ({ 2: 200, 3: 500, 4: 1000 }[id] ?? 0),
            0,
          );
        requireValue(
          event.debtAdded.xp === gross.xp &&
            event.debtAdded.gold === Math.max(0, gross.gold - stageGold) &&
            event.debtAdded.food === gross.food,
          'débito difere da origem',
        );
      } else {
        const audit = lists.productivityAudit.find(
          (row) => row.id === event.id.replace(/^debt:/, 'progress:'),
        );
        requireValue(
          audit?.action === 'correction',
          'débito sem correção auditada',
        );
        for (const key of ['xp', 'gold', 'food'])
          requireValue(
            event.debtAdded[key] ===
              Math.max(0, audit.before.due[key] - audit.after.due[key]),
            'débito difere da correção',
          );
      }
    }
    for (const key of ['xp', 'gold', 'food'] as const) {
      debt[key] +=
        (event.debtAdded?.[key] ?? 0) - (event.compensation?.[key] ?? 0);
      requireValue(
        Number.isSafeInteger(debt[key]) && debt[key] >= 0,
        'débito fora do limite seguro',
      );
    }
  }
  const protectedStage = lists.activityEvents
    .filter((event) => event.grossReward || event.reversalPolicy === 'debt')
    .reduce((highest, event) => Math.max(highest, ...event.awardedStages), 1);
  requireValue(
    (profile?.ecoGoldClaimedUpToStage ?? 1) >= protectedStage,
    'marco protegido foi removido',
  );
  for (const row of lists.occurrences) {
    const due = { xp: 0, gold: 0, food: 0 };
    for (const event of lists.activityEvents.filter(
      (entry) => entry.occurrenceId === row.id,
    ))
      for (const key of ['xp', 'gold', 'food'] as const) {
        due[key] +=
          (event.kind === 'task'
            ? (event.grossReward?.[key] ?? event.reward[key]) -
              (key === 'gold' ? (event.milestoneGold ?? 0) : 0)
            : 0) - (event.debtAdded?.[key] ?? 0);
      }
    requireValue(
      ['xp', 'gold', 'food'].every(
        (key) => due[key as keyof typeof due] === row.due[key],
      ),
      'parcelas duplicadas ou incompatíveis com o orçamento da ocorrência',
    );
  }
  const awardedProgress = new Set<string>();
  for (const event of lists.activityEvents.filter(
    (row) => row.occurrenceId && row.kind === 'task',
  )) {
    const requestId = event.id.replace(/^progress:/, '');
    const record = lists.executionRecords.find((row) => row.id === requestId);
    requireValue(
      record && record.occurrenceId === event.occurrenceId,
      'recompensas duplicadas ou sem execução',
    );
    requireValue(!awardedProgress.has(record.id), 'recompensas duplicadas');
    awardedProgress.add(record.id);
  }
  if (profile?.rewardDebt) resources(profile.rewardDebt);
  for (const key of ['xp', 'gold', 'food'] as const)
    requireValue(
      debt[key] >= 0 && debt[key] === (profile?.rewardDebt?.[key] ?? 0),
      'débito difere do histórico',
    );
  for (const row of lists.achievementReceipts)
    requireValue(
      Number.isFinite(Date.parse(row.earnedAt)) &&
        (!row.invalidatedAt || Number.isFinite(Date.parse(row.invalidatedAt))),
      'recibo de conquista inválido',
    );
}
