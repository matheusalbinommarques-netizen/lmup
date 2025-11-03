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
      // 👇 A MÁGICA ESTÁ AQUI 👇
      //
      // Mude 'no-unused-vars' de 'error' (padrão) para 'warn'.
      // Isso impede que o ESLint falhe no commit, mas ainda nos avisa
      // sobre variáveis não usadas.
      'no-unused-vars': 'warn',

      // Você pode adicionar ou sobrescrever outras regras aqui
      // Ex: "semi": ["error", "always"]
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
