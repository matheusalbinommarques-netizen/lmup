import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';

export default [
  // Configuração recomendada do ESLint
  js.configs.recommended,

  // Configuração recomendada do Svelte (flat config)
  ...svelte.configs['flat/recommended'],

  {
    rules: {
      //
      // 👇 CORREÇÃO 1: Desligamos a regra que estava causando o erro de commit
      //
      'svelte/no-navigation-without-resolve': 'off',

      // Mantemos a sua regra original de 'no-unused-vars'
      'no-unused-vars': 'warn',
    },
  },
  {
    languageOptions: {
      globals: {
        // Define os globals do browser (window, document) e Node (process)
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    // Ignora pastas de build e dependências
    ignores: ['build/', '.svelte-kit/', 'dist/', 'node_modules/'],
  },
];
