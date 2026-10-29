<script lang="ts">
  import { pwaState, applyUpdate } from '$services/pwaService';
  import Button from '$lib/ui/Button.svelte';
</script>

{#if $pwaState.offline}<p class="journey-banner" role="status">
    Sem conexão. Seus dados continuam neste navegador. <a href="/config"
      >Conferir armazenamento</a
    >
  </p>{/if}{#if $pwaState.waiting}<aside
    class="pwa-update"
    aria-label="Atualização disponível"
  >
    <p>
      {$pwaState.compatible
        ? 'Uma nova versão está pronta. Conclua suas gravações e formulários antes de atualizar.'
        : 'Há uma nova versão com mudança de dados. Confira as instruções em Configurações.'}
    </p>
    {#if $pwaState.compatible}<Button
        loading={$pwaState.checking}
        onclick={applyUpdate}>Atualizar agora</Button
      >{/if}<a href="/config">Configurações</a>{#if $pwaState.message}<p>
        {$pwaState.message}
      </p>{/if}
  </aside>{/if}
