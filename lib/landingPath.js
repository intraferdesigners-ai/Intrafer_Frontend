// Landing-page paths for the admin preview flow. Pure, so
// scripts/testLandingPreview.mjs can test it directly.

const SLUG = '[a-z0-9]+(?:-[a-z0-9]+)*';
const LANDING_PATH = new RegExp(`^/(${SLUG})/(?:(${SLUG})/(?:(${SLUG})/)?)?$`);

// "/interior-designers/maharashtra/pune/" -> { category, state, city, path };
// null for anything else (other shapes, encoded or doubled slashes,
// backslashes, schemes, hosts, dots, uppercase, whitespace, non-strings).
// `path` is rebuilt from the matched slugs, so it is always a same-origin
// absolute path — safe as a redirect target.
export function parseLandingPath(value) {
  if (typeof value !== 'string' || value.length > 200) return null;
  const m = LANDING_PATH.exec(value);
  if (!m) return null;
  const [, category, state = null, city = null] = m;
  if (category === 'api' || category === '_next') return null;
  const path = `/${[category, state, city].filter(Boolean).join('/')}/`;
  return { category, state, city, path };
}

// GET /public/landing-page query for that path (+ the preview token).
export function landingQuery({ category, state, city }, token) {
  const q = new URLSearchParams({ category });
  if (state) q.set('state', state);
  if (city) q.set('city', city);
  if (token) q.set('preview', token);
  return q.toString();
}
