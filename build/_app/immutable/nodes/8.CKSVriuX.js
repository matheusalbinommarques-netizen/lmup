import '../chunks/DsnmJJEf.js';
import {
  B as Ua,
  G as Et,
  y as Ja,
  H as Ka,
  a4 as Za,
  aH as er,
  aI as tr,
  aJ as ar,
  v as vt,
  p as rt,
  s as W,
  c as Ae,
  o as st,
  f as $,
  h as a,
  t as U,
  x as va,
  g as e,
  d as w,
  e as ot,
  j as s,
  b as c,
  r as t,
  l as f,
  m as Je,
  A as rr,
  k as j,
  n as Fe,
  aK as Ot,
  q as da,
  w as sr,
} from '../chunks/C4tos-D-.js';
import { p as pa, i as me } from '../chunks/D7NEdK74.js';
import { e as Pe, i as Rt } from '../chunks/BYKdWbGi.js';
import {
  a as Ce,
  s as xe,
  r as Nt,
  b as or,
  c as nr,
} from '../chunks/B28y5Mvi.js';
import { d as L, l as Le } from '../chunks/CUrLQr9X.js';
import { c as lr, g as ir, x as Ft } from '../chunks/BNQQrpbk.js';
import { c as dr } from '../chunks/CPixY0QB.js';
import { a as Yt } from '../chunks/Cxxjmckw.js';
import { b as Xt } from '../chunks/DbSmc52O.js';
import { s as ma } from '../chunks/B0IkYSzE.js';
import { P as cr } from '../chunks/CpUvk0iO.js';
function fa(u, T, v = !1) {
  if (u.multiple) {
    if (T == null) return;
    if (!Za(T)) return er();
    for (var k of u.options) k.selected = T.includes(lt(k));
    return;
  }
  for (k of u.options) {
    var g = lt(k);
    if (tr(g, T)) {
      k.selected = !0;
      return;
    }
  }
  (!v || T !== void 0) && (u.selectedIndex = -1);
}
function ur(u) {
  var T = new MutationObserver(() => {
    fa(u, u.__value);
  });
  (T.observe(u, {
    childList: !0,
    subtree: !0,
    attributes: !0,
    attributeFilter: ['value'],
  }),
    ar(() => {
      T.disconnect();
    }));
}
function ca(u, T, v = T) {
  var k = new WeakSet(),
    g = !0;
  (Ua(u, 'change', (N) => {
    var B = N ? '[selected]' : ':checked',
      C;
    if (u.multiple) C = [].map.call(u.querySelectorAll(B), lt);
    else {
      var z = u.querySelector(B) ?? u.querySelector('option:not([disabled])');
      C = z && lt(z);
    }
    (v(C), Et !== null && k.add(Et));
  }),
    Ja(() => {
      var N = T();
      if (u === document.activeElement) {
        var B = Ka ?? Et;
        if (k.has(B)) return;
      }
      if ((fa(u, N, g), g && N === void 0)) {
        var C = u.querySelector(':checked');
        C !== null && ((N = lt(C)), v(N));
      }
      ((u.__value = N), (g = !1));
    }),
    ur(u));
}
function lt(u) {
  return '__value' in u ? u.__value : u.value;
}
function vr(u) {
  if (u instanceof Date)
    return new Date(u.getFullYear(), u.getMonth(), u.getDate());
  const T = u.toString().trim();
  if (!T) return new Date(NaN);
  const [v] = T.split('T'),
    k = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (k) {
    const N = Number(k[1]),
      B = Number(k[2]),
      C = Number(k[3]);
    return new Date(N, B - 1, C);
  }
  const g = new Date(T);
  return new Date(g.getFullYear(), g.getMonth(), g.getDate());
}
function pr(u, T) {
  const v = T.getTime() - u.getTime();
  return Math.floor(v / (1e3 * 60 * 60 * 24));
}
function mr(u, T, v, k) {
  const g = new Date(v.getFullYear(), v.getMonth(), v.getDate()),
    N = g.toISOString().slice(0, 10);
  if (!T) return { newStreak: 1, newLastCompletionDate: N };
  const B = vr(T);
  if (Number.isNaN(B.getTime()))
    return { newStreak: 1, newLastCompletionDate: N };
  const C = pr(B, g);
  if (C === 0) return { newStreak: u || 1, newLastCompletionDate: N };
  const z = 1 + (k || 0);
  return C > z
    ? { newStreak: 1, newLastCompletionDate: N }
    : C === 1
      ? { newStreak: (u || 0) + 1, newLastCompletionDate: N }
      : { newStreak: u || 1, newLastCompletionDate: N };
}
async function ua() {
  const u = await L.profile.get(1);
  if (!u) return;
  const T = await Yt(),
    v = mr(
      u.currentStreak ?? 0,
      u.lastCompletionDate ?? null,
      new Date(),
      T.streakProtectionDays ?? 0,
    );
  await L.profile.update(u.id ?? 1, {
    currentStreak: v.newStreak,
    lastCompletionDate: v.newLastCompletionDate,
    updatedAt: new Date().toISOString(),
  });
}
var fr =
    $(`<div class="relative shrink-0 group" role="tab"><button> </button> <button title="Excluir Área" aria-label="Excluir Área" class="absolute -top-2 -right-2 z-10 w-5 h-5 rounded-full
                           bg-slate-700 text-slate-300 text-xs font-bold
                           flex items-center justify-center border-2 border-slate-900
                           opacity-0 group-hover:opacity-100 transition-opacity hover:!opacity-100 hover:bg-red-500 hover:text-white">X</button></div>`),
  br =
    $(`<section class="flex flex-col gap-3"><h3 class="text-[1.5rem] uppercase tracking-[0.22em] text-amber-300/80">Áreas de Foco</h3> <div class="flex flex-row gap-2 overflow-x-auto no-scrollbar pb-2 -mb-2 svelte-3ics1j" role="tablist" aria-label="Filtro de Áreas"><button role="tab">Todas</button> <!></div> <form class="flex gap-2"><input type="text" placeholder="Nova Área (ex: Programação)" class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200
                   focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"/> <button type="submit" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm rounded-lg transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed">Criar Área</button></form></section>`);
function xr(u, T) {
  rt(T, !0);
  let v = pa(T, 'selectedId', 15, 'all'),
    k = W(Ae([])),
    g = W('');
  const N = Le(() => L.areas.toArray());
  st(() => {
    const q = N.subscribe((Q) => {
      c(
        k,
        (Q ?? [])
          .slice()
          .sort((ae, ce) =>
            (ae.nome ?? '').localeCompare(ce.nome ?? '', 'pt-BR', {
              sensitivity: 'base',
            }),
          ),
        !0,
      );
    });
    return () => q.unsubscribe();
  });
  async function B(q) {
    q.preventDefault();
    const Q = e(g).trim();
    if (Q)
      try {
        (await L.areas.add({
          nome: Q,
          color: '#888888',
          createdAt: new Date(),
        }),
          c(g, ''));
      } catch (ae) {
        (console.error('Erro ao adicionar área:', ae),
          alert('Falha ao adicionar área. Já existe uma com esse nome?'));
      }
  }
  async function C(q, Q) {
    if (
      q !== void 0 &&
      confirm(`Tem certeza que deseja excluir a área "${Q}"?

Todas as missões desta área serão movidas para "Geral".`)
    )
      try {
        (await L.transaction('rw', L.areas, L.tasks, async () => {
          (await L.tasks.where('areaId').equals(q).modify({ areaId: 0 }),
            await L.areas.delete(q));
        }),
          v() === q && v('all'));
      } catch (ae) {
        (console.error('Erro ao excluir área:', ae),
          alert('Falha ao excluir a área.'));
      }
  }
  var z = br(),
    Y = s(a(z), 2),
    de = a(Y);
  de.__click = () => v('all');
  var ee = s(de, 2);
  (Pe(
    ee,
    17,
    () => e(k),
    (q) => q.id,
    (q, Q) => {
      var ae = fr(),
        ce = a(ae);
      ce.__click = () => {
        e(Q).id !== void 0 && v(e(Q).id);
      };
      var we = a(ce, !0);
      t(ce);
      var Te = s(ce, 2);
      ((Te.__click = () => C(e(Q).id, e(Q).nome)),
        t(ae),
        U(() => {
          (xe(ae, 'aria-selected', v() === e(Q).id),
            Ce(
              ce,
              1,
              `w-full h-full pl-4 pr-3 py-2 rounded-lg text-sm font-medium transition-colors border
                           ${v() === e(Q).id ? 'bg-primary/20 text-primary border-primary/30' : 'text-slate-400 bg-slate-900/50 border-slate-800 hover:bg-slate-800'}`,
            ),
            f(we, e(Q).nome));
        }),
        w(q, ae));
    },
  ),
    t(Y));
  var te = s(Y, 2),
    V = a(te);
  Nt(V);
  var ye = s(V, 2);
  (t(te),
    t(z),
    U(
      (q) => {
        (Ce(
          de,
          1,
          `shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors border
                   ${v() === 'all' ? 'bg-primary/20 text-primary border-primary/30' : 'text-slate-400 bg-slate-900/50 border-slate-800 hover:bg-slate-800'}`,
        ),
          xe(de, 'aria-selected', v() === 'all'),
          (ye.disabled = q));
      },
      [() => !e(g).trim()],
    ),
    va('submit', te, B),
    Xt(
      V,
      () => e(g),
      (q) => c(g, q),
    ),
    w(u, z),
    ot());
}
vt(['click']);
var gr = $('<option> </option>'),
  _r = $('<option> </option>'),
  hr =
    $(`<div class="flex gap-2"><input type="text" class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200
                focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"/> <button type="button" class="rounded-lg border border-slate-700 px-2 text-xs text-slate-300 hover:bg-slate-800">✕</button></div>`),
  yr = $(
    `<div class="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" aria-hidden="true"></div> <div class="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2
    bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6" role="dialog" aria-modal="true" aria-labelledby="modal-title"><h2 id="modal-title" class="text-xl font-bold text-[#ffb74d] font-serif mb-6"> </h2> <form class="flex flex-col gap-4"><div><label for="title" class="block text-sm font-medium text-slate-300 mb-1">Título da Missão</label> <input id="title" type="text" placeholder="Ex: Estudar capítulo de algoritmos..." class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200
          focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30" required/></div> <div><label for="description" class="block text-sm font-medium text-slate-300 mb-1">Descrição (opcional)</label> <textarea id="description" rows="3" placeholder="Detalhe o objetivo, links importantes ou observações desta missão..." class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200
          focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30 resize-none"></textarea></div> <div class="flex flex-col gap-3"><div class="flex gap-4"><div class="flex-1"><label for="area" class="block text-sm font-medium text-slate-300 mb-1">Área de Foco</label> <select id="area" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200
              focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"><option>Geral</option><!></select></div> <div class="flex-1"><label for="project" class="block text-sm font-medium text-slate-300 mb-1">Projeto (opcional)</label> <select id="project" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200
              focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"><option>Sem projeto</option><!></select></div></div> <div class="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2"><div class="flex flex-col"><span class="text-[0.7rem] text-slate-400 uppercase tracking-[0.18em]">Dificuldade / Recompensa</span> <span class="text-sm font-semibold text-slate-100"> </span></div> <span class="rounded-full bg-slate-800/80 px-3 py-1 text-[0.7rem] text-slate-200"> </span></div></div> <div class="space-y-2"><div class="flex items-center justify-between"><p class="block text-sm font-medium text-slate-300">Subtarefas (passos da missão)</p> <button type="button" class="text-xs font-medium text-primary hover:underline">+ Adicionar passo</button></div> <div class="space-y-2 max-h-52 overflow-y-auto pr-1"></div></div> <div class="mt-4 flex justify-end gap-2"><button type="button" class="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">Cancelar</button> <button type="submit" class="rounded-lg bg-[#ffb74d] px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-[#ffca6b]"> </button></div></form></div>`,
    1,
  );
