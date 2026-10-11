import { cachedJson } from '../../../../lib/cachedFetch';
import { DETAIL_WINDOW, TAGS, vendorTag } from '../../../../lib/cacheTags';

const API = process.env.NEXT_PUBLIC_API_URL;
const OBJECT_ID = /^[a-f0-9]{24}$/i;

// The public vendor, or null when it isn't public: malformed id (never sent
// — the backend would 500 on the cast) or a 404 from the API (missing,
// unapproved/suspended or listing disabled). Any other failure throws, so a
// backend blip is a 5xx (and never a cached 404). Shared by layout.jsx,
// generateMetadata and the page; Next dedupes the identical fetch.
export async function fetchVendor(id) {
  if (!OBJECT_ID.test(id)) return null;
  const json = await cachedJson(`${API}/public/vendors/${id}`, {
    revalidate: DETAIL_WINDOW, tags: [vendorTag(id), TAGS.VENDORS], nullOn404: true,
  });
  return json?.data?.vendor ?? null;
}

// The page's secondary lists, cached the same way. They render in parallel
// with layout.jsx, so a missing vendor (404, malformed id) gives [] here and
// the layout's 404 wins; other failures throw.
export async function fetchVendorList(id, path, key, tag) {
  if (!OBJECT_ID.test(id)) return [];
  const json = await cachedJson(`${API}${path}`, { revalidate: DETAIL_WINDOW, tags: [vendorTag(id), tag], nullOn404: true });
  return json?.data?.[key] || [];
}
