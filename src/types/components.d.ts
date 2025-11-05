// Garante que qualquer import de Svelte component tenha um tipo válido
declare module '$lib/StatsManager.svelte' {
  import type { ComponentType } from 'svelte';
  const component: ComponentType;
  export default component;
}
