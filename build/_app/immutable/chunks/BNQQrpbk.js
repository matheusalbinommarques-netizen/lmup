import { d } from './CUrLQr9X.js';
import { g as R, E as z } from './Beyb9IEN.js';
import { a as J } from './Cxxjmckw.js';
const Q = [
    {
      key: 'wolf',
      stages: [
        { stage: 1, imagePath: '/art/pets/lobo-1.webp', totalFoodRequired: 0 },
        { stage: 2, imagePath: '/art/pets/lobo-2.webp', totalFoodRequired: 40 },
        {
          stage: 3,
          imagePath: '/art/pets/lobo-3.webp',
          totalFoodRequired: 120,
        },
      ],
    },
    {
      key: 'lich',
      stages: [
        { stage: 1, imagePath: '/art/pets/lich-1.webp', totalFoodRequired: 0 },
        { stage: 2, imagePath: '/art/pets/lich-2.webp', totalFoodRequired: 50 },
        {
          stage: 3,
          imagePath: '/art/pets/lich-3.webp',
          totalFoodRequired: 150,
        },
      ],
    },
    {
      key: 'dragon',
      stages: [
        {
          stage: 1,
          imagePath: '/art/pets/dragao-1.webp',
          totalFoodRequired: 0,
        },
        {
          stage: 2,
          imagePath: '/art/pets/dragao-2.webp',
          totalFoodRequired: 60,
        },
        {
          stage: 3,
          imagePath: '/art/pets/dragao-3.webp',
          totalFoodRequired: 180,
        },
      ],
    },
    {
      key: 'aberration',
      stages: [
        {
          stage: 1,
          imagePath: '/art/pets/aberracao-1.webp',
          totalFoodRequired: 0,
        },
        {
          stage: 2,
          imagePath: '/art/pets/aberracao-2.webp',
          totalFoodRequired: 60,
        },
        {
          stage: 3,
          imagePath: '/art/pets/aberracao-3.webp',
          totalFoodRequired: 180,
        },
      ],
    },
  ],
  T = { 1: 'wolf', 2: 'lich', 3: 'dragon', 4: 'aberration' };
function W(e) {
  return e ? (Q.find((t) => t.key === e) ?? null) : null;
}
function Z(e) {
  return e ? (e.key ? e.key : e.id && T[e.id] ? T[e.id] : null) : null;
}
function ee(e) {
  if (!e) return null;
  const t = Z(e);
  if (!t) return null;
  const o = W(t);
  if (!o || o.stages.length === 0) return null;
  const r = e.foodInvested ?? 0,
    a = e.evolutionStage ?? 1,
    i = o.stages[o.stages.length - 1].stage,
    s = o.stages.findIndex((S) => S.stage === a),
    c = s === -1 ? 0 : s,
    P = o.stages[c],
    l = o.stages[c + 1];
  return {
    key: t,
    stages: o.stages,
    currentStage: P,
    currentIndex: c,
    maxStage: i,
    foodInvested: r,
    nextStage: l,
    nextTotalFoodRequired: l?.totalFoodRequired,
  };
}
function te(e) {
  if (!e) return null;
  const { key: t, currentStage: o } = e,
    r = o.stage,
    a = r === 1 ? 5 : r === 2 ? 10 : 15;
  switch (t) {
    case 'wolf':
      return { xpBonusPercent: a };
    case 'lich':
      return { foodBonusPercent: a };
    case 'dragon':
      return { goldBonusPercent: a };
    case 'aberration':
      return {
        xpBonusPercent: a,
        goldBonusPercent: a,
        foodBonusPercent: a,
        raritySubtaskReduction: r === 3 ? 1 : 0,
      };
    default:
      return null;
  }
}
async function oe() {
  const e = await d.profile.get(1);
  if (!e || !e.activeCompanionId) return null;
  const t = await d.companions.get(e.activeCompanionId),
    o = ee(t);
  return te(o);
}
const b = [
    0, 250, 300, 360, 433, 520, 624, 750, 900, 1081, 1298, 1559, 1872, 2248,
    2699, 3241, 3892, 4674, 5612, 6739, 8093, 9718, 11670, 14014, 16828, 20208,
    24266, 29140, 34992, 42019,
  ],
  g = 30,
  A = (() => {
    const e = [];
    let t = 0;
    ((e[0] = 0), (e[1] = 0));
    for (let o = 1; o < g; o++) ((t += b[o]), (e[o + 1] = t));
    return e;
  })();
