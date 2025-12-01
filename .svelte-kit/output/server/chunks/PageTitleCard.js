import Dexie from 'dexie';
import { y as attr_class, x as attr } from './index2.js';
import { e as escape_html } from './context.js';
class LevelMeUpDB extends Dexie {
  profile;
  tasks;
  areas;
  xpLogs;
  inventory;
  shopItems;
  ownedShopItems;
  companions;
  items;
  // legado
  projects;
  // Fase 2
  constructor() {
    super('LevelMeUpDB');
    this.version(4).stores({
      profile: '++id',
      tasks:
        '++id, areaId, projectId, status, completed, archived, createdAt, completedAt, reviewEnabled',
      xpLogs: '++id, date, areaId, createdAt',
      areas: '++id',
      inventory: '++id, key, type, owned, equipped',
      shopItems: '++id, key, type, price',
      ownedShopItems: '++id, itemId',
      companions: '++id, key, rarity, unlocked',
      items: '++id, areaId',
      projects: '++id, status, createdAt, targetDate',
    });
  }
}
const db = new LevelMeUpDB();
function PageTitleCard($$renderer, $$props) {
  let {
    title,
    subtitle = '',
    iconSrc = '',
    iconAlt = '',
    align = 'left',
  } = $$props;
  $$renderer.push(
    `<section class="w-full mb-6 flex justify-center"><div class="relative inline-block overflow-hidden rounded-2xl border border-amber-400/60 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-4 py-4 md:px-5 md:py-5 shadow-[0_0_30px_rgba(251,191,36,0.35)]"><div class="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true"><div class="absolute inset-[8px] rounded-2xl border border-amber-300/25"></div></div> <div${attr_class(`relative flex flex-col gap-2
              ${align === 'center' ? 'items-center text-center' : 'items-start text-left'}`)}><h1 class="font-serif text-xl md:text-2xl font-extrabold bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(251,191,36,0.9)]">${escape_html(title)}</h1> `,
  );
  if (iconSrc) {
    $$renderer.push('<!--[-->');
    $$renderer.push(
      `<div class="flex items-center justify-center rounded-full border border-amber-400/60 bg-slate-950/80 shadow-[0_0_18px_rgba(251,191,36,0.6)] p-1.5"><img${attr('src', iconSrc)}${attr('alt', iconAlt || title)} class="h-32 w-32 object-contain"/></div>`,
    );
  } else {
    $$renderer.push('<!--[!-->');
  }
  $$renderer.push(`<!--]--> `);
  if (subtitle) {
    $$renderer.push('<!--[-->');
    $$renderer.push(
      `<p class="text-xs md:text-sm text-slate-300/85">${escape_html(subtitle)}</p>`,
    );
  } else {
    $$renderer.push('<!--[!-->');
  }
  $$renderer.push(`<!--]--></div></div></section>`);
}
export { PageTitleCard as P, db as d };
