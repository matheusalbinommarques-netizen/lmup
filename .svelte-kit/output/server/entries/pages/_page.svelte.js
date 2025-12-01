import { x as attr, z as attr_style } from '../../chunks/index2.js';
import { d as db, P as PageTitleCard } from '../../chunks/PageTitleCard.js';
import { liveQuery } from 'dexie';
import '../../chunks/xpService.js';
import { S as SvelteMap } from '../../chunks/index-server.js';
import { e as escape_html } from '../../chunks/context.js';
function GearPanel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const GEAR_ITEMS = [
      // ARMADURAS
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
      // ESPADAS
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
      // AMULETOS
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
      // ANÉIS
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
      // UTILITÁRIOS
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
    ];
    const gearById = {};
    for (const g of GEAR_ITEMS) {
      gearById[g.id] = g;
    }
    function getStageLabel(stage) {
      switch (stage) {
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
    function getPetBonusDescription(petId, evolutionStage) {
      const stage = Math.min(Math.max(evolutionStage || 1, 1), 3);
      switch (petId) {
        case 1: {
          if (stage === 1) return '+5% de XP ganho em missões.';
          if (stage === 2) return '+10% de XP ganho em missões.';
          return '+15% de XP ganho em missões.';
        }
        case 2: {
          if (stage === 1) return '+5% de comida obtida (alimentação).';
          if (stage === 2) return '+10% de comida obtida (alimentação).';
          return '+15% de comida obtida (alimentação).';
        }
        case 3: {
          if (stage === 1) return '+5% de Gold ganho em missões.';
          if (stage === 2) return '+10% de Gold ganho em missões.';
          return '+15% de Gold ganho em missões.';
        }
        case 4: {
          if (stage === 1) return '+5% de XP, Gold e Comida.';
          if (stage === 2) return '+10% de XP, Gold e Comida.';
          return '+15% de XP, Gold e Comida e redução na quantidade de tarefas exigidas em sistemas avançados.';
        }
        default:
          return 'Bônus não definido.';
      }
    }
    liveQuery(() => db.ownedShopItems.toArray());
    liveQuery(() => db.profile.get(1));
    liveQuery(() => db.companions.toArray());
    let activePet = /* @__PURE__ */ (() => {
      return null;
    })();
    $$renderer2.push(
      `<section class="w-full max-w-4xl mx-auto rounded-2xl border border-emerald-500/70 bg-slate-950/90 px-4 py-4 shadow-[0_0_22px_rgba(16,185,129,0.45)]"><header class="mb-3 flex items-center justify-between gap-2"><div><p class="text-[0.7rem] uppercase tracking-[0.22em] text-emerald-300/80">Equipamentos do Herói</p> <h2 class="text-sm font-semibold text-slate-100">Artefatos que afetam XP, Gold e Streak</h2></div> <div class="text-[0.7rem] text-slate-400 text-right"><p>Os efeitos abaixo valem enquanto o item estiver equipado.</p></div></header> `,
    );
    if (activePet) {
      $$renderer2.push('<!--[-->');
      $$renderer2.push(`<div class="mb-3 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2.5"><div class="relative h-16 w-16 rounded-2xl border border-emerald-400/80 bg-slate-950 overflow-hidden flex items-center justify-center shadow-[0_0_14px_rgba(16,185,129,0.7)]"><img${attr('src', activePet.imagePath)}${attr('alt', activePet.name)} class="h-full w-full object-contain"/></div> <div class="flex-1 min-w-0"><p class="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-emerald-300/80">Companheiro de Batalha</p> <p class="text-sm font-semibold text-slate-100 truncate">${escape_html(activePet.name)}</p> <p class="text-[0.7rem] text-slate-400">${escape_html(getStageLabel(activePet.evolutionStage))} (Nível
          ${escape_html(` ${activePet.evolutionStage}`)})</p> <p class="mt-1 text-[0.7rem] text-amber-300">Bônus:
          ${escape_html(getPetBonusDescription(activePet.id, activePet.evolutionStage))}</p></div></div>`);
    } else {
      $$renderer2.push('<!--[!-->');
      $$renderer2.push(
        `<div class="mb-3 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-[0.7rem] text-slate-400">Nenhum companheiro de batalha selecionado. <span class="text-emerald-300">Escolha um na Taverna.</span></div>`,
      );
    }
    $$renderer2.push(`<!--]--> <div class="space-y-2">`);
    {
      $$renderer2.push('<!--[-->');
      $$renderer2.push(
        `<p class="text-xs text-slate-400">Carregando equipamentos...</p>`,
      );
    }
    $$renderer2.push(
      `<!--]--></div> <div class="mt-4 rounded-xl border border-emerald-600/60 bg-emerald-500/5 px-3 py-2"><p class="text-[0.7rem] uppercase tracking-[0.18em] text-emerald-300/90">Bônus Atuais</p> `,
    );
    {
      $$renderer2.push('<!--[-->');
      $$renderer2.push(
        `<p class="mt-1 text-[0.75rem] text-slate-400">Nenhum bônus adicional ativo além do progresso padrão.</p>`,
      );
    }
    $$renderer2.push(`<!--]--></div></section>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const PET_BASE = [
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
    ];
    const EVOLUTION_THRESHOLDS = [
      0,
      // índice 0 não usado
      0,
      // stage 1 começa em 0
      100,
      // stage 2
      300,
      // stage 3
    ];
    function getEvolutionStageForFood(food) {
      if (food >= EVOLUTION_THRESHOLDS[3]) return 3;
      if (food >= EVOLUTION_THRESHOLDS[2]) return 2;
      return 1;
    }
    function getStageImage(basePath, evolutionStage) {
      const stage = Math.min(Math.max(evolutionStage ?? 1, 1), 3);
      return basePath.replace(/-\d+(\.\w+)$/, `-${stage}$1`);
    }
    const fallbackProfile = {
      name: 'Carregando...',
      title: '...',
      level: 0,
      xpCurrent: 0,
      xpNext: 100,
      activeCompanionId: 1,
      gold: 0,
      food: 0,
      // saldo inicial de comida no fallback
    };
    let hero = fallbackProfile;
    let allCompanions = [];
    liveQuery(() => db.profile.get(1));
    liveQuery(() => db.companions.toArray());
    const xpPercentage = Math.min(100, (hero.xpCurrent / hero.xpNext) * 100);
    const activePet = (() => {
      if (PET_BASE.length === 0) {
        return {
          id: 0,
          name: 'Companheiro',
          type: 'Companion',
          imagePath: '/art/pets/lobo-1.webp',
        };
      }
      const byId = new SvelteMap();
      for (const c of allCompanions) {
        if (c.id != null) byId.set(c.id, c);
      }
      const activeId = hero.activeCompanionId;
      const base =
        PET_BASE.find((p) => p.id === activeId) ??
        PET_BASE.find((p) => p.id === 1);
      const dbPet = byId.get(base.id);
      const rawNameFromDb = dbPet?.name;
      const name =
        rawNameFromDb && rawNameFromDb.trim().length > 0
          ? rawNameFromDb
          : base.name;
      const foodInvested = dbPet?.foodInvested ?? 0;
      const evolutionStage =
        dbPet?.evolutionStage ?? getEvolutionStageForFood(foodInvested);
      return {
        id: base.id,
        name,
        type: base.type,
        imagePath: getStageImage(base.imagePath, evolutionStage),
      };
    })();
    {
      $$renderer2.push('<!--[!-->');
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push('<!--[!-->');
    }
    $$renderer2.push(
      `<!--]--> <div class="min-h-full lmup-bg-taverna bg-slate-950/60"><div class="flex flex-col gap-6">`,
    );
    PageTitleCard($$renderer2, {
      title: 'Taverna do Herói',
      subtitle:
        'Bem vindo de volta guerreiro! descanse e prepare-se para novas aventuras.',
      iconSrc: '/art/icones/icon-taverna.png',
      align: 'center',
    });
    $$renderer2.push(
      `<!----> <div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><section class="col-span-1 lg:col-span-2 bg-slate-900/50 border-2 border-amber-400/80 hover:border-amber-300 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-[0_0_24px_rgba(251,191,36,0.45)] relative overflow-hidden transition-all"><div class="absolute inset-0 bg-gradient-to-br from-amber-400/10 via-transparent to-transparent pointer-events-none"></div> <div class="relative shrink-0"><div class="relative w-32 h-32 rounded-full shadow-2xl">`,
    );
    {
      $$renderer2.push('<!--[!-->');
      $$renderer2.push(
        `<div class="w-full h-full rounded-full bg-slate-700"></div>`,
      );
    }
    $$renderer2.push(
      `<!--]--> <img src="/art/hero-avatar-default.png" alt="Moldura do Avatar" class="absolute inset-0 w-full h-full pointer-events-none" style="transform: scale(1.40);"/></div> <div class="absolute -bottom-3 inset-x-0 flex justify-center"><span class="bg-[#ffb74d] text-slate-950 font-bold text-sm px-3 py-1 rounded-full border-2 border-[#3a2f25] shadow-sm">Lvl ${escape_html(hero.level)}</span></div></div> <div class="flex-1 w-full text-center sm:text-left mt-4 sm:mt-0 relative"><div class="flex items-center justify-center sm:justify-start gap-3"><h2 class="text-2xl font-bold text-slate-100">${escape_html(hero.name)}</h2> <button type="button" class="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-primary hover:bg-slate-800 transition-colors" title="Editar Perfil">✏️</button></div> <p class="text-[#ffb74d]/80 font-medium mb-4">${escape_html(hero.title)}</p> <div class="flex items-center justify-between text-xs text-slate-400 mb-1"><span>XP</span> <span class="inline-flex items-center gap-1"><img src="/art/icones/icon-xp.png" alt="XP" class="h-4 w-4 object-contain"/> <span>${escape_html(hero.xpCurrent)} / ${escape_html(hero.xpNext)}</span></span></div> <div class="h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50"><div class="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"${attr_style(`width: ${xpPercentage}%;`)}></div></div> <div class="mt-4 grid grid-cols-2 gap-4 text-xs"><div class="flex items-center gap-2"><img src="/art/icones/gold-icon.png" alt="Gold" class="h-6 w-6 object-contain"/> <div><p class="text-[0.65rem] uppercase tracking-[0.18em] text-amber-300/80">Gold</p> <p class="text-sm font-semibold text-amber-200">${escape_html(hero.gold)}</p></div></div> <div class="flex items-center gap-2"><span class="text-lg">🍖</span> <div><p class="text-[0.65rem] uppercase tracking-[0.18em] text-emerald-300/80">Comida</p> <p class="text-sm font-semibold text-emerald-200">${escape_html(hero.food)}</p></div></div></div></div></section> <section class="col-span-1 bg-slate-900/50 border-2 border-amber-400/80 hover:border-amber-300 rounded-2xl p-6 flex flex-col items-center text-center shadow-[0_0_24px_rgba(251,191,36,0.45)] relative overflow-hidden transition-all"><div class="absolute top-0 right-0 p-3 opacity-50">🐾</div> <h3 class="text-slate-300 font-semibold mb-4 w-full text-left">Companheiro</h3> <img${attr('src', activePet.imagePath)}${attr('alt', activePet.name)} class="w-24 h-24 object-contain drop-shadow-xl animate-pulse-slow"/> <h4 class="text-lg font-bold text-slate-200 mt-2">${escape_html(activePet.name)}</h4> <p class="text-sm text-slate-500">${escape_html(activePet.type)}</p> <button type="button" class="mt-4 w-full py-2 text-sm text-slate-400 hover:text-primary hover:bg-slate-800 rounded-lg transition-colors">Trocar Companheiro</button></section></div> `,
    );
    GearPanel($$renderer2);
    $$renderer2.push(`<!----> <div class="mt-6 flex justify-center"><div class="relative inline-flex items-center justify-center rounded-2xl border border-amber-500/70 bg-gradient-to-r from-slate-950 via-amber-900/40 to-slate-950 px-8 md:px-12 py-3 shadow-[0_0_35px_rgba(245,158,11,0.65)]"><div class="pointer-events-none absolute inset-0 opacity-50" aria-hidden="true"><div class="absolute inset-[6px] rounded-2xl border border-amber-300/40"></div></div> <h2 class="relative z-[1] font-serif text-xl md:text-2xl font-extrabold tracking-wide text-amber-100">Serviços da Taverna</h2></div></div> <div class="grid grid-cols-2 md:grid-cols-4 gap-4"><a href="/loja" class="p-4 bg-slate-900/50 border-2 border-amber-400/80 hover:border-amber-300 hover:bg-slate-800/80 rounded-xl flex flex-col items-center gap-3 transition-all shadow-[0_0_18px_rgba(251,191,36,0.35)] group" role="button"><img src="/art/icones/shop-icon.png" alt="Loja" class="w-20 h-20 group-hover:scale-110 transition-transform"/> <span class="font-medium text-slate-300">Loja</span></a> <a href="/trofeus" class="p-4 bg-slate-900/50 border-2 border-amber-400/80 hover:border-amber-300 hover:bg-slate-800/80 rounded-xl flex flex-col items-center gap-3 transition-all shadow-[0_0_18px_rgba(251,191,36,0.35)] group" role="button"><img src="/art/icones/trophy-icon.png" alt="Sala de Troféus" class="w-20 h-20 group-hover:scale-110 transition-transform"/> <span class="font-medium text-slate-300">Sala de Troféus</span></a> <a href="/inventario" class="p-4 bg-slate-900/50 border-2 border-amber-400/80 hover:border-amber-300 hover:bg-slate-800/80 rounded-xl flex flex-col items-center gap-3 transition-all shadow-[0_0_18px_rgba(251,191,36,0.35)] group" role="button"><img src="/art/icones/bag-icon.png" alt="Inventário" class="w-20 h-20 group-hover:scale-110 transition-transform"/> <span class="font-medium text-slate-300">Inventário</span></a> <a href="/bestiario" class="p-4 bg-slate-900/50 border-2 border-amber-400/80 hover:border-amber-300 hover:bg-slate-800/80 rounded-xl flex flex-col items-center gap-3 transition-all shadow-[0_0_18px_rgba(251,191,36,0.35)] group" role="button"><img src="/art/icones/book-icon.png" alt="Bestiário" class="w-20 h-20 group-hover:scale-110 transition-transform"/> <span class="font-medium text-slate-300">Bestiário</span></a></div></div> <style>
    .animate-pulse-slow {
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
    }
  </style></div>`);
  });
}
export { _page as default };
