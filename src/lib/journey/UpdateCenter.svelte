<script lang="ts">
  import { onMount } from 'svelte';
  import Card from '$lib/ui/Card.svelte';
  import Button from '$lib/ui/Button.svelte';

  type SyncState = {
    state: string;
    step: string | null;
    commit: string | null;
    version: string | null;
    checkedAt: string | null;
    reason: string | null;
    message: string | null;
  };
  type ServerStatus = {
    service: string;
    version: string | null;
    commit: string | null;
    sync: SyncState | null;
  };

  let status = $state<ServerStatus | null>(null);
  let unavailable = $state(false);
  let checking = $state(false);

  const stateNames: Record<string, string> = {
    current: 'Atualizado',
    published: 'Nova publicação pronta',
    waiting: 'Aguardando intervenção',
    paused: 'Sincronização pausada',
    error: 'Erro na sincronização',
    validating: 'Verificando nova versão',
    unknown: 'Estado desconhecido',
  };
  const stepNames: Record<string, string> = {
    dependencies: 'Instalando dependências',
    audit: 'Auditando segurança',
    verify: 'Verificando código e compilando',
    pwa: 'Testando o modo offline',
    package: 'Testando o pacote de publicação',
  };
  const reasonNames: Record<string, string> = {
    'branch-different': 'A cópia de publicação está em outra branch.',
    'local-changes': 'Há alterações locais na cópia de publicação.',
    'git-operation': 'Existe uma operação Git pendente.',
    'head-changed': 'O código mudou durante a validação.',
    'remote-changed': 'O remoto configurado foi alterado.',
    'diverged-or-local-ahead': 'O histórico da cópia local divergiu do remoto.',
    disabled: 'A tarefa de sincronização está desativada.',
  };

  function short(value: string | null | undefined) {
    return value ? value.slice(0, 8) : 'Não disponível';
  }
  function date(value: string | null | undefined) {
    if (!value) return 'Não registrada';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 'Não registrada' : parsed.toLocaleString('pt-BR');
  }
  async function refresh() {
    if (checking) return;
    checking = true;
    try {
      const response = await fetch('/__lmup/status', {
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw Error('Indisponível');
      const value = (await response.json()) as ServerStatus;
      if (value.service !== 'lmup-local-publications') throw Error('Servidor desconhecido');
      status = value;
      unavailable = false;
    } catch {
      unavailable = true;
      status = null;
    } finally {
      checking = false;
    }
  }

  onMount(() => {
    void refresh();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') void refresh();
    }, 15000);
    return () => clearInterval(interval);
  });
</script>

<Card>
  <div class="journey-stack">
    <div>
      <p class="lmu-eyebrow">GitHub · Publicação local</p>
      <h2>Central de Atualizações</h2>
      <p class="lmu-muted">
        A publicação é validada no computador antes de chegar ao Chrome.
        A ativação no navegador continua sendo feita na seção de atualização abaixo.
      </p>
    </div>
    {#if unavailable}
      <p role="status" class="lmu-hint">
        Monitor local indisponível. Você pode continuar usando suas missões, inclusive offline.
      </p>
    {:else if status}
      <dl>
        <dt>Versão publicada no servidor</dt>
        <dd>{status.version ?? 'Não disponível'}</dd>
        <dt>Commit publicado</dt>
        <dd>{short(status.commit)}</dd>
        <dt>Sincronizador</dt>
        <dd>{status.sync ? stateNames[status.sync.state] ?? 'Estado desconhecido' : 'Sem diagnóstico disponível'}</dd>
        {#if status.sync?.state === 'validating'}
          <dt>Etapa atual</dt>
          <dd role="status">{stepNames[status.sync.step ?? ''] ?? 'Validando nova versão'}</dd>
        {/if}
        {#if status.sync?.state === 'waiting' || status.sync?.state === 'paused'}
          <dt>Motivo</dt>
          <dd>{reasonNames[status.sync.reason ?? ''] ?? 'Verifique o sincronizador no computador.'}</dd>
        {/if}
        {#if status.sync?.state === 'error'}
          <p role="alert">{status.sync.message ?? 'Houve um problema na sincronização.'}</p>
        {/if}
        <dt>Última verificação</dt>
        <dd>{date(status.sync?.checkedAt)}</dd>
      </dl>
      <p class="lmu-hint">
        A versão publicada no servidor pode ser diferente da versão ativa no Chrome até você confirmar a atualização do PWA.
      </p>
    {:else}
      <p role="status" class="lmu-hint">Consultando o servidor local…</p>
    {/if}
    <div class="journey-actions">
      <Button variant="secondary" disabled={checking} onclick={refresh}>
        {checking ? 'Consultando…' : 'Atualizar status'}
      </Button>
    </div>
  </div>
</Card>
