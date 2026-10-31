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
          green: '#48A987',
          greenDark: '#2E7A60',
          greenLight: '#E8F5F0',
          charcoal: '#2D3234',
          dark: '#1D2523',
          darkSoft: '#26312E',
          cream: '#F7FAF8',
          border: '#D8E5DF',
        },
      },
    },
  },
  plugins: [],
};
