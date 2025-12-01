import {
  y as attr_class,
  w as ensure_array_like,
  x as attr,
} from '../../../chunks/index2.js';
import { liveQuery } from 'dexie';
import { d as db, P as PageTitleCard } from '../../../chunks/PageTitleCard.js';
import { g as getShopItemById } from '../../../chunks/types.js';
import { e as escape_html } from '../../../chunks/context.js';
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let items = [];
    let activeFilter = 'all';
    const BASE_INVENTORY_SLOTS = 20;
    liveQuery(async () => {
      const [inv, ownedShop] = await Promise.all([
        db.inventory.toArray(),
        db.ownedShopItems.toArray(),
      ]);
      const visualItems = inv
        .filter((it) => it.owned && it.type !== 'gear')
        .map((it) => {
          return { ...it, iconSrc: it.iconSrc };
        });
      const gearItems = [];
      for (const row of ownedShop) {
        const meta = getShopItemById(row.itemId);
        if (!meta) continue;
        gearItems.push({
          id: row.id,
          // só pra chave do {#each}
          key: meta.key,
          type: 'gear',
          name: meta.name,
          description: meta.description,
          owned: true,
          equipped: row.equipped,
          rarity: meta.rarity,
          slot: void 0,
          effects: void 0,
          ownedShopItemId: row.id,
          iconSrc: meta.iconSrc,
          // <- PUXA O ÍCONE DA LOJA
        });
      }
      return [...visualItems, ...gearItems];
    });
    liveQuery(() => db.profile.where('id').equals(1).first());
    function typeLabel(type) {
      switch (type) {
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
          return type;
      }
    }
    function filterLabel(filter) {
      switch (filter) {
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
    const groups = (() => {
      const acc = {};
      for (const item of items) {
        if (!item.owned) continue;
        const key = item.type || 'outros';
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
      }
      const result = Object.entries(acc).map(([type, arr]) => ({
        type,
        items: arr.sort((a, b) => a.key.localeCompare(b.key)),
      }));
      result.sort((a, b) => typeLabel(a.type).localeCompare(typeLabel(b.type)));
      return result;
    })();
    const filteredGroups = groups;
    const totalOwned = items.filter((i) => i.owned).length;
    const totalEquipped = items.filter((i) => i.equipped).length;
    const gold = 0;
    const maxSlots = BASE_INVENTORY_SLOTS + 0;
    const isAtOrOverCapacity = totalOwned >= maxSlots;
    const isNearCapacity =
      !isAtOrOverCapacity && totalOwned >= Math.floor(maxSlots * 0.8);
    const filters = [
      'all',
      'frame',
      'avatar',
      'background',
      'aura',
      'weapon-skin',
      'gear',
    ];
    function itemName(item) {
      return item.name || item.key;
    }
    function equippedLabel(item) {
      return item.equipped ? 'Desequipar' : 'Equipar';
    }
    $$renderer2.push(`<div class="flex flex-col gap-6">`);
    PageTitleCard($$renderer2, {
      title: 'Inventário',
      subtitle:
        'Veja todos os cosméticos, fundos, companheiros e troféus que o seu herói já desbloqueou.',
      iconSrc: '/art/icones/bag-icon.png',
      align: 'center',
    });
    $$renderer2.push(`<!----> <section class="mx-auto w-full max-w-4xl rounded-2xl border border-emerald-500/60 bg-slate-950/80 px-4 py-3 shadow-[0_0_22px_rgba(16,185,129,0.45)] flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p class="text-[0.7rem] uppercase tracking-[0.22em] text-emerald-300/80">Visão geral</p> <p class="mt-1 text-xs text-slate-400">Tudo que o seu herói já conquistou em termos de visuais, troféus e
        artefatos equipáveis.</p></div> <div class="grid grid-cols-3 gap-3 text-xs text-center md:text-right"><div><p class="text-slate-400">Slots ocupados</p> <p${attr_class(`mt-1 text-base font-semibold ${isAtOrOverCapacity ? 'text-red-300' : isNearCapacity ? 'text-amber-300' : 'text-emerald-300'}`)}>${escape_html(totalOwned)} / ${escape_html(maxSlots)}</p></div> <div><p class="text-slate-400">Itens equipados</p> <p class="mt-1 text-base font-semibold text-sky-300">${escape_html(totalEquipped)}</p></div> <div><p class="text-slate-400">Gold disponível</p> <p class="mt-1 flex items-center justify-center gap-1 text-base font-semibold text-amber-300 md:justify-end">${escape_html(gold)} <img src="/art/icones/gold-icon.png" alt="Gold" class="h-4 w-4 object-contain"/></p></div></div> `);
    {
      $$renderer2.push('<!--[!-->');
      $$renderer2.push(
        `<p class="mt-1 text-[0.7rem] text-slate-500 md:text-right">Capacidade base de inventário: 20 slots.</p>`,
      );
    }
    $$renderer2.push(
      `<!--]--></section> <section class="mx-auto w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3"><div class="mb-2 flex items-center justify-between gap-2"><p class="text-[0.7rem] uppercase tracking-[0.22em] text-slate-400">Filtrar por tipo</p> `,
    );
    {
      $$renderer2.push('<!--[!-->');
    }
    $$renderer2.push(
      `<!--]--></div> <div class="flex flex-wrap gap-2"><!--[-->`,
    );
    const each_array = ensure_array_like(filters);
    for (
      let $$index = 0, $$length = each_array.length;
      $$index < $$length;
      $$index++
    ) {
      let f = each_array[$$index];
      $$renderer2.push(
        `<button type="button"${attr_class(`px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors ${activeFilter === f ? 'border-emerald-400 bg-emerald-500/15 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.6)]' : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-emerald-400/60 hover:text-emerald-200'}`)}>${escape_html(filterLabel(f))}</button>`,
      );
    }
    $$renderer2.push(
      `<!--]--></div></section> <section class="mx-auto w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-4">`,
    );
    if (filteredGroups.length === 0) {
      $$renderer2.push('<!--[-->');
      $$renderer2.push(`<div class="flex h-40 items-center justify-center rounded-xl border border-slate-800/60 border-dashed bg-slate-900/60"><p class="text-sm text-slate-500">Nenhum item encontrado nesse filtro. Explore a loja ou conclua missões
          para desbloquear mais cosméticos!</p></div>`);
    } else {
      $$renderer2.push('<!--[!-->');
      $$renderer2.push(`<div class="space-y-5"><!--[-->`);
      const each_array_1 = ensure_array_like(filteredGroups);
      for (
        let $$index_2 = 0, $$length = each_array_1.length;
        $$index_2 < $$length;
        $$index_2++
      ) {
        let group = each_array_1[$$index_2];
        $$renderer2.push(`<div class="space-y-2"><div class="flex items-center justify-between gap-2"><h3 class="text-sm font-semibold text-slate-100">${escape_html(typeLabel(group.type))}</h3> <span class="rounded-full bg-slate-900/80 px-2 py-0.5 text-[0.7rem] text-slate-400">${escape_html(group.items.length)}
                ${escape_html(group.items.length === 1 ? ' item' : ' itens')}</span></div> <div class="grid gap-3 sm:grid-cols-2"><!--[-->`);
        const each_array_2 = ensure_array_like(group.items);
        for (
          let $$index_1 = 0, $$length2 = each_array_2.length;
          $$index_1 < $$length2;
          $$index_1++
        ) {
          let item = each_array_2[$$index_1];
          $$renderer2.push(
            `<article class="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2.5 text-xs"><div class="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/70 overflow-hidden">`,
          );
          if (item.iconSrc) {
            $$renderer2.push('<!--[-->');
            $$renderer2.push(
              `<img${attr('src', item.iconSrc)}${attr('alt', itemName(item))} class="h-full w-full object-contain"/>`,
            );
          } else {
            $$renderer2.push('<!--[!-->');
            if (group.type === 'frame') {
              $$renderer2.push('<!--[-->');
              $$renderer2.push(`🖼️`);
            } else {
              $$renderer2.push('<!--[!-->');
              if (group.type === 'avatar') {
                $$renderer2.push('<!--[-->');
                $$renderer2.push(`😃`);
              } else {
                $$renderer2.push('<!--[!-->');
                if (group.type === 'background') {
                  $$renderer2.push('<!--[-->');
                  $$renderer2.push(`🌌`);
                } else {
                  $$renderer2.push('<!--[!-->');
                  if (group.type === 'aura') {
                    $$renderer2.push('<!--[-->');
                    $$renderer2.push(`✨`);
                  } else {
                    $$renderer2.push('<!--[!-->');
                    if (group.type === 'weapon-skin') {
                      $$renderer2.push('<!--[-->');
                      $$renderer2.push(`⚔️`);
                    } else {
                      $$renderer2.push('<!--[!-->');
                      if (group.type === 'gear') {
                        $$renderer2.push('<!--[-->');
                        $$renderer2.push(`🎯`);
                      } else {
                        $$renderer2.push('<!--[!-->');
                        $$renderer2.push(`🎁`);
                      }
                      $$renderer2.push(`<!--]-->`);
                    }
                    $$renderer2.push(`<!--]-->`);
                  }
                  $$renderer2.push(`<!--]-->`);
                }
                $$renderer2.push(`<!--]-->`);
              }
              $$renderer2.push(`<!--]-->`);
            }
            $$renderer2.push(`<!--]-->`);
          }
          $$renderer2.push(
            `<!--]--></div> <div class="flex-1 min-w-0"><p class="truncate text-slate-100 font-medium">${escape_html(itemName(item))}</p> <p class="mt-0.5 text-[0.7rem] text-slate-400">Chave: <span class="font-mono text-slate-300">${escape_html(item.key)}</span></p></div> <div class="flex flex-col items-end gap-1"><button type="button"${attr_class(`rounded-lg px-3 py-1 text-[0.7rem] font-semibold transition-colors ${item.equipped ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`)}>${escape_html(equippedLabel(item))}</button> `,
          );
          if (item.equipped) {
            $$renderer2.push('<!--[-->');
            $$renderer2.push(
              `<span class="text-[0.65rem] text-emerald-300">Equipado</span>`,
            );
          } else {
            $$renderer2.push('<!--[!-->');
          }
          $$renderer2.push(`<!--]--></div></article>`);
        }
        $$renderer2.push(`<!--]--></div></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></section></div>`);
  });
}
export { _page as default };
