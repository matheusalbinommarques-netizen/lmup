<script lang="ts">
  import { onMount } from 'svelte';
  import { pilotScenes, type PilotChoice } from '$lib/content/pilot';
  import { advancePilot, qualifyingCompletions, readPilot } from '$services/rpgPilotService';
  import { journeyQuery } from '$services/journeyQuery';
  import Button from '$lib/ui/Button.svelte';
  import Artwork from '$lib/ui/Artwork.svelte';
  let stage = $state(0);
  let completed = $state(0);
  let ready = $state(false);
  let busy = $state(false);
  let error = $state('');
  let choice = $state<PilotChoice | ''>('');
  onMount(() => {
    let live = true;
    const load = async () => {
      try {
        const [saved, count] = await Promise.all([readPilot(), qualifyingCompletions()]);
        if (live) { stage = saved.scene; choice = saved.choice ?? ''; completed = count; ready = true; }
      } catch (cause) { if (live) error = cause instanceof Error ? cause.message : 'Não foi possível abrir a aventura.'; }
    };
    void load();
    // Progress is read again when the user returns from completing a real mission.
    const focus = () => { void load(); };
    window.addEventListener('focus', focus);
    const subscription = journeyQuery().subscribe({next: () => {void qualifyingCompletions().then(n => {if (live) completed=n;});}});
    return () => {live=false; window.removeEventListener('focus',focus); subscription.unsubscribe();};
  });
  async function next(selected?: PilotChoice) {
    if (busy) return;
    busy=true; error='';
    try {const result=await advancePilot(stage,selected);stage=result.scene;choice=result.choice??'';}
    catch(cause) {error=cause instanceof Error ? cause.message : 'Não foi possível salvar o progresso.';}
    finally {busy=false;}
  }
  const current = $derived(pilotScenes[Math.min(stage,5)]);
</script>
<svelte:head><title>Aventura experimental · Level Me Up</title></svelte:head>
<section class="rpg-pilot">
  <header><p class="lmu-eyebrow">Experimento narrativo · não canônico</p><h1>O outro lado da ponte</h1><p class="lmu-muted">Uma experiência curta. Você decide quando avançar.</p></header>
  {#if error}<p role="alert" class="journey-error">{error}</p>{/if}
  {#if !ready}<p role="status">Preparando a aventura…</p>
  {:else}
    <div class="rpg-pilot-scene">
      <Artwork src="/art/bg/bg-taverna.webp" alt="Ambiente de fantasia iluminado, com arquitetura antiga" eager />
      <div class="rpg-pilot-overlay">
        <span class="rpg-pilot-progress">Cena {Math.min(stage+1,6)} de 6</span>
        {#if stage < 6}
          <h2>{current.title}</h2>
          <p>{current.text}</p>
          <p class="rpg-pilot-caption">{current.caption}</p>
        {:else}
          <h2>{choice==='help'?'A promessa feita ao guarda':'O eco sob as pedras'}</h2>
          <p>{choice==='help'?'Você fica ao lado do guarda, improvisa ajuda e promete voltar com reforços. Quando a passagem é reaberta, ele se lembra de você.':'Você segue os passos pelas galerias, deixando sinais do caminho para que o guarda encontre ajuda. Lá embaixo, descobre uma inscrição que alguém tentou apagar.'}</p>
          <p class="rpg-pilot-caption">Esta escolha ficou registrada. Este é o fim do piloto, não da campanha.</p>
        {/if}
      </div>
    </div>
    <div class="rpg-pilot-actions">
      {#if stage===3 && completed===0}
        <p>Conclua qualquer missão real para continuar. A aventura permanecerá aqui.</p>
        <a class="lmu-button lmu-button--primary" href="/missoes">Ir às minhas missões</a>
      {:else if stage===5}
        <Button disabled={busy} onclick={() => next('help')}>Ajudar o guarda</Button>
        <Button variant="secondary" disabled={busy} onclick={() => next('follow')}>Investigar os passos</Button>
      {:else if stage<6}
        <Button disabled={busy} onclick={() => next()}>{stage===3?'Continuar aventura':'Próxima cena'}</Button>
      {:else}
        <a class="lmu-button lmu-button--primary" href="/">Voltar para Hoje</a>
      {/if}
      {#if stage<6}<a class="lmu-button lmu-button--secondary" href="/">Voltar para Hoje</a>{/if}
    </div>
  {/if}
</section>
<style>
  .rpg-pilot{max-width:960px;margin:0 auto;padding:1.5rem 0 3rem}
  .rpg-pilot-scene{position:relative;min-height:440px;overflow:hidden;border-radius:1rem;border:1px solid #8f7654;background:#171a21;margin-top:1.5rem;display:flex;flex-direction:column;justify-content:flex-end}
  .rpg-pilot-scene :global(img){position:absolute;width:100%;height:100%;inset:0;object-fit:cover;opacity:.68}
  .rpg-pilot-overlay{position:relative;z-index:1;padding:clamp(1.1rem,4vw,2.5rem);background:linear-gradient(transparent,rgba(10,13,19,.96) 33%);color:#f5eddb}
  .rpg-pilot-progress{font-size:.83rem;letter-spacing:.1em;text-transform:uppercase;color:#ddc69e}
  .rpg-pilot-overlay h2{font-size:clamp(1.6rem,4vw,2.4rem);margin:.7rem 0}
  .rpg-pilot-overlay p{max-width:67ch;line-height:1.65}
  .rpg-pilot-caption{font-style:italic;color:#e5c995}
  .rpg-pilot-actions{margin-top:1rem;display:flex;align-items:center;gap:.75rem;flex-wrap:wrap}
  .rpg-pilot-actions p{flex-basis:100%}
  @media(prefers-reduced-motion:reduce){.rpg-pilot-scene,.rpg-pilot-scene *{animation:none!important;transition:none!important}}
</style>