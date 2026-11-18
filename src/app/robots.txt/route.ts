import { siteUrl } from '@/lib/config';
import { buildRobots } from '@/lib/seo/seo';

export function GET(): Response {
  return new Response(buildRobots(siteUrl()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
