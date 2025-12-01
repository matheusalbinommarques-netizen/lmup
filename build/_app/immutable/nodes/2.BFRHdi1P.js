import '../chunks/DsnmJJEf.js';
import {
  v as Ge,
  p as De,
  s as Q,
  c as Ee,
  at as Ve,
  b as C,
  o as Fe,
  f as x,
  h as t,
  j as s,
  g as a,
  r as e,
  t as L,
  l as g,
  x as Qe,
  d as u,
  e as Ne,
  n as ie,
  k as je,
  q as Te,
  m as Me,
  w as Xe,
} from '../chunks/C4tos-D-.js';
import { i as A } from '../chunks/D7NEdK74.js';
import { r as Ke, s as ee, a as Re } from '../chunks/B28y5Mvi.js';
import { s as Je } from '../chunks/B0IkYSzE.js';
import { d as z, l as Pe } from '../chunks/CUrLQr9X.js';
import { b as Ye } from '../chunks/DbSmc52O.js';
import { g as We, a as Ue } from '../chunks/BNQQrpbk.js';
import { e as ze } from '../chunks/BYKdWbGi.js';
import { S as He } from '../chunks/BijEeDuW.js';
import { P as Ze } from '../chunks/CpUvk0iO.js';
import { a as $e } from '../chunks/Cxxjmckw.js';
var ea = x(
    '<img alt="Avatar do herói" class="w-20 h-20 rounded-full object-cover border border-slate-700 shadow-md"/>',
  ),
  aa = x(
    '<div class="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center"><span class="text-3xl opacity-50">👤</span></div>',
  ),
  ta =
    x(`<div class="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4" role="button" tabindex="0"><div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg w-full max-w-md" role="dialog" aria-modal="true" tabindex="-1"><h2 class="text-xl font-bold text-[#ffb74d] font-serif mb-6">Editar Perfil</h2> <form class="flex flex-col gap-4"><label for="avatar-upload" class="block text-sm font-medium text-slate-300">Avatar</label> <div class="flex items-center gap-4"><!> <input id="avatar-upload" type="file" accept="image/*" class="text-xs text-slate-400
            file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0
            file:bg-primary/20 file:text-primary hover:file:bg-primary/30"/></div> <label for="profileName" class="block text-sm font-medium text-slate-300 mt-4">Nome do herói</label> <input id="profileName" type="text" class="w-full rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2
          text-sm text-slate-100 placeholder:text-slate-500
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Digite o nome do seu herói"/> <p class="text-xs text-slate-500 mt-1">Esse é o nome que aparecerá na Taverna, nos Clãs e nos rankings.</p> <div class="flex gap-4 mt-6"><button type="button" class="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600
            text-slate-100 text-sm font-medium transition-colors">Cancelar</button> <button type="submit" class="flex-1 py-2 rounded-lg bg-primary hover:bg-primary/90
            text-slate-950 text-sm font-bold transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed"> </button></div></form></div></div>`);
