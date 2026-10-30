/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        sukitex: {
          gold: '#EBA552',
          goldDark: '#D48A35',
          goldLight: '#FDF6EC',
          dark: '#1F261E',
          darkSoft: '#2A3329',
          cream: '#F8F5F1',
          border: '#E5E0D8',
        },
      },
    },
  },
  plugins: [],
};
