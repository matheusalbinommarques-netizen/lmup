// eslint.config.js – Flat config para ESLint 9 + TypeScript + Svelte

import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';

export default [
  // 1) Arquivos ignorados
  {
    ignores: [
      '.svelte-kit/**',
      'node_modules/**',
      'dist/**',
      'build/**',
      '.vite/**',
      'coverage/**',
      'eslint.config.js',
    ],
  },

  // 2) Globals de browser + node (SvelteKit)
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // 3) Regras base de JS
  js.configs.recommended,

  // 4) Regras recomendadas de TypeScript
  ...tseslint.configs.recommended,

  // 5) Regras recomendadas de Svelte
  ...svelte.configs['flat/recommended'],

  // 6) Dizer ao plugin Svelte que o <script lang="ts"> usa o parser do TS
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        svelteFeatures: {
          experimental: {
            runes: true,
          },
        },
      },
    },
  },

  // 7) Ajuste de regras pra não te travar
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-undef': 'off',
      'svelte/no-navigation-without-resolve': 'off',
    },
  },
];
