import { onMount } from 'svelte';
import { registerUpdateGuard } from '$services/updateSafety';
import { beforeNavigate } from '$app/navigation';
export function protectMutation(pending: () => boolean, notify: () => void) {
  beforeNavigate(({ cancel }) => {
    if (pending()) {
      cancel();
      notify();
    }
  });
  onMount(() => {
    const removeGuard = registerUpdateGuard(pending);
    const protect = (event: BeforeUnloadEvent) => {
      if (pending()) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', protect);
    return () => {
      removeGuard();
      window.removeEventListener('beforeunload', protect);
    };
  });
}
