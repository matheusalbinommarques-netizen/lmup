import '../chunks/DsnmJJEf.js';
import {
  p as rt,
  c as $e,
  s as M,
  o as st,
  f as v,
  d as i,
  e as ot,
  t as x,
  g as e,
  z as lt,
  k as d,
  h as r,
  j as o,
  b as y,
  r as t,
  q as nt,
  m as it,
  l as n,
  n as E,
  w as Xe,
} from '../chunks/C4tos-D-.js';
import { i as b } from '../chunks/D7NEdK74.js';
import { e as dt } from '../chunks/BYKdWbGi.js';
import { h as ct } from '../chunks/BYYbvhAJ.js';
import { a as oe, s as pt } from '../chunks/B28y5Mvi.js';
import { s as ut } from '../chunks/B0IkYSzE.js';
import { l as le, d as ne } from '../chunks/CUrLQr9X.js';
import { P as vt } from '../chunks/CpUvk0iO.js';
import { a as mt, g as ft } from '../chunks/CPixY0QB.js';
import { g as xt } from '../chunks/Beyb9IEN.js';
const bt = ({ params: V }) => {
    const B = V.id,
      P = Number(B);
    return { projectId: Number.isFinite(P) && P > 0 ? P : null };
  },
  Ot = Object.freeze(
    Object.defineProperty({ __proto__: null, load: bt }, Symbol.toStringTag, {
      value: 'Module',
    }),
  );
var gt = v(
    '<section class="mx-auto w-full max-w-4xl rounded-3xl border border-slate-800 bg-slate-950/80 px-5 py-6 text-center text-sm text-slate-200">Carregando projeto...</section>',
  ),
  _t = v(
    '<section class="mx-auto w-full max-w-4xl rounded-3xl border border-slate-800 bg-slate-950/80 px-5 py-8 text-center text-sm text-slate-200"><p class="mb-3 text-base font-semibold">Projeto inválido.</p> <a href="/projetos" class="inline-flex items-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400">Voltar para Projetos</a></section>',
  ),
  ht = v('<p class="text-sm text-slate-300"> </p>'),
  jt = v('<span class="rounded-full bg-slate-900/80 px-2 py-0.5"> </span>'),
  yt = v('<span class="rounded-full bg-slate-900/80 px-2 py-0.5"> </span>'),
  Pt =
    v(`<div class="mt-2 space-y-1.5"><p>XP base das missões deste projeto (ignorando arquivadas): <strong> </strong></p> <p>Bônus de dificuldade: <strong> </strong> → <strong> </strong> (antes do Santuário)</p> <p>Bônus atual do Santuário: <strong> </strong> sobre qualquer XP que você ganhar.</p> <p class="mt-1 text-emerald-200">Se você concluísse este projeto agora, o <strong>bônus de projeto</strong> renderia aproximadamente: <br/> <strong> </strong> e <strong> </strong> já com o efeito do Santuário aplicado.</p> <p class="text-[0.65rem] text-slate-400">(Os valores reais podem variar um pouco se você subir de estágio
              no Santuário antes de concluir o projeto.)</p></div>`),
  wt =
    v(`<p class="mt-2 text-slate-400">Este projeto ainda não tem missões ligadas suficientes para gerar
            bônus de conclusão.</p>`),
  $t = v(
    '<span class="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-200"> </span>',
  ),
  Xt =
    v(`<p class="text-[0.75rem] text-slate-400">Nenhuma missão vinculada ainda. Você pode criar missões e escolher
            este projeto no campo "Projeto" do formulário.</p>`),
  Nt = v(
    '<li class="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2"><div class="min-w-0"><p> </p> <p class="text-[0.7rem] text-slate-400"> </p></div> <span> </span></li>',
  ),
  St = v('<ul class="space-y-1.5 text-[0.8rem]"></ul>'),
  It = v(
    '<section class="mx-auto flex w-full max-w-4xl flex-col gap-4 rounded-3xl border border-amber-500/70 bg-slate-950/85 px-5 py-5 shadow-[0_0_30px_rgba(245,158,11,0.4)]"><header class="flex flex-col gap-2"><h2 class="text-lg font-semibold text-slate-50"> </h2> <!> <div class="mt-1 flex flex-wrap gap-2 text-[0.7rem] text-slate-400"><!> <!></div></header> <div class="mt-3 rounded-2xl border border-emerald-500/60 bg-slate-950/80 px-4 py-3 text-xs text-slate-100"><p class="text-[0.7rem] uppercase tracking-[0.22em] text-emerald-300/80">Recompensa ao concluir este projeto</p> <!></div> <div class="mt-2 space-y-2 text-[0.8rem] text-slate-300"><div class="flex items-center justify-between"><p class="font-semibold text-slate-200">Progresso do projeto</p> <p> </p></div> <div class="h-2.5 w-full overflow-hidden rounded-full bg-slate-900/90"><div class="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-lime-300 transition-[width] duration-500 ease-out"></div></div> <p class="text-[0.7rem] text-slate-400"><!></p> <div class="mt-1 flex flex-wrap gap-2 text-[0.7rem]"><span> <span class="ml-1 opacity-80"> </span></span> <!></div></div> <div class="mt-4 space-y-2"><div class="flex items-center justify-between"><h3 class="text-sm font-semibold text-slate-100">Missões deste projeto</h3> <a class="rounded-lg bg-emerald-500 px-3 py-1.5 text-[0.75rem] font-semibold text-slate-950 hover:bg-emerald-400">Ver no quadro de missões</a></div> <!></div></section>',
  ),
  Mt = v('<div class="flex flex-col gap-6"><!> <!></div>');
