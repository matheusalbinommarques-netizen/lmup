import type {
  ActivityEvent,
  Task,
  HeroProject,
  Area,
  OwnedShopItem,
  Companion,
  Profile,
  XpLog,
} from './db';
import { dateKey } from './rewardService';
import { addCalendarDays } from './calendar';
import type { Occurrence } from './productivityTypes';
export type ReportInput = {
  occurrences?: Occurrence[];
  profile: Profile;
  events: ActivityEvent[];
  tasks: Task[];
  projects: HeroProject[];
  areas: Area[];
  owned: OwnedShopItem[];
  companions: Companion[];
  logs: XpLog[];
};
export type LedgerRow = {
  id: string;
  date: string;
  occurredAt: string;
  kind: string;
  title: string;
  xp: number;
  gold: number;
  food: number;
  reversed: boolean;
  event?: ActivityEvent;
  areaId: number | null;
  unknownCost?: boolean;
};
export function buildLedger(data: ReportInput): LedgerRow[] {
  const logs = new Map(
    data.logs.filter((log) => log.eventId).map((log) => [log.eventId, log]),
  );
  const eventsById = new Map(data.events.map((event) => [event.id, event]));
  const tasksById = new Map(data.tasks.map((task) => [task.id, task]));
  const projectsById = new Map(
    data.projects.map((project) => [project.id, project]),
  );
  const rows: LedgerRow[] = data.events.map((event) => {
    const source = event.sourceEventId
      ? eventsById.get(event.sourceEventId)
      : event;
    const task = tasksById.get(source?.taskId),
      project = projectsById.get(source?.projectId);
    return {
      id: event.id,
      date: event.date,
      occurredAt: event.occurredAt,
      kind: event.kind,
      title: source?.taskId
        ? (task?.title ?? 'Missão removida') + ' · missão #' + source.taskId
        : source?.projectId
          ? (project?.name ?? 'Projeto removido') +
            ' · projeto #' +
            source.projectId
          : event.kind === 'adjustment'
            ? 'Ajuste de progresso'
            : 'Registro de progresso',
      xp: event.reward.xp,
      gold: event.reward.gold,
      food: event.reward.food,
      reversed: !!event.reversedAt,
      event,
      areaId: logs.get(event.id)?.areaId || null,
    };
  });
  for (const item of data.owned)
    rows.push({
      id: 'purchase:' + item.id,
      unknownCost: item.price == null,
      date: dateKey(new Date(item.acquiredAt)),
      occurredAt: item.acquiredAt,
      kind: 'purchase',
      title: item.name ?? 'Equipamento #' + item.itemId,
      xp: 0,
      gold: -(item.price ?? 0),
      food: 0,
      reversed: false,
      areaId: null,
    });
  for (const pet of data.companions)
    for (const care of pet.careHistory ?? [])
      rows.push({
        id: 'care:' + pet.id + ':' + care.id,
        date: dateKey(new Date(care.occurredAt)),
        occurredAt: care.occurredAt,
        kind: 'care',
        title:
          pet.name +
          (care.toStage > care.fromStage
            ? ' · evolução ' + care.toStage
            : ' · cuidado'),
        xp: 0,
        gold: 0,
        food: -care.amount,
        reversed: false,
        areaId: null,
      });
  return rows.sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime() ||
      (b.event?.sequence ?? 0) - (a.event?.sequence ?? 0),
  );
}
export const ledgerLabels: Record<string, string> = {
  task: 'Conclusão de missão',
  review: 'Sessão de revisão',
  project: 'Bônus de projeto',
  adjustment: 'Ajuste de progresso',
  reversal: 'Estorno',
  purchase: 'Compra',
  care: 'Cuidado de companheiro',
};
export function reportFor(
  data: ReportInput,
  range: '7' | '30' | 'all' = '7',
  today = dateKey(),
) {
  const ledger = buildLedger(data),
    from = range === 'all' ? null : addCalendarDays(today, 1 - Number(range));
  const rows = ledger.filter(
    (row) =>
      range === 'all' || ((!from || row.date >= from) && row.date <= today),
  );
  const executions = rows.filter(
    (row) =>
      ['task', 'review'].includes(row.kind) &&
      !row.reversed &&
      row.event?.executionComplete !== false &&
      (!row.event?.occurrenceId ||
        !data.occurrences ||
        data.occurrences.some(
          (occurrence) =>
            occurrence.id === row.event!.occurrenceId &&
            occurrence.status === 'completed' &&
            occurrence.completionEventId === row.event!.id,
        )),
  );
  const net = rows.reduce(
    (sum, row) => ({
      xp: sum.xp + row.xp,
      gold: sum.gold + row.gold,
      food: sum.food + row.food,
    }),
    { xp: 0, gold: 0, food: 0 },
  );
  const recorded = ledger.reduce(
    (sum, row) => ({
      xp: sum.xp + row.xp,
      gold: sum.gold + row.gold,
      food: sum.food + row.food,
    }),
    { xp: 0, gold: 0, food: 0 },
  );
  const unrecorded = {
    xp: data.profile.totalXpEarned - recorded.xp,
    gold: data.profile.gold - recorded.gold,
    food: (data.profile.food ?? 0) - recorded.food,
  };
  const daily = new Map<string, number>();
  for (const row of rows.filter((row) => row.event))
    daily.set(row.date, (daily.get(row.date) ?? 0) + row.xp);
  const days =
    range === 'all'
      ? [...daily.keys()].sort().slice(-30)
      : Array.from({ length: Number(range) }, (_, i) =>
          addCalendarDays(from!, i),
        );
  const points = days.map((date) => ({ date, xp: daily.get(date) ?? 0 }));
  const byArea = new Map<number | null, number>();
  for (const row of rows.filter((row) => row.event))
    byArea.set(row.areaId, (byArea.get(row.areaId) ?? 0) + row.xp);
  return {
    rows,
    points,
    net,
    recorded,
    unrecorded,
    distinctMissions: new Set(
      executions.map((row) => row.event?.taskId).filter(Boolean),
    ).size,
    reviews: executions.filter((row) => row.kind === 'review').length,
    projects: rows.filter((row) => row.kind === 'project' && !row.reversed)
      .length,
    reversals: rows.filter((row) => row.kind === 'reversal').length,
    byArea: [...byArea.entries()].map(([id, xp]) => ({
      id,
      xp,
      name:
        id == null || id === 0
          ? 'Geral e bônus'
          : (data.areas.find((area) => area.id === id)?.nome ??
            'Área removida #' + id),
    })),
    legacyLogs: data.logs.filter((log) => !log.eventId).length,
    unknownPrices: data.owned.filter((item) => item.price == null).length,
  };
}
