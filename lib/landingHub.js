// Server-side fetch of an admin-authored landing page for the
// /[category]/, /[category]/[state]/ and /[category]/[state]/[city]/ routes.
// GET /public/landing-page answers { page, vendors, vendorCount, indexable
// [, level][, preview] }; `page` is null for no record or a draft.
//
// - Public render (no token): Next's data cache, 5 min, tags landing +
//   vendors (the response carries the vendor list, count and indexable),
//   purged by the backend on landing-page and vendor writes. 404 -> null;
//   any other failure throws, so ISR keeps serving the last good page.
// - Admin preview (`token`, only ever set in draft mode — see
//   lib/landingDraft.js): uncached and never stored. The backend answers
//   `preview: true` (and the draft) only for a valid token for this exact
//   page; a failure returns null, i.e. the automatic page, as before.

import { cachedJson } from './cachedFetch.js';
import { LIST_WINDOW, TAGS } from './cacheTags.js';
import { landingQuery } from './landingPath.js';

const API = process.env.NEXT_PUBLIC_API_URL;

export async function fetchLandingData({ category, state = null, city = null }, token = null) {
  const url = `${API}/public/landing-page?${landingQuery({ category, state, city }, token)}`;
  if (!token) {
    const json = await cachedJson(url, { revalidate: LIST_WINDOW, tags: [TAGS.LANDING, TAGS.VENDORS], nullOn404: true });
    return json?.data ?? null;
  }
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()).data ?? null;
  } catch {
    return null;
  }
}
