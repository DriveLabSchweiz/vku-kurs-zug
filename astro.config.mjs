// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://vku-kurs-zug.ch',
  output: 'server',
  vite: {
    plugins: [tailwindcss()]
  },
  adapter: cloudflare({
    sessionKVBinding: false
  }),
  integrations: [sitemap({
    i18n: {
      defaultLocale: 'de',
      locales: {
        de: 'de-CH',
        en: 'en-CH'
      }
    }
  })]
});
