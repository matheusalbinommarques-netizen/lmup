import '../chunks/DsnmJJEf.js';
import {
  v as lt,
  p as Je,
  c as ze,
  s as l,
  o as Ke,
  f as v,
  t as M,
  d as u,
  e as Ye,
  j as m,
  h as r,
  b as s,
  g as e,
  r as o,
  k as R,
  l as C,
  n as ct,
  q as Ze,
  m as et,
  y as dt,
  z as mt,
} from '../chunks/C4tos-D-.js';
import { h as ut } from '../chunks/BYYbvhAJ.js';
import { i as F } from '../chunks/D7NEdK74.js';
import { e as Oe } from '../chunks/BYKdWbGi.js';
import { s as K, a as O } from '../chunks/B28y5Mvi.js';
import { l as me, d as re } from '../chunks/CUrLQr9X.js';
import { b as tt } from '../chunks/BNQQrpbk.js';
import { P as pt } from '../chunks/CpUvk0iO.js';
function at(t) {
  return {
    totalXp: 0,
    streak: 0,
    level: 1,
    completedMissions: 0,
    completedEpicOrLegendary: 0,
    completedLegendary: 0,
    maxTasksInSingleArea: 0,
    completedAreasCount: 0,
    maxAreaLevel: 0,
    areasAtLeastLevel20: 0,
    unlockedCompanionsCount: 0,
    hasWolf: !1,
    hasDragon: !1,
    allCompanionsUnlocked: !1,
    companionInteractions: 0,
    ...t,
  };
}
const ot = [
    {
      id: 'primeiro-passo',
      title: 'O Primeiro Passo',
      description: 'Complete sua primeira missão.',
      icon: '/art/badge-icons/primeiro-passo.png',
      rarity: 'comum',
      category: 'missoes',
      condition: ({ completedMissions: t }) => t >= 1,
    },
    {
      id: 'aventureiro',
      title: 'Aventureiro',
      description: 'Complete 10 missões.',
      icon: '/art/badge-icons/aventureiro.png',
      rarity: 'comum',
      category: 'missoes',
      condition: ({ completedMissions: t }) => t >= 10,
    },
    {
      id: 'veterano',
      title: 'Veterano',
      description: 'Complete 100 missões.',
      icon: '/art/badge-icons/veterano.png',
      rarity: 'raro',
      category: 'missoes',
      condition: ({ completedMissions: t }) => t >= 100,
    },
    {
      id: 'cacador-missoes',
      title: 'Caçador de Missões',
      description: 'Complete 500 missões.',
      icon: '/art/badge-icons/cacador-missoes.png',
      rarity: 'épico',
      category: 'missoes',
      condition: ({ completedMissions: t }) => t >= 500,
    },
    {
      id: 'lenda-viva',
      title: 'Lenda Viva',
      description: 'Complete 1000 missões.',
      icon: '/art/badge-icons/lenda-viva.png',
      rarity: 'lendário',
      category: 'missoes',
      condition: ({ completedMissions: t }) => t >= 1e3,
    },
    {
      id: 'matador-gigantes',
      title: 'Matador de Gigantes',
      description: 'Complete sua primeira missão Épica ou Lendária.',
      icon: '/art/badge-icons/matador-gigantes.png',
      rarity: 'raro',
      category: 'missoes',
      condition: ({ completedEpicOrLegendary: t }) => t >= 1,
    },
    {
      id: 'exterminador',
      title: 'Exterminador',
      description: 'Complete 50 missões Lendárias.',
      icon: '/art/badge-icons/exterminador.png',
      rarity: 'épico',
      category: 'missoes',
      condition: ({ completedLegendary: t }) => t >= 50,
    },
    {
      id: 'acendendo-tocha',
      title: 'Acendendo a Tocha',
      description: 'Mantenha um streak de 3 dias.',
      icon: '/art/badge-icons/acendendo-tocha.png',
      rarity: 'comum',
      category: 'consistencia',
      condition: ({ streak: t }) => t >= 3,
    },
    {
      id: 'em-chamas',
      title: 'Em Chamas!',
      description: 'Mantenha um streak de 7 dias.',
      icon: '/art/badge-icons/em-chamas.png',
      rarity: 'raro',
      category: 'consistencia',
      condition: ({ streak: t }) => t >= 7,
    },
    {
      id: 'fogo-controlado',
      title: 'Fogo Controlado',
      description: 'Mantenha um streak de 30 dias.',
      icon: '/art/badge-icons/fogo-controlado.png',
      rarity: 'épico',
      category: 'consistencia',
      condition: ({ streak: t }) => t >= 30,
    },
    {
      id: 'a-fenix',
      title: 'A Fênix',
      description: 'Mantenha um streak de 100 dias.',
      icon: '/art/badge-icons/a-fenix.png',
      rarity: 'lendário',
      category: 'consistencia',
      condition: ({ streak: t }) => t >= 100,
    },
    {
      id: 'novato',
      title: 'Novato',
      description: 'Alcance o Nível 5.',
      icon: '/art/badge-icons/novato.png',
      rarity: 'comum',
      category: 'progresso',
      condition: ({ level: t }) => t >= 5,
    },
    {
      id: 'perito',
      title: 'Perito',
      description: 'Alcance o Nível 25.',
      icon: '/art/badge-icons/perito.png',
      rarity: 'raro',
      category: 'progresso',
      condition: ({ level: t }) => t >= 25,
    },
    {
      id: 'mestre',
      title: 'Mestre',
      description: 'Alcance o Nível 50.',
      icon: '/art/badge-icons/mestre.png',
      rarity: 'épico',
      category: 'progresso',
      condition: ({ level: t }) => t >= 50,
    },
    {
      id: 'semideus',
      title: 'Semideus',
      description: 'Alcance o Nível 100.',
      icon: '/art/badge-icons/semideus.png',
      rarity: 'lendário',
      category: 'progresso',
      condition: ({ level: t }) => t >= 100,
    },
    {
      id: 'acumulador',
      title: 'Acumulador',
      description: 'Ganhe 10.000 XP no total.',
      icon: '/art/badge-icons/acumulador.png',
      rarity: 'raro',
      category: 'progresso',
      condition: ({ totalXp: t }) => t >= 1e4,
    },
    {
      id: 'focado',
      title: 'Focado',
      description: 'Adicione 5 missões a uma única Área.',
      icon: '/art/badge-icons/focado.png',
      rarity: 'comum',
      category: 'areas',
      condition: ({ maxTasksInSingleArea: t }) => t >= 5,
    },
    {
      id: 'especialista',
      title: 'Especialista',
      description: 'Leve uma Área ao nível 10.',
      icon: '/art/badge-icons/especialista.png',
      rarity: 'raro',
      category: 'areas',
      condition: ({ maxAreaLevel: t }) => t >= 10,
    },
    {
      id: 'mestre-area',
      title: 'Mestre de Área',
      description: 'Leve uma Área ao nível 25.',
      icon: '/art/badge-icons/mestre-area.png',
      rarity: 'épico',
      category: 'areas',
      condition: ({ maxAreaLevel: t }) => t >= 25,
    },
    {
      id: 'multitarefa',
      title: 'Multitarefa',
      description: 'Complete pelo menos uma missão em 5 Áreas diferentes.',
      icon: '/art/badge-icons/multitarefa.png',
      rarity: 'raro',
      category: 'areas',
      condition: ({ completedAreasCount: t }) => t >= 5,
    },
    {
      id: 'polimata',
      title: 'Polímata',
      description: 'Leve 3 Áreas diferentes ao nível 20.',
      icon: '/art/badge-icons/polimata.png',
      rarity: 'lendário',
      category: 'areas',
      condition: ({ areasAtLeastLevel20: t }) => t >= 3,
    },
    {
      id: 'o-semeador',
      title: 'O Semeador',
      description: 'Inicie seu Ecossistema (Alcance o Estágio 1 - Semente).',
      icon: '/art/badge-icons/o-semeador.png',
      rarity: 'comum',
      category: 'eco',
      condition: ({ totalXp: t }) => t >= 1,
    },
    {
      id: 'brotando',
      title: 'Brotando',
      description:
        'Faça seu Ecossistema crescer (Alcance o Estágio 2 - Broto).',
      icon: '/art/badge-icons/brotando.png',
      rarity: 'raro',
      category: 'eco',
      condition: ({ totalXp: t }) => t >= 2500,
    },
    {
      id: 'arvore-da-vida',
      title: 'Árvore da Vida',
      description: 'Expanda sua floresta (Alcance o Estágio 3 - Árvore).',
      icon: '/art/badge-icons/arvore-vigorosa.png',
      rarity: 'épico',
      category: 'eco',
      condition: ({ totalXp: t }) => t >= 7500,
    },
    {
      id: 'guardiao-floresta',
      title: 'Guardião da Floresta',
      description: 'Alcance o estágio final do seu Ecossistema.',
      icon: '/art/badge-icons/guardião-floresta.png',
      rarity: 'lendário',
      category: 'eco',
      condition: ({ totalXp: t }) => t >= 12e3,
    },
    {
      id: 'novo-amigo',
      title: 'Novo Amigo',
      description: 'Adquira seu primeiro companheiro.',
      icon: '/art/badge-icons/novo-amigo.png',
      rarity: 'comum',
      category: 'companheiros',
      condition: ({ unlockedCompanionsCount: t }) => t >= 1,
    },
    {
      id: 'melhores-amigos',
      title: 'Melhores Amigos',
      description: 'Alimente ou interaja com seu companheiro 10 vezes.',
      icon: '/art/badge-icons/melhores-amigos.png',
      rarity: 'raro',
      category: 'companheiros',
      condition: ({ companionInteractions: t }) => t >= 10,
      future: !0,
    },
    {
      id: 'domador-lobos',
      title: 'Domador de Lobos',
      description: 'Adote o companheiro Lobo.',
      icon: '/art/badge-icons/domador-lobos.png',
      rarity: 'raro',
      category: 'companheiros',
      condition: ({ hasWolf: t }) => t,
    },
    {
      id: 'mae-pai-dragao',
      title: 'Mãe/Pai de Dragão',
      description: 'Adote o companheiro Dragão.',
      icon: '/art/badge-icons/mae-pai-dragao.png',
      rarity: 'épico',
      category: 'companheiros',
      condition: ({ hasDragon: t }) => t,
    },
    {
      id: 'colecionador',
      title: 'Colecionador',
      description:
        'Desbloqueie todos os companheiros disponíveis no Bestiário.',
      icon: '/art/badge-icons/colecionador.png',
      rarity: 'lendário',
      category: 'companheiros',
      condition: ({ allCompanionsUnlocked: t }) => t,
    },
    {
      id: 'recruta',
      title: 'Recruta',
      description: 'Entre ou crie um Clã.',
      icon: '/art/badge-icons/recruta.png',
      rarity: 'comum',
      category: 'sociais',
      condition: () => !1,
      future: !0,
    },
    {
      id: 'trabalho-equipe',
      title: 'Trabalho em Equipe',
      description: 'Complete uma missão de Clã.',
      icon: '/art/badge-icons/trabalho-equipe.png',
      rarity: 'raro',
      category: 'sociais',
      condition: () => !1,
      future: !0,
    },
    {
      id: 'membro-fundador',
      title: 'Membro Fundador',
      description: 'Seja o líder de um Clã com 10 membros.',
      icon: '/art/badge-icons/membro-fundador.png',
      rarity: 'épico',
      category: 'sociais',
      condition: () => !1,
      future: !0,
    },
    {
      id: 'primeira-compra',
      title: 'Primeira Compra',
      description: 'Compre seu primeiro item na Loja.',
      icon: '/art/badge-icons/primeira-compra.png',
      rarity: 'comum',
      category: 'economia',
      condition: () => !1,
      future: !0,
    },
    {
      id: 'cliente-fiel',
      title: 'Cliente Fiel',
      description: 'Gaste 1.000 moedas na Loja.',
      icon: '/art/badge-icons/cliente-fiel.png',
      rarity: 'raro',
      category: 'economia',
      condition: () => !1,
      future: !0,
    },
    {
      id: 'pao-duro',
      title: 'Pão-Duro',
      description: 'Acumule 5.000 moedas.',
      icon: '/art/badge-icons/pao-duro.png',
      rarity: 'raro',
      category: 'economia',
      condition: () => !1,
      future: !0,
    },
    {
      id: 'magnata',
      title: 'Magnata',
      description: 'Acumule 50.000 moedas.',
      icon: '/art/badge-icons/magnata.png',
      rarity: 'épico',
      category: 'economia',
      condition: () => !1,
      future: !0,
    },
    {
      id: 'arsenal-completo',
      title: 'Arsenal Completo',
      description: 'Possua 10 itens diferentes no inventário.',
      icon: '/art/badge-icons/arsenal-completo.png',
      rarity: 'raro',
      category: 'economia',
      condition: () => !1,
      future: !0,
    },
  ],
  vt = [
    {
      id: 'sec-missoes',
      title: '1. Conquistas de Missões',
      subtitle: 'Focadas em completar as tarefas diárias.',
      category: 'missoes',
    },
    {
      id: 'sec-consistencia',
      title: '2. Conquistas de Consistência',
      subtitle:
        'Mantenha a chama acesa dia após dia para fortalecer seu streak.',
      category: 'consistencia',
    },
    {
      id: 'sec-progresso',
      title: '3. Conquistas de Progressão',
      subtitle: 'Representam o quanto você já caminhou acumulando experiência.',
      category: 'progresso',
    },
    {
      id: 'sec-areas',
      title: '4. Conquistas de Áreas',
      subtitle:
        'Incentivam equilíbrio ou foco em áreas específicas do seu reino.',
      category: 'areas',
    },
    {
      id: 'sec-eco',
      title: '5. Conquistas do Sistema Ecológico',
      subtitle:
        'Seu jardim de foco reage conforme você mantém o ritmo e cuida das missões.',
      category: 'eco',
    },
    {
      id: 'sec-companheiros',
      title: '6. Conquistas de Companheiros',
      subtitle:
        'Laços com seus companheiros mágicos conforme você explora o bestiário.',
      category: 'companheiros',
    },
    {
      id: 'sec-sociais',
      title: '7. Conquistas Sociais',
      subtitle:
        'Voltadas para interações em grupo e missões compartilhadas (futuro).',
      category: 'sociais',
    },
    {
      id: 'sec-economia',
      title: '8. Conquistas de Economia',
      subtitle:
        'Relacionadas às moedas do reino, compras e coleção de itens (futuro).',
      category: 'economia',
    },
  ],
  Qe = ['acendendo-tocha', 'em-chamas', 'novato', 'perito', 'acumulador'];
