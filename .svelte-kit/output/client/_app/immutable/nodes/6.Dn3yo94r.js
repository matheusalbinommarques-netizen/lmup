import '../chunks/DsnmJJEf.js';
import {
  v as St,
  p as It,
  s as U,
  c as kt,
  o as Et,
  f as m,
  t as M,
  d as n,
  e as jt,
  h as i,
  j as d,
  b as g,
  r as s,
  n as At,
  g as t,
  k as h,
  l as _,
  q as O,
  m as T,
  w as q,
} from '../chunks/C4tos-D-.js';
import { i as v } from '../chunks/D7NEdK74.js';
import { e as de } from '../chunks/BYKdWbGi.js';
import { a as ce, s as je } from '../chunks/B28y5Mvi.js';
import { l as Ae, d as c } from '../chunks/CUrLQr9X.js';
import { P as Ct } from '../chunks/CpUvk0iO.js';
import { g as pe, a as Y, i as ue } from '../chunks/Cxxjmckw.js';
var Mt = m(
    '<p class="mt-1 text-[0.7rem] text-emerald-300 md:text-right"> </p>',
  ),
  Ot = m('<p class="mt-1 text-[0.7rem] text-slate-500 md:text-right"></p>'),
  Tt = m(
    '<button type="button" class="text-[0.75rem] text-slate-400 hover:text-slate-100 underline">Limpar filtro</button>',
  ),
  Lt = m('<button type="button"> </button>'),
  Nt =
    m(`<div class="flex h-40 items-center justify-center rounded-xl border border-slate-800/60 border-dashed bg-slate-900/60"><p class="text-sm text-slate-500">Nenhum item encontrado nesse filtro. Explore a loja ou conclua missões
          para desbloquear mais cosméticos!</p></div>`),
  Ft = m('<img class="h-full w-full object-contain"/>'),
  Gt = m('<span class="text-[0.65rem] text-emerald-300">Equipado</span>'),
  Pt = m(
    '<article class="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2.5 text-xs"><div class="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/70 overflow-hidden"><!></div> <div class="flex-1 min-w-0"><p class="truncate text-slate-100 font-medium"> </p> <p class="mt-0.5 text-[0.7rem] text-slate-400">Chave: <span class="font-mono text-slate-300"> </span></p></div> <div class="flex flex-col items-end gap-1"><button type="button"> </button> <!></div></article>',
  ),
  Qt = m(
    '<div class="space-y-2"><div class="flex items-center justify-between gap-2"><h3 class="text-sm font-semibold text-slate-100"> </h3> <span class="rounded-full bg-slate-900/80 px-2 py-0.5 text-[0.7rem] text-slate-400"> </span></div> <div class="grid gap-3 sm:grid-cols-2"></div></div>',
  ),
  Vt = m('<div class="space-y-5"></div>'),
  Bt =
    m(`<div class="flex flex-col gap-6"><!> <section class="mx-auto w-full max-w-4xl rounded-2xl border border-emerald-500/60 bg-slate-950/80 px-4 py-3 shadow-[0_0_22px_rgba(16,185,129,0.45)] flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p class="text-[0.7rem] uppercase tracking-[0.22em] text-emerald-300/80">Visão geral</p> <p class="mt-1 text-xs text-slate-400">Tudo que o seu herói já conquistou em termos de visuais, troféus e
        artefatos equipáveis.</p></div> <div class="grid grid-cols-3 gap-3 text-xs text-center md:text-right"><div><p class="text-slate-400">Slots ocupados</p> <p> </p></div> <div><p class="text-slate-400">Itens equipados</p> <p class="mt-1 text-base font-semibold text-sky-300"> </p></div> <div><p class="text-slate-400">Gold disponível</p> <p class="mt-1 flex items-center justify-center gap-1 text-base font-semibold text-amber-300 md:justify-end"> <img src="/art/icones/gold-icon.png" alt="Gold" class="h-4 w-4 object-contain"/></p></div></div> <!></section> <section class="mx-auto w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3"><div class="mb-2 flex items-center justify-between gap-2"><p class="text-[0.7rem] uppercase tracking-[0.22em] text-slate-400">Filtrar por tipo</p> <!></div> <div class="flex flex-wrap gap-2"></div></section> <section class="mx-auto w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-4"><!></section></div>`);
