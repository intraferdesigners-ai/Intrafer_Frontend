// Google-result ("SERP snippet") preview for the landing page editor, and
// the page-title rule it shares with the live routes' generateMetadata —
// one function, so the preview can't drift from what the page actually
// serves. Level-aware (Phase 4C): category/state hubs have their own
// default titles.
//
// Pure — exercised directly by scripts/testLandingSerp.mjs.

import { resolvePlaceholders } from './landingPlaceholders.js';
import { defaultLandingTitle, placeholderValues } from './landingLevel.js';

export const SITE_SUFFIX = 'Intrafer';

// Google truncates by pixel width (~600px desktop), not characters; these
// character counts are the usual approximation of where that lands.
export const SERP_LIMITS = {
  desktop: { title: 60, description: 160 },
  mobile: { title: 55, description: 120 },
};

// The <title> text BEFORE the root layout's " | Intrafer" template: the
// resolved meta title with any typed-in "| Intrafer" stripped (so it never
// doubles), else the level's automatic title — "{Category} in {City},
// {State}" (city, the default), "{Category} in {State}" or "{Category} in
// India". Used by the live pages' generateMetadata.
export function landingPageTitle({ metaTitle, categoryName, city, state, level = 'city' }) {
  const typed = (metaTitle || '').replace(/\s*[|\-–]\s*Intrafer\s*$/i, '');
  return typed || defaultLandingTitle(level, { categoryName, city, state });
}

// Cuts `text` to at most `max` characters including a trailing "…",
// breaking at the last word boundary that fits (hard cut if one word is
// longer than that). Text within `max` is returned unchanged.
export function truncate(text, max) {
  if (text.length <= max) return text;
  const room = text.slice(0, max - 1);
  const space = room.lastIndexOf(' ');
  const cut = space > 0 ? room.slice(0, space) : room;
  return `${cut.replace(/[\s,;:.\-–|]+$/, '')}…`;
}

// "/interior-designers/delhi/gaziabad/" -> "intrafer.in › interior-designers › delhi › gaziabad"
export function serpDisplayUrl(path) {
  const parts = (path || '').split('?')[0].split('/').filter(Boolean);
  return ['intrafer.in', ...parts].join(' › ');
}

// Raw (unresolved) form values in; what Google would show out.
// `description` is '' when no meta description is set — Google then
// picks text from the page itself, which can't be predicted here.
export function buildSerpPreview({
  metaTitle, metaDescription, categoryName, state, city, vendorCount, level = 'city',
  siteSuffix = SITE_SUFFIX, path, device = 'desktop',
}) {
  const limits = SERP_LIMITS[device] || SERP_LIMITS.desktop;
  const values = placeholderValues(level, { categoryName, state, city, vendorCount: vendorCount ?? 0 });
  const resolve = (text) => resolvePlaceholders(text, values).replace(/\s+/g, ' ').trim();

  const fullTitle = `${landingPageTitle({ metaTitle: resolve(metaTitle), categoryName, city, state, level })} | ${siteSuffix}`;
  const fullDescription = resolve(metaDescription);
  return {
    title: truncate(fullTitle, limits.title),
    description: truncate(fullDescription, limits.description),
    displayUrl: serpDisplayUrl(path),
    fullTitle,
    fullDescription,
  };
}
