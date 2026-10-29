import { onMount } from 'svelte';
import { beforeNavigate } from '$app/navigation';
export function protectMutation(pending: () => boolean, notify: () => void) {
  beforeNavigate(({ cancel }) => {
    if (pending()) {
      cancel();
      notify();
    }
  });
  onMount(() => {
    const protect = (event: BeforeUnloadEvent) => {
      if (pending()) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', protect);
    return () => window.removeEventListener('beforeunload', protect);
  });
}
