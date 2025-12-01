import '../chunks/DsnmJJEf.js';
import {
  F as kt,
  S as St,
  J as Ft,
  ag as Pt,
  v as Et,
  p as Mt,
  c as Me,
  s as qe,
  o as qt,
  f as _,
  t as E,
  d as b,
  e as Lt,
  h as o,
  j as n,
  g as a,
  l as v,
  b as F,
  r,
  k as de,
  q as He,
  m as Ve,
  n as Ct,
  x as Nt,
} from '../chunks/C4tos-D-.js';
import { i as C } from '../chunks/D7NEdK74.js';
import { e as At } from '../chunks/BYKdWbGi.js';
import { a as It, s as T, r as Je, b as Ke } from '../chunks/B28y5Mvi.js';
import { s as Le } from '../chunks/B0IkYSzE.js';
import { l as Re, d as M } from '../chunks/CUrLQr9X.js';
import { P as Tt } from '../chunks/CpUvk0iO.js';
import { S as $t } from '../chunks/BijEeDuW.js';
function jt(le, ce, V) {
  kt && St();
  var ve = new Pt(le);
  Ft(() => {
    var J = ce();
    ve.ensure(J, V);
  });
}
var Dt = _(
    '<span class="absolute top-2 left-2 text-[0.7rem] px-2 py-1 rounded-full bg-emerald-500/90 text-slate-950 font-bold uppercase tracking-widest">Equipado</span>',
  ),
  Bt = _(
    '<span class="absolute top-2 left-2 text-[0.7rem] px-2 py-1 rounded-full bg-slate-800/90 text-emerald-300 font-semibold uppercase tracking-widest">Desbloqueado</span>',
  ),
  Ut = _(
    '<span class="absolute top-2 left-2 text-[0.7rem] px-2 py-1 rounded-full bg-slate-900/95 text-slate-400 font-semibold uppercase tracking-widest"> </span>',
  ),
  Ot = _(
    '<div class="flex flex-col gap-1"><label class="text-[0.7rem] text-slate-500 uppercase tracking-widest">Nome do companheiro</label> <input type="text" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60"/></div>',
  ),
  Xt = _('<h3 class="font-semibold text-slate-100"> </h3>'),
  Gt = _(
    '<div class="mt-2 space-y-1"><p class="text-[0.7rem] text-emerald-300"> </p> <div class="h-2 w-full rounded-full bg-slate-800 overflow-hidden"><div class="h-full rounded-full bg-emerald-500"></div></div> <p class="text-[0.65rem] text-slate-500"> </p></div>',
  ),
  Qt = _(
    '<span class="text-emerald-400 font-semibold flex items-center gap-1"><span>★</span> Ao seu lado</span>',
  ),
  zt = _('<span class="text-slate-500 italic"> </span>'),
  Ht = _(
    '<button type="button" class="mt-3 inline-flex items-center justify-center rounded-lg border border-emerald-500/70 bg-emerald-500/10 px-3 py-1.5 text-[0.75rem] font-semibold text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400 transition">Alimentar / Evoluir</button>',
  ),
  Vt = _(
    '<article><div class="relative"><div class="w-full aspect-[4/5] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center"><img class="w-full h-full object-contain"/></div> <!></div> <div class="flex-1 flex flex-col gap-2 mt-1"><!> <p class="text-xs text-slate-400"> </p> <!> <p class="text-[0.65rem] text-amber-300 mt-1"> </p></div> <div class="mt-3 flex items-center justify-between text-[0.7rem]"><!> <span class="text-slate-600"> </span></div> <!></article>',
  ),
  Jt =
    _(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="feed-modal-title" tabindex="-1"><div class="relative w-full max-w-lg mx-4 rounded-3xl border border-slate-700 bg-slate-950/95 shadow-2xl"><header class="flex items-start justify-between gap-4 px-6 pt-5 pb-3 border-b border-slate-800"><div><p class="text-xs uppercase tracking-[0.2em] text-slate-500">Bestiário • Alimentar & Evoluir</p> <h2 id="feed-modal-title" class="mt-1 text-lg font-semibold text-slate-50"> </h2> <p class="mt-1 text-xs text-slate-400"> </p> <p class="mt-1 text-[0.65rem] text-amber-300"> </p></div> <button type="button" class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 text-slate-400 hover:text-slate-100 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60" aria-label="Fechar janela de alimentação">✕</button></header> <div class="px-6 pb-6 pt-4 space-y-4"><div class="flex gap-4 items-center"><div class="w-28 h-28 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center"><img class="w-full h-full object-contain"/></div> <div class="flex-1 space-y-2 text-xs text-slate-300"><div><span class="text-slate-400">Comida disponível:</span> <span class="ml-1 font-semibold text-emerald-400"> </span></div> <div><span class="text-slate-400">Comida investida neste pet:</span> <span class="ml-1 font-semibold"> </span></div> <div><span class="text-slate-400">Evolução atual:</span> <span class="ml-1 font-semibold"> </span></div></div></div> <div class="space-y-2"><label for="food-amount-input" class="text-[0.7rem] text-slate-400 uppercase tracking-widest">Quanto de comida investir agora?</label> <div class="flex items-center gap-2"><button type="button" class="px-2 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:bg-slate-800">-10</button> <button type="button" class="px-2 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:bg-slate-800">-1</button> <input id="food-amount-input" type="number" min="0" class="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60"/> <button type="button" class="px-2 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:bg-slate-800">+1</button> <button type="button" class="px-2 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:bg-slate-800">+10</button> <button type="button" class="px-3 py-1 rounded-md border border-emerald-500/60 text-xs text-emerald-300 hover:bg-emerald-500/10">MAX</button></div> <p class="text-[0.65rem] text-slate-500">O valor será descontado da sua comida total e somado à comida
              investida neste companheiro.</p></div> <div class="space-y-3"><div class="space-y-1"><p class="text-[0.7rem] text-slate-400 uppercase tracking-widest">Progresso atual</p> <div class="h-2 w-full rounded-full bg-slate-800 overflow-hidden"><div class="h-full rounded-full bg-emerald-500"></div></div></div> <div class="space-y-1"><p class="text-[0.7rem] text-slate-400 uppercase tracking-widest">Após esta alimentação (prévia)</p> <div class="h-2 w-full rounded-full bg-slate-800 overflow-hidden"><div class="h-full rounded-full bg-emerald-400"></div></div> <p class="text-[0.65rem] text-slate-400 mt-1">Evolução prevista: <span class="ml-1 font-semibold text-emerald-300"> </span></p> <p class="text-[0.65rem] text-amber-300"> </p></div></div> <div class="mt-4 flex justify-end gap-2"><button type="button" class="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800">Cancelar</button> <button type="button" class="px-4 py-1.5 rounded-lg bg-emerald-500 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed">Alimentar agora</button></div></div></div></div>`),
  Kt =
    _(`<div class="flex flex-col gap-6 pb-8"><!> <section class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4"><div class="flex-1"><p class="text-sm text-slate-400">Os companheiros são desbloqueados conforme o seu nível: <span class="font-semibold text-[#ffb74d]">Lobo (1), Lich (5), Dragão (15), Aberração (20).</span></p> <p class="text-xs text-slate-500 mt-1">Você pode renomear qualquer criatura já desbloqueada. A troca de
        companheiro ativo é feita na Taverna. Aqui no Bestiário você alimenta e
        acompanha a evolução de cada um.</p></div> <div class="flex items-center gap-4 rounded-xl bg-slate-950/60 border border-slate-800 px-4 py-2"><div class="text-xs text-slate-400 leading-tight"><div>Nível atual</div> <div class="text-sm font-semibold text-[#ffb74d]"> </div></div> <div class="h-8 w-px bg-slate-800"></div> <div class="text-xs text-slate-400 leading-tight"><div>Comida disponível</div> <div class="text-sm font-semibold text-emerald-400"> </div></div> <div class="h-8 w-px bg-slate-800"></div> <div class="text-xs text-slate-400 leading-tight"><div>Companheiro ativo</div> <div class="text-sm font-semibold text-emerald-400"> </div></div></div></section> <section><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"></div></section> <!></div>`);
function sa(le, ce) {
  Mt(ce, !0);
  const V = [
      {
        id: 1,
        name: 'Lobo Etéreo',
        type: 'Caçador das Sombras',
        imagePath: '/art/pets/lobo-1.webp',
        requiredLevel: 1,
      },
      {
        id: 2,
        name: 'Lorde Lich',
        type: 'Mago Imortal',
        imagePath: '/art/pets/lich-1.webp',
        requiredLevel: 5,
      },
      {
        id: 3,
        name: 'Dragão Ancião',
        type: 'Guardião de Chamas',
        imagePath: '/art/pets/dragao-1.webp',
        requiredLevel: 15,
      },
      {
        id: 4,
        name: 'Aberração Abissal',
        type: 'Eco do Vazio',
        imagePath: '/art/pets/aberracao-1.webp',
        requiredLevel: 20,
      },
    ],
    ve = V.map((e) => ({
      id: e.id,
      name: e.name,
      type: e.type,
      imagePath: e.imagePath,
      unlocked: !1,
    })),
    J = {
      id: 1,
      name: 'Carregando...',
      title: '...',
      level: 1,
      xpCurrent: 0,
      xpNext: 100,
      avatarUrl: '',
      totalXpEarned: 0,
      currentStreak: 0,
      lastCompletionDate: '',
      activeCompanionId: 1,
      gold: 0,
    };
  let P = Me(J),
    Ce = qe(Me([])),
    ue = Me({});
  const We = Re(() => M.profile.get(1)),
    Ye = Re(() => M.companions.toArray());
  async function Ze() {
    (await M.companions.count()) === 0 && (await M.companions.bulkAdd(ve));
  }
  const $ = [0, 0, 100, 300];
  function K(e) {
    return e >= $[3] ? 3 : e >= $[2] ? 2 : 1;
  }
  function R(e) {
    switch (e) {
      case 1:
        return 'Forma Juvenil';
      case 2:
        return 'Forma Crescida';
      case 3:
        return 'Forma Lendária';
      default:
        return 'Forma Desconhecida';
    }
  }
  function me(e, t) {
    const s = Math.min(Math.max(t, 1), 3);
    if (s >= 3) return 100;
    const d = $[s],
      m = $[s + 1] - d;
    if (m <= 0) return 0;
    const k = Math.max(0, Math.min(e - d, m));
    return Math.round((k / m) * 100);
  }
  function et(e) {
    const t = K(e);
    if (t >= 3) return 0;
    const d = $[t + 1] - e;
    return Math.max(0, d);
  }
  function tt(e, t) {
    const s = Math.min(Math.max(t ?? 1, 1), 3);
    return e.replace(/-\d+(\.\w+)$/, `-${s}$1`);
  }
  function pe(e, t) {
    const s = Math.min(Math.max(t || 1, 1), 3);
    switch (e) {
      case 1:
        return s === 1
          ? '+5% de XP ganho em missões.'
          : s === 2
            ? '+10% de XP ganho em missões.'
            : '+15% de XP ganho em missões.';
      case 2:
        return s === 1
          ? '+5% de comida obtida (alimentação).'
          : s === 2
            ? '+10% de comida obtida (alimentação).'
            : '+15% de comida obtida (alimentação).';
      case 3:
        return s === 1
          ? '+5% de Gold ganho em missões.'
          : s === 2
            ? '+10% de Gold ganho em missões.'
            : '+15% de Gold ganho em missões.';
      case 4:
        return s === 1
          ? '+5% de XP, Gold e Comida.'
          : s === 2
            ? '+10% de XP, Gold e Comida.'
            : '+15% de XP, Gold e Comida e redução na quantidade de tarefas exigidas em sistemas avançados.';
      default:
        return 'Bônus não definido.';
    }
  }
  function at(e, t) {
    return e ? (ue[e] ?? t) : t;
  }
  function rt(e, t) {
    if (!e) return;
    const s = t.target;
    ue[e] = s.value;
  }
  async function ot(e) {
    if (!e) return;
    const t = (ue[e] ?? '').trim();
    if (t)
      try {
        await M.companions.update(e, { name: t });
      } catch (s) {
        console.error('Erro ao atualizar nome do pet:', s);
      }
  }
  let fe = de(() => {
      const e = P.level ?? 1,
        t = new $t();
      for (const s of a(Ce)) s.id != null && t.set(s.id, s);
      return V.map((s) => {
        const d = t.get(s.id),
          x = d?.name,
          m = x && x.trim().length > 0 ? x : s.name,
          k = e >= s.requiredLevel,
          q = s.id === P.activeCompanionId,
          N = d?.foodInvested ?? 0,
          S = d?.evolutionStage ?? K(N);
        return {
          ...s,
          ...(d || {}),
          id: s.id,
          name: m,
          imagePath: tt(s.imagePath, S),
          requiredLevel: s.requiredLevel,
          isUnlocked: k,
          isActive: q,
          evolutionStage: S,
          foodInvested: N,
        };
      }).sort((s, d) => s.requiredLevel - d.requiredLevel);
    }),
    j = qe(null),
    h = qe(0),
    c = de(() =>
      a(j) == null ? null : (a(fe).find((e) => e.id === a(j)) ?? null),
    ),
    Ne = de(() => {
      if (!a(c)) return 0;
      const e = a(c).foodInvested ?? 0,
        t = P.food ?? 0,
        s = Math.max(0, Math.min(a(h), t));
      return e + s;
    }),
    W = de(() => K(a(Ne)));
  function st(e) {
    e && (F(j, e, !0), F(h, 0));
  }
  function D() {
    (F(j, null), F(h, 0));
  }
  function Y(e) {
    const t = P.food ?? 0;
    return Number.isFinite(e) ? Math.max(0, Math.min(Math.floor(e), t)) : 0;
  }
  function Z(e) {
    const t = Y((a(h) ?? 0) + e);
    F(h, t, !0);
  }
  async function nt() {
    if (!a(c) || !a(c).id) return;
    const e = P.food ?? 0,
      t = Y(a(h));
    if (t <= 0 || e <= 0) return;
    const s = a(c).id;
    try {
      await M.profile.update(1, { food: e - t });
      const m = ((await M.companions.get(s))?.foodInvested ?? 0) + t,
        k = K(m);
      (await M.companions.update(s, { foodInvested: m, evolutionStage: k }),
        F(h, 0));
    } catch (d) {
      console.error('Erro ao alimentar/evoluir companheiro:', d);
    }
  }
  function it(e) {
    e.currentTarget === e.target && D();
  }
  function dt(e) {
    e.currentTarget === e.target &&
      (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') &&
      (e.preventDefault(), D());
  }
  qt(() => {
    Ze().catch((d) => console.error('Erro ao semear pets:', d));
    const e = We.subscribe((d) => {
        Object.assign(P, d || J);
      }),
      t = Ye.subscribe((d) => {
        F(Ce, d || [], !0);
      }),
      s = (d) => {
        d.key === 'Escape' && a(j) != null && D();
      };
    return (
      window.addEventListener('keydown', s),
      () => {
        (e.unsubscribe(),
          t.unsubscribe(),
          window.removeEventListener('keydown', s));
      }
    );
  });
  function ee() {
    return P.food ?? 0;
  }
  var be = Kt(),
    Ae = o(be);
  Tt(Ae, {
    title: 'Bestiário de Companheiros',
    subtitle:
      'Alimente e evolua seus fiéis companheiros enquanto você avança em sua jornada!',
    iconSrc: '/art/icones/book-icon.png',
    align: 'center',
  });
  var xe = n(Ae, 2),
    Ie = n(o(xe), 2),
    ge = o(Ie),
    Te = n(o(ge), 2),
    lt = o(Te);
  (r(Te), r(ge));
  var _e = n(ge, 4),
    $e = n(o(_e), 2),
    ct = o($e, !0);
  (r($e), r(_e));
  var je = n(_e, 4),
    De = n(o(je), 2),
    vt = o(De, !0);
  (r(De), r(je), r(Ie), r(xe));
  var he = n(xe, 2),
    Be = o(he);
  (At(
    Be,
    21,
    () => a(fe),
    (e) => e.id ?? e.name,
    (e, t) => {
      var s = Vt(),
        d = o(s),
        x = o(d),
        m = o(x);
      r(x);
      var k = n(x, 2);
      {
        var q = (i) => {
            var l = Dt();
            b(i, l);
          },
          N = (i) => {
            var l = He(),
              p = Ve(l);
            {
              var w = (f) => {
                  var u = Bt();
                  b(f, u);
                },
                g = (f) => {
                  var u = Ut(),
                    y = o(u);
                  (r(u),
                    E(() => v(y, `Nv. ${a(t).requiredLevel ?? ''}`)),
                    b(f, u));
                };
              C(
                p,
                (f) => {
                  a(t).isUnlocked ? f(w) : f(g, !1);
                },
                !0,
              );
            }
            b(i, l);
          };
        C(k, (i) => {
          a(t).isActive ? i(q) : i(N, !1);
        });
      }
      r(d);
      var S = n(d, 2),
        te = o(S);
      {
        var ye = (i) => {
            var l = He(),
              p = Ve(l);
            (jt(
              p,
              () => a(t).id,
              (w) => {
                var g = Ot(),
                  f = o(g),
                  u = n(f, 2);
                (Je(u),
                  (u.__input = (y) => rt(a(t).id, y)),
                  r(g),
                  E(
                    (y) => {
                      (T(f, 'for', `pet-name-${a(t).id}`),
                        T(u, 'id', `pet-name-${a(t).id}`),
                        Ke(u, y));
                    },
                    [() => at(a(t).id, a(t).name)],
                  ),
                  Nt('blur', u, () => ot(a(t).id)),
                  b(w, g));
              },
            ),
              b(i, l));
          },
          ae = (i) => {
            var l = Xt(),
              p = o(l, !0);
            (r(l), E(() => v(p, a(t).name)), b(i, l));
          };
        C(te, (i) => {
          a(t).isUnlocked && a(t).id ? i(ye) : i(ae, !1);
        });
      }
      var L = n(te, 2),
        B = o(L, !0);
      r(L);
      var U = n(L, 2);
      {
        var re = (i) => {
          var l = Gt(),
            p = o(l),
            w = o(p);
          r(p);
          var g = n(p, 2),
            f = o(g);
          r(g);
          var u = n(g, 2),
            y = o(u);
          (r(u),
            r(l),
            E(
              (Q, ie) => {
                (v(
                  w,
                  `Evolução: ${Q ?? ''}
                  (Nível ${a(t).evolutionStage ?? 1 ?? ''})`,
                ),
                  Le(f, ie),
                  v(y, `Comida investida: ${a(t).foodInvested ?? 0 ?? ''}`));
              },
              [
                () => R(a(t).evolutionStage ?? 1),
                () =>
                  `width: ${me(a(t).foodInvested ?? 0, a(t).evolutionStage ?? 1)}%`,
              ],
            ),
            b(i, l));
        };
        C(U, (i) => {
          a(t).isUnlocked && i(re);
        });
      }
      var A = n(U, 2),
        oe = o(A);
      (r(A), r(S));
      var O = n(S, 2),
        I = o(O);
      {
        var se = (i) => {
            var l = Qt();
            b(i, l);
          },
          we = (i) => {
            var l = zt(),
              p = o(l);
            (r(l),
              E(() => v(p, `Desbloqueia no nível ${a(t).requiredLevel ?? ''}`)),
              b(i, l));
          };
        C(I, (i) => {
          a(t).isUnlocked ? i(se) : i(we, !1);
        });
      }
      var X = n(I, 2),
        ne = o(X);
      (r(X), r(O));
      var ke = n(O, 2);
      {
        var G = (i) => {
          var l = Ht();
          ((l.__click = () => st(a(t).id)), b(i, l));
        };
        C(ke, (i) => {
          a(t).isUnlocked && a(t).id && i(G);
        });
      }
      (r(s),
        E(
          (i) => {
            (It(
              s,
              1,
              `relative rounded-2xl border bg-slate-900/70 p-4 flex flex-col gap-3 shadow-lg
                 ${a(t).isUnlocked ? 'border-slate-700' : 'border-slate-800 opacity-60 grayscale'}`,
            ),
              T(m, 'src', a(t).imagePath),
              T(m, 'alt', a(t).name),
              v(B, a(t).type),
              v(
                oe,
                `Bônus:
              ${i ?? ''}`,
              ),
              v(
                ne,
                `ID:
              ${a(t).id ?? '—' ?? ''}`,
              ));
          },
          [() => pe(a(t).id, a(t).evolutionStage ?? 1)],
        ),
        b(e, s));
    },
  ),
    r(Be),
    r(he));
  var ut = n(he, 2);
  {
    var mt = (e) => {
      var t = Jt();
      ((t.__click = it), (t.__keydown = dt));
      var s = o(t),
        d = o(s),
        x = o(d),
        m = n(o(x), 2),
        k = o(m, !0);
      r(m);
      var q = n(m, 2),
        N = o(q);
      r(q);
      var S = n(q, 2),
        te = o(S);
      (r(S), r(x));
      var ye = n(x, 2);
      ((ye.__click = D), r(d));
      var ae = n(d, 2),
        L = o(ae),
        B = o(L),
        U = o(B);
      r(B);
      var re = n(B, 2),
        A = o(re),
        oe = n(o(A), 2),
        O = o(oe, !0);
      (r(oe), r(A));
      var I = n(A, 2),
        se = n(o(I), 2),
        we = o(se, !0);
      (r(se), r(I));
      var X = n(I, 2),
        ne = n(o(X), 2),
        ke = o(ne);
      (r(ne), r(X), r(re), r(L));
      var G = n(L, 2),
        i = n(o(G), 2),
        l = o(i);
      l.__click = () => Z(-10);
      var p = n(l, 2);
      p.__click = () => Z(-1);
      var w = n(p, 2);
      (Je(w),
        (w.__input = (z) => {
          const H = Number(z.target.value);
          F(h, Y(H), !0);
        }));
      var g = n(w, 2);
      g.__click = () => Z(1);
      var f = n(g, 2);
      f.__click = () => Z(10);
      var u = n(f, 2);
      ((u.__click = () => {
        const z = a(c).foodInvested ?? 0,
          H = et(z),
          Pe = ee(),
          Ee = Math.min(H, Pe);
        F(h, Y(Ee), !0);
      }),
        r(i),
        Ct(2),
        r(G));
      var y = n(G, 2),
        Q = o(y),
        ie = n(o(Q), 2),
        pt = o(ie);
      (r(ie), r(Q));
      var Ue = n(Q, 2),
        Se = n(o(Ue), 2),
        ft = o(Se);
      r(Se);
      var Fe = n(Se, 2),
        Oe = n(o(Fe)),
        bt = o(Oe);
      (r(Oe), r(Fe));
      var Xe = n(Fe, 2),
        xt = o(Xe);
      (r(Xe), r(Ue), r(y));
      var Ge = n(y, 2),
        Qe = o(Ge);
      Qe.__click = D;
      var ze = n(Qe, 2);
      ((ze.__click = nt),
        r(Ge),
        r(ae),
        r(s),
        r(t),
        E(
          (z, H, Pe, Ee, gt, _t, ht, yt, wt) => {
            (v(k, a(c).name),
              v(
                N,
                `${z ?? ''} — Nível de evolução
              ${a(c).evolutionStage ?? 1 ?? ''}`,
              ),
              v(
                te,
                `Bônus atual:
              ${H ?? ''}`,
              ),
              T(U, 'src', a(c).imagePath),
              T(U, 'alt', a(c).name),
              v(O, Pe),
              v(we, a(c).foodInvested ?? 0),
              v(
                ke,
                `${Ee ?? ''}
                  (Nível ${a(c).evolutionStage ?? 1 ?? ''})`,
              ),
              Ke(w, a(h)),
              Le(pt, gt),
              Le(ft, _t),
              v(bt, `${ht ?? ''} (Nível ${a(W) ?? ''})`),
              v(
                xt,
                `Bônus previsto:
                ${yt ?? ''}`,
              ),
              (ze.disabled = wt));
          },
          [
            () => R(a(c).evolutionStage ?? 1),
            () => pe(a(c).id, a(c).evolutionStage ?? 1),
            ee,
            () => R(a(c).evolutionStage ?? 1),
            () =>
              `width: ${me(a(c).foodInvested ?? 0, a(c).evolutionStage ?? 1)}%`,
            () => `width: ${me(a(Ne), a(W))}%`,
            () => R(a(W)),
            () => pe(a(c).id, a(W)),
            () => a(h) <= 0 || ee() <= 0,
          ],
        ),
        b(e, t));
    };
    C(ut, (e) => {
      a(c) && e(mt);
    });
  }
  (r(be),
    E(
      (e, t) => {
        (v(lt, `Nv. ${P.level ?? ''}`), v(ct, e), v(vt, t));
      },
      [ee, () => a(fe).find((e) => e.isActive)?.name || 'Nenhum selecionado'],
    ),
    b(le, be),
    Lt());
}
Et(['input', 'click', 'keydown']);
export { sa as component };
