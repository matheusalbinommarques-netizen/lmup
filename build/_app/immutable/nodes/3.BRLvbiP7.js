const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      '../chunks/aewavrDc.js',
      '../chunks/-JVijWqR.js',
      '../chunks/BYSpO852.js',
      '../chunks/Cowx68EC.js',
      '../chunks/DJoSvvfp.js',
      '../chunks/f0HoYL7i.js',
      '../chunks/DgxGOAFj.js',
    ]),
) => i.map((i) => d[i]);
import { f as _, t as x, a as p } from '../chunks/BYSpO852.js';
import { X as u, R as w, V as f, a9 as y, W as v } from '../chunks/Cowx68EC.js';
import { _ as A } from '../chunks/PPVm8Dsz.js';
import { d as a, B as $, a as b } from '../chunks/-JVijWqR.js';
async function h() {
  const [s, i, r] = await Promise.all([
      a.areas?.toArray?.() ?? [],
      a.itens?.toArray?.() ?? [],
      a.meta?.toArray?.() ?? [],
    ]),
    o = { areas: s, itens: i, meta: r },
    e = new Blob([JSON.stringify(o, null, 2)], {
      type: 'application/json;charset=utf-8',
    }),
    { default: t } = await A(
      async () => {
        const { default: d } = await import('../chunks/aewavrDc.js').then(
          (n) => n.F,
        );
        return { default: d };
      },
      __vite__mapDeps([0, 1, 2, 3, 4, 5, 6]),
      import.meta.url,
    ),
    { saveAs: c } = t,
    l = new Date().toISOString().slice(0, 10);
  c(e, `lmup-backup-${l}.json`);
}
async function S() {
  return new Promise((s, i) => {
    const r = document.createElement('input');
    ((r.type = 'file'),
      (r.accept = 'application/json'),
      (r.onchange = async () => {
        const o = r.files?.[0];
        if (o)
          try {
            const e = await o.text(),
              t = JSON.parse(e ?? '{}');
            (await a.transaction('rw', a.areas, a.itens, a.meta, async () => {
              (Array.isArray(t.areas) &&
                (await a.areas.clear(), await a.areas.bulkAdd(t.areas)),
                Array.isArray(t.itens) &&
                  (await a.itens.clear(), await a.itens.bulkAdd(t.itens)),
                Array.isArray(t.meta) &&
                  (await a.meta.clear(), await a.meta.bulkAdd(t.meta)));
            }),
              s());
          } catch (e) {
            (console.error('Erro ao importar dados', e), i(e));
          }
      }),
      r.click());
  });
}
var k = _(
  `<h2 class="text-2xl font-semibold text-center text-text mb-6">Configurações</h2> <div class="space-y-6"><div class="setting-item p-4 bg-background border border-border rounded-lg"><div class="text-lg font-semibold text-text-secondary">Backup e Restauração</div> <p class="text-sm text-text-secondary mt-1 mb-4">Exporte seus dados (áreas, itens, XP) como um arquivo JSON. Você pode
        importá-lo de volta mais tarde ou em outro dispositivo.</p> <div class="actions flex flex-col md:flex-row gap-4"><!> <!></div></div></div>`,
  1,
);
function P(s) {
  $(s, {
    children: (i, r) => {
      var o = k(),
        e = u(w(o), 2),
        t = f(e),
        c = u(f(t), 4),
        l = f(c);
      b(l, {
        get onclick() {
          return h;
        },
        variant: 'primary',
        children: (n, g) => {
          y();
          var m = x('Exportar Dados (JSON)');
          p(n, m);
        },
        $$slots: { default: !0 },
      });
      var d = u(l, 2);
      (b(d, {
        get onclick() {
          return S;
        },
        variant: 'danger',
        children: (n, g) => {
          y();
          var m = x('Importar Dados (JSON)');
          p(n, m);
        },
        $$slots: { default: !0 },
      }),
        v(c),
        v(t),
        v(e),
        p(i, o));
    },
    $$slots: { default: !0 },
  });
}
function J(s) {
  P(s);
}
export { J as component };