var gt = v(
    '<strong>Editando conquistas em destaque...</strong> Selecione até 5 conquistas desbloqueadas.',
    1,
  ),
  bt = v(
    '<button type="button" class="mt-1 rounded-full border border-amber-400/70 bg-amber-500/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-amber-200 hover:bg-amber-500/20">Personalizar destaques</button>',
  ),
  ft = v('<img class="h-full w-full rounded-full object-cover"/>'),
  xt = v(
    '<img src="/art/heroi.png" alt="Avatar do herói" class="h-full w-full rounded-full object-cover"/>',
  ),
  yt = v('<img class="h-10 w-10 object-contain"/>'),
  _t = v('<span> </span>'),
  ht = v(
    '<button type="button"><div><!></div> <div class="flex-1"><div class="flex flex-wrap items-center gap-2"><span> </span> <span> </span></div> <p class="mt-1 text-[0.7rem] text-slate-300/85"> </p></div></button>',
  ),
  At = v('<p class="mt-2 text-[0.7rem] text-amber-300"> </p>'),
  kt = v(
    '<div class="mb-5 rounded-2xl border border-amber-400/40 bg-slate-950/90 px-4 py-3 shadow-[0_0_25px_rgba(251,191,36,0.4)]"><div class="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"><p class="text-[0.72rem] text-slate-200/85">Escolha até <strong>5 conquistas desbloqueadas</strong> para aparecerem ao lado do seu avatar na Sala de Troféus.</p> <div class="flex gap-2 text-[0.7rem]"><button type="button" class="rounded-full border border-slate-600 bg-slate-900 px-3 py-1 text-slate-200 hover:bg-slate-800">Cancelar</button> <button type="button" class="rounded-full border border-amber-400 bg-amber-500/90 px-3 py-1 font-semibold text-slate-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"> </button></div></div> <div class="grid gap-3 md:grid-cols-2"></div> <!></div>',
  ),
  Ct = v(
    '<div class="col-span-full rounded-2xl border border-slate-700/70 bg-slate-950/80 px-4 py-3 text-xs text-slate-300">Você ainda não selecionou conquistas em destaque. Clique em <strong>“Personalizar destaques”</strong> para escolher.</div>',
  ),
  Lt = v('<img class="h-12 w-12 object-contain"/>'),
  wt = v('<span> </span>'),
  Et = v(
    '<article><div><!></div> <div class="flex-1"><div class="flex items-center gap-2"><h3> </h3> <span> </span></div> <p class="mt-1 text-[0.7rem] text-slate-300/85"> </p></div></article>',
  ),
  St =
    v(`<section class="w-full"><div class="mx-auto max-w-4xl rounded-3xl border border-amber-400/60 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-6 shadow-[0_0_40px_rgba(251,191,36,0.45)] md:px-8 md:py-7"><div class="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div class="space-y-1"><p class="text-[0.65rem] uppercase tracking-[0.25em] text-amber-300/85">Avatar &amp; conquistas</p> <h2 class="text-xl font-bold text-white md:text-2xl">Conquistas em destaque</h2> <p class="text-xs text-slate-300/80">Veja rapidinho como está seu nível, XP total e streak atual. Escolha
          quais troféus aparecem ao lado do seu avatar.</p> <div class="mt-2 text-[0.7rem] text-amber-200/80"><!></div></div> <div class="flex items-center gap-3 rounded-2xl border border-amber-400/80 bg-slate-950/90 px-3 py-2 shadow-[0_0_30px_rgba(251,191,36,0.55)]"><div class="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-amber-400/80 bg-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.7)]"><!></div> <div class="text-xs"><div class="text-slate-300/90">Nível do avatar</div> <div class="text-sm font-semibold text-amber-300"> </div> <div class="text-[0.65rem] text-amber-200/80"> </div></div></div></div> <!> <div class="grid gap-3 md:grid-cols-2"><!></div></div></section>`);
