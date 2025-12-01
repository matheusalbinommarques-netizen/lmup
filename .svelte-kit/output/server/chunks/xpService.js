import './PageTitleCard.js';
const XP_PER_LEVEL = [
  0,
  // índice 0 (não usado)
  250, 300, 360, 433, 520, 624, 750, 900, 1081, 1298, 1559, 1872, 2248, 2699,
  3241, 3892, 4674, 5612, 6739, 8093, 9718, 11670, 14014, 16828, 20208, 24266,
  29140, 34992, 42019,
];
const MAX_LEVEL = 30;
const XP_CUMULATIVE = (() => {
  const acc = [];
  let sum = 0;
  acc[0] = 0;
  acc[1] = 0;
  for (let lvl = 1; lvl < MAX_LEVEL; lvl++) {
    sum += XP_PER_LEVEL[lvl];
    acc[lvl + 1] = sum;
  }
  return acc;
})();
function getXpForNextLevel(level) {
  if (level < 1) return XP_PER_LEVEL[1];
  if (level >= MAX_LEVEL) return 0;
  return XP_PER_LEVEL[level];
}
function getLevelStateFromTotalXp(totalXp) {
  if (totalXp <= 0) {
    return {
      level: 1,
      xpIntoLevel: 0,
      xpForNext: getXpForNextLevel(1),
    };
  }
  let level = 1;
  for (let l = 1; l < MAX_LEVEL; l++) {
    const nextThreshold = XP_CUMULATIVE[l + 1];
    if (totalXp >= nextThreshold) {
      level = l + 1;
    } else {
      break;
    }
  }
  const prevThreshold = XP_CUMULATIVE[level];
  const xpIntoLevel = Math.max(0, totalXp - prevThreshold);
  const xpForNext = level >= MAX_LEVEL ? 0 : getXpForNextLevel(level);
  return { level, xpIntoLevel, xpForNext };
}
export { getLevelStateFromTotalXp as a, getXpForNextLevel as g };
