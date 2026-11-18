// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import { translations } from './src/lib/translations.mjs';

// https://astro.build/config
export default defineConfig({
  compressHTML: true,
  site: 'https://vku-kurs-zug.ch',
  output: 'server',
  session: false,
  vite: {
    plugins: [tailwindcss()]
  },
  adapter: cloudflare({
    imageService: 'compile'
  }),
  integrations: [sitemap({
    filter: url => !/\/(404|api)(\/|$)/.test(new URL(url).pathname),
    serialize(item) {
      const origin = 'https://vku-kurs-zug.ch';
      const path = new URL(item.url).pathname.replace(/\/$/,'') || '/';
      const page = path === '/en' ? '/en/' : path;
      item.url = origin + page;
      const pair = Object.entries(translations).find(([de,en]) => page === de || page === en);
      if (pair) item.links = [{lang:'de-CH',url:origin+pair[0]},{lang:'en-CH',url:origin+pair[1]}];
      return item;
    }
  })]
});