function qt(t, Y) {
  Je(Y, !0);
  const G = {
    id: 1,
    name: 'Seu herói',
    title: 'Nobre aventureiro',
    level: 1,
    xpCurrent: 0,
    xpNext: 100,
    avatarUrl: '',
    totalXpEarned: 0,
    currentStreak: 0,
    lastCompletionDate: null,
    activeCompanionId: 1,
    gold: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  let L = ze(G);
  const H = 100;
  let z = l(0),
    U = l(0);
  const ie = R(() => tt(e(z))),
    se = R(() => e(ie).level ?? 1);
  let ue = l(0),
    pe = l(0),
    ve = l(0),
    ge = l(0),
    be = l(0),
    fe = l(0),
    xe = l(0),
    ye = l(0),
    _e = l(!1),
    Ee = l(!1),
    Se = l(!1),
    Xe = 0,
    W = l(!1),
    w = l(ze([])),
    Z = l(!1),
    T = l(null);
  Ke(() => {
    const a = me(() => re.profile.get(1)).subscribe((A) => {
        const n = A ?? G;
        (Object.assign(L, n),
          s(z, n.totalXpEarned ?? 0, !0),
          s(U, n.currentStreak ?? 0, !0));
      }),
      i = me(() => re.tasks.toArray()).subscribe((A) => {
        const n = A ?? [],
          c = n.filter((d) => d.completed);
        (s(ue, c.length, !0),
          s(
            pe,
            c.filter((d) => d.rarity === 'epic' || d.rarity === 'legendary')
              .length,
            !0,
          ),
          s(ve, c.filter((d) => d.rarity === 'legendary').length, !0));
        const k = {},
          b = [],
          te = {};
        for (const d of n) {
          const f = Number(d.areaId),
            oe = Number(d.xp) || 0;
          Number.isFinite(f) &&
            ((k[f] = (k[f] ?? 0) + 1),
            d.completed &&
              (b.includes(f) || b.push(f), (te[f] = (te[f] ?? 0) + oe)));
        }
        (s(
          ge,
          Object.values(k).reduce((d, f) => (f > d ? f : d), 0),
          !0,
        ),
          s(be, b.length, !0));
        let ae = 0,
          j = 0;
        const p = Object.values(te);
        for (const d of p) {
          const f = Math.floor(d / H);
          (f > ae && (ae = f), f >= 20 && (j += 1));
        }
        (s(fe, ae, !0), s(xe, j, !0));
      }),
      E = me(() => re.companions.toArray()).subscribe((A) => {
        const n = A ?? [],
          c = n.filter((b) => b.unlocked === !0);
        s(ye, c.length, !0);
        const k = (b) => (b ?? '').toLowerCase();
        (s(
          _e,
          c.some(
            (b) =>
              k(b.key).includes('wolf') ||
              k(b.name).includes('lobo') ||
              b.id === 1,
          ),
          !0,
        ),
          s(
            Ee,
            c.some(
              (b) =>
                k(b.key).includes('drag') ||
                k(b.name).includes('drag') ||
                b.id === 3,
            ),
            !0,
          ),
          s(Se, n.length > 0 && c.length === n.length, !0));
      });
    return () => {
      (a.unsubscribe(), i.unsubscribe(), E.unsubscribe());
    };
  });
  const he = R(() =>
      ot.map((a) => {
        const i = at({
          totalXp: e(z),
          streak: e(U),
          level: e(se),
          completedMissions: e(ue),
          completedEpicOrLegendary: e(pe),
          completedLegendary: e(ve),
          maxTasksInSingleArea: e(ge),
          completedAreasCount: e(be),
          maxAreaLevel: e(fe),
          areasAtLeastLevel20: e(xe),
          unlockedCompanionsCount: e(ye),
          hasWolf: e(_e),
          hasDragon: e(Ee),
          allCompanionsUnlocked: e(Se),
          companionInteractions: Xe,
        });
        return { ...a, unlocked: a.condition(i) };
      }),
    ),
    Ae = R(() => e(he).filter((a) => a.unlocked && !a.future)),
    qe = R(() =>
      L.highlightAchievementIds && L.highlightAchievementIds.length > 0
        ? L.highlightAchievementIds
        : Qe,
    ),
    ke = R(() => e(he).filter((a) => e(qe).includes(a.id)));
  function x(a) {
    switch (a) {
      case 'comum':
        return 'bg-slate-700/80 text-slate-100';
      case 'raro':
        return 'bg-indigo-600/80 text-indigo-50';
      case 'épico':
        return 'bg-fuchsia-600/80 text-fuchsia-50';
      case 'lendário':
        return 'bg-amber-500/90 text-amber-900';
      default:
        return 'bg-slate-700/80 text-slate-100';
    }
  }
  function P(a) {
    switch (a) {
      case 'comum':
        return 'COMUM';
      case 'raro':
        return 'RARO';
      case 'épico':
        return 'ÉPICO';
      case 'lendário':
        return 'LENDÁRIO';
      default:
        return '';
    }
  }
  function ee() {
    s(T, null);
    const a = e(Ae).map((c) => c.id),
      i = L.highlightAchievementIds ?? [],
      A = (i.length > 0 ? i : Qe).filter((c) => a.includes(c)),
      n = A.length > 0 ? A : a.slice(0, 5);
    (s(w, n.slice(0, 5), !0), s(W, !0));
  }
  function X() {
    (s(W, !1), s(w, [], !0), s(T, null));
  }
  function S(a) {
    if (e(W))
      if (e(w).includes(a))
        s(
          w,
          e(w).filter((i) => i !== a),
          !0,
        );
      else {
        if (e(w).length >= 5) {
          s(T, 'Você pode destacar no máximo 5 conquistas.');
          return;
        }
        s(w, [...e(w), a], !0);
      }
  }
  async function N() {
    if (!e(W)) return;
    if (e(w).length === 0) {
      s(T, 'Escolha pelo menos 1 conquista para destacar.');
      return;
    }
    (s(Z, !0), s(T, null));
    const a = e(w).slice(0, 5),
      i = L.id ?? 1;
    try {
      ((L.highlightAchievementIds = a),
        (L.updatedAt = new Date()),
        await re.profile.update(i, {
          highlightAchievementIds: a,
          updatedAt: L.updatedAt,
        }),
        s(W, !1));
    } catch (E) {
      (console.error(E),
        s(
          T,
          'Não foi possível salvar suas conquistas em destaque. Tente novamente.',
        ));
    } finally {
      s(Z, !1);
    }
  }
  var q = St(),
    y = r(q),
    V = r(y),
    $ = r(V),
    _ = m(r($), 6),
    Q = r(_);
  {
    var h = (a) => {
        var i = gt();
        (ct(), u(a, i));
      },
      g = (a) => {
        var i = bt();
        ((i.__click = ee), u(a, i));
      };
    F(Q, (a) => {
      e(W) ? a(h) : a(g, !1);
    });
  }
  (o(_), o($));
  var ne = m($, 2),
    Ce = r(ne),
    $e = r(Ce);
  {
    var Ie = (a) => {
        var i = ft();
        (M(() => {
          (K(i, 'src', L.avatarUrl), K(i, 'alt', L.name || 'Avatar do herói'));
        }),
          u(a, i));
      },
      Le = (a) => {
        var i = xt();
        u(a, i);
      };
    F($e, (a) => {
      L.avatarUrl ? a(Ie) : a(Le, !1);
    });
  }
  o(Ce);
  var le = m(Ce, 2),
    we = m(r(le), 2),
    ce = r(we);
  o(we);
  var Me = m(we, 2),
    de = r(Me);
  (o(Me), o(le), o(ne), o(V));
  var Pe = m(V, 2);
  {
    var Ve = (a) => {
      var i = kt(),
        E = r(i),
        A = m(r(E), 2),
        n = r(A);
      n.__click = X;
      var c = m(n, 2);
      c.__click = N;
      var k = r(c, !0);
      (o(c), o(A), o(E));
      var b = m(E, 2);
      (Oe(
        b,
        21,
        () => e(Ae),
        (j) => j.id,
        (j, p) => {
          var d = ht();
          d.__click = () => S(e(p).id);
          var f = r(d),
            oe = r(f);
          {
            var Ue = (J) => {
                var B = yt();
                (M(() => {
                  (K(B, 'src', e(p).icon), K(B, 'alt', e(p).title));
                }),
                  u(J, B));
              },
              Ne = (J) => {
                var B = _t(),
                  Ge = r(B, !0);
                (o(B), M(() => C(Ge, e(p).icon)), u(J, B));
              };
            F(oe, (J) => {
              e(p).icon && e(p).icon.startsWith('/') ? J(Ue) : J(Ne, !1);
            });
          }
          o(f);
          var De = m(f, 2),
            D = r(De),
            I = r(D),
            We = r(I, !0);
          o(I);
          var Be = m(I, 2),
            rt = r(Be, !0);
          (o(Be), o(D));
          var He = m(D, 2),
            it = r(He, !0);
          (o(He),
            o(De),
            o(d),
            M(
              (J, B, Ge, st, nt) => {
                (O(d, 1, J),
                  O(f, 1, B),
                  O(I, 1, Ge),
                  C(We, e(p).title),
                  O(Be, 1, st),
                  C(rt, nt),
                  C(it, e(p).description));
              },
              [
                () =>
                  `flex items-center gap-3 rounded-2xl border px-4 py-2.5 text-left text-xs transition-all duration-200 ${e(w).includes(e(p).id) ? 'border-amber-400 bg-slate-900/90 shadow-[0_0_18px_rgba(251,191,36,0.55)]' : 'border-slate-700 bg-slate-900/70 hover:border-amber-400/60'}`,
                () =>
                  `flex h-9 w-9 items-center justify-center rounded-full border text-base ${e(w).includes(e(p).id) ? 'border-amber-400 text-amber-300 bg-slate-950' : 'border-slate-700 text-slate-400 bg-slate-950'}`,
                () =>
                  `text-[0.78rem] font-semibold ${e(w).includes(e(p).id) ? 'text-slate-50' : 'text-slate-200'}`,
                () =>
                  `rounded-full px-2 py-[2px] text-[0.6rem] uppercase tracking-[0.15em] ${x(e(p).rarity)}`,
                () => P(e(p).rarity),
              ],
            ),
            u(j, d));
        },
      ),
        o(b));
      var te = m(b, 2);
      {
        var ae = (j) => {
          var p = At(),
            d = r(p, !0);
          (o(p), M(() => C(d, e(T))), u(j, p));
        };
        F(te, (j) => {
          e(T) && j(ae);
        });
      }
      (o(i),
        M(() => {
          ((n.disabled = e(Z)),
            (c.disabled = e(Z) || e(w).length === 0),
            C(k, e(Z) ? 'Salvando...' : 'Salvar destaques'));
        }),
        u(a, i));
    };
    F(Pe, (a) => {
      e(W) && a(Ve);
    });
  }
  var je = m(Pe, 2),
    Fe = r(je);
  {
    var Te = (a) => {
        var i = Ct();
        u(a, i);
      },
      Re = (a) => {
        var i = Ze(),
          E = et(i);
        (Oe(
          E,
          17,
          () => e(ke),
          (A) => A.id,
          (A, n) => {
            var c = Et(),
              k = r(c),
              b = r(k);
            {
              var te = (D) => {
                  var I = Lt();
                  (M(() => {
                    (K(I, 'src', e(n).icon), K(I, 'alt', e(n).title));
                  }),
                    u(D, I));
                },
                ae = (D) => {
                  var I = wt(),
                    We = r(I, !0);
                  (o(I), M(() => C(We, e(n).icon)), u(D, I));
                };
              F(b, (D) => {
                e(n).icon && e(n).icon.startsWith('/') ? D(te) : D(ae, !1);
              });
            }
            o(k);
            var j = m(k, 2),
              p = r(j),
              d = r(p),
              f = r(d, !0);
            o(d);
            var oe = m(d, 2),
              Ue = r(oe, !0);
            (o(oe), o(p));
            var Ne = m(p, 2),
              De = r(Ne);
            (o(Ne),
              o(j),
              o(c),
              M(
                (D, I) => {
                  (O(
                    c,
                    1,
                    `flex items-center gap-3 rounded-2xl border px-4 py-3 text-xs transition-all duration-300 ${e(n).unlocked ? 'border-amber-400/80 bg-slate-950/90 shadow-[0_0_30px_rgba(251,191,36,0.5)]' : 'border-slate-800/80 bg-slate-950/80 opacity-75'}`,
                  ),
                    O(
                      k,
                      1,
                      `flex h-9 w-9 items-center justify-center rounded-full border text-base ${e(n).unlocked ? 'border-amber-400/90 text-amber-300 bg-slate-950' : 'border-slate-700 text-slate-400 bg-slate-950'}`,
                    ),
                    O(
                      d,
                      1,
                      `text-[0.78rem] font-semibold ${e(n).unlocked ? 'text-slate-50' : 'text-slate-300/90'}`,
                    ),
                    C(f, e(n).title),
                    O(oe, 1, D),
                    C(Ue, I),
                    C(
                      De,
                      `${e(n).unlocked ? 'Desbloqueada • ' : 'Bloqueada • '}${e(n).description ?? ''}`,
                    ));
                },
                [
                  () =>
                    `rounded-full px-2 py-[2px] text-[0.6rem] uppercase tracking-[0.15em] ${x(e(n).rarity)}`,
                  () => P(e(n).rarity),
                ],
              ),
              u(A, c));
          },
        ),
          u(a, i));
      };
    F(Fe, (a) => {
      e(ke).length === 0 ? a(Te) : a(Re, !1);
    });
  }
  (o(je),
    o(y),
    o(q),
    M(() => {
      (C(ce, `${e(se) ?? ''} • ${e(z) ?? ''} XP`),
        C(
          de,
          `Streak atual:
            ${e(U) ?? ''}
            ${e(U) === 1 ? ' dia' : ' dias'}`,
        ));
    }),
    u(t, q),
    Ye());
}
lt(['click']);
var It = v('<img class="h-12 w-12 object-contain"/>'),
  Mt = v('<span> </span>'),
  Pt = v(
    '<span class="rounded-full bg-slate-700/50 px-2 py-[1px] text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-slate-200/80">Em breve</span>',
  ),
  jt = v(
    '<span class="rounded-full bg-emerald-500/20 px-2 py-[1px] text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-emerald-200">Desbloqueada</span>',
  ),
  Tt = v(
    '<span class="rounded-full bg-slate-700/50 px-2 py-[1px] text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-slate-200/80">Bloqueada</span>',
  ),
  Nt = v(
    '<article><div class="flex items-start gap-3"><div aria-hidden="true"><!></div> <div class="min-w-0 flex-1"><div class="flex flex-wrap items-baseline gap-x-2 gap-y-1"><h4 class="text-sm font-semibold text-slate-50"> </h4> <span> </span> <span> </span> <!></div> <p class="mt-1 text-[0.72rem] leading-snug text-violet-100/85"> </p></div></div></article>',
  ),
  Dt = v(
    '<div class="space-y-3 rounded-2xl bg-slate-950/40 p-3 md:p-4"><div class="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between"><h3 class="text-sm font-semibold text-slate-50 md:text-base"> </h3> <p class="text-[0.7rem] text-slate-400 md:max-w-md"> </p></div> <div class="grid gap-3 md:grid-cols-2"></div></div>',
  ),
  Ot = v(
    '<section class="w-full mb-8"><div class="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-violet-600/60 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-[0_0_40px_rgba(129,140,248,0.5)]"><div class="relative px-6 py-6 md:px-8 md:py-7"><div class="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true"><div class="absolute inset-[10px] rounded-3xl border border-violet-500/35"></div></div> <div class="relative space-y-6"><header class="space-y-1"><p class="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-violet-300/80">Troféus &amp; conquistas</p> <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between"><h2 class="text-xl md:text-2xl font-extrabold text-slate-50">Mapa de conquistas</h2></div></header> <div class="space-y-6"></div></div></div></div></section>',
  );
function Xt(t, Y) {
  Je(Y, !0);
  const G = 100;
  let L = l(0),
    H = l(0);
  const z = R(() => tt(e(L))),
    U = R(() => e(z).level ?? 1);
  let ie = l(0),
    se = l(0),
    ue = l(0),
    pe = l(0),
    ve = l(0),
    ge = l(0),
    be = l(0),
    fe = l(0),
    xe = l(!1),
    ye = l(!1),
    _e = l(!1),
    Ee = 0;
  Ke(() => {
    const x = me(() => re.profile.get(1)).subscribe((X) => {
        const S = X;
        (s(L, S?.totalXpEarned ?? 0, !0), s(H, S?.currentStreak ?? 0, !0));
      }),
      P = me(() => re.tasks.toArray()).subscribe((X) => {
        const S = X ?? [],
          N = S.filter((h) => h.completed);
        (s(ie, N.length, !0),
          s(
            se,
            N.filter((h) => h.rarity === 'epic' || h.rarity === 'legendary')
              .length,
            !0,
          ),
          s(ue, N.filter((h) => h.rarity === 'legendary').length, !0));
        const q = {},
          y = [],
          V = {};
        for (const h of S) {
          const g = Number(h.areaId),
            ne = Number(h.xp) || 0;
          Number.isFinite(g) &&
            ((q[g] = (q[g] ?? 0) + 1),
            h.completed &&
              (y.includes(g) || y.push(g), (V[g] = (V[g] ?? 0) + ne)));
        }
        (s(
          pe,
          Object.values(q).reduce((h, g) => (g > h ? g : h), 0),
          !0,
        ),
          s(ve, y.length, !0));
        let $ = 0,
          _ = 0;
        const Q = Object.values(V);
        for (const h of Q) {
          const g = Math.floor(h / G);
          (g > $ && ($ = g), g >= 20 && (_ += 1));
        }
        (s(ge, $, !0), s(be, _, !0));
      }),
      ee = me(() => re.companions.toArray()).subscribe((X) => {
        const S = X ?? [],
          N = S.filter((y) => y.unlocked === !0);
        s(fe, N.length, !0);
        const q = (y) => (y ?? '').toLowerCase();
        (s(
          xe,
          N.some(
            (y) =>
              q(y.key).includes('wolf') ||
              q(y.name).includes('lobo') ||
              y.id === 1,
          ),
          !0,
        ),
          s(
            ye,
            N.some(
              (y) =>
                q(y.key).includes('drag') ||
                q(y.name).includes('drag') ||
                y.id === 3,
            ),
            !0,
          ),
          s(_e, S.length > 0 && N.length === S.length, !0));
      });
    return () => {
      (x.unsubscribe(), P.unsubscribe(), ee.unsubscribe());
    };
  });
  const Se = R(() =>
      ot.map((x) => {
        const P = at({
          totalXp: e(L),
          streak: e(H),
          level: e(U),
          completedMissions: e(ie),
          completedEpicOrLegendary: e(se),
          completedLegendary: e(ue),
          maxTasksInSingleArea: e(pe),
          completedAreasCount: e(ve),
          maxAreaLevel: e(ge),
          areasAtLeastLevel20: e(be),
          unlockedCompanionsCount: e(fe),
          hasWolf: e(xe),
          hasDragon: e(ye),
          allCompanionsUnlocked: e(_e),
          companionInteractions: Ee,
        });
        return { ...x, unlocked: x.condition(P) };
      }),
    ),
    Xe = R(() =>
      vt.map((x) => ({
        ...x,
        achievements: e(Se).filter((P) => P.category === x.category),
      })),
    );
  function W(x) {
    switch (x) {
      case 'comum':
        return 'Comum';
      case 'raro':
        return 'Raro';
      case 'épico':
        return 'Épico';
      case 'lendário':
        return 'Lendário';
      default:
        return '';
    }
  }
  function w(x) {
    switch (x) {
      case 'comum':
        return 'bg-slate-600/60 text-slate-100';
      case 'raro':
        return 'bg-violet-500/25 text-violet-200';
      case 'épico':
        return 'bg-emerald-500/25 text-emerald-200';
      case 'lendário':
        return 'bg-amber-400/25 text-amber-100';
      default:
        return 'bg-slate-700/60 text-slate-100';
    }
  }
  function Z(x) {
    switch (x) {
      case 'missoes':
        return 'bg-sky-500/20 text-sky-100';
      case 'consistencia':
        return 'bg-amber-500/25 text-amber-100';
      case 'progresso':
        return 'bg-emerald-500/25 text-emerald-100';
      case 'areas':
        return 'bg-indigo-500/25 text-indigo-100';
      case 'eco':
        return 'bg-emerald-700/40 text-emerald-100';
      case 'companheiros':
        return 'bg-pink-500/25 text-pink-100';
      case 'sociais':
        return 'bg-slate-600/40 text-slate-100';
      case 'economia':
        return 'bg-lime-500/25 text-lime-100';
      default:
        return 'bg-slate-700/60 text-slate-100';
    }
  }
  var T = Ot(),
    he = r(T),
    Ae = r(he),
    qe = m(r(Ae), 2),
    ke = m(r(qe), 2);
  (Oe(
    ke,
    21,
    () => e(Xe),
    (x) => x.id,
    (x, P) => {
      var ee = Dt(),
        X = r(ee),
        S = r(X),
        N = r(S, !0);
      o(S);
      var q = m(S, 2),
        y = r(q, !0);
      (o(q), o(X));
      var V = m(X, 2);
      (Oe(
        V,
        21,
        () => e(P).achievements,
        ($) => $.id,
        ($, _) => {
          var Q = Nt(),
            h = r(Q),
            g = r(h),
            ne = r(g);
          {
            var Ce = (a) => {
                var i = It();
                (M(() => {
                  (K(i, 'src', e(_).icon), K(i, 'alt', e(_).title));
                }),
                  u(a, i));
              },
              $e = (a) => {
                var i = Mt(),
                  E = r(i, !0);
                (o(i), M(() => C(E, e(_).icon)), u(a, i));
              };
            F(ne, (a) => {
              e(_).icon && e(_).icon.startsWith('/') ? a(Ce) : a($e, !1);
            });
          }
          o(g);
          var Ie = m(g, 2),
            Le = r(Ie),
            le = r(Le),
            we = r(le, !0);
          o(le);
          var ce = m(le, 2),
            Me = r(ce, !0);
          o(ce);
          var de = m(ce, 2),
            Pe = r(de, !0);
          o(de);
          var Ve = m(de, 2);
          {
            var je = (a) => {
                var i = Pt();
                u(a, i);
              },
              Fe = (a) => {
                var i = Ze(),
                  E = et(i);
                {
                  var A = (c) => {
                      var k = jt();
                      u(c, k);
                    },
                    n = (c) => {
                      var k = Tt();
                      u(c, k);
                    };
                  F(
                    E,
                    (c) => {
                      e(_).unlocked ? c(A) : c(n, !1);
                    },
                    !0,
                  );
                }
                u(a, i);
              };
            F(Ve, (a) => {
              e(_).future ? a(je) : a(Fe, !1);
            });
          }
          o(Le);
          var Te = m(Le, 2),
            Re = r(Te, !0);
          (o(Te),
            o(Ie),
            o(h),
            o(Q),
            M(
              (a, i, E, A) => {
                (O(
                  Q,
                  1,
                  `group relative overflow-hidden rounded-2xl border px-4 py-3 transition-all duration-300 ${e(_).unlocked ? 'border-violet-400/60 bg-slate-950/90 shadow-[0_0_20px_rgba(129,140,248,0.7)]' : 'border-slate-700/70 bg-slate-950/70 opacity-60'}`,
                ),
                  O(
                    g,
                    1,
                    `mt-1 flex h-9 w-9 items-center justify-center rounded-full text-lg ${e(_).unlocked ? 'bg-violet-500/20 ring-2 ring-violet-400/70' : 'bg-slate-800/80 ring-2 ring-slate-600/70'}`,
                  ),
                  C(we, e(_).title),
                  O(ce, 1, a),
                  C(Me, i),
                  O(de, 1, E),
                  C(Pe, A),
                  C(Re, e(_).description));
              },
              [
                () =>
                  `rounded-full px-2 py-[1px] text-[0.6rem] font-medium uppercase tracking-[0.2em] ${w(e(_).rarity)}`,
                () => W(e(_).rarity),
                () =>
                  `rounded-full px-2 py-[1px] text-[0.6rem] font-medium uppercase tracking-[0.2em] ${Z(e(_).category)}`,
                () => e(P).title.split('.')[0],
              ],
            ),
            u($, Q));
        },
      ),
        o(V),
        o(ee),
        M(() => {
          (C(N, e(P).title), C(y, e(P).subtitle));
        }),
        u(x, ee));
    },
  ),
    o(ke),
    o(qe),
    o(Ae),
    o(he),
    o(T),
    u(t, T),
    Ye());
}
var $t = v(
  '<main class="min-h-full"><section class="mx-auto max-w-5xl px-6 pt-10 pb-8 text-center md:px-10"><!></section> <section class="mx-auto mb-10 max-w-6xl px-6 md:px-10"><!></section> <section class="mx-auto mb-12 max-w-6xl px-6 md:px-10"><!></section></main>',
);
function Qt(t) {
  var Y = $t();
  ut('1gb9m1p', (se) => {
    dt(() => {
      mt.title = 'Sala de Troféus • Level Me Up';
    });
  });
  var G = r(Y),
    L = r(G);
  (pt(L, {
    title: 'Sala de Troféus',
    subtitle: 'Celebre suas conquistas e observe o poder das suas vitórias!',
    iconSrc: '/art/icones/trophy-icon.png',
    align: 'center',
  }),
    o(G));
  var H = m(G, 2),
    z = r(H);
  (qt(z, {}), o(H));
  var U = m(H, 2),
    ie = r(U);
  (Xt(ie, {}), o(U), o(Y), u(t, Y));
}
export { Qt as component };
