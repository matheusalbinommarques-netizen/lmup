<script lang="ts">
  import { db, type Area } from '../services/db';
  import { liveQuery } from 'dexie';
  import { browser } from '$app/environment';
  import ItemManager from './ItemManager.svelte';

  let areas = $state<Area[]>([]);
  let novaArea = $state('');

  if (browser) {
    const sub = liveQuery(() => db.areas.toArray()).subscribe((rows) => {
      areas = rows;
    });

    $effect(() => () => sub.unsubscribe());
  }

  async function addArea() {
    const nome = novaArea.trim();
    if (!nome) return;

    await db.areas.add({ nome });
    novaArea = '';
  }

  async function removeArea(id: number) {
    await db.areas.delete(id);
  }
</script>

<section class="w-full space-y-6">
  <header class="space-y-1">
    <h2 class="text-xl font-semibold text-primary">Missões ativas</h2>
    <p class="text-sm text-text-secondary">
      Crie áreas de foco (como "Programação" ou "Finanças") e depois adicione
      missões dentro de cada uma.
    </p>
  </header>

  <!-- Criar nova área -->
  <div
    class="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-md md:flex-row md:items-center md:gap-4"
  >
    <div class="flex-1 space-y-1">
      <p class="text-sm font-medium text-text">Nova área de foco</p>
      <input
        class="mt-1 w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/70"
        placeholder="Nome da nova área (ex: SvelteKit, Finanças)"
        bind:value={novaArea}
      />
    </div>

    <button
      class="mt-2 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-150 ease-in-out hover:bg-primary/90 md:mt-6"
      onclick={addArea}
    >
      Adicionar área
    </button>
  </div>

  <!-- Lista de áreas -->
  {#if areas.length === 0}
    <p class="text-sm text-text-secondary">
      Nenhuma área cadastrada ainda. Comece criando uma área acima, como
      <span class="font-semibold text-primary">"Programação"</span> ou
      <span class="font-semibold text-primary">"Hábitos"</span>.
    </p>
  {:else}
    <div class="space-y-4">
      {#each areas as area (area.id)}
        <article
          class="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-md"
        >
          <div class="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold text-text">{area.nome}</h3>
              <p class="text-xs text-text-secondary">
                Adicione missões rápidas abaixo para ganhar XP.
              </p>
            </div>

            {#if area.id}
              <button
                class="text-xs font-medium text-red-400 underline-offset-2 hover:underline"
                onclick={() => removeArea(area.id!)}
              >
                remover área
              </button>
            {/if}
          </div>

          {#if area.id}
            <ItemManager areaId={area.id} />
          {/if}
        </article>
      {/each}
    </div>
  {/if}
</section>
