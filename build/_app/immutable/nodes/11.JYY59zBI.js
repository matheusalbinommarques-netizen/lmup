import '../chunks/DsnmJJEf.js';
import {
  p as ke,
  c as z,
  s as Y,
  o as Ge,
  f as b,
  t as w,
  d as p,
  e as Ie,
  j as i,
  h as r,
  g as e,
  k as f,
  l as m,
  b as j,
  r as s,
  n as W,
  w as J,
  q as Le,
  m as qe,
} from '../chunks/C4tos-D-.js';
import { i as M } from '../chunks/D7NEdK74.js';
import { e as K } from '../chunks/BYKdWbGi.js';
import { s as xe, a as O, c as Fe } from '../chunks/B28y5Mvi.js';
import { s as fe } from '../chunks/B0IkYSzE.js';
import { l as V, d as Z } from '../chunks/CUrLQr9X.js';
import { g as Ne, a as Qe, E as be } from '../chunks/Beyb9IEN.js';
import { a as Ue } from '../chunks/Cxxjmckw.js';
import { P as He } from '../chunks/CpUvk0iO.js';
var Re = b('<span> </span>'),
  ze = b('<span> </span>'),
  Ye = b(
    '<p class="mt-1 text-[0.7rem] text-emerald-200/90">Detalhe do bônus atual: <br/> <br/> <br/> </p>',
  ),
  We = b(
    '<div class="flex items-center justify-between gap-2"><div class="flex items-center gap-2"><span> </span> <span> </span></div> <span class="text-slate-400"> </span></div>',
  ),
  Je = b(
    '<div class="flex items-center justify-between gap-2"><div class="flex items-center gap-2"><span class="text-base"><!></span> <span> </span></div> <span> </span></div>',
  ),
  Ke = b(
    '<div class="space-y-1"><div class="flex items-center justify-between text-[0.75rem]"><span class="font-medium text-slate-100"> </span> <span class="text-slate-400"> <span class="text-slate-500"> </span></span></div> <div class="h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800/60"><div class="h-full bg-gradient-to-r from-emerald-500 to-emerald-300"></div></div></div>',
  ),
  Ve = b('<div class="mt-2 space-y-2"></div>'),
  Ze =
    b(`<p class="mt-2 text-[0.7rem] text-slate-500">Ainda não há XP suficiente registrado para destacar áreas. Complete
        algumas missões para começar a ver a floresta ganhar forma.</p>`),
  ea =
    b(`<section class="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden flex flex-col gap-5"><div class="flex flex-col gap-4 md:flex-row"><div class="md:w-2/3 flex flex-col gap-3"><img class="w-full h-68 object-cover rounded-lg border border-slate-700/50 shadow-inner"/> <div><div class="flex items-center justify-between text-xs text-slate-400 mb-1"><span class="font-medium text-slate-300">Estágio do Santuário: <span class="text-emerald-300"> </span></span> <span class="inline-flex items-center gap-1 font-medium text-slate-200"><img src="/art/icones/icon-xp.png" alt="XP" class="h-4 w-4 object-contain"/> <!></span></div> <div class="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50"><div class="h-full bg-gradient-to-r from-green-600 to-emerald-400 transition-all duration-500"></div></div> <p class="mt-1 text-[0.7rem] text-slate-400">Progresso dentro do estágio atual do Santuário. O bônus de XP aumenta
          conforme você evolui — e pode ser turbinado por anéis especiais.</p></div></div> <aside class="md:w-1/3 flex flex-col gap-3"><div class="rounded-xl border border-emerald-500/40 bg-slate-950/70 px-3 py-3 flex flex-col gap-2"><h3 class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Bênçãos do Santuário</h3> <p class="text-[0.8rem] text-slate-200">Bônus permanente de XP: <span class="font-semibold text-emerald-300"> </span> em todas as missões.</p> <p class="text-[0.7rem] text-slate-400">O bônus é aplicado automaticamente sempre que você ganha XP. Ouro é
          calculado em cima do XP final, então o Santuário também turbina seu
          Gold.</p> <!> <div class="mt-2 space-y-1.5 text-[0.7rem]"></div></div> <div class="rounded-xl border border-amber-500/40 bg-slate-950/70 px-3 py-3 flex flex-col gap-2"><h3 class="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Recompensas do Santuário</h3> <p class="text-[0.7rem] text-slate-300">Ao alcançar cada estágio, você já recebeu (ou receberá) um baú único
          de Gold:</p> <div class="mt-1 space-y-1.5 text-[0.7rem]"></div> <p class="mt-1 text-[0.65rem] text-slate-500">Essas recompensas são automáticas e só são dadas uma vez por estágio,
          mesmo que você saia e volte do jogo.</p></div></aside></div> <div class="mt-1 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 flex flex-col gap-2"><div class="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between"><h3 class="text-sm font-semibold text-slate-100">🌱 Árvore de Área em Destaque</h3> <p class="text-[0.7rem] text-slate-400 md:max-w-md">Mostra quais áreas mais alimentaram o Santuário nos últimos ~30 dias.
        Quanto mais XP uma área gera, mais ela "rega" sua floresta.</p></div> <!></div></section>`);