function wr(u, T) {
  rt(T, !0);
  let v = pa(T, 'taskToEdit', 3, null),
    k = W(''),
    g = W(''),
    N = W('0'),
    B = W('none'),
    C = W(Ae([])),
    z = W(Ae([])),
    Y = W(Ae([''])),
    de = W(0),
    ee = W(0);
  const te = v() !== null,
    V = { common: 'Comum', rare: 'Rara', epic: 'Épica', legendary: 'Lendária' },
    ye = { common: 50, rare: 100, epic: 250, legendary: 500 };
  function q(h, se) {
    const p = Math.max(0, h + Math.max(0, se));
    return p >= 10 ? 'legendary' : p >= 5 ? 'epic' : p >= 3 ? 'rare' : 'common';
  }
  const Q = j(
      () =>
        e(Y)
          .map((h) => h.trim())
          .filter((h) => h.length > 0).length || 1,
    ),
    ae = j(() => (e(de) || 0) + (e(ee) || 0)),
    ce = j(() => q(e(Q), e(ae))),
    we = j(() => ye[e(ce)]),
    Te = Le(() => L.areas.toArray()),
    Re = Le(() => L.projects.toArray());
  st(() => {
    const h = Te.subscribe((p) => {
        c(C, p ?? [], !0);
      }),
      se = Re.subscribe((p) => {
        c(z, p ?? [], !0);
      });
    if (
      ((async () => {
        try {
          const p = await Yt();
          c(de, p.rarityThresholdDelta ?? 0, !0);
        } catch (p) {
          (console.error('Erro ao carregar modificadores de herói:', p),
            c(de, 0));
        }
        try {
          const p = await lr();
          c(ee, p?.raritySubtaskReduction ?? 0, !0);
        } catch (p) {
          (console.error('Erro ao carregar buffs do companheiro na forja:', p),
            c(ee, 0));
        }
      })(),
      te && v())
    ) {
      (c(k, v().title, !0), c(N, String(v().areaId ?? 0), !0));
      const p = v();
      (c(g, p.description ?? '', !0),
        Array.isArray(p.subtasks) && p.subtasks.length > 0
          ? c(
              Y,
              p.subtasks.map((he) => String(he ?? '')),
              !0,
            )
          : c(Y, [''], !0),
        p.projectId != null ? c(B, String(p.projectId), !0) : c(B, 'none'));
    }
    return () => {
      (h.unsubscribe(), se.unsubscribe());
    };
  });
  function Me() {
    c(Y, [...e(Y), ''], !0);
  }
  function Oe(h, se) {
    const p = [...e(Y)];
    ((p[h] = se), c(Y, p, !0));
  }
  function Ye(h) {
    if (e(Y).length === 1) {
      c(Y, [''], !0);
      return;
    }
    c(
      Y,
      e(Y).filter((se, p) => p !== h),
      !0,
    );
  }
  async function Ne(h) {
    h.preventDefault();
    const se = e(k).trim();
    if (!se) return;
    const p = e(Y)
        .map((Xe) => Xe.trim())
        .filter((Xe) => Xe.length > 0),
      he = p.length || 1,
      fe = q(he, e(ae)),
      De = ye[fe],
      Qe = new Date(),
      Ue = e(B) === 'none' ? null : Number.parseInt(e(B), 10) || null,
      We = {
        areaId: Number.parseInt(e(N), 10) || 0,
        title: se,
        rarity: fe,
        xp: De,
        projectId: Ue,
        completed: te && v() ? v().completed : !1,
        status: te && v() ? (v().status ?? 'available') : 'available',
        createdAt: te && v() ? v().createdAt : Qe,
        updatedAt: Qe,
        description: e(g).trim() || null,
        subtasks: p,
      };
    try {
      (te && v()?.id ? await L.tasks.update(v().id, We) : await L.tasks.add(We),
        T.close());
    } catch (Xe) {
      (console.error('Erro ao salvar missão:', Xe),
        alert('Falha ao salvar a missão.'));
    }
  }
  var _ = yr(),
    D = Je(_);
  D.__click = function (...h) {
    T.close?.apply(this, h);
  };
  var P = s(D, 2),
    O = a(P),
    I = a(O, !0);
  t(O);
  var J = s(O, 2),
    le = a(J),
    d = s(a(le), 2);
  (Nt(d), t(le));
  var b = s(le, 2),
    M = s(a(b), 2);
  (rr(M), t(b));
  var F = s(b, 2),
    H = a(F),
    E = a(H),
    G = s(a(E), 2),
    K = a(G);
  K.value = K.__value = '0';
  var Z = s(K);
  (Pe(
    Z,
    17,
    () => e(C),
    (h) => h.id,
    (h, se) => {
      var p = gr(),
        he = a(p, !0);
      t(p);
      var fe = {};
      (U(
        (De) => {
          (f(he, e(se).nome),
            fe !== (fe = De) && (p.value = (p.__value = De) ?? ''));
        },
        [() => String(e(se).id)],
      ),
        w(h, p));
    },
  ),
    t(G),
    t(E));
  var X = s(E, 2),
    be = s(a(X), 2),
    ue = a(be);
  ue.value = ue.__value = 'none';
  var ke = s(ue);
  (Pe(
    ke,
    17,
    () => e(z),
    (h) => h.id,
    (h, se) => {
      var p = _r(),
        he = a(p, !0);
      t(p);
      var fe = {};
      (U(
        (De) => {
          (f(he, e(se).name),
            fe !== (fe = De) && (p.value = (p.__value = De) ?? ''));
        },
        [() => String(e(se).id)],
      ),
        w(h, p));
    },
  ),
    t(be),
    t(X),
    t(H));
  var _e = s(H, 2),
    ie = a(_e),
    S = s(a(ie), 2),
    re = a(S);
  (t(S), t(ie));
  var Be = s(ie, 2),
    ze = a(Be);
  (t(Be), t(_e), t(F));
  var qe = s(F, 2),
    Ge = a(qe),
    nt = s(a(Ge), 2);
  ((nt.__click = Me), t(Ge));
  var Ke = s(Ge, 2);
  (Pe(
    Ke,
    21,
    () => e(Y),
    Rt,
    (h, se, p) => {
      var he = hr(),
        fe = a(he);
      (Nt(fe),
        xe(fe, 'placeholder', `Passo ${p + 1}`),
        (fe.__input = (Qe) => Oe(p, Qe.currentTarget.value)));
      var De = s(fe, 2);
      ((De.__click = () => Ye(p)), t(he), U(() => or(fe, e(se))), w(h, he));
    },
  ),
    t(Ke),
    t(qe));
  var Ze = s(qe, 2),
    et = a(Ze);
  et.__click = function (...h) {
    T.close?.apply(this, h);
  };
  var Ie = s(et, 2),
    ve = a(Ie, !0);
  (t(Ie),
    t(Ze),
    t(J),
    t(P),
    U(() => {
      (f(I, te ? 'Editar Missão' : 'Forjar Nova Missão'),
        f(re, `${V[e(ce)] ?? ''} · ${e(we) ?? ''} XP`),
        f(
          ze,
          `${e(Q) ?? ''}
          ${e(Q) === 1 ? 'subtarefa' : 'subtarefas'}`,
        ),
        f(ve, te ? 'Salvar alterações' : 'Criar missão'));
    }),
    va('submit', J, Ne),
    Xt(
      d,
      () => e(k),
      (h) => c(k, h),
    ),
    Xt(
      M,
      () => e(g),
      (h) => c(g, h),
    ),
    ca(
      G,
      () => e(N),
      (h) => c(N, h),
    ),
    ca(
      be,
      () => e(B),
      (h) => c(B, h),
    ),
    w(u, _),
    ot());
}
vt(['click', 'input']);
let it = '7d';
const Lt = new Set();
function ba() {
  return it;
}
function kr(u) {
  if (it !== u) {
    it = u;
    for (const T of Lt) T(it);
  }
}
function xa(u) {
  return (
    Lt.add(u),
    u(it),
    () => {
      Lt.delete(u);
    }
  );
}
var Dr = Ot(
    '<circle cx="50" cy="50" fill="none" stroke-width="14" stroke-linecap="butt"><title> </title></circle>',
  ),
  Sr = $(
    '<li class="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm"><div class="flex items-center gap-2 min-w-0"><span class="inline-block h-3 w-3 rounded-sm" aria-hidden="true"></span> <span class="truncate text-slate-200"> </span></div> <div class="flex items-center gap-2 shrink-0"><span class="text-slate-400"> </span> <span class="text-amber-300 font-semibold"> </span></div></li>',
  ),
  Ar = $(
    '<div class="flex flex-col items-center gap-5"><div class="flex items-center justify-center w-full"><svg viewBox="0 0 100 100" class="w-full max-w-md h-64 lg:h-80" role="img" aria-label="Distribuição de XP por área"><circle cx="50" cy="50" fill="none" stroke="rgba(148,163,184,0.15)" stroke-width="14"></circle><g transform="rotate(-90 50 50)"></g><g aria-hidden="true"><circle cx="50" cy="50" r="22" fill="rgba(15,23,42,0.9)"></circle><text x="50" y="47" text-anchor="middle" class="fill-slate-300" font-size="8" font-weight="600">Total XP</text><text x="50" y="60" text-anchor="middle" class="fill-amber-300" font-size="10" font-weight="700"> </text></g></svg></div> <div class="mx-auto w-full max-w-md"><ul class="space-y-2"></ul></div></div>',
  ),
  Tr = $(
    '<div class="flex items-center justify-center h-64 lg:h-80 text-slate-500"><p>Complete missões no período selecionado para ver suas estatísticas aqui!</p></div>',
  ),
  Mr = $(
    '<section class="mx-auto w-full max-w-4xl rounded-2xl border border-green-500/60 bg-slate-950/70 px-4 py-3 shadow-[0_0_20px_rgba(56,189,248,0.45)]"><header class="text-center space-y-1 mb-4"><p class="text-[0.7rem] uppercase tracking-[0.22em] text-slate-400">Estatísticas</p> <h2 class="text-xl font-semibold text-slate-100">XP por Área</h2> <p class="text-[0.7rem] text-slate-500 mt-1"> </p> <div class="mx-auto mt-3 h-px w-24 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div></header> <!></section>',
  );
