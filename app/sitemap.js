import { slugify } from '@/lib/slug';

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

// Step 9: category (/[category]/) and state (/[category]/[state]/) hub
// pages became indexable per the client's sign-off on SEO spec section 11
// ("Category and state hub pages stay indexable always"), reversing Steps
// 3-4's blanket dark-build noindex for just these two levels — so they're
// added to the sitemap below, per spec section 12 ("Only indexable URLs
// listed"). City pages (/[category]/[state]/[city]/, Step 5) are
// untouched and still noindex — deliberately excluded here, same as
// before. A future step adds them once per-city threshold-based
// indexation (meetsIndexThreshold, scaffolded in Step 5) is wired up.
//
// The 12 category slugs are hardcoded rather than fetched from a "list all
// categories" endpoint — no such public endpoint exists, and adding one
// would mean touching serviceCategory.controller.js/public.routes.js,
// both Step 1/3 files this step is scoped to leave alone. Matches Step
// 1's seed script (scripts/seedCategoryTaxonomy.js on the backend) — if
// that list ever changes, this one needs updating by hand. Each slug is
// still verified live against the real GET /public/service-categories/:slug
// endpoint (which already 404s for inactive/missing categories) before
// being included, so an inactive category is correctly skipped without
// needing a dedicated "isActive" listing endpoint.
const CATEGORY_SLUGS = [
  'interior-designers', 'architects', 'home-decorators', 'home-renovation',
  'modular-kitchen', 'furniture', 'lighting', 'false-ceiling', 'wallpaper',
  'painting', 'home-automation', 'landscaping',
];

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

// For each real, active category: one entry for the category hub itself,
// plus one per state it has vendor presence in (GET /public/states?category=
// — the same endpoint Step 3's category page already uses). A 404 on the
// category lookup means inactive/nonexistent — skipped, not a failure. Any
// other non-ok status or a thrown network error propagates up so the
// caller's try/catch falls back to omitting category/state entries
// entirely, same safety pattern as fetchAllVendors above.
async function fetchCategoryStateEntries() {
  const entries = [];

  for (const slug of CATEGORY_SLUGS) {
    const catRes = await fetch(`${API}/public/service-categories/${slug}`, { next: { revalidate } });
    if (catRes.status === 404) continue;
    if (!catRes.ok) throw new Error(`GET /public/service-categories/${slug} failed: ${catRes.status}`);
    entries.push({ url: `${baseUrl}/${slug}`, priority: 0.8 });

    const statesRes = await fetch(`${API}/public/states?category=${slug}`, { next: { revalidate } });
    if (statesRes.status === 404) continue;
    if (!statesRes.ok) throw new Error(`GET /public/states?category=${slug} failed: ${statesRes.status}`);
    const statesJson = await statesRes.json();
    const states = statesJson.data?.states || [];
    for (const s of states) {
      if (!s.state) continue; // guards against a malformed <loc>, same rule Step 7 applied to vendors
      entries.push({ url: `${baseUrl}/${slug}/${slugify(s.state)}`, priority: 0.6 });
    }
  }

  return entries;
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

  let categoryStateEntries = [];
  try {
    categoryStateEntries = (await fetchCategoryStateEntries()).map((e) => ({ ...e, lastModified: now }));
  } catch {
    // Same fallback idea as the vendor fetch above — omit category/state
    // entries rather than break the whole sitemap; static + vendor entries
    // still render.
    categoryStateEntries = [];
  }

  return [...staticEntries, ...vendorEntries, ...categoryStateEntries];
}
