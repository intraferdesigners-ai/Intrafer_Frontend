// Run: node scripts/testCityPagination.mjs
// City-page vendor pagination (lib/cityPagination.js + next.config.js +
// app/(public)/[category]/[state]/[city]/p/[page]/page.jsx): page math,
// ?page values, canonicals, positions, the rewrite that keeps page 1 static,
// and the sitemap listing only the bare city URL. The live run is in the
// report (pages 1-3, 404s, ItemList and canonical per page).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CITY_PAGE_SIZE, cityPath, itemPosition, pageHref, pageItems, parsePageParam, totalPages } from '../lib/cityPagination.js';

const require = createRequire(import.meta.url);
const { pathToRegexp } = require('next/dist/compiled/path-to-regexp');
const nextConfig = require('../next.config.js');
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const code = (p) => read(p).replace(/^\s*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
let passed = 0;
const test = async (name, fn) => { await fn(); passed += 1; console.log(`ok - ${name}`); };

await test('page values: 1 -> redirect, 2..9999 -> page, everything else -> 404', () => {
  assert.equal(CITY_PAGE_SIZE, 12);
  assert.deepEqual(parsePageParam('1'), { kind: 'first' });
  assert.deepEqual(parsePageParam('2'), { kind: 'page', n: 2 });
  assert.deepEqual(parsePageParam('9999'), { kind: 'page', n: 9999 });
  for (const bad of ['0', '-1', '-2', '2.5', '1.0', '02', '001', 'abc', '2a', '', ' 2', '10000', '99999999999999999999', undefined, null]) {
    assert.deepEqual(parsePageParam(bad), { kind: 'invalid' }, String(bad));
  }
});

await test('page math: pages, hrefs (page 1 has no parameter), positions continue across pages', () => {
  assert.deepEqual([0, 1, 12, 13, 24, 25].map((c) => totalPages(c)), [1, 1, 1, 2, 2, 3]);
  const base = cityPath('interior-designers', 'maharashtra', 'mumbai');
  assert.equal(base, '/interior-designers/maharashtra/mumbai/');
  assert.equal(pageHref(base, 1), base);
  assert.equal(pageHref(base, 3), `${base}?page=3`);
  assert.deepEqual([itemPosition(1, 0), itemPosition(1, 11), itemPosition(2, 0), itemPosition(3, 0)], [1, 12, 13, 25]);
});

await test('numbered links: all pages up to 7, else first/last/current±1 with gaps', () => {
  assert.deepEqual(pageItems(1, 3), [1, 2, 3]);
  assert.deepEqual(pageItems(5, 10), [1, null, 4, 5, 6, null, 10]);
  assert.deepEqual(pageItems(1, 10), [1, 2, null, 10]);
  assert.deepEqual(pageItems(10, 10), [1, null, 9, 10]);
});

// The real next.config.js patterns, matched the way Next matches them.
const [rewrite] = await nextConfig.rewrites();
const redirects = await nextConfig.redirects();
const internalRedirect = redirects.find((r) => r.source.endsWith('/p/:page/'));
const matches = (source, path) => pathToRegexp(source, [], { strict: true, sensitive: false, delimiter: '/' }).test(path);
const hasValue = new RegExp(`^${rewrite.has[0].value}$`);

await test('?page on a city URL is rewritten to the internal /p/<value>/ route; app routes are never touched', () => {
  assert.equal(rewrite.has[0].type, 'query');
  assert.equal(rewrite.has[0].key, 'page');
  assert.equal(rewrite.destination, '/:category/:state/:city/p/:page/');
  for (const p of ['/interior-designers/maharashtra/mumbai/', '/architects/karnataka/bengaluru/']) assert.ok(matches(rewrite.source, p), p);
  for (const p of ['/admin/dashboard/vendors/', '/vendor/dashboard/leads/', '/auth/register/verify/', '/vendors/abc/def/',
    '/for-designers/a/b/', '/interior-designers/maharashtra/', '/interior-designers/maharashtra/mumbai/p/2/']) {
    assert.ok(!matches(rewrite.source, p), p);
  }
  for (const v of ['2', '0', '-1', '2.5', 'abc', '99999999999999999999']) assert.ok(hasValue.test(v), v); // validated by the page
  for (const v of ['a/b', '%2F', '', '1'.repeat(21)]) assert.ok(!hasValue.test(v), v); // left on page 1 (canonical = city URL)
});

await test('direct visits to the internal route redirect permanently to the public ?page URL', () => {
  assert.equal(internalRedirect.permanent, true);
  assert.equal(internalRedirect.destination, '/:category/:state/:city/?page=:page');
  assert.ok(matches(internalRedirect.source, '/interior-designers/maharashtra/mumbai/p/2/'));
  assert.ok(!matches(internalRedirect.source, '/admin/dashboard/p/2/'));
});

await test('page 1 stays static: the city page never reads searchParams; page N is ISR with its own self-canonical', () => {
  const city = code('app/(public)/[category]/[state]/[city]/page.jsx');
  assert.doesNotMatch(city, /searchParams/);
  assert.match(city, /export const revalidate = 300;/);
  assert.equal((city.match(/<VendorPagination basePath=\{cityPathOf\(params\)\} current=\{1\}/g) || []).length, 2, 'automatic and authored page 1');
  const pageN = code('app/(public)/[category]/[state]/[city]/p/[page]/page.jsx');
  assert.doesNotMatch(pageN, /searchParams/);
  assert.match(pageN, /export const revalidate = 300;/);
  assert.match(pageN, /canonical: `\$\{SITE_URL\}\/\$\{params\.category\}\/\$\{params\.state\}\/\$\{params\.city\}\/\?page=\$\{r\.n\}`/);
  assert.match(pageN, /title: `\$\{r\.cat\.name\} in \$\{where\} — Page \$\{r\.n\}`/);
  assert.match(pageN, /description: `Page \$\{r\.n\} of/);
  assert.match(pageN, /if \(r\.parsed\.kind === 'first'\) permanentRedirect\(cityPathOf\(params\)\);/);
  assert.match(pageN, /notFound\(\)/);
  // Pages 2+ carry no intro/sections/FAQ.
  assert.doesNotMatch(pageN, /LandingSections|FaqSection|LandingIntro|faqPageJsonLd|buildFaqJsonLd/);
  assert.match(pageN, /buildCollectionJsonLd\(params, cat, city, state, vendors, n\)/);
});

await test('pagination links are real anchors: next/link with plain hrefs, rendered on the server', () => {
  const nav = read('components/seo/VendorPagination.jsx');
  assert.doesNotMatch(nav, /'use client'/);
  assert.match(nav, /<Link href=\{pageHref\(basePath, current - 1\)\}[^>]*rel="prev"/);
  assert.match(nav, /<Link href=\{pageHref\(basePath, current \+ 1\)\}[^>]*rel="next"/);
  assert.match(nav, /<Link href=\{pageHref\(basePath, n\)\}/);
});

await test('sitemaps list only the bare city URL (never ?page=N)', () => {
  // A public paginated URL is "<path>/?page=N"; the API calls
  // ("/public/vendors?page=") are not page URLs.
  assert.doesNotMatch(read('lib/sitemap.js'), /\/\?page=/);
  assert.doesNotMatch(read('lib/landingSitemap.js'), /\?page=/);
});

console.log(`\n${passed} passed`);