function jr(u, T) {
  rt(T, !0);
  let v = W(Ae([])),
    k = W(Ae([])),
    g = W(Ae(ba()));
  st(() => {
    const _ = Le(() => L.xpLogs.toArray()).subscribe((O) => {
        c(v, O ?? [], !0);
      }),
      D = Le(() => L.areas.toArray()).subscribe((O) => {
        c(k, O ?? [], !0);
      }),
      P = xa((O) => {
        c(g, O, !0);
      });
    return () => {
      (_.unsubscribe(), D.unsubscribe(), P());
    };
  });
  function N(_) {
    if (!_) return null;
    const D = _.split('-');
    if (D.length !== 3) return null;
    const [P, O, I] = D,
      J = Number(P),
      le = Number(O),
      d = Number(I);
    return !J || !le || !d ? null : new Date(J, le - 1, d);
  }
  function B(_, D) {
    const P = N(_.date);
    if (!P) return !1;
    const O = new Date(),
      I = new Date(O.getFullYear(), O.getMonth(), O.getDate()),
      J = new Date(P.getFullYear(), P.getMonth(), P.getDate());
    if (D === '7d' || D === '30d') {
      const d = D === '7d' ? 6 : 29,
        b = new Date(I.getFullYear(), I.getMonth(), I.getDate() - d);
      return J >= b && J <= I;
    }
    const le = new Date(I.getFullYear(), I.getMonth(), 1);
    if (D === '6m') {
      const d = new Date(le.getFullYear(), le.getMonth() - 5, 1);
      return P >= d && P <= I;
    } else {
      const d = new Date(le.getFullYear(), le.getMonth() - 11, 1);
      return P >= d && P <= I;
    }
  }
  const C = j(() =>
      e(k).reduce((_, D) => (D.id && (_[D.id] = D.nome), _), { 0: 'Geral' }),
    ),
    z = j(() =>
      (() => {
        const _ = {};
        if (!e(v).length) return _;
        for (const D of e(v)) {
          if (!B(D, e(g))) continue;
          const P = D.areaId ?? 0,
            O = e(C)[P] ?? 'Geral';
          _[O] = (_[O] ?? 0) + (D.amount ?? 0);
        }
        return _;
      })(),
    ),
    Y = j(() =>
      Object.keys(e(z)).sort((_, D) => (e(z)[D] ?? 0) - (e(z)[_] ?? 0)),
    ),
    de = j(() => e(Y).map((_) => e(z)[_] ?? 0)),
    ee = j(() => e(de).reduce((_, D) => _ + D, 0)),
    te = j(() => e(ee) > 0);
  function V(_, D = 12) {
    return `hsl(${Math.round(((_ % D) / D) * 360)} 70% 55%)`;
  }
  const ye = 38,
    q = j(() => 2 * Math.PI * ye),
    Q = j(() =>
      (() => {
        if (!e(te)) return [];
        let _ = 0;
        const D = [];
        for (let P = 0; P < e(de).length; P++) {
          const O = e(de)[P],
            I = O / e(ee),
            J = e(q) * I;
          (D.push({
            label: e(Y)[P],
            value: O,
            percent: I,
            len: J,
            offset: _,
            color: V(P),
          }),
            (_ += J));
        }
        return D;
      })(),
    );
  function ae(_) {
    return `${Math.round(_ * 100)}%`;
  }
  const ce = j(() =>
    (() => {
      switch (e(g)) {
        case '7d':
          return 'Últimos 7 dias';
        case '30d':
          return 'Últimos 30 dias';
        case '6m':
          return 'Últimos 6 meses';
        case '1y':
          return 'Últimos 12 meses';
      }
    })(),
  );
  var we = Mr(),
    Te = a(we),
    Re = s(a(Te), 4),
    Me = a(Re, !0);
  (t(Re), Fe(2), t(Te));
  var Oe = s(Te, 2);
  {
    var Ye = (_) => {
        var D = Ar(),
          P = a(D),
          O = a(P),
          I = a(O);
        xe(I, 'r', ye);
        var J = s(I);
        (Pe(
          J,
          21,
          () => e(Q),
          Rt,
          (H, E) => {
            var G = Dr();
            xe(G, 'r', ye);
            var K = a(G),
              Z = a(K);
            (t(K),
              t(G),
              U(
                (X) => {
                  (xe(G, 'stroke', e(E).color),
                    xe(G, 'stroke-dasharray', `${e(E).len} ${e(q) - e(E).len}`),
                    xe(G, 'stroke-dashoffset', `-${e(E).offset}`),
                    f(
                      Z,
                      `${e(E).label ?? ''}: ${e(E).value ?? ''} XP (${X ?? ''})`,
                    ));
                },
                [() => ae(e(E).percent)],
              ),
              w(H, G));
          },
        ),
          t(J));
        var le = s(J),
          d = s(a(le), 2),
          b = a(d, !0);
        (t(d), t(le), t(O), t(P));
        var M = s(P, 2),
          F = a(M);
        (Pe(
          F,
          21,
          () => e(Q),
          Rt,
          (H, E) => {
            var G = Sr(),
              K = a(G),
              Z = a(K),
              X = s(Z, 2),
              be = a(X, !0);
            (t(X), t(K));
            var ue = s(K, 2),
              ke = a(ue),
              _e = a(ke, !0);
            t(ke);
            var ie = s(ke, 2),
              S = a(ie);
            (t(ie),
              t(ue),
              t(G),
              U(
                (re) => {
                  (ma(Z, `background:${e(E).color}`),
                    f(be, e(E).label),
                    f(_e, re),
                    f(S, `${e(E).value ?? ''} XP`));
                },
                [() => ae(e(E).percent)],
              ),
              w(H, G));
          },
        ),
          t(F),
          t(M),
          t(D),
          U(() => f(b, e(ee))),
          w(_, D));
      },
      Ne = (_) => {
        var D = Tr();
        w(_, D);
      };
    me(Oe, (_) => {
      e(te) ? _(Ye) : _(Ne, !1);
    });
  }
  (t(we), U(() => f(Me, e(ce))), w(u, we), ot());
}
var $r = $(
    '<span class="font-semibold"> </span> <span class="text-[0.65rem] uppercase tracking-[0.18em] text-amber-200/80">sequência</span>',
    1,
  ),
  Cr = $('<span class="font-semibold">Comece hoje</span>'),
  Pr = $('<img class="h-full w-full object-cover"/>'),
  Ir = $(
    '<div class="h-full w-full grid place-items-center text-sm text-amber-200/80">?</div>',
  ),
  Er =
    $(`<section class="w-full"><div class="realm-card relative mx-auto max-w-4xl overflow-hidden px-6 py-5 md:px-8 md:py-6"><div class="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true"><div class="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.45),_transparent_60%)]"></div></div> <div class="relative flex flex-col gap-4"><div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p class="text-[0.65rem] uppercase tracking-[0.25em] text-sky-400/80">Status do herói</p> <h2 class="text-xl md:text-2xl font-bold text-slate-50"> </h2> <p class="text-[0.7rem] text-slate-400"> </p> <p class="mt-1 text-xs text-slate-300/80 max-w-md">Complete pequenas missões todos os dias para subir de nível e manter
            sua chama de foco acesa.</p></div> <div class="flex flex-col items-end gap-2 text-xs"><div class="inline-flex items-center gap-2 rounded-full border border-amber-400/70 bg-amber-500/10 px-3 py-1 text-amber-100 shadow-md shadow-amber-900/40"><span class="text-sm">🔥</span> <!></div> <p class="text-[0.7rem] text-slate-400">XP total: <span class="font-semibold text-slate-100"> </span></p></div></div> <div class="flex flex-col items-center justify-between gap-4 md:flex-row"><div class="flex items-center gap-4"><div class="relative flex h-32 w-32 items-center justify-center rounded-full border border-amber-400/80 bg-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.7)] overflow-hidden"><!></div> <div class="space-y-2"><p class="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-amber-200/80">Nível atual</p> <div class="inline-flex items-center justify-center rounded-md border border-amber-200/80 bg-slate-950/90 px-4 py-1 text-sm font-semibold text-amber-200/80 shadow-[0_0_14px_rgba(56,189,248,0.6)]"> </div> <p class="text-xs text-slate-300/85 max-w-xs">Falta <span class="font-semibold text-sky-100"> </span> XP para o próximo nível.</p></div></div> <div class="w-full space-y-2 md:w-1/2"><div class="flex items-center justify-between text-[0.7rem] text-slate-400"><span>Progresso até o próximo nível</span> <span class="inline-flex items-center gap-1 font-medium text-slate-200"><img src="/art/icones/icon-xp.png" alt="XP" class="h-4 w-4 object-contain"/> <span> </span></span></div> <div class="h-2.5 w-full overflow-hidden rounded-full border border-slate-800 bg-slate-900"><div class="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-lime-400 transition-[width] duration-500 ease-out"></div></div></div></div></div></div></section>`);