function Ut(V, B) {
  rt(B, !0);
  const P = B.data.projectId ?? null;
  let T = $e(P),
    c = M(null),
    ie = M($e([])),
    D = M(null),
    z = M(!0),
    A = M(!1);
  const Ne = {
    none: {
      label: 'Sem missões',
      range: '0 missões',
      classes: 'border-slate-600 text-slate-300 bg-slate-900/80',
    },
    facil: {
      label: 'Fácil',
      range: '1–2 missões',
      classes: 'border-emerald-400 text-emerald-200 bg-emerald-900/40',
    },
    media: {
      label: 'Média',
      range: '3–4 missões',
      classes: 'border-sky-400 text-sky-200 bg-sky-900/40',
    },
    dificil: {
      label: 'Difícil',
      range: '5–9 missões',
      classes: 'border-purple-400 text-purple-200 bg-purple-900/40',
    },
    expert: {
      label: 'Expert',
      range: '10+ missões',
      classes: 'border-[#ffb74d] text-[#ffb74d] bg-[rgba(255,183,77,0.12)]',
    },
  };
  function k(l) {
    const u = l;
    return !!(u.archived || l.completed || u.status === 'completed');
  }
  function de(l) {
    if (!l) return '';
    const u = l instanceof Date ? l : new Date(l);
    return Number.isNaN(u.getTime()) ? '' : u.toLocaleDateString('pt-BR');
  }
  st(() => {
    if (!T || !Number.isFinite(T)) {
      (y(A, !0), y(z, !1));
      return;
    }
    const l = le(() => ne.projects.get(T)),
      u = le(() => ne.tasks.where('projectId').equals(T).toArray()),
      H = le(() => ne.profile.get(1)),
      K = l.subscribe((m) => {
        (y(c, m ?? null, !0), m || y(A, !0), y(z, !1));
      }),
      R = u.subscribe((m) => {
        y(ie, m ?? [], !0);
      }),
      g = H.subscribe((m) => {
        y(D, m ?? null, !0);
      });
    return () => {
      (K.unsubscribe(), R.unsubscribe(), g.unsubscribe());
    };
  });
  const w = d(() => e(ie).filter((l) => !l.archived)),
    $ = d(() => e(w).length),
    ce = d(() => e(w).filter((l) => k(l)).length),
    pe = d(() => (e($) > 0 ? Math.round((e(ce) / e($)) * 100) : 0)),
    O = d(() => Number(mt(e(w)) ?? 0)),
    X = d(() => ft(e(w))),
    Se = d(() => e(X).difficultyKey ?? 'none'),
    U = d(() => Ne[e(Se)]),
    ue = d(() => Math.floor(Number(e(O)) * Number(e(X).bonusXpFraction ?? 0))),
    ve = d(() =>
      !e(D) || e(D).totalXpEarned == null
        ? 1
        : (xt(e(D).totalXpEarned ?? 0).xpBonusMultiplier ?? 1),
    ),
    Ie = d(() => Math.round((Number(e(ve)) - 1) * 100)),
    me = d(() => Math.round(Number(e(ue)) * Number(e(ve)))),
    Me = d(() => Math.floor(Math.abs(Number(e(me))) * 0.5)),
    Be = d(() =>
      e(c)
        ? `${e(c).name} • Projetos do Herói`
        : 'Projeto inválido • Projetos do Herói',
    );
  var G = Mt();
  ct('14afoed', (l) => {
    x(
      () => {
        lt.title = e(Be) ?? '';
      },
      void 0,
      void 0,
      void 0,
      !0,
    );
  });
  var fe = r(G);
  {
    let l = d(() => (e(c) ? e(c).name : 'Projeto inválido')),
      u = d(() =>
        e(c)
          ? 'Veja as missões ligadas a esta Saga e acompanhe seu progresso.'
          : 'Não foi possível localizar este projeto.',
      );
    vt(fe, {
      get title() {
        return e(l);
      },
      get subtitle() {
        return e(u);
      },
      align: 'center',
    });
  }
  var Te = o(fe, 2);
  {
    var De = (l) => {
        var u = gt();
        i(l, u);
      },
      ke = (l) => {
        var u = nt(),
          H = it(u);
        {
          var K = (g) => {
              var m = _t();
              i(g, m);
            },
            R = (g) => {
              var m = It(),
                W = r(m),
                Q = r(W),
                Fe = r(Q, !0);
              t(Q);
              var xe = o(Q, 2);
              {
                var qe = (a) => {
                  var s = ht(),
                    p = r(s, !0);
                  (t(s), x(() => n(p, e(c).vision)), i(a, s));
                };
                b(xe, (a) => {
                  e(c).vision && a(qe);
                });
              }
              var be = o(xe, 2),
                ge = r(be);
              {
                var Ce = (a) => {
                  var s = jt(),
                    p = r(s);
                  (t(s),
                    x(
                      (f) => n(p, `Criado em ${f ?? ''}`),
                      [() => de(e(c).createdAt)],
                    ),
                    i(a, s));
                };
                b(ge, (a) => {
                  e(c).createdAt && a(Ce);
                });
              }
              var Ee = o(ge, 2);
              {
                var Ve = (a) => {
                  var s = yt(),
                    p = r(s);
                  (t(s),
                    x(
                      (f) => n(p, `Meta: ${f ?? ''}`),
                      [() => de(e(c).targetDate)],
                    ),
                    i(a, s));
                };
                b(Ee, (a) => {
                  e(c).targetDate && a(Ve);
                });
              }
              (t(be), t(W));
              var Y = o(W, 2),
                ze = o(r(Y), 2);
              {
                var Ae = (a) => {
                    var s = Pt(),
                      p = r(s),
                      f = o(r(p)),
                      N = r(f);
                    (t(f), t(p));
                    var h = o(p, 2),
                      _ = o(r(h)),
                      ae = r(_);
                    t(_);
                    var S = o(_, 2),
                      re = r(S);
                    (t(S), E(), t(h));
                    var j = o(h, 2),
                      q = o(r(j)),
                      se = r(q);
                    (t(q), E(), t(j));
                    var C = o(j, 2),
                      I = o(r(C), 5),
                      tt = r(I);
                    t(I);
                    var we = o(I, 2),
                      at = r(we);
                    (t(we),
                      E(),
                      t(C),
                      E(2),
                      t(s),
                      x(() => {
                        (n(N, `${e(O) ?? ''} XP`),
                          n(ae, `${e(X).bonusXpPercent ?? ''}%`),
                          n(re, `+${e(ue) ?? ''} XP base`),
                          n(se, `+${e(Ie) ?? ''}%`),
                          n(tt, `${e(me) ?? ''} XP`),
                          n(at, `${e(Me) ?? ''} Gold`));
                      }),
                      i(a, s));
                  },
                  Oe = (a) => {
                    var s = wt();
                    i(a, s);
                  };
                b(ze, (a) => {
                  e(O) > 0 ? a(Ae) : a(Oe, !1);
                });
              }
              t(Y);
              var J = o(Y, 2),
                L = r(J),
                _e = o(r(L), 2),
                Ue = r(_e);
              (t(_e), t(L));
              var Z = o(L, 2),
                Ge = r(Z);
              t(Z);
              var ee = o(Z, 2),
                He = r(ee);
              {
                var Ke = (a) => {
                    var s = Xe('Nenhuma missão ligada ainda.');
                    i(a, s);
                  },
                  Re = (a) => {
                    var s = Xe();
                    (x(() =>
                      n(
                        s,
                        `Você concluiu ${e(pe) ?? ''}% das missões deste projeto.`,
                      ),
                    ),
                      i(a, s));
                  };
                b(He, (a) => {
                  e($) === 0 ? a(Ke) : a(Re, !1);
                });
              }
              t(ee);
              var he = o(ee, 2),
                F = r(he),
                je = r(F),
                ye = o(je),
                We = r(ye);
              (t(ye), t(F));
              var Qe = o(F, 2);
              {
                var Ye = (a) => {
                  var s = $t(),
                    p = r(s);
                  (t(s),
                    x(() =>
                      n(
                        p,
                        `Bônus de projeto: +${e(X).bonusXpPercent ?? ''}% XP`,
                      ),
                    ),
                    i(a, s));
                };
                b(Qe, (a) => {
                  e(X).bonusXpPercent > 0 && a(Ye);
                });
              }
              (t(he), t(J));
              var Pe = o(J, 2),
                te = r(Pe),
                Je = o(r(te), 2);
              t(te);
              var Le = o(te, 2);
              {
                var Ze = (a) => {
                    var s = Xt();
                    i(a, s);
                  },
                  et = (a) => {
                    var s = St();
                    (dt(
                      s,
                      21,
                      () => e(w),
                      (p) => p.id,
                      (p, f) => {
                        var N = Nt(),
                          h = r(N),
                          _ = r(h),
                          ae = r(_, !0);
                        t(_);
                        var S = o(_, 2),
                          re = r(S);
                        (t(S), t(h));
                        var j = o(h, 2),
                          q = r(j, !0);
                        (t(j),
                          t(N),
                          x(
                            (se, C, I) => {
                              (oe(_, 1, se),
                                n(ae, e(f).title),
                                n(re, `+${e(f).xp ?? ''} XP`),
                                oe(j, 1, C),
                                n(q, I));
                            },
                            [
                              () =>
                                `text-slate-100 ${k(e(f)) ? 'line-through opacity-70' : ''}`,
                              () =>
                                `ml-3 rounded-full px-2 py-0.5 text-[0.65rem] ${k(e(f)) ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-300'}`,
                              () => (k(e(f)) ? 'Concluída' : 'Pendente'),
                            ],
                          ),
                          i(p, N));
                      },
                    ),
                      t(s),
                      i(a, s));
                  };
                b(Le, (a) => {
                  e($) === 0 ? a(Ze) : a(et, !1);
                });
              }
              (t(Pe),
                t(m),
                x(() => {
                  (n(Fe, e(c).name),
                    n(Ue, `${e(ce) ?? ''} / ${e($) ?? ''} missões`),
                    ut(Ge, `width: ${e(pe)}%;`),
                    oe(
                      F,
                      1,
                      `inline-flex items-center rounded-full border px-3 py-1 font-semibold ${e(U).classes}`,
                    ),
                    n(je, `${e(U).label ?? ''} `),
                    n(We, `(${e(U).range ?? ''})`),
                    pt(Je, 'href', `/missoes?projectId=${e(c).id}`));
                }),
                i(g, m));
            };
          b(
            H,
            (g) => {
              e(A) || !e(c) ? g(K) : g(R, !1);
            },
            !0,
          );
        }
        i(l, u);
      };
    b(Te, (l) => {
      e(z) ? l(De) : l(ke, !1);
    });
  }
  (t(G), i(V, G), ot());
}
export { Ut as component, Ot as universal };
