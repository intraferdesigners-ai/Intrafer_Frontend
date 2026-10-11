// Run: node scripts/testLandingSitemap.mjs
import assert from 'node:assert/strict';
import { fetchLandingSitemapPages, mergeLandingPages } from '../lib/landingSitemap.js';

const BASE = 'https://intrafer.in';
const NOW = '2026-01-01T00:00:00.000Z';
let passed = 0;
const test = async (name, fn) => { await fn(); passed += 1; console.log(`ok - ${name}`); };

// Mocked GET /public/landing-pages/sitemap.
const mockFetch = (body, { ok = true, throws = false } = {}) => async (url) => {
  assert.equal(url, 'https://api.example/api/public/landing-pages/sitemap');
  if (throws) throw new Error('network down');
  return { ok, json: async () => body };
};
const respond = (pages) => ({ success: true, data: { pages } });

const existing = () => [
  { url: `${BASE}/`, priority: 1.0, lastModified: NOW },
  { url: `${BASE}/interior-designers/`, priority: 0.8, lastModified: NOW },
  { url: `${BASE}/interior-designers/uttar-pradesh/gautam-buddha-nagar/`, priority: 0.5, lastModified: NOW },
];

await test('adds an indexable authored page with trailing slash', async () => {
  const pages = await fetchLandingSitemapPages('https://api.example/api', {}, mockFetch(respond([
    { categorySlug: 'interior-designers', stateSlug: 'uttar-pradesh', citySlug: 'gaziabad', updatedAt: '2026-02-03T04:05:06.000Z', indexable: true },
  ])));
  const out = mergeLandingPages(existing(), pages, BASE, NOW);
  assert.equal(out.length, 4);
  assert.deepEqual(out[3], {
    url: `${BASE}/interior-designers/uttar-pradesh/gaziabad/`,
    lastModified: '2026-02-03T04:05:06.000Z',
    priority: 0.5,
  });
});

await test('removes a threshold city that has a forced-noindex authored page', async () => {
  const pages = await fetchLandingSitemapPages('https://api.example/api', {}, mockFetch(respond([
    { categorySlug: 'interior-designers', stateSlug: 'uttar-pradesh', citySlug: 'gautam-buddha-nagar', indexable: false },
  ])));
  const out = mergeLandingPages(existing(), pages, BASE, NOW);
  assert.deepEqual(out.map((e) => e.url), [`${BASE}/`, `${BASE}/interior-designers/`]);
});

await test('non-indexable authored page that is not listed adds nothing', async () => {
  const out = mergeLandingPages(existing(), [
    { categorySlug: 'interior-designers', stateSlug: 'test-state', citySlug: 'zz-test-city', indexable: false },
  ], BASE, NOW);
  assert.deepEqual(out, existing());
});

await test('dedupes against existing entries and within the response', async () => {
  const out = mergeLandingPages(existing(), [
    { categorySlug: 'interior-designers', stateSlug: 'uttar-pradesh', citySlug: 'gautam-buddha-nagar', indexable: true },
    { categorySlug: 'interior-designers', stateSlug: 'maharashtra', citySlug: 'pune', indexable: true },
    { categorySlug: 'interior-designers', stateSlug: 'maharashtra', citySlug: 'pune', indexable: true },
  ], BASE, NOW);
  const urls = out.map((e) => e.url);
  assert.equal(urls.length, new Set(urls).size);
  assert.equal(urls.length, 4);
  // Existing entry kept as-is, not replaced.
  assert.equal(out[2].lastModified, NOW);
  assert.equal(out[3].lastModified, NOW); // no updatedAt -> now
});

await test('fetch failure (throw) leaves the sitemap unchanged', async () => {
  const pages = await fetchLandingSitemapPages('https://api.example/api', {}, mockFetch(null, { throws: true }));
  assert.equal(pages, null);
  assert.deepEqual(mergeLandingPages(existing(), pages, BASE, NOW), existing());
});