function Fr(u, T) {
  rt(T, !0);
  const v = {
      id: 1,
      name: 'Seu herói',
      title: 'Nobre aventureiro',
      level: 1,
      xpCurrent: 0,
      xpNext: 100,
      avatarUrl: '',
      totalXpEarned: 0,
      currentStreak: 0,
      lastCompletionDate: '',
      activeCompanionId: 1,
      gold: 0,
    },
    k = Ae(v),
    g = Le(() => L.profile.get(1));
  st(() => {
    const S = g.subscribe((re) => {
      Object.assign(k, re ?? v);
    });
    return () => S.unsubscribe();
  });
  const N = j(() => k.totalXpEarned ?? 0),
    B = j(() => k.level ?? 1),
    C = j(() => k.xpCurrent ?? 0),
    z = j(() => ir(e(B))),
    Y = j(() => Math.max(e(z) - e(C), 0)),
    de = j(() => k.currentStreak ?? 0),
    ee = j(() => (e(z) > 0 ? Math.min(100, (e(C) / e(z)) * 100) : 0));
  var te = Er(),
    V = a(te),
    ye = s(a(V), 2),
    q = a(ye),
    Q = a(q),
    ae = s(a(Q), 2),
    ce = a(ae, !0);
  t(ae);
  var we = s(ae, 2),
    Te = a(we, !0);
  (t(we), Fe(2), t(Q));
  var Re = s(Q, 2),
    Me = a(Re),
    Oe = s(a(Me), 2);
  {
    var Ye = (S) => {
        var re = $r(),
          Be = Je(re),
          ze = a(Be);
        (t(Be),
          Fe(2),
          U(() => f(ze, `${e(de) ?? ''} dia${e(de) === 1 ? '' : 's'}`)),
          w(S, re));
      },
      Ne = (S) => {
        var re = Cr();
        w(S, re);
      };
    me(Oe, (S) => {
      e(de) > 0 ? S(Ye) : S(Ne, !1);
    });
  }
  t(Me);
  var _ = s(Me, 2),
    D = s(a(_)),
    P = a(D, !0);
  (t(D), t(_), t(Re), t(q));
  var O = s(q, 2),
    I = a(O),
    J = a(I),
    le = a(J);
  {
    var d = (S) => {
        var re = Pr();
        (U(() => {
          (xe(re, 'src', k.avatarUrl),
            xe(re, 'alt', `Avatar de ${k.name || 'herói'}`));
        }),
          w(S, re));
      },
      b = (S) => {
        var re = Ir();
        w(S, re);
      };
    me(le, (S) => {
      k.avatarUrl ? S(d) : S(b, !1);
    });
  }
  t(J);
  var M = s(J, 2),
    F = s(a(M), 2),
    H = a(F, !0);
  t(F);
  var E = s(F, 2),
    G = s(a(E)),
    K = a(G, !0);
  (t(G), Fe(), t(E), t(M), t(I));
  var Z = s(I, 2),
    X = a(Z),
    be = s(a(X), 2),
    ue = s(a(be), 2),
    ke = a(ue);
  (t(ue), t(be), t(X));
  var _e = s(X, 2),
    ie = a(_e);
  (t(_e),
    t(Z),
    t(O),
    t(ye),
    t(V),
    t(te),
    U(() => {
      (f(ce, k.name || 'Seu herói'),
        f(Te, k.title || 'Nobre aventureiro'),
        f(P, e(N)),
        f(H, e(B)),
        f(K, e(Y)),
        f(ke, `${e(C) ?? ''} / ${e(z) ?? ''}`),
        ma(ie, `width: ${e(ee)}%;`));
    }),
    w(u, te),
    ot());
}
var Rr = $('<button type="button"> </button>'),
  Nr = Ot(
    '<text y="96" font-size="4.2" fill="rgba(148,163,184,0.9)" text-anchor="middle"> </text>',
  ),
  Xr = Ot('<rect rx="1.5" fill="#22c55e"><title> </title></rect><!>', 1),
  Lr = $(
    '<div class="mb-4 grid gap-3 text-xs text-slate-300 md:grid-cols-3"><div class="rounded-2xl border border-emerald-500/70 bg-emerald-950/40 px-3 py-2.5 shadow-[0_0_18px_rgba(16,185,129,0.45)]"><p class="text-[0.65rem] uppercase tracking-[0.18em] text-emerald-200/80">Total no período</p> <p class="mt-1 text-lg font-semibold text-emerald-100"> </p> <p class="text-[0.7rem] text-emerald-200/80"> </p></div> <div class="rounded-2xl border border-yellow-300/60 bg-slate-950/70 px-3 py-2.5 shadow-[0_0_20px_rgba(234,179,8,0.25)]"><p class="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400"> </p> <p class="mt-1 text-lg font-semibold text-slate-100"> </p> <p class="text-[0.7rem] text-slate-400">Se mantiver esse ritmo, seu crescimento continua estável.</p></div> <div class="rounded-2xl border border-blue-300/60 bg-slate-950/70 px-3 py-2.5 shadow-[0_0_20px_rgba(59,130,246,0.25)]"><p class="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400"> </p> <p class="mt-1 text-sm font-semibold text-emerald-300"> </p> <p class="text-[0.7rem] text-slate-400">Quando você mais acumulou XP dentro deste recorte.</p></div></div> <div class="mb-4 flex flex-wrap items-center justify-center gap-2 text-[0.7rem]"></div> <div class="mb-4 rounded-2xl border border-slate-800 bg-slate-950/90 px-3 py-3"><svg viewBox="0 0 100 100" class="h-52 w-full" role="img"><line x1="0" y1="88" x2="100" y2="88" stroke="rgba(148,163,184,0.6)" stroke-width="0.5"></line><!></svg></div> <div class="mx-auto w-full max-w-4xl rounded-2xl border border-green-500/60 bg-slate-950/70 px-4 py-3 shadow-[0_0_20px_rgba(56,189,248,0.45)]"><p class="text-center text-[0.65rem] uppercase tracking-[0.18em] text-green-300/80">Dia da semana mais forte</p> <p class="text-center text-lg font-semibold text-emerald-300"> </p> <p class="text-[0.7rem] text-slate-400">Considerando todo o histórico, é quando você tende a render mais.</p></div>',
    1,
  ),
  Or =
    $(`<p class="text-sm text-slate-400">Complete algumas missões a partir de agora para que o painel comece a
        registrar seu XP diário e mensal. Assim que você ganhar XP, o gráfico
        será atualizado automaticamente.</p>`),
  Yr = $(
    '<section class="mx-auto w-full max-w-4xl rounded-2xl border border-green-500/60 bg-slate-950/70 px-4 py-3 shadow-[0_0_20px_rgba(56,189,248,0.45)]"><div class="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-950/85 px-4 py-4 md:px-6 md:py-5 shadow-[0_0_30px_rgba(15,23,42,0.7)]"><header class="mb-4 text-center space-y-1"><p class="text-[1rem] uppercase tracking-[0.22em] text-slate-400">Comparação pessoal</p> <h3 class="text-base font-semibold text-slate-100 md:text-lg"> </h3> <p class="text-[0.7rem] text-slate-500">Gráfico atualizado em tempo real conforme você ganha XP.</p></header> <!></div></section>',
  );
