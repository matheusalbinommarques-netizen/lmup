const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f || (m.f = ['../chunks/Byx6IEAp.js', '../chunks/BwBkY9_K.js']),
) => i.map((i) => d[i]);
import { d as ce, f as ue, a as me, s as X } from '../chunks/SxYe2BIq.js';
import {
  p as pe,
  Z as xe,
  _ as d,
  s as r,
  m as t,
  t as ve,
  a as be,
  $ as g,
  c as a,
  r as s,
  a0 as fe,
} from '../chunks/BPaWsL2e.js';
import { c as p, s as x, a as P } from '../chunks/CtSESMLm.js';
import { _ as ge, b as we } from '../chunks/fHmphQVd.js';
import { d as m } from '../chunks/BwBkY9_K.js';
async function ye() {
  const [v, w] = await Promise.all([m.areas.toArray(), m.items.toArray()]),
    i = {
      version: 1,
      exportedAt: new Date().toISOString(),
      areas: v,
      items: w,
    },
    n = new Blob([JSON.stringify(i, null, 2)], {
      type: 'application/json;charset=utf-8',
    }),
    l = await ge(
      () => import('../chunks/Byx6IEAp.js').then((u) => u.F),
      __vite__mapDeps([0, 1]),
      import.meta.url,
    ),
    c = l.saveAs || (l.default && l.default.saveAs);
  if (!c) {
    console.error('Não foi possível carregar saveAs de file-saver');
    return;
  }
  c(n, 'lmup-backup.json');
}
async function _e(v) {
  const w = await v.text();
  let i;
  try {
    i = JSON.parse(w);
  } catch (c) {
    throw (
      console.error('Erro ao parsear backup:', c),
      new Error('Arquivo de backup inválido')
    );
  }
  if (!i || typeof i != 'object') throw new Error('Arquivo de backup inválido');
  const n = Array.isArray(i.areas) ? i.areas : [],
    l = Array.isArray(i.items) ? i.items : [];
  await m.transaction('rw', m.areas, m.items, async () => {
    (await Promise.all([m.areas.clear(), m.items.clear()]),
      n.length && (await m.areas.bulkAdd(n)),
      l.length && (await m.items.bulkAdd(l)));
  });
}
var he =
  ue(`<section class="w-full mb-8"><div class="config-card mx-auto max-w-3xl overflow-hidden relative"><div class="pointer-events-none absolute -inset-px bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.35),_transparent_60%)] opacity-70" aria-hidden="true"></div> <div class="relative px-6 pt-6 pb-7 md:px-8 md:pt-8 md:pb-8"><header class="mb-6"><div class="settings-subcard rounded-2xl border border-sky-500/60 bg-gradient-to-r from-sky-950 via-slate-900 to-slate-950 px-4 py-4 text-center shadow-[0_0_40px_rgba(56,189,248,0.55)]"><h2 class="text-2xl md:text-3xl font-extrabold text-sky-50">Configurações &amp; Backup</h2> <p class="mx-auto mt-2 max-w-xl text-xs text-slate-200/85">Guarde seu progresso em segurança, restaure seus dados quando
            precisar e ative encantamentos para deixar a experiência mais
            confortável.</p></div></header> <div class="settings-subcard mb-6 flex flex-col gap-3 rounded-2xl border border-violet-500/60 bg-gradient-to-r from-violet-950 via-slate-900 to-slate-950 px-4 py-3 shadow-[0_0_40px_rgba(168,85,247,0.55)] md:flex-row md:items-center md:justify-between"><div class="flex items-start gap-3"><div class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/25 text-violet-100">🕯️</div> <div><div class="flex items-center gap-2"><p class="text-sm font-semibold text-white">Encantamento sombrio</p> <span class="rounded-full border border-violet-300/70 bg-violet-500/15 px-2 py-[1px] text-[0.6rem] font-semibold uppercase tracking-widest text-violet-100">Em breve</span></div> <p class="text-xs text-slate-300/80 max-w-md">Encanta o seu reino com as trevas ou com a luz. Use com cuidado.</p></div></div> <button type="button" role="switch" aria-label="Ativar ou desativar encantamento sombrio"><span></span></button></div> <div class="space-y-3"><div class="settings-subcard flex flex-col gap-3 rounded-2xl border border-violet-500/60 bg-gradient-to-r from-violet-950 via-slate-900 to-slate-950 px-4 py-4 shadow-[0_0_40px_rgba(168,85,247,0.55)] md:flex-row md:items-center md:justify-between"><div class="flex items-start gap-3"><div class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/20 text-violet-200">📜</div> <div><div class="flex items-center gap-2"><p class="text-sm font-semibold text-white">Grimório de backup</p> <span class="rounded-full border border-violet-400/60 bg-violet-500/10 px-2 py-[1px] text-[0.6rem] font-semibold uppercase tracking-widest text-violet-200">Raro</span></div> <p class="text-xs text-slate-300/80 max-w-md">Aprisiona as memórias do seu reino num grimório em <code>.json</code>, para que possa levar e restaurar em qualquer lugar.</p></div></div> <button type="button" class="rounded-full bg-violet-500 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-violet-400 disabled:opacity-60"> </button></div> <div class="settings-subcard flex flex-col gap-3 rounded-2xl border border-emerald-500/60 bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-950 px-4 py-4 shadow-[0_0_40px_rgba(16,185,129,0.55)] md:flex-row md:items-center md:justify-between"><div class="flex items-start gap-3"><div class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-200">🧪</div> <div><div class="flex items-center gap-2"><p class="text-sm font-semibold text-white">Ritual de restauração</p> <span class="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-2 py-[1px] text-[0.6rem] font-semibold uppercase tracking-widest text-emerald-200">Épico</span></div> <p class="text-xs text-slate-300/80 max-w-md">Importe um grimório em <code>.json</code> criado por um herói, para
                trazer de volta as memórias de seu reino, com suas áreas, missões
                e XP.</p> <p class="mt-1 text-[0.65rem] text-amber-200/80">Atenção: este ritual substituirá o reino atual pelo do grimório
                utilizado. E este será jogado em trevas sombrias e ranger de
                dentes!.</p></div></div> <button type="button" class="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md hover:bg-emerald-400 disabled:opacity-60"> </button> <input type="file" accept="application/json" class="hidden"/></div> <div class="settings-subcard flex flex-col gap-3 rounded-2xl border border-sky-500/60 bg-gradient-to-r from-sky-950 via-slate-900 to-slate-950 px-4 py-4 shadow-[0_0_40px_rgba(56,189,248,0.55)] md:flex-row md:items-center md:justify-between"><div class="flex items-start gap-3"><div class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/25 text-sky-200">☁️</div> <div class="flex-1"><div class="flex items-center gap-2"><p class="text-sm font-semibold text-white">Sincronia estelar</p> <span class="rounded-full border border-sky-400/60 bg-sky-500/15 px-2 py-[1px] text-[0.6rem] font-semibold uppercase tracking-widest text-sky-200">Em breve</span></div> <p class="text-xs text-slate-200/85 max-w-md">Futuramente você poderá sincronizar seu reino com as estrelas e
                o cosmos, para nunca perder o seu reino e legado de aprendizado
                e desenvolvimento.</p></div></div> <button type="button" class="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md hover:bg-sky-400 disabled:opacity-60" disabled title="Sincronização com a nuvem será habilitada em breve">Sincronizar</button></div></div> <div class="my-6 h-px bg-gradient-to-r from-transparent via-slate-600/60 to-transparent"></div> <div class="space-y-4"><div class="rounded-2xl border border-emerald-500/70 bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-900 px-4 py-4 text-center shadow-[0_0_45px_rgba(16,185,129,0.85)]"><h2 class="text-2xl md:text-3xl font-extrabold text-emerald-100">Neurodiversidade</h2> <p class="mx-auto mt-2 max-w-xl text-xs text-emerald-50/80">Ajustes suaves para foco, legibilidade e redução de estímulos
            visuais. Pense nisso como encantamentos opcionais para o seu
            cérebro.</p></div> <div class="neuro-card flex items-center justify-between rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 px-4 py-3"><div><p class="text-sm font-semibold text-white">Modo foco</p> <p class="text-xs text-slate-300/80 max-w-md">Reduz brilhos e sombras intensas para diminuir distrações visuais.</p></div> <button type="button" role="switch" aria-label="Ativar ou desativar modo foco"><span></span></button></div> <div class="neuro-card flex items-center justify-between rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 px-4 py-3"><div><p class="text-sm font-semibold text-white">Texto maior</p> <p class="text-xs text-slate-300/80 max-w-md">Aumenta levemente o tamanho base das fontes para leitura mais
              confortável.</p></div> <button type="button" role="switch" aria-label="Ativar ou desativar texto maior"><span></span></button></div> <div class="neuro-card flex items-center justify-between rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 px-4 py-3"><div><p class="text-sm font-semibold text-white">Estímulos suaves</p> <p class="text-xs text-slate-300/80 max-w-md">Encurta animações e transições para que nada fique piscando por
              muito tempo na tela.</p></div> <button type="button" role="switch" aria-label="Ativar ou desativar estímulos suaves"><span></span></button></div></div></div></div></section>`);
