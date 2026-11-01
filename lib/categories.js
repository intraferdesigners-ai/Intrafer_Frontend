// The 12 service categories from Step 1's seed (backend's
// scripts/seedCategoryTaxonomy.js) — duplicated here rather than fetched
// from a "list all categories" endpoint (none exists) so city pages can
// build cross-category links (Step 10) without an extra round-trip per
// category just to get its display name. lib/sitemap.js and the category
// hubs' "Other services" links read this same list — if the taxonomy ever
// changes, update it here and in the backend seed script.
export const SERVICE_CATEGORIES = [
  { slug: 'interior-designers', name: 'Interior Designers' },
  { slug: 'architects', name: 'Architects' },
  { slug: 'home-decorators', name: 'Home Decorators' },
  { slug: 'home-renovation', name: 'Home Renovation' },
  { slug: 'modular-kitchen', name: 'Modular Kitchen' },
  { slug: 'furniture', name: 'Furniture' },
  { slug: 'lighting', name: 'Lighting' },
  { slug: 'false-ceiling', name: 'False Ceiling' },
  { slug: 'wallpaper', name: 'Wallpaper' },
  { slug: 'painting', name: 'Painting' },
  { slug: 'home-automation', name: 'Home Automation' },
  { slug: 'landscaping', name: 'Landscaping' },
];
