import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite'; // <--- IMPORTADO AQUI
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    sveltekit(), // <--- SUBSTITUÍDO AQUI
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        // ... (o resto da sua config PWA permanece igual) ...
        'favicon-shield.ico',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'pwa-512x512-maskable.png',
      ],
      manifest: {
        // ... (seu manifesto permanece igual) ...
        name: 'Level Me Up LMU',
        short_name: 'LMU',
        description: 'Um PWA para gamificar o aprendizado e o desenvolvimento.',
        theme_color: '#ffffff',
        display: 'standalone',
        'mobile-web-app-capable': 'yes',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
});
