import type { Task } from './db';

export type ProjectDifficultyKey =
  | 'none'
  | 'facil'
  | 'media'
  | 'dificil'
  | 'expert';

export function getProjectBaseXp(tasks: Task[]): number {
  return tasks
    .filter((task) => !task.archived)
    .reduce((sum, task) => sum + task.xp, 0);
}

export function getProjectDifficultyInfoForTasks(tasks: Task[]) {
  const totalTasks = tasks.filter((task) => !task.archived).length;
  const difficultyKey: ProjectDifficultyKey =
    totalTasks === 0
      ? 'none'
      : totalTasks <= 2
        ? 'facil'
        : totalTasks <= 4
          ? 'media'
          : totalTasks <= 9
            ? 'dificil'
            : 'expert';
  const bonusXpFraction = {
    none: 0,
    facil: 0.1,
    media: 0.15,
    dificil: 0.2,
    expert: 0.25,
  }[difficultyKey];
  return {
    totalTasks,
    difficultyKey,
    bonusXpFraction,
    bonusXpPercent: Math.round(bonusXpFraction * 100),
  };
}
