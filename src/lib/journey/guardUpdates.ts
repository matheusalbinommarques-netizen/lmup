import { onMount } from 'svelte';
import { registerUpdateGuard } from '$services/updateSafety';
export function guardUpdates(pending: () => boolean) {
  onMount(() => registerUpdateGuard(pending));
}
