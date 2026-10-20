// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://pizzeria-ledi.de',
  // Pages stay static; only /admin and /api/* run on the server (they opt out with `prerender = false`).
  adapter: vercel(),
  // Listen on the local network so the site can be opened on a phone in the same Wi-Fi.
  server: { host: true },
  env: {
    schema: {
      // Set these in Vercel → Project → Settings → Environment Variables (see .env.example).
      SUPABASE_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      SUPABASE_SERVICE_ROLE_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      ADMIN_PASSWORD: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