function qr(u, T) {
  rt(T, !0);
  const v = ['7d', '30d', '6m', '1y'];
  let k = W(Ae([])),
    g = W(Ae(ba()));
  const N = Le(() => L.xpLogs.toArray());
  st(() => {
    const d = N.subscribe((M) => {
        c(k, M ?? [], !0);
      }),
      b = xa((M) => {
        c(g, M, !0);
      });
    return () => {
      (d.unsubscribe(), b());
    };
  });
  const B = 1e3 * 60 * 60 * 24;
  function C(d) {
    if (!d) return null;
    const [b, M, F] = d.split('-'),
      H = Number(b),
      E = Number(M),
      G = Number(F);
    return !H || !E || !G ? null : new Date(H, E - 1, G);
  }
  function z(d) {
    const b = String(d.getDate()).padStart(2, '0'),
      M = String(d.getMonth() + 1).padStart(2, '0');
    return `${b}/${M}`;
  }
  function Y(d) {
    return [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ][d.getMonth()];
  }
  function de(d) {
    const b = d.getFullYear(),
      M = String(d.getMonth() + 1).padStart(2, '0'),
      F = String(d.getDate()).padStart(2, '0');
    return `${b}-${M}-${F}`;
  }
  function ee(d) {
    const b = d.getFullYear(),
      M = String(d.getMonth() + 1).padStart(2, '0');
    return `${b}-${M}`;
  }
  function te(d, b) {
    if (!d?.length) return [];
    const M = new Date();
    if (b === '7d' || b === '30d') {
      const K = b === '7d' ? 7 : 30,
        Z = [];
      for (let X = K - 1; X >= 0; X--) {
        const be = new Date(M.getTime() - X * B),
          ue = de(be),
          ke = z(be),
          _e = d
            .filter((ie) => ie.date === ue)
            .reduce((ie, S) => ie + (S.amount ?? 0), 0);
        Z.push({ label: ke, value: _e });
      }
      return Z;
    }
    const F = b === '6m' ? 6 : 12,
      H = [],
      E = {};
    for (const K of d) {
      const Z = C(K.date);
      if (!Z) continue;
      const X = ee(Z);
      E[X] = (E[X] ?? 0) + (K.amount ?? 0);
    }
    const G = new Date(M.getFullYear(), M.getMonth(), 1);
    for (let K = F - 1; K >= 0; K--) {
      const Z = new Date(G.getFullYear(), G.getMonth() - K, 1),
        X = ee(Z);
      H.push({ label: Y(Z), value: E[X] ?? 0 });
    }
    return H;
  }
  const V = j(() => te(e(k), e(g))),
    ye = j(() =>
      e(V).length ? e(V).reduce((d, b) => (b.value > d ? b.value : d), 0) : 0,
    ),
    q = j(() =>
      (() => {
        if (!e(V).length) return [];
        const d = e(ye) || 1,
          b = 100,
          M = 100,
          F = 4,
          H = 4,
          E = 12,
          G = b - F * 2,
          K = M - H - E,
          Z = e(V).length,
          X = G / Z,
          be = X * 0.7;
        return e(V).map((ue, ke) => {
          const _e = (ue.value / d) * K,
            ie = Math.max(_e, 1),
            S = F + ke * X + (X - be) / 2,
            re = M - E - ie;
          return {
            label: ue.label,
            value: ue.value,
            x: S,
            y: re,
            width: be,
            height: ie,
          };
        });
      })(),
    ),
    Q = j(() => e(V).some((d) => d.value !== 0)),
    ae = j(() => e(V).reduce((d, b) => d + b.value, 0)),
    ce = j(() => (e(V).length ? Math.round(e(ae) / e(V).length) : 0)),
    we = j(() =>
      (() => {
        if (!e(V).length) return '—';
        let d = e(V)[0];
        for (const b of e(V)) b.value > d.value && (d = b);
        return d.value === 0 ? '—' : d.label;
      })(),
    ),
    Te = j(() =>
      (() => {
        if (!e(k).length) return '—';
        const d = [0, 0, 0, 0, 0, 0, 0];
        for (const F of e(k)) {
          const H = C(F.date);
          H && (d[H.getDay()] += F.amount ?? 0);
        }
        const b = [
          'Domingo',
          'Segunda',
          'Terça',
          'Quarta',
          'Quinta',
          'Sexta',
          'Sábado',
        ];
        let M = 0;
        for (let F = 1; F < 7; F++) d[F] > d[M] && (M = F);
        return d[M] === 0 ? '—' : b[M];
      })(),
    ),
    Re = j(() =>
      (() => {
        switch (e(g)) {
          case '7d':
            return 'XP diário — últimos 7 dias';
          case '30d':
            return 'XP diário — últimos 30 dias';
          case '6m':
            return 'XP mensal — últimos 6 meses';
          case '1y':
            return 'XP mensal — últimos 12 meses';
        }
      })(),
    ),
    Me = j(() => (e(g) === '6m' || e(g) === '1y' ? 'mês' : 'dia'));
  function Oe(d, b, M) {
    if (M === '7d') return !0;
    if (M === '30d') {
      const H = Math.max(1, Math.floor(b / 8));
      return d % H === 0;
    }
    return !0;
  }
  function Ye(d, b) {
    return b === '7d' || b === '30d' ? d.slice(0, 2) : d;
  }
  var Ne = Yr(),
    _ = a(Ne),
    D = a(_),
    P = s(a(D), 2),
    O = a(P, !0);
  (t(P), Fe(2), t(D));
  var I = s(D, 2);
  {
    var J = (d) => {
        var b = Lr(),
          M = Je(b),
          F = a(M),
          H = s(a(F), 2),
          E = a(H);
        t(H);
        var G = s(H, 2),
          K = a(G);
        (t(G), t(F));
        var Z = s(F, 2),
          X = a(Z),
          be = a(X);
        t(X);
        var ue = s(X, 2),
          ke = a(ue);
        (t(ue), Fe(2), t(Z));
        var _e = s(Z, 2),
          ie = a(_e),
          S = a(ie);
        t(ie);
        var re = s(ie, 2),
          Be = a(re, !0);
        (t(re), Fe(2), t(_e), t(M));
        var ze = s(M, 2);
        (Pe(
          ze,
          20,
          () => v,
          (Ie) => Ie,
          (Ie, ve) => {
            var h = Rr();
            h.__click = () => kr(ve);
            var se = a(h, !0);
            (t(h),
              U(() => {
                (Ce(
                  h,
                  1,
                  `rounded-full px-3 py-1.5 border transition-colors ${e(g) === ve ? 'border-emerald-400/80 bg-emerald-500/15 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.6)]' : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-emerald-400/60 hover:text-emerald-200'}`,
                ),
                  f(
                    se,
                    ve === '7d'
                      ? '7 dias'
                      : ve === '30d'
                        ? '30 dias'
                        : ve === '6m'
                          ? '6 meses'
                          : '1 ano',
                  ));
              }),
              w(Ie, h));
          },
        ),
          t(ze));
        var qe = s(ze, 2),
          Ge = a(qe),
          nt = s(a(Ge));
        (Pe(
          nt,
          19,
          () => e(q),
          (Ie) => Ie.label,
          (Ie, ve, h) => {
            var se = Xr(),
              p = Je(se),
              he = a(p),
              fe = a(he);
            (t(he), t(p));
            var De = s(p);
            {
              var Qe = (Ue) => {
                var We = Nr(),
                  Xe = a(We, !0);
                (t(We),
                  U(
                    (dt) => {
                      (xe(We, 'x', e(ve).x + e(ve).width / 2), f(Xe, dt));
                    },
                    [() => Ye(e(ve).label, e(g))],
                  ),
                  w(Ue, We));
              };
              me(De, (Ue) => {
                Oe(e(h), e(q).length, e(g)) && Ue(Qe);
              });
            }
            (U(() => {
              (xe(p, 'x', e(ve).x),
                xe(p, 'y', e(ve).y),
                xe(p, 'width', e(ve).width),
                xe(p, 'height', e(ve).height),
                f(fe, `${e(ve).label ?? ''}: ${e(ve).value ?? ''} XP`));
            }),
              w(Ie, se));
          },
        ),
          t(Ge),
          t(qe));
        var Ke = s(qe, 2),
          Ze = s(a(Ke), 2),
          et = a(Ze, !0);
        (t(Ze),
          Fe(2),
          t(Ke),
          U(() => {
            (f(E, `${e(ae) ?? ''} XP`),
              f(K, `Somando tudo que você fez em cada ${e(Me) ?? ''}.`),
              f(be, `Média por ${e(Me) ?? ''}`),
              f(ke, `${e(ce) ?? ''} XP`),
              f(
                S,
                `Melhor ${e(g) === '6m' || e(g) === '1y' ? 'mês' : 'dia'} do período`,
              ),
              f(Be, e(we)),
              xe(Ge, 'aria-label', `XP por ${e(Me) ?? ''}`),
              f(et, e(Te)));
          }),
          w(d, b));
      },
      le = (d) => {
        var b = Or();
        w(d, b);
      };
    me(I, (d) => {
      e(Q) ? d(J) : d(le, !1);
    });
  }
  (t(_), t(Ne), U(() => f(O, e(Re))), w(u, Ne), ot());
}
vt(['click']);
var Gr = $('<button type="button"> </button>'),
  Br = $(
    '<button type="button" class="text-[0.7rem] text-slate-500 hover:text-red-400">Remover revisão</button>',
  ),
  zr = $('<span></span>'),
  Qr = $(
    '<div class="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4"><div class="w-full max-w-sm rounded-2xl border border-sky-500/70 bg-slate-950 px-4 py-4 shadow-[0_0_28px_rgba(56,189,248,0.7)]"><header class="mb-3 flex items-start justify-between gap-3"><div><p class="text-[0.65rem] uppercase tracking-[0.22em] text-sky-300/80">Configurar revisão</p> <h3 class="mt-1 text-sm font-semibold text-slate-100 line-clamp-2"> </h3></div> <button type="button" class="rounded-full p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800" aria-label="Fechar">✕</button></header> <p class="text-xs text-slate-400 mb-3">De quanto em quanto tempo você quer revisar esta missão?</p> <div class="mb-4 flex flex-wrap gap-2"></div> <div class="flex items-center justify-between gap-2 text-xs"><!> <div class="flex gap-2"><button type="button" class="rounded-lg px-3 py-1.5 bg-slate-800 text-slate-200 hover:bg-slate-700">Cancelar</button> <button type="button" class="rounded-lg px-3 py-1.5 bg-sky-500 text-slate-950 font-semibold hover:bg-sky-400">Salvar</button></div></div></div></div>',
  ),
  Wr = $(
    '<section class="mx-auto w-full max-w-4xl rounded-2xl border border-emerald-500/60 bg-emerald-950/40 px-4 py-3 shadow-[0_0_20px_rgba(16,185,129,0.35)] flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div class="flex items-start gap-3"><div class="mt-1 hidden h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-2xl md:flex">📌</div> <div><p class="text-[0.65rem] uppercase tracking-[0.22em] text-emerald-300/80">Missão sugerida do dia</p> <h3 class="mt-1 text-sm font-semibold text-emerald-100"> </h3> <p class="mt-1 text-xs text-emerald-100/80">Foque em <span class="font-semibold"> </span> para equilibrar suas áreas de foco.</p></div></div> <div class="mt-2 flex items-center gap-3 md:mt-0"><span class="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-3 py-1 text-[0.7rem] font-semibold text-emerald-100"> </span> <button type="button" class="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-[0_0_14px_rgba(16,185,129,0.6)] hover:bg-emerald-400 transition-colors">Ver na lista</button></div></section>',
  ),
  Vr =
    $(`<p class="mt-1 text-xs text-slate-500">Nenhuma missão configurada para revisão. Use o ícone de marcador nas
          missões abaixo para definir um intervalo de revisão.</p>`),
  Hr = $(
    '<div class="flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs"><div class="min-w-0"><p class="truncate text-slate-100 font-medium"> </p> <p class="mt-0.5 text-[0.7rem] text-slate-400"> </p> <p class="mt-0.5 text-[0.7rem] text-sky-300"> </p></div> <button type="button" class="shrink-0 rounded-lg bg-sky-500 px-3 py-1 text-[0.7rem] font-semibold text-slate-950 hover:bg-sky-400 transition-colors">Ir para missão</button></div>',
  ),
  Ur = $('<div class="mt-3 space-y-2"></div>'),
  Jr = $(
    '<span class="ml-1 text-slate-500">• Mostrando apenas <strong class="uppercase"> </strong></span>',
  ),
  Kr = $(
    '<button type="button" class="text-xs text-slate-400 hover:text-slate-200 underline">Limpar</button>',
  ),
  Zr = $('<button type="button"> </button>'),
  es = $('<option> </option>'),
  ts = $(
    '<button type="button" class="text-[0.7rem] text-slate-400 hover:text-slate-200 underline">Limpar filtro de projeto</button>',
  ),
  as = $(
    '<div class="text-center py-10 text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800/50 border-dashed"><p>Nenhuma missão encontrada para esta seleção.</p> <button class="text-sm text-primary hover:underline mt-2">Adicionar uma missão?</button></div>',
  ),
  rs = $(
    '<span class="text-[0.65rem] px-2 py-0.5 rounded-full bg-emerald-900/40 border border-emerald-500/40 text-emerald-200"> </span>',
  ),
  ss = $(
    '<button type="button" class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-sky-300 hover:bg-slate-800 text-xs" aria-label="Subir na ordem" title="Subir na ordem">↑</button> <button type="button" class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-sky-300 hover:bg-slate-800 text-xs" aria-label="Descer na ordem" title="Descer na ordem">↓</button>',
    1,
  ),
  os = $('<span title="Revisão ativada">🔖</span>'),
  ns = $('<span title="Ativar revisão">🏷️</span>'),
  ls = $(
    '<button class="w-8 h-8 flex items-center justify-center rounded-lg text-amber-300 hover:text-amber-200 hover:bg-slate-800" aria-label="Voltar para disponível" title="Voltar para disponível (perde XP/Gold, exceto missões de revisão)">↩</button>',
  ),
  is = $(
    '<div><button aria-label="Completar missão"><!></button> <div class="flex-1 min-w-0"><div class="flex items-center gap-2 mb-1 flex-wrap"><span> </span> <span class="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400"> </span> <!> <button type="button">A Fazer</button></div> <h3> </h3></div> <div class="shrink-0 flex flex-col items-end gap-1 text-xs"><div class="flex items-center gap-1"><img src="/art/icones/icon-xp.png" alt="XP" class="h-6 w-6 object-contain"/> <span class="text-[#eec39a] font-bold"> </span></div> <div class="flex items-center gap-1 text-amber-200"><img src="/art/icones/gold-icon.png" alt="Gold" class="h-6 w-6 object-contain"/> <span class="font-semibold"> </span></div> <div class="flex items-center gap-1 text-emerald-200"><span class="text-sm">🍖</span> <span class="font-semibold"> </span></div></div> <div class="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><!> <button class="w-8 h-8 flex items-center justify-center rounded-lg text-sky-400 hover:text-sky-200 hover:bg-slate-800" aria-label="Configurar revisão"><!></button> <button class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary hover:bg-slate-800" aria-label="Editar">✏️</button> <!> <button class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-800" aria-label="Excluir">🗑️</button></div></div>',
  ),
  ds = $(
    '<!> <!> <div class="flex flex-col gap-6"><!> <!> <!> <section class="mx-auto w-full max-w-4xl rounded-2xl border border-amber-500/70 bg-slate-950/70 px-4 py-3 shadow-[0_0_26px_rgba(16,185,129,0.65)] flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p class="text-[0.8rem] uppercase tracking-[0.22em] text-amber-400">Retrospectiva da última semana</p> <p class="mt-1 text-xs text-slate-400">Considerando as missões concluídas (logs de XP) nos últimos 7 dias.</p></div> <div class="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs md:mt-0 md:text-right"><div><p class="text-slate-400">Missões concluídas</p> <p class="mt-1 text-base font-semibold text-slate-100"> </p></div> <div><p class="text-slate-400">XP ganho</p> <p class="mt-1 text-base font-semibold text-[#eec39a]"> </p></div> <div><p class="text-slate-400">Gold ganho</p> <p class="mt-1 flex items-center justify-center gap-1 text-base font-semibold text-amber-300 md:justify-end"> <img src="/art/icones/gold-icon.png" alt="Gold" class="h-4 w-4 object-contain"/></p></div> <div><p class="text-slate-400">Comida ganha</p> <p class="mt-1 flex items-center justify-center gap-1 text-base font-semibold text-emerald-300 md:justify-end"> <span class="text-sm">🍖</span></p></div></div></section> <div class="mx-auto flex w-full max-w-4xl flex-col gap-6"><div class="mt-6 grid gap-6 lg:grid-cols-2"><!> <!></div> <section class="mx-auto w-full max-w-4xl rounded-2xl border border-sky-500/60 bg-slate-900/70 px-4 py-3 shadow-[0_0_20px_rgba(56,189,248,0.45)]"><div class="flex items-center justify-between gap-3 mb-2"><div><p class="text-[0.7rem] uppercase tracking-[0.22em] text-sky-300/80">Missões para Revisão</p> <p class="mt-1 text-xs text-slate-400">Missões com revisão ativada, seus intervalos e próxima revisão.</p></div> <span class="rounded-full bg-slate-800/80 px-3 py-1 text-[0.7rem] text-slate-200"> </span></div> <!></section> <section class="mx-auto w-full max-w-4xl rounded-2xl border border-amber-500/60 bg-slate-900/70 px-4 py-3 shadow-[0_0_20px_rgba(56,189,248,0.45)]"><div class="flex items-center justify-between mb-2 gap-2"><!> <p class="text-xs text-slate-400"><!></p> <!></div> <div class="flex flex-wrap gap-2"></div> <div class="mt-3 flex flex-wrap items-center gap-2"><p class="text-xs text-slate-400">Projeto:</p> <select class="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100"><option>Todos os projetos</option><!></select> <!></div></section> <div class="flex items-center justify-between gap-4 bg-slate-900/50 p-2 rounded-xl border border-slate-800"><div class="flex gap-2"><button>Disponíveis</button> <button>A Fazer</button> <button>Concluídas</button></div> <button class="flex items-center gap-2 bg-[#ffb74d] hover:bg-[#ffa726] text-slate-950 px-4 py-2 rounded-lg font-bold text-sm transition-colors"><span>+</span> Nova Missão</button></div> <div class="grid grid-cols-1 gap-3"><!></div> <section class="mx-auto w-full max-w-4xl rounded-2xl border border-green-500/60 bg-slate-950/70 px-4 py-3 shadow-[0_0_20px_rgba(56,189,248,0.45)]"><p class="text-center text-[0.65rem] uppercase tracking-[0.18em] text-green-300/80">Dia da semana mais forte</p> <p class="text-center text-lg font-semibold text-emerald-300"> </p> <p class="text-[0.7rem] text-slate-400 text-center">Considerando todo o histórico, é quando você tende a render mais.</p></section></div></div>',
    1,
  );
