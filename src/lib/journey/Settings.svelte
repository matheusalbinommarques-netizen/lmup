<script lang="ts">
  import UpdateCenter from './UpdateCenter.svelte';
  import { onMount } from 'svelte';
  import {
    comfort,
    comfortWarning,
    setComfort,
    type ComfortPrefs,
  } from '$services/comfortService';
  import {
    settingsQuery,
    type SettingsSnapshot,
  } from '$services/settingsQuery';
  import {
    exportData,
    exportRecoveryData,
    prepareBackup,
  } from '$services/backupService';
  import {
    restoreJourneyBackup,
    resetJourney,
    type JourneyBackup,
  } from '$services/backupDataService';
  import { protectMutation } from './protectMutation';
  import Card from '$lib/ui/Card.svelte';
  import Button from '$lib/ui/Button.svelte';
  import Field from '$lib/ui/Field.svelte';
  import Dialog from '$lib/ui/Dialog.svelte';
  let data = $state<SettingsSnapshot>();
  let error = $state(''),
    notice = $state(''),
    busy = $state(false),
    importOpen = $state(false),
    resetOpen = $state(false),
    confirmText = $state(''),
    lastExport = $state(''),
    origin = $state('');
  let fileInput: HTMLInputElement;
  let prepared = $state.raw<{
    backup: JourneyBackup;
    summary: { tasks: number; projects: number; events: number; name: string };
  } | null>(null);
  const preferences: {
    key: keyof ComfortPrefs;
    title: string;
    description: string;
  }[] = [
    {
      key: 'focusMode',
      title: 'Modo foco',
      description:
        'Reduz a arte decorativa. Textos, ícones de ação e navegação continuam disponíveis.',
    },
    {
      key: 'largeText',
      title: 'Texto maior',
      description:
        'Amplia a base de leitura em todas as telas. Você também pode usar o zoom do navegador.',
    },
    {
      key: 'lowStimulus',
      title: 'Estímulos suaves',
      description: 'Reduz brilho e desativa animações e transições.',
    },
    {
      key: 'reducedMotion',
      title: 'Reduzir movimento',
      description:
        'Desativa animações e rolagem suave. A preferência de movimento do sistema também é respeitada.',
    },
  ];
  protectMutation(
    () => busy,
    () => {
      notice = 'Aguarde a confirmação antes de sair.';
    },
  );
  onMount(() => {
    origin = location.origin;
    try {
      lastExport = localStorage.getItem('lmup:last-export') ?? '';
    } catch {
      /* Storage may be unavailable independently of the database. */
    }
    const sub = settingsQuery().subscribe({
      next: (value) => {
        data = value;
      },
      error: () => {
        error = 'Não foi possível ler as informações de armazenamento.';
      },
    });
    return () => sub.unsubscribe();
  });
  async function download(recovery = false) {
    if (busy) return;
    busy = true;
    error = '';
    notice = '';
    try {
      if (recovery) await exportRecoveryData();
      else {
        await exportData();
        lastExport = new Date().toISOString();
      }
      notice = recovery
        ? 'Arquivo de recuperação gerado. Confira o download no navegador.'
        : 'Exportação iniciada. Confira se o arquivo foi salvo fora deste navegador.';
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível exportar. Seus dados continuam aqui.';
    } finally {
      busy = false;
    }
  }
  async function chooseFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || busy) return;
    busy = true;
    error = '';
    notice = '';
    try {
      prepared = await prepareBackup(file);
      importOpen = true;
    } catch (cause) {
      prepared = null;
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível ler o backup. Os dados atuais foram preservados.';
    } finally {
      busy = false;
      input.value = '';
    }
  }
  async function restore() {
    if (!prepared || busy) return;
    busy = true;
    error = '';
    try {
      await restoreJourneyBackup(prepared.backup);
      prepared = null;
      importOpen = false;
      notice =
        'Backup importado com sucesso. As telas já usam os dados restaurados.';
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível importar. Os dados atuais foram preservados.';
    } finally {
      busy = false;
    }
  }
  async function reset() {
    if (busy || confirmText !== 'REINICIAR') return;
    busy = true;
    error = '';
    try {
      await resetJourney();
      resetOpen = false;
      confirmText = '';
      notice =
        'Jornada reiniciada. Nome, avatar e preferências foram preservados. A recuperação local está disponível abaixo.';
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível reiniciar. Seus dados foram preservados.';
    } finally {
      busy = false;
    }
  }
  function date(value: string) {
    return Number.isNaN(new Date(value).getTime())
      ? 'Data indisponível'
      : new Date(value).toLocaleString('pt-BR');
  }
