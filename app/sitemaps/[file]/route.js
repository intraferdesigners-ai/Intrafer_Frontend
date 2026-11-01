import { buildSitemapChild } from '@/lib/sitemap';
import { IS_BUILD } from '@/lib/cachedFetch';
import { SITE_URL } from '@/lib/siteUrl';

// /sitemaps/<group>-<n>.xml: one child <urlset> of /sitemap.xml
// (lib/sitemap.js). Cached (ISR) per file for 5 minutes and purged with the
// group's tags. Unknown names and chunk numbers past the end are 404s. When
// the group's data can't be fetched the handler throws: a regeneration then
// keeps serving the last good copy, a first render answers 500 — never an
// empty or partial list cached in its place.
export const revalidate = 300; // = SITEMAP_REVALIDATE (Next needs a literal here)

// Nothing built ahead; each file is rendered on its first request.
export function generateStaticParams() {
  return [];
}

export async function GET(request, { params }) {
  if (IS_BUILD) return new Response('Not found', { status: 404 });
  const xml = await buildSitemapChild(params.file, { api: process.env.NEXT_PUBLIC_API_URL, baseUrl: SITE_URL });
  if (xml === null) return new Response('Not found', { status: 404 });
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