function ke(v, w) {
  pe(w, !0);
  const i = 'lmup:neuro-prefs';
  let n = g(!1),
    l = g(!1),
    c = g(!1),
    u = g(!1),
    b = g(!1),
    f = g(!1),
    y = null;
  function j() {
    return { focusMode: t(u), largeText: t(b), lowStimulus: t(f) };
  }
  function S(e) {
    const o = document.documentElement;
    ((o.dataset.neuroFocus = e.focusMode ? 'true' : 'false'),
      (o.dataset.neuroLargeText = e.largeText ? 'true' : 'false'),
      (o.dataset.neuroLowStimulus = e.lowStimulus ? 'true' : 'false'));
  }
  function T(e) {
    localStorage.setItem(i, JSON.stringify(e));
  }
  xe(() => {
    const e = localStorage.getItem(i);
    if (e)
      try {
        const o = JSON.parse(e);
        (d(u, !!o.focusMode), d(b, !!o.largeText), d(f, !!o.lowStimulus));
      } catch {}
    S(j());
  });
  function Y() {
    d(u, !t(u));
    const e = j();
    (S(e), T(e));
  }
  function Z() {
    d(b, !t(b));
    const e = j();
    (S(e), T(e));
  }
  function $() {
    d(f, !t(f));
    const e = j();
    (S(e), T(e));
  }
  async function H() {
    if (!t(n)) {
      d(n, !0);
      try {
        await ye();
      } catch (e) {
        (console.error(e), alert('Erro ao exportar dados. Tente novamente.'));
      } finally {
        d(n, !1);
      }
    }
  }
  function Q() {
    t(l) || (y && ((y.value = ''), y.click()));
  }
  async function W(e) {
    const o = e.target;
    if (!o.files || o.files.length === 0) return;
    const L = o.files[0];
    d(l, !0);
    try {
      (await _e(L),
        (o.value = ''),
        alert(
          'Backup importado com sucesso! Recarregue a página para ver as mudanças.',
        ));
    } catch (J) {
      (console.error(J),
        alert(
          'Erro ao importar backup. Verifique o arquivo .json e tente novamente.',
        ));
    } finally {
      d(l, !1);
    }
  }
  function q(e) {
    return e
      ? 'inline-flex h-7 w-12 items-center rounded-full bg-emerald-400/90 px-1 transition-colors'
      : 'inline-flex h-7 w-12 items-center rounded-full bg-slate-700/80 px-1 transition-colors';
  }
  function I(e) {
    return e
      ? 'h-5 w-5 translate-x-5 rounded-full bg-slate-950 shadow transition-transform'
      : 'h-5 w-5 translate-x-0 rounded-full bg-slate-300 shadow transition-transform';
  }
  var z = he(),
    B = a(z),
    C = r(a(B), 2),
    M = r(a(C), 2),
    _ = r(a(M), 2);
  _.__click = () => d(c, !t(c));
  var ee = a(_);
  (s(_), s(M));
  var O = r(M, 2),
    R = a(O),
    N = r(a(R), 2);
  N.__click = H;
  var te = a(N, !0);
  (s(N), s(R));
  var G = r(R, 2),
    h = r(a(G), 2);
  h.__click = Q;
  var ae = a(h, !0);
  s(h);
  var U = r(h, 2);
  ((U.__change = W),
    we(
      U,
      (e) => (y = e),
      () => y,
    ),
    s(G),
    fe(2),
    s(O));
  var V = r(O, 4),
    D = r(a(V), 2),
    k = r(a(D), 2);
  k.__click = Y;
  var se = a(k);
  (s(k), s(D));
  var F = r(D, 2),
    A = r(a(F), 2);
  A.__click = Z;
  var re = a(A);
  (s(A), s(F));
  var K = r(F, 2),
    E = r(a(K), 2);
  E.__click = $;
  var oe = a(E);
  (s(E),
    s(K),
    s(V),
    s(C),
    s(B),
    s(z),
    ve(
      (e, o, L, J, ie, le, de, ne) => {
        (x(_, 1, e),
          P(_, 'aria-checked', t(c)),
          x(ee, 1, o),
          (N.disabled = t(n)),
          X(te, t(n) ? 'Gerando...' : 'Exportar dados'),
          (h.disabled = t(l)),
          X(ae, t(l) ? 'Importando...' : 'Importar backup'),
          x(k, 1, L),
          P(k, 'aria-checked', t(u)),
          x(se, 1, J),
          x(A, 1, ie),
          P(A, 'aria-checked', t(b)),
          x(re, 1, le),
          x(E, 1, de),
          P(E, 'aria-checked', t(f)),
          x(oe, 1, ne));
      },
      [
        () => p(q(t(c))),
        () => p(I(t(c))),
        () => p(q(t(u))),
        () => p(I(t(u))),
        () => p(q(t(b))),
        () => p(I(t(b))),
        () => p(q(t(f))),
        () => p(I(t(f))),
      ],
    ),
    me(v, z),
    be());
}
ce(['click', 'change']);
function Ie(v) {
  ke(v, {});
}
export { Ie as component };
