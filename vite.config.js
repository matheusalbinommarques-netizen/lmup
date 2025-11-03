import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(), // <-- DE VOLTA AO SIMPLES. Ele vai ler o svelte.config.js
    VitePWA({
      // Configuração básica do seu plano
      registerType: 'autoUpdate',

      // CORRIGIDO: Incluindo os arquivos que realmente existem na pasta 'public'
      includeAssets: [
        'favicon-shield.ico',
        'apple-touch-icon-180-transparent.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'pwa-512x512-maskable.png',
      ],

      // Configuração do Manifesto
      manifest: {
        name: 'Level Me Up LMU',
        short_name: 'LMU',
        description: 'Um PWA para gamificar o aprendizado e o desenvolvimento.',
        theme_color: '#ffffff',
        display: 'standalone', // Faz o app abrir como uma janela separada

        // CORRIGIDO: Usando os nomes exatos dos arquivos da pasta 'public'
        icons: [
          {
            src: 'apple-touch-icon-180-transparent.png',
            sizes: '180x180',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        // REMOVIDO: A seção 'screenshots' foi removida porque os
        // arquivos 'screenshot-desktop.png' e 'screenshot-mobile.png'
        // não existem na pasta 'public', o que causaria falha no PWA.
      },
    }),
  ],
});
