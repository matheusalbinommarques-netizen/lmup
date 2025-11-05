const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f || (m.f = ['../chunks/Byx6IEAp.js', '../chunks/BwBkY9_K.js']),
) => i.map((i) => d[i]);
import { f as h, a as p, s as D, d as C, t as E } from '../chunks/nF9ceomb.js';
import {
  a7 as y,
  a9 as x,
  aa as _,
  ad as b,
  ab as d,
  ae as S,
  ac as u,
  d as N,
  af as q,
  ag as P,
} from '../chunks/Csv_Bl-6.js';
import { _ as J, b as F } from '../chunks/CoYf8t8d.js';
import { d as l } from '../chunks/BwBkY9_K.js';
import { a as j, s as I } from '../chunks/CwhHgKCB.js';
import { i as T } from '../chunks/CSEja_gF.js';
import { s as V } from '../chunks/DQS66_so.js';
async function L() {
  const [s, a] = await Promise.all([l.areas.toArray(), l.items.toArray()]),
    t = {
      version: 1,
      exportedAt: new Date().toISOString(),
      areas: s,
      items: a,
    },
    o = new Blob([JSON.stringify(t, null, 2)], {
      type: 'application/json;charset=utf-8',
    }),
    r = await J(
      () => import('../chunks/Byx6IEAp.js').then((n) => n.F),
      __vite__mapDeps([0, 1]),
      import.meta.url,
    ),
    e = r.saveAs || (r.default && r.default.saveAs);
  if (!e) {
    console.error('Não foi possível carregar saveAs de file-saver');
    return;
  }
  e(o, 'lmup-backup.json');
}
async function M(s) {
  const a = await s.text();
  let t;
  try {
    t = JSON.parse(a);
  } catch (e) {
    throw (
      console.error('Erro ao parsear backup:', e),
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
  z = h('<section><!> <div><!></div></section>');
function G(s, a) {
  y(a, !0);
  var t = z(),
    o = d(t);
  {
    var r = (c) => {
      var i = R(),
        f = d(i),
        m = d(f, !0);
      (u(f), u(i), x(() => D(m, a.title)), p(c, i));
    };
    T(o, (c) => {
      a.title && c(r);
    });
  }
  var e = b(o, 2),
    n = d(e);
  (j(n, () => a.children ?? S),
    u(e),
    u(t),
    x(() =>
      I(
        t,
        1,
        `bg-card rounded-xl shadow-lg border border-border/60 p-6 md:p-8 space-y-4 ${a.class ?? ''}`,
      ),
    ),
    p(s, t),
    _());
}
var H = h('<button><!></button>');
function B(s, a) {
  y(a, !0);
  const t = {
      primary: 'bg-primary hover:bg-primary/90 text-white',
      secondary: 'bg-card hover:bg-card/80 text-text',
      success: 'bg-green-600 hover:bg-green-700 text-white',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
    },
    o =
      'px-4 py-2 rounded-md font-semibold text-sm shadow-md transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50',
    r = q(() => a.variant ?? 'primary');
  var e = H();
  e.__click = function (...c) {
    a.onclick?.apply(this, c);
  };
  var n = d(e);
  (j(n, () => a.children ?? S),
    u(e),
    x(() => {
      (V(e, 'type', a.type ?? 'button'),
        I(e, 1, `${o} ${t[N(r)]}`),
        (e.disabled = a.disabled));
    }),
    p(s, e),
    _());
}
C(['click']);
var K = h(
  '<div class="space-y-6"><section class="space-y-2"><h3 class="text-lg font-semibold text-text">Backup de dados</h3> <p class="text-sm text-text-secondary">Exporte seus dados para um arquivo JSON ou importe um backup existente.</p> <div class="flex flex-wrap gap-3"><!> <!> <input type="file" accept="application/json" class="hidden"/></div></section></div>',
);
function Q(s, a) {
  y(a, !0);
  let t = null;
  async function o() {
    await L();
  }
  function r() {
    t?.click();
  }
  async function e(n) {
    const c = n.currentTarget,
      i = c.files?.[0];
    i && (await M(i), (c.value = ''));
  }
  (G(s, {
    title: 'Configurações & Backup',
    children: (n, c) => {
      var i = K(),
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
      ((A.__change = e),
        F(
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
function at(s) {
  Q(s, {});
}
export { at as component };