function aa(B, X) {
  ke(X, !0);
  const P = {
      id: 1,
      name: '...',
      title: '...',
      level: 0,
      xpCurrent: 0,
      xpNext: 100,
      avatarUrl: '',
      totalXpEarned: 0,
      gold: 0,
      currentStreak: 0,
      lastCompletionDate: '',
      activeCompanionId: 1,
    },
    E = z(P);
  let ee = Y(z([])),
    $ = Y(z([])),
    C = Y(0);
  const ge = V(() => Z.profile.get(1)),
    _e = V(() => Z.areas.toArray()),
    he = V(() => Z.xpLogs.toArray());
  Ge(() => {
    const o = ge.subscribe((t) => {
        Object.assign(E, t || P);
      }),
      a = _e.subscribe((t) => {
        j(ee, t ?? [], !0);
      }),
      n = he.subscribe((t) => {
        j($, t ?? [], !0);
      });
    return (
      (async () => {
        try {
          const t = await Ue();
          j(C, t.sanctuaryBonusExtraPercent ?? 0, !0);
        } catch (t) {
          (console.error('Erro ao carregar HeroModifiers no EcoPanel:', t),
            j(C, 0));
        }
      })(),
      () => {
        (o.unsubscribe(), a.unsubscribe(), n.unsubscribe());
      }
    );
  });
  const A = f(() => E.totalXpEarned ?? 0),
    g = f(() => Ne(e(A))),
    we = f(() => Qe(e(A))),
    ae = f(() => Math.round(((e(g).xpBonusMultiplier ?? 1) - 1) * 100)),
    D = f(() => e(C) || 0),
    te = f(() => Math.max(0, e(ae) + e(D))),
    ye = f(() => e(D) > 0),
    Se = f(() => {
      const a = E?.ecoGoldClaimedUpToStage;
      return typeof a == 'number' && a >= 1 ? a : 1;
    }),
    Xe = f(() => {
      const o = e(g),
        a = e(Se);
      return be.map((n) => {
        let t;
        return (
          n.id <= a
            ? (t = 'claimed')
            : n.id <= o.id
              ? (t = 'available')
              : (t = 'locked'),
          { ...n, status: t }
        );
      });
    }),
    se = f(() => {
      if (!e($).length) return [];
      const o = new Date(),
        a = 720 * 60 * 60 * 1e3,
        n = new Date(o.getTime() - a),
        t = {};
      for (const l of e($)) {
        const v = Number(l.amount) || 0;
        if (v <= 0) continue;
        let c;
        if (l.createdAt instanceof Date) c = l.createdAt;
        else if (typeof l.createdAt == 'string') c = new Date(l.createdAt);
        else if (typeof l.date == 'string') c = new Date(l.date);
        else continue;
        if (c.getTime() < n.getTime()) continue;
        const x = l.areaId ?? 0,
          u = Number.isFinite(x) ? x : 0;
        t[u] = (t[u] ?? 0) + v;
      }
      const d = Object.entries(t).map(([l, v]) => {
        const c = Number(l),
          x = e(ee).find((T) => T.id === c),
          u = c === 0 ? 'Geral' : x?.nome?.trim() || `Área #${c.toString()}`;
        return { areaId: c, name: u, totalXp: v };
      });
      if (!d.length) return [];
      const _ = d.reduce((l, v) => l + v.totalXp, 0) || 1;
      return (
        d.sort((l, v) => v.totalXp - l.totalXp),
        d
          .slice(0, 3)
          .map((l) => ({
            ...l,
            percentOfTotal: Math.round((l.totalXp / _) * 100),
          }))
      );
    });
  var k = ea(),
    G = r(k),
    I = r(G),
    L = r(I),
    re = i(L, 2),
    q = r(re),
    F = r(q),
    oe = i(r(F)),
    Pe = r(oe, !0);
  (s(oe), s(F));
  var le = i(F, 2),
    Ee = i(r(le), 2);
  {
    var Te = (o) => {
        var a = Re(),
          n = r(a);
        (s(a),
          w(
            (t, d) =>
              m(
                n,
                `${t ?? ''} /
                ${d ?? ''}`,
              ),
            [() => e(A).toLocaleString(), () => e(g).maxXp.toLocaleString()],
          ),
          p(o, a));
      },
      Me = (o) => {
        var a = ze(),
          n = r(a);
        (s(a),
          w((t) => m(n, `${t ?? ''} (Máx)`), [() => e(A).toLocaleString()]),
          p(o, a));
      };
    M(Ee, (o) => {
      e(g).maxXp != null ? o(Te) : o(Me, !1);
    });
  }
  (s(le), s(q));
  var ne = i(q, 2),
    Ae = r(ne);
  (s(ne), W(2), s(re), s(I));
  var ie = i(I, 2),
    N = r(ie),
    Q = i(r(N), 2),
    de = i(r(Q)),
    je = r(de);
  (s(de), W(), s(Q));
  var ce = i(Q, 4);
  {
    var Oe = (o) => {
      var a = Ye(),
        n = i(r(a), 2),
        t = i(n, 2),
        d = i(t, 2);
      (s(a),
        w(() => {
          (m(n, ` • Santuário (estágio): +${e(ae) ?? ''}% XP `),
            m(t, ` • Anéis equipados: +${e(D) ?? ''}% XP `),
            m(d, ` • Total aplicado: +${e(te) ?? ''}% XP`));
        }),
        p(o, a));
    };
    M(ce, (o) => {
      e(ye) && o(Oe);
    });
  }
  var me = i(ce, 2);
  (K(
    me,
    21,
    () => be,
    (o) => o.id,
    (o, a) => {
      var n = We(),
        t = r(n),
        d = r(t),
        _ = r(d, !0);
      s(d);
      var l = i(d, 2),
        v = r(l, !0);
      (s(l), s(t));
      var c = i(t, 2),
        x = r(c);
      (s(c),
        s(n),
        w(
          (u) => {
            (O(
              d,
              1,
              `inline-flex h-5 w-5 items-center justify-center rounded-full border text-[0.6rem]
                    ${e(g).id >= e(a).id ? 'border-emerald-400 text-emerald-300 bg-emerald-950/60' : 'border-slate-700 text-slate-400 bg-slate-900'}`,
            ),
              m(_, e(a).id),
              O(
                l,
                1,
                `font-medium ${e(g).id >= e(a).id ? 'text-slate-100' : 'text-slate-400'}`,
              ),
              m(v, e(a).label),
              m(x, `+${u ?? ''}% XP base`));
          },
          [() => Math.round((e(a).xpBonusMultiplier - 1) * 100)],
        ),
        p(o, n));
    },
  ),
    s(me),
    s(N));
  var ve = i(N, 2),
    pe = i(r(ve), 4);
  (K(
    pe,
    21,
    () => e(Xe),
    (o) => o.id,
    (o, a) => {
      var n = Je(),
        t = r(n),
        d = r(t),
        _ = r(d);
      {
        var l = (h) => {
            var y = J('✅');
            p(h, y);
          },
          v = (h) => {
            var y = Le(),
              U = qe(y);
            {
              var H = (S) => {
                  var R = J('🎁');
                  p(S, R);
                },
                De = (S) => {
                  var R = J('🔒');
                  p(S, R);
                };
              M(
                U,
                (S) => {
                  e(a).status === 'available' ? S(H) : S(De, !1);
                },
                !0,
              );
            }
            p(h, y);
          };
        M(_, (h) => {
          e(a).status === 'claimed' ? h(l) : h(v, !1);
        });
      }
      s(d);
      var c = i(d, 2),
        x = r(c, !0);
      (s(c), s(t));
      var u = i(t, 2),
        T = r(u);
      (s(u),
        s(n),
        w(() => {
          (O(
            c,
            1,
            `font-medium ${e(a).status === 'locked' ? 'text-slate-500' : 'text-slate-100'}`,
          ),
            m(x, e(a).label),
            O(
              u,
              1,
              Fe(
                e(a).status === 'claimed'
                  ? 'text-amber-300'
                  : e(a).status === 'available'
                    ? 'text-amber-200'
                    : 'text-slate-500',
              ),
            ),
            m(T, `+${e(a).goldRewardOnEnter ?? ''} Gold`));
        }),
        p(o, n));
    },
  ),
    s(pe),
    W(2),
    s(ve),
    s(ie),
    s(G));
  var ue = i(G, 2),
    Be = i(r(ue), 2);
  {
    var $e = (o) => {
        var a = Ve();
        (K(
          a,
          21,
          () => e(se),
          (n) => n.areaId,
          (n, t) => {
            var d = Ke(),
              _ = r(d),
              l = r(_),
              v = r(l, !0);
            s(l);
            var c = i(l, 2),
              x = r(c),
              u = i(x),
              T = r(u);
            (s(u), s(c), s(_));
            var h = i(_, 2),
              y = r(h);
            (s(h),
              s(d),
              w(
                (U, H) => {
                  (m(v, e(t).name),
                    m(x, `+${U ?? ''} XP `),
                    m(T, `• ${e(t).percentOfTotal ?? ''}%`),
                    fe(y, H));
                },
                [
                  () => e(t).totalXp.toLocaleString(),
                  () =>
                    `width: ${Math.max(5, Math.min(100, e(t).percentOfTotal))}%;`,
                ],
              ),
              p(n, d));
          },
        ),
          s(a),
          p(o, a));
      },
      Ce = (o) => {
        var a = Ze();
        p(o, a);
      };
    M(Be, (o) => {
      e(se).length > 0 ? o($e) : o(Ce, !1);
    });
  }
  (s(ue),
    s(k),
    w(
      (o) => {
        (xe(L, 'src', e(g).image),
          xe(L, 'alt', e(g).label),
          m(Pe, e(g).label),
          fe(Ae, o),
          m(je, `+${e(te) ?? ''}%`));
      },
      [() => `width: ${Math.max(0, Math.min(100, e(we))).toFixed(1)}%;`],
    ),
    p(B, k),
    Ie());
}
var ta = b('<div class="flex flex-col gap-6"><!> <!></div>');
function pa(B) {
  var X = ta(),
    P = r(X);
  He(P, {
    title: 'Santuário da Natureza',
    subtitle:
      'Conclua missões e ganhe experiência, e seu santuário florescerá para uma floresta vigorosa!',
    iconSrc: '/art/icones/ritual-restauracao.png',
    align: 'center',
  });
  var E = i(P, 2);
  (aa(E, {}), s(X), p(B, X));
}
export { pa as component };
