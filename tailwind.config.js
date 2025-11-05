/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      // CORREÇÃO: Os valores agora estão aqui
      colors: {
        background: '#1a1a1a',
        card: '#2a2a2a',
        border: '#444444',

        text: {
          DEFAULT: '#e0e0e0',
          secondary: '#b0b0b0',
        },

        primary: {
          DEFAULT: '#3b82f6', // Azul (cor-marca-primaria)
          light: '#60a5fa', // Azul claro (cor-marca-secundaria)
        },

        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
      },
    },
  },
  plugins: [],
};