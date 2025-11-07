import 'clsx';
import {
  w as attr_style,
  x as attr,
  y as ensure_array_like,
} from '../../chunks/index.js';
import { BehaviorSubject } from 'rxjs';
import { e as escape_html } from '../../chunks/context.js';
import '../../chunks/db.js';
import 'dexie';
import { B as BottomNav } from '../../chunks/BottomNav.js';
const STORAGE_KEYS = {
  totalXp: 'lmup:totalXp',
  streak: 'lmup:streak',
  lastCheckin: 'lmup:lastCheckin',
};
const totalXp$ = new BehaviorSubject(0);
const streak$ = new BehaviorSubject({
  count: 0,
  lastCheckin: null,
});
function safeGetItem(key) {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function initFromStorage() {
  const storedXp = Number(safeGetItem(STORAGE_KEYS.totalXp) ?? '0');
  const storedStreak = Number(safeGetItem(STORAGE_KEYS.streak) ?? '0');
  const storedLastCheckin = safeGetItem(STORAGE_KEYS.lastCheckin);
  totalXp$.next(Number.isFinite(storedXp) ? storedXp : 0);
  streak$.next({
    count: Number.isFinite(storedStreak) ? storedStreak : 0,
    lastCheckin: storedLastCheckin,
  });
}
if (typeof window !== 'undefined') {
  initFromStorage();
}
function StatsManager($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let totalXp = 0;
    let level = 1;
    let currentLevelXp = 0;
    let xpToNextLevel = 100;
    let streak = 0;
    const xpProgress = Math.min(100, (currentLevelXp / xpToNextLevel) * 100);
    $$renderer2.push(`<section class="w-full mb-8"><div class="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-slate-950 via-slate-900 to-black shadow-2xl"><div class="relative px-6 pt-6 pb-7 md:px-8 md:pt-8 md:pb-8"><div class="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true"><div class="h-full w-full bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_55%)]"></div></div> <div class="relative flex flex-col items-center gap-3 text-center"><p class="text-[0.65rem] uppercase tracking-[0.25em] text-primary/70">Reino do aprendizado</p> <h1 class="text-3xl font-extrabold text-primary drop-shadow">Level Me Up!</h1> <p class="max-w-md text-xs text-text-secondary">Complete missões todos os dias para evoluir de nível e manter sua
          chama de foco acesa.</p></div> <div class="relative mt-6 flex flex-col items-center gap-4"><div class="flex h-24 w-24 items-center justify-center rounded-full border-4 border-amber-400 bg-slate-950/90 shadow-[0_0_40px_rgba(251,191,36,0.7)]"><span class="text-3xl">🛡️</span></div> <div class="inline-flex items-baseline gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1"><span class="text-[0.65rem] uppercase tracking-widest text-text-secondary">Nível</span> <span class="text-2xl font-bold text-white">${escape_html(level)}</span></div> <div class="text-xs text-text-secondary">XP total: <span class="font-semibold text-primary">${escape_html(totalXp)}</span></div></div> <div class="relative mt-6 w-full space-y-2"><div class="flex items-center justify-between text-[0.7rem] text-text-secondary"><span>Progresso até o próximo nível</span> <span>${escape_html(currentLevelXp)} / ${escape_html(xpToNextLevel)} XP</span></div> <div class="h-3 w-full overflow-hidden rounded-full border border-slate-800 bg-slate-900"><div class="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-lime-400 transition-[width] duration-500 ease-out"${attr_style(`width: ${xpProgress}%;`)}></div></div></div> <div class="relative mt-6 flex flex-col gap-3 border-t border-white/5 pt-4 text-xs text-text-secondary md:flex-row md:items-center md:justify-between"><div class="flex items-center gap-2"><span class="text-xl">🔥</span> <div><div class="font-semibold text-text">Streak de dias</div> <div class="text-[0.7rem]">Faça pelo menos uma missão por dia para manter a chama acesa.</div></div></div> <div class="flex items-baseline justify-end gap-1"><span class="text-3xl font-bold text-primary">${escape_html(streak)}</span> <span class="text-[0.7rem] uppercase tracking-[0.2em] text-text-secondary">dias</span></div></div></div></div></section>`);
  });
}
function ItemManager($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { areaId } = $$props;
    let items = [];
    let novoItemNome = '';
    let novoItemXp = 10;
    const nomeId = `nova-missao-${areaId}`;
    const xpId = `xp-missao-${areaId}`;
    $$renderer2.push(
      `<section class="space-y-4"><div class="flex flex-col gap-3 rounded-xl border border-border/60 bg-background/60 p-3 md:flex-row md:items-end md:gap-4"><div class="flex-1 space-y-1"><label class="text-xs font-medium text-text"${attr('for', nomeId)}>Nova missão</label> <input${attr('id', nomeId)} class="w-full rounded-lg border border-border bg-card/70 px-3 py-2 text-sm placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/70" placeholder="Nome do novo item (ex: Estudar Svelte 5)"${attr('value', novoItemNome)}/></div> <div class="flex items-end gap-2"><div class="space-y-1"><label class="text-xs font-medium text-text"${attr('for', xpId)}>XP</label> <input${attr('id', xpId)} class="w-20 rounded-lg border border-border bg-card/70 px-2 py-2 text-right text-sm focus:outline-none focus:ring-2 focus:ring-primary/70" type="number" min="1"${attr('value', novoItemXp)}/></div> <button class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duração-150 ease-in-out hover:bg-primary/90">Adicionar</button></div></div> `,
    );
    if (items.length > 0) {
      $$renderer2.push('<!--[-->');
      $$renderer2.push(`<ul class="space-y-2"><!--[-->`);
      const each_array = ensure_array_like(items);
      for (
        let $$index = 0, $$length = each_array.length;
        $$index < $$length;
        $$index++
      ) {
        let item = each_array[$$index];
        $$renderer2.push(
          `<li class="flex items-center justify-between rounded-xl border border-border/60 bg-card/80 px-3 py-2 text-sm shadow-sm"><div class="flex items-center gap-2"><span class="text-text">${escape_html(item.nome)}</span> <span class="ml-1 text-xs text-text-secondary">(+${escape_html(item.xp)} XP)</span></div> <div class="flex gap-2 text-xs"><button class="font-semibold text-emerald-400 hover:text-emerald-300">concluir</button> <button class="font-semibold text-red-400 hover:text-red-300">remover</button></div></li>`,
        );
      }
      $$renderer2.push(`<!--]--></ul>`);
    } else {
      $$renderer2.push('<!--[!-->');
      $$renderer2.push(
        `<p class="text-xs text-text-secondary">Nenhum item cadastrado para esta área.</p>`,
      );
    }
    $$renderer2.push(`<!--]--></section>`);
  });
}
function AreaManager($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let areas = [];
    let novaArea = '';
    $$renderer2.push(`<section class="w-full space-y-6"><header class="space-y-1"><h2 class="text-xl font-semibold text-primary">Missões ativas</h2> <p class="text-sm text-text-secondary">Crie áreas de foco (como "Programação" ou "Finanças") e depois adicione
      missões dentro de cada uma.</p></header> <div class="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-md md:flex-row md:items-center md:gap-4"><div class="flex-1 space-y-1"><p class="text-sm font-medium text-text">Nova área de foco</p> <input class="mt-1 w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/70" placeholder="Nome da nova área (ex: SvelteKit, Finanças)"${attr('value', novaArea)}/></div> <button class="mt-2 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-150 ease-in-out hover:bg-primary/90 md:mt-6">Adicionar área</button></div> `);
    if (areas.length === 0) {
      $$renderer2.push('<!--[-->');
      $$renderer2.push(
        `<p class="text-sm text-text-secondary">Nenhuma área cadastrada ainda. Comece criando uma área acima, como <span class="font-semibold text-primary">"Programação"</span> ou <span class="font-semibold text-primary">"Hábitos"</span>.</p>`,
      );
    } else {
      $$renderer2.push('<!--[!-->');
      $$renderer2.push(`<div class="space-y-4"><!--[-->`);
      const each_array = ensure_array_like(areas);
      for (
        let $$index = 0, $$length = each_array.length;
        $$index < $$length;
        $$index++
      ) {
        let area = each_array[$$index];
        $$renderer2.push(
          `<article class="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-md"><div class="mb-3 flex items-center justify-between gap-3"><div><h3 class="text-lg font-semibold text-text">${escape_html(area.nome)}</h3> <p class="text-xs text-text-secondary">Adicione missões rápidas abaixo para ganhar XP.</p></div> `,
        );
        if (area.id) {
          $$renderer2.push('<!--[-->');
          $$renderer2.push(
            `<button class="text-xs font-medium text-red-400 underline-offset-2 hover:underline">remover área</button>`,
          );
        } else {
          $$renderer2.push('<!--[!-->');
        }
        $$renderer2.push(`<!--]--></div> `);
        if (area.id) {
          $$renderer2.push('<!--[-->');
          ItemManager($$renderer2, { areaId: area.id });
        } else {
          $$renderer2.push('<!--[!-->');
        }
        $$renderer2.push(`<!--]--></article>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></section>`);
  });
}
function _page($$renderer) {
  $$renderer.push(`<section class="section pt-10 pb-6">`);
  StatsManager($$renderer);
  $$renderer.push(
    `<!----></section> <section class="section space-y-6 pb-28"><div class="parchment p-5 sm:p-6"><h2 class="h-title text-lg sm:text-xl mb-1">Missões ativas</h2> <p class="text-sm text-zinc-700 mb-4">Crie áreas de foco (ex: “Programação”, “Finanças”) e adicione missões rápidas.</p> <div class="mt-2">`,
  );
  AreaManager($$renderer);
  $$renderer.push(`<!----></div></div></section> `);
  BottomNav($$renderer);
  $$renderer.push(`<!---->`);
}
export { _page as default };
