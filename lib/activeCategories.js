// Which service categories have a live hub page. /<category>/ answers 200
// exactly when GET /public/service-categories/:slug does (it 404s unknown
// and inactive categories — backend serviceCategory.controller.js), so the
// same request decides whether a hub may be linked. Anything other than a
// 200 (404, 5xx, network error, malformed body) leaves the category out:
// a link is only emitted when it can't be a 404. Pure apart from the
// injectable fetch, so scripts/testActiveCategories.mjs runs it mocked.
import { SERVICE_CATEGORIES } from './categories.js';
import { LIST_WINDOW, TAGS } from './cacheTags.js';

export async function isActiveCategory(api, slug, fetchImpl = fetch) {
  try {
    // A fresh options object per call (Next's fetch deletes init.next).
    const res = await fetchImpl(`${api}/public/service-categories/${encodeURIComponent(slug)}`, {
      next: { revalidate: LIST_WINDOW, tags: [TAGS.TAXONOMY] },
    });
    if (res.status !== 200) return false;
    const json = await res.json();
    return json?.data?.category?.slug === slug;
  } catch {
    return false;
  }
}

// The categories (other than `exceptSlug`) whose hub currently answers 200,
// in lib/categories.js order.
export async function activeCategories(api, { exceptSlug, fetchImpl = fetch } = {}) {
  const candidates = SERVICE_CATEGORIES.filter((c) => c.slug !== exceptSlug);
  const ok = await Promise.all(candidates.map((c) => isActiveCategory(api, c.slug, fetchImpl)));
  return candidates.filter((_, i) => ok[i]);
}
