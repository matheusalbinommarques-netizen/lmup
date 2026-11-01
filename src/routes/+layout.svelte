<script lang="ts">
  import { initializePwa } from '$services/pwaService';
  import { updateLocked } from '$services/updateSafety';
  import { guardUpdates } from '$lib/journey/guardUpdates';
  import { storageError } from '$services/storageErrors';
  import PwaNotice from '$lib/journey/PwaNotice.svelte';
  import '../app.css';
  import '$lib/design-system.css';
  import '$lib/journey/journey.css';
  import { page } from '$app/state';
  import { onMount, type Snippet } from 'svelte';
  import { initializeComfort } from '$services/comfortService';
  import { initializeJourney } from '$services/profileService';
  import { refreshAchievementReceipts } from '$services/productivityAchievements';
  import AppShell from '$lib/journey/AppShell.svelte';
  import Button from '$lib/ui/Button.svelte';
  let { children }: { children: Snippet } = $props();
  let ready = $state(false);
  let failed = $state(false);
  let initialized = false;
  let failureMessage = $state('');
  guardUpdates(() => !ready && !page.url.pathname.startsWith('/laboratorio'));
  async function initialize() {
    if (initialized) return;
    initialized = true;
    failed = false;
    try {
      await initializeJourney();
      await refreshAchievementReceipts();
      ready = true;
    } catch (cause) {
      failureMessage = storageError(
        cause,
        'Não foi possível abrir os dados locais. Tente novamente.',
      );
      failed = true;
      initialized = false;
    }
  }
  // The laboratory remains independent of the personal database, including client navigation.
  onMount(() => {
    const cleanupComfort = initializeComfort();
    const cleanupPwa = initializePwa();
    if (!page.url.pathname.startsWith('/laboratorio')) void initialize();
    return () => {
      cleanupComfort();
      cleanupPwa();
    };
  });
  $effect(() => {
    if (!page.url.pathname.startsWith('/laboratorio') && !ready && !failed)
      void initialize();
  });
</script>

<div inert={$updateLocked}>
  {#if page.url.pathname.startsWith('/laboratorio')}<div class="lmu-design">
      {@render children()}
    </div>{:else}<AppShell
      ><PwaNotice />{#if ready}{@render children()}{:else if failed}<section
          role="alert"
        >
          <h1>Não foi possível abrir seus dados</h1>
          <p>
            {failureMessage}
          </p>
          <Button onclick={initialize}>Tentar novamente</Button>
        </section>{:else}<p role="status">
          Preparando sua jornada…
        </p>{/if}</AppShell
    >{/if}
</div>
{#if $updateLocked}<div class="pwa-lock lmu-design" role="status">
    <h1>Aplicando atualização</h1>
    <p>
      As abas foram pausadas depois de verificar as gravações. Aguarde o
      aplicativo reabrir.
    </p>
  </div>{/if}
