// Cache tags for Next's data cache, purged on demand by the backend
// (Intrafer_Backend/src/utils/cacheTags.js — names must match exactly;
// scripts/checkPurgeTags.mjs cross-checks both sides).

export const TAGS = Object.freeze({
  VENDORS: 'vendors',     // vendor lists/cards
  PROJECTS: 'projects',   // project lists
  REVIEWS: 'reviews',     // site reviews
  STATS: 'stats',         // /public/stats, style counts
  HOMEPAGE: 'homepage',   // CMS homepage content
  TAXONOMY: 'taxonomy',   // category-cities lookups
  LANDING: 'landing',     // admin landing pages (sitemap now; the pages in batch 3)
});

export const TAG_PREFIXES = Object.freeze({
  VENDOR: 'vendor:',      // one vendor's profile page
  PROJECT: 'project:',    // one project's page
});

export const vendorTag = (id) => `${TAG_PREFIXES.VENDOR}${id}`;
export const projectTag = (id) => `${TAG_PREFIXES.PROJECT}${id}`;

// Revalidate windows (seconds): the fallback when a purge never arrives.
export const LIST_WINDOW = 300;
export const DETAIL_WINDOW = 900;
