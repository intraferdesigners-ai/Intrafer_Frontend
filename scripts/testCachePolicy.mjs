// Run: node scripts/testCachePolicy.mjs
// Static guard on caching. Exactly the routes in CACHED may carry a cache
// setting; routes that depend on the signed-in user, a token, a form flow,
// per-request query params or ?preview= must never get one (directly or by
// importing the cached-fetch helpers); the vendor profile's 404 structure
// stays intact.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DETAIL_WINDOW, LIST_WINDOW } from '../lib/cacheTags.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`ok - ${name}`); };
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');
const posix = (p) => p.split(sep).join('/');

function sourceFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return sourceFiles(p);
    return /\.(m?js|jsx|ts|tsx)$/.test(name) ? [p] : [];
  });
}

// Every fetch( ... ) call in a source, balanced parens.
function fetchCalls(src) {
  const calls = [];
  for (let i = src.indexOf('fetch('); i !== -1; i = src.indexOf('fetch(', i + 1)) {
    let depth = 0;
    let j = i + 'fetch'.length;
    for (; j < src.length; j += 1) {
      if (src[j] === '(') depth += 1;
      else if (src[j] === ')' && (depth -= 1) === 0) break;
    }
    calls.push(src.slice(i + 'fetch('.length, j));
  }
  return calls;
}

