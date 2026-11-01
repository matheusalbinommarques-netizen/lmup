import type { Task, ActivityEvent, HeroProject } from './db';

export type ProjectDifficultyKey =
  'none' | 'facil' | 'media' | 'dificil' | 'expert';

export function getProjectBaseXp(tasks: Task[]): number {
  return tasks
    .filter((task) => !task.archived)
    .reduce((sum, task) => sum + task.xp, 0);
}

export function getProjectDifficultyInfoForTasks(tasks: Task[]) {
  const totalTasks = tasks.filter((task) => !task.archived).length;
  const average = totalTasks ? getProjectBaseXp(tasks) / totalTasks : 0;
  const difficultyKey: ProjectDifficultyKey = !totalTasks
    ? 'none'
    : average <= 50
      ? 'facil'
      : average <= 100
        ? 'media'
        : average <= 150
          ? 'dificil'
          : 'expert';
  const bonusXpFraction = totalTasks ? 0.1 : 0;
  return {
    totalTasks,
    difficultyKey,
    bonusXpFraction,
    bonusXpPercent: Math.round(bonusXpFraction * 100),
  };
}
export function projectRewardTasks(
  tasks: Task[],
  events: ActivityEvent[],
): Task[] {
  const first = new Map<number, ActivityEvent>();
  for (const event of [...events].sort((a, b) => a.sequence - b.sequence))
    if (
      event.taskId &&
      ['task', 'review'].includes(event.kind) &&
      event.executionComplete !== false &&
      !event.reversedAt &&
      !first.has(event.taskId)
    )
      first.set(event.taskId, event);
  return tasks.map((task) => ({
    ...task,
    xp: task.completed ? (first.get(task.id!)?.baseXp ?? task.xp) : task.xp,
  }));
}
export function projectProgress(project: HeroProject, tasks: Task[]) {
  const active = tasks.filter((task) => !task.archived);
  if (!project.stages?.length)
    return {
      value: active.filter((task) => task.completed).length,
      max: Math.max(active.length, 1),
      label: 'Missões concluídas',
    };
  const groups = [
    ...project.stages.map((stage) => stage.id),
    ...(active.some((task) => !task.projectStageId) ? [''] : []),
  ];
  const completed = groups.filter((id) => {
    const rows = active.filter((task) => (task.projectStageId ?? '') === id);
    return rows.length > 0 && rows.every((task) => task.completed);
  });
  return {
    value: completed.length,
    max: groups.length,
    label: 'Etapas concluídas',
  };
}
