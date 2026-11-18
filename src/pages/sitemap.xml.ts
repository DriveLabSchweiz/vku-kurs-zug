import type { APIRoute } from 'astro';

export const GET: APIRoute = ({url}) => Response.redirect(new URL('/sitemap-index.xml',url),301);
