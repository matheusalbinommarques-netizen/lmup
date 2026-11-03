import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const root = fileURLToPath(new URL('.', import.meta.url));
function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}
export default defineConfig({
  root,
  plugins: [
    svelte({ configFile: false, compilerOptions: { runes: true } }),
    {
      name: 'garden-offline',
      closeBundle() {
        const out = join(root, 'dist');
        const urls = walk(out)
          .filter((p) => !p.endsWith('sw.js'))
          .map((p) => './' + p.slice(out.length + 1).replaceAll('\\', '/'));
        writeFileSync(
          join(out, 'sw.js'),
          `const CACHE='lmup-garden-proof-v1';
const ASSETS=${JSON.stringify(['./', ...urls])};
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim());});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request)));});
`,
        );
      },
    },
  ],
  resolve: {
    alias: {
      $lib: fileURLToPath(new URL('../../src/lib', import.meta.url)),
      $services: fileURLToPath(new URL('../../src/services', import.meta.url)),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5193,
    strictPort: true,
    fs: { allow: [fileURLToPath(new URL('../..', import.meta.url))] },
  },
  build: { outDir: 'dist', emptyOutDir: true },
});
