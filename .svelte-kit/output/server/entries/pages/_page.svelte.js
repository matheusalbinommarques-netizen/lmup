import 'clsx';
import {
  x as attr,
  w as ensure_array_like,
  F as attr_style,
} from '../../chunks/index2.js';
import '../../chunks/db.js';
import 'dexie';
import { a as ssr_context, e as escape_html } from '../../chunks/context.js';
import { BehaviorSubject } from 'rxjs';
function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
function AreaManager($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let areas = [];
    let novaArea = '';
    $$renderer2.push(
      `<section class="space-y-4"><div class="flex gap-2"><input class="w-full rounded-md border bg-transparent px-3 py-2" placeholder="Nome da nova área (ex: SvelteKit, Finanças)"${attr('value', novaArea)}/> <button class="px-4 py-2 rounded-md bg-blue-600 text-white">Adicionar Área</button></div> `,
    );
    if (areas.length === 0) {
      $$renderer2.push('<!--[-->');
      $$renderer2.push(
        `<p class="text-sm opacity-70">Nenhuma área cadastrada ainda.</p>`,
      );
    } else {
      $$renderer2.push('<!--[!-->');
      $$renderer2.push(`<ul class="space-y-2"><!--[-->`);
      const each_array = ensure_array_like(areas);
      for (
        let $$index = 0, $$length = each_array.length;
        $$index < $$length;
        $$index++
      ) {
        let area = each_array[$$index];
        $$renderer2.push(
          `<li class="rounded-md border p-3 flex items-center justify-between"><span class="font-medium">${escape_html(area.nome)}</span> <button class="text-sm text-red-500">remover</button></li>`,
        );
      }
      $$renderer2.push(`<!--]--></ul>`);
    }
    $$renderer2.push(`<!--]--></section>`);
  });
}
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
function getTotalXpObservable() {
  return totalXp$.asObservable();
}
function getStreakObservable() {
  return streak$.asObservable();
}
function calcularNivel(totalXp) {
  let level = 1;
  let remainingXp = totalXp;
  let xpNextLevel = 100;
  while (remainingXp >= xpNextLevel) {
    remainingXp -= xpNextLevel;
    level += 1;
    xpNextLevel = 100 + (level - 1) * 50;
  }
  return {
    level,
    currentLevelXp: remainingXp,
    xpToNextLevel: xpNextLevel,
  };
}
function StatsManager($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let totalXp = 0;
    let level = 1;
    let currentLevelXp = 0;
    let xpToNextLevel = 100;
    let streak = 0;
    let unsubscribeFns = [];
    if (typeof window !== 'undefined') {
      const sub1 = getTotalXpObservable().subscribe((xp) => {
        totalXp = xp;
        const info = calcularNivel(xp);
        level = info.level;
        currentLevelXp = info.currentLevelXp;
        xpToNextLevel = info.xpToNextLevel;
      });
      const sub2 = getStreakObservable().subscribe(({ count }) => {
        streak = count;
      });
      unsubscribeFns = [() => sub1.unsubscribe(), () => sub2.unsubscribe()];
    }
    onDestroy(() => {
      for (const fn of unsubscribeFns) fn();
    });
    const xpProgress =
      xpToNextLevel > 0
        ? Math.min(100, (currentLevelXp / xpToNextLevel) * 100)
        : 0;
    $$renderer2.push(
      `<section class="w-full"><div class="mx-auto max-w-3xl rounded-xl bg-surface shadow-md p-6 flex flex-col gap-4 border border-border"><header class="flex items-center justify-between"><div><h1 class="text-2xl font-bold text-primary">Level Me Up!</h1> <p class="text-sm text-text-secondary">Seu progresso geral</p></div> <div class="text-right"><div class="text-xs uppercase tracking-wide text-text-secondary">STREAK</div> <div class="mt-1 flex items-center justify-end gap-1"><span class="text-2xl">🔥</span> <span class="text-xl font-semibold">${escape_html(streak)}</span></div></div></header> <div class="grid gap-4 md:grid-cols-[auto,1fr] items-center"><div class="flex flex-col gap-1"><span class="text-xs uppercase tracking-wide text-text-secondary">Nível</span> <span class="text-4xl font-bold text-accent">${escape_html(level)}</span> <span class="text-xs text-text-secondary">XP total: <span class="font-semibold">${escape_html(totalXp)}</span></span></div> <div class="flex flex-col gap-2"><div class="flex items-center justify-between text-xs text-text-secondary"><span>Progresso do nível</span> <span>${escape_html(currentLevelXp)} / ${escape_html(xpToNextLevel)} XP</span></div> <div class="h-2 rounded-full bg-surface-elevated overflow-hidden"><div class="h-full bg-green-500 transition-[width] duration-300 ease-out"${attr_style(`width: ${xpProgress}%;`)}></div></div></div></div></div></section>`,
    );
  });
}
function _page($$renderer) {
  StatsManager($$renderer);
  $$renderer.push(`<!----> `);
  AreaManager($$renderer);
  $$renderer.push(`<!---->`);
}
export { _page as default };
