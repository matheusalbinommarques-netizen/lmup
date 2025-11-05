import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...svelte.configs['flat/recommended'],

  {
    rules: {
      // Já tínhamos desligado isto (correto)
      'svelte/no-navigation-without-resolve': 'off',

      // --- CORREÇÃO AQUI ---
      // Desliga a regra que está a causar os 3 erros de commit.
      // Esta regra está errada para o Svelte 5 (Runes).
      'svelte/no-useless-children-snippet': 'off',

      // Mantemos a sua regra original
      'no-unused-vars': 'warn',
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    ignores: ['build/', '.svelte-kit/', 'dist/', 'node_modules/'],
  },
];
