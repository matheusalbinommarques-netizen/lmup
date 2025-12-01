import { d as a } from './CUrLQr9X.js';
import { x as d } from './BNQQrpbk.js';
import { a as p } from './Cxxjmckw.js';
const m = { none: 0, facil: 0.1, media: 0.15, dificil: 0.2, expert: 0.25 };
function w(t) {
  return t.filter((r) => !r.archived).reduce((r, e) => r + (e.xp || 0), 0);
}
function y(t) {
  return t <= 0
    ? 'none'
    : t <= 2
      ? 'facil'
      : t <= 4
        ? 'media'
        : t <= 9
          ? 'dificil'
          : 'expert';
}
function h(t) {
  const e = t.filter((s) => !s.archived).length,
    n = y(e),
    o = m[n] ?? 0;
  return {
    totalTasks: e,
    difficultyKey: n,
    bonusXpFraction: o,
    bonusXpPercent: Math.round(o * 100),
  };
}
function k(t) {
  const r = t.filter((e) => !e.archived);
  return r.length === 0
    ? !1
    : r.every((e) => {
        const n = e;
        return e.completed === !0 || n.status === 'completed';
      });
}
async function F(t) {
  if (!t) return;
  const r = await a.projects.get(t);
  if (!r || r.rewardGranted) return;
  const e = await a.tasks.where('projectId').equals(t).toArray();
  if (!k(e)) return;
  const n = e.filter((c) => !c.archived);
  if (n.length === 0) return;
  const o = w(n);
  if (o <= 0) return;
  const { bonusXpFraction: s } = h(n);
  if (s <= 0) return;
  const f = (await p()).projectBonusExtraFraction ?? 0,
    i = s + f;
  if (i <= 0) return;
  const u = Math.floor(o * i),
    l = Math.round(i * 100);
  (await d.addXp(u, null),
    await a.projects.update(t, {
      status: 'concluido',
      rewardGranted: !0,
      updatedAt: new Date(),
    }));
  {
    const c = `Projeto concluído! Bônus de dificuldade: +${l}% sobre ${o} XP base → +${u} XP (antes do Santuário).`;
    alert(c);
  }
}
async function P(t) {
  t &&
    (await a.transaction('rw', a.projects, a.tasks, async () => {
      (await a.tasks.where('projectId').equals(t).modify({ projectId: null }),
        await a.projects.delete(t));
    }));
}
export { w as a, F as c, P as d, h as g };
