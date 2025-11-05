const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f || (m.f = ['../chunks/Byx6IEAp.js', '../chunks/BwBkY9_K.js']),
) => i.map((i) => d[i]);
import { f as h, a as p, s as D, d as C, t as E } from '../chunks/C1kyYzkI.js';
import {
  p as y,
  t as x,
  a as _,
  s as b,
  c as d,
  a3 as S,
  r as u,
  F as N,
  Z as q,
  a4 as P,
} from '../chunks/BOOFhtRP.js';
import { _ as F, b as J } from '../chunks/BO-jLNdh.js';
import { d as l } from '../chunks/BwBkY9_K.js';
import { s as j } from '../chunks/B0kYkVBN.js';
import { i as T } from '../chunks/Dt4_cxAB.js';
import { a as I, s as V } from '../chunks/5aiaHk4R.js';
async function L() {
  const [s, e] = await Promise.all([l.areas.toArray(), l.items.toArray()]),
    t = {
      version: 1,
      exportedAt: new Date().toISOString(),
      areas: s,
      items: e,
    },
    o = new Blob([JSON.stringify(t, null, 2)], {
      type: 'application/json;charset=utf-8',
    }),
    r = await F(
      () => import('../chunks/Byx6IEAp.js').then((n) => n.F),
      __vite__mapDeps([0, 1]),
      import.meta.url,
    ),
    a = r.saveAs || (r.default && r.default.saveAs);
  if (!a) {
    console.error('Não foi possível carregar saveAs de file-saver');
    return;
  }
  a(o, 'lmup-backup.json');
}
async function M(s) {
  const e = await s.text();
  let t;
  try {
    t = JSON.parse(e);
  } catch (a) {
    throw (
      console.error('Erro ao parsear backup:', a),
      new Error('Arquivo de backup inválido')
    );
  }
  if (!t || typeof t != 'object') throw new Error('Arquivo de backup inválido');
  const o = Array.isArray(t.areas) ? t.areas : [],
    r = Array.isArray(t.items) ? t.items : [];
  await l.transaction('rw', l.areas, l.items, async () => {
    (await Promise.all([l.areas.clear(), l.items.clear()]),
      o.length && (await l.areas.bulkAdd(o)),
      r.length && (await l.items.bulkAdd(r)));
  });
}
var R = h(
    '<header class="flex items-center justify-between"><h2 class="text-xl font-semibold text-text"> </h2></header>',
  ),
  Z = h('<section><!> <div><!></div></section>');
function z(s, e) {
  y(e, !0);
  var t = Z(),
    o = d(t);
  {
    var r = (c) => {
      var i = R(),
        f = d(i),
        m = d(f, !0);
      (u(f), u(i), x(() => D(m, e.title)), p(c, i));
    };
    T(o, (c) => {
      e.title && c(r);
    });
  }
  var a = b(o, 2),
    n = d(a);
  (j(n, () => e.children ?? S),
    u(a),
    u(t),
    x(() =>
      I(
        t,
        1,
        `bg-card rounded-xl shadow-lg border border-border/60 p-6 md:p-8 space-y-4 ${e.class ?? ''}`,
      ),
    ),
    p(s, t),
    _());
}
var G = h('<button><!></button>');
function B(s, e) {
  y(e, !0);
  const t = {
      primary: 'bg-primary hover:bg-primary/90 text-white',
      secondary: 'bg-card hover:bg-card/80 text-text',
      success: 'bg-green-600 hover:bg-green-700 text-white',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
    },
    o =
      'px-4 py-2 rounded-md font-semibold text-sm shadow-md transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50',
    r = q(() => e.variant ?? 'primary');
  var a = G();
  a.__click = function (...c) {
    e.onclick?.apply(this, c);
  };
  var n = d(a);
  (j(n, () => e.children ?? S),
    u(a),
    x(() => {
      (V(a, 'type', e.type ?? 'button'),
        I(a, 1, `${o} ${t[N(r)]}`),
        (a.disabled = e.disabled));
    }),
    p(s, a),
    _());
}
C(['click']);
var H = h(
  '<div class="space-y-6"><section class="space-y-2"><h3 class="text-lg font-semibold text-text">Backup de dados</h3> <p class="text-sm text-text-secondary">Exporte seus dados para um arquivo JSON ou importe um backup existente.</p> <div class="flex flex-wrap gap-3"><!> <!> <input type="file" accept="application/json" class="hidden"/></div></section></div>',
);
function K(s, e) {
  y(e, !0);
  let t = null;
  async function o() {
    await L();
  }
  function r() {
    t?.click();
  }
  async function a(n) {
    const c = n.currentTarget,
      i = c.files?.[0];
    i && (await M(i), (c.value = ''));
  }
  (z(s, {
    title: 'Configurações & Backup',
    children: (n, c) => {
      var i = H(),
        f = d(i),
        m = b(d(f), 4),
        w = d(m);
      B(w, {
        variant: 'secondary',
        onclick: o,
        children: (v, O) => {
          P();
          var g = E('Exportar dados');
          p(v, g);
        },
        $$slots: { default: !0 },
      });
      var k = b(w, 2);
      B(k, {
        variant: 'secondary',
        onclick: r,
        children: (v, O) => {
          P();
          var g = E('Importar backup');
          p(v, g);
        },
        $$slots: { default: !0 },
      });
      var A = b(k, 2);
      ((A.__change = a),
        J(
          A,
          (v) => (t = v),
          () => t,
        ),
        u(m),
        u(f),
        u(i),
        p(n, i));
    },
    $$slots: { default: !0 },
  }),
    _());
}
C(['change']);
function et(s) {
  K(s, {});
}
export { et as component };
