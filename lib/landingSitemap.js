// Admin-authored landing pages in the sitemap (Phase 2). No imports, so
// scripts/testLandingSitemap.mjs can run both functions directly with a
// mocked fetch.

// GET /public/landing-pages/sitemap -> its `pages` array, or null on any
// failure (network, non-ok, malformed body) so the caller can keep the
// sitemap it already has. `fetchImpl` is injectable for tests.
export async function fetchLandingSitemapPages(api, fetchOptions, fetchImpl = fetch) {
  try {
    const res = await fetchImpl(`${api}/public/landing-pages/sitemap`, fetchOptions);
    if (!res.ok) return null;
    const json = await res.json();
    return Array.isArray(json.data?.pages) ? json.data.pages : null;
  } catch {
    return null;
  }
}

// Merges those pages into the sitemap's existing entries:
//
// - indexable:true pages are added, unless that URL is already listed
//   (e.g. a city that meets the vendor threshold on its own).
// - indexable:false pages REMOVE a matching existing entry — the authored
//   page's forced noindex wins over the threshold-based inclusion, so the
//   sitemap never lists a URL whose page says noindex.
// - `landingPages` null (the fetch failed) returns `entries` unchanged.
export function mergeLandingPages(entries, landingPages, baseUrl, now) {
  if (!Array.isArray(landingPages)) return entries;

  const pageUrl = (p) => `${baseUrl}/${p.categorySlug}/${p.stateSlug}/${p.citySlug}/`;
  const valid = landingPages.filter((p) => p && p.categorySlug && p.stateSlug && p.citySlug);
  const noindexUrls = new Set(valid.filter((p) => !p.indexable).map(pageUrl));

  const merged = entries.filter((e) => !noindexUrls.has(e.url));
  const seen = new Set(merged.map((e) => e.url));

  for (const p of valid) {
    if (!p.indexable) continue;
    const url = pageUrl(p);
    if (seen.has(url)) continue;
    seen.add(url);
    merged.push({
      url,
      lastModified: p.updatedAt ? new Date(p.updatedAt).toISOString() : now,
      priority: 0.5,
    });
  }

  return merged;
}
