<!-- src/lib/EditProfileModal.svelte -->
<script lang="ts">
  import { db, type Profile } from '$services/db';
  import { onMount } from 'svelte';

  // Props (runes Svelte 5)
  let { profile, close } = $props<{ profile: Profile; close: () => void }>();

  // --- Estado local para o formulário ---
  let localName = $state(profile.name);
  let localAvatarUrl = $state(profile.avatarUrl || '');
  let isSaving = $state(false);

  /**
   * Sincroniza o estado local quando o 'profile' (vindo da Taverna)
   * é carregado / atualizado.
   */
  $effect(() => {
    // Evita sobrescrever com placeholder tipo "Carregando..."
    if (profile?.name && profile.name !== 'Carregando...') {
      localName = profile.name;
      localAvatarUrl = profile.avatarUrl || '';
    }
  });

  // --- Escape fecha o modal ---
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

  // --- Overlay: clique fora + teclado ---
  function handleOverlayClick(event: MouseEvent) {
    if (event.currentTarget === event.target) {
      close();
    }
  }

  function handleOverlayKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      close();
    }
  }

  // --- Upload de avatar (Base64) ---
  function handleFileChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      localAvatarUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  // --- Salvar perfil (cria se não existir) ---
  async function handleSave(e: Event) {
    e.preventDefault();
    const trimmedName = localName.trim();
    if (isSaving || !trimmedName) return;

    isSaving = true;

    try {
      const existing = await db.profile.get(1);

      if (!existing) {
        // Primeiro perfil após reset / instalação
        await db.profile.put({
          id: 1,
          name: trimmedName,
          title: 'Nobre Aventureiro Nv. 1',
          level: 1,
          xpCurrent: 0,
          xpNext: 100,
          avatarUrl: localAvatarUrl,
          totalXpEarned: 0,
          currentStreak: 0,
          lastCompletionDate: '',
          activeCompanionId: 1,
        });
      } else {
        // Atualiza somente identidade visual
        await db.profile.update(1, {
          name: trimmedName,
          avatarUrl: localAvatarUrl,
        });
      }

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
        class="block text-sm font-medium text-slate-300"
      >
        Avatar
      </label>

      <div class="flex items-center gap-4">
        {#if localAvatarUrl}
          <img
            src={localAvatarUrl}
            alt="Avatar do herói"
            class="w-20 h-20 rounded-full object-cover border border-slate-700 shadow-md"
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
          class="text-xs text-slate-400
            file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0
            file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
        />
      </div>

      <label
        for="profileName"
        class="block text-sm font-medium text-slate-300 mt-4"
      >
        Nome do herói
      </label>
      <input
        id="profileName"
        type="text"
        bind:value={localName}
        class="w-full rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2
          text-sm text-slate-100 placeholder:text-slate-500
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        placeholder="Digite o nome do seu herói"
      />

      <p class="text-xs text-slate-500 mt-1">
        Esse é o nome que aparecerá na Taverna, nos Clãs e nos rankings.
      </p>

      <div class="flex gap-4 mt-6">
        <button
          type="button"
          onclick={close}
          class="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600
            text-slate-100 text-sm font-medium transition-colors"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isSaving}
          class="flex-1 py-2 rounded-lg bg-primary hover:bg-primary/90
            text-slate-950 text-sm font-bold transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  </div>
</div>
