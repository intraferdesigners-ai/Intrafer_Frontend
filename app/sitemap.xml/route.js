import { buildSitemapIndex } from '@/lib/sitemap';
import { SITE_URL } from '@/lib/siteUrl';

// /sitemap.xml: a <sitemapindex> over the child sitemaps
// (/sitemaps/<group>-<n>.xml, app/sitemaps/[file]/route.js). Groups, limits
// and splitting: lib/sitemap.js. robots.txt points here.
//
// Cached (ISR) for 5 minutes, like the single sitemap it replaces; the
// fetches carry the vendors/projects/landing/taxonomy tags, so the backend's
// purges refresh it. A group whose data can't be fetched is still listed
// (its first child), so the index never drops a group.
export const revalidate = 300; // = SITEMAP_REVALIDATE (Next needs a literal here)

export async function GET() {
  const { xml } = await buildSitemapIndex({ api: process.env.NEXT_PUBLIC_API_URL, baseUrl: SITE_URL });
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
