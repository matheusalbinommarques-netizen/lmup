<script lang="ts">
  import '../app.css';
  import '$lib/design-system.css';
  import '$lib/journey/journey.css';
  import { page } from '$app/state';
  import { onMount, type Snippet } from 'svelte';
  import { initializeJourney } from '$services/profileService';
  import AppShell from '$lib/journey/AppShell.svelte';
  import Button from '$lib/ui/Button.svelte';
  let { children }: { children: Snippet } = $props();
  let ready = $state(false);
  let failed = $state(false);
  let initialized = false;
  async function initialize() {
    if (initialized) return;
    initialized = true;
    failed = false;
    try {
      await initializeJourney();
      ready = true;
    } catch {
      failed = true;
      initialized = false;
    }
  }
  // The laboratory remains independent of the personal database, including client navigation.
  onMount(() => {
    if (!page.url.pathname.startsWith('/laboratorio')) void initialize();
  });
  $effect(() => {
    if (!page.url.pathname.startsWith('/laboratorio') && !ready && !failed)
      void initialize();
  });
</script>

{#if page.url.pathname.startsWith('/laboratorio')}<div class="lmu-design">
    {@render children()}
  </div>{:else}<AppShell
    >{#if ready}{@render children()}{:else if failed}<section role="alert">
        <h1>Não foi possível abrir seus dados</h1>
        <p>
          Nada foi apagado. Feche outras versões do aplicativo e tente
          novamente.
        </p>
        <Button onclick={initialize}>Tentar novamente</Button>
      </section>{:else}<p role="status">
        Preparando sua jornada…
      </p>{/if}</AppShell
  >{/if}
