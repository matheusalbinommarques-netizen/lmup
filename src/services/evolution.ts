import type { ActivityEvent, Area, HeroProject, Task } from './db';
import type { ExecutionRecord, Occurrence } from './productivityTypes';
import { addCalendarDays, calendarDate } from './calendar';
import { wheelView, type WheelInput } from './lifeWheelService';

/**
 * Evolução (lote 4, design "LMUP Evolução" E1/E2/E4): leitura pura dos
 * focos da Roda, dos projetos ativos e de "Meu progresso" nos últimos 30
 * dias. Nada aqui grava, concede recompensa ou cobra; "parada" segue o
 * limiar de 14 dias do Hoje e da Roda.
 */
export const STALE_PROJECT_DAYS = 14;
const WINDOW = 30;

export type EvolutionInput = WheelInput & {
  projects: HeroProject[];
  executionRecords: ExecutionRecord[];
  /** Ocorrências no plano de hoje (`todayView().planned`, sem as flexíveis). */
  plannedToday: Occurrence[];
};

export type EvolutionFocus = {
  key: string;
  label: string;
  rating: number | null;
  activeDays: number;
  previousActiveDays: number;
  /** 30 dias, do mais antigo para hoje; true = dia com ação. */
  strip: boolean[];
  intention: string | null;
};

export type EvolutionProject = {
  id: number;
  name: string;
  areaName: string;
  status: HeroProject['status'];
  done: number;
  total: number;
  next: { taskId: number; title: string } | null;
  /** 'today' = já está no dia de hoje; data = planejada; null = sem dia. */
  when: 'today' | string | null;
  staleDays: number | null;
};

const ACTIVE: HeroProject['status'][] = [
  'em_andamento',
  'planejando',
  'pausado',
];

const dayOf = (value: unknown) => {
  try {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value))
      return value.slice(0, 10);
    return calendarDate(value as Date) ?? null;
  } catch {
    return null;
  }
};
const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);

function areaLabel(id: number | null | undefined, areas: Area[]) {
  if (id == null) return 'Sem área';
  if (id === 0) return 'Geral';
  return areas.find((area) => area.id === id)?.nome ?? 'Sem área';
}

/** Conclusões que contam: não estornadas, completas e não corrigidas a zero. */
function countedCompletions(input: EvolutionInput) {
  const undone = new Set(
    (input.occurrences ?? [])
      .filter((row) => row.value === 0)
      .map((row) => row.id),
  );
  return input.events.filter(
    (event) =>
      ['task', 'review'].includes(event.kind) &&
      !event.reversedAt &&
      event.executionComplete !== false &&
      !(event.occurrenceId && undone.has(event.occurrenceId)),
  );
}

function nextTask(project: HeroProject, tasks: Task[]) {
  const order = new Map(
    (project.stages ?? []).map((stage, index) => [stage.id, index]),
  );
  const rank = (task: Task) =>
    task.projectStageId && order.has(task.projectStageId)
      ? order.get(task.projectStageId)!
      : order.size;
  return (
    tasks
      .filter((task) => !task.completed)
      .sort((a, b) => rank(a) - rank(b) || (a.id ?? 0) - (b.id ?? 0))[0] ?? null
  );
}

