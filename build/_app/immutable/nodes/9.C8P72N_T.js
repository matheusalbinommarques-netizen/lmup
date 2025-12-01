import '../chunks/DsnmJJEf.js';
import {
  v as $t,
  p as Nt,
  s as y,
  c as Me,
  o as At,
  f as x,
  x as Ee,
  b as i,
  h as a,
  j as s,
  t as h,
  d as f,
  e as Mt,
  $ as Et,
  y as qt,
  z as Bt,
  g as e,
  r as t,
  q as Ft,
  m as qe,
  k as q,
  A as It,
  l as b,
  w as Be,
  n as Fe,
} from '../chunks/C4tos-D-.js';
import { i as k } from '../chunks/D7NEdK74.js';
import { e as Wt } from '../chunks/BYKdWbGi.js';
import { h as zt } from '../chunks/BYYbvhAJ.js';
import { a as B, r as Ie, s as We } from '../chunks/B28y5Mvi.js';
import { s as Vt } from '../chunks/B0IkYSzE.js';
import { b as de } from '../chunks/DbSmc52O.js';
import { l as ie, d as G } from '../chunks/CUrLQr9X.js';
import { P as Gt } from '../chunks/CpUvk0iO.js';
import { g as Qt, a as Ut, d as Ht } from '../chunks/CPixY0QB.js';
import { g as Rt } from '../chunks/Beyb9IEN.js';
var Kt = x(
    '<div class="mt-4 flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-8 text-sm text-slate-300">Carregando projetos...</div>',
  ),
  Lt = x(
    '<div class="mt-4 flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-8 text-center text-sm text-slate-300"><p>Nenhum projeto encontrado para este filtro.</p> <p class="text-xs text-slate-500">Crie sua primeira Saga clicando em &quot;Novo projeto&quot;.</p></div>',
  ),
  Ot = x('<p class="text-xs text-slate-300"> </p>'),
  Yt = x('<span class="rounded-full bg-slate-900/80 px-2 py-0.5"> </span>'),
  Jt = x('<span class="rounded-full bg-slate-900/80 px-2 py-0.5"> </span>'),
  Zt =
    x(`<div class="mt-1 space-y-0.5 text-[0.65rem]"><p>XP base das missões: <strong> </strong></p> <p>Bônus de projeto: <strong> </strong> → <strong> </strong> (antes do Santuário)</p> <p>Bônus do Santuário atual: <strong> </strong></p> <p class="text-emerald-200">Se você concluísse esta Saga agora, o bônus renderia
                    aproximadamente <strong> </strong> e <strong> </strong> já com o efeito do Santuário.</p></div>`),
  ea =
    x(`<p class="mt-1 text-[0.65rem] text-slate-500">Ainda sem XP acumulado neste projeto — conclua missões
                  vinculadas para gerar bônus de conclusão.</p>`),
  ta = x(
    '<button type="button" class="rounded-lg border border-red-500/70 px-3 py-1.5 font-semibold text-red-200 hover:bg-red-500/10 disabled:opacity-60 disabled:cursor-not-allowed"> </button>',
  ),
  aa = x(
    '<a class="rounded-lg bg-emerald-500 px-3 py-1.5 font-semibold text-slate-950 hover:bg-emerald-400">Ver missões deste projeto</a>',
  ),
  ra = x(
    '<article class="flex h-full flex-col justify-between rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950/95 px-4 py-4 shadow-[0_0_20px_rgba(15,23,42,0.7)]"><header class="flex flex-col gap-2"><div class="flex items-start justify-between gap-3"><h2 class="text-sm font-semibold text-slate-50"> </h2> <div class="flex flex-col items-end gap-1 text-[0.7rem]"><span> </span> <span> <span class="ml-1 opacity-80"> </span></span></div></div> <!> <div class="mt-1 flex flex-wrap gap-2 text-[0.65rem] text-slate-400"><!> <!></div></header> <div class="mt-3 space-y-2 text-[0.7rem] text-slate-300"><div class="flex items-center justify-between"><p class="font-semibold text-slate-200">Missões ligadas</p> <p> </p></div> <div class="h-2 w-full overflow-hidden rounded-full bg-slate-900/90"><div class="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-lime-300 transition-[width] duration-500 ease-out"></div></div> <p class="text-[0.65rem] text-slate-400"><!></p> <!></div> <footer class="mt-4 flex items-center justify-between gap-3 text-[0.7rem]"><div class="flex items-center gap-2"><a class="rounded-lg border border-slate-600 px-3 py-1.5 font-semibold text-slate-200 hover:border-emerald-400 hover:text-emerald-200">Detalhes do projeto</a> <!></div> <!></footer></article>',
  ),
  sa = x(
    '<p class="mt-3 text-[0.7rem] text-slate-400"> </p> <div class="mt-2 grid gap-4 md:grid-cols-2"></div>',
    1,
  ),
  oa =
    x(`<div class="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 px-4" role="button" tabindex="0"><div class="w-full max-w-md rounded-2xl border border-emerald-500/70 bg-slate-950/95 px-5 py-4 shadow-[0_0_32px_rgba(16,185,129,0.55)]"><h2 class="text-sm font-semibold text-slate-50">Criar novo projeto</h2> <p class="mt-1 text-[0.75rem] text-slate-400">Dê um nome para a sua nova Saga e, se quiser, já defina uma visão e
          uma data-meta para ela.</p> <form class="mt-3 space-y-3 text-[0.8rem]"><div class="space-y-1"><label for="project-name" class="block text-[0.7rem] font-semibold text-slate-200">Nome do projeto</label> <input id="project-name" class="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400" placeholder="Ex.: Projeto Ombro do Freeza"/></div> <div class="space-y-1"><label for="project-vision" class="block text-[0.7rem] font-semibold text-slate-200">Visão (opcional)</label> <textarea id="project-vision" class="min-h-[70px] w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400" placeholder="Como você descreveria essa grande Saga?"></textarea></div> <div class="space-y-1"><label for="project-target-date" class="block text-[0.7rem] font-semibold text-slate-200">Data-meta (opcional)</label> <input id="project-target-date" type="date" class="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"/></div> <div class="mt-4 flex items-center justify-end gap-2"><button type="button" class="rounded-lg border border-slate-600 px-3 py-1.5 text-[0.75rem] font-semibold text-slate-200 hover:bg-slate-800">Cancelar</button> <button type="submit" class="rounded-lg bg-emerald-500 px-4 py-1.5 text-[0.75rem] font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"> </button></div></form></div></div>`),
  la =
    x(`<div class="flex flex-col gap-6"><!> <section class="mx-auto flex w-full max-w-5xl flex-col gap-4 rounded-3xl border border-amber-500/70 bg-slate-950/80 px-5 py-4 shadow-[0_0_32px_rgba(245,158,11,0.45)]"><header class="flex flex-wrap items-center justify-between gap-3"><div><p class="text-[0.7rem] uppercase tracking-[0.22em] text-amber-300/80">Visão geral das Sagas</p> <p class="mt-1 text-xs text-slate-300">Dificuldade é baseada na quantidade de missões ligadas ao projeto e
          define o bônus de XP ao concluir a Saga.</p></div> <div class="flex flex-col items-end gap-2"><div class="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/80 p-1 text-[0.7rem]"><button type="button">Ativos</button> <button type="button">Concluídos</button> <button type="button">Todos</button></div> <button type="button" class="mt-1 inline-flex items-center rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400">Novo projeto</button></div></header> <!></section> <!></div>`);