await test('fetch failure (non-ok / malformed body) leaves the sitemap unchanged', async () => {
  assert.equal(await fetchLandingSitemapPages('https://api.example/api', {}, mockFetch({}, { ok: false })), null);
  const malformed = await fetchLandingSitemapPages('https://api.example/api', {}, mockFetch({ data: {} }));
  assert.equal(malformed, null);
  assert.deepEqual(mergeLandingPages(existing(), malformed, BASE, NOW), existing());
});

await test('skips entries with missing slugs', async () => {
  const out = mergeLandingPages(existing(), [{ categorySlug: 'interior-designers', stateSlug: '', citySlug: 'x', indexable: true }], BASE, NOW);
  assert.deepEqual(out, existing());
});

// ── Phase 4C: every level ────────────────────────────────────────────────
const withHubs = () => [
  ...existing(),
  { url: `${BASE}/interior-designers/maharashtra/`, priority: 0.6, lastModified: NOW },
];

await test('hubs: indexable + missing → added with the level priority and the right URL', async () => {
  const pages = await fetchLandingSitemapPages('https://api.example/api', {}, mockFetch(respond([
    { level: 'category', categorySlug: 'architects', stateSlug: '', citySlug: '', updatedAt: '2026-03-01T00:00:00.000Z', indexable: true },
    { level: 'state', categorySlug: 'interior-designers', stateSlug: 'goa', citySlug: '', indexable: true },
    { level: 'city', categorySlug: 'interior-designers', stateSlug: 'goa', citySlug: 'panaji', indexable: true },
  ])));
  const out = mergeLandingPages(withHubs(), pages, BASE, NOW);
  assert.deepEqual(out.slice(4), [
    { url: `${BASE}/architects/`, lastModified: '2026-03-01T00:00:00.000Z', priority: 0.8 },
    { url: `${BASE}/interior-designers/goa/`, lastModified: NOW, priority: 0.6 },
    { url: `${BASE}/interior-designers/goa/panaji/`, lastModified: NOW, priority: 0.5 },
  ]);
});

await test('hubs: indexable + already listed → no-op, existing priority kept', async () => {
  const out = mergeLandingPages(withHubs(), [
    { level: 'category', categorySlug: 'interior-designers', stateSlug: '', citySlug: '', indexable: true },
    { level: 'state', categorySlug: 'interior-designers', stateSlug: 'maharashtra', citySlug: '', indexable: true },
  ], BASE, NOW);
  assert.deepEqual(out, withHubs());
});

await test('hubs: noindex → the matching existing hub URL is removed (and only it)', async () => {
  const out = mergeLandingPages(withHubs(), [
    { level: 'category', categorySlug: 'interior-designers', stateSlug: '', citySlug: '', indexable: false },
    { level: 'state', categorySlug: 'interior-designers', stateSlug: 'maharashtra', citySlug: '', indexable: false },
  ], BASE, NOW);
  assert.deepEqual(out.map((e) => e.url), [`${BASE}/`, `${BASE}/interior-designers/uttar-pradesh/gautam-buddha-nagar/`]);
});

await test('hubs: noindex for an unlisted hub adds nothing; malformed hub entries skipped', async () => {
  const out = mergeLandingPages(withHubs(), [
    { level: 'state', categorySlug: 'interior-designers', stateSlug: 'kerala', citySlug: '', indexable: false },
    { level: 'state', categorySlug: 'interior-designers', stateSlug: '', citySlug: '', indexable: true },
    { level: 'category', categorySlug: '', stateSlug: '', citySlug: '', indexable: true },
  ], BASE, NOW);
  assert.deepEqual(out, withHubs());
});

await test('entries without level are city pages (old backend payload)', async () => {
  const out = mergeLandingPages(withHubs(), [
    { categorySlug: 'interior-designers', stateSlug: 'maharashtra', citySlug: '', indexable: false },
  ], BASE, NOW);
  assert.deepEqual(out, withHubs()); // a city entry without a city slug is malformed, not the state hub
});

await test('hubs: fetch failure leaves hub entries unchanged', async () => {
  const pages = await fetchLandingSitemapPages('https://api.example/api', {}, mockFetch(null, { throws: true }));
  assert.deepEqual(mergeLandingPages(withHubs(), pages, BASE, NOW), withHubs());
});

console.log(`\n${passed} passed`);
