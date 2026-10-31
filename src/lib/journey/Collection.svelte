<script lang="ts">
  import { protectMutation } from './protectMutation';
  import { onMount } from 'svelte';
  import { journeyQuery, type JourneySnapshot } from '$services/journeyQuery';
  import { SHOP_ITEMS, getShopItemById, type ShopItem } from '$lib/shop/types';
  import { buyItem, setEquipment, setCosmetic } from '$services/shopService';
  import { modifiersForOwned } from '$services/gearService';
  import { calculateReward } from '$services/rewardService';
  import { slotLabels, collectionCapacity } from '$services/collectionRules';
  import CollectionNav from './CollectionNav.svelte';
  import Card from '$lib/ui/Card.svelte';
  import Artwork from '$lib/ui/Artwork.svelte';
  import Field from '$lib/ui/Field.svelte';
  import Button from '$lib/ui/Button.svelte';
  import Dialog from '$lib/ui/Dialog.svelte';
  let { inventoryOnly = false }: { inventoryOnly?: boolean } = $props();
  const slotId = $props.id();
  let data = $state<JourneySnapshot>();
  let error = $state(''),
    notice = $state(''),
    search = $state(''),
    slot = $state(''),
    busy = $state(false),
    open = $state(false);
  let selected = $state<ShopItem>();
  protectMutation(
    () => busy,
    () => {
      notice = 'Aguarde a confirmação antes de sair.';
    },
  );
  onMount(() => {
    const sub = journeyQuery().subscribe({
      next: (value) => {
        data = value;
      },
      error: () => {
        error = 'Não foi possível abrir a coleção.';
      },
    });
    return () => sub.unsubscribe();
  });
  const rows = $derived(
    SHOP_ITEMS.filter(
      (item) =>
        (!inventoryOnly || data?.owned.some((row) => row.itemId === item.id)) &&
        (!slot || slot === item.slot) &&
        item.name
          .toLocaleLowerCase('pt-BR')
          .includes(search.toLocaleLowerCase('pt-BR')),
    ),
  );
  const capacity = $derived(
    data
      ? collectionCapacity(data.owned, data.inventory)
      : { used: 0, max: 20 },
  );
  function quote(item: ShopItem) {
    if (!data?.profile) return null;
    const owned = data.owned.map((row) => ({
      ...row,
      equipped: row.equipped && getShopItemById(row.itemId)?.slot !== item.slot,
    }));
    owned.push({ itemId: item.id, equipped: true, acquiredAt: '' });
    const reward = calculateReward(
      100,
      data.profile,
      modifiersForOwned(owned),
      data.buffs,
    );
    return reward;
  }
  async function purchase() {
    if (!selected || busy) return;
    busy = true;
    error = '';
    try {
      const result = await buyItem(selected);
      if (!result.ok)
        throw new Error(
          result.code === 'no_funds'
            ? 'Você não tem Gold suficiente.'
            : result.code === 'capacity'
              ? 'Sua coleção está sem espaço. Equipe uma mochila para ampliar a capacidade.'
              : 'Este item não está disponível.',
        );
      notice =
        result.code === 'already_owned'
          ? 'Este equipamento já está na sua coleção.'
          : selected.name +
            ' agora está na sua coleção. Você pode equipá-lo quando quiser.';
      open = false;
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível comprar. Seus dados foram preservados.';
    } finally {
      busy = false;
    }
  }
  async function equip(id: number, equipped: boolean, cosmetic = false) {
    if (busy) return;
    busy = true;
    error = '';
    try {
      if (cosmetic) await setCosmetic(id, equipped);
      else await setEquipment(id, equipped);
      notice = equipped
        ? 'Equipamento atualizado. Os novos bônus valem para as próximas recompensas.'
        : 'Item guardado. Recibos anteriores permanecem iguais.';
    } catch (cause) {
      error =
        cause instanceof Error ? cause.message : 'Não foi possível equipar.';
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head
  ><title>{inventoryOnly ? 'Minha coleção' : 'Loja'} · Level Me Up</title
  ></svelte:head
>
<header class="journey-heading collection-heading">
  <div>
    <p class="lmu-eyebrow">Escolhas para o seu caminho</p>
    <h1>{inventoryOnly ? 'Minha coleção' : 'Loja'}</h1>
    <p>
      {inventoryOnly
        ? 'O que você conquistou, pronto para usar.'
        : 'Conheça o efeito antes de gastar seu Gold.'}
    </p>
  </div>
  <p class="collection-balance">{data?.profile?.gold ?? 0} Gold disponível</p>
</header>
<CollectionNav />
<p role="status">{notice}</p>
{#if error && !open}<p role="alert" class="journey-error">{error}</p>{/if}
{#if data?.profile}<div class="collection-summary">
    <span
      ><strong>{capacity.used}/{capacity.max}</strong> espaços na coleção</span
    ><span>Um equipamento ativo por espaço</span>
  </div>
  <div class="collection-toolbar">
    <Field label="Buscar equipamento" type="search" bind:value={search} />
    <div class="lmu-field">
      <label for={slotId}>Espaço</label><select id={slotId} bind:value={slot}
        ><option value="">Todos os espaços</option
        >{#each Object.entries(slotLabels) as [key, label] (key)}<option
            value={key}>{label}</option
          >{/each}</select
      >
    </div>
  </div>
  <div class="collection-grid">
    {#each rows as item (item.id)}{@const owned = data.owned.find(
        (row) => row.itemId === item.id,
      )}{@const current = data.owned.find(
        (row) =>
          row.equipped && getShopItemById(row.itemId)?.slot === item.slot,
      )}{@const preview = quote(item)}
      <Card
        class={'collection-item ' +
          (owned?.equipped ? 'collection-selected' : '')}
        ><div class="collection-item-art">
          <Artwork src={item.iconSrc ?? ''} sizes="120px" alt="" /><span
            class="collection-badge"
            >{owned?.equipped
              ? 'Equipado'
              : owned
                ? 'Na sua coleção'
                : slotLabels[item.slot ?? '']}</span
          >
        </div>
        <div class="journey-stack">
          <h2>{item.name}</h2>
          <p class="lmu-muted">{item.description}</p>
          {#if preview}<p class="lmu-hint">
              Ao equipar, missão de 100 XP base: +{preview.xp} XP · +{preview.gold}
              Gold · +{preview.food} Comida.
            </p>{/if}{#if current && current.itemId !== item.id}<p
              class="lmu-hint"
            >
              Substitui: {getShopItemById(current.itemId)?.name}. O item
              anterior continua na coleção.
            </p>{/if}
          {#if owned}<Button
              variant={owned.equipped ? 'secondary' : 'primary'}
              disabled={busy}
              onclick={() => equip(item.id, !owned.equipped)}
              aria-label={(owned.equipped ? 'Guardar ' : 'Equipar ') +
                item.name}
              >{owned.equipped ? 'Guardar equipamento' : 'Equipar'}</Button
            >{:else}<p>
              <strong>{item.price} Gold</strong
              >{#if data.profile.gold < item.price}
                · faltam {item.price - data.profile.gold}{/if}
            </p>
            <Button
              disabled={busy ||
                item.status !== 'available' ||
                data.profile.gold < item.price}
              onclick={() => {
                selected = item;
                error = '';
                open = true;
              }}
              aria-label={'Comprar ' + item.name}
              >{item.status !== 'available'
                ? 'Em breve'
                : 'Comprar · ' + item.price + ' Gold'}</Button
            >{/if}
        </div></Card
      >
    {/each}
  </div>
  {#if !rows.length}<Card
      ><div class="journey-empty">
        <h2>
          {inventoryOnly
            ? 'Sua coleção começa com uma escolha.'
            : 'Nenhum equipamento nesta busca.'}
        </h2>
        <p class="lmu-muted">
          {inventoryOnly
            ? 'O Gold das missões pode virar equipamentos. Nenhuma compra é necessária para continuar.'
            : 'Experimente outro nome ou espaço.'}
        </p>
        {#if inventoryOnly}<a
            class="lmu-button lmu-button--primary"
            href="/loja">Conhecer a loja</a
          >{/if}
      </div></Card
    >{/if}
  {#if inventoryOnly}{#each data.owned.filter((row) => !getShopItemById(row.itemId)) as legacy (legacy.id)}<Card
        ><h2>{legacy.name ?? 'Equipamento antigo'}</h2>
        <p>
          Registro legado preservado. Este item não tem efeito definido no
          catálogo atual.
        </p></Card
      >{/each}{#if data.inventory.some((row) => row.owned && row.type !== 'gear')}<h2
      >
        Itens visuais preservados
      </h2>
      <div class="collection-grid">
        {#each data.inventory.filter((row) => row.owned && row.type !== 'gear') as item (item.id)}<Card
            ><h3>{item.name}</h3>
            <p>{item.description}</p>
            <Button
              variant="secondary"
              disabled={busy}
              onclick={() => equip(item.id!, !item.equipped, true)}
              >{item.equipped ? 'Guardar visual' : 'Selecionar visual'}</Button
            ></Card
          >{/each}
      </div>{/if}{/if}
{:else}<p role="status">Abrindo coleção…</p>{/if}
<Dialog bind:open title="Confirmar compra" dismissible={!busy}
  >{#if selected}<div class="collection-confirm">
      <h3>{selected.name}</h3>
      <p>{selected.description}</p>
      <p>Preço: <strong>{selected.price} Gold</strong></p>
      <p>
        Saldo após a compra: {(data?.profile?.gold ?? 0) - selected.price} Gold.
      </p>
      <p class="lmu-hint">
        A compra adiciona o item à coleção. Equipar é uma escolha separada.
        Compras confirmadas não têm reembolso nesta versão.
      </p>
      {#if error}<p role="alert" class="journey-error">{error}</p>{/if}
      <footer>
        <Button
          variant="quiet"
          disabled={busy}
          onclick={() => {
            open = false;
          }}>Cancelar</Button
        ><Button loading={busy} onclick={purchase}
          >Confirmar · {selected.price} Gold</Button
        >
      </footer>
    </div>{/if}</Dialog
>
