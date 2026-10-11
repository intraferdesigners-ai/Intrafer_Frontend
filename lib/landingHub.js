// Server-side fetch of an admin-authored hub page (Phase 4C) for the
// /[category]/ and /[category]/[state]/ routes. GET /public/landing-page
// with category (+ state) answers { page, vendors, vendorCount, indexable,
// level }; `page` is null for no record or a draft. Any failure also
// returns null, i.e. the route renders its automatic page as before.
//
// `preview`: the ?preview= token, passed through as-is — the backend only
// answers `preview: true` (and the draft) for a valid token for this exact
// page.

const API = process.env.NEXT_PUBLIC_API_URL;

export async function fetchHubLandingPage({ category, state }, preview) {
  const params = new URLSearchParams({ category });
  if (state) params.set('state', state);
  if (preview) params.set('preview', preview);
  try {
    const res = await fetch(`${API}/public/landing-page?${params}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

// ?preview=<token> (a single string), else null. Read only for the
// landing fetch — never put into links, canonical URLs or the sitemap.
export const previewToken = (searchParams) => (
  typeof searchParams?.preview === 'string' && searchParams.preview ? searchParams.preview : null
);
