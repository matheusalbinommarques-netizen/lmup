import {
  w as ensure_array_like,
  y as attr_class,
  x as attr,
  K as head,
} from '../../../chunks/index2.js';
import 'dexie';
import { P as PageTitleCard } from '../../../chunks/PageTitleCard.js';
import { a as getLevelStateFromTotalXp } from '../../../chunks/xpService.js';
import { e as escape_html } from '../../../chunks/context.js';
function createAchievementStats(partial) {
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
    hasWolf: false,
    hasDragon: false,
    allCompanionsUnlocked: false,
    companionInteractions: 0,
    ...partial,
  };
}
const ALL_ACHIEVEMENTS = [
  // 1. Missões (Core Loop)
  {
    id: 'primeiro-passo',
    title: 'O Primeiro Passo',
    description: 'Complete sua primeira missão.',
    icon: '/art/badge-icons/primeiro-passo.png',
    rarity: 'comum',
    category: 'missoes',
    condition: ({ completedMissions }) => completedMissions >= 1,
  },
  {
    id: 'aventureiro',
    title: 'Aventureiro',
    description: 'Complete 10 missões.',
    icon: '/art/badge-icons/aventureiro.png',
    rarity: 'comum',
    category: 'missoes',
    condition: ({ completedMissions }) => completedMissions >= 10,
  },
  {
    id: 'veterano',
    title: 'Veterano',
    description: 'Complete 100 missões.',
    icon: '/art/badge-icons/veterano.png',
    rarity: 'raro',
    category: 'missoes',
    condition: ({ completedMissions }) => completedMissions >= 100,
  },
  {
    id: 'cacador-missoes',
    title: 'Caçador de Missões',
    description: 'Complete 500 missões.',
    icon: '/art/badge-icons/cacador-missoes.png',
    rarity: 'épico',
    category: 'missoes',
    condition: ({ completedMissions }) => completedMissions >= 500,
  },
  {
    id: 'lenda-viva',
    title: 'Lenda Viva',
    description: 'Complete 1000 missões.',
    icon: '/art/badge-icons/lenda-viva.png',
    rarity: 'lendário',
    category: 'missoes',
    condition: ({ completedMissions }) => completedMissions >= 1e3,
  },
  {
    id: 'matador-gigantes',
    title: 'Matador de Gigantes',
    description: 'Complete sua primeira missão Épica ou Lendária.',
    icon: '/art/badge-icons/matador-gigantes.png',
    rarity: 'raro',
    category: 'missoes',
    condition: ({ completedEpicOrLegendary }) => completedEpicOrLegendary >= 1,
  },
  {
    id: 'exterminador',
    title: 'Exterminador',
    description: 'Complete 50 missões Lendárias.',
    icon: '/art/badge-icons/exterminador.png',
    rarity: 'épico',
    category: 'missoes',
    condition: ({ completedLegendary }) => completedLegendary >= 50,
  },
  // 2. Consistência (Streaks)
  {
    id: 'acendendo-tocha',
    title: 'Acendendo a Tocha',
    description: 'Mantenha um streak de 3 dias.',
    icon: '/art/badge-icons/acendendo-tocha.png',
    rarity: 'comum',
    category: 'consistencia',
    condition: ({ streak }) => streak >= 3,
  },
  {
    id: 'em-chamas',
    title: 'Em Chamas!',
    description: 'Mantenha um streak de 7 dias.',
    icon: '/art/badge-icons/em-chamas.png',
    rarity: 'raro',
    category: 'consistencia',
    condition: ({ streak }) => streak >= 7,
  },
  {
    id: 'fogo-controlado',
    title: 'Fogo Controlado',
    description: 'Mantenha um streak de 30 dias.',
    icon: '/art/badge-icons/fogo-controlado.png',
    rarity: 'épico',
    category: 'consistencia',
    condition: ({ streak }) => streak >= 30,
  },
  {
    id: 'a-fenix',
    title: 'A Fênix',
    description: 'Mantenha um streak de 100 dias.',
    icon: '/art/badge-icons/a-fenix.png',
    rarity: 'lendário',
    category: 'consistencia',
    condition: ({ streak }) => streak >= 100,
  },
  // 3. Progressão (Nível e XP)
  {
    id: 'novato',
    title: 'Novato',
    description: 'Alcance o Nível 5.',
    icon: '/art/badge-icons/novato.png',
    rarity: 'comum',
    category: 'progresso',
    condition: ({ level }) => level >= 5,
  },
  {
    id: 'perito',
    title: 'Perito',
    description: 'Alcance o Nível 25.',
    icon: '/art/badge-icons/perito.png',
    rarity: 'raro',
    category: 'progresso',
    condition: ({ level }) => level >= 25,
  },
  {
    id: 'mestre',
    title: 'Mestre',
    description: 'Alcance o Nível 50.',
    icon: '/art/badge-icons/mestre.png',
    rarity: 'épico',
    category: 'progresso',
    condition: ({ level }) => level >= 50,
  },
  {
    id: 'semideus',
    title: 'Semideus',
    description: 'Alcance o Nível 100.',
    icon: '/art/badge-icons/semideus.png',
    rarity: 'lendário',
    category: 'progresso',
    condition: ({ level }) => level >= 100,
  },
  {
    id: 'acumulador',
    title: 'Acumulador',
    description: 'Ganhe 10.000 XP no total.',
    icon: '/art/badge-icons/acumulador.png',
    rarity: 'raro',
    category: 'progresso',
    condition: ({ totalXp }) => totalXp >= 1e4,
  },
  // 4. Áreas (Especialização)
  {
    id: 'focado',
    title: 'Focado',
    description: 'Adicione 5 missões a uma única Área.',
    icon: '/art/badge-icons/focado.png',
    rarity: 'comum',
    category: 'areas',
    condition: ({ maxTasksInSingleArea }) => maxTasksInSingleArea >= 5,
  },
  {
    id: 'especialista',
    title: 'Especialista',
    description: 'Leve uma Área ao nível 10.',
    icon: '/art/badge-icons/especialista.png',
    rarity: 'raro',
    category: 'areas',
    condition: ({ maxAreaLevel }) => maxAreaLevel >= 10,
  },
  {
    id: 'mestre-area',
    title: 'Mestre de Área',
    description: 'Leve uma Área ao nível 25.',
    icon: '/art/badge-icons/mestre-area.png',
    rarity: 'épico',
    category: 'areas',
    condition: ({ maxAreaLevel }) => maxAreaLevel >= 25,
  },
  {
    id: 'multitarefa',
    title: 'Multitarefa',
    description: 'Complete pelo menos uma missão em 5 Áreas diferentes.',
    icon: '/art/badge-icons/multitarefa.png',
    rarity: 'raro',
    category: 'areas',
    condition: ({ completedAreasCount }) => completedAreasCount >= 5,
  },
  {
    id: 'polimata',
    title: 'Polímata',
    description: 'Leve 3 Áreas diferentes ao nível 20.',
    icon: '/art/badge-icons/polimata.png',
    rarity: 'lendário',
    category: 'areas',
    condition: ({ areasAtLeastLevel20 }) => areasAtLeastLevel20 >= 3,
  },
  // 5. Eco
  {
    id: 'o-semeador',
    title: 'O Semeador',
    description: 'Inicie seu Ecossistema (Alcance o Estágio 1 - Semente).',
    icon: '/art/badge-icons/o-semeador.png',
    rarity: 'comum',
    category: 'eco',
    // provisório: vamos ligar com eco de verdade depois
    condition: ({ totalXp }) => totalXp >= 1,
  },
  {
    id: 'brotando',
    title: 'Brotando',
    description: 'Faça seu Ecossistema crescer (Alcance o Estágio 2 - Broto).',
    icon: '/art/badge-icons/brotando.png',
    rarity: 'raro',
    category: 'eco',
    condition: ({ totalXp }) => totalXp >= 2500,
  },
  {
    id: 'arvore-da-vida',
    title: 'Árvore da Vida',
    description: 'Expanda sua floresta (Alcance o Estágio 3 - Árvore).',
    icon: '/art/badge-icons/arvore-vigorosa.png',
    rarity: 'épico',
    category: 'eco',
    condition: ({ totalXp }) => totalXp >= 7500,
  },
  {
    id: 'guardiao-floresta',
    title: 'Guardião da Floresta',
    description: 'Alcance o estágio final do seu Ecossistema.',
    icon: '/art/badge-icons/guardião-floresta.png',
    rarity: 'lendário',
    category: 'eco',
    condition: ({ totalXp }) => totalXp >= 12e3,
  },
  // 6. Companheiros (Bestiário)
  {
    id: 'novo-amigo',
    title: 'Novo Amigo',
    description: 'Adquira seu primeiro companheiro.',
    icon: '/art/badge-icons/novo-amigo.png',
    rarity: 'comum',
    category: 'companheiros',
    condition: ({ unlockedCompanionsCount }) => unlockedCompanionsCount >= 1,
  },
  {
    id: 'melhores-amigos',
    title: 'Melhores Amigos',
    description: 'Alimente ou interaja com seu companheiro 10 vezes.',
    icon: '/art/badge-icons/melhores-amigos.png',
    rarity: 'raro',
    category: 'companheiros',
    condition: ({ companionInteractions }) => companionInteractions >= 10,
    future: true,
  },
  {
    id: 'domador-lobos',
    title: 'Domador de Lobos',
    description: 'Adote o companheiro Lobo.',
    icon: '/art/badge-icons/domador-lobos.png',
    rarity: 'raro',
    category: 'companheiros',
    condition: ({ hasWolf }) => hasWolf,
  },
  {
    id: 'mae-pai-dragao',
    title: 'Mãe/Pai de Dragão',
    description: 'Adote o companheiro Dragão.',
    icon: '/art/badge-icons/mae-pai-dragao.png',
    rarity: 'épico',
    category: 'companheiros',
    condition: ({ hasDragon }) => hasDragon,
  },
  {
    id: 'colecionador',
    title: 'Colecionador',
    description: 'Desbloqueie todos os companheiros disponíveis no Bestiário.',
    icon: '/art/badge-icons/colecionador.png',
    rarity: 'lendário',
    category: 'companheiros',
    condition: ({ allCompanionsUnlocked }) => allCompanionsUnlocked,
  },
  // 7. Sociais (Clã) – futuro
  {
    id: 'recruta',
    title: 'Recruta',
    description: 'Entre ou crie um Clã.',
    icon: '/art/badge-icons/recruta.png',
    rarity: 'comum',
    category: 'sociais',
    condition: () => false,
    future: true,
  },
  {
    id: 'trabalho-equipe',
    title: 'Trabalho em Equipe',
    description: 'Complete uma missão de Clã.',
    icon: '/art/badge-icons/trabalho-equipe.png',
    rarity: 'raro',
    category: 'sociais',
    condition: () => false,
    future: true,
  },
  {
    id: 'membro-fundador',
    title: 'Membro Fundador',
    description: 'Seja o líder de um Clã com 10 membros.',
    icon: '/art/badge-icons/membro-fundador.png',
    rarity: 'épico',
    category: 'sociais',
    condition: () => false,
    future: true,
  },
  // 8. Economia (Loja / Inventário) – futuro
  {
    id: 'primeira-compra',
    title: 'Primeira Compra',
    description: 'Compre seu primeiro item na Loja.',
    icon: '/art/badge-icons/primeira-compra.png',
    rarity: 'comum',
    category: 'economia',
    condition: () => false,
    future: true,
  },
  {
    id: 'cliente-fiel',
    title: 'Cliente Fiel',
    description: 'Gaste 1.000 moedas na Loja.',
    icon: '/art/badge-icons/cliente-fiel.png',
    rarity: 'raro',
    category: 'economia',
    condition: () => false,
    future: true,
  },
  {
    id: 'pao-duro',
    title: 'Pão-Duro',
    description: 'Acumule 5.000 moedas.',
    icon: '/art/badge-icons/pao-duro.png',
    rarity: 'raro',
    category: 'economia',
    condition: () => false,
    future: true,
  },
  {
    id: 'magnata',
    title: 'Magnata',
    description: 'Acumule 50.000 moedas.',
    icon: '/art/badge-icons/magnata.png',
    rarity: 'épico',
    category: 'economia',
    condition: () => false,
    future: true,
  },
  {
    id: 'arsenal-completo',
    title: 'Arsenal Completo',
    description: 'Possua 10 itens diferentes no inventário.',
    icon: '/art/badge-icons/arsenal-completo.png',
    rarity: 'raro',
    category: 'economia',
    condition: () => false,
    future: true,
  },
];
const SECTIONS = [
  {
    id: 'sec-missoes',
    title: '1. Conquistas de Missões',
    subtitle: 'Focadas em completar as tarefas diárias.',
    category: 'missoes',
  },
  {
    id: 'sec-consistencia',
    title: '2. Conquistas de Consistência',
    subtitle: 'Mantenha a chama acesa dia após dia para fortalecer seu streak.',
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
];
const HIGHLIGHT_ACHIEVEMENT_IDS = [
  'acendendo-tocha',
  'em-chamas',
  'novato',
  'perito',
  'acumulador',
];
function AvatarAchievementsPanel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const fallbackProfile = {};
    let hero = fallbackProfile;
    let totalXp = 0;
    let streak = 0;
    const levelInfo = getLevelStateFromTotalXp(totalXp);
    const level = levelInfo.level ?? 1;
    let completedMissions = 0;
    let completedEpicOrLegendary = 0;
    let completedLegendary = 0;
    let maxTasksInSingleArea = 0;
    let completedAreasCount = 0;
    let maxAreaLevel = 0;
    let areasAtLeastLevel20 = 0;
    let unlockedCompanionsCount = 0;
    let hasWolf = false;
    let hasDragon = false;
    let allCompanionsUnlocked = false;
    let companionInteractions = 0;
    const allAchievementsWithStatus = ALL_ACHIEVEMENTS.map((ach) => {
      const stats = createAchievementStats({
        totalXp,
        streak,
        level,
        completedMissions,
        completedEpicOrLegendary,
        completedLegendary,
        maxTasksInSingleArea,
        completedAreasCount,
        maxAreaLevel,
        areasAtLeastLevel20,
        unlockedCompanionsCount,
        hasWolf,
        hasDragon,
        allCompanionsUnlocked,
        companionInteractions,
      });
      return { ...ach, unlocked: ach.condition(stats) };
    });
    allAchievementsWithStatus.filter((a) => a.unlocked && !a.future);
    const highlightIds =
      hero.highlightAchievementIds && hero.highlightAchievementIds.length > 0
        ? hero.highlightAchievementIds
        : HIGHLIGHT_ACHIEVEMENT_IDS;
    const displayedAchievements = allAchievementsWithStatus.filter((ach) =>
      highlightIds.includes(ach.id),
    );
    function rarityBadgeClasses(rarity) {
      switch (rarity) {
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
    function rarityLabel(rarity) {
      switch (rarity) {
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
    $$renderer2.push(`<section class="w-full"><div class="mx-auto max-w-4xl rounded-3xl border border-amber-400/60 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-6 shadow-[0_0_40px_rgba(251,191,36,0.45)] md:px-8 md:py-7"><div class="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div class="space-y-1"><p class="text-[0.65rem] uppercase tracking-[0.25em] text-amber-300/85">Avatar &amp; conquistas</p> <h2 class="text-xl font-bold text-white md:text-2xl">Conquistas em destaque</h2> <p class="text-xs text-slate-300/80">Veja rapidinho como está seu nível, XP total e streak atual. Escolha
          quais troféus aparecem ao lado do seu avatar.</p> <div class="mt-2 text-[0.7rem] text-amber-200/80">`);
    {
      $$renderer2.push('<!--[!-->');
      $$renderer2.push(
        `<button type="button" class="mt-1 rounded-full border border-amber-400/70 bg-amber-500/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-amber-200 hover:bg-amber-500/20">Personalizar destaques</button>`,
      );
    }
    $$renderer2.push(
      `<!--]--></div></div> <div class="flex items-center gap-3 rounded-2xl border border-amber-400/80 bg-slate-950/90 px-3 py-2 shadow-[0_0_30px_rgba(251,191,36,0.55)]"><div class="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-amber-400/80 bg-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.7)]">`,
    );
    {
      $$renderer2.push('<!--[!-->');
      $$renderer2.push(
        `<img src="/art/heroi.png" alt="Avatar do herói" class="h-full w-full rounded-full object-cover"/>`,
      );
    }
    $$renderer2.push(`<!--]--></div> <div class="text-xs"><div class="text-slate-300/90">Nível do avatar</div> <div class="text-sm font-semibold text-amber-300">${escape_html(level)} • ${escape_html(totalXp)} XP</div> <div class="text-[0.65rem] text-amber-200/80">Streak atual:
            ${escape_html(streak)}
            ${escape_html(' dias')}</div></div></div></div> `);
    {
      $$renderer2.push('<!--[!-->');
    }
    $$renderer2.push(`<!--]--> <div class="grid gap-3 md:grid-cols-2">`);
    if (displayedAchievements.length === 0) {
      $$renderer2.push('<!--[-->');
      $$renderer2.push(
        `<div class="col-span-full rounded-2xl border border-slate-700/70 bg-slate-950/80 px-4 py-3 text-xs text-slate-300">Você ainda não selecionou conquistas em destaque. Clique em <strong>“Personalizar destaques”</strong> para escolher.</div>`,
      );
    } else {
      $$renderer2.push('<!--[!-->');
      $$renderer2.push(`<!--[-->`);
      const each_array_1 = ensure_array_like(displayedAchievements);
      for (
        let $$index_1 = 0, $$length = each_array_1.length;
        $$index_1 < $$length;
        $$index_1++
      ) {
        let ach = each_array_1[$$index_1];
        $$renderer2.push(
          `<article${attr_class(`flex items-center gap-3 rounded-2xl border px-4 py-3 text-xs transition-all duration-300 ${ach.unlocked ? 'border-amber-400/80 bg-slate-950/90 shadow-[0_0_30px_rgba(251,191,36,0.5)]' : 'border-slate-800/80 bg-slate-950/80 opacity-75'}`)}><div${attr_class(`flex h-9 w-9 items-center justify-center rounded-full border text-base ${ach.unlocked ? 'border-amber-400/90 text-amber-300 bg-slate-950' : 'border-slate-700 text-slate-400 bg-slate-950'}`)}>`,
        );
        if (ach.icon && ach.icon.startsWith('/')) {
          $$renderer2.push('<!--[-->');
          $$renderer2.push(
            `<img${attr('src', ach.icon)}${attr('alt', ach.title)} class="h-12 w-12 object-contain"/>`,
          );
        } else {
          $$renderer2.push('<!--[!-->');
          $$renderer2.push(`<span>${escape_html(ach.icon)}</span>`);
        }
        $$renderer2.push(
          `<!--]--></div> <div class="flex-1"><div class="flex items-center gap-2"><h3${attr_class(`text-[0.78rem] font-semibold ${ach.unlocked ? 'text-slate-50' : 'text-slate-300/90'}`)}>${escape_html(ach.title)}</h3> <span${attr_class(`rounded-full px-2 py-[2px] text-[0.6rem] uppercase tracking-[0.15em] ${rarityBadgeClasses(ach.rarity)}`)}>${escape_html(rarityLabel(ach.rarity))}</span></div> <p class="mt-1 text-[0.7rem] text-slate-300/85">${escape_html(ach.unlocked ? 'Desbloqueada • ' : 'Bloqueada • ')}${escape_html(ach.description)}</p></div></article>`,
        );
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div></section>`);
  });
}
function AchievementsPanel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let totalXp = 0;
    let streak = 0;
    const levelInfo = getLevelStateFromTotalXp(totalXp);
    const level = levelInfo.level ?? 1;
    let completedMissions = 0;
    let completedEpicOrLegendary = 0;
    let completedLegendary = 0;
    let maxTasksInSingleArea = 0;
    let completedAreasCount = 0;
    let maxAreaLevel = 0;
    let areasAtLeastLevel20 = 0;
    let unlockedCompanionsCount = 0;
    let hasWolf = false;
    let hasDragon = false;
    let allCompanionsUnlocked = false;
    let companionInteractions = 0;
    const achievements = ALL_ACHIEVEMENTS.map((a) => {
      const stats = createAchievementStats({
        totalXp,
        streak,
        level,
        completedMissions,
        completedEpicOrLegendary,
        completedLegendary,
        maxTasksInSingleArea,
        completedAreasCount,
        maxAreaLevel,
        areasAtLeastLevel20,
        unlockedCompanionsCount,
        hasWolf,
        hasDragon,
        allCompanionsUnlocked,
        companionInteractions,
      });
      return { ...a, unlocked: a.condition(stats) };
    });
    const groupedSections = SECTIONS.map((section) => ({
      ...section,
      achievements: achievements.filter(
        (ach) => ach.category === section.category,
      ),
    }));
    function rarityLabel(rarity) {
      switch (rarity) {
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
    function rarityBadgeClasses(rarity) {
      switch (rarity) {
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
    function categoryBadgeClasses(category) {
      switch (category) {
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
    $$renderer2.push(
      `<section class="w-full mb-8"><div class="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-violet-600/60 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-[0_0_40px_rgba(129,140,248,0.5)]"><div class="relative px-6 py-6 md:px-8 md:py-7"><div class="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true"><div class="absolute inset-[10px] rounded-3xl border border-violet-500/35"></div></div> <div class="relative space-y-6"><header class="space-y-1"><p class="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-violet-300/80">Troféus &amp; conquistas</p> <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between"><h2 class="text-xl md:text-2xl font-extrabold text-slate-50">Mapa de conquistas</h2></div></header> <div class="space-y-6"><!--[-->`,
    );
    const each_array = ensure_array_like(groupedSections);
    for (
      let $$index_1 = 0, $$length = each_array.length;
      $$index_1 < $$length;
      $$index_1++
    ) {
      let section = each_array[$$index_1];
      $$renderer2.push(
        `<div class="space-y-3 rounded-2xl bg-slate-950/40 p-3 md:p-4"><div class="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between"><h3 class="text-sm font-semibold text-slate-50 md:text-base">${escape_html(section.title)}</h3> <p class="text-[0.7rem] text-slate-400 md:max-w-md">${escape_html(section.subtitle)}</p></div> <div class="grid gap-3 md:grid-cols-2"><!--[-->`,
      );
      const each_array_1 = ensure_array_like(section.achievements);
      for (
        let $$index = 0, $$length2 = each_array_1.length;
        $$index < $$length2;
        $$index++
      ) {
        let ach = each_array_1[$$index];
        $$renderer2.push(
          `<article${attr_class(`group relative overflow-hidden rounded-2xl border px-4 py-3 transition-all duration-300 ${ach.unlocked ? 'border-violet-400/60 bg-slate-950/90 shadow-[0_0_20px_rgba(129,140,248,0.7)]' : 'border-slate-700/70 bg-slate-950/70 opacity-60'}`)}><div class="flex items-start gap-3"><div${attr_class(`mt-1 flex h-9 w-9 items-center justify-center rounded-full text-lg ${ach.unlocked ? 'bg-violet-500/20 ring-2 ring-violet-400/70' : 'bg-slate-800/80 ring-2 ring-slate-600/70'}`)} aria-hidden="true">`,
        );
        if (ach.icon && ach.icon.startsWith('/')) {
          $$renderer2.push('<!--[-->');
          $$renderer2.push(
            `<img${attr('src', ach.icon)}${attr('alt', ach.title)} class="h-12 w-12 object-contain"/>`,
          );
        } else {
          $$renderer2.push('<!--[!-->');
          $$renderer2.push(`<span>${escape_html(ach.icon)}</span>`);
        }
        $$renderer2.push(
          `<!--]--></div> <div class="min-w-0 flex-1"><div class="flex flex-wrap items-baseline gap-x-2 gap-y-1"><h4 class="text-sm font-semibold text-slate-50">${escape_html(ach.title)}</h4> <span${attr_class(`rounded-full px-2 py-[1px] text-[0.6rem] font-medium uppercase tracking-[0.2em] ${rarityBadgeClasses(ach.rarity)}`)}>${escape_html(rarityLabel(ach.rarity))}</span> <span${attr_class(`rounded-full px-2 py-[1px] text-[0.6rem] font-medium uppercase tracking-[0.2em] ${categoryBadgeClasses(ach.category)}`)}>${escape_html(section.title.split('.')[0])}</span> `,
        );
        if (ach.future) {
          $$renderer2.push('<!--[-->');
          $$renderer2.push(
            `<span class="rounded-full bg-slate-700/50 px-2 py-[1px] text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-slate-200/80">Em breve</span>`,
          );
        } else {
          $$renderer2.push('<!--[!-->');
          if (ach.unlocked) {
            $$renderer2.push('<!--[-->');
            $$renderer2.push(
              `<span class="rounded-full bg-emerald-500/20 px-2 py-[1px] text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-emerald-200">Desbloqueada</span>`,
            );
          } else {
            $$renderer2.push('<!--[!-->');
            $$renderer2.push(
              `<span class="rounded-full bg-slate-700/50 px-2 py-[1px] text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-slate-200/80">Bloqueada</span>`,
            );
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(
          `<!--]--></div> <p class="mt-1 text-[0.72rem] leading-snug text-violet-100/85">${escape_html(ach.description)}</p></div></div></article>`,
        );
      }
      $$renderer2.push(`<!--]--></div></div>`);
    }
    $$renderer2.push(`<!--]--></div></div></div></div></section>`);
  });
}
function _page($$renderer) {
  head('1gb9m1p', $$renderer, ($$renderer2) => {
    $$renderer2.title(($$renderer3) => {
      $$renderer3.push(`<title>Sala de Troféus • Level Me Up</title>`);
    });
  });
  $$renderer.push(
    `<main class="min-h-full"><section class="mx-auto max-w-5xl px-6 pt-10 pb-8 text-center md:px-10">`,
  );
  PageTitleCard($$renderer, {
    title: 'Sala de Troféus',
    subtitle: 'Celebre suas conquistas e observe o poder das suas vitórias!',
    iconSrc: '/art/icones/trophy-icon.png',
    align: 'center',
  });
  $$renderer.push(
    `<!----></section> <section class="mx-auto mb-10 max-w-6xl px-6 md:px-10">`,
  );
  AvatarAchievementsPanel($$renderer);
  $$renderer.push(
    `<!----></section> <section class="mx-auto mb-12 max-w-6xl px-6 md:px-10">`,
  );
  AchievementsPanel($$renderer);
  $$renderer.push(`<!----></section></main>`);
}
export { _page as default };
