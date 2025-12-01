import '../chunks/DsnmJJEf.js';
import {
  p as ge,
  c as be,
  o as he,
  f as u,
  t as w,
  d as p,
  e as _e,
  h as t,
  j as l,
  r as e,
  n as E,
  g as r,
  k as we,
  l as d,
  m as J,
  q as Ce,
} from '../chunks/C4tos-D-.js';
import { i as L } from '../chunks/D7NEdK74.js';
import { e as ye } from '../chunks/BYKdWbGi.js';
import { s as M, a as R } from '../chunks/B28y5Mvi.js';
import { l as Ue, d as ke } from '../chunks/CUrLQr9X.js';
import { P as je } from '../chunks/CpUvk0iO.js';
var Pe = u(
    '<img class="w-full h-full object-cover"/> <img src="/art/hero-avatar-default.png" alt="Moldura do Avatar" class="absolute inset-0 w-full h-full pointer-events-none scale-[1.50]"/>',
    1,
  ),
  Se = u(
    '<img src="/art/hero-avatar-default.png" alt="Seu Avatar" class="w-full h-full object-cover scale-[1.50]"/>',
  ),
  Te = u('<span> </span>'),
  Ee = u(
    '<span class="text-[10px] px-1.5 py-0.5 bg-[#ffb74d]/20 text-[#ffb74d] rounded font-bold ml-2">VOCÊ</span>',
  ),
  Le = u(
    '<tr><td> </td><td><div class="relative w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs overflow-hidden"><!></div> <!></td><td class="px-4 py-4 lg:px-6 text-right text-slate-400"> </td><td class="px-4 py-4 lg:px-6 text-right font-mono text-slate-300"> </td></tr>',
  ),
  Me = u(
    '<div class="min-h-full lmup-bg-cla bg-slate-950/60"><div class="flex flex-col gap-6"><!> <section class="relative overflow-hidden rounded-2xl bg-slate-900/50 border border-slate-800 p-6 lg:p-8 shadow-xl flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left"><div class="shrink-0 w-24 h-24 lg:w-32 lg:h-32 bg-slate-950 rounded-2xl border-2 border-[#ffb74d]/30 flex items-center justify-center text-5xl lg:text-6xl shadow-lg p-4"><img alt="Brasão do Clã" class="opacity-80"/></div> <div class="flex-1 relative z-10"><div class="flex flex-col md:flex-row md:items-center gap-2 mb-2"><h2 class="text-2xl lg:text-3xl font-bold text-slate-100"> </h2> <span class="self-center md:self-auto px-3 py-1 rounded-full bg-[#ffb74d]/10 text-[#ffb74d] text-xs font-bold border border-[#ffb74d]/20"> </span></div> <p class="text-slate-400 text-sm lg:text-base max-w-2xl mb-6"> </p> <div class="flex items-center justify-center md:justify-start gap-6 text-sm"><div class="flex items-center gap-2 text-slate-300"><span class="text-lg">👥</span> <span><strong> </strong> Membros</span></div> <div class="flex items-center gap-2 text-slate-300"><span class="text-lg">⚔️</span> <span><strong>Top 10%</strong> Global</span></div></div></div></section> <section><div class="flex items-center justify-between mb-4"><h3 class="text-xl font-bold text-slate-200 font-serif">Ranking da Temporada</h3> <button class="text-sm text-primary hover:underline">Ver Todos</button></div> <div class="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-sm"><div class="overflow-x-auto"><table class="w-full text-left text-sm"><thead class="bg-slate-950/50 text-slate-400 uppercase text-xs tracking-wider font-medium"><tr><th class="px-4 py-3 lg:px-6">Rank</th><th class="px-4 py-3 lg:px-6 w-full">Herói</th><th class="px-4 py-3 lg:px-6 text-right">Nível</th><th class="px-4 py-3 lg:px-6 text-right">XP Total</th></tr></thead><tbody class="divide-y divide-slate-800/50"></tbody></table></div></div></section></div></div>',
  );
