/**
 * robots.txt et sitemap.xml, générés ici puis servis par des routes classiques
 * (app/robots.txt/route.ts, app/sitemap.xml/route.ts).
 *
 * Pourquoi pas les fichiers « robots.ts » / « sitemap.ts » de Next.js : leur chargeur génère du code
 * qui casse quand le chemin du projet contient une apostrophe (dossier « Le Parfum d'Eden »),
 * ce qui faisait échouer le build de production.
 */
import type { Collection, Product } from '@/lib/domain/types';

export const PRIVATE_PATHS = ['/admin', '/api/', '/panier', '/commande', '/suivi-commande'];

const STATIC_PAGES = ['', '/boutique', '/trouver-mon-parfum', '/contact', '/faq', '/livraison', '/cgv', '/confidentialite'];

export function buildRobots(base: string): string {
  return [
    'User-agent: *',
    'Allow: /',
    ...PRIVATE_PATHS.map((p) => `Disallow: ${p}`),
    '',
    `Sitemap: ${base}/sitemap.xml`,
    '',
  ].join('\n');
}

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c] as string);
}

export function buildSitemap(base: string, products: Product[], collections: Collection[]): string {
  const entries: { loc: string; lastmod?: string }[] = [
    ...STATIC_PAGES.map((p) => ({ loc: `${base}${p}` })),
    ...collections.filter((c) => c.isActive).map((c) => ({ loc: `${base}/collections/${c.slug}` })),
    ...products.filter((p) => p.isActive).map((p) => ({ loc: `${base}/parfum/${p.slug}`, lastmod: p.createdAt })),
  ];
  const urls = entries
    .map((e) => `  <url><loc>${escapeXml(e.loc)}</loc>${e.lastmod ? `<lastmod>${escapeXml(e.lastmod)}</lastmod>` : ''}<changefreq>weekly</changefreq></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
