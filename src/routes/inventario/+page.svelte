<!-- src/routes/inventario/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { liveQuery } from 'dexie';
  import {
    db,
    type InventoryItem,
    type Profile,
    type InventoryItemType,
    type OwnedShopItem,
  } from '$services/db';
  import PageTitleCard from '$lib/PageTitleCard.svelte';
  import {
    getHeroModifiersOnce,
    invalidateHeroModifiersCache,
  } from '$services/gearService';
  import { getShopItemById } from '$lib/shop/types';

  // Filtros possíveis: "all" + os tipos reais do banco
  type InventoryFilter = 'all' | InventoryItemType;

  // Item usado na UI (pode ter link para ownedShopItems)
  type UIInventoryItem = InventoryItem & {
    ownedShopItemId?: number;
    iconSrc?: string; // <- ícone opcional para renderizar na UI
  };

  let items = $state<UIInventoryItem[]>([]);
  let profile = $state<Profile | null>(null);
  let activeFilter = $state<InventoryFilter>('all');

  // ---- Capacidade de inventário (mochila) ----
  const BASE_INVENTORY_SLOTS = 20;
  let inventoryExtraSlots = $state(0);

  // Inventário = cosméticos (inventory) + artefatos (ownedShopItems)
  const inventoryQuery = liveQuery(async (): Promise<UIInventoryItem[]> => {
    const [inv, ownedShop] = await Promise.all([
      db.inventory.toArray(),
      db.ownedShopItems.toArray(),
    ]);

    // Cosméticos visuais vindos direto da tabela inventory
    const visualItems: UIInventoryItem[] = inv
      .filter((it) => it.owned && it.type !== 'gear') // ignora gear legado
      .map((it) => {
        // se seu InventoryItem já tiver algum campo de ícone, você pode
        // puxar aqui via (it as any).iconSrc / imageSrc / etc
        return { ...(it as InventoryItem), iconSrc: (it as any).iconSrc };
      });

    // Artefatos de gameplay espelhados de ownedShopItems
    const gearItems: UIInventoryItem[] = [];

    for (const row of ownedShop as OwnedShopItem[]) {
      const meta = getShopItemById(row.itemId);
      if (!meta) continue;

      gearItems.push({
        id: row.id, // só pra chave do {#each}
        key: meta.key,
        type: 'gear',
        name: meta.name,
        description: meta.description,
        owned: true,
        equipped: row.equipped,
        rarity: meta.rarity,
        slot: undefined,
        effects: undefined,
        ownedShopItemId: row.id,
        iconSrc: meta.iconSrc, // <- PUXA O ÍCONE DA LOJA
      });
    }

    return [...visualItems, ...gearItems];
  });

  const profileQuery = liveQuery(() =>
    db.profile.where('id').equals(1).first(),
  );

  onMount(() => {
    const invSub = inventoryQuery.subscribe((rows) => {
      items = rows ?? [];
    });

    const profSub = profileQuery.subscribe((p) => {
      profile = p ?? null;
    });

    // Lê modificadores do herói (mochila lendária etc.)
    (async () => {
      try {
        const mods = await getHeroModifiersOnce();
        inventoryExtraSlots = mods.inventoryExtraSlots ?? 0;
      } catch (error) {
        console.error(
          'Erro ao carregar modificadores de herói (inventário):',
          error,
        );
        inventoryExtraSlots = 0;
      }
    })();

    return () => {
      invSub.unsubscribe();
      profSub.unsubscribe();
    };
  });

  // -------- Helpers de exibição --------
  function typeLabel(type: string): string {
    switch (type as InventoryItemType) {
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

  function filterLabel(filter: InventoryFilter): string {
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

  // Agrupamento por tipo sem usar Map (usa Record)
  type Group = {
    type: string;
    items: UIInventoryItem[];
  };

  const groups = $derived<Group[]>(
    (() => {
      const acc: Record<string, UIInventoryItem[]> = {};

      for (const item of items) {
        if (!item.owned) continue;

        const key = item.type || 'outros';
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
      }

      const result: Group[] = Object.entries(acc).map(([type, arr]) => ({
        type,
        items: arr.sort((a, b) => a.key.localeCompare(b.key)),
      }));

      result.sort((a, b) => typeLabel(a.type).localeCompare(typeLabel(b.type)));

      return result;
    })(),
  );

  const filteredGroups = $derived(
    activeFilter === 'all'
      ? groups
      : groups.filter((g) => g.type === activeFilter),
  );

  const totalOwned = $derived(items.filter((i) => i.owned).length);
  const totalEquipped = $derived(items.filter((i) => i.equipped).length);
  const gold = $derived(profile?.gold ?? 0);

  // Capacidade efetiva = base + mochila
  const maxSlots = $derived(BASE_INVENTORY_SLOTS + (inventoryExtraSlots || 0));

  const isAtOrOverCapacity = $derived(totalOwned >= maxSlots);
  const isNearCapacity = $derived(
    !isAtOrOverCapacity && totalOwned >= Math.floor(maxSlots * 0.8),
  );

  const filters: InventoryFilter[] = [
    'all',
    'frame',
    'avatar',
    'background',
    'aura',
    'weapon-skin',
    'gear',
  ];

  function itemName(item: UIInventoryItem): string {
    return item.name || item.key;
  }

  function equippedLabel(item: UIInventoryItem): string {
    return item.equipped ? 'Desequipar' : 'Equipar';
  }

  // -----------------------
  // Equipar / desequipar
  // Regra: só 1 item por SLOT (armor, weapon, amulet, ring, bag, helm).
  // O último clique vence.
  // -----------------------
  async function toggleEquip(item: UIInventoryItem) {
    // Artefatos de gameplay: mexe em ownedShopItems
    if (item.type === 'gear') {
      if (!item.ownedShopItemId) return;

      const row = await db.ownedShopItems.get(item.ownedShopItemId);
      if (!row || row.id == null || typeof row.itemId !== 'number') return;

      const rowId = row.id as number;
      const meta = getShopItemById(row.itemId);

      // Se não achar meta ou slot, faz toggle simples
      const slot = (meta as any)?.slot as string | undefined;
      if (!meta || !slot) {
        const newEquipped = !row.equipped;
        await db.ownedShopItems.update(rowId, { equipped: newEquipped });
        invalidateHeroModifiersCache();
        const mods = await getHeroModifiersOnce();
        inventoryExtraSlots = mods.inventoryExtraSlots ?? 0;
        return;
      }

      // Se já está equipado, clique = só desequipar
      if (row.equipped) {
        await db.ownedShopItems.update(rowId, { equipped: false });
        invalidateHeroModifiersCache();
        const mods = await getHeroModifiersOnce();
        inventoryExtraSlots = mods.inventoryExtraSlots ?? 0;
        return;
      }

      // Vai equipar: garante exclusividade por SLOT
      await db.transaction('rw', db.ownedShopItems, async () => {
        const allOwned = await db.ownedShopItems.toArray();

        for (const other of allOwned) {
          if (typeof other.id !== 'number') continue;
          if (!other.equipped) continue;
          if (other.id === rowId) continue;
          if (typeof other.itemId !== 'number') continue;

          const otherMeta = getShopItemById(other.itemId);
          const otherSlot = (otherMeta as any)?.slot as string | undefined;

          if (!otherMeta || !otherSlot) continue;
          if (otherSlot === slot) {
            await db.ownedShopItems.update(other.id, { equipped: false });
          }
        }

        // Por fim, equipa o item clicado
        await db.ownedShopItems.update(rowId, { equipped: true });
      });

      invalidateHeroModifiersCache();
      const mods = await getHeroModifiersOnce();
      inventoryExtraSlots = mods.inventoryExtraSlots ?? 0;

      return;
    }

    // Cosméticos visuais: mantém regra "1 equipado por tipo"
    if (!item.id) return;

    await db.transaction('rw', db.inventory, async () => {
      const sameType = await db.inventory
        .where('type')
        .equals(item.type)
        .toArray();

      for (const it of sameType) {
        if (!it.id) continue;
        const shouldEquip = it.id === item.id ? !it.equipped : false;
        await db.inventory.update(it.id, { equipped: shouldEquip });
      }
    });
  }
</script>

<div class="flex flex-col gap-6">
  <PageTitleCard
    title="Inventário"
    subtitle="Veja todos os cosméticos, fundos, companheiros e troféus que o seu herói já desbloqueou."
    iconSrc="/art/icones/bag-icon.png"
    align="center"
  />

  <!-- Resumo rápido -->
  <section
    class="mx-auto w-full max-w-4xl rounded-2xl border border-emerald-500/60 bg-slate-950/80 px-4 py-3 shadow-[0_0_22px_rgba(16,185,129,0.45)] flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
  >
    <div>
      <p class="text-[0.7rem] uppercase tracking-[0.22em] text-emerald-300/80">
        Visão geral
      </p>
      <p class="mt-1 text-xs text-slate-400">
        Tudo que o seu herói já conquistou em termos de visuais, troféus e
        artefatos equipáveis.
      </p>
    </div>

    <div class="grid grid-cols-3 gap-3 text-xs text-center md:text-right">
      <div>
        <p class="text-slate-400">Slots ocupados</p>
        <p
          class={`mt-1 text-base font-semibold ${
            isAtOrOverCapacity
              ? 'text-red-300'
              : isNearCapacity
                ? 'text-amber-300'
                : 'text-emerald-300'
          }`}
        >
          {totalOwned} / {maxSlots}
        </p>
      </div>
      <div>
        <p class="text-slate-400">Itens equipados</p>
        <p class="mt-1 text-base font-semibold text-sky-300">
          {totalEquipped}
        </p>
      </div>
      <div>
        <p class="text-slate-400">Gold disponível</p>
        <p
          class="mt-1 flex items-center justify-center gap-1 text-base font-semibold text-amber-300 md:justify-end"
        >
          {gold}
          <img
            src="/art/icones/gold-icon.png"
            alt="Gold"
            class="h-4 w-4 object-contain"
          />
        </p>
      </div>
    </div>

    {#if inventoryExtraSlots > 0}
      <p class="mt-1 text-[0.7rem] text-emerald-300 md:text-right">
        Mochila equipada: +{inventoryExtraSlots} slots extras (total {maxSlots}).
      </p>
    {:else}
      <p class="mt-1 text-[0.7rem] text-slate-500 md:text-right">
        Capacidade base de inventário: {BASE_INVENTORY_SLOTS} slots.
      </p>
    {/if}
  </section>

  <!-- Filtros -->
  <section
    class="mx-auto w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3"
  >
    <div class="mb-2 flex items-center justify-between gap-2">
      <p class="text-[0.7rem] uppercase tracking-[0.22em] text-slate-400">
        Filtrar por tipo
      </p>
      {#if activeFilter !== 'all'}
        <button
          type="button"
          class="text-[0.75rem] text-slate-400 hover:text-slate-100 underline"
          onclick={() => (activeFilter = 'all')}
        >
          Limpar filtro
        </button>
      {/if}
    </div>

    <div class="flex flex-wrap gap-2">
      {#each filters as f (f)}
        <button
          type="button"
          class={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors ${
            activeFilter === f
              ? 'border-emerald-400 bg-emerald-500/15 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.6)]'
              : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-emerald-400/60 hover:text-emerald-200'
          }`}
          onclick={() => (activeFilter = f)}
        >
          {filterLabel(f)}
        </button>
      {/each}
    </div>
  </section>

  <!-- Listagem de grupos / itens -->
  <section
    class="mx-auto w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-4"
  >
    {#if filteredGroups.length === 0}
      <div
        class="flex h-40 items-center justify-center rounded-xl border border-slate-800/60 border-dashed bg-slate-900/60"
      >
        <p class="text-sm text-slate-500">
          Nenhum item encontrado nesse filtro. Explore a loja ou conclua missões
          para desbloquear mais cosméticos!
        </p>
      </div>
    {:else}
      <div class="space-y-5">
        {#each filteredGroups as group (group.type)}
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-2">
              <h3 class="text-sm font-semibold text-slate-100">
                {typeLabel(group.type)}
              </h3>
              <span
                class="rounded-full bg-slate-900/80 px-2 py-0.5 text-[0.7rem] text-slate-400"
              >
                {group.items.length}
                {group.items.length === 1 ? ' item' : ' itens'}
              </span>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              {#each group.items as item (item.id)}
                <article
                  class="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2.5 text-xs"
                >
                  <div
                    class="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/70 overflow-hidden"
                  >
                    {#if item.iconSrc}
                      <img
                        src={item.iconSrc}
                        alt={itemName(item)}
                        class="h-full w-full object-contain"
                      />
                    {:else if group.type === 'frame'}
                      🖼️
                    {:else if group.type === 'avatar'}
                      😃
                    {:else if group.type === 'background'}
                      🌌
                    {:else if group.type === 'aura'}
                      ✨
                    {:else if group.type === 'weapon-skin'}
                      ⚔️
                    {:else if group.type === 'gear'}
                      🎯
                    {:else}
                      🎁
                    {/if}
                  </div>

                  <div class="flex-1 min-w-0">
                    <p class="truncate text-slate-100 font-medium">
                      {itemName(item)}
                    </p>
                    <p class="mt-0.5 text-[0.7rem] text-slate-400">
                      Chave: <span class="font-mono text-slate-300"
                        >{item.key}</span
                      >
                    </p>
                  </div>

                  <div class="flex flex-col items-end gap-1">
                    <button
                      type="button"
                      class={`rounded-lg px-3 py-1 text-[0.7rem] font-semibold transition-colors ${
                        item.equipped
                          ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                          : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      }`}
                      onclick={() => toggleEquip(item)}
                    >
                      {equippedLabel(item)}
                    </button>

                    {#if item.equipped}
                      <span class="text-[0.65rem] text-emerald-300">
                        Equipado
                      </span>
                    {/if}
                  </div>
                </article>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>
</div>
