// Run: node scripts/testCachePolicy.mjs
// Static guard on caching: routes that depend on the signed-in user, a
// token, a form flow or per-request query params must never get a
// revalidate/cache setting; landing-page (and ?preview=) fetches stay
// no-store; the batch-1 cached pages keep their settings.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`ok - ${name}`); };
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

function sourceFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return sourceFiles(p);
    return /\.(m?js|jsx|ts|tsx)$/.test(name) ? [p] : [];
  });
}

// Every fetch( ... ) call in a source: [{ args }] with balanced parens.
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

const MUST_STAY_UNCACHED = [
  'app/admin', 'app/vendor/dashboard', 'app/auth',
  'app/(public)/enquiry', 'app/(public)/review', 'app/(public)/contact', 'app/(public)/compare',
];

test('must-stay-uncached routes (admin, vendor dashboard, auth, enquiry, review token, contact, compare) have no cache settings', () => {
  const files = MUST_STAY_UNCACHED.flatMap((d) => {
    assert.ok(existsSync(join(ROOT, d)), `${d} missing — update this list`);
    return sourceFiles(join(ROOT, d));
  });
  assert.ok(files.length > 20);
  const hits = files.filter((f) => CACHING.test(readFileSync(f, 'utf8'))).map((f) => relative(ROOT, f));
  assert.deepEqual(hits, []);
});

const LANDING_PAGES = ['app/(public)/[category]/page.jsx', 'app/(public)/[category]/[state]/page.jsx', 'app/(public)/[category]/[state]/[city]/page.jsx'];

test('landing pages (?preview=) stay dynamic: no page-level revalidate / static settings', () => {
  for (const f of LANDING_PAGES) {
    assert.doesNotMatch(read(f), /export\s+const\s+(revalidate|fetchCache|dynamicParams)\b|force-static/, f);
  }
});

test('every landing-page fetch (incl. the ?preview= token) is no-store', () => {
  const calls = [...LANDING_PAGES, 'lib/landingHub.js'].flatMap((f) => fetchCalls(read(f)).map((c) => [f, c]))
    .filter(([, c]) => c.includes('/public/landing-page'));
  assert.ok(calls.length >= 2, 'landing-page fetches not found');
  for (const [f, c] of calls) {
    assert.match(c, /cache:\s*'no-store'/, `${f}: ${c.slice(0, 80)}`);
    assert.doesNotMatch(c, /revalidate/, f);
  }
});

test('city page caches only the category-cities lookups (vendors, FAQ, category stay no-store)', () => {
  const src = read('app/(public)/[category]/[state]/[city]/page.jsx');
  assert.match(src, /const TAXONOMY_FETCH = \{ next: \{ revalidate: 3600, tags: \['taxonomy'\] \} \};/);
  for (const c of fetchCalls(src)) {
    if (c.includes('/public/category-cities')) assert.match(c, /TAXONOMY_FETCH/, c.slice(0, 80));
    else assert.match(c, /cache:\s*'no-store'/, c.slice(0, 80));
  }
  assert.equal(fetchCalls(src).filter((c) => c.includes('TAXONOMY_FETCH')).length, 2);
});

const CACHED = {
  'app/(public)/design-styles/page.jsx': ['vendors'],
  'app/(public)/design-styles/[style]/page.jsx': ['vendors'],
  'app/(public)/cities/[city]/page.jsx': ['vendors', 'stats'],
  'app/(public)/about/page.jsx': ['stats'],
  'app/(public)/testimonials/page.jsx': ['reviews'],
};

test('batch-1 aggregate pages: revalidate = 300 and every fetch cached 300 s with a tag', () => {
  for (const [f, tags] of Object.entries(CACHED)) {
    const src = read(f);
    assert.match(src, /export const revalidate = 300;/, f);
    const calls = fetchCalls(src);
    assert.ok(calls.length > 0, f);
    for (const c of calls) assert.match(c, /next: \{ revalidate: 300, tags: \['\w+'\] \}/, `${f}: ${c.slice(0, 80)}`);
    for (const tag of tags) assert.ok(src.includes(`tags: ['${tag}']`), `${f} missing tag ${tag}`);
  }
});

test('cached dynamic-segment pages only serve their known slugs (dynamicParams = false)', () => {
  for (const f of ['app/(public)/design-styles/[style]/page.jsx', 'app/(public)/cities/[city]/page.jsx']) {
    assert.match(read(f), /export const dynamicParams = false;/, f);
    assert.match(read(f), /export function generateStaticParams\(/, f);
  }
});

console.log(`\n${passed} passed`);