function ra(xe, y) {
  De(y, !0);
  let G = Q(Ee(y.profile.name)),
    q = Q(Ee(y.profile.avatarUrl || '')),
    K = Q(!1);
  (Ve(() => {
    y.profile?.name &&
      y.profile.name !== 'Carregando...' &&
      (C(G, y.profile.name, !0), C(q, y.profile.avatarUrl || '', !0));
  }),
    Fe(() => {
      const d = (P) => {
        P.key === 'Escape' && y.close();
      };
      return (
        window.addEventListener('keydown', d),
        () => {
          window.removeEventListener('keydown', d);
        }
      );
    }));
  function ue(d) {
    d.currentTarget === d.target && y.close();
  }
  function ve(d) {
    (d.key === 'Enter' || d.key === ' ') && (d.preventDefault(), y.close());
  }
  function h(d) {
    const N = d.target.files?.[0];
    if (!N) return;
    const j = new FileReader();
    ((j.onload = () => {
      C(q, j.result, !0);
    }),
      j.readAsDataURL(N));
  }
  async function ne(d) {
    d.preventDefault();
    const P = a(G).trim();
    if (!(a(K) || !P)) {
      C(K, !0);
      try {
        if (await z.profile.get(1))
          await z.profile.update(1, {
            name: P,
            avatarUrl: a(q),
            updatedAt: new Date(),
          });
        else {
          const j = new Date(),
            W = 1,
            he = We(W),
            _e = Ue(W),
            de = {
              id: 1,
              name: P,
              title: _e,
              level: W,
              xpCurrent: 0,
              xpNext: he,
              totalXpEarned: 0,
              gold: 0,
              avatarUrl: a(q),
              currentStreak: 0,
              lastCompletionDate: null,
              activeCompanionId: 1,
              createdAt: j,
              updatedAt: j,
            };
          await z.profile.put(de);
        }
        y.close();
      } catch (N) {
        (console.error('Falha ao salvar perfil', N),
          alert('Não foi possível salvar o perfil.'));
      } finally {
        C(K, !1);
      }
    }
  }
  var J = ta();
  ((J.__click = ue), (J.__keydown = ve));
  var F = t(J);
  ((F.__click = (d) => d.stopPropagation()),
    (F.__keydown = (d) => d.stopPropagation()));
  var p = s(t(F), 2),
    Y = s(t(p), 2),
    re = t(Y);
  {
    var ae = (d) => {
        var P = ea();
        (L(() => ee(P, 'src', a(q))), u(d, P));
      },
      pe = (d) => {
        var P = aa();
        u(d, P);
      };
    A(re, (d) => {
      a(q) ? d(ae) : d(pe, !1);
    });
  }
  var le = s(re, 2);
  ((le.__change = h), e(Y));
  var oe = s(Y, 4);
  Ke(oe);
  var I = s(oe, 4),
    fe = t(I);
  fe.__click = function (...d) {
    y.close?.apply(this, d);
  };
  var se = s(fe, 2),
    X = t(se, !0);
  (e(se),
    e(I),
    e(p),
    e(F),
    e(J),
    L(() => {
      ((se.disabled = a(K)), g(X, a(K) ? 'Salvando...' : 'Salvar'));
    }),
    Qe('submit', p, ne),
    Ye(
      oe,
      () => a(G),
      (d) => C(G, d),
    ),
    u(xe, J),
    Ne());
}
Ge(['click', 'keydown', 'change']);
var oa = x(
    '<div class="pointer-events-none absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center"><span class="text-2xl">🔒</span></div>',
  ),
  sa = x('<span class="font-semibold text-emerald-400">Equipado</span>'),
  ia = x('<span class="text-slate-400">Clique para equipar</span>'),
  na = x('<span class="text-slate-500"> </span>'),
  la = x(
    '<button type="button"><!> <div class="w-full aspect-square rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center"><img class="w-full h-full object-contain drop-shadow-xl"/></div> <div class="text-center"><h3 class="text-xs font-semibold text-slate-100"> </h3> <p class="text-[0.65rem] text-slate-400"> </p> <p class="text-[0.65rem] text-emerald-300 mt-1"> </p> <p class="text-[0.65rem] text-amber-300 mt-0.5"> </p> <p class="mt-1 text-[0.65rem]"><!></p></div></button>',
  ),
  da =
    x(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" role="dialog" tabindex="-1" aria-modal="true" aria-labelledby="companion-modal-title"><div class="relative w-full max-w-3xl mx-4 rounded-3xl border border-slate-700 bg-slate-950/95 shadow-2xl"><header class="flex items-start justify-between gap-4 px-6 pt-5 pb-3 border-b border-slate-800"><div><p class="text-xs uppercase tracking-[0.2em] text-slate-500">Taverna • Companheiro de Batalha</p> <h2 id="companion-modal-title" class="mt-1 text-lg font-semibold text-slate-50">Escolha quem luta ao seu lado</h2> <p class="mt-1 text-xs text-slate-400">Companheiros são liberados conforme o nível do seu herói. Você está no
          nível <span class="font-semibold text-emerald-400"> </span>.</p></div> <button type="button" class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 text-slate-400 hover:text-slate-100 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60" aria-label="Fechar seleção de companheiro">✕</button></header> <div class="px-6 pb-6 pt-4"><div class="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400"><p>Pets desbloqueiam nos níveis: 1 • 5 • 15 • 20.</p> <p>Pet atual: <span class="font-semibold text-emerald-400"><!></span></p></div> <div class="grid grid-cols-2 sm:grid-cols-4 gap-4"></div></div></div></div>`);
function ca(xe, y) {
  De(y, !0);
  const G = [
      {
        id: 1,
        key: 'wolf',
        name: 'Lobo Etéreo',
        rarity: 'rare',
        type: 'Caçador das Sombras',
        imagePath: '/art/pets/lobo-1.webp',
        requiredLevel: 1,
      },
      {
        id: 2,
        key: 'lich',
        name: 'Lorde Lich',
        rarity: 'epic',
        type: 'Mago Imortal',
        imagePath: '/art/pets/lich-1.webp',
        requiredLevel: 5,
      },
      {
        id: 3,
        key: 'dragon',
        name: 'Dragão Ancião',
        rarity: 'legendary',
        type: 'Guardião de Chamas',
        imagePath: '/art/pets/dragao-1.webp',
        requiredLevel: 15,
      },
      {
        id: 4,
        key: 'aberration',
        name: 'Aberração Abissal',
        rarity: 'epic',
        type: 'Eco do Vazio',
        imagePath: '/art/pets/aberracao-1.webp',
        requiredLevel: 20,
      },
    ],
    q = [0, 0, 100, 300];
  function K(r) {
    return r >= q[3] ? 3 : r >= q[2] ? 2 : 1;
  }
  function ue(r) {
    switch (r) {
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
  function ve(r, o) {
    const n = Math.min(Math.max(o ?? 1, 1), 3);
    return r.replace(/-\d+(\.\w+)$/, `-${n}$1`);
  }
  function h(r) {
    const o = Math.min(Math.max(r.evolutionStage || 1, 1), 3);
    switch (r.key) {
      case 'wolf':
        return o === 1
          ? '+5% de XP ganho em missões.'
          : o === 2
            ? '+10% de XP ganho em missões.'
            : '+15% de XP ganho em missões.';
      case 'lich':
        return o === 1
          ? '+5% de comida obtida (alimentação).'
          : o === 2
            ? '+10% de comida obtida (alimentação).'
            : '+15% de comida obtida (alimentação).';
      case 'dragon':
        return o === 1
          ? '+5% de Gold ganho em missões.'
          : o === 2
            ? '+10% de Gold ganho em missões.'
            : '+15% de Gold ganho em missões.';
      case 'aberration':
        return o === 1
          ? '+5% de XP, Gold e Comida.'
          : o === 2
            ? '+10% de XP, Gold e Comida.'
            : '+15% de XP, Gold e Comida e redução na quantidade de tarefas exigidas em sistemas avançados.';
      default:
        return 'Bônus não definido.';
    }
  }
  const ne = G.map((r) => ({
    id: r.id,
    key: r.key,
    name: r.name,
    rarity: r.rarity,
    type: r.type,
    imagePath: r.imagePath,
    unlocked: !1,
  }));
  let J = Q(Ee([])),
    F = Q(1),
    p = Q(1);
  const Y = Pe(() => z.companions.toArray()),
    re = Pe(() => z.profile.get(1));
  async function ae() {
    (await z.companions.count()) === 0 && (await z.companions.bulkAdd(ne));
  }
  function pe(r) {
    return r ? (G.find((n) => n.id === r)?.requiredLevel ?? 1) : 1;
  }
  let le = je(() => {
      const r = a(F) ?? 1,
        o = new He();
      for (const n of a(J)) n.id != null && o.set(n.id, n);
      return G.map((n) => {
        const c = o.get(n.id),
          S =
            (c && c.name && c.name.trim().length > 0 ? c.name : n.name) ||
            n.name,
          E = n.requiredLevel,
          M = r >= E,
          O = n.id === a(p),
          R = c?.foodInvested ?? 0,
          H = c?.evolutionStage ?? K(R);
        return {
          ...(c || {}),
          ...n,
          name: S,
          type: n.type,
          requiredLevel: E,
          isUnlocked: M,
          isActive: O,
          foodInvested: R,
          evolutionStage: H,
          imagePath: ve(n.imagePath, H),
        };
      }).sort((n, c) => n.requiredLevel - c.requiredLevel);
    }),
    oe = je(() => a(le).find((r) => r.isActive));
  Fe(() => {
    ae().catch((c) => {
      console.error('Erro ao semear pets na Taverna:', c);
    });
    const r = re.subscribe((c) => {
        const S = c ?? { level: 1, activeCompanionId: 1 };
        (C(F, S.level ?? 1, !0), C(p, S.activeCompanionId ?? 1, !0));
      }),
      o = Y.subscribe((c) => {
        C(J, c ?? [], !0);
      }),
      n = (c) => {
        c.key === 'Escape' && y.close();
      };
    return (
      window.addEventListener('keydown', n),
      () => {
        (r.unsubscribe(),
          o.unsubscribe(),
          window.removeEventListener('keydown', n));
      }
    );
  });
  function I(r) {
    r.currentTarget === r.target && y.close();
  }
  function fe(r) {
    r.currentTarget === r.target &&
      (r.key === 'Enter' || r.key === ' ') &&
      (r.preventDefault(), y.close());
  }
  async function se(r) {
    if (!r.id) return;
    const o = r.requiredLevel ?? pe(r.id);
    if (!(a(F) < o))
      try {
        (await z.profile.update(1, { activeCompanionId: r.id }),
          await z.companions.update(r.id, { unlocked: !0 }),
          C(p, r.id, !0),
          y.close());
      } catch (n) {
        console.error('Erro ao selecionar companheiro:', n);
      }
  }
  var X = da();
  ((X.__click = I), (X.__keydown = fe));
  var d = t(X),
    P = t(d),
    N = t(P),
    j = s(t(N), 4),
    W = s(t(j)),
    he = t(W, !0);
  (e(W), ie(), e(j), e(N));
  var _e = s(N, 2);
  ((_e.__click = function (...r) {
    y.close?.apply(this, r);
  }),
    e(P));
  var de = s(P, 2),
    be = t(de),
    ye = s(t(be), 2),
    ke = s(t(ye)),
    i = t(ke);
  {
    var m = (r) => {
        var o = Xe();
        (L(() => g(o, a(oe).name)), u(r, o));
      },
      b = (r) => {
        var o = Xe('Nenhum');
        u(r, o);
      };
    A(i, (r) => {
      a(oe) ? r(m) : r(b, !1);
    });
  }
  (e(ke), e(ye), e(be));
  var w = s(be, 2);
  (ze(
    w,
    21,
    () => a(le),
    (r) => r.id ?? r.imagePath,
    (r, o) => {
      var n = la();
      n.__click = () => se(a(o));
      var c = t(n);
      {
        var S = (k) => {
          var D = oa(),
            $ = t(D);
          (e(D),
            L(() =>
              ee($, 'title', `Desbloqueia no nível ${a(o).requiredLevel}`),
            ),
            u(k, D));
        };
        A(c, (k) => {
          a(o).isUnlocked || k(S);
        });
      }
      var E = s(c, 2),
        M = t(E);
      e(E);
      var O = s(E, 2),
        R = t(O),
        H = t(R, !0);
      e(R);
      var l = s(R, 2),
        f = t(l, !0);
      e(l);
      var _ = s(l, 2),
        T = t(_);
      e(_);
      var Z = s(_, 2),
        Ae = t(Z);
      e(Z);
      var we = s(Z, 2),
        Ce = t(we);
      {
        var ge = (k) => {
            var D = Te(),
              $ = Me(D);
            {
              var qe = (te) => {
                  var v = sa();
                  u(te, v);
                },
                Ie = (te) => {
                  var v = ia();
                  u(te, v);
                };
              A($, (te) => {
                a(o).isActive ? te(qe) : te(Ie, !1);
              });
            }
            u(k, D);
          },
          ce = (k) => {
            var D = na(),
              $ = t(D);
            (e(D),
              L(() => g($, `Nível ${a(o).requiredLevel ?? ''} necessário`)),
              u(k, D));
          };
        A(Ce, (k) => {
          a(o).isUnlocked ? k(ge) : k(ce, !1);
        });
      }
      (e(we),
        e(O),
        e(n),
        L(
          (k, D) => {
            (Re(
              n,
              1,
              `group relative flex flex-col items-center gap-2 rounded-2xl border bg-slate-900/70 p-3 shadow-md transition
              ${a(o).isActive ? 'border-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.8)]' : a(o).isUnlocked ? 'border-slate-700 hover:border-emerald-400/70 hover:bg-slate-900/90' : 'border-slate-800 opacity-60 grayscale'}`,
            ),
              (n.disabled = !a(o).isUnlocked),
              ee(M, 'src', a(o).imagePath),
              ee(M, 'alt', a(o).name),
              g(H, a(o).name),
              g(f, a(o).type),
              g(T, `Evolução: ${k ?? ''} (Nível ${a(o).evolutionStage ?? ''})`),
              g(Ae, `Bônus: ${D ?? ''}`));
          },
          [() => ue(a(o).evolutionStage), () => h(a(o))],
        ),
        u(r, n));
    },
  ),
    e(w),
    e(de),
    e(d),
    e(X),
    L(() => g(he, a(F))),
    u(xe, X),
    Ne());
}
Ge(['click', 'keydown']);
var ma = x(
    '<div class="mb-3 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2.5"><div class="relative h-16 w-16 rounded-2xl border border-emerald-400/80 bg-slate-950 overflow-hidden flex items-center justify-center shadow-[0_0_14px_rgba(16,185,129,0.7)]"><img class="h-full w-full object-contain"/></div> <div class="flex-1 min-w-0"><p class="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-emerald-300/80">Companheiro de Batalha</p> <p class="text-sm font-semibold text-slate-100 truncate"> </p> <p class="text-[0.7rem] text-slate-400"> </p> <p class="mt-1 text-[0.7rem] text-amber-300"> </p></div></div>',
  ),
  ua = x(
    '<div class="mb-3 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-[0.7rem] text-slate-400">Nenhum companheiro de batalha selecionado. <span class="text-emerald-300">Escolha um na Taverna.</span></div>',
  ),
  va = x('<p class="text-xs text-slate-400">Carregando equipamentos...</p>'),
  pa = x(
    '<div class="rounded-xl border border-slate-800/70 bg-slate-900/70 px-3 py-3 text-xs text-slate-400">Nenhum artefato de gameplay equipado no momento. <span class="text-emerald-300">Visite a Loja da Taverna para comprar e equipar novos itens.</span></div>',
  ),
  fa = x('<img class="h-full w-full object-cover"/>'),
  ba = x(
    '<div class="flex h-full w-full items-center justify-center text-lg"> </div>',
  ),
  ga = x(
    '<article class="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2.5 text-xs"><div class="mt-[2px]"><div class="relative h-16 w-16 rounded-full border border-amber-400/70 bg-slate-900/90 overflow-hidden shadow-[0_0_10px_rgba(251,191,36,0.5)]"><!></div></div> <div class="flex-1 min-w-0"><div class="flex items-center justify-between gap-2"><div class="min-w-0"><p class="truncate text-[0.8rem] font-semibold text-slate-100"> </p> <p class="mt-0.5 text-[0.7rem] text-slate-400">Slot: <span class="text-slate-200"> </span></p></div> <div class="flex flex-col items-end gap-1"><span> </span> <span class="text-[0.65rem] text-emerald-300">Equipado</span></div></div> <p class="mt-1 text-[0.7rem] text-slate-300"> </p></div></article>',
  ),
  xa = x(
    '<p class="mt-1 text-[0.75rem] text-slate-400">Nenhum bônus adicional ativo além do progresso padrão.</p>',
  ),
  ha = x(
    '<li>• Até <span class="font-semibold text-emerald-300"> </span> sem XP podem ser perdoados antes da sequência quebrar.</li>',
  ),
  _a = x(
    '<li>• Gold por XP efetivo: <span class="font-semibold text-emerald-300"> </span> de bônus.</li>',
  ),
  ya = x(
    '<li>• Bônus extra do Santuário: <span class="font-semibold text-emerald-300"> </span> de XP sobre o bônus base.</li>',
  ),
  wa = x(
    '<li>• Projetos concluídos recebem <span class="font-semibold text-emerald-300"> </span> de XP bônus adicional.</li>',
  ),
  Sa = x(
    '<li>• Missões precisam de <span class="font-semibold text-emerald-300"> </span> para subir de raridade (facilita chegar em épico/lendário).</li>',
  ),
  Pa =
    x(`<li class="text-slate-400">Nenhum bônus especial ativo no momento. Experimente comprar e
            equipar artefatos na Loja.</li>`),
  Ea = x(
    '<ul class="mt-1 space-y-1 text-[0.75rem] text-slate-100"><!> <!> <!> <!> <!> <!></ul>',
  ),
  ka = x(
    '<section class="w-full max-w-4xl mx-auto rounded-2xl border border-emerald-500/70 bg-slate-950/90 px-4 py-4 shadow-[0_0_22px_rgba(16,185,129,0.45)]"><header class="mb-3 flex items-center justify-between gap-2"><div><p class="text-[0.7rem] uppercase tracking-[0.22em] text-emerald-300/80">Equipamentos do Herói</p> <h2 class="text-sm font-semibold text-slate-100">Artefatos que afetam XP, Gold e Streak</h2></div> <div class="text-[0.7rem] text-slate-400 text-right"><p>Os efeitos abaixo valem enquanto o item estiver equipado.</p></div></header> <!> <div class="space-y-2"><!></div> <div class="mt-4 rounded-xl border border-emerald-600/60 bg-emerald-500/5 px-3 py-2"><p class="text-[0.7rem] uppercase tracking-[0.18em] text-emerald-300/90">Bônus Atuais</p> <!></div></section>',
  );
function Aa(xe, y) {
  De(y, !0);
  const G = [
      {
        id: 101,
        name: 'Cota da Rotina',
        slot: 'Armadura',
        rarity: 'common',
        shortEffect: 'Permite falhar 1 dia sem quebrar o streak.',
        iconSrc: '/art/items/cota-da-rotina.png',
      },
      {
        id: 102,
        name: 'Guarda-peito da Perseverança',
        slot: 'Armadura',
        rarity: 'rare',
        shortEffect: 'Permite falhar 2 dias sem quebrar o streak.',
        iconSrc: '/art/items/guarda-peito-da-perseveranca.png',
      },
      {
        id: 103,
        name: 'Armadura do Foco Inabalável',
        slot: 'Armadura',
        rarity: 'epic',
        shortEffect: 'Permite falhar 3 dias sem quebrar o streak.',
        iconSrc: '/art/items/armadura-do-foco-inabalavel.png',
      },
      {
        id: 104,
        name: 'Placas do Herói Eterno',
        slot: 'Armadura',
        rarity: 'legendary',
        shortEffect: 'Permite falhar 5 dias sem quebrar o streak.',
        iconSrc: '/art/items/placas-do-heroi-eterno.png',
      },
      {
        id: 105,
        name: 'Espada da Eficiência',
        slot: 'Arma',
        rarity: 'rare',
        shortEffect:
          'Reduz em 1 a quantidade de subtarefas para missões de alta raridade.',
        iconSrc: '/art/items/espada-da-eficiencia.png',
      },
      {
        id: 106,
        name: 'Lâmina da Otimização',
        slot: 'Arma',
        rarity: 'epic',
        shortEffect:
          'Reduz em 2 a quantidade de subtarefas para missões de alta raridade.',
        iconSrc: '/art/items/lamina-da-otimizacao.png',
      },
      {
        id: 107,
        name: 'Lâmina do Tempo Dobrada',
        slot: 'Arma',
        rarity: 'legendary',
        shortEffect:
          'Reduz em 3 a quantidade de subtarefas para missões de alta raridade.',
        iconSrc: '/art/items/lamina-do-tempo-dobrada.png',
      },
      {
        id: 108,
        name: 'Amuleto do Trocado',
        slot: 'Amuleto',
        rarity: 'common',
        shortEffect: '+5% de ouro recebido.',
        iconSrc: '/art/items/amuleto-do-trocado.png',
      },
      {
        id: 109,
        name: 'Amuleto do Cambista',
        slot: 'Amuleto',
        rarity: 'rare',
        shortEffect: '+10% de ouro recebido.',
        iconSrc: '/art/items/amuleto-do-cambista.png',
      },
      {
        id: 110,
        name: 'Amuleto do Tesouro Vivo',
        slot: 'Amuleto',
        rarity: 'epic',
        shortEffect: '+15% de ouro recebido.',
        iconSrc: '/art/items/amuleto-do-tesouro-vivo.png',
      },
      {
        id: 111,
        name: 'Relíquia do Cofre Infinito',
        slot: 'Amuleto',
        rarity: 'legendary',
        shortEffect: '+20% de ouro recebido.',
        iconSrc: '/art/items/reliquia-do-cofre-infinito.png',
      },
      {
        id: 112,
        name: 'Anel da Brisa Serena',
        slot: 'Anel',
        rarity: 'common',
        shortEffect: '+1% ao bônus atual do Santuário.',
        iconSrc: '/art/items/anel-da-brisa-serena.png',
      },
      {
        id: 113,
        name: 'Anel da Canção Silenciosa',
        slot: 'Anel',
        rarity: 'rare',
        shortEffect: '+3% ao bônus atual do Santuário.',
        iconSrc: '/art/items/anel-da-cancao-silenciosa.png',
      },
      {
        id: 114,
        name: 'Anel do Bosque Vivo',
        slot: 'Anel',
        rarity: 'epic',
        shortEffect: '+5% ao bônus atual do Santuário.',
        iconSrc: '/art/items/anel-do-bosque-vivo.png',
      },
      {
        id: 115,
        name: 'Anel do Guardião Ancestral',
        slot: 'Anel',
        rarity: 'legendary',
        shortEffect: '+10% ao bônus atual do Santuário.',
        iconSrc: '/art/items/anel-do-guardiao-ancestral.png',
      },
      {
        id: 116,
        name: 'Mochila do Aventureiro Sem Fundo',
        slot: 'Mochila',
        rarity: 'legendary',
        shortEffect: '+10 slots de inventário para itens visuais.',
        iconSrc: '/art/items/mochila-do-aventureiro-sem-fundo.png',
      },
      {
        id: 117,
        name: 'Elmo do Planejador Visionário',
        slot: 'Elmo',
        rarity: 'legendary',
        shortEffect: '+15% de XP ao concluir um projeto.',
        iconSrc: '/art/items/elmo-do-planejador-visionario.png',
      },
    ],
    q = {};
  for (const i of G) q[i.id] = i;
  const K = { common: 1, rare: 2, epic: 3, legendary: 4 },
    ue = [0, 0, 100, 300];
  function ve(i) {
    return i >= ue[3] ? 3 : i >= ue[2] ? 2 : 1;
  }
  function h(i) {
    switch (i) {
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
  function ne(i, m) {
    const b = Math.min(Math.max(m ?? 1, 1), 3);
    return i.replace(/-\d+(\.\w+)$/, `-${b}$1`);
  }
  function J(i, m) {
    const b = Math.min(Math.max(m || 1, 1), 3);
    switch (i) {
      case 1:
        return b === 1
          ? '+5% de XP ganho em missões.'
          : b === 2
            ? '+10% de XP ganho em missões.'
            : '+15% de XP ganho em missões.';
      case 2:
        return b === 1
          ? '+5% de comida obtida (alimentação).'
          : b === 2
            ? '+10% de comida obtida (alimentação).'
            : '+15% de comida obtida (alimentação).';
      case 3:
        return b === 1
          ? '+5% de Gold ganho em missões.'
          : b === 2
            ? '+10% de Gold ganho em missões.'
            : '+15% de Gold ganho em missões.';
      case 4:
        return b === 1
          ? '+5% de XP, Gold e Comida.'
          : b === 2
            ? '+10% de XP, Gold e Comida.'
            : '+15% de XP, Gold e Comida e redução na quantidade de tarefas exigidas em sistemas avançados.';
      default:
        return 'Bônus não definido.';
    }
  }
  let F = Q(Ee([])),
    p = Q(null),
    Y = Q(!0),
    re = Q(null),
    ae = Q(Ee([]));
  const pe = Pe(() => z.ownedShopItems.toArray()),
    le = Pe(() => z.profile.get(1)),
    oe = Pe(() => z.companions.toArray());
  let I = je(() => {
    if (!a(re)) return null;
    const i = a(re).activeCompanionId ?? null;
    if (!i) return null;
    const m = a(ae).find((n) => n.id === i);
    if (!m) return null;
    const b = m?.foodInvested ?? 0,
      w = m?.evolutionStage ?? ve(b),
      r = m.imagePath || '/art/pets/lobo-1.webp',
      o = ne(r, w);
    return { ...m, evolutionStage: w, imagePath: o };
  });
  Fe(() => {
    const i = pe.subscribe((w) => {
        const r = {};
        for (const o of w) {
          if (!o.equipped || typeof o.itemId != 'number') continue;
          const n = q[o.itemId];
          if (!n) continue;
          const c = n.slot,
            S = r[c];
          if (!S) r[c] = o;
          else if (typeof S.itemId == 'number') {
            const E = q[S.itemId];
            if (!E) r[c] = o;
            else {
              const M = K[E.rarity];
              K[n.rarity] >= M && (r[c] = o);
            }
          }
        }
        C(F, Object.values(r), !0);
      }),
      m = le.subscribe((w) => {
        C(re, w ?? null, !0);
      }),
      b = oe.subscribe((w) => {
        C(ae, w ?? [], !0);
      });
    return (
      (async () => {
        try {
          C(p, await $e(), !0);
        } catch (w) {
          console.error('Erro ao carregar HeroModifiers no GearPanel:', w);
        } finally {
          C(Y, !1);
        }
      })(),
      () => {
        (i.unsubscribe(), m.unsubscribe(), b.unsubscribe());
      }
    );
  });
  function fe(i) {
    switch (i) {
      case 'common':
        return 'bg-slate-800 text-slate-100';
      case 'rare':
        return 'bg-sky-900/60 text-sky-200';
      case 'epic':
        return 'bg-violet-900/60 text-violet-200';
      case 'legendary':
        return 'bg-amber-900/70 text-amber-100';
      default:
        return 'bg-slate-800 text-slate-100';
    }
  }
  function se(i) {
    return i === 'Arma'
      ? '⚔️'
      : i === 'Anel'
        ? '💍'
        : i === 'Amuleto'
          ? '🧿'
          : i === 'Armadura'
            ? '🛡️'
            : i === 'Mochila'
              ? '🎒'
              : i === 'Elmo'
                ? '🪖'
                : '🎁';
  }
  var X = ka(),
    d = s(t(X), 2);
  {
    var P = (i) => {
        var m = ma(),
          b = t(m),
          w = t(b);
        e(b);
        var r = s(b, 2),
          o = s(t(r), 2),
          n = t(o, !0);
        e(o);
        var c = s(o, 2),
          S = t(c);
        e(c);
        var E = s(c, 2),
          M = t(E);
        (e(E),
          e(r),
          e(m),
          L(
            (O, R) => {
              (ee(w, 'src', a(I).imagePath),
                ee(w, 'alt', a(I).name),
                g(n, a(I).name),
                g(
                  S,
                  `${O ?? ''} (Nível
          ${` ${a(I).evolutionStage}`})`,
                ),
                g(
                  M,
                  `Bônus:
          ${R ?? ''}`,
                ));
            },
            [
              () => h(a(I).evolutionStage),
              () => J(a(I).id, a(I).evolutionStage),
            ],
          ),
          u(i, m));
      },
      N = (i) => {
        var m = ua();
        u(i, m);
      };
    A(d, (i) => {
      a(I) ? i(P) : i(N, !1);
    });
  }
  var j = s(d, 2),
    W = t(j);
  {
    var he = (i) => {
        var m = va();
        u(i, m);
      },
      _e = (i) => {
        var m = Te(),
          b = Me(m);
        {
          var w = (o) => {
              var n = pa();
              u(o, n);
            },
            r = (o) => {
              var n = Te(),
                c = Me(n);
              (ze(
                c,
                17,
                () => a(F),
                (S) => S.id,
                (S, E) => {
                  var M = Te(),
                    O = Me(M);
                  {
                    var R = (H) => {
                      const l = je(() => q[a(E).itemId]);
                      var f = ga(),
                        _ = t(f),
                        T = t(_),
                        Z = t(T);
                      {
                        var Ae = (B) => {
                            var me = fa();
                            (L(() => {
                              (ee(me, 'src', a(l).iconSrc),
                                ee(me, 'alt', a(l).name));
                            }),
                              u(B, me));
                          },
                          we = (B) => {
                            var me = ba(),
                              Oe = t(me, !0);
                            (e(me),
                              L((Be) => g(Oe, Be), [() => se(a(l).slot)]),
                              u(B, me));
                          };
                        A(Z, (B) => {
                          a(l).iconSrc ? B(Ae) : B(we, !1);
                        });
                      }
                      (e(T), e(_));
                      var Ce = s(_, 2),
                        ge = t(Ce),
                        ce = t(ge),
                        k = t(ce),
                        D = t(k, !0);
                      e(k);
                      var $ = s(k, 2),
                        qe = s(t($)),
                        Ie = t(qe, !0);
                      (e(qe), e($), e(ce));
                      var te = s(ce, 2),
                        v = t(te),
                        V = t(v, !0);
                      (e(v), ie(2), e(te), e(ge));
                      var U = s(ge, 2),
                        Le = t(U, !0);
                      (e(U),
                        e(Ce),
                        e(f),
                        L(
                          (B) => {
                            (g(D, a(l).name),
                              g(Ie, a(l).slot),
                              Re(v, 1, B),
                              g(
                                V,
                                a(l).rarity === 'common'
                                  ? 'COMUM'
                                  : a(l).rarity === 'rare'
                                    ? 'RARO'
                                    : a(l).rarity === 'epic'
                                      ? 'ÉPICO'
                                      : 'LENDÁRIO',
                              ),
                              g(Le, a(l).shortEffect));
                          },
                          [
                            () =>
                              `rounded-full px-2 py-[2px] text-[0.65rem] ${fe(a(l).rarity)}`,
                          ],
                        ),
                        u(H, f));
                    };
                    A(O, (H) => {
                      q[a(E).itemId] && H(R);
                    });
                  }
                  u(S, M);
                },
              ),
                u(o, n));
            };
          A(
            b,
            (o) => {
              a(F).length === 0 ? o(w) : o(r, !1);
            },
            !0,
          );
        }
        u(i, m);
      };
    A(W, (i) => {
      a(Y) ? i(he) : i(_e, !1);
    });
  }
  e(j);
  var de = s(j, 2),
    be = s(t(de), 2);
  {
    var ye = (i) => {
        var m = xa();
        u(i, m);
      },
      ke = (i) => {
        var m = Ea(),
          b = t(m);
        {
          var w = (l) => {
            var f = ha(),
              _ = s(t(f)),
              T = t(_);
            (e(_),
              ie(),
              e(f),
              L(() =>
                g(
                  T,
                  `${a(p).streakProtectionDays ?? ''}
              dia${a(p).streakProtectionDays > 1 ? 's' : ''}`,
                ),
              ),
              u(l, f));
          };
          A(b, (l) => {
            a(p).streakProtectionDays > 0 && l(w);
          });
        }
        var r = s(b, 2);
        {
          var o = (l) => {
            var f = _a(),
              _ = s(t(f)),
              T = t(_);
            (e(_),
              ie(),
              e(f),
              L(
                (Z) => g(T, `${Z ?? ''}%`),
                [() => Math.round((a(p).goldMultiplier - 1) * 100)],
              ),
              u(l, f));
          };
          A(r, (l) => {
            a(p).goldMultiplier !== 1 && l(o);
          });
        }
        var n = s(r, 2);
        {
          var c = (l) => {
            var f = ya(),
              _ = s(t(f)),
              T = t(_);
            (e(_),
              ie(),
              e(f),
              L(() => g(T, `+${a(p).sanctuaryBonusExtraPercent ?? ''}%`)),
              u(l, f));
          };
          A(n, (l) => {
            a(p).sanctuaryBonusExtraPercent > 0 && l(c);
          });
        }
        var S = s(n, 2);
        {
          var E = (l) => {
            var f = wa(),
              _ = s(t(f)),
              T = t(_);
            (e(_),
              ie(),
              e(f),
              L(
                (Z) => g(T, `+${Z ?? ''}%`),
                [() => Math.round(a(p).projectBonusExtraFraction * 100)],
              ),
              u(l, f));
          };
          A(S, (l) => {
            a(p).projectBonusExtraFraction > 0 && l(E);
          });
        }
        var M = s(S, 2);
        {
          var O = (l) => {
            var f = Sa(),
              _ = s(t(f)),
              T = t(_);
            (e(_),
              ie(),
              e(f),
              L(() =>
                g(T, `menos ${a(p).rarityThresholdDelta ?? ''} passo(s)`),
              ),
              u(l, f));
          };
          A(M, (l) => {
            a(p).rarityThresholdDelta > 0 && l(O);
          });
        }
        var R = s(M, 2);
        {
          var H = (l) => {
            var f = Pa();
            u(l, f);
          };
          A(R, (l) => {
            a(p).streakProtectionDays > 0 ||
              a(p).goldMultiplier !== 1 ||
              a(p).sanctuaryBonusExtraPercent > 0 ||
              a(p).projectBonusExtraFraction > 0 ||
              a(p).rarityThresholdDelta > 0 ||
              l(H);
          });
        }
        (e(m), u(i, m));
      };
    A(be, (i) => {
      a(p) ? i(ke, !1) : i(ye);
    });
  }
  (e(de), e(X), u(xe, X), Ne());
}
var Ca = x('<img class="w-full h-full object-cover rounded-full"/>'),
  qa = x('<div class="w-full h-full rounded-full bg-slate-700"></div>'),
  La = x(
    `<!> <!> <div class="min-h-full lmup-bg-taverna bg-slate-950/60"><div class="flex flex-col gap-6"><!> <div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><section class="col-span-1 lg:col-span-2 bg-slate-900/50 border-2 border-amber-400/80 hover:border-amber-300 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-[0_0_24px_rgba(251,191,36,0.45)] relative overflow-hidden transition-all"><div class="absolute inset-0 bg-gradient-to-br from-amber-400/10 via-transparent to-transparent pointer-events-none"></div> <div class="relative shrink-0"><div class="relative w-32 h-32 rounded-full shadow-2xl"><!> <img src="/art/hero-avatar-default.png" alt="Moldura do Avatar" class="absolute inset-0 w-full h-full pointer-events-none" style="transform: scale(1.40);"/></div> <div class="absolute -bottom-3 inset-x-0 flex justify-center"><span class="bg-[#ffb74d] text-slate-950 font-bold text-sm px-3 py-1 rounded-full border-2 border-[#3a2f25] shadow-sm"> </span></div></div> <div class="flex-1 w-full text-center sm:text-left mt-4 sm:mt-0 relative"><div class="flex items-center justify-center sm:justify-start gap-3"><h2 class="text-2xl font-bold text-slate-100"> </h2> <button type="button" class="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-primary hover:bg-slate-800 transition-colors" title="Editar Perfil">✏️</button></div> <p class="text-[#ffb74d]/80 font-medium mb-4"> </p> <div class="flex items-center justify-between text-xs text-slate-400 mb-1"><span>XP</span> <span class="inline-flex items-center gap-1"><img src="/art/icones/icon-xp.png" alt="XP" class="h-4 w-4 object-contain"/> <span> </span></span></div> <div class="h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50"><div class="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"></div></div> <div class="mt-4 grid grid-cols-2 gap-4 text-xs"><div class="flex items-center gap-2"><img src="/art/icones/gold-icon.png" alt="Gold" class="h-6 w-6 object-contain"/> <div><p class="text-[0.65rem] uppercase tracking-[0.18em] text-amber-300/80">Gold</p> <p class="text-sm font-semibold text-amber-200"> </p></div></div> <div class="flex items-center gap-2"><span class="text-lg">🍖</span> <div><p class="text-[0.65rem] uppercase tracking-[0.18em] text-emerald-300/80">Comida</p> <p class="text-sm font-semibold text-emerald-200"> </p></div></div></div></div></section> <section class="col-span-1 bg-slate-900/50 border-2 border-amber-400/80 hover:border-amber-300 rounded-2xl p-6 flex flex-col items-center text-center shadow-[0_0_24px_rgba(251,191,36,0.45)] relative overflow-hidden transition-all"><div class="absolute top-0 right-0 p-3 opacity-50">🐾</div> <h3 class="text-slate-300 font-semibold mb-4 w-full text-left">Companheiro</h3> <img class="w-24 h-24 object-contain drop-shadow-xl animate-pulse-slow"/> <h4 class="text-lg font-bold text-slate-200 mt-2"> </h4> <p class="text-sm text-slate-500"> </p> <button type="button" class="mt-4 w-full py-2 text-sm text-slate-400 hover:text-primary hover:bg-slate-800 rounded-lg transition-colors">Trocar Companheiro</button></section></div> <!> <div class="mt-6 flex justify-center"><div class="relative inline-flex items-center justify-center rounded-2xl border border-amber-500/70 bg-gradient-to-r from-slate-950 via-amber-900/40 to-slate-950 px-8 md:px-12 py-3 shadow-[0_0_35px_rgba(245,158,11,0.65)]"><div class="pointer-events-none absolute inset-0 opacity-50" aria-hidden="true"><div class="absolute inset-[6px] rounded-2xl border border-amber-300/40"></div></div> <h2 class="relative z-[1] font-serif text-xl md:text-2xl font-extrabold tracking-wide text-amber-100">Serviços da Taverna</h2></div></div> <div class="grid grid-cols-2 md:grid-cols-4 gap-4"><a href="/loja" class="p-4 bg-slate-900/50 border-2 border-amber-400/80 hover:border-amber-300 hover:bg-slate-800/80 rounded-xl flex flex-col items-center gap-3 transition-all shadow-[0_0_18px_rgba(251,191,36,0.35)] group" role="button"><img src="/art/icones/shop-icon.png" alt="Loja" class="w-20 h-20 group-hover:scale-110 transition-transform"/> <span class="font-medium text-slate-300">Loja</span></a> <a href="/trofeus" class="p-4 bg-slate-900/50 border-2 border-amber-400/80 hover:border-amber-300 hover:bg-slate-800/80 rounded-xl flex flex-col items-center gap-3 transition-all shadow-[0_0_18px_rgba(251,191,36,0.35)] group" role="button"><img src="/art/icones/trophy-icon.png" alt="Sala de Troféus" class="w-20 h-20 group-hover:scale-110 transition-transform"/> <span class="font-medium text-slate-300">Sala de Troféus</span></a> <a href="/inventario" class="p-4 bg-slate-900/50 border-2 border-amber-400/80 hover:border-amber-300 hover:bg-slate-800/80 rounded-xl flex flex-col items-center gap-3 transition-all shadow-[0_0_18px_rgba(251,191,36,0.35)] group" role="button"><img src="/art/icones/bag-icon.png" alt="Inventário" class="w-20 h-20 group-hover:scale-110 transition-transform"/> <span class="font-medium text-slate-300">Inventário</span></a> <a href="/bestiario" class="p-4 bg-slate-900/50 border-2 border-amber-400/80 hover:border-amber-300 hover:bg-slate-800/80 rounded-xl flex flex-col items-center gap-3 transition-all shadow-[0_0_18px_rgba(251,191,36,0.35)] group" role="button"><img src="/art/icones/book-icon.png" alt="Bestiário" class="w-20 h-20 group-hover:scale-110 transition-transform"/> <span class="font-medium text-slate-300">Bestiário</span></a></div></div> <style>.animate-pulse-slow {
      animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes pulse {
      0%,
      100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.9;
        transform: scale(1.05);
      }
    }</style></div>`,
    1,
  );
function Ua(xe, y) {
  De(y, !0);
  const G = [
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
    q = [0, 0, 100, 300];
  function K(v) {
    return v >= q[3] ? 3 : v >= q[2] ? 2 : 1;
  }
  function ue(v, V) {
    const U = Math.min(Math.max(V ?? 1, 1), 3);
    return v.replace(/-\d+(\.\w+)$/, `-${U}$1`);
  }
  const ve = {
    id: 1,
    name: 'Carregando...',
    title: '...',
    level: 0,
    xpCurrent: 0,
    xpNext: 100,
    avatarUrl: '',
    totalXpEarned: 0,
    currentStreak: 0,
    lastCompletionDate: '',
    activeCompanionId: 1,
    gold: 0,
    food: 0,
  };
  let h = Ee(ve),
    ne = Ee([]);
  const J = Pe(() => z.profile.get(1)),
    F = Pe(() => z.companions.toArray());
  Fe(() => {
    const v = J.subscribe((U) => {
        Object.assign(h, U || ve);
        const B = h.level || 1;
        ((h.level = B), (h.title = Ue(B)));
      }),
      V = F.subscribe((U) => {
        ne.splice(0, ne.length, ...(U || []));
      });
    return () => {
      (v.unsubscribe(), V.unsubscribe());
    };
  });
  let p = Q(!1),
    Y = Q(!1);
  const re = je(() =>
      h.xpNext > 0 ? Math.min(100, (h.xpCurrent / h.xpNext) * 100) : 0,
    ),
    ae = je(() => {
      if (G.length === 0)
        return {
          id: 0,
          name: 'Companheiro',
          type: 'Companion',
          imagePath: '/art/pets/lobo-1.webp',
        };
      const v = new He();
      for (const Se of ne) Se.id != null && v.set(Se.id, Se);
      const V = h.activeCompanionId ?? 1,
        U = G.find((Se) => Se.id === V) ?? G.find((Se) => Se.id === 1),
        Le = v.get(U.id),
        B = Le?.name,
        me = B && B.trim().length > 0 ? B : U.name,
        Oe = Le?.foodInvested ?? 0,
        Be = Le?.evolutionStage ?? K(Oe);
      return {
        id: U.id,
        name: me,
        type: U.type,
        imagePath: ue(U.imagePath, Be),
      };
    });
  var pe = La(),
    le = Me(pe);
  {
    var oe = (v) => {
      ra(v, {
        get profile() {
          return h;
        },
        close: () => C(Y, !1),
      });
    };
    A(le, (v) => {
      a(Y) && v(oe);
    });
  }
  var I = s(le, 2);
  {
    var fe = (v) => {
      ca(v, { close: () => C(p, !1) });
    };
    A(I, (v) => {
      a(p) && v(fe);
    });
  }
  var se = s(I, 2),
    X = t(se),
    d = t(X);
  Ze(d, {
    title: 'Taverna do Herói',
    subtitle:
      'Bem vindo de volta guerreiro! descanse e prepare-se para novas aventuras.',
    iconSrc: '/art/icones/icon-taverna.png',
    align: 'center',
  });
  var P = s(d, 2),
    N = t(P),
    j = s(t(N), 2),
    W = t(j),
    he = t(W);
  {
    var _e = (v) => {
        var V = Ca();
        (L(() => {
          (ee(V, 'src', h.avatarUrl), ee(V, 'alt', h.name));
        }),
          u(v, V));
      },
      de = (v) => {
        var V = qa();
        u(v, V);
      };
    A(he, (v) => {
      h.avatarUrl ? v(_e) : v(de, !1);
    });
  }
  (ie(2), e(W));
  var be = s(W, 2),
    ye = t(be),
    ke = t(ye);
  (e(ye), e(be), e(j));
  var i = s(j, 2),
    m = t(i),
    b = t(m),
    w = t(b, !0);
  e(b);
  var r = s(b, 2);
  ((r.__click = () => C(Y, !0)), e(m));
  var o = s(m, 2),
    n = t(o, !0);
  e(o);
  var c = s(o, 2),
    S = s(t(c), 2),
    E = s(t(S), 2),
    M = t(E);
  (e(E), e(S), e(c));
  var O = s(c, 2),
    R = t(O);
  e(O);
  var H = s(O, 2),
    l = t(H),
    f = s(t(l), 2),
    _ = s(t(f), 2),
    T = t(_, !0);
  (e(_), e(f), e(l));
  var Z = s(l, 2),
    Ae = s(t(Z), 2),
    we = s(t(Ae), 2),
    Ce = t(we, !0);
  (e(we), e(Ae), e(Z), e(H), e(i), e(N));
  var ge = s(N, 2),
    ce = s(t(ge), 4),
    k = s(ce, 2),
    D = t(k, !0);
  e(k);
  var $ = s(k, 2),
    qe = t($, !0);
  e($);
  var Ie = s($, 2);
  ((Ie.__click = () => C(p, !0)), e(ge), e(P));
  var te = s(P, 2);
  (Aa(te, {}),
    ie(4),
    e(X),
    ie(2),
    e(se),
    L(() => {
      (g(ke, `Lvl ${h.level ?? ''}`),
        g(w, h.name),
        g(n, h.title),
        g(M, `${h.xpCurrent ?? ''} / ${h.xpNext ?? ''}`),
        Je(R, `width: ${a(re)}%;`),
        g(T, h.gold ?? 0),
        g(Ce, h.food ?? 0),
        ee(ce, 'src', a(ae).imagePath),
        ee(ce, 'alt', a(ae).name),
        g(D, a(ae).name),
        g(qe, a(ae).type));
    }),
    u(xe, pe),
    Ne());
}
Ge(['click']);
export { Ua as component };