</script>

<svelte:head><title>Configurações · Level Me Up</title></svelte:head>
<header class="journey-heading collection-heading">
  <div>
    <p class="lmu-eyebrow">Seu ritmo, seus dados</p>
    <h1>Configurações</h1>
    <p>Escolha como usar o aplicativo e cuide da sua jornada.</p>
  </div>
  <a class="journey-link" href="/progresso">Meu progresso e histórico →</a>
</header>
<p role="status" class="journey-save-status">{notice}</p>
{#if error && !importOpen && !resetOpen}<p role="alert" class="journey-error">
    {error}
  </p>{/if}
<section class="journey-stack">
  <UpdateCenter />
  <Card
    ><div class="journey-stack">
      <div>
        <h2>Conforto e leitura</h2>
        <p class="lmu-muted">
          As preferências valem neste navegador e são aplicadas ao abrir
          qualquer tela. Não alteram XP, saldos ou recompensas.
        </p>
      </div>
      {#each preferences as preference (preference.key)}<label
          class="settings-preference"
          ><div>
            <strong>{preference.title}</strong>
            <p class="lmu-hint">{preference.description}</p>
          </div>
          <input
            type="checkbox"
            checked={$comfort[preference.key]}
            onchange={(event) =>
              setComfort(preference.key, event.currentTarget.checked)}
            aria-label={preference.title}
          /></label
        >{/each}{#if $comfortWarning}<p role="status" class="journey-banner">
          {$comfortWarning}
        </p>{/if}
    </div></Card
  >
  <Card
    ><div class="journey-stack">
      <div>
        <p class="lmu-eyebrow">Armazenamento local</p>
        <h2>Seus dados ficam neste navegador</h2>
        <p class="lmu-muted">
          Não há conta nem sincronização em nuvem. Trocar de navegador ou
          endereço cria outro espaço de dados. Apagar os dados do site remove
          também as cópias locais de recuperação.
        </p>
      </div>
      {#if data}<p>
          {data.tasks} missões · {data.projects} projetos · {data.events} registros
          de progresso.
        </p>{/if}
      <p class="lmu-hint">
        {lastExport
          ? 'Última exportação iniciada neste navegador: ' +
            date(lastExport) +
            '.'
          : 'Nenhuma exportação foi registrada neste navegador.'} Essa informação
        não comprova que o arquivo foi salvo; confira seus downloads.
      </p>
      <div class="journey-actions">
        <Button loading={busy} onclick={() => download()}>Exportar dados</Button
        ><Button
          variant="secondary"
          disabled={busy}
          onclick={() => fileInput.click()}>Importar backup</Button
        >
      </div>
      <input
        bind:this={fileInput}
        type="file"
        accept=".json,application/json"
        onchange={chooseFile}
        disabled={busy}
        hidden
        aria-label="Arquivo de backup JSON"
      />
      <p class="lmu-hint">
        O arquivo pode conter nome, notas, missões, compras e cuidados dos
        companheiros. Guarde uma cópia externa em local de sua confiança.
        Preferências de conforto pertencem a este navegador e não são
        substituídas pelo backup.
      </p>
      <details>
        <summary>Sobre este espaço de dados</summary>
        <p>Endereço atual: {origin}</p>
        <p class="lmu-hint">
          Para levar a jornada a outro aparelho ou navegador, exporte seus dados
          e importe o arquivo no destino.
        </p>
      </details>
    </div></Card
  >
  <Card
    ><div class="journey-stack">
      <div>
        <h2>Recuperação local</h2>
        <p class="lmu-muted">
          Antes de importar ou reiniciar, o aplicativo guarda uma cópia do
          estado anterior neste mesmo navegador. Ela não substitui um arquivo
          externo.
        </p>
      </div>
      {#if data?.recoveries.length}<Button
          variant="secondary"
          disabled={busy}
          onclick={() => download(true)}
          >Exportar recuperação mais recente</Button
        >
        <ul class="lmu-list settings-recoveries">
          {#each data.recoveries as recovery (recovery.id)}<li>
              <strong
                >{recovery.reason === 'before-import'
                  ? 'Antes de importar'
                  : recovery.reason === 'before-reset'
                    ? 'Antes de reiniciar'
                    : 'Migração do banco antigo'}</strong
              ><span>{date(recovery.createdAt)} · {recovery.tasks} missões</span
              >
            </li>{/each}
        </ul>
        <p class="lmu-hint">
          São mantidas até cinco cópias recentes, além da cópia de migração
          quando houver. Para voltar a uma cópia, exporte a recuperação mais
          recente e importe o arquivo.
        </p>{:else}<p>
          Nenhuma cópia local de recuperação foi registrada.
        </p>{/if}
    </div></Card
  >
  <Card
    ><div class="journey-stack">
      <div>
        <p class="lmu-eyebrow">Recomeçar</p>
        <h2>Reiniciar a jornada</h2>
        <p>
          Remove missões, projetos, histórico, itens e evolução dos
          companheiros. Nome e avatar permanecem. As preferências deste
          navegador também são mantidas.
        </p>
      </div>
      <Button
        variant="danger"
        disabled={busy}
        onclick={() => {
          confirmText = '';
          error = '';
          resetOpen = true;
        }}>Reiniciar jornada</Button
      >
    </div></Card
  >
</section>
<Dialog bind:open={importOpen} title="Importar este backup?" dismissible={!busy}
  >{#if prepared}<div class="collection-confirm">
      <p>Jornada de <strong>{prepared.summary.name}</strong>.</p>
      <p>
        {prepared.summary.tasks} missões · {prepared.summary.projects} projetos ·
        {prepared.summary.events} registros de progresso.
      </p>
      <p>
        XP acumulado: {prepared.backup.data.profile?.totalXpEarned ?? 0} · Gold:
        {prepared.backup.data.profile?.gold ?? 0} · Comida: {prepared.backup
          .data.profile?.food ?? 0}.
      </p>
      <p>
        Este arquivo substituirá os dados atuais. Uma cópia local do estado
        anterior será guardada antes da troca.
      </p>
      <p class="lmu-hint">
        Se quiser uma cópia independente do estado atual, cancele e use Exportar
        dados primeiro.
      </p>
      {#if error}<p role="alert" class="journey-error">{error}</p>{/if}
      <footer>
        <Button
          variant="quiet"
          disabled={busy}
          onclick={() => {
            importOpen = false;
            prepared = null;
          }}>Cancelar</Button
        ><Button loading={busy} onclick={restore}
          >Substituir pelos dados do backup</Button
        >
      </footer>
    </div>{/if}</Dialog
>
<Dialog bind:open={resetOpen} title="Reiniciar a jornada?" dismissible={!busy}
  ><div class="collection-confirm">
    <p>
      Nome, avatar e preferências serão preservados. O restante da jornada será
      reiniciado, incluindo projetos, itens e companheiros.
    </p>
    <p class="lmu-hint">
      Uma recuperação local será guardada. Ela também desaparece se os dados do
      site forem apagados; exporte um arquivo externo para ter uma cópia
      independente.
    </p>
    <Field
      label="Digite REINICIAR para confirmar"
      bind:value={confirmText}
      autocomplete="off"
    />{#if error}<p role="alert" class="journey-error">{error}</p>{/if}
    <footer>
      <Button
        variant="quiet"
        disabled={busy}
        onclick={() => {
          resetOpen = false;
        }}>Cancelar</Button
      ><Button
        variant="danger"
        disabled={confirmText !== 'REINICIAR'}
        loading={busy}
        onclick={reset}>Confirmar reinício</Button
      >
    </footer>
  </div></Dialog
>
