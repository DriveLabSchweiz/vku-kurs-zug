import astro from '@astrojs/cloudflare/entrypoints/server';

export default {
  fetch(...args: Parameters<typeof astro.fetch>) {
    const url = new URL(args[0].url);
    const canonical = new URL(url);
    if (['vku-kurs-zug.ch','www.vku-kurs-zug.ch'].includes(url.hostname)) {
      canonical.protocol = 'https:';
      canonical.hostname = 'vku-kurs-zug.ch';
    }
    if (canonical.pathname === '/en') canonical.pathname = '/en/';
    else if (canonical.pathname !== '/en/') canonical.pathname = canonical.pathname.replace(/\/+$/, '') || '/';
    if (canonical.href !== url.href) return Response.redirect(canonical.href,301);
    return astro.fetch(...args);
  }
};