export function evolutionProjects(
  input: EvolutionInput,
  today: string,
  completions: ActivityEvent[] = countedCompletions(input),
): EvolutionProject[] {
  const onToday = new Set(input.plannedToday.map((row) => row.taskId));
  return input.projects
    .filter(
      (project) => project.id !== undefined && ACTIVE.includes(project.status),
    )
    .sort(
      (a, b) =>
        ACTIVE.indexOf(a.status) - ACTIVE.indexOf(b.status) ||
        (b.id ?? 0) - (a.id ?? 0),
    )
    .map((project) => {
      const tasks = input.tasks.filter(
        (task) => task.projectId === project.id && !task.archived,
      );
      const ids = new Set(tasks.map((task) => task.id));
      const next = nextTask(project, tasks);
      const lastAction = [
        dayOf(project.createdAt),
        ...completions
          .filter(
            (event) => event.taskId !== undefined && ids.has(event.taskId),
          )
          .map((event) => event.date),
        ...input.executionRecords
          .filter((record) =>
            (input.occurrences ?? []).some(
              (row) => row.id === record.occurrenceId && ids.has(row.taskId),
            ),
          )
          .map((record) => record.localDate),
      ]
        .filter((day): day is string => !!day && day <= today)
        .sort()
        .at(-1);
      const idle = lastAction ? daysBetween(lastAction, today) : 0;
      return {
        id: project.id!,
        name: project.name,
        areaName: areaLabel(project.areaId, input.areas),
        status: project.status,
        done: tasks.filter((task) => task.completed).length,
        total: tasks.length,
        next: next ? { taskId: next.id!, title: next.title } : null,
        when: !next
          ? null
          : onToday.has(next.id!)
            ? 'today'
            : next.plannedDate && next.plannedDate > today
              ? next.plannedDate
              : null,
        staleDays:
          next && project.status !== 'pausado' && idle >= STALE_PROJECT_DAYS
            ? idle
            : null,
      };
    });
}

export function evolutionView(input: EvolutionInput, today: string) {
  const wheel = input.profile?.lifeWheel;
  const lastCheckin =
    wheel?.checkins
      .map((row) => row.at)
      .sort()
      .at(-1) ?? null;
  const from = addCalendarDays(today, 1 - WINDOW);
  const strip = (dates: string[]) => {
    const set = new Set(dates);
    return Array.from({ length: WINDOW }, (_, i) =>
      set.has(addCalendarDays(from, i)),
    );
  };
  const focus: EvolutionFocus[] = wheelView(input, today)
    .filter((row) => row.focus)
    .map((row) => ({
      key: row.key,
      label: row.label,
      rating: row.rating,
      activeDays: row.activeDays,
      previousActiveDays: row.previousActiveDays,
      strip: strip(row.activeDates),
      intention: row.focus?.intention ?? null,
    }));

  const completions = countedCompletions(input);
  const projects = evolutionProjects(input, today, completions);
  const activeIds = new Set(projects.map((project) => project.id));
  const recent = completions.filter(
    (event) => event.date >= from && event.date <= today,
  );
  const projectOf = new Map(
    input.tasks.map((task) => [task.id, task.projectId ?? null]),
  );
  const projectMissions = recent.filter(
    (event) => (event.projectId ?? projectOf.get(event.taskId)) != null,
  );
  const minutes = input.executionRecords
    .filter(
      (record) =>
        !record.correction &&
        record.localDate >= from &&
        record.localDate <= today,
    )
    .reduce((sum, record) => sum + Math.max(0, record.minutes ?? 0), 0);
  const finished = input.events.filter(
    (event) =>
      event.kind === 'project' &&
      !event.reversedAt &&
      event.date >= from &&
      event.date <= today,
  );
  return {
    focus,
    lastCheckin: lastCheckin ? dayOf(lastCheckin) : null,
    hasCheckins: !!wheel?.checkins.length,
    projects,
    completedProjects: input.projects.filter(
      (project) => project.status === 'concluido',
    ).length,
    progress: {
      missions: recent.length,
      minutes,
      projectMissions: projectMissions.length,
      // Só projetos ativos, para fechar com "dos N projetos ativos".
      projectsTouched: new Set(
        projectMissions
          .map((event) => event.projectId ?? projectOf.get(event.taskId))
          .filter((id) => id != null && activeIds.has(id)),
      ).size,
      finished: finished.map(
        (event) =>
          input.projects.find((project) => project.id === event.projectId)
            ?.name ?? 'Projeto',
      ),
    },
  };
}

export type EvolutionView = ReturnType<typeof evolutionView>;