function ws(u, T) {
  rt(T, !0);
  let v = W(Ae([])),
    k = W(Ae([])),
    g = W(Ae([])),
    N = W(Ae([])),
    B = W(1),
    C = W('available'),
    z = W('all'),
    Y = W('all');
  const de = ['common', 'rare', 'epic', 'legendary'];
  let ee = W(null),
    te = W(!1),
    V = W(null);
  const ye = Le(async () =>
      ((await L.tasks.toArray()) ?? []).sort((o, l) => {
        const i = o.createdAt ? new Date(o.createdAt).getTime() : 0;
        return (l.createdAt ? new Date(l.createdAt).getTime() : 0) - i;
      }),
    ),
    q = Le(() => L.areas.toArray()),
    Q = Le(() => L.xpLogs.toArray()),
    ae = Le(() => L.projects.toArray());
  st(() => {
    if (typeof window < 'u') {
      const m = new URL(window.location.href).searchParams.get('projectId');
      if (m) {
        const y = Number(m);
        Number.isFinite(y) && c(Y, y, !0);
      }
    }
    const r = ye.subscribe((n) => {
        (c(v, n ?? [], !0), K());
      }),
      o = q.subscribe((n) => c(k, n ?? [], !0)),
      l = Q.subscribe((n) => c(g, n ?? [], !0)),
      i = ae.subscribe((n) => {
        c(N, n ?? [], !0);
      });
    return (
      (async () => {
        try {
          const n = await Yt();
          c(B, n.goldMultiplier ?? 1, !0);
        } catch (n) {
          (console.error(
            'Erro ao carregar modificadores de gold (amuletos):',
            n,
          ),
            c(B, 1));
        }
      })(),
      () => {
        (r.unsubscribe(), o.unsubscribe(), l.unsubscribe(), i.unsubscribe());
      }
    );
  });
  const ce = j(() =>
      e(k).reduce((r, o) => (o.id && (r[o.id] = o.nome), r), { 0: 'Geral' }),
    ),
    we = j(() =>
      e(N).reduce((r, o) => (o.id != null && (r[o.id] = o.name), r), {}),
    ),
    Te = j(() =>
      e(N).filter((r) =>
        ['planejando', 'em_andamento', 'pausado'].includes(r.status),
      ),
    );
  function Re(r) {
    const l = r.currentTarget.value;
    c(Y, l === 'all' ? 'all' : Number(l), !0);
  }
  function Me() {
    if (!e(v).length) return null;
    const r = {};
    for (const n of e(v)) {
      if (n.archived) continue;
      const y = n.areaId ?? 0;
      let A = r[y];
      if (
        (A ||
          ((A = {
            completedCount: 0,
            pendingTasks: [],
            oldestPendingCreatedAt: Number.POSITIVE_INFINITY,
          }),
          (r[y] = A)),
        S(n) === 'completed')
      )
        A.completedCount += 1;
      else {
        A.pendingTasks.push(n);
        const x = n.createdAt,
          oe = x instanceof Date ? x.getTime() : new Date(x).getTime();
        oe < A.oldestPendingCreatedAt && (A.oldestPendingCreatedAt = oe);
      }
    }
    const o = Object.values(r).filter((n) => n.pendingTasks.length > 0);
    return o.length
      ? (o.sort((n, m) =>
          n.completedCount !== m.completedCount
            ? n.completedCount - m.completedCount
            : n.oldestPendingCreatedAt !== m.oldestPendingCreatedAt
              ? n.oldestPendingCreatedAt - m.oldestPendingCreatedAt
              : 0,
        ),
        [...o[0].pendingTasks].sort((n, m) => {
          const y = n.createdAt,
            A = m.createdAt,
            R = y instanceof Date ? y.getTime() : new Date(y).getTime(),
            x = A instanceof Date ? A.getTime() : new Date(A).getTime();
          return R - x;
        })[0] ?? null)
      : null;
  }
  const Oe = j(Me);
  function Ye(r) {
    const o = /^(\d{4})-(\d{2})-(\d{2})$/.exec(r);
    if (!o) return null;
    const l = +o[1],
      i = +o[2],
      n = +o[3];
    return new Date(l, i - 1, n);
  }
  function Ne(r) {
    const o = r.getFullYear(),
      l = String(r.getMonth() + 1).padStart(2, '0'),
      i = String(r.getDate()).padStart(2, '0');
    return `${o}-${l}-${i}`;
  }
  function _(r) {
    return !r || r <= 0
      ? 0
      : r <= 25
        ? 1
        : r <= 50
          ? 2
          : r <= 75
            ? 3
            : r <= 100
              ? 4
              : 4 + Math.floor((r - 100) / 50);
  }
  function D() {
    const r = {};
    for (const R of e(g)) {
      const x = R.date;
      r[x] = (r[x] ?? 0) + (R.amount ?? 0);
    }
    const o = new Date();
    let l = 0;
    const i = new Date(o.getFullYear(), o.getMonth(), o.getDate() - 6);
    for (let R = 6; R >= 0; R--) {
      const x = new Date(o.getFullYear(), o.getMonth(), o.getDate() - R),
        oe = Ne(x),
        pe = r[oe] ?? 0;
      l += pe;
    }
    let n = 0,
      m = 0;
    for (const R of e(g)) {
      const x = Ye(R.date);
      if (!x) continue;
      const oe = new Date(x.getFullYear(), x.getMonth(), x.getDate()),
        pe = new Date(o.getFullYear(), o.getMonth(), o.getDate());
      if (oe >= i && oe <= pe) {
        const je = R.amount ?? 0;
        je > 0 && (n++, (m += _(je)));
      }
    }
    const y = e(B) || 1,
      A = Math.floor(Math.max(0, l) * 0.5 * y);
    return { missions: n, xp: l, gold: A, food: m };
  }
  const P = j(D),
    O = [1, 3, 7, 14, 30];
  let I = W(null),
    J = W(7);
  function le(r) {
    return r ? r.reviewEnabled === !0 : !1;
  }
  function d(r) {
    c(I, r, !0);
    const l = Number(r.reviewIntervalDays ?? 7);
    c(J, O.includes(l) ? l : 7, !0);
  }
  function b() {
    c(I, null);
  }
  async function M() {
    if (!e(I)?.id) {
      c(I, null);
      return;
    }
    const r = new Date();
    (await L.tasks.update(e(I).id, {
      reviewEnabled: !0,
      reviewIntervalDays: e(J),
      reviewStartedAt: r,
    }),
      c(I, null));
  }
  async function F(r) {
    r?.id &&
      (await L.tasks.update(r.id, {
        reviewEnabled: !1,
        reviewIntervalDays: null,
        reviewStartedAt: null,
      }),
      c(I, null));
  }
  function H() {
    const r = [];
    for (const o of e(v)) {
      const l = o;
      if (l.archived || !l.reviewEnabled) continue;
      const i = Number(l.reviewIntervalDays ?? 0);
      if (!i || i <= 0) continue;
      const n = l.reviewStartedAt ?? o.createdAt;
      if (!n) continue;
      const m = n instanceof Date ? n : new Date(n);
      if (isNaN(m.getTime())) continue;
      const y = new Date(m.getFullYear(), m.getMonth(), m.getDate() + i);
      r.push({ task: o, intervalDays: i, nextReviewDate: y });
    }
    return (
      r.sort((o, l) => o.nextReviewDate.getTime() - l.nextReviewDate.getTime()),
      r
    );
  }
  const E = j(H);
  function G(r) {
    const o = String(r.getDate()).padStart(2, '0'),
      l = String(r.getMonth() + 1).padStart(2, '0');
    return `${o}/${l}`;
  }
  async function K() {
    const r = [...e(v)];
    if (!r.length) return;
    const o = new Date(),
      l = new Date(o.getFullYear(), o.getMonth(), o.getDate());
    for (const i of r) {
      if (!i.id) continue;
      const n = i;
      if (n.archived || !n.reviewEnabled) continue;
      const m = Number(n.reviewIntervalDays ?? 0);
      if (!m || m <= 0) continue;
      const y = n.reviewStartedAt ?? i.createdAt;
      if (!y) continue;
      const A = y instanceof Date ? y : new Date(y);
      if (isNaN(A.getTime())) continue;
      const R = new Date(A.getFullYear(), A.getMonth(), A.getDate() + m),
        x = S(i);
      x !== 'todo' &&
        R <= l &&
        x === 'available' &&
        (await L.tasks.update(i.id, { status: 'todo' }));
    }
  }
  const Z = {
      common: 'border-slate-600 text-slate-400',
      rare: 'border-blue-500 text-blue-400',
      epic: 'border-purple-500 text-purple-400',
      legendary: 'border-[#ffb74d] text-[#ffb74d]',
    },
    X = { common: 'Comum', rare: 'Rara', epic: 'Épica', legendary: 'Lendária' },
    be =
      'px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors',
    ue = {
      common: 'bg-slate-700 text-slate-100 border-slate-400',
      rare: 'bg-blue-500/20 text-blue-300 border-blue-400',
      epic: 'bg-purple-500/20 text-purple-300 border-purple-400',
      legendary: 'bg-[#ffb74d]/20 text-[#ffb74d] border-[#ffb74d]',
    },
    ke = {
      common: 'border-slate-600 text-slate-400 hover:bg-slate-800',
      rare: 'border-blue-500 text-blue-400 hover:bg-blue-950/40',
      epic: 'border-purple-500 text-purple-400 hover:bg-purple-950/40',
      legendary:
        'border-[#ffb74d] text-[#ffb74d] hover:bg[rgba(255,183,77,0.12)]',
    };
  function _e(r) {
    const o = e(ee) === r ? ue[r] : ke[r];
    return `${be} ${o}`;
  }
  function ie(r) {
    c(ee, e(ee) === r ? null : r, !0);
  }
  function S(r) {
    const o = r;
    return o.archived
      ? 'completed'
      : o.reviewEnabled === !0
        ? o.status === 'todo'
          ? 'todo'
          : o.status === 'completed'
            ? 'completed'
            : 'available'
        : r.completed || o.status === 'completed'
          ? 'completed'
          : o.status === 'todo'
            ? 'todo'
            : 'available';
  }
  let re = j(() =>
    (() => {
      const r = e(v)
        .filter((l) => !l.archived)
        .filter((l) => {
          const i = S(l);
          return e(C) === 'completed'
            ? i === 'completed'
            : e(C) === 'todo'
              ? i === 'todo'
              : i === 'available';
        })
        .filter((l) => (e(z) === 'all' ? !0 : l.areaId === e(z)))
        .filter((l) => (e(Y) === 'all' ? !0 : (l.projectId ?? null) === e(Y)))
        .filter((l) => (e(ee) ? l.rarity === e(ee) : !0));
      if (e(C) !== 'todo') return r;
      const o = [...r];
      return (
        o.sort((l, i) => {
          const n = l,
            m = i,
            y =
              typeof n.todoOrder == 'number'
                ? n.todoOrder
                : Number.MAX_SAFE_INTEGER,
            A =
              typeof m.todoOrder == 'number'
                ? m.todoOrder
                : Number.MAX_SAFE_INTEGER;
          if (y !== A) return y - A;
          const R =
              l.createdAt instanceof Date
                ? l.createdAt.getTime()
                : new Date(l.createdAt).getTime(),
            x =
              i.createdAt instanceof Date
                ? i.createdAt.getTime()
                : new Date(i.createdAt).getTime();
          return R - x;
        }),
        o
      );
    })(),
  );
  async function Be(r) {
    if (!r) return;
    const o = e(v).find((m) => m.id === r);
    if (!o) return;
    const l = o,
      i = new Date(),
      n = typeof l.projectId == 'number' ? l.projectId : null;
    if (l.reviewEnabled) {
      (await Ft.addXp(o.xp, o.areaId ?? null),
        await L.tasks.update(r, {
          completed: !0,
          status: 'available',
          completedAt: i,
          updatedAt: i,
          reviewStartedAt: i,
        }),
        await ua());
      return;
    }
    o.completed ||
      (await L.tasks.update(r, {
        completed: !0,
        status: 'completed',
        completedAt: i,
        updatedAt: i,
      }),
      await Ft.addXp(o.xp, o.areaId ?? null),
      n != null && (await dr(n)),
      await ua());
  }
  async function ze(r) {
    if (!r.id) return;
    const o = S(r);
    if (o === 'completed') return;
    const l = r,
      i = o === 'todo' ? 'available' : 'todo',
      n = { status: i };
    if (i === 'todo' && typeof l.todoOrder != 'number') {
      const y = e(v)
        .filter((A) => !A.archived && S(A) === 'todo')
        .reduce((A, R) => {
          const x = R.todoOrder;
          return typeof x == 'number' && x > A ? x : A;
        }, 0);
      n.todoOrder = y + 1;
    }
    await L.tasks.update(r.id, n);
  }
  async function qe(r, o) {
    if (!r.id || S(r) !== 'todo') return;
    const l = e(v)
      .filter((x) => !x.archived && S(x) === 'todo')
      .slice();
    l.sort((x, oe) => {
      const pe = x,
        je = oe,
        $e =
          typeof pe.todoOrder == 'number'
            ? pe.todoOrder
            : Number.MAX_SAFE_INTEGER,
        Ve =
          typeof je.todoOrder == 'number'
            ? je.todoOrder
            : Number.MAX_SAFE_INTEGER;
      if ($e !== Ve) return $e - Ve;
      const tt =
          x.createdAt instanceof Date
            ? x.createdAt.getTime()
            : new Date(x.createdAt).getTime(),
        Se =
          oe.createdAt instanceof Date
            ? oe.createdAt.getTime()
            : new Date(oe.createdAt).getTime();
      return tt - Se;
    });
    const i = l.findIndex((x) => x.id === r.id);
    if (i === -1) return;
    const n = o === 'up' ? i - 1 : i + 1;
    if (n < 0 || n >= l.length) return;
    const m = l[i],
      y = l[n],
      A = typeof m.todoOrder == 'number' ? m.todoOrder : i,
      R = typeof y.todoOrder == 'number' ? y.todoOrder : n;
    await L.transaction('rw', L.tasks, async () => {
      (await L.tasks.update(l[i].id, { todoOrder: R }),
        await L.tasks.update(l[n].id, { todoOrder: A }));
    });
  }
  function Ge() {
    (c(V, null), c(te, !0));
  }
  function nt(r) {
    (c(V, r, !0), c(te, !0));
  }
  function Ke() {
    (c(te, !1), c(V, null));
  }
  async function Ze(r) {
    if (!r.id) return;
    const o = r;
    if (S(r) !== 'completed') return;
    const i = o.reviewEnabled === !0,
      n = new Date();
    !i && r.xp && r.xp > 0 && (await Ft.removeXp(r.xp, r.areaId ?? null));
    const m = { status: 'available', archived: !1, updatedAt: n };
    (i || ((m.completed = !1), (m.completedAt = null)),
      await L.tasks.update(r.id, m));
  }
  async function et(r) {
    if (r.id && confirm(`Tem certeza que deseja apagar a missão "${r.title}"?`))
      try {
        await L.tasks.update(r.id, { archived: !0 });
      } catch (o) {
        (console.error('Erro ao arquivar missão:', o),
          alert('Falha ao excluir missão.'));
      }
  }
  const Ie = j(() =>
    (() => {
      if (!e(g).length) return '—';
      const r = [0, 0, 0, 0, 0, 0, 0];
      for (const i of e(g)) {
        const n = Ye(i.date);
        n && (r[n.getDay()] += i.amount ?? 0);
      }
      const o = [
        'Domingo',
        'Segunda',
        'Terça',
        'Quarta',
        'Quinta',
        'Sexta',
        'Sábado',
      ];
      let l = 0;
      for (let i = 1; i < 7; i++) r[i] > r[l] && (l = i);
      return r[l] === 0 ? '—' : o[l];
    })(),
  );
  var ve = ds(),
    h = Je(ve);
  {
    var se = (r) => {
      wr(r, {
        get taskToEdit() {
          return e(V);
        },
        close: Ke,
      });
    };
    me(h, (r) => {
      e(te) && r(se);
    });
  }
  var p = s(h, 2);
  {
    var he = (r) => {
      var o = Qr(),
        l = a(o),
        i = a(l),
        n = a(i),
        m = s(a(n), 2),
        y = a(m, !0);
      (t(m), t(n));
      var A = s(n, 2);
      ((A.__click = b), t(i));
      var R = s(i, 4);
      (Pe(
        R,
        20,
        () => O,
        (Se) => Se,
        (Se, Ee) => {
          var He = Gr();
          He.__click = () => c(J, Ee, !0);
          var jt = a(He);
          (t(He),
            U(() => {
              (Ce(
                He,
                1,
                `rounded-full px-3 py-1.5 text-xs border transition-colors ${e(J) === Ee ? 'border-sky-400 bg-sky-500/20 text-sky-100' : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-sky-400/80 hover:text-sky-100'}`,
              ),
                f(
                  jt,
                  `${Ee ?? ''}
            ${Ee === 1 ? ' dia' : ' dias'}`,
                ));
            }),
            w(Se, He));
        },
      ),
        t(R));
      var x = s(R, 2),
        oe = a(x);
      {
        var pe = (Se) => {
            var Ee = Br();
            ((Ee.__click = () => F(e(I))), w(Se, Ee));
          },
          je = (Se) => {
            var Ee = zr();
            w(Se, Ee);
          };
        me(oe, (Se) => {
          le(e(I)) ? Se(pe) : Se(je, !1);
        });
      }
      var $e = s(oe, 2),
        Ve = a($e);
      Ve.__click = b;
      var tt = s(Ve, 2);
      ((tt.__click = M),
        t($e),
        t(x),
        t(l),
        t(o),
        U(() => f(y, e(I).title)),
        w(r, o));
    };
    me(p, (r) => {
      e(I) && r(he);
    });
  }
  var fe = s(p, 2),
    De = a(fe);
  cr(De, {
    title: 'Quadro de Missões',
    subtitle:
      'Complete tarefas para ganhar XP, manter a chama da consistência acesa e evoluir seu herói!',
    iconSrc: '/art/icones/icon-missoes.png',
    align: 'center',
  });
  var Qe = s(De, 2);
  Fr(Qe, {});
  var Ue = s(Qe, 2);
  {
    var We = (r) => {
      const o = j(() => e(Oe));
      var l = Wr(),
        i = a(l),
        n = s(a(i), 2),
        m = s(a(n), 2),
        y = a(m, !0);
      t(m);
      var A = s(m, 2),
        R = s(a(A)),
        x = a(R, !0);
      (t(R), Fe(), t(A), t(n), t(i));
      var oe = s(i, 2),
        pe = a(oe),
        je = a(pe);
      t(pe);
      var $e = s(pe, 2);
      (($e.__click = () => {
        (c(z, e(o).areaId ?? 'all', !0), c(C, 'available'));
      }),
        t(oe),
        t(l),
        U(() => {
          (f(y, e(o).title),
            f(x, e(ce)[e(o).areaId ?? 0] ?? 'Geral'),
            f(je, `+${e(o).xp ?? ''} XP`));
        }),
        w(r, l));
    };
    me(Ue, (r) => {
      e(Oe) && r(We);
    });
  }
  var Xe = s(Ue, 2),
    dt = s(a(Xe), 2),
    pt = a(dt),
    qt = s(a(pt), 2),
    ga = a(qt, !0);
  (t(qt), t(pt));
  var mt = s(pt, 2),
    Gt = s(a(mt), 2),
    _a = a(Gt, !0);
  (t(Gt), t(mt));
  var ft = s(mt, 2),
    Bt = s(a(ft), 2),
    ha = a(Bt);
  (Fe(), t(Bt), t(ft));
  var zt = s(ft, 2),
    Qt = s(a(zt), 2),
    ya = a(Qt);
  (Fe(), t(Qt), t(zt), t(dt), t(Xe));
  var Wt = s(Xe, 2),
    bt = a(Wt),
    Vt = a(bt);
  jr(Vt, {});
  var wa = s(Vt, 2);
  (qr(wa, {}), t(bt));
  var xt = s(bt, 2),
    gt = a(xt),
    Ht = s(a(gt), 2),
    ka = a(Ht);
  (t(Ht), t(gt));
  var Da = s(gt, 2);
  {
    var Sa = (r) => {
        var o = Vr();
        w(r, o);
      },
      Aa = (r) => {
        var o = Ur();
        (Pe(
          o,
          21,
          () => e(E),
          (l) => l.task.id,
          (l, i) => {
            const n = j(() => e(i).task);
            var m = Hr(),
              y = a(m),
              A = a(y),
              R = a(A, !0);
            t(A);
            var x = s(A, 2),
              oe = a(x);
            t(x);
            var pe = s(x, 2),
              je = a(pe);
            (t(pe), t(y));
            var $e = s(y, 2);
            (($e.__click = () => {
              (c(z, e(n).areaId ?? 'all', !0), c(C, S(e(n)), !0));
            }),
              t(m),
              U(
                (Ve) => {
                  (f(R, e(n).title),
                    f(oe, `Área: ${e(ce)[e(n).areaId ?? 0] ?? 'Geral' ?? ''}`),
                    f(
                      je,
                      `Revisar a cada ${e(i).intervalDays ?? ''}
                  ${e(i).intervalDays === 1 ? ' dia' : ' dias'} • Próxima revisão:
                  ${Ve ?? ''}`,
                    ));
                },
                [() => G(e(i).nextReviewDate)],
              ),
              w(l, m));
          },
        ),
          t(o),
          w(r, o));
      };
    me(Da, (r) => {
      e(E).length === 0 ? r(Sa) : r(Aa, !1);
    });
  }
  t(xt);
  var _t = s(xt, 2),
    ht = a(_t),
    Ut = a(ht);
  xr(Ut, {
    get selectedId() {
      return e(z);
    },
    set selectedId(r) {
      c(z, r, !0);
    },
  });
  var yt = s(Ut, 2),
    Ta = a(yt);
  {
    var Ma = (r) => {
      var o = Jr(),
        l = s(a(o)),
        i = a(l, !0);
      (t(l), t(o), U(() => f(i, X[e(ee)])), w(r, o));
    };
    me(Ta, (r) => {
      e(ee) && r(Ma);
    });
  }
  t(yt);
  var ja = s(yt, 2);
  {
    var $a = (r) => {
      var o = Kr();
      ((o.__click = () => c(ee, null)), w(r, o));
    };
    me(ja, (r) => {
      e(ee) && r($a);
    });
  }
  t(ht);
  var wt = s(ht, 2);
  (Pe(
    wt,
    20,
    () => de,
    (r) => r,
    (r, o) => {
      var l = Zr();
      l.__click = () => ie(o);
      var i = a(l, !0);
      (t(l),
        U(
          (n) => {
            (Ce(l, 1, n),
              xe(l, 'aria-pressed', e(ee) === o),
              xe(l, 'aria-label', `Filtrar por raridade ${X[o]}`),
              f(i, X[o]));
          },
          [() => nr(_e(o))],
        ),
        w(r, l));
    },
  ),
    t(wt));
  var Jt = s(wt, 2),
    ct = s(a(Jt), 2);
  ct.__change = Re;
  var kt = a(ct);
  kt.value = kt.__value = 'all';
  var Ca = s(kt);
  (Pe(
    Ca,
    17,
    () => e(Te),
    (r) => r.id,
    (r, o) => {
      var l = da(),
        i = Je(l);
      {
        var n = (m) => {
          var y = es(),
            A = a(y, !0);
          t(y);
          var R = {};
          (U(() => {
            (f(A, e(o).name),
              R !== (R = e(o).id) && (y.value = (y.__value = e(o).id) ?? ''));
          }),
            w(m, y));
        };
        me(i, (m) => {
          e(o).id && m(n);
        });
      }
      w(r, l);
    },
  ),
    t(ct));
  var Pa = s(ct, 2);
  {
    var Ia = (r) => {
      var o = ts();
      ((o.__click = () => c(Y, 'all')), w(r, o));
    };
    me(Pa, (r) => {
      e(Y) !== 'all' && r(Ia);
    });
  }
  (t(Jt), t(_t));
  var Dt = s(_t, 2),
    St = a(Dt),
    At = a(St);
  At.__click = () => c(C, 'available');
  var Tt = s(At, 2);
  Tt.__click = () => c(C, 'todo');
  var Kt = s(Tt, 2);
  ((Kt.__click = () => c(C, 'completed')), t(St));
  var Ea = s(St, 2);
  ((Ea.__click = Ge), t(Dt));
  var Mt = s(Dt, 2),
    Fa = a(Mt);
  {
    var Ra = (r) => {
        var o = as(),
          l = s(a(o), 2);
        ((l.__click = Ge), t(o), w(r, o));
      },
      Na = (r) => {
        var o = da(),
          l = Je(o);
        (Pe(
          l,
          17,
          () => e(re),
          (i) => i.id,
          (i, n) => {
            var m = is(),
              y = a(m);
            y.__click = () => Be(e(n).id);
            var A = a(y);
            {
              var R = (ne) => {
                var ge = sr('✓');
                w(ne, ge);
              };
              me(A, (ne) => {
                S(e(n)) === 'completed' && ne(R);
              });
            }
            t(y);
            var x = s(y, 2),
              oe = a(x),
              pe = a(oe),
              je = a(pe, !0);
            t(pe);
            var $e = s(pe, 2),
              Ve = a($e, !0);
            t($e);
            var tt = s($e, 2);
            {
              var Se = (ne) => {
                var ge = rs(),
                  at = a(ge, !0);
                (t(ge), U(() => f(at, e(we)[e(n).projectId])), w(ne, ge));
              };
              me(tt, (ne) => {
                e(n).projectId && e(we)[e(n).projectId] && ne(Se);
              });
            }
            var Ee = s(tt, 2);
            ((Ee.__click = () => ze(e(n))), t(oe));
            var He = s(oe, 2),
              jt = a(He, !0);
            (t(He), t(x));
            var $t = s(x, 2),
              Ct = a($t),
              ta = s(a(Ct), 2),
              La = a(ta);
            (t(ta), t(Ct));
            var Pt = s(Ct, 2),
              aa = s(a(Pt), 2),
              Oa = a(aa);
            (t(aa), t(Pt));
            var ra = s(Pt, 2),
              sa = s(a(ra), 2),
              Ya = a(sa);
            (t(sa), t(ra), t($t));
            var oa = s($t, 2),
              na = a(oa);
            {
              var qa = (ne) => {
                var ge = ss(),
                  at = Je(ge);
                at.__click = () => qe(e(n), 'up');
                var It = s(at, 2);
                ((It.__click = () => qe(e(n), 'down')), w(ne, ge));
              };
              me(na, (ne) => {
                S(e(n)) === 'todo' && ne(qa);
              });
            }
            var ut = s(na, 2);
            ut.__click = () => d(e(n));
            var Ga = a(ut);
            {
              var Ba = (ne) => {
                  var ge = os();
                  w(ne, ge);
                },
                za = (ne) => {
                  var ge = ns();
                  w(ne, ge);
                };
              me(Ga, (ne) => {
                le(e(n)) ? ne(Ba) : ne(za, !1);
              });
            }
            t(ut);
            var la = s(ut, 2);
            la.__click = () => nt(e(n));
            var ia = s(la, 2);
            {
              var Qa = (ne) => {
                var ge = ls();
                ((ge.__click = () => Ze(e(n))), w(ne, ge));
              };
              me(ia, (ne) => {
                S(e(n)) === 'completed' && ne(Qa);
              });
            }
            var Wa = s(ia, 2);
            ((Wa.__click = () => et(e(n))),
              t(oa),
              t(m),
              U(
                (ne, ge, at, It, Va, Ha) => {
                  (Ce(
                    m,
                    1,
                    `group flex items-center gap-4 p-4 bg-slate-900/80 border rounded-xl transition-colors ${Z[e(n).rarity] ?? ''} ${ne ?? ''}`,
                  ),
                    Ce(
                      y,
                      1,
                      `shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all
                ${ge ?? ''}`,
                    ),
                    Ce(
                      pe,
                      1,
                      `text-xs font-bold uppercase tracking-wider opacity-70 ${Z[e(n).rarity] ?? ''}`,
                    ),
                    f(je, X[e(n).rarity]),
                    f(Ve, e(ce)[e(n).areaId ?? 0] || 'Sem Área'),
                    Ce(
                      Ee,
                      1,
                      `text-[0.65rem] px-2 py-0.5 rounded-full border transition-colors ${at ?? ''}`,
                    ),
                    Ce(
                      He,
                      1,
                      `text-slate-100 font-medium break-words whitespace-pre-line ${It ?? ''}`,
                    ),
                    f(jt, e(n).title),
                    f(La, `+${e(n).xp ?? ''} XP`),
                    f(Oa, `+${Va ?? ''} Gold`),
                    f(Ya, `+${Ha ?? ''} Comida`));
                },
                [
                  () =>
                    S(e(n)) === 'completed'
                      ? 'opacity-50 grayscale'
                      : 'shadow-md',
                  () =>
                    S(e(n)) === 'completed'
                      ? 'bg-green-500/20 border-green-500 text-green-500'
                      : 'border-slate-600 hover:border-[#ffb74d] text-transparent',
                  () =>
                    S(e(n)) === 'todo'
                      ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                      : 'border-slate-600 text-slate-400 hover:border-emerald-400 hover:text-emerald-300',
                  () => (S(e(n)) === 'completed' ? 'line-through' : ''),
                  () => Math.floor(e(n).xp * 0.5 * (e(B) || 1)),
                  () => _(e(n).xp),
                ],
              ),
              w(i, m));
          },
        ),
          w(r, o));
      };
    me(Fa, (r) => {
      e(re).length === 0 ? r(Ra) : r(Na, !1);
    });
  }
  t(Mt);
  var Zt = s(Mt, 2),
    ea = s(a(Zt), 2),
    Xa = a(ea, !0);
  (t(ea),
    Fe(2),
    t(Zt),
    t(Wt),
    t(fe),
    U(() => {
      (f(ga, e(P).missions),
        f(_a, e(P).xp),
        f(ha, `${e(P).gold ?? ''} `),
        f(ya, `${e(P).food ?? ''} `),
        f(
          ka,
          `${e(E).length ?? ''}
          ${e(E).length === 1 ? ' missão' : ' missões'}`,
        ),
        Ce(
          At,
          1,
          `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${e(C) === 'available' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/40' : 'text-slate-400 hover:bg-slate-800'}`,
        ),
        Ce(
          Tt,
          1,
          `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${e(C) === 'todo' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'text-slate-400 hover:bg-slate-800'}`,
        ),
        Ce(
          Kt,
          1,
          `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${e(C) === 'completed' ? 'bg-[#ffb74d]/20 text-[#ffb74d] border border-[#ffb74d]/50' : 'text-slate-400 hover:bg-slate-800'}`,
        ),
        f(Xa, e(Ie)));
    }),
    w(u, ve),
    ot());
}
vt(['click', 'change']);
export { ws as component };
