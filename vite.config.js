import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',

      //
      // CORREÇÃO: Removemos o 'apple-touch-icon' daqui
      // para o plugin parar de tentar processá-lo.
      //
      includeAssets: [
        'favicon-shield.ico',
        // 'apple-touch-icon-180-transparent.png', <-- REMOVIDO
        'pwa-192x192.png',
        'pwa-512x512.png',
        'pwa-512x512-maskable.png',
      ],

      // O Manifesto PWA (Este está correto e limpo)
      manifest: {
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
