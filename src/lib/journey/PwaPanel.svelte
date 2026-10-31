<script lang="ts">
  import { onMount } from 'svelte';
  import {
    pwaState,
    installApp,
    checkUpdate,
    applyUpdate,
  } from '$services/pwaService';
  import Card from '$lib/ui/Card.svelte';
  import Button from '$lib/ui/Button.svelte';
  let storage = $state<{
      persisted: boolean;
      usage?: number;
      quota?: number;
    } | null>(null),
    message = $state(''),
    busy = $state(false);
  async function inspect() {
    try {
      const estimate = await navigator.storage?.estimate?.();
      storage = {
        persisted: (await navigator.storage?.persisted?.()) ?? false,
        ...estimate,
      };
    } catch {
      storage = null;
    }
  }
  onMount(() => {
    void inspect();
  });
  async function persist() {
    busy = true;
    try {
      const granted = await navigator.storage?.persist?.();
      message = granted
        ? 'Este navegador concedeu proteção contra limpeza automática. Mantenha também um backup externo.'
        : 'O navegador não concedeu proteção adicional. Continue exportando backups externos.';
      await inspect();
    } catch {
      message =
        'Este navegador não permitiu solicitar proteção adicional. Você pode continuar usando e exportando a jornada.';
    } finally {
      busy = false;
    }
  }
  function mib(value: number) {
    return (value / 1024 / 1024).toFixed(1) + ' MB';
  }
</script>

<Card
  ><div class="journey-stack">
    <div>
      <h2>Uso offline e instalação</h2>
      <p class="lmu-muted">
        {$pwaState.ready
          ? 'O conteúdo essencial está disponível offline neste navegador. Artes já visitadas podem ser guardadas; imagens ausentes têm alternativa em texto.'
          : $pwaState.supported
            ? $pwaState.message
              ? 'O conteúdo offline ainda não pôde ser confirmado neste navegador.'
              : 'Preparando o conteúdo essencial para uso offline. Mantenha esta janela aberta até concluir.'
            : 'Instalação e uso offline ficam disponíveis na versão de produção, em um navegador compatível.'}
      </p>
    </div>
    {#if $pwaState.offline}<p class="journey-banner">
        Sem conexão. Missões e notas continuam sendo salvas neste navegador
        quando o armazenamento local está disponível.
      </p>{/if}{#if $pwaState.installed}<p>
        Instalação identificada neste navegador.
      </p>{:else if $pwaState.installable}<Button onclick={installApp}
        >Instalar aplicativo</Button
      >{:else}<p class="lmu-hint">
        Quando disponível, use o menu do navegador para instalar o aplicativo ou
        adicioná-lo à tela inicial.
      </p>{/if}{#if $pwaState.waiting}<p>
        Uma nova versão está pronta. {$pwaState.compatible
          ? 'A atualização só avança quando todas as abas estiverem sem gravações e formulários abertos.'
          : 'Esta versão requer uma transição de dados. Exporte um backup e feche as abas do aplicativo antes de abrir a nova versão.'}
      </p>
      <Button
        disabled={!$pwaState.compatible}
        loading={$pwaState.checking}
        onclick={applyUpdate}>Atualizar aplicativo</Button
      >{/if}{#if $pwaState.supported}<Button
        variant="secondary"
        loading={$pwaState.checking}
        onclick={checkUpdate}>Verificar atualização</Button
      >{/if}{#if $pwaState.message}<p class="journey-banner">
        {$pwaState.message}
      </p>{/if}{#if storage}<p class="lmu-hint">
        Armazenamento protegido contra limpeza automática: {storage.persisted
          ? 'sim'
          : 'não'}.{#if storage.usage != null}
          &nbsp;Uso aproximado neste endereço: {mib(storage.usage)}.{/if}
      </p>
      {#if !storage.persisted}<Button
          variant="secondary"
          disabled={busy}
          onclick={persist}>Solicitar proteção dos dados locais</Button
        >{/if}{/if}{#if message}<p role="status">{message}</p>{/if}
    <details>
      <summary>Sobre esta versão</summary>
      <p class="lmu-hint">
        Beta local · Revisão em uso: <code style="overflow-wrap: anywhere"
          >{$pwaState.activeVersion || 'não confirmada neste acesso'}</code
        >
      </p>
      <p class="lmu-hint">
        Esta identificação corresponde à versão que está rodando nesta janela.
        Use-a ao relatar um problema.
      </p>
    </details>
    <p class="lmu-hint">
      Offline e instalação não são sincronização nem backup. Apagar os dados do
      site remove a jornada e suas recuperações locais. O primeiro acesso e a
      preparação de uma nova versão precisam de conexão.
    </p>
  </div></Card
>
