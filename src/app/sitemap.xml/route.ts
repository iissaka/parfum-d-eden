import { siteUrl } from '@/lib/config';
import { buildSitemap } from '@/lib/seo/seo';
import { getStore } from '@/lib/store';

// Le catalogue peut changer depuis l'administration : génération à chaque requête.
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const store = getStore();
  const [products, collections] = await Promise.all([store.listProducts(), store.listCollections()]);
  return new Response(buildSitemap(siteUrl(), products, collections), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
