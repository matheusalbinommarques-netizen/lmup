<script lang="ts">
  import '../app.css';
  import BottomNav from '$lib/BottomNav.svelte';
  import DesktopNav from '$lib/DesktopNav.svelte';
  import type { Snippet } from 'svelte';

  let { children } = $props<{ children: Snippet }>();
</script>

<div class="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row">
  <DesktopNav />

  <div class="flex-1 flex flex-col min-w-0 relative">
    <main
      class="flex-1 p-4 md:p-8 overflow-y-auto scroll-smooth pb-[100px] md:pb-8"
    >
      <div class="mx-auto max-w-5xl w-full">
        {@render children()}
      </div>
    </main>
  </div>

  <div class="md:hidden fixed bottom-0 left-0 right-0 z-50">
    <BottomNav />
  </div>
</div>
