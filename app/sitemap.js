const API = process.env.NEXT_PUBLIC_API_URL;
const baseUrl = 'https://intrafer.in';

// Regenerate at most every 5 minutes — a newly-listed vendor shows up in
// the sitemap quickly without a full redeploy, and a crawler hitting
// /sitemap.xml repeatedly doesn't hammer the backend on every request.
// Originally 3600s (1 hour); lowered after a production incident where a
// transient backend-fetch failure got served as the static-only fallback
// (see fetchAllVendors' try/catch below) — at 3600s, a single bad render
// could plausibly get cached and served to every visitor for up to an
// hour before self-healing. 300s caps that worst case much tighter while
// still meaningfully reducing backend load vs. every request. Revisit
// once the retry logic below has some track record of not needing it.
export const revalidate = 300;

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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Fetches one page, retrying once on failure (network blip, backend
// cold-start) before giving up — a single transient failure shouldn't be
// enough to fall back to the static-only sitemap and have that fallback
// cached for the full revalidate window.
async function fetchVendorPage(page, limit) {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      // IMPORTANT: no `cache: 'no-store'` here. That was the actual bug
      // behind a production incident where this route never cached at all
      // (verified via x-vercel-cache: MISS on every single request) —
      // Next.js treats any no-store fetch inside a route as disqualifying
      // that whole route from the `export const revalidate` above, so the
      // route was re-fetching from the backend on every crawl hit instead
      // of the intended "cache for a few minutes" behavior. `next:
      // { revalidate }` (reusing the same constant, so the two can't
      // drift) is what actually lets this fetch participate in the
      // route's ISR window.
      const res = await fetch(`${API}/public/vendors?page=${page}&limit=${limit}`, {
        next: { revalidate },
      });
      if (!res.ok) throw new Error(`GET /public/vendors failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === 2) throw err;
      await sleep(300);
    }
  }
}

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
    const json = await fetchVendorPage(page, limit);
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
