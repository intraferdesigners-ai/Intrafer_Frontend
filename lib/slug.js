// Plain kebab-case slug for the SEO taxonomy's URL hierarchy
// (/[category]/[state]/[city]/) — e.g. "Uttar Pradesh" -> "uttar-pradesh".
// Extracted from app/(public)/[category]/page.jsx (Step 3) so every step in
// this chain builds/resolves slugs with the exact same logic — the backend
// (src/utils/slug.js) keeps its own copy in sync by hand, same convention
// as scripts/backfillVendorPlaceIds.js mirroring place.controller.js.
export function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
