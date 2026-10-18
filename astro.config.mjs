// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://pizzeria-ledi.de',
  // Listen on the local network so the site can be opened on a phone in the same Wi-Fi.
  server: { host: true },
  vite: {
    plugins: [tailwindcss()],
  },
});