function Be(K, W) {
  ge(W, !0);
  const g = {
      name: 'Guardiões do Código',
      description:
        'Focados em evoluir 1% a cada dia, sem bugs e sem desculpas.',
      level: 12,
      members: 24,
      banner: '/art/icones/icon-cla.png',
    },
    Y = [
      {
        id: 101,
        name: 'Elara Luafera',
        level: 8,
        xpCurrent: 4500,
        title: 'Arquimaga Sênior',
      },
      {
        id: 102,
        name: 'Grommash',
        level: 7,
        xpCurrent: 3950,
        title: 'Devorador de Bugs',
      },
      {
        id: 103,
        name: 'Lyra Lâmina Ágil',
        level: 7,
        xpCurrent: 3800,
        title: 'Refatoradora Chefe',
      },
      {
        id: 104,
        name: 'Kaelthas',
        level: 4,
        xpCurrent: 2100,
        title: 'Estagiário Promissor',
      },
      {
        id: 105,
        name: 'Thorgal',
        level: 4,
        xpCurrent: 1900,
        title: 'Mestre Cervejeiro',
      },
    ],
    v = {
      id: 1,
      name: 'Carregando...',
      title: '...',
      level: 0,
      xpCurrent: 0,
      xpNext: 100,
      avatarUrl: '',
      totalXpEarned: 0,
      currentStreak: 0,
      lastCompletionDate: '',
      activeCompanionId: 1,
      gold: 0,
    },
    c = be(v),
    Z = Ue(() => ke.profile.get(1));
  he(() => {
    const i = Z.subscribe((a) => {
      Object.assign(c, a || v);
    });
    return () => i.unsubscribe();
  });
  const ee = we(() =>
    (() => {
      const i = Y.map((s, m) => ({
          id: s.id,
          name: s.name,
          level: s.level,
          xpCurrent: s.xpCurrent,
          title: s.title,
          isUser: !1,
          avatarUrl: void 0,
          rank: m + 1,
        })),
        a = {
          id: c.id ?? v.id ?? 1,
          name: c.name || v.name,
          level: c.level ?? v.level ?? 1,
          xpCurrent: c.totalXpEarned ?? c.xpCurrent ?? v.totalXpEarned ?? 0,
          title: c.title ?? v.title ?? '',
          isUser: !0,
          avatarUrl: c.avatarUrl ?? v.avatarUrl,
          rank: 0,
        },
        x = [...i, a];
      return (
        x.sort((s, m) => m.xpCurrent - s.xpCurrent),
        x.map((s, m) => ({ ...s, rank: m + 1 }))
      );
    })(),
  );
  function te(i) {
    return i === 1
      ? 'text-yellow-400 font-bold'
      : i === 2
        ? 'text-slate-300 font-bold'
        : i === 3
          ? 'text-amber-600 font-bold'
          : 'text-slate-400';
  }
  var C = Me(),
    X = t(C),
    q = t(X);
  je(q, {
    title: 'Salão do Clã',
    subtitle:
      'Junte-se aos seus irmãos de batalha e conquistem o mundo juntos!',
    iconSrc: '/art/icones/icon-cla.png',
    align: 'center',
  });
  var y = l(q, 2),
    U = t(y),
    ae = t(U);
  e(U);
  var A = l(U, 2),
    k = t(A),
    j = t(k),
    re = t(j, !0);
  e(j);
  var G = l(j, 2),
    se = t(G);
  (e(G), e(k));
  var P = l(k, 2),
    le = t(P);
  e(P);
  var N = l(P, 2),
    $ = t(N),
    B = l(t($), 2),
    D = t(B),
    oe = t(D, !0);
  (e(D), E(), e(B), e($), E(2), e(N), e(A), e(y));
  var I = l(y, 2),
    O = l(t(I), 2),
    Q = t(O),
    V = t(Q),
    z = l(t(V));
  (ye(
    z,
    21,
    () => r(ee),
    (i) => i.id,
    (i, a) => {
      var x = Le(),
        s = t(x),
        m = t(s);
      e(s);
      var h = l(s),
        S = t(h),
        ie = t(S);
      {
        var ne = (o) => {
            var n = Pe(),
              _ = J(n);
            (E(2),
              w(() => {
                (M(_, 'src', r(a).avatarUrl), M(_, 'alt', r(a).name));
              }),
              p(o, n));
          },
          de = (o) => {
            var n = Ce(),
              _ = J(n);
            {
              var pe = (f) => {
                  var b = Se();
                  p(f, b);
                },
                fe = (f) => {
                  var b = Te(),
                    ue = t(b, !0);
                  (e(b), w(() => d(ue, r(a).name[0])), p(f, b));
                };
              L(
                _,
                (f) => {
                  r(a).isUser ? f(pe) : f(fe, !1);
                },
                !0,
              );
            }
            p(o, n);
          };
        L(ie, (o) => {
          r(a).isUser && r(a).avatarUrl ? o(ne) : o(de, !1);
        });
      }
      e(S);
      var F = l(S),
        ve = l(F);
      {
        var ce = (o) => {
          var n = Ee();
          p(o, n);
        };
        L(ve, (o) => {
          r(a).isUser && o(ce);
        });
      }
      e(h);
      var T = l(h),
        xe = t(T, !0);
      e(T);
      var H = l(T),
        me = t(H, !0);
      (e(H),
        e(x),
        w(
          (o, n) => {
            (R(
              x,
              1,
              `transition-colors ${r(a).isUser ? 'bg-primary/10 hover:bg-primary/15' : 'hover:bg-slate-800/30'}`,
            ),
              R(
                s,
                1,
                `px-4 py-4 lg:px-6 whitespace-nowrap text-base ${o ?? ''}`,
              ),
              d(m, `#${r(a).rank ?? ''}`),
              R(
                h,
                1,
                `px-4 py-4 lg:px-6 font-medium flex items-center gap-3 ${r(a).isUser ? 'text-[#ffb74d]' : 'text-slate-200'}`,
              ),
              d(F, ` ${r(a).name ?? ''} `),
              d(xe, r(a).level),
              d(me, n));
          },
          [() => te(r(a).rank), () => r(a).xpCurrent.toLocaleString()],
        ),
        p(i, x));
    },
  ),
    e(z),
    e(V),
    e(Q),
    e(O),
    e(I),
    e(X),
    e(C),
    w(() => {
      (M(ae, 'src', g.banner),
        d(re, g.name),
        d(se, `Nível ${g.level}`),
        d(le, `"${g.description}"`),
        d(oe, g.members));
    }),
    p(K, C),
    _e());
}
export { Be as component };
