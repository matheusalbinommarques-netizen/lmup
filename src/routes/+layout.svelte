<!-- src/routes/+layout.svelte -->
<script lang="ts">
  // ✅ garante que o Tailwind entre no bundle
  import '../app.css';

  import BottomNav from '$lib/BottomNav.svelte';
  import DesktopNav from '$lib/DesktopNav.svelte';
  import type { Snippet } from 'svelte';

  // Svelte 5: filhos chegam como Snippet e rendemos com {@render}
  let { children } = $props<{ children: Snippet }>();
</script>

<div class="min-h-dvh bg-slate-950 text-slate-200 md:flex">
  <!-- Navegação lateral (desktop) -->
  <DesktopNav />

  <!-- Conteúdo -->
  <div class="flex-1 min-w-0 relative flex flex-col">
    <main
      class="flex-1 p-4 md:p-8 overflow-y-auto scroll-smooth pb-[100px] md:pb-8"
    >
      <div class="mx-auto w-full max-w-5xl">
        {@render children()}
      </div>
    </main>
  </div>

  <!-- Bottom nav (mobile) -->
  <div class="md:hidden fixed bottom-0 left-0 right-0 z-50">
    <BottomNav />
  </div>
</div>

<!-- ✅ segunda garantia: injeta o CSS global via tag -->
<style global src="../app.css"></style>
