<script lang="ts">
  import { sanctuaryContent } from '$lib/content/world';

  type BuildingState = 'empty' | 'building' | 'built';
  let state = $state<BuildingState>('empty');
  let selected = $state(false);
  let stage = $state<1 | 2 | 3 | 4>(2);
  const label = $derived(state === 'empty' ? 'Terreno disponível' : state === 'building' ? 'Forja em construção' : 'Forja concluída');
  function advance() {
    state = state === 'empty' ? 'building' : state === 'building' ? 'built' : 'empty';
  }
</script>

<svelte:head>
  <title>Laboratório — Cena do santuário · LMUP</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="pilot">
  <header>
    <div><p class="eyebrow">Laboratório isolado · dados demonstrativos</p><h1>Cena interativa do santuário</h1>
      <p>Experimento de seleção e transformação de um espaço. Nenhum progresso real é utilizado.</p></div>
    <a href="/laboratorio">Voltar ao laboratório</a>
  </header>

  <div class="layout">
    <section class="scene" aria-label="Vista demonstrativa do santuário">
      <img src={sanctuaryContent[stage].pilot} alt="" class="background" />
      <div class="shade"></div>
      <div class="scene-caption">Ambiente de referência · estágio {stage}</div>
      <button
        class="plot"
        class:chosen={selected}
        class:complete={state === 'built'}
        class:working={state === 'building'}
        onclick={() => (selected = !selected)}
        aria-pressed={selected}
        aria-label="Selecionar espaço de construção: {label}"
      >
        <span class="symbol" aria-hidden="true">{state === 'empty' ? '+' : state === 'building' ? '⚒' : '♜'}</span>
        <span class="plot-label">{label}</span>
      </button>
      <div class="scene-footer">Selecione o espaço destacado para consultar a construção</div>
    </section>

    <aside class="detail">
      <p class="eyebrow">Construção demonstrativa</p>
      <h2>{selected ? label : 'Selecione um espaço'}</h2>
      {#if selected}
        <p>{state === 'empty' ? 'Um terreno livre para estabelecer a primeira forja.' : state === 'building' ? 'A estrutura está sendo erguida. Este estado poderá receber arte própria.' : 'A forja está pronta. O próximo passo será definir níveis, aparência e benefícios reais.'}</p>
        <div class="meta"><span>Edifício</span><strong>Forja</strong></div>
        <div class="meta"><span>Estado</span><strong>{state === 'empty' ? 'Livre' : state === 'building' ? 'Em construção' : 'Concluído'}</strong></div>
        <button class="primary" onclick={advance}>{state === 'empty' ? 'Simular construção' : state === 'building' ? 'Simular conclusão' : 'Reiniciar demonstração'}</button>
      {:else}
        <p>Clique ou toque no marcador da cena. O painel apresenta somente as ações relacionadas ao espaço selecionado.</p>
      {/if}
      <hr />
      <label for="environment">Cenário demonstrativo</label>
      <select id="environment" bind:value={stage}>
        <option value={1}>Semente</option><option value={2}>Brotinho</option><option value={3}>Árvore jovem</option><option value={4}>Floresta anciã</option>
      </select>
      <p class="note">A arte de fundo existente não foi criada para receber edifícios em camadas. O marcador é provisório: esta entrega valida estados e interações, não a direção de arte final.</p>
    </aside>
  </div>
</div>

<style>
  .pilot{max-width:1200px;margin:auto;padding:clamp(1rem,3vw,2rem);color:#e9e1d3;font-family:system-ui,sans-serif}
  .pilot header{display:flex;align-items:start;justify-content:space-between;gap:1rem;margin-bottom:1.5rem}
  .pilot header p{max-width:670px;color:#bcb6ab;line-height:1.55}
  .pilot h1{font-size:clamp(1.7rem,3vw,2.5rem);margin:.25rem 0}
  .pilot a{color:#ead0a1;white-space:nowrap;min-height:44px;display:inline-flex;align-items:center}
  .eyebrow{text-transform:uppercase;letter-spacing:.15em;font-size:.7rem;color:#c8ad75}
  .layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,320px);gap:1rem}
  .scene{position:relative;overflow:hidden;aspect-ratio:16/10;border:1px solid #876e47;border-radius:14px;background:#1c2827}
  .background{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .shade{position:absolute;inset:0;background:linear-gradient(180deg,#09121250,transparent 35%,#091212bb)}
  .scene-caption,.scene-footer{position:absolute;left:1rem;color:#f6e9ce;text-shadow:0 1px 4px #000}
  .scene-caption{top:1rem;font-size:.8rem}.scene-footer{bottom:1rem;font-size:.8rem}
  .plot{position:absolute;left:52%;top:54%;transform:translate(-50%,-50%);width:clamp(110px,25%,180px);min-height:110px;padding:1rem .4rem;background:#0d1b1aca;border:2px dashed #e6cb87;border-radius:18px;color:#fff4d7;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.5rem;box-shadow:0 8px 30px #0008}
  .plot:hover,.plot:focus-visible,.plot.chosen{outline:3px solid #fff4c1;outline-offset:3px;background:#23312de6}
  .plot.working{border-style:solid;border-color:#dba75f}.plot.complete{border-style:solid;border-color:#a8d6b0}
  .symbol{font-size:2.3rem;line-height:1}.plot-label{font-size:.78rem;font-weight:700;text-align:center}
  .detail{border:1px solid #6d6049;background:#211f1c;padding:1.3rem;border-radius:14px;display:flex;flex-direction:column;align-items:stretch;gap:.7rem}
  .detail h2{font-size:1.45rem;margin:0}.detail p{color:#d1c6b8;line-height:1.55;margin:.2rem 0}
  .meta{display:flex;justify-content:space-between;gap:1rem;padding:.6rem 0;border-bottom:1px solid #4b4438}
  .primary{min-height:44px;padding:.8rem 1rem;color:#231b10;background:#e5c27b;border:0;border-radius:8px;font-weight:700;cursor:pointer}
  .primary:focus-visible,.pilot select:focus-visible{outline:3px solid #fff4c1;outline-offset:2px}
  .pilot select{min-height:44px;border-radius:8px;background:#312c25;color:#f6e9ce;border:1px solid #8b795a;padding:.5rem}
  .pilot label{font-weight:600}.note{font-size:.8rem}
  @media(max-width:750px){.pilot header{display:block}.layout{grid-template-columns:1fr}.scene{aspect-ratio:4/3}.plot{top:51%;min-height:95px}.detail{min-height:240px}}
  @media(prefers-reduced-motion:no-preference){.plot{transition:background .15s,box-shadow .15s}}
</style>
