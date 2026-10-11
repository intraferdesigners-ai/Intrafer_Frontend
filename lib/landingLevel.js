// Page types for admin-authored landing pages (Phase 4C): a category hub
// /[category]/, a state hub /[category]/[state]/ or a city page
// /[category]/[state]/[city]/. Mirrors the backend LandingPage `level`;
// documents written before it was used are city pages.
//
// Pure — exercised by scripts/testLandingSerp.mjs, testLandingChecklist.mjs,
// testLandingPlaceholders.mjs and testLandingSitemap.mjs.

export const LANDING_LEVELS = ['category', 'state', 'city'];

export const LEVEL_LABELS = { category: 'Category page', state: 'State page', city: 'City page' };

export const levelOf = (page) => (LANDING_LEVELS.includes(page?.level) ? page.level : 'city');

export const isHubLevel = (level) => level === 'category' || level === 'state';

// Public path (trailing slash) from already-slugified parts, or null when
// a part the level needs is missing.
export function landingPath(level, categorySlug, stateSlug, citySlug) {
  if (!categorySlug) return null;
  if (level === 'category') return `/${categorySlug}/`;
  if (!stateSlug) return null;
  if (level === 'state') return `/${categorySlug}/${stateSlug}/`;
  if (!citySlug) return null;
  return `/${categorySlug}/${stateSlug}/${citySlug}/`;
}

// The automatic page's title/H1 for each level — what the live routes
// render when no meta title / heading is set.
export function defaultLandingTitle(level, { categoryName, state, city }) {
  if (level === 'category') return `${categoryName} in India`;
  if (level === 'state') return `${categoryName} in ${state}`;
  return `${categoryName} in ${city}, ${state}`;
}

// Placeholder values for a page of `level`: a hub has no {{city}} (and a
// category page no {{state}}) — they resolve to ''.
export function placeholderValues(level, { categoryName, state, city, vendorCount }) {
  return {
    category: categoryName,
    state: level === 'category' ? '' : state,
    city: level === 'city' ? city : '',
    vendorCount,
  };
}

// Tokens that are valid in general but always empty on this level.
export const EMPTY_TOKENS = { category: ['city', 'state'], state: ['city'], city: [] };
