const API = process.env.NEXT_PUBLIC_API_URL;
const baseUrl = 'https://intrafer.in';

// Regenerate at most once an hour: a newly-listed vendor shows up in the
// sitemap within an hour without a full redeploy, and a crawler hitting
// /sitemap.xml repeatedly doesn't hammer the backend on every request.
// Before this step, sitemap.js had no fetch calls and Next prerendered it
// once at build time as a fully static route (the ○ marker in `next
// build`'s route table). Adding a live vendor fetch would otherwise make
// Next treat this as a fully dynamic per-request route — nothing else in
// next.config.js or this route changes that default — so this export is
// what opts back into cached, periodically-refreshed output instead of
// either extreme (rebuild-only, or hitting the backend on every crawl).
export const revalidate = 3600;

// Existing static pages — URLs/priorities unchanged from before this step.
const STATIC_PAGES = [
  { url: baseUrl, priority: 1.0 },
  { url: `${baseUrl}/vendors`, priority: 0.9 },
  { url: `${baseUrl}/gallery`, priority: 0.8 },
  { url: `${baseUrl}/cost-calculator`, priority: 0.8 },
  { url: `${baseUrl}/wardrobe-calculator`, priority: 0.7 },
  { url: `${baseUrl}/blog`, priority: 0.7 },
  { url: `${baseUrl}/guides`, priority: 0.7 },
  { url: `${baseUrl}/design-styles`, priority: 0.7 },
  { url: `${baseUrl}/plans`, priority: 0.8 },
  { url: `${baseUrl}/for-designers`, priority: 0.8 },
  { url: `${baseUrl}/how-it-works`, priority: 0.6 },
  { url: `${baseUrl}/about`, priority: 0.6 },
  { url: `${baseUrl}/contact`, priority: 0.6 },
  { url: `${baseUrl}/faq`, priority: 0.6 },
  { url: `${baseUrl}/testimonials`, priority: 0.6 },
  { url: `${baseUrl}/privacy`, priority: 0.3 },
  { url: `${baseUrl}/terms`, priority: 0.3 },
];

// Pages Steps 3-5 built (/[category]/, /[category]/[state]/,
// /[category]/[state]/[city]/) are deliberately excluded here — they're
// still noindex, and listing a noindexed URL in the sitemap is
// contradictory signaling to search engines. A later go-live step adds
// them back in once indexation is actually turned on.
//
// Project/portfolio pages (/projects/[projectId]/) are also excluded: the
// only public listing endpoint, GET /api/public/gallery, hardcodes
// .limit(50) with no pagination, so there's no way to enumerate every
// approved project the way GET /api/public/vendors lets us enumerate every
// vendor. Sitemapping just the top 50 (by completedYear) would silently
// drop the rest while implying completeness. Fixing that needs a paginated
// listing endpoint on the backend, which is out of scope here (public
// vendors/projects controllers were already touched in Steps 5-6, off
// limits this step) — a known gap to revisit.

// GET /api/public/vendors already filters to isApproved+isListingEnabled
// server-side and supports real pagination (page/limit/total/totalPages,
// capped at 50/page by utils/paginate.js) — loops through every page
// rather than assuming one page covers everyone, so this keeps working
// once vendor count grows past 50.
async function fetchAllVendors() {
  const vendors = [];
  let page = 1;
  const limit = 50;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await fetch(`${API}/public/vendors?page=${page}&limit=${limit}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`GET /public/vendors failed: ${res.status}`);
    const json = await res.json();
    const pageVendors = json.data?.vendors || [];
    vendors.push(...pageVendors);

    const totalPages = json.data?.totalPages || 1;
    if (page >= totalPages || pageVendors.length === 0) break;
    page += 1;
  }

  return vendors;
}

export default async function sitemap() {
  const now = new Date().toISOString();
  const staticEntries = STATIC_PAGES.map((p) => ({ ...p, lastModified: now }));

  let vendorEntries = [];
  try {
    const vendors = await fetchAllVendors();
    vendorEntries = vendors
      // Explicit re-check even though the endpoint already filters this
      // server-side — matches this file's own stated inclusion rule, and
      // guards against a future backend change silently loosening that
      // filter. _id is required for a well-formed <loc>.
      .filter((v) => v.isApproved === true && v.isListingEnabled === true && v._id)
      .map((v) => ({
        url: `${baseUrl}/vendors/${v._id}`,
        lastModified: v.updatedAt ? new Date(v.updatedAt).toISOString() : now,
        priority: 0.7,
      }));
  } catch {
    // Backend unreachable at sitemap-generation time — fall back to just
    // the static pages rather than a broken/empty sitemap or a crashing
    // route. The next revalidation window (see `revalidate` above) retries.
    vendorEntries = [];
  }

  return [...staticEntries, ...vendorEntries];
}
