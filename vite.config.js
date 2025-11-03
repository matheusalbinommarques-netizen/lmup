import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      // Configuração básica do seu plano
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],

      // Configuração do Manifesto
      manifest: {
        name: 'Level Me Up LMU',
        short_name: 'LMU',
        description: 'Um PWA para gamificar o aprendizado e o desenvolvimento.',
        theme_color: '#ffffff',
        display: 'standalone', // Faz o app abrir como uma janela separada

        // Ícones: Usando os nomes dos arquivos que você criou
        icons: [
          {
            // Usando o apple-touch-icon como nosso ícone de 192x192
            src: 'apple-touch-icon.png',
            sizes: '180x180', // Tamanho padrão do apple-touch-icon
            type: 'image/png',
          },
          {
            // Ícone grande (padrão)
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            // Ícone mascarável (para ícones adaptativos do Android)
            src: 'pwa-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],

        // Screenshots: Usando os nomes que você criou
        screenshots: [
          {
            src: 'screenshot-desktop.png',
            sizes: '1280x720', // Ajuste se o tamanho for diferente
            type: 'image/png',
            form_factor: 'wide',
          },
          {
            src: 'screenshot-mobile.png',
            sizes: '720x1280', // Ajuste se o tamanho for diferente
            type: 'image/png',
            form_factor: 'narrow',
          },
        ],
      },
    }),
  ],
});
