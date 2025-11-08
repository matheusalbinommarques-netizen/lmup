<script lang="ts">
  import { db, type Profile } from '$services/db';
  // --- Props ---
  let { profile, close } = $props<{ profile: Profile; close: () => void }>();
  // --- Estado do Formulário ---
  let heroName = $state(profile.name);
  let heroAvatarB64 = $state(profile.avatarUrl || '');

  // --- Funções ---
  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const name = heroName.trim();
    if (!name) {
      alert('O nome não pode ficar vazio.');
      return;
    }

    try {
      await db.profile.update(1, {
        name: name,
        avatarUrl: heroAvatarB64,
      });
      close();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Falha ao salvar o perfil.');
    }
  }

  function handleFileSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      heroAvatarB64 = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
</script>

<div
  class="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
  onclick={close}
  aria-hidden="true"
></div>

<div
  class="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2
           bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6"
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title" class="text-xl font-bold text-[#ffb74d] font-serif mb-6">
    Editar Perfil
  </h2>

  <form class="flex flex-col gap-4" onsubmit={handleSubmit}>
    <div class="flex justify-center mb-2">
      <div class="grid w-32 h-32 place-items-center">
        <img
          src="/art/hero-avatar-default.png"
          alt="Moldura"
          class="col-start-1 row-start-1 w-full h-full pointer-events-none"
        />

        {#if heroAvatarB64}
          <img
            src={heroAvatarB64}
            alt="Avatar Preview"
            class="col-start-1 row-start-1 w-28 h-28 object-cover rounded-full"
          />
        {:else}
          <div
            class="col-start-1 row-start-1 w-28 h-28 rounded-full bg-slate-700"
          ></div>
        {/if}
      </div>
    </div>

    <div>
      <label
        for="avatar-upload"
        class="block text-sm font-medium text-slate-300 mb-2"
      >
        Carregar imagem (PNG ou JPG)
      </label>
      <input
        id="avatar-upload"
        type="file"
        accept="image/png, image/jpeg"
        onchange={handleFileSelect}
        class="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0 file:text-sm file:font-semibold
                       file:bg-primary/20 file:text-primary
                       hover:file:bg-primary/30 file:cursor-pointer w-full"
      />
    </div>

    <div>
      <label
        for="name"
        class="block text-sm font-medium text-slate-300 mb-1 mt-4"
      >
        Nome do Herói
      </label>
      <input
        id="name"
        type="text"
        bind:value={heroName}
        class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200
                       focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
        required
      />
    </div>

    <div class="flex justify-end gap-3 mt-6">
      <button
        type="button"
        onclick={close}
        class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm rounded-lg transition-colors"
      >
        Cancelar
      </button>
      <button
        type="submit"
        class="px-4 py-2 bg-[#ffb74d] hover:bg-[#ffa726] text-slate-950 font-bold text-sm rounded-lg transition-colors"
      >
        Salvar Alterações
      </button>
    </div>
  </form>
</div>
