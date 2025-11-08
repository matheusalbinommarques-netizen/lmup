<script lang="ts">
  import { db, type Profile } from '$services/db';
  // CORREÇÃO: 'onDestroy' removido (não utilizado)
  import { onMount } from 'svelte';

  // Props
  let { profile, close }: { profile: Profile; close: () => void } = $props();

  // --- Estado local para o formulário ---
  let localName = $state(profile.name);
  let localAvatarUrl = $state(profile.avatarUrl || '');
  let isSaving = $state(false);

  /**
   * Sincroniza o estado local quando o 'profile' (vindo da Taverna)
   * é carregado.
   */
  $effect(() => {
    // Apenas atualiza se o profile.name for real (não "Carregando...")
    if (profile.name !== 'Carregando...') {
      localName = profile.name;
      localAvatarUrl = profile.avatarUrl || '';
    }
  });

  // --- Handlers de Acessibilidade (Escape key) ---
  onMount(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });

  // --- Handlers de Acessibilidade (Overlay click) ---
  function handleOverlayClick(event: MouseEvent) {
    if (event.currentTarget === event.target) {
      close();
    }
  }

  function handleOverlayKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      close();
    }
  }

  // --- Lógica do Componente ---

  // Converte a imagem para um Data URL (Base64)
  function handleFileChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      // Atualiza o estado local
      localAvatarUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  // Salva o perfil
  async function handleSave(e: Event) {
    e.preventDefault();
    if (isSaving || !localName) return;
    isSaving = true;

    try {
      // Salva o estado local na base de dados
      await db.profile.update(1, {
        name: localName,
        avatarUrl: localAvatarUrl,
      });
      close(); // Fecha o modal
    } catch (err) {
      console.error('Falha ao salvar perfil', err);
      alert('Não foi possível salvar o perfil.');
    } finally {
      isSaving = false;
    }
  }
</script>

<div
  class="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4"
  onclick={handleOverlayClick}
  onkeydown={handleOverlayKeydown}
  role="button"
  tabindex="0"
>
  <div
    class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg w-full max-w-md"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
  >
    <h2 class="text-xl font-bold text-[#ffb74d] font-serif mb-6">
      Editar Perfil
    </h2>

    <form onsubmit={handleSave} class="flex flex-col gap-4">
      <label
        for="avatar-upload"
        class="block text-sm font-medium text-slate-300">Avatar</label
      >
      <div class="flex items-center gap-4">
        {#if localAvatarUrl}
          <img
            src={localAvatarUrl}
            alt="Avatar"
            class="w-20 h-20 rounded-full object-cover bg-slate-700"
          />
        {:else}
          <div
            class="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center"
          >
            <span class="text-3xl opacity-50">👤</span>
          </div>
        {/if}

        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onchange={handleFileChange}
          class="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
        />
      </div>

      <label for="profileName" class="block text-sm font-medium text-slate-300"
        >Nome</label
      >
      <input
        id="profileName"
        type="text"
        bind:value={localName}
        class="bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
        required
      />

      <div class="flex gap-4 mt-6">
        <button
          type="button"
          onclick={close}
          class="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaving}
          class="flex-1 py-2 rounded-lg bg-primary hover:bg-primary-light text-slate-950 font-bold transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  </div>
</div>
