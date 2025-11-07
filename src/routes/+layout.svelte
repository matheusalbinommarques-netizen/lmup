<script lang="ts">
  import '../app.css';
  import BottomNav from '$lib/BottomNav.svelte';
  import TopBar from '$lib/TopBar.svelte';

  const { children } = $props();
</script>

<div
  class="fixed inset-0 bg-[url('/art/bg/bg-taverna.png')] bg-cover bg-center flex items-center justify-center overflow-hidden font-sans"
>
  <!-- container do frame 1024x1024 -->
  <div
    class="relative h-[95vh] max-h-[900px] aspect-square max-w-[500px] filter drop-shadow-2xl"
  >
    <!-- frame -->
    <img
      src="/art/bg/bg-main-shell.webp"
      alt="Device Frame"
      class="absolute inset-0 w-full h-full object-contain z-50 pointer-events-none select-none"
    />

    <!-- tela interna (467x830 dentro de 1024x1024) -->
    <div
      class="absolute z-10 bg-black overflow-hidden flex flex-col rounded-[35px]"
      style="top: 15%; bottom: 15%; left: 27.2%; right: 27.2%;"
    >
      <div class="absolute inset-0">
        <img
          src="/art/bg/bg-global-dungeon.webp"
          alt=""
          class="w-full h-full object-cover"
        />
      </div>

      <div class="relative z-20 w-full h-full flex flex-col pt-8 pb-4 px-1">
        <TopBar />

        <main class="flex-1 w-full overflow-y-auto scroll-smooth no-scrollbar">
          {@render children()}
        </main>

        <BottomNav />
      </div>
    </div>
  </div>
</div>

<style>
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
