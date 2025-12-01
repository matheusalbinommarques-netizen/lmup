const r = [
  {
    id: 1,
    label: 'Semente',
    image: '/art/bg/eco-stage-1-seed.webp',
    minXp: 0,
    maxXp: 2500,
    xpBonusMultiplier: 1,
    goldRewardOnEnter: 0,
  },
  {
    id: 2,
    label: 'Brotinho',
    image: '/art/bg/eco-stage-2-sprout.webp',
    minXp: 2500,
    maxXp: 7500,
    xpBonusMultiplier: 1.05,
    goldRewardOnEnter: 200,
  },
  {
    id: 3,
    label: 'Árvore Jovem',
    image: '/art/bg/eco-stage-3-tree.webp',
    minXp: 7500,
    maxXp: 12e3,
    xpBonusMultiplier: 1.1,
    goldRewardOnEnter: 500,
  },
  {
    id: 4,
    label: 'Floresta Anciã',
    image: '/art/bg/eco-stage-4-forest.webp',
    minXp: 12e3,
    maxXp: null,
    xpBonusMultiplier: 1.2,
    goldRewardOnEnter: 1e3,
  },
];
function i(t) {
  let e = r[0];
  for (const a of r)
    if (t >= a.minXp) e = a;
    else break;
  return e;
}
function p(t) {
  const e = i(t);
  if (e.maxXp == null) return 100;
  const a = Math.max(e.minXp, Math.min(t, e.maxXp)),
    n = e.maxXp - e.minXp;
  if (n <= 0) return 100;
  const o = ((a - e.minXp) / n) * 100;
  return Math.max(0, Math.min(100, o));
}
export { r as E, p as a, i as g };
