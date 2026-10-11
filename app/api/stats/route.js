import { cachedJson } from '@/lib/cachedFetch';
import { LIST_WINDOW, TAGS } from '@/lib/cacheTags';

// The Footer's trust stats, served from this site's cache (5 min, purged on
// 'stats') instead of a browser -> backend call on every page view. Same
// JSON body as GET /public/stats.
export const revalidate = 300;

export async function GET() {
  const json = await cachedJson(`${process.env.NEXT_PUBLIC_API_URL}/public/stats`, {
    revalidate: LIST_WINDOW, tags: [TAGS.STATS], fallback: { success: false, data: null },
  });
  return Response.json(json);
}
