import {
  y as attr_class,
  x as attr,
  w as ensure_array_like,
} from '../../../chunks/index2.js';
import { e as escape_html } from '../../../chunks/context.js';
import { S as SHOP_ITEMS } from '../../../chunks/types.js';
import { liveQuery } from 'dexie';
import { d as db, P as PageTitleCard } from '../../../chunks/PageTitleCard.js';
import { a as SvelteSet } from '../../../chunks/index-server.js';
function ShopItemCard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      item,
      owned = false,
      equipped = false,
      buying = false,
      canAfford = true,
    } = $$props;
    const rarityConfig = {
      common: {
        label: 'COMUM',
        pillClass: 'bg-slate-800 text-slate-200',
        accentClass: 'text-slate-300',
        cardClass:
          'border border-slate-600 shadow-[0_0_10px_rgba(148,163,184,0.35)] hover:border-slate-300 hover:shadow-[0_0_18px_rgba(148,163,184,0.6)]',
      },
      rare: {
        label: 'RARO',
        pillClass: 'bg-sky-900/60 text-sky-200',
        accentClass: 'text-sky-300',
        cardClass:
          'border border-sky-500/80 shadow-[0_0_12px_rgba(59,130,246,0.4)] hover:border-sky-300 hover:shadow-[0_0_22px_rgba(96,165,250,0.7)]',
      },
      epic: {
        label: 'ÉPICO',
        pillClass: 'bg-violet-900/60 text-violet-200',
        accentClass: 'text-violet-300',
        cardClass:
          'border border-violet-500/80 shadow-[0_0_12px_rgba(139,92,246,0.45)] hover:border-violet-300 hover:shadow-[0_0_24px_rgba(167,139,250,0.8)]',
      },
      legendary: {
        label: 'LENDÁRIO',
        pillClass: 'bg-amber-900/70 text-amber-100',
        accentClass: 'text-amber-300',
        cardClass:
          'border border-amber-400/90 shadow-[0_0_14px_rgba(245,158,11,0.55)] hover:border-amber-200 hover:shadow-[0_0_26px_rgba(252,211,77,0.95)]',
      },
    };
    const rarityKey = item.rarity;
    const rCfg = rarityConfig[rarityKey];
    const isSoon = item.status === 'soon';
    const buttonDisabled = isSoon || buying || (!owned && !canAfford);
    const buttonLabel = isSoon
      ? 'Em breve'
      : !owned
        ? buying
          ? 'Comprando...'
          : 'Comprar'
        : equipped
          ? 'Desequipar'
          : 'Equipar';
    $$renderer2.push(
      `<div${attr_class(`group flex h-full flex-col rounded-2xl
          bg-slate-900/80 p-4 transition-all
          ${rCfg.cardClass}`)}><div class="mb-2 flex items-start gap-2"><div class="flex-1 text-center"><p class="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">${escape_html(rCfg.label)}</p> <h3 class="text-sm font-semibold text-slate-100">${escape_html(item.name)}</h3></div> `,
    );
    if (owned) {
      $$renderer2.push('<!--[-->');
      $$renderer2.push(
        `<span class="rounded-full border border-emerald-500/60 bg-emerald-500/15 px-2 py-[2px] text-[0.65rem] text-emerald-300">`,
      );
      if (equipped) {
        $$renderer2.push('<!--[-->');
        $$renderer2.push(`Equipado`);
      } else {
        $$renderer2.push('<!--[!-->');
        $$renderer2.push(`Adquirido`);
      }
      $$renderer2.push(`<!--]--></span>`);
    } else {
      $$renderer2.push('<!--[!-->');
      if (isSoon) {
        $$renderer2.push('<!--[-->');
        $$renderer2.push(
          `<span class="rounded-full border border-slate-700 bg-slate-800 px-2 py-[2px] text-[0.65rem] text-slate-400">Em breve</span>`,
        );
      } else {
        $$renderer2.push('<!--[!-->');
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div> `);
    if (item.iconSrc) {
      $$renderer2.push('<!--[-->');
      $$renderer2.push(
        `<div class="mb-3 flex justify-center"><div class="h-14 w-14 rounded-full border border-amber-400/70 bg-slate-950/90 overflow-hidden shadow-[0_0_10px_rgba(251,191,36,0.55)]"><img${attr('src', item.iconSrc)}${attr('alt', item.name)} class="h-full w-full object-cover"/></div></div>`,
      );
    } else {
      $$renderer2.push('<!--[!-->');
    }
    $$renderer2.push(
      `<!--]--> <p class="mb-3 line-clamp-2 text-[0.75rem] text-slate-400">${escape_html(item.description)}</p> <div class="mt-auto flex items-center justify-between gap-2"><div class="flex flex-wrap items-center gap-1.5">`,
    );
    if (item.tag) {
      $$renderer2.push('<!--[-->');
      $$renderer2.push(
        `<span${attr_class(`rounded-full px-2 py-[2px] text-[0.65rem] ${rCfg.pillClass}`)}>${escape_html(item.tag)}</span>`,
      );
    } else {
      $$renderer2.push('<!--[!-->');
    }
    $$renderer2.push(
      `<!--]--></div> <div class="flex items-center gap-2"><span class="text-xs font-semibold text-amber-300">${escape_html(item.price)} <span class="text-[0.65rem] font-normal text-amber-200">Gold</span></span> <button type="button" class="rounded-full px-3 py-1 text-[0.7rem] font-semibold transition-colors disabled:bg-slate-700 disabled:text-slate-400 bg-amber-500/90 text-slate-950 hover:bg-amber-400"${attr('disabled', buttonDisabled, true)}>${escape_html(buttonLabel)}</button></div></div></div>`,
    );
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let selectedCategory = 'highlight';
    const items = SHOP_ITEMS;
    liveQuery(async () => {
      const profile = await db.profile.get(1);
      return profile?.gold ?? 0;
    });
    let gold = 0;
    let ownedSet = new SvelteSet();
    let equippedSet = new SvelteSet();
    liveQuery(() => db.ownedShopItems.toArray());
    let buyingId = null;
    const filteredItems = items;
    const categories = [
      { id: 'highlight', label: 'Destaque' },
      { id: 'gear', label: 'Artefatos' },
      { id: 'theme', label: 'Temas' },
      { id: 'utility', label: 'Utilidades' },
      { id: 'effect', label: 'Efeitos' },
      { id: 'profile', label: 'Perfil' },
    ];
    $$renderer2.push(
      `<div class="relative flex-1" style="background-image: url('/art/bg/bg-shop.webp'); background-size: cover; background-position: center top; background-repeat: no-repeat;"><div class="pointer-events-none absolute inset-0 bg-slate-950/85"></div> <main class="relative z-10 mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">`,
    );
    PageTitleCard($$renderer2, {
      title: 'Loja da Taverna',
      subtitle:
        'Gaste seu Gold em artefatos e cosméticos para personalizar sua experiência e aprimorar sua jornada.',
      iconSrc: '/art/icones/shop-icon.png',
      align: 'center',
    });
    $$renderer2.push(`<!----> <section class="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 md:flex-row md:items-center md:justify-between"><div class="flex items-center gap-3"><p class="text-[0.7rem] uppercase tracking-[0.18em] text-slate-400">Seu saldo</p> <div class="inline-flex items-center gap-1 rounded-full border border-amber-500/70 bg-slate-950/80 px-3 py-1 text-xs font-semibold text-amber-200"><span>${escape_html(gold)}</span> <span class="text-[0.7rem] font-normal text-amber-100">Gold</span> <img src="/art/icones/gold-icon.png" alt="Gold" class="h-4 w-4 object-contain"/></div></div> <div class="text-xs text-slate-400 max-w-md"><p>Você ganha Gold ao completar missões, manter sua sequência ativa e
          evoluir de nível.</p></div> <button type="button" class="self-start rounded-full border border-amber-400/70 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-100 hover:bg-amber-500/20 transition-colors">Como ganhar mais Gold?</button></section> <nav class="mb-4 flex flex-wrap items-center gap-2 text-[0.75rem]" aria-label="Categorias da loja"><!--[-->`);
    const each_array = ensure_array_like(categories);
    for (
      let $$index = 0, $$length = each_array.length;
      $$index < $$length;
      $$index++
    ) {
      let cat = each_array[$$index];
      $$renderer2.push(
        `<button type="button"${attr_class(`rounded-full px-3 py-1.5 border transition-colors ${selectedCategory === cat.id ? 'border-emerald-400/80 bg-emerald-500/15 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.45)]' : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-emerald-400/60 hover:text-emerald-200'}`)}>${escape_html(cat.label)}</button>`,
      );
    }
    $$renderer2.push(`<!--]--></nav> <section>`);
    if (filteredItems.length > 0) {
      $$renderer2.push('<!--[-->');
      $$renderer2.push(
        `<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><!--[-->`,
      );
      const each_array_1 = ensure_array_like(filteredItems);
      for (
        let $$index_1 = 0, $$length = each_array_1.length;
        $$index_1 < $$length;
        $$index_1++
      ) {
        let item = each_array_1[$$index_1];
        ShopItemCard($$renderer2, {
          item,
          owned: ownedSet.has(item.id),
          equipped: equippedSet.has(item.id),
          buying: buyingId === item.id,
          canAfford: gold >= item.price,
        });
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push('<!--[!-->');
      $$renderer2.push(
        `<div class="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-8 text-center text-sm text-slate-400">Nenhum item disponível nesta categoria por enquanto.</div>`,
      );
    }
    $$renderer2.push(`<!--]--></section></main></div>`);
  });
}
export { _page as default };