function Wt(Ce, Me) {
  It(Me, !0);
  let G = U(kt([])),
    ve = U(null),
    S = U('all');
  const Oe = 20;
  let w = U(0);
  const Te = Ae(async () => {
      const [e, r] = await Promise.all([
          c.inventory.toArray(),
          c.ownedShopItems.toArray(),
        ]),
        a = e
          .filter((l) => l.owned && l.type !== 'gear')
          .map((l) => ({ ...l, iconSrc: l.iconSrc })),
        o = [];
      for (const l of r) {
        const p = pe(l.itemId);
        p &&
          o.push({
            id: l.id,
            key: p.key,
            type: 'gear',
            name: p.name,
            description: p.description,
            owned: !0,
            equipped: l.equipped,
            rarity: p.rarity,
            slot: void 0,
            effects: void 0,
            ownedShopItemId: l.id,
            iconSrc: p.iconSrc,
          });
      }
      return [...a, ...o];
    }),
    Le = Ae(() => c.profile.where('id').equals(1).first());
  Et(() => {
    const e = Te.subscribe((a) => {
        g(G, a ?? [], !0);
      }),
      r = Le.subscribe((a) => {
        g(ve, a ?? null, !0);
      });
    return (
      (async () => {
        try {
          const a = await Y();
          g(w, a.inventoryExtraSlots ?? 0, !0);
        } catch (a) {
          (console.error(
            'Erro ao carregar modificadores de herói (inventário):',
            a,
          ),
            g(w, 0));
        }
      })(),
      () => {
        (e.unsubscribe(), r.unsubscribe());
      }
    );
  });
  function z(e) {
    switch (e) {
      case 'frame':
        return 'Molduras de Avatar';
      case 'avatar':
        return 'Avatares';
      case 'background':
        return 'Fundos & Cenários';
      case 'aura':
        return 'Auras & Efeitos';
      case 'weapon-skin':
        return 'Skins de Arma';
      case 'gear':
        return 'Equipamentos & Utilidades';
      default:
        return e;
    }
  }
  function Ne(e) {
    switch (e) {
      case 'all':
        return 'Tudo';
      case 'frame':
        return 'Molduras';
      case 'avatar':
        return 'Avatares';
      case 'background':
        return 'Fundos';
      case 'aura':
        return 'Auras';
      case 'weapon-skin':
        return 'Armas';
      case 'gear':
        return 'Equipamentos';
      default:
        return 'Tudo';
    }
  }
  const me = h(() =>
      (() => {
        const e = {};
        for (const a of t(G)) {
          if (!a.owned) continue;
          const o = a.type || 'outros';
          (e[o] || (e[o] = []), e[o].push(a));
        }
        const r = Object.entries(e).map(([a, o]) => ({
          type: a,
          items: o.sort((l, p) => l.key.localeCompare(p.key)),
        }));
        return (r.sort((a, o) => z(a.type).localeCompare(z(o.type))), r);
      })(),
    ),
    fe = h(() =>
      t(S) === 'all' ? t(me) : t(me).filter((e) => e.type === t(S)),
    ),
    J = h(() => t(G).filter((e) => e.owned).length),
    Fe = h(() => t(G).filter((e) => e.equipped).length),
    Ge = h(() => t(ve)?.gold ?? 0),
    P = h(() => Oe + (t(w) || 0)),
    xe = h(() => t(J) >= t(P)),
    Pe = h(() => !t(xe) && t(J) >= Math.floor(t(P) * 0.8)),
    Qe = [
      'all',
      'frame',
      'avatar',
      'background',
      'aura',
      'weapon-skin',
      'gear',
    ];
  function _e(e) {
    return e.name || e.key;
  }
  function Ve(e) {
    return e.equipped ? 'Desequipar' : 'Equipar';
  }
  async function Be(e) {
    if (e.type === 'gear') {
      if (!e.ownedShopItemId) return;
      const r = await c.ownedShopItems.get(e.ownedShopItemId);
      if (!r || r.id == null || typeof r.itemId != 'number') return;
      const a = r.id,
        o = pe(r.itemId),
        l = o?.slot;
      if (!o || !l) {
        const b = !r.equipped;
        (await c.ownedShopItems.update(a, { equipped: b }), ue());
        const f = await Y();
        g(w, f.inventoryExtraSlots ?? 0, !0);
        return;
      }
      if (r.equipped) {
        (await c.ownedShopItems.update(a, { equipped: !1 }), ue());
        const b = await Y();
        g(w, b.inventoryExtraSlots ?? 0, !0);
        return;
      }
      (await c.transaction('rw', c.ownedShopItems, async () => {
        const b = await c.ownedShopItems.toArray();
        for (const f of b) {
          if (
            typeof f.id != 'number' ||
            !f.equipped ||
            f.id === a ||
            typeof f.itemId != 'number'
          )
            continue;
          const L = pe(f.itemId),
            Q = L?.slot;
          !L ||
            !Q ||
            (Q === l &&
              (await c.ownedShopItems.update(f.id, { equipped: !1 })));
        }
        await c.ownedShopItems.update(a, { equipped: !0 });
      }),
        ue());
      const p = await Y();
      g(w, p.inventoryExtraSlots ?? 0, !0);
      return;
    }
    e.id &&
      (await c.transaction('rw', c.inventory, async () => {
        const r = await c.inventory.where('type').equals(e.type).toArray();
        for (const a of r) {
          if (!a.id) continue;
          const o = a.id === e.id ? !a.equipped : !1;
          await c.inventory.update(a.id, { equipped: o });
        }
      }));
  }
  var K = Bt(),
    be = i(K);
  Ct(be, {
    title: 'Inventário',
    subtitle:
      'Veja todos os cosméticos, fundos, companheiros e troféus que o seu herói já desbloqueou.',
    iconSrc: '/art/icones/bag-icon.png',
    align: 'center',
  });
  var W = d(be, 2),
    X = d(i(W), 2),
    Z = i(X),
    $ = d(i(Z), 2),
    He = i($);
  (s($), s(Z));
  var ee = d(Z, 2),
    ye = d(i(ee), 2),
    De = i(ye, !0);
  (s(ye), s(ee));
  var ge = d(ee, 2),
    we = d(i(ge), 2),
    Re = i(we);
  (At(), s(we), s(ge), s(X));
  var Ue = d(X, 2);
  {
    var Ye = (e) => {
        var r = Mt(),
          a = i(r);
        (s(r),
          M(() =>
            _(
              a,
              `Mochila equipada: +${t(w) ?? ''} slots extras (total ${t(P) ?? ''}).`,
            ),
          ),
          n(e, r));
      },
      ze = (e) => {
        var r = Ot();
        ((r.textContent = 'Capacidade base de inventário: 20 slots.'), n(e, r));
      };
    v(Ue, (e) => {
      t(w) > 0 ? e(Ye) : e(ze, !1);
    });
  }
  s(W);
  var te = d(W, 2),
    ae = i(te),
    Je = d(i(ae), 2);
  {
    var Ke = (e) => {
      var r = Tt();
      ((r.__click = () => g(S, 'all')), n(e, r));
    };
    v(Je, (e) => {
      t(S) !== 'all' && e(Ke);
    });
  }
  s(ae);
  var he = d(ae, 2);
  (de(
    he,
    20,
    () => Qe,
    (e) => e,
    (e, r) => {
      var a = Lt();
      a.__click = () => g(S, r, !0);
      var o = i(a, !0);
      (s(a),
        M(
          (l) => {
            (ce(
              a,
              1,
              `px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors ${t(S) === r ? 'border-emerald-400 bg-emerald-500/15 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.6)]' : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-emerald-400/60 hover:text-emerald-200'}`,
            ),
              _(o, l));
          },
          [() => Ne(r)],
        ),
        n(e, a));
    },
  ),
    s(he),
    s(te));
  var qe = d(te, 2),
    We = i(qe);
  {
    var Xe = (e) => {
        var r = Nt();
        n(e, r);
      },
      Ze = (e) => {
        var r = Vt();
        (de(
          r,
          21,
          () => t(fe),
          (a) => a.type,
          (a, o) => {
            var l = Qt(),
              p = i(l),
              b = i(p),
              f = i(b, !0);
            s(b);
            var L = d(b, 2),
              Q = i(L);
            (s(L), s(p));
            var Se = d(p, 2);
            (de(
              Se,
              21,
              () => t(o).items,
              (N) => N.id,
              (N, y) => {
                var re = Pt(),
                  se = i(re),
                  $e = i(se);
                {
                  var et = (u) => {
                      var x = Ft();
                      (M(
                        (ne) => {
                          (je(x, 'src', t(y).iconSrc), je(x, 'alt', ne));
                        },
                        [() => _e(t(y))],
                      ),
                        n(u, x));
                    },
                    tt = (u) => {
                      var x = O(),
                        ne = T(x);
                      {
                        var nt = (I) => {
                            var V = q('🖼️');
                            n(I, V);
                          },
                          lt = (I) => {
                            var V = O(),
                              dt = T(V);
                            {
                              var ct = (k) => {
                                  var B = q('😃');
                                  n(k, B);
                                },
                                pt = (k) => {
                                  var B = O(),
                                    ut = T(B);
                                  {
                                    var vt = (E) => {
                                        var H = q('🌌');
                                        n(E, H);
                                      },
                                      mt = (E) => {
                                        var H = O(),
                                          ft = T(H);
                                        {
                                          var xt = (j) => {
                                              var D = q('✨');
                                              n(j, D);
                                            },
                                            _t = (j) => {
                                              var D = O(),
                                                bt = T(D);
                                              {
                                                var yt = (A) => {
                                                    var R = q('⚔️');
                                                    n(A, R);
                                                  },
                                                  gt = (A) => {
                                                    var R = O(),
                                                      wt = T(R);
                                                    {
                                                      var ht = (C) => {
                                                          var le = q('🎯');
                                                          n(C, le);
                                                        },
                                                        qt = (C) => {
                                                          var le = q('🎁');
                                                          n(C, le);
                                                        };
                                                      v(
                                                        wt,
                                                        (C) => {
                                                          t(o).type === 'gear'
                                                            ? C(ht)
                                                            : C(qt, !1);
                                                        },
                                                        !0,
                                                      );
                                                    }
                                                    n(A, R);
                                                  };
                                                v(
                                                  bt,
                                                  (A) => {
                                                    t(o).type === 'weapon-skin'
                                                      ? A(yt)
                                                      : A(gt, !1);
                                                  },
                                                  !0,
                                                );
                                              }
                                              n(j, D);
                                            };
                                          v(
                                            ft,
                                            (j) => {
                                              t(o).type === 'aura'
                                                ? j(xt)
                                                : j(_t, !1);
                                            },
                                            !0,
                                          );
                                        }
                                        n(E, H);
                                      };
                                    v(
                                      ut,
                                      (E) => {
                                        t(o).type === 'background'
                                          ? E(vt)
                                          : E(mt, !1);
                                      },
                                      !0,
                                    );
                                  }
                                  n(k, B);
                                };
                              v(
                                dt,
                                (k) => {
                                  t(o).type === 'avatar' ? k(ct) : k(pt, !1);
                                },
                                !0,
                              );
                            }
                            n(I, V);
                          };
                        v(
                          ne,
                          (I) => {
                            t(o).type === 'frame' ? I(nt) : I(lt, !1);
                          },
                          !0,
                        );
                      }
                      n(u, x);
                    };
                  v($e, (u) => {
                    t(y).iconSrc ? u(et) : u(tt, !1);
                  });
                }
                s(se);
                var oe = d(se, 2),
                  ie = i(oe),
                  at = i(ie, !0);
                s(ie);
                var Ie = d(ie, 2),
                  ke = d(i(Ie)),
                  rt = i(ke, !0);
                (s(ke), s(Ie), s(oe));
                var Ee = d(oe, 2),
                  F = i(Ee);
                F.__click = () => Be(t(y));
                var st = i(F, !0);
                s(F);
                var ot = d(F, 2);
                {
                  var it = (u) => {
                    var x = Gt();
                    n(u, x);
                  };
                  v(ot, (u) => {
                    t(y).equipped && u(it);
                  });
                }
                (s(Ee),
                  s(re),
                  M(
                    (u, x) => {
                      (_(at, u),
                        _(rt, t(y).key),
                        ce(
                          F,
                          1,
                          `rounded-lg px-3 py-1 text-[0.7rem] font-semibold transition-colors ${t(y).equipped ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`,
                        ),
                        _(st, x));
                    },
                    [() => _e(t(y)), () => Ve(t(y))],
                  ),
                  n(N, re));
              },
            ),
              s(Se),
              s(l),
              M(
                (N) => {
                  (_(f, N),
                    _(
                      Q,
                      `${t(o).items.length ?? ''}
                ${t(o).items.length === 1 ? ' item' : ' itens'}`,
                    ));
                },
                [() => z(t(o).type)],
              ),
              n(a, l));
          },
        ),
          s(r),
          n(e, r));
      };
    v(We, (e) => {
      t(fe).length === 0 ? e(Xe) : e(Ze, !1);
    });
  }
  (s(qe),
    s(K),
    M(() => {
      (ce(
        $,
        1,
        `mt-1 text-base font-semibold ${t(xe) ? 'text-red-300' : t(Pe) ? 'text-amber-300' : 'text-emerald-300'}`,
      ),
        _(He, `${t(J) ?? ''} / ${t(P) ?? ''}`),
        _(De, t(Fe)),
        _(Re, `${t(Ge) ?? ''} `));
    }),
    n(Ce, K),
    jt());
}
St(['click']);
export { Wt as component };
