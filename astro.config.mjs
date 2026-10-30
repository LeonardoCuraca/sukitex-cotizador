import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

const isBuild = process.env.npm_lifecycle_event === 'build';

export default defineConfig({
  site: 'https://leonardocuraca.github.io',
  base: isBuild ? '/sukitex-cotizador' : '/',
  outDir: './docs',
  build: {
    assets: 'assets',
  },
  integrations: [tailwind(), react()],
});