function _a(ze, Ve) {
  Nt(Ve, !0);
  let ce = y(Me([])),
    ue = y(Me([])),
    F = y(null),
    pe = y(!0),
    C = y(!1),
    A = y(''),
    M = y(''),
    $ = y(''),
    T = y(!1),
    I = y(null);
  const Ge = ie(() => G.projects.toArray()),
    Qe = ie(() => G.tasks.toArray()),
    Ue = ie(() => G.profile.get(1));
  At(() => {
    const r = Ge.subscribe((v) => {
        (i(ce, v ?? [], !0), i(pe, !1));
      }),
      n = Qe.subscribe((v) => {
        i(ue, v ?? [], !0);
      }),
      c = Ue.subscribe((v) => {
        i(F, v ?? null, !0);
      });
    return () => {
      (r.unsubscribe(), n.unsubscribe(), c.unsubscribe());
    };
  });
  function He() {
    (i(A, ''), i(M, ''), i($, ''), i(C, !0));
  }
  function W() {
    e(T) || i(C, !1);
  }
  async function Re(r) {
    r.preventDefault();
    const n = e(A).trim();
    if (n)
      try {
        (i(T, !0),
          await G.projects.add({
            name: n,
            vision: e(M).trim() || null,
            status: 'planejando',
            createdAt: new Date(),
            targetDate: e($) ? new Date(e($)) : null,
          }),
          i(A, ''),
          i(M, ''),
          i($, ''),
          i(C, !1));
      } catch (c) {
        (console.error('Erro ao criar projeto:', c),
          alert('Não foi possível criar o projeto.'));
      } finally {
        i(T, !1);
      }
  }
  async function Ke(r) {
    if (
      !(
        !r ||
        !confirm(
          'Tem certeza de que deseja excluir este projeto? As missões continuarão existindo, mas sem vínculo com ele.',
        )
      )
    )
      try {
        (i(I, r, !0), await Ht(r));
      } catch (c) {
        (console.error('Erro ao excluir projeto:', c),
          alert('Não foi possível excluir o projeto.'));
      } finally {
        i(I, null);
      }
  }
  const ve = {
    em_andamento: 0,
    planejando: 1,
    pausado: 2,
    concluido: 3,
    arquivado: 4,
  };
  function Le(r) {
    switch (r) {
      case 'planejando':
        return 'Planejando';
      case 'em_andamento':
        return 'Em andamento';
      case 'concluido':
        return 'Concluído';
      case 'pausado':
        return 'Pausado';
      case 'arquivado':
        return 'Arquivado';
      default:
        return r;
    }
  }
  function Oe(r) {
    switch (r) {
      case 'planejando':
        return 'border-sky-400/70 text-sky-200 bg-sky-900/40';
      case 'em_andamento':
        return 'border-emerald-400/80 text-emerald-200 bg-emerald-900/40';
      case 'concluido':
        return 'border-amber-400/80 text-amber-200 bg-amber-900/35';
      case 'pausado':
        return 'border-slate-500/70 text-slate-200 bg-slate-900/60';
      case 'arquivado':
        return 'border-slate-700/80 text-slate-400 bg-slate-950/80';
      default:
        return 'border-slate-600 text-slate-200 bg-slate-900/70';
    }
  }
  const be = {
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
  function Ye(r) {
    const n = r;
    return !!(n.archived || r.completed || n.status === 'completed');
  }
  let S = y('ativos');
  const Je = ['planejando', 'em_andamento', 'pausado'],
    me = q(() =>
      !e(F) || e(F).totalXpEarned == null
        ? 1
        : (Rt(e(F).totalXpEarned ?? 0).xpBonusMultiplier ?? 1),
    ),
    fe = q(() => Math.round((Number(e(me)) - 1) * 100)),
    Ze = q(() =>
      e(ce).map((r) => {
        if (!r.id)
          return {
            project: r,
            totalTasks: 0,
            completedTasks: 0,
            completionPercent: 0,
            difficulty: be.none,
            baseXp: 0,
            bonusXpBase: 0,
            bonusXpPercent: 0,
            bonusXpWithSanctuary: 0,
            bonusGoldWithSanctuary: 0,
          };
        const n = e(ue).filter((d) => d.projectId === r.id && !d.archived),
          c = n.length,
          v = n.filter((d) => Ye(d)).length,
          j = c > 0 ? Math.round((v / c) * 100) : 0,
          m = Qt(n),
          g = m.difficultyKey ?? 'none',
          w = be[g],
          D = Number(Ut(n) ?? 0),
          X = Math.floor(Number(D) * Number(m.bonusXpFraction ?? 0)),
          P = Math.round(Number(X) * Number(e(me))),
          u = Math.floor(Math.abs(Number(P)) * 0.5);
        return {
          project: r,
          totalTasks: c,
          completedTasks: v,
          completionPercent: j,
          difficulty: w,
          baseXp: D,
          bonusXpBase: X,
          bonusXpPercent: m.bonusXpPercent ?? 0,
          bonusXpWithSanctuary: P,
          bonusGoldWithSanctuary: u,
        };
      }),
    ),
    z = q(() =>
      (() => {
        const n = [
          ...e(Ze).filter(({ project: c }) =>
            e(S) === 'todos'
              ? !0
              : e(S) === 'ativos'
                ? Je.includes(c.status)
                : c.status === 'concluido',
          ),
        ];
        return (
          n.sort((c, v) => {
            const j = ve[c.project.status] ?? 99,
              m = ve[v.project.status] ?? 99;
            if (j !== m) return j - m;
            const g = c.project.createdAt
                ? new Date(c.project.createdAt).getTime()
                : 0,
              w = v.project.createdAt
                ? new Date(v.project.createdAt).getTime()
                : 0;
            return g - w;
          }),
          n
        );
      })(),
    );
  function xe(r) {
    if (!r) return '';
    const n = r instanceof Date ? r : new Date(r);
    return Number.isNaN(n.getTime()) ? '' : n.toLocaleDateString('pt-BR');
  }
  var Q = la();
  (zt('16dim71', (r) => {
    qt(() => {
      Bt.title = 'Projetos do Herói • Level Me Up';
    });
  }),
    Ee('keydown', Et, (r) => {
      r.key === 'Escape' && e(C) && !e(T) && i(C, !1);
    }));
  var ge = a(Q);
  Gt(ge, {
    title: 'Projetos do Herói',
    subtitle:
      'Enxergue suas grandes Sagas, quantas missões cada uma carrega e o quão desafiadoras elas são.',
    iconSrc: '/art/icones/icon-projetos.png',
    align: 'center',
  });
  var U = s(ge, 2),
    H = a(U),
    _e = s(a(H), 2),
    R = a(_e),
    K = a(R);
  K.__click = () => i(S, 'ativos');
  var L = s(K, 2);
  L.__click = () => i(S, 'concluidos');
  var ye = s(L, 2);
  ((ye.__click = () => i(S, 'todos')), t(R));
  var et = s(R, 2);
  ((et.__click = He), t(_e), t(H));
  var tt = s(H, 2);
  {
    var at = (r) => {
        var n = Kt();
        f(r, n);
      },
      rt = (r) => {
        var n = Ft(),
          c = qe(n);
        {
          var v = (m) => {
              var g = Lt();
              f(m, g);
            },
            j = (m) => {
              var g = sa(),
                w = qe(g),
                D = a(w);
              t(w);
              var X = s(w, 2);
              (Wt(
                X,
                21,
                () => e(z),
                (P) => P.project.id,
                (P, u) => {
                  const d = q(() => e(u).project);
                  var E = ra(),
                    p = a(E),
                    O = a(p),
                    Y = a(O),
                    lt = a(Y, !0);
                  t(Y);
                  var he = s(Y, 2),
                    V = a(he),
                    nt = a(V, !0);
                  t(V);
                  var J = s(V, 2),
                    je = a(J),
                    we = s(je),
                    dt = a(we);
                  (t(we), t(J), t(he), t(O));
                  var ke = s(O, 2);
                  {
                    var it = (o) => {
                      var l = Ot(),
                        _ = a(l, !0);
                      (t(l), h(() => b(_, e(d).vision)), f(o, l));
                    };
                    k(ke, (o) => {
                      e(d).vision && o(it);
                    });
                  }
                  var Pe = s(ke, 2),
                    Se = a(Pe);
                  {
                    var ct = (o) => {
                      var l = Yt(),
                        _ = a(l);
                      (t(l),
                        h(
                          (N) => b(_, `Criado em ${N ?? ''}`),
                          [() => xe(e(d).createdAt)],
                        ),
                        f(o, l));
                    };
                    k(Se, (o) => {
                      e(d).createdAt && o(ct);
                    });
                  }
                  var ut = s(Se, 2);
                  {
                    var pt = (o) => {
                      var l = Jt(),
                        _ = a(l);
                      (t(l),
                        h(
                          (N) => b(_, `Meta: ${N ?? ''}`),
                          [() => xe(e(d).targetDate)],
                        ),
                        f(o, l));
                    };
                    k(ut, (o) => {
                      e(d).targetDate && o(pt);
                    });
                  }
                  (t(Pe), t(p));
                  var Z = s(p, 2),
                    ee = a(Z),
                    De = s(a(ee), 2),
                    vt = a(De);
                  (t(De), t(ee));
                  var te = s(ee, 2),
                    bt = a(te);
                  t(te);
                  var ae = s(te, 2),
                    mt = a(ae);
                  {
                    var ft = (o) => {
                        var l =
                          Be(`Nenhuma missão ligada ainda — em breve você poderá associar
                  missões diretamente ao projeto.`);
                        f(o, l);
                      },
                      xt = (o) => {
                        var l = Be();
                        (h(() =>
                          b(
                            l,
                            `Você concluiu ${e(u).completionPercent ?? ''}% das missões deste
                  projeto.`,
                          ),
                        ),
                          f(o, l));
                      };
                    k(mt, (o) => {
                      e(u).totalTasks === 0 ? o(ft) : o(xt, !1);
                    });
                  }
                  t(ae);
                  var gt = s(ae, 2);
                  {
                    var _t = (o) => {
                        var l = Zt(),
                          _ = a(l),
                          N = s(a(_)),
                          Pt = a(N);
                        (t(N), t(_));
                        var se = s(_, 2),
                          oe = s(a(se)),
                          St = a(oe);
                        t(oe);
                        var Ce = s(oe, 2),
                          Dt = a(Ce);
                        (t(Ce), Fe(), t(se));
                        var le = s(se, 2),
                          $e = s(a(le)),
                          Xt = a($e, !0);
                        (t($e), t(le));
                        var Ne = s(le, 2),
                          ne = s(a(Ne)),
                          Tt = a(ne);
                        t(ne);
                        var Ae = s(ne, 2),
                          Ct = a(Ae);
                        (t(Ae),
                          Fe(),
                          t(Ne),
                          t(l),
                          h(() => {
                            (b(Pt, `${e(u).baseXp ?? ''} XP`),
                              b(St, `+${e(u).bonusXpPercent ?? ''}%`),
                              b(Dt, `+${e(u).bonusXpBase ?? ''} XP`),
                              b(Xt, e(fe) > 0 ? `+${e(fe)}%` : '0%'),
                              b(Tt, `${e(u).bonusXpWithSanctuary ?? ''} XP`),
                              b(
                                Ct,
                                `${e(u).bonusGoldWithSanctuary ?? ''} Gold`,
                              ));
                          }),
                          f(o, l));
                      },
                      yt = (o) => {
                        var l = ea();
                        f(o, l);
                      };
                    k(gt, (o) => {
                      e(u).baseXp > 0 ? o(_t) : o(yt, !1);
                    });
                  }
                  t(Z);
                  var Xe = s(Z, 2),
                    re = a(Xe),
                    Te = a(re),
                    ht = s(Te, 2);
                  {
                    var jt = (o) => {
                      var l = ta();
                      l.__click = () => Ke(e(d).id);
                      var _ = a(l, !0);
                      (t(l),
                        h(() => {
                          ((l.disabled = e(I) === e(d).id),
                            b(
                              _,
                              e(I) === e(d).id ? 'Excluindo...' : 'Excluir',
                            ));
                        }),
                        f(o, l));
                    };
                    k(ht, (o) => {
                      e(d).id && o(jt);
                    });
                  }
                  t(re);
                  var wt = s(re, 2);
                  {
                    var kt = (o) => {
                      var l = aa();
                      (h(() => We(l, 'href', `/missoes?projectId=${e(d).id}`)),
                        f(o, l));
                    };
                    k(wt, (o) => {
                      e(d).id && o(kt);
                    });
                  }
                  (t(Xe),
                    t(E),
                    h(
                      (o, l) => {
                        (b(lt, e(d).name),
                          B(V, 1, o),
                          b(nt, l),
                          B(
                            J,
                            1,
                            `inline-flex items-center rounded-full border px-3 py-1 text-[0.65rem] ${e(u).difficulty.classes}`,
                          ),
                          b(je, `${e(u).difficulty.label ?? ''} `),
                          b(dt, `(${e(u).difficulty.range ?? ''})`),
                          b(
                            vt,
                            `${e(u).completedTasks ?? ''} / ${e(u).totalTasks ?? ''}`,
                          ),
                          Vt(bt, `width: ${e(u).completionPercent}%;`),
                          We(Te, 'href', `/projetos/${e(d).id}`));
                      },
                      [
                        () =>
                          `inline-flex items-center rounded-full border px-3 py-1 font-semibold ${Oe(e(d).status)}`,
                        () => Le(e(d).status),
                      ],
                    ),
                    f(P, E));
                },
              ),
                t(X),
                h(() =>
                  b(
                    D,
                    `${e(z).length ?? ''}
        ${e(z).length === 1 ? ' projeto listado' : ' projetos listados'}`,
                  ),
                ),
                f(m, g));
            };
          k(
            c,
            (m) => {
              e(z).length === 0 ? m(v) : m(j, !1);
            },
            !0,
          );
        }
        f(r, n);
      };
    k(tt, (r) => {
      e(pe) ? r(at) : r(rt, !1);
    });
  }
  t(U);
  var st = s(U, 2);
  {
    var ot = (r) => {
      var n = oa();
      ((n.__click = (p) => {
        p.target === p.currentTarget && W();
      }),
        (n.__keydown = (p) => {
          p.target === p.currentTarget &&
            (p.key === 'Escape' && W(),
            (p.key === 'Enter' || p.key === ' ') && (p.preventDefault(), W()));
        }));
      var c = a(n),
        v = s(a(c), 4),
        j = a(v),
        m = s(a(j), 2);
      (Ie(m), t(j));
      var g = s(j, 2),
        w = s(a(g), 2);
      (It(w), t(g));
      var D = s(g, 2),
        X = s(a(D), 2);
      (Ie(X), t(D));
      var P = s(D, 2),
        u = a(P);
      u.__click = W;
      var d = s(u, 2),
        E = a(d, !0);
      (t(d),
        t(P),
        t(v),
        t(c),
        t(n),
        h(() => {
          ((u.disabled = e(T)),
            (d.disabled = e(T)),
            b(E, e(T) ? 'Criando...' : 'Criar projeto'));
        }),
        Ee('submit', v, Re),
        de(
          m,
          () => e(A),
          (p) => i(A, p),
        ),
        de(
          w,
          () => e(M),
          (p) => i(M, p),
        ),
        de(
          X,
          () => e($),
          (p) => i($, p),
        ),
        f(r, n));
    };
    k(st, (r) => {
      e(C) && r(ot);
    });
  }
  (t(Q),
    h(() => {
      (B(
        K,
        1,
        `rounded-full px-3 py-1 font-semibold transition-colors ${e(S) === 'ativos' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'}`,
      ),
        B(
          L,
          1,
          `rounded-full px-3 py-1 font-semibold transition-colors ${e(S) === 'concluidos' ? 'bg-[#ffb74d] text-slate-950' : 'text-slate-300 hover:bg-slate-800'}`,
        ),
        B(
          ye,
          1,
          `rounded-full px-3 py-1 font-semibold transition-colors ${e(S) === 'todos' ? 'bg-slate-700 text-slate-100' : 'text-slate-300 hover:bg-slate-800'}`,
        ));
    }),
    f(ze, Q),
    Mt());
}
$t(['click', 'keydown']);
export { _a as component };
