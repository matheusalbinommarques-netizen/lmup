<!-- src/routes/+layout.svelte -->
<script lang="ts">
  // ✅ garante que o Tailwind entre no bundle
  import '../app.css';
  import '$lib/design-system.css';
  import { page } from '$app/state';

  import BottomNav from '$lib/BottomNav.svelte';
  import DesktopNav from '$lib/DesktopNav.svelte';
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';
  import { initializeJourney } from '$services/profileService';

  let ready = $state(false);
  let initializationError = $state(false);
  async function initialize() {
    initializationError = false;
    try {
      await initializeJourney();
      ready = true;
    } catch {
      initializationError = true;
    }
  }
  onMount(() => {
    if (!page.url.pathname.startsWith('/laboratorio')) void initialize();
  });

  // Svelte 5: filhos chegam como Snippet e rendemos com {@render}
  const { children } = $props<{ children: Snippet }>();
</script>

{#if page.url.pathname.startsWith('/laboratorio')}
  <div class="lmu-design">{@render children()}</div>
{:else}
  <div class="min-h-dvh bg-slate-950 text-slate-200 md:flex">
    <!-- Navegação lateral (desktop) -->
    <DesktopNav />

    <!-- Conteúdo -->
    <div class="flex-1 min-w-0 relative flex flex-col">
      <main
        class="flex-1 p-4 md:p-8 overflow-y-auto scroll-smooth pb-[100px] md:pb-8"
      >
        <div class="mx-auto w-full max-w-5xl">
          {#if ready}
            {@render children()}
          {:else if initializationError}
            <section
              role="alert"
              class="rounded-2xl border border-red-400/40 p-6"
            >
              <h1 class="text-xl font-semibold">
                Não foi possível abrir seus dados
              </h1>
              <p class="mt-2">
                Nada foi apagado. Feche outras versões do aplicativo e tente
                novamente.
              </p>
              <button
                type="button"
                onclick={initialize}
                class="mt-4 rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-950"
                >Tentar novamente</button
              >
            </section>
          {:else}
            <p role="status" class="p-6 text-slate-300">
              Preparando sua jornada…
            </p>
          {/if}
        </div>
      </main>
    </div>

    <!-- Bottom nav (mobile) -->
    <div class="md:hidden fixed bottom-0 left-0 right-0 z-50">
      <BottomNav />
    </div>
  </div>
{/if}
