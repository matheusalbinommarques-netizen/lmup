<script lang="ts">
  // CORREÇÃO: 'UnlockedCompanion' removido (não é necessário aqui)
  import { db, type Companion } from '$services/db';
  import { liveQuery } from 'dexie';
  // CORREÇÃO: 'onDestroy' removido (não utilizado)
  import { onMount } from 'svelte';

  let { close }: { close: () => void } = $props();

  // --- Estado do Banco de Dados ---
  let allCompanions = $state<Companion[]>([]);
  let unlockedIds = $state<number[]>([]);
  let activeId = $state<number>(1);

  // --- Queries ---
  const allCompanionsQuery = liveQuery(() => db.companions.toArray());
  const unlockedQuery = liveQuery(() => db.unlockedCompanions.toArray());
  const profileQuery = liveQuery(() => db.profile.get(1));

  onMount(() => {
    const compSub = allCompanionsQuery.subscribe((data) => {
      allCompanions = data;
    });
    const unlockedSub = unlockedQuery.subscribe((data) => {
      // CORREÇÃO: Tipar 'uc' (any) para 'UnlockedCompanion' (importado do db)
      unlockedIds = data.map((uc: { companionId: number }) => uc.companionId);
    });
    const profileSub = profileQuery.subscribe((data) => {
      activeId = data?.activeCompanionId || 1;
    });

    // Listener para a tecla "Escape"
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };
    window.addEventListener('keydown', handleKeydown);

    return () => {
      compSub.unsubscribe();
      unlockedSub.unsubscribe();
      profileSub.unsubscribe();
      window.removeEventListener('keydown', handleKeydown);
    };
  });

  // --- Funções ---
  async function selectCompanion(id: number | undefined) {
    if (!id) return;
    if (unlockedIds.includes(id)) {
      await db.profile.update(1, { activeCompanionId: id });
      close();
    }
  }

  // Função para fechar ao clicar no overlay
  function handleOverlayClick() {
    close();
  }

  // Handler de teclado para o overlay
  // CORREÇÃO: 'event' (não utilizado) removido
  function handleOverlayKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      close();
    }
  }
</script>

<div
  class="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4"
  onclick={handleOverlayClick}
  onkeydown={handleOverlayKeydown}
  role="button"
  tabindex="0"
>
  <div
    class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col cursor-auto"
    role="dialog"
    aria-modal="true"
    aria-labelledby="companion-modal-title"
    tabindex="-1"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
  >
    <h2
      id="companion-modal-title"
      class="flex items-center gap-3 text-xl font-bold text-[#ffb74d] font-serif mb-6"
    >
      🐾 Trocar Companheiro
    </h2>

    <div class="overflow-y-auto grid grid-cols-2 md:grid-cols-4 gap-4 pr-2">
      {#each allCompanions as pet (pet.id)}
        {@const isUnlocked = unlockedIds.includes(pet.id!)}
        {@const isActive = activeId === pet.id}

        <button
          onclick={() => selectCompanion(pet.id)}
          disabled={!isUnlocked}
          class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all relative
            {isActive
            ? 'border-primary bg-primary/20'
            : 'border-slate-800 bg-slate-900/50'}
            {isUnlocked
            ? 'hover:border-primary/50 hover:bg-slate-800/80 cursor-pointer'
            : 'opacity-50 grayscale'}"
        >
          {#if !isUnlocked}
            <div
              class="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl"
            >
              <span class="text-3xl" title="Bloqueado">🔒</span>
            </div>
          {/if}

          <img
            src={pet.imagePath}
            alt={pet.name}
            class="w-20 h-20 object-contain drop-shadow-xl"
          />
          <h4 class="text-sm font-bold text-slate-200 mt-2">{pet.name}</h4>
          <p class="text-xs text-slate-500">{pet.type}</p>
        </button>
      {/each}
    </div>
  </div>
</div>