function re(e) {
  const t = e.getFullYear(),
    o = String(e.getMonth() + 1).padStart(2, '0'),
    r = String(e.getDate()).padStart(2, '0');
  return `${t}-${o}-${r}`;
}
function p(e) {
  return e < 1 ? b[1] : e >= g ? 0 : b[e];
}
function C(e) {
  if (e <= 0) return { level: 1, xpIntoLevel: 0, xpForNext: p(1) };
  let t = 1;
  for (let i = 1; i < g; i++) {
    const s = A[i + 1];
    if (e >= s) t = i + 1;
    else break;
  }
  const o = A[t],
    r = Math.max(0, e - o),
    a = t >= g ? 0 : p(t);
  return { level: t, xpIntoLevel: r, xpForNext: a };
}
const u = [
  '',
  'Estudante',
  'Acólito',
  'Acólito Mestre',
  'Grão-Acólito Mestre',
  'Iniciado',
  'Mago',
  'Grão-Mago',
  'Grão-Mestre Mago',
  'Arquimago',
  'Arquimago Mestre',
  'Arquimago Grão-Mestre',
  'Arcanista',
  'Erudito',
  'Sábio',
  'Mestre do Conhecimento',
  'Grão-Mestre do Conhecimento',
  'Rei do Conhecimento',
  'Mestre dos Tempos',
  'Grão-Mestre dos Tempos',
  'Entidade do Tempo',
  'Ancião',
  'Grão-Ancião',
  'Grão-Mestre Ancião',
  'Profeta',
  'Mestre Profeta',
  'Grão-Mestre Profeta',
  'Celestial',
  'Semideus',
  'Eterno',
  'O Criador',
];
function F(e) {
  return (e < 1 && (e = 1), e >= u.length ? u[u.length - 1] : u[e] || u[1]);
}
function q(e) {
  return !e || e <= 0
    ? 0
    : e <= 25
      ? 1
      : e <= 50
        ? 2
        : e <= 75
          ? 3
          : e <= 100
            ? 4
            : 4 + Math.floor((e - 100) / 50);
}
async function h() {
  let e = await d.profile.get(1);
  if (e)
    typeof e.food != 'number' &&
      ((e.food = 0), await d.profile.update(e.id, { food: 0 }));
  else {
    const t = new Date();
    ((e = {
      id: 1,
      name: 'Herói sem nome',
      title: F(1),
      level: 1,
      xpCurrent: 0,
      xpNext: p(1),
      totalXpEarned: 0,
      gold: 0,
      food: 0,
      avatarUrl: '',
      currentStreak: 0,
      lastCompletionDate: null,
      activeCompanionId: 1,
      createdAt: t,
      updatedAt: t,
    }),
      await d.profile.add(e));
  }
  return e;
}
async function G(e, t) {
  const o = await h();
  if (!e || e === 0) return o;
  const r = e > 0;
  let a = 1,
    i = 0;
  try {
    const n = await J();
    ((a = n.goldMultiplier ?? 1), (i = n.sanctuaryBonusExtraPercent ?? 0));
  } catch (n) {
    console.error('Falha ao carregar HeroModifiers em xpService:', n);
  }
  let s = {
    xpBonusPercent: 0,
    goldBonusPercent: 0,
    foodBonusPercent: 0,
    raritySubtaskReduction: 0,
  };
  try {
    const n = await oe();
    n &&
      (s = {
        xpBonusPercent: n.xpBonusPercent ?? 0,
        goldBonusPercent: n.goldBonusPercent ?? 0,
        foodBonusPercent: n.foodBonusPercent ?? 0,
        raritySubtaskReduction: n.raritySubtaskReduction ?? 0,
      });
  } catch (n) {
    console.error('Falha ao carregar buffs do companheiro em xpService:', n);
  }
  const c = new Date(),
    P = re(c),
    l = o.totalXpEarned ?? 0,
    L = R(l).xpBonusMultiplier ?? 1,
    I = i > 0 ? i / 100 : 0,
    w = L + I,
    y = r && s.xpBonusPercent > 0 ? 1 + s.xpBonusPercent / 100 : 1,
    E = r && w > 1 ? Math.round(e * w * y) : r ? Math.round(e * y) : e,
    m = Math.max(0, l + E),
    { level: B, xpIntoLevel: k, xpForNext: X } = C(m),
    D = Math.floor(Math.abs(e) * 0.5) * (e >= 0 ? 1 : -1),
    _ = r && s.goldBonusPercent > 0 ? 1 + s.goldBonusPercent / 100 : 1,
    N = Math.round(D * a * _),
    U = o.gold ?? 0,
    O = o.food ?? 0,
    K = r ? q(e) : 0,
    V = r && s.foodBonusPercent > 0 ? 1 + s.foodBonusPercent / 100 : 1,
    H = Math.round(K * V),
    Y = Math.max(0, O + H);
  let f = o.ecoGoldClaimedUpToStage ?? 1,
    v = 0;
  const x = R(m);
  if (r && x.id > f) {
    for (const n of z) n.id > f && n.id <= x.id && (v += n.goldRewardOnEnter);
    f = x.id;
  }
  const $ = Math.max(0, U + N + v),
    M = {
      level: B,
      xpCurrent: k,
      xpNext: X,
      totalXpEarned: m,
      gold: $,
      food: Y,
      title: F(B),
      updatedAt: c,
    };
  ((M.ecoGoldClaimedUpToStage = f), await d.profile.update(o.id, M));
  const j = { date: P, amount: E, areaId: t, createdAt: c };
  return (await d.xpLogs.add(j), { ...o, ...M });
}
async function ne(e, t) {
  return !e || e <= 0 ? h() : G(e, t ?? null);
}
async function ae(e, t) {
  return !e || e <= 0 ? h() : G(-e, t ?? null);
}
const le = {
  addXp: ne,
  removeXp: ae,
  ensureProfile: h,
  getLevelStateFromTotalXp: C,
  getXpForNextLevel: p,
  getTitleForLevel: F,
  getFoodFromEffectiveXp: q,
};
export { F as a, C as b, oe as c, p as g, le as x };