const CACHING = /export\s+const\s+(revalidate|fetchCache)\b|dynamic\s*=\s*['"]force-static['"]|force-cache|unstable_cache|\bnext:\s*\{|revalidate\s*:/;
const USES_CACHED_HELPERS = /lib\/cachedFetch|from '\.\/vendorData'|vendorData'/;

// The only files under app/ allowed to carry a cache setting.
const CACHED = {
  // batch 1
  'app/(public)/design-styles/page.jsx': 300,
  'app/(public)/design-styles/[style]/page.jsx': 300,
  'app/(public)/cities/[city]/page.jsx': 300,
  'app/(public)/about/page.jsx': 300,
  'app/(public)/testimonials/page.jsx': 300,
  // batch 2
  'app/page.jsx': 300,
  'app/(public)/gallery/page.jsx': 300,
  'app/(public)/recent-projects/page.jsx': 300,
  'app/(public)/projects/[projectId]/page.jsx': 900,
  'app/(public)/vendors/[vendorId]/page.jsx': 900,
  'app/(public)/vendors/[vendorId]/vendorData.js': null, // the vendor page's cached fetches
  'app/api/stats/route.js': 300,
  // batch 3: landing pages (admin preview = draft mode, never cached)
  'app/(public)/[category]/page.jsx': 300,
  'app/(public)/[category]/[state]/page.jsx': 300,
  'app/(public)/[category]/[state]/[city]/page.jsx': 300,
  // pre-existing
  'app/sitemap.js': 300,
};

const MUST_STAY_UNCACHED = [
  'app/admin', 'app/vendor/dashboard', 'app/auth',
  'app/(public)/enquiry', 'app/(public)/review', 'app/(public)/contact', 'app/(public)/compare',
  'app/(public)/vendors/(list)', 'app/api/revalidate', 'app/api/landing-preview',
];

test('only the allow-listed files under app/ carry any cache setting', () => {
  const offenders = sourceFiles(join(ROOT, 'app'))
    .map((f) => posix(relative(ROOT, f)))
    .filter((f) => CACHING.test(read(f)) && !(f in CACHED));
  assert.deepEqual(offenders, []);
  for (const f of Object.keys(CACHED)) assert.ok(existsSync(join(ROOT, f)), `${f} missing — update CACHED`);
});

test('must-stay-uncached routes (admin, vendor dashboard, auth, enquiry, review token, contact, compare, vendors list, /api/revalidate, /api/landing-preview) have no cache settings and don\'t use the cached helpers', () => {
  const files = MUST_STAY_UNCACHED.flatMap((d) => {
    assert.ok(existsSync(join(ROOT, d)), `${d} missing — update this list`);
    return statSync(join(ROOT, d)).isDirectory() ? sourceFiles(join(ROOT, d)) : [join(ROOT, d)];
  });
  assert.ok(files.length > 25);
  const hits = files.filter((f) => {
    const src = readFileSync(f, 'utf8');
    return CACHING.test(src) || USES_CACHED_HELPERS.test(src);
  }).map((f) => posix(relative(ROOT, f)));
  assert.deepEqual(hits, []);
});

test('/api/revalidate is POST-only and force-dynamic', () => {
  const src = read('app/api/revalidate/route.js');
  assert.match(src, /export const dynamic = 'force-dynamic';/);
  assert.doesNotMatch(src, /export (const|async function|function) GET\b/);
});

const LANDING_PAGES = ['app/(public)/[category]/page.jsx', 'app/(public)/[category]/[state]/page.jsx', 'app/(public)/[category]/[state]/[city]/page.jsx'];

test('landing pages: ISR 300 s, on-demand (generateStaticParams -> [], dynamicParams left true), no searchParams', () => {
  for (const f of LANDING_PAGES) {
    const src = read(f);
    assert.match(src, /export const revalidate = 300;/, f);
    assert.match(src, /export function generateStaticParams\(\) \{\n  return \[\];\n\}/, f);
    assert.doesNotMatch(src, /dynamicParams|force-static|force-dynamic|searchParams/, f);
    assert.match(src, /landingPreviewToken\(\)/, f);
  }
});

test('the only uncached landing fetch is the draft one, and only with a draft-mode token', () => {
  const hub = read('lib/landingHub.js');
  const noStore = fetchCalls(hub).filter((c) => /no-store/.test(c));
  assert.equal(noStore.length, 1);
  assert.match(hub, /if \(!token\) \{\n    const json = await cachedJson\(url, \{ revalidate: LIST_WINDOW, tags: \[TAGS\.LANDING, TAGS\.VENDORS\], nullOn404: true \}\);/);
  for (const f of LANDING_PAGES) assert.doesNotMatch(read(f).replace(/^\s*\/\/.*$/gm, ''), /no-store/, f);
});

test('city page: category-cities lookups cached 1 h, purged on taxonomy AND vendors', () => {
  const src = read('app/(public)/[category]/[state]/[city]/page.jsx');
  assert.match(src, /const taxonomyFetch = \(\) => \(\{ next: \{ revalidate: 3600, tags: \[TAGS\.TAXONOMY, TAGS\.VENDORS\] \} \}\);/);
  const cc = fetchCalls(src).filter((c) => c.includes('/public/category-cities'));
  assert.equal(cc.length, 2);
  for (const c of cc) assert.match(c, /taxonomyFetch\(\)/);
});

test('no module-level shared fetch options: Next deletes init.next from the object it is given', () => {
  const offenders = ['app', 'lib', 'components'].flatMap((d) => sourceFiles(join(ROOT, d)))
    .filter((f) => /^(export )?const [A-Za-z_]+ = \{ ?next:/m.test(readFileSync(f, 'utf8')))
    .map((f) => posix(relative(ROOT, f)));
  assert.deepEqual(offenders, []);
});

test('cached routes declare their window; their fetches are tagged and never no-store', () => {
  for (const [f, window] of Object.entries(CACHED)) {
    const src = read(f);
    if (window !== null) assert.match(src, new RegExp(`export const revalidate = ${window};`), f);
    // Page window and data window must agree (DETAIL_WINDOW / LIST_WINDOW).
    if (window !== null && /\b(DETAIL|LIST)_WINDOW\b/.test(src)) {
      assert.equal(window, /\bDETAIL_WINDOW\b/.test(src) || f.includes('vendors/[vendorId]') ? DETAIL_WINDOW : LIST_WINDOW, f);
    }
    const code = src.replace(/^\s*\/\/.*$/gm, ''); // comments may mention no-store
    assert.doesNotMatch(code, /cache:\s*'no-store'/, f);
    assert.match(src, /tags: \[|TAGS\.[A-Z]+/, `${f}: no cache tags`);
  }
});

test('project and vendor pages are on-demand ISR (generateStaticParams -> [], not dynamic)', () => {
  for (const f of ['app/(public)/projects/[projectId]/page.jsx', 'app/(public)/vendors/[vendorId]/page.jsx']) {
    assert.match(read(f), /export function generateStaticParams\(\) \{\n  return \[\];\n\}/, f);
    assert.doesNotMatch(read(f), /dynamicParams/, f);
  }
});

test('cached dynamic-segment pages that list their slugs only serve those (dynamicParams = false)', () => {
  for (const f of ['app/(public)/design-styles/[style]/page.jsx', 'app/(public)/cities/[city]/page.jsx']) {
    assert.match(read(f), /export const dynamicParams = false;/, f);
  }
});

test('vendor profile 404 structure: no loading boundary above it; layout.jsx 404s before ./loading.js streams', () => {
  // A loading.js directly in app/(public)/vendors/ would wrap [vendorId] and stream a 200 first.
  assert.ok(!existsSync(join(ROOT, 'app/(public)/vendors/loading.js')));
  assert.ok(!existsSync(join(ROOT, 'app/(public)/loading.js')));
  assert.ok(existsSync(join(ROOT, 'app/(public)/vendors/(list)/loading.js')));
  assert.ok(existsSync(join(ROOT, 'app/(public)/vendors/(list)/page.jsx')));
  const layout = read('app/(public)/vendors/[vendorId]/layout.jsx');
  assert.match(layout, /if \(!\(await fetchVendor\(params\.vendorId\)\)\) notFound\(\);/);
  assert.ok(existsSync(join(ROOT, 'app/(public)/vendors/not-found.jsx')));
  const data = read('app/(public)/vendors/[vendorId]/vendorData.js');
  assert.match(data, /nullOn404: true/);
});

test('project page keeps: malformed-id guard, isPublicProject, 404 -> null, notFound(), noindex metadata, canonical', () => {
  const src = read('app/(public)/projects/[projectId]/page.jsx');
  assert.match(src, /if \(!OBJECT_ID\.test\(id\)\) return null;/);
  assert.match(src, /isPublicProject\(project\)/);
  assert.match(src, /nullOn404: true/);
  assert.match(src, /if \(!project\) notFound\(\);/);
  assert.match(src, /robots: \{ index: false, follow: false \}/);
  assert.match(src, /canonical: `\$\{SITE_URL\}\/projects\/\$\{params\.projectId\}\/`/);
});

console.log(`\n${passed} passed`);
