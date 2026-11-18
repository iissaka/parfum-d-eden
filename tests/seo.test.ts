import { describe, expect, it } from 'vitest';
import { buildRobots, buildSitemap, PRIVATE_PATHS } from '@/lib/seo/seo';
import { createSeed } from '@/lib/store/seed';

describe('robots.txt et sitemap.xml', () => {
  it('interdit les pages privées et pointe vers le sitemap', () => {
    const robots = buildRobots('https://exemple.fr');
    for (const p of PRIVATE_PATHS) expect(robots).toContain(`Disallow: ${p}`);
    expect(robots).toContain('Sitemap: https://exemple.fr/sitemap.xml');
  });

  it('liste les produits et collections actifs, en XML valide', () => {
    const seed = createSeed();
    const xml = buildSitemap('https://exemple.fr', seed.products, seed.collections);
    expect(xml.startsWith('<?xml')).toBe(true);
    expect(xml).toContain('<loc>https://exemple.fr/parfum/nuage-sucre</loc>');
    expect(xml).toContain('<loc>https://exemple.fr/collections/musc-tahara</loc>');
    expect((xml.match(/<url>/g) ?? []).length).toBe(8 + seed.collections.length + seed.products.length);
  });

  it('échappe les caractères spéciaux', () => {
    const xml = buildSitemap("https://exemple.fr/?a=1&b='2'", [], []);
    expect(xml).toContain('&amp;');
    expect(xml).toContain('&apos;');
  });
});
