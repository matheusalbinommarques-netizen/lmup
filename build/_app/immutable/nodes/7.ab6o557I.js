import '../chunks/DsnmJJEf.js';
import {
  s as B,
  a as ye,
  u as de,
  g as t,
  b as h,
  i as ie,
  v as ge,
  p as he,
  f as _,
  h as n,
  r as a,
  j as b,
  n as xe,
  t as J,
  k as x,
  l as k,
  d as m,
  e as _e,
  q as we,
  m as Ie,
  w as ce,
  o as ue,
} from '../chunks/C4tos-D-.js';
import { p as M, i as P } from '../chunks/D7NEdK74.js';
import { e as pe } from '../chunks/BYKdWbGi.js';
import { a as le, s as fe } from '../chunks/B28y5Mvi.js';
import { S as ke, g as ve, i as ne } from '../chunks/Cxxjmckw.js';
import { d as c, l as be } from '../chunks/CUrLQr9X.js';
import { P as Se } from '../chunks/CpUvk0iO.js';
var qe = ['forEach', 'isDisjointFrom', 'isSubsetOf', 'isSupersetOf'],
  Ce = ['difference', 'intersection', 'symmetricDifference', 'union'],
  me = !1;
class W extends Set {
  #r = new Map();
  #e = B(0);
  #t = B(0);
  #a = de || -1;
  constructor(e) {
    if ((super(), e)) {
      for (var o of e) super.add(o);
      this.#t.v = super.size;
    }
    me || this.#o();
  }
  #s(e) {
    return de === this.#a ? B(e) : ye(e);
  }
  #o() {
    me = !0;
    var e = W.prototype,
      o = Set.prototype;
    for (const l of qe)
      e[l] = function (...d) {
        return (t(this.#e), o[l].apply(this, d));
      };
    for (const l of Ce)
      e[l] = function (...d) {
        t(this.#e);
        var y = o[l].apply(this, d);
        return new W(y);
      };
  }
  has(e) {
    var o = super.has(e),
      l = this.#r,
      d = l.get(e);
    if (d === void 0) {
      if (!o) return (t(this.#e), !1);
      ((d = this.#s(!0)), l.set(e, d));
    }
    return (t(d), o);
  }
  add(e) {
    return (
      super.has(e) || (super.add(e), h(this.#t, super.size), ie(this.#e)),
      this
    );
  }
  delete(e) {
    var o = super.delete(e),
      l = this.#r,
      d = l.get(e);
    return (
      d !== void 0 && (l.delete(e), h(d, !1)),
      o && (h(this.#t, super.size), ie(this.#e)),
      o
    );
  }
  clear() {
    if (super.size !== 0) {
      super.clear();
      var e = this.#r;
      for (var o of e.values()) h(o, !1);
      (e.clear(), h(this.#t, 0), ie(this.#e));
    }
  }
  keys() {
    return this.values();
  }
  values() {
    return (t(this.#e), super.values());
  }
  entries() {
    return (t(this.#e), super.entries());
  }
  [Symbol.iterator]() {
    return this.keys();
  }
  get size() {
    return t(this.#t);
  }
}
var Ee =
    _(`<span class="rounded-full border border-emerald-500/60 bg-emerald-500/15
               px-2 py-[2px] text-[0.65rem] text-emerald-300"><!></span>`),
  je = _(`<span class="rounded-full border border-slate-700 bg-slate-800
               px-2 py-[2px] text-[0.65rem] text-slate-400">Em breve</span>`),
  Ge =
    _(`<div class="mb-3 flex justify-center"><div class="h-14 w-14 rounded-full border border-amber-400/70
               bg-slate-950/90 overflow-hidden shadow-[0_0_10px_rgba(251,191,36,0.55)]"><img class="h-full w-full object-cover"/></div></div>`),
  ze = _('<span> </span>'),
  Ae =
    _(`<div><div class="mb-2 flex items-start gap-2"><div class="flex-1 text-center"><p class="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500"> </p> <h3 class="text-sm font-semibold text-slate-100"> </h3></div> <!></div> <!> <p class="mb-3 line-clamp-2 text-[0.75rem] text-slate-400"> </p> <div class="mt-auto flex items-center justify-between gap-2"><div class="flex flex-wrap items-center gap-1.5"><!></div> <div class="flex items-center gap-2"><span class="text-xs font-semibold text-amber-300"> <span class="text-[0.65rem] font-normal text-amber-200">Gold</span></span> <button type="button" class="rounded-full px-3 py-1 text-[0.7rem]
               font-semibold transition-colors
               disabled:bg-slate-700 disabled:text-slate-400
               bg-amber-500/90 text-slate-950 hover:bg-amber-400"> </button></div></div></div>`);
function Oe(f, e) {
  he(e, !0);
  let o = M(e, 'owned', 3, !1),
    l = M(e, 'equipped', 3, !1),
    d = M(e, 'buying', 3, !1),
    y = M(e, 'canAfford', 3, !0),
    S = M(e, 'onBuy', 3, () => {}),
    T = M(e, 'onEquip', 3, () => {});
  const ee = {
      common: {
        label: 'COMUM',
        pillClass: 'bg-slate-800 text-slate-200',
        accentClass: 'text-slate-300',
        cardClass:
          'border border-slate-600 shadow-[0_0_10px_rgba(148,163,184,0.35)] hover:border-slate-300 hover:shadow-[0_0_18px_rgba(148,163,184,0.6)]',
      },
      rare: {
        label: 'RARO',
        pillClass: 'bg-sky-900/60 text-sky-200',
        accentClass: 'text-sky-300',
        cardClass:
          'border border-sky-500/80 shadow-[0_0_12px_rgba(59,130,246,0.4)] hover:border-sky-300 hover:shadow-[0_0_22px_rgba(96,165,250,0.7)]',
      },
      epic: {
        label: 'ÉPICO',
        pillClass: 'bg-violet-900/60 text-violet-200',
        accentClass: 'text-violet-300',
        cardClass:
          'border border-violet-500/80 shadow-[0_0_12px_rgba(139,92,246,0.45)] hover:border-violet-300 hover:shadow-[0_0_24px_rgba(167,139,250,0.8)]',
      },
      legendary: {
        label: 'LENDÁRIO',
        pillClass: 'bg-amber-900/70 text-amber-100',
        accentClass: 'text-amber-300',
        cardClass:
          'border border-amber-400/90 shadow-[0_0_14px_rgba(245,158,11,0.55)] hover:border-amber-200 hover:shadow-[0_0_26px_rgba(252,211,77,0.95)]',
      },
    },
    L = e.item.rarity,
    N = x(() => ee[L]),
    Q = x(() => e.item.status === 'soon'),
    R = x(() => t(Q) || d() || (!o() && !y())),
    te = x(() =>
      t(Q)
        ? 'Em breve'
        : o()
          ? l()
            ? 'Desequipar'
            : 'Equipar'
          : d()
            ? 'Comprando...'
            : 'Comprar',
    );
  function H() {
    t(R) || (o() ? T()() : S()());
  }
  var q = Ae(),
    A = n(q),
    C = n(A),
    E = n(C),
    X = n(E, !0);
  a(E);
  var U = b(E, 2),
    re = n(U, !0);
  (a(U), a(C));
  var ae = b(C, 2);
  {
    var F = (v) => {
        var p = Ee(),
          w = n(p);
        {
          var D = (I) => {
              var oe = ce('Equipado');
              m(I, oe);
            },
            V = (I) => {
              var oe = ce('Adquirido');
              m(I, oe);
            };
          P(w, (I) => {
            l() ? I(D) : I(V, !1);
          });
        }
        (a(p), m(v, p));
      },
      Y = (v) => {
        var p = we(),
          w = Ie(p);
        {
          var D = (V) => {
            var I = je();
            m(V, I);
          };
          P(
            w,
            (V) => {
              t(Q) && V(D);
            },
            !0,
          );
        }
        m(v, p);
      };
    P(ae, (v) => {
      o() ? v(F) : v(Y, !1);
    });
  }
  a(A);
  var Z = b(A, 2);
  {
    var se = (v) => {
      var p = Ge(),
        w = n(p),
        D = n(w);
      (a(w),
        a(p),
        J(() => {
          (fe(D, 'src', e.item.iconSrc), fe(D, 'alt', e.item.name));
        }),
        m(v, p));
    };
    P(Z, (v) => {
      e.item.iconSrc && v(se);
    });
  }
  var K = b(Z, 2),
    r = n(K, !0);
  a(K);
  var i = b(K, 2),
    s = n(i),
    u = n(s);
  {
    var O = (v) => {
      var p = ze(),
        w = n(p, !0);
      (a(p),
        J(() => {
          (le(
            p,
            1,
            `rounded-full px-2 py-[2px] text-[0.65rem] ${t(N).pillClass}`,
          ),
            k(w, e.item.tag));
        }),
        m(v, p));
    };
    P(u, (v) => {
      e.item.tag && v(O);
    });
  }
  a(s);
  var j = b(s, 2),
    G = n(j),
    g = n(G);
  (xe(), a(G));
  var z = b(G, 2);
  z.__click = H;
  var $ = n(z, !0);
  (a(z),
    a(j),
    a(i),
    a(q),
    J(() => {
      (le(
        q,
        1,
        `group flex h-full flex-col rounded-2xl
          bg-slate-900/80 p-4 transition-all
          ${t(N).cardClass}`,
      ),
        k(X, t(N).label),
        k(re, e.item.name),
        k(r, e.item.description),
        k(g, `${e.item.price ?? ''} `),
        (z.disabled = t(R)),
        k($, t(te)));
    }),
    m(f, q),
    _e());
}
ge(['click']);
async function De(f) {
  try {
    return await c.transaction('rw', c.profile, c.ownedShopItems, async () => {
      const e = await c.profile.get(1);
      if (!e) return { ok: !1, code: 'profile_missing' };
      if (f.id == null) return { ok: !1, code: 'unknown' };
      if (await c.ownedShopItems.where({ itemId: f.id }).first())
        return { ok: !0, code: 'already_owned' };
      const l = e.gold ?? 0;
      if (l < f.price) return { ok: !1, code: 'no_funds' };
      await c.profile.update(1, { gold: l - f.price });
      const d = {
        itemId: f.id,
        name: f.name,
        description: f.description ?? null,
        price: f.price,
        rarity: f.rarity,
        category: f.category,
        equipped: !1,
        acquiredAt: new Date().toISOString(),
      };
      return (await c.ownedShopItems.add(d), { ok: !0 });
    });
  } catch (e) {
    return (console.error('Erro em buyItem:', e), { ok: !1, code: 'unknown' });
  }
}
var Me = _('<button type="button"> </button>'),
  Pe = _('<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3"></div>'),
  Be = _(
    '<div class="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-8 text-center text-sm text-slate-400">Nenhum item disponível nesta categoria por enquanto.</div>',
  ),
  Te = _(`<div class="relative flex-1" style="
    background-image: url('/art/bg/bg-shop.webp');
    background-size: cover;
    background-position: center top;
    background-repeat: no-repeat;
  "><div class="pointer-events-none absolute inset-0 bg-slate-950/85"></div> <main class="relative z-10 mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8"><!> <section class="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-800
             bg-slate-900/80 px-4 py-3 md:flex-row md:items-center md:justify-between"><div class="flex items-center gap-3"><p class="text-[0.7rem] uppercase tracking-[0.18em] text-slate-400">Seu saldo</p> <div class="inline-flex items-center gap-1 rounded-full border border-amber-500/70
                 bg-slate-950/80 px-3 py-1 text-xs font-semibold text-amber-200"><span> </span> <span class="text-[0.7rem] font-normal text-amber-100">Gold</span> <img src="/art/icones/gold-icon.png" alt="Gold" class="h-4 w-4 object-contain"/></div></div> <div class="text-xs text-slate-400 max-w-md"><p>Você ganha Gold ao completar missões, manter sua sequência ativa e
          evoluir de nível.</p></div> <button type="button" class="self-start rounded-full border border-amber-400/70
               bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-100
               hover:bg-amber-500/20 transition-colors">Como ganhar mais Gold?</button></section> <nav class="mb-4 flex flex-wrap items-center gap-2 text-[0.75rem]" aria-label="Categorias da loja"></nav> <section><!></section></main></div>`);
function Ve(f, e) {
  he(e, !0);
  let o = B('highlight');
  const l = ke,
    d = be(async () => (await c.profile.get(1))?.gold ?? 0);
  let y = B(0);
  ue(() => {
    const r = d.subscribe((i) => h(y, i, !0));
    return () => r.unsubscribe();
  });
  let S = new W(),
    T = new W();
  const ee = be(() => c.ownedShopItems.toArray());
  ue(() => {
    const r = ee.subscribe((i) => {
      (S.clear(), T.clear());
      for (const s of i)
        typeof s.itemId == 'number' &&
          (S.add(s.itemId), s.equipped && T.add(s.itemId));
    });
    return () => r.unsubscribe();
  });
  let L = B(null);
  async function N(r) {
    if (r.status !== 'soon' && !S.has(r.id)) {
      if (t(y) < r.price) {
        alert('Gold insuficiente.');
        return;
      }
      try {
        h(L, r.id, !0);
        const i = await De(r);
        i.ok ||
          (i.code === 'no_funds'
            ? alert('Gold insuficiente.')
            : i.code === 'profile_missing'
              ? alert('Perfil não encontrado.')
              : alert('Não foi possível concluir a compra.'));
      } finally {
        h(L, null);
      }
    }
  }
  async function Q(r) {
    if (r.status === 'soon' || !S.has(r.id) || r.id == null) return;
    const i = r.id,
      s = await c.ownedShopItems.where('itemId').equals(i).first();
    if (!s || s.id == null) return;
    const u = s.id,
      O = ve(i),
      j = O?.slot;
    if (!O || !j) {
      (await c.ownedShopItems.update(u, { equipped: !s.equipped }), ne());
      return;
    }
    if (s.equipped) {
      (await c.ownedShopItems.update(u, { equipped: !1 }), ne());
      return;
    }
    (await c.transaction('rw', c.ownedShopItems, async () => {
      const G = await c.ownedShopItems.toArray();
      for (const g of G) {
        if (
          typeof g.id != 'number' ||
          !g.equipped ||
          g.id === u ||
          typeof g.itemId != 'number'
        )
          continue;
        const z = ve(g.itemId),
          $ = z?.slot;
        !z ||
          !$ ||
          ($ === j && (await c.ownedShopItems.update(g.id, { equipped: !1 })));
      }
      await c.ownedShopItems.update(u, { equipped: !0 });
    }),
      ne());
  }
  const R = x(() =>
      t(o) === 'highlight' ? l : l.filter((r) => r.category === t(o)),
    ),
    te = [
      { id: 'highlight', label: 'Destaque' },
      { id: 'gear', label: 'Artefatos' },
      { id: 'theme', label: 'Temas' },
      { id: 'utility', label: 'Utilidades' },
      { id: 'effect', label: 'Efeitos' },
      { id: 'profile', label: 'Perfil' },
    ];
  var H = Te(),
    q = b(n(H), 2),
    A = n(q);
  Se(A, {
    title: 'Loja da Taverna',
    subtitle:
      'Gaste seu Gold em artefatos e cosméticos para personalizar sua experiência e aprimorar sua jornada.',
    iconSrc: '/art/icones/shop-icon.png',
    align: 'center',
  });
  var C = b(A, 2),
    E = n(C),
    X = b(n(E), 2),
    U = n(X),
    re = n(U, !0);
  (a(U), xe(4), a(X), a(E));
  var ae = b(E, 4);
  ((ae.__click = () => console.log('como ganhar mais gold')), a(C));
  var F = b(C, 2);
  (pe(
    F,
    21,
    () => te,
    (r) => r.id,
    (r, i) => {
      var s = Me();
      s.__click = () => h(o, t(i).id, !0);
      var u = n(s, !0);
      (a(s),
        J(() => {
          (le(
            s,
            1,
            `rounded-full px-3 py-1.5 border transition-colors ${t(o) === t(i).id ? 'border-emerald-400/80 bg-emerald-500/15 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.45)]' : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-emerald-400/60 hover:text-emerald-200'}`,
          ),
            k(u, t(i).label));
        }),
        m(r, s));
    },
  ),
    a(F));
  var Y = b(F, 2),
    Z = n(Y);
  {
    var se = (r) => {
        var i = Pe();
        (pe(
          i,
          21,
          () => t(R),
          (s) => s.id,
          (s, u) => {
            {
              let O = x(() => S.has(t(u).id)),
                j = x(() => T.has(t(u).id)),
                G = x(() => t(L) === t(u).id),
                g = x(() => t(y) >= t(u).price);
              Oe(s, {
                get item() {
                  return t(u);
                },
                get owned() {
                  return t(O);
                },
                get equipped() {
                  return t(j);
                },
                get buying() {
                  return t(G);
                },
                get canAfford() {
                  return t(g);
                },
                onBuy: () => N(t(u)),
                onEquip: () => Q(t(u)),
              });
            }
          },
        ),
          a(i),
          m(r, i));
      },
      K = (r) => {
        var i = Be();
        m(r, i);
      };
    P(Z, (r) => {
      t(R).length > 0 ? r(se) : r(K, !1);
    });
  }
  (a(Y), a(q), a(H), J(() => k(re, t(y))), m(f, H), _e());
}
ge(['click']);
export { Ve as component };
