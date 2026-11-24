// astro.config.mjs
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import preact from '@astrojs/preact';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://veyxara.com',
  output: 'server',

  redirects: {},

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ['nodemailer'],
    },
    build: {
      rollupOptions: {
        external: ['nodemailer'],
      },
    },
  },

  adapter: vercel(),
  integrations: [
    sitemap({
      async serialize(item) {
        // Imagen principal para la página de inicio
        if (item.url === 'https://veyxara.com/') {
          /** @type {any} */
          const customItem = item;
          customItem.img = [
            {
              url: 'https://veyxara.com/images/og-image.png',
              title: 'Veyxara Core - El núcleo de tu infraestructura',
              caption: 'Plataforma central de ingeniería de sistemas y automatización.',
            },
          ];
        }

        return item;
      },
    }),
    preact({
      include: ['**/preact/*'],
    }),
    react({
      include: ['**/components/RedirectAnalyzer.jsx', '**/components/react/*'],
    }),
  ],
});