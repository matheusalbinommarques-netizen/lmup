import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
export default defineConfig({
  plugins: [sveltekit()],
  // Generated release assets must not enter the development file watcher.
  server: { watch: { ignored: ['**/build/**'] } },
});
