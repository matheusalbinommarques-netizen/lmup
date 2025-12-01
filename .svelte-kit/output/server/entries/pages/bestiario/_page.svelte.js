import {
  w as ensure_array_like,
  y as attr_class,
  x as attr,
  F as stringify,
  z as attr_style,
} from '../../../chunks/index2.js';
import { d as db, P as PageTitleCard } from '../../../chunks/PageTitleCard.js';
import { liveQuery } from 'dexie';
import { S as SvelteMap } from '../../../chunks/index-server.js';
import { e as escape_html } from '../../../chunks/context.js';
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
    PET_BASE.map((pet) => ({
      id: pet.id,
      name: pet.name,
      type: pet.type,
      imagePath: pet.imagePath,
      unlocked: false,
    }));
    const fallbackProfile = {
      level: 1,
      activeCompanionId: 1,
    };
    let hero = fallbackProfile;
    let companions = [];
    let nameEdits = {};
    liveQuery(() => db.profile.get(1));
    liveQuery(() => db.companions.toArray());
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
    function getStageProgressPercent(foodInvested, stage) {
      const clampedStage = Math.min(Math.max(stage, 1), 3);
      if (clampedStage >= 3) {
        return 100;
      }
      const currentThreshold = EVOLUTION_THRESHOLDS[clampedStage];
      const nextThreshold = EVOLUTION_THRESHOLDS[clampedStage + 1];
      const span = nextThreshold - currentThreshold;
      if (span <= 0) return 0;
      const inSpan = Math.max(
        0,
        Math.min(foodInvested - currentThreshold, span),
      );
      return Math.round((inSpan / span) * 100);
    }
    function getStageImage(basePath, evolutionStage) {
      const stage = Math.min(Math.max(evolutionStage ?? 1, 1), 3);
      return basePath.replace(/-\d+(\.\w+)$/, `-${stage}$1`);
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
    function getDisplayName(petId, fallback) {
      if (!petId) return fallback;
      return nameEdits[petId] ?? fallback;
    }
    let bestiary = (() => {
      const lvl = hero.level;
      const byId = new SvelteMap();
      for (const c of companions) {
        if (c.id != null) byId.set(c.id, c);
      }
      return PET_BASE.map((base) => {
        const dbPet = byId.get(base.id);
        const rawNameFromDb = dbPet?.name;
        const name =
          rawNameFromDb && rawNameFromDb.trim().length > 0
            ? rawNameFromDb
            : base.name;
        const isUnlocked = lvl >= base.requiredLevel;
        const isActive = base.id === hero.activeCompanionId;
        const foodInvested = dbPet?.foodInvested ?? 0;
        const evolutionStage =
          dbPet?.evolutionStage ?? getEvolutionStageForFood(foodInvested);
        return {
          ...base,
          ...(dbPet || {}),
          id: base.id,
          name,
          imagePath: getStageImage(base.imagePath, evolutionStage),
          // arte correta pro stage
          requiredLevel: base.requiredLevel,
          isUnlocked,
          isActive,
          evolutionStage,
          foodInvested,
        };
      }).sort((a, b) => a.requiredLevel - b.requiredLevel);
    })();
    let foodToSpend = 0;
    let petToFeed = /* @__PURE__ */ (() => {
      return null;
    })();
    let potentialFood = (() => {
      if (!petToFeed) return 0;
      const baseFood = petToFeed.foodInvested ?? 0;
      const availableFood = hero.food ?? 0;
      const spend = Math.max(0, Math.min(foodToSpend, availableFood));
      return baseFood + spend;
    })();
    let potentialStage = (() => getEvolutionStageForFood(potentialFood))();
    function getHeroFood() {
      return hero.food ?? 0;
    }
    $$renderer2.push(`<div class="flex flex-col gap-6 pb-8">`);
    PageTitleCard($$renderer2, {
      title: 'Bestiário de Companheiros',
      subtitle:
        'Alimente e evolua seus fiéis companheiros enquanto você avança em sua jornada!',
      iconSrc: '/art/icones/book-icon.png',
      align: 'center',
    });
    $$renderer2.push(`<!----> <section class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4"><div class="flex-1"><p class="text-sm text-slate-400">Os companheiros são desbloqueados conforme o seu nível: <span class="font-semibold text-[#ffb74d]">Lobo (1), Lich (5), Dragão (15), Aberração (20).</span></p> <p class="text-xs text-slate-500 mt-1">Você pode renomear qualquer criatura já desbloqueada. A troca de
        companheiro ativo é feita na Taverna. Aqui no Bestiário você alimenta e
        acompanha a evolução de cada um.</p></div> <div class="flex items-center gap-4 rounded-xl bg-slate-950/60 border border-slate-800 px-4 py-2"><div class="text-xs text-slate-400 leading-tight"><div>Nível atual</div> <div class="text-sm font-semibold text-[#ffb74d]">Nv. ${escape_html(hero.level)}</div></div> <div class="h-8 w-px bg-slate-800"></div> <div class="text-xs text-slate-400 leading-tight"><div>Comida disponível</div> <div class="text-sm font-semibold text-emerald-400">${escape_html(getHeroFood())}</div></div> <div class="h-8 w-px bg-slate-800"></div> <div class="text-xs text-slate-400 leading-tight"><div>Companheiro ativo</div> <div class="text-sm font-semibold text-emerald-400">${escape_html(bestiary.find((p) => p.isActive)?.name || 'Nenhum selecionado')}</div></div></div></section> <section><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"><!--[-->`);
    const each_array = ensure_array_like(bestiary);
    for (
      let $$index = 0, $$length = each_array.length;
      $$index < $$length;
      $$index++
    ) {
      let pet = each_array[$$index];
      $$renderer2.push(
        `<article${attr_class(`relative rounded-2xl border bg-slate-900/70 p-4 flex flex-col gap-3 shadow-lg ${stringify(pet.isUnlocked ? 'border-slate-700' : 'border-slate-800 opacity-60 grayscale')}`)}><div class="relative"><div class="w-full aspect-[4/5] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center"><img${attr('src', pet.imagePath)}${attr('alt', pet.name)} class="w-full h-full object-contain"/></div> `,
      );
      if (pet.isActive) {
        $$renderer2.push('<!--[-->');
        $$renderer2.push(
          `<span class="absolute top-2 left-2 text-[0.7rem] px-2 py-1 rounded-full bg-emerald-500/90 text-slate-950 font-bold uppercase tracking-widest">Equipado</span>`,
        );
      } else {
        $$renderer2.push('<!--[!-->');
        if (pet.isUnlocked) {
          $$renderer2.push('<!--[-->');
          $$renderer2.push(
            `<span class="absolute top-2 left-2 text-[0.7rem] px-2 py-1 rounded-full bg-slate-800/90 text-emerald-300 font-semibold uppercase tracking-widest">Desbloqueado</span>`,
          );
        } else {
          $$renderer2.push('<!--[!-->');
          $$renderer2.push(
            `<span class="absolute top-2 left-2 text-[0.7rem] px-2 py-1 rounded-full bg-slate-900/95 text-slate-400 font-semibold uppercase tracking-widest">Nv. ${escape_html(pet.requiredLevel)}</span>`,
          );
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(
        `<!--]--></div> <div class="flex-1 flex flex-col gap-2 mt-1">`,
      );
      if (pet.isUnlocked && pet.id) {
        $$renderer2.push('<!--[-->');
        $$renderer2.push(`<!---->`);
        {
          $$renderer2.push(
            `<div class="flex flex-col gap-1"><label${attr('for', `pet-name-${pet.id}`)} class="text-[0.7rem] text-slate-500 uppercase tracking-widest">Nome do companheiro</label> <input${attr('id', `pet-name-${pet.id}`)} type="text" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60"${attr('value', getDisplayName(pet.id, pet.name))}/></div>`,
          );
        }
        $$renderer2.push(`<!---->`);
      } else {
        $$renderer2.push('<!--[!-->');
        $$renderer2.push(
          `<h3 class="font-semibold text-slate-100">${escape_html(pet.name)}</h3>`,
        );
      }
      $$renderer2.push(
        `<!--]--> <p class="text-xs text-slate-400">${escape_html(pet.type)}</p> `,
      );
      if (pet.isUnlocked) {
        $$renderer2.push('<!--[-->');
        $$renderer2.push(`<div class="mt-2 space-y-1"><p class="text-[0.7rem] text-emerald-300">Evolução: ${escape_html(getStageLabel(pet.evolutionStage ?? 1))}
                  (Nível ${escape_html(pet.evolutionStage ?? 1)})</p> <div class="h-2 w-full rounded-full bg-slate-800 overflow-hidden"><div class="h-full rounded-full bg-emerald-500"${attr_style(`width: ${getStageProgressPercent(pet.foodInvested ?? 0, pet.evolutionStage ?? 1)}%`)}></div></div> <p class="text-[0.65rem] text-slate-500">Comida investida: ${escape_html(pet.foodInvested ?? 0)}</p></div>`);
      } else {
        $$renderer2.push('<!--[!-->');
      }
      $$renderer2.push(`<!--]--> <p class="text-[0.65rem] text-amber-300 mt-1">Bônus:
              ${escape_html(getPetBonusDescription(pet.id, pet.evolutionStage ?? 1))}</p></div> <div class="mt-3 flex items-center justify-between text-[0.7rem]">`);
      if (pet.isUnlocked) {
        $$renderer2.push('<!--[-->');
        $$renderer2.push(
          `<span class="text-emerald-400 font-semibold flex items-center gap-1"><span>★</span> Ao seu lado</span>`,
        );
      } else {
        $$renderer2.push('<!--[!-->');
        $$renderer2.push(
          `<span class="text-slate-500 italic">Desbloqueia no nível ${escape_html(pet.requiredLevel)}</span>`,
        );
      }
      $$renderer2.push(`<!--]--> <span class="text-slate-600">ID:
              ${escape_html(pet.id ?? '—')}</span></div> `);
      if (pet.isUnlocked && pet.id) {
        $$renderer2.push('<!--[-->');
        $$renderer2.push(
          `<button type="button" class="mt-3 inline-flex items-center justify-center rounded-lg border border-emerald-500/70 bg-emerald-500/10 px-3 py-1.5 text-[0.75rem] font-semibold text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400 transition">Alimentar / Evoluir</button>`,
        );
      } else {
        $$renderer2.push('<!--[!-->');
      }
      $$renderer2.push(`<!--]--></article>`);
    }
    $$renderer2.push(`<!--]--></div></section> `);
    if (petToFeed) {
      $$renderer2.push('<!--[-->');
      $$renderer2.push(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="feed-modal-title" tabindex="-1"><div class="relative w-full max-w-lg mx-4 rounded-3xl border border-slate-700 bg-slate-950/95 shadow-2xl"><header class="flex items-start justify-between gap-4 px-6 pt-5 pb-3 border-b border-slate-800"><div><p class="text-xs uppercase tracking-[0.2em] text-slate-500">Bestiário • Alimentar &amp; Evoluir</p> <h2 id="feed-modal-title" class="mt-1 text-lg font-semibold text-slate-50">${escape_html(petToFeed.name)}</h2> <p class="mt-1 text-xs text-slate-400">${escape_html(getStageLabel(petToFeed.evolutionStage ?? 1))} — Nível de evolução
              ${escape_html(petToFeed.evolutionStage ?? 1)}</p> <p class="mt-1 text-[0.65rem] text-amber-300">Bônus atual:
              ${escape_html(getPetBonusDescription(petToFeed.id, petToFeed.evolutionStage ?? 1))}</p></div> <button type="button" class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 text-slate-400 hover:text-slate-100 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60" aria-label="Fechar janela de alimentação">✕</button></header> <div class="px-6 pb-6 pt-4 space-y-4"><div class="flex gap-4 items-center"><div class="w-28 h-28 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center"><img${attr('src', petToFeed.imagePath)}${attr('alt', petToFeed.name)} class="w-full h-full object-contain"/></div> <div class="flex-1 space-y-2 text-xs text-slate-300"><div><span class="text-slate-400">Comida disponível:</span> <span class="ml-1 font-semibold text-emerald-400">${escape_html(getHeroFood())}</span></div> <div><span class="text-slate-400">Comida investida neste pet:</span> <span class="ml-1 font-semibold">${escape_html(petToFeed.foodInvested ?? 0)}</span></div> <div><span class="text-slate-400">Evolução atual:</span> <span class="ml-1 font-semibold">${escape_html(getStageLabel(petToFeed.evolutionStage ?? 1))}
                  (Nível ${escape_html(petToFeed.evolutionStage ?? 1)})</span></div></div></div> <div class="space-y-2"><label for="food-amount-input" class="text-[0.7rem] text-slate-400 uppercase tracking-widest">Quanto de comida investir agora?</label> <div class="flex items-center gap-2"><button type="button" class="px-2 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:bg-slate-800">-10</button> <button type="button" class="px-2 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:bg-slate-800">-1</button> <input id="food-amount-input" type="number" min="0" class="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60"${attr('value', foodToSpend)}/> <button type="button" class="px-2 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:bg-slate-800">+1</button> <button type="button" class="px-2 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:bg-slate-800">+10</button> <button type="button" class="px-3 py-1 rounded-md border border-emerald-500/60 text-xs text-emerald-300 hover:bg-emerald-500/10">MAX</button></div> <p class="text-[0.65rem] text-slate-500">O valor será descontado da sua comida total e somado à comida
              investida neste companheiro.</p></div> <div class="space-y-3"><div class="space-y-1"><p class="text-[0.7rem] text-slate-400 uppercase tracking-widest">Progresso atual</p> <div class="h-2 w-full rounded-full bg-slate-800 overflow-hidden"><div class="h-full rounded-full bg-emerald-500"${attr_style(`width: ${getStageProgressPercent(petToFeed.foodInvested ?? 0, petToFeed.evolutionStage ?? 1)}%`)}></div></div></div> <div class="space-y-1"><p class="text-[0.7rem] text-slate-400 uppercase tracking-widest">Após esta alimentação (prévia)</p> <div class="h-2 w-full rounded-full bg-slate-800 overflow-hidden"><div class="h-full rounded-full bg-emerald-400"${attr_style(`width: ${getStageProgressPercent(potentialFood, potentialStage)}%`)}></div></div> <p class="text-[0.65rem] text-slate-400 mt-1">Evolução prevista: <span class="ml-1 font-semibold text-emerald-300">${escape_html(getStageLabel(potentialStage))} (Nível ${escape_html(potentialStage)})</span></p> <p class="text-[0.65rem] text-amber-300">Bônus previsto:
                ${escape_html(getPetBonusDescription(petToFeed.id, potentialStage))}</p></div></div> <div class="mt-4 flex justify-end gap-2"><button type="button" class="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800">Cancelar</button> <button type="button" class="px-4 py-1.5 rounded-lg bg-emerald-500 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed"${attr('disabled', foodToSpend <= 0, true)}>Alimentar agora</button></div></div></div></div>`);
    } else {
      $$renderer2.push('<!--[!-->');
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export { _page as default };
