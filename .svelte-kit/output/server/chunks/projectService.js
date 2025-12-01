import './PageTitleCard.js';
import './xpService.js';
const BONUS_BY_DIFFICULTY = {
  none: 0,
  facil: 0.1,
  // Fácil
  media: 0.15,
  // Média
  dificil: 0.2,
  // Difícil
  expert: 0.25,
  // Expert
};
function getProjectBaseXp(tasks) {
  return tasks
    .filter((t) => !t.archived)
    .reduce((sum, t) => sum + (t.xp || 0), 0);
}
function getDifficultyKeyFromTaskCount(taskCount) {
  if (taskCount <= 0) return 'none';
  if (taskCount <= 2) return 'facil';
  if (taskCount <= 4) return 'media';
  if (taskCount <= 9) return 'dificil';
  return 'expert';
}
function getProjectDifficultyInfoForTasks(tasks) {
  const activeTasks = tasks.filter((t) => !t.archived);
  const totalTasks = activeTasks.length;
  const key = getDifficultyKeyFromTaskCount(totalTasks);
  const bonusFraction = BONUS_BY_DIFFICULTY[key] ?? 0;
  return {
    totalTasks,
    difficultyKey: key,
    bonusXpFraction: bonusFraction,
    // ex: 0.1
    bonusXpPercent: Math.round(bonusFraction * 100),
    // ex: 10
  };
}
export { getProjectBaseXp as a, getProjectDifficultyInfoForTasks as g };
