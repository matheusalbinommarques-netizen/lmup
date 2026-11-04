<script lang="ts">
  import { reconcileProductivity } from '$services/productivityLifecycle';
  import { CAMP_PREVIEW } from '$lib/camp/cinematic/previewMode';
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
    let boundaryTimer: ReturnType<typeof setTimeout>;
    const refreshCycles = () => {
      clearTimeout(boundaryTimer);
      if (ready && !page.url.pathname.startsWith('/laboratorio'))
        void reconcileProductivity().catch(() => {
          /* The next query/action retries safely. */
        });
      const now = new Date();
      const next = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      );
      boundaryTimer = setTimeout(
        refreshCycles,
        Math.max(1, next.getTime() - now.getTime() + 5),
      );
    };
    refreshCycles();
    window.addEventListener('focus', refreshCycles);
    document.addEventListener('visibilitychange', refreshCycles);
    const cleanupComfort = initializeComfort();
    const cleanupPwa = initializePwa();
    if (!page.url.pathname.startsWith('/laboratorio')) void initialize();
    return () => {
      clearTimeout(boundaryTimer);
      window.removeEventListener('focus', refreshCycles);
      document.removeEventListener('visibilitychange', refreshCycles);
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
      ><PwaNotice />{#if CAMP_PREVIEW}<div class="camp-preview-banner">
          Demonstração isolada do Acampamento · progresso e recursos sintéticos
        </div>{/if}{#if ready}{@render children()}{:else if failed}<section
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

<style>
  .camp-preview-banner {
    padding: 5px 10px;
    background: #132019;
    color: #ddc897;
    text-align: center;
    font:
      12px/1.5 Georgia,
      serif;
    min-height: 28px;
  }
</style>
