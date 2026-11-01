// Run: node scripts/testSitemap.mjs
// The sitemap index and its child sitemaps (lib/sitemap.js), against a
// mocked API: group contents and inclusion rules, the landing-page merge,
// per-group fail-soft, 50,000-URL / 50 MB splitting into numbered children,
// lastmod only where known, the www host everywhere, and the route files.
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SITEMAP_GROUPS, STATIC_PAGES, MAX_URLS, MAX_BYTES, GROUP_TAGS, buildSitemapIndex, buildSitemapChild, chunkEntries,
  childPath, escapeXml, groupEntries, parseChildFile, urlsetXml,
} from '../lib/sitemap.js';
import { GUIDES } from '../lib/guides-data.js';
import { STYLE_SLUGS } from '../lib/designStyles.js';
import { CITY_PAGE_SLUGS } from '../lib/cityPages.js';
import { SITE_URL } from '../lib/siteUrl.js';
import { TAGS } from '../lib/cacheTags.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const BASE = SITE_URL;
const API = 'https://api.example/api';
const WWW = /^https:\/\/www\.intrafer\.in\/([^?#]*\/)?$/;
let passed = 0;
const test = async (name, fn) => { await fn(); passed += 1; console.log(`ok - ${name}`); };

const id = (n) => n.toString(16).padStart(24, '0');
const vendor = (n, extra = {}) => ({ _id: id(n), isApproved: true, isListingEnabled: true, updatedAt: '2026-05-01T10:00:00.000Z', ...extra });
const project = (n) => ({ _id: id(5000 + n), isPublished: true, moderationStatus: 'approved', vendorId: { _id: id(n) }, updatedAt: '2026-06-01T10:00:00.000Z' });

// A mocked backend. `down` lists path prefixes that answer 500.
function mockApi({ vendors = [vendor(1), vendor(2)], projects = [project(1)], down = [], landing = [], calls = [] } = {}) {
  const json = (body, status = 200) => ({ ok: status < 400, status, json: async () => body });
  return async (url, init) => {
    calls.push({ url, init });
    const u = new URL(url);
    const path = u.pathname.replace(/^\/api/, '');
    if (down.some((p) => path.startsWith(p))) return json({}, 500);
    const q = Object.fromEntries(u.searchParams);
    if (path === '/public/vendors' && q.category) {
      return json({ data: { vendors: [], meetsThreshold: q.city === 'mumbai' } });
    }
    if (path === '/public/vendors') {
      const limit = Number(q.limit); const page = Number(q.page);
      return json({ data: { vendors: vendors.slice((page - 1) * limit, page * limit), totalPages: Math.max(1, Math.ceil(vendors.length / limit)) } });
    }
    if (path === '/public/gallery') {
      const limit = Number(q.limit); const page = Number(q.page);
      return json({ data: { projects: projects.slice((page - 1) * limit, page * limit), totalPages: Math.max(1, Math.ceil(projects.length / limit)) } });
    }
    if (path.startsWith('/public/service-categories/')) {
      return path.endsWith('/interior-designers') ? json({ data: { category: {} } }) : json({}, 404);
    }
    if (path === '/public/states') return json({ data: { states: [{ state: 'Maharashtra' }, { state: '' }] } });
    if (path === '/public/category-cities') return json({ data: { cities: [{ city: 'Mumbai', citySlug: 'mumbai' }, { city: 'Pune', citySlug: 'pune' }] } });
    if (path === '/public/landing-pages/sitemap') return json({ data: { pages: landing } });
    return json({}, 404);
  };
}
const ctx = (opts) => ({ api: API, baseUrl: BASE, fetchImpl: mockApi(opts) });
const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

await test('index: a <sitemapindex> listing one child per group, all on www', async () => {
  const { xml, children, failed } = await buildSitemapIndex(ctx());
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>\n<sitemapindex xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  assert.doesNotMatch(xml, /<urlset/);
  assert.deepEqual(failed, []);
  assert.deepEqual(locs(xml), SITEMAP_GROUPS.map((g) => `${BASE}/sitemaps/${g}-1.xml`));
  assert.deepEqual(SITEMAP_GROUPS, ['pages', 'categories', 'designers', 'projects', 'guides']);
  for (const c of children) assert.match(c.loc, /^https:\/\/www\.intrafer\.in\/sitemaps\/[a-z]+-1\.xml$/);
  // lastmod per child = its newest entry's, only where known.
  assert.equal(children.find((c) => c.loc.endsWith('designers-1.xml')).lastModified, '2026-05-01T10:00:00.000Z');
  assert.equal(children.find((c) => c.loc.endsWith('pages-1.xml')).lastModified, null);
});

await test('pages: static pages + every /design-styles/<style>/ + every /cities/<city>/; no lastmod (none known)', async () => {
  const xml = await buildSitemapChild('pages-1.xml', ctx());
  assert.match(xml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  assert.deepEqual(locs(xml), [
    ...STATIC_PAGES.map((p) => `${BASE}${p.path}`),
    ...STYLE_SLUGS.map((s) => `${BASE}/design-styles/${s}/`),
    ...CITY_PAGE_SLUGS.map((c) => `${BASE}/cities/${c}/`),
  ]);
  assert.doesNotMatch(xml, /<lastmod>/);
  assert.ok(!locs(xml).includes(`${BASE}/guides/`));
});

await test('guides: /guides/ and every guide', async () => {
  assert.deepEqual(locs(await buildSitemapChild('guides-1.xml', ctx())), [`${BASE}/guides/`, ...GUIDES.map((g) => `${BASE}/guides/${g.slug}/`)]);
});

await test('designers: every approved + listed vendor, paged, deduped; lastmod from updatedAt', async () => {
  const vendors = [vendor(1), vendor(2, { isApproved: false }), vendor(3, { isListingEnabled: false }), vendor(4, { updatedAt: undefined }), vendor(1), ...Array.from({ length: 60 }, (_, i) => vendor(100 + i))];
  const entries = await groupEntries('designers', ctx({ vendors }));
  assert.equal(entries.length, 62);
  assert.deepEqual(entries[0], { url: `${BASE}/vendors/${id(1)}/`, lastModified: '2026-05-01T10:00:00.000Z', priority: 0.7 });
  assert.equal(entries[1].lastModified, null);
  assert.ok(!entries.some((e) => e.url.includes(id(2)) || e.url.includes(id(3))));
  assert.doesNotMatch(urlsetXml(entries.slice(1, 2)), /<lastmod>/);
});

await test('projects: public projects only, via the paginated gallery', async () => {
  const entries = await groupEntries('projects', ctx({ projects: [project(1), { ...project(2), moderationStatus: 'rejected' }, project(3)] }));
  assert.deepEqual(entries.map((e) => e.url), [`${BASE}/projects/${id(5001)}/`, `${BASE}/projects/${id(5003)}/`]);
});

await test('categories: active hubs, their states, threshold cities; authored pages merged (indexable added, Noindex dropped)', async () => {
  const landing = [
    { level: 'city', categorySlug: 'interior-designers', stateSlug: 'karnataka', citySlug: 'bengaluru', indexable: true, updatedAt: '2026-07-01T00:00:00.000Z' },
    { level: 'city', categorySlug: 'interior-designers', stateSlug: 'maharashtra', citySlug: 'mumbai', indexable: false },
    { level: 'city', categorySlug: 'interior-designers', stateSlug: 'maharashtra', citySlug: 'pune', indexable: false },
  ];
  const urls = (await groupEntries('categories', ctx({ landing }))).map((e) => e.url);
  assert.deepEqual(urls, [
    `${BASE}/interior-designers/`,
    `${BASE}/interior-designers/maharashtra/`,
    // mumbai met the threshold but its authored page is Noindex -> dropped; pune never qualified
    `${BASE}/interior-designers/karnataka/bengaluru/`,
  ]);
  const withoutLanding = (await groupEntries('categories', ctx())).map((e) => e.url);
  assert.ok(withoutLanding.includes(`${BASE}/interior-designers/maharashtra/mumbai/`), 'the >=3-vendor Auto rule (meetsThreshold) still adds the city');
  assert.ok(!withoutLanding.includes(`${BASE}/interior-designers/maharashtra/pune/`));
});

await test('categories: a failing landing-page fetch keeps the automatic entries', async () => {
  const urls = (await groupEntries('categories', ctx({ down: ['/public/landing-pages'] }))).map((e) => e.url);
  assert.ok(urls.includes(`${BASE}/interior-designers/maharashtra/mumbai/`));
});

await test('fail-soft: one group down -> only its child fails; the index still lists it and every other group', async () => {
  const c = ctx({ down: ['/public/vendors'] });
  const { xml, failed } = await buildSitemapIndex(c);
  assert.deepEqual(failed, ['categories', 'designers']); // both read /public/vendors
  assert.deepEqual(locs(xml), SITEMAP_GROUPS.map((g) => `${BASE}/sitemaps/${g}-1.xml`));
  await assert.rejects(buildSitemapChild('designers-1.xml', c));
  assert.ok((await buildSitemapChild('projects-1.xml', c)).includes('/projects/'));
  assert.ok((await buildSitemapChild('pages-1.xml', c)).includes(`${BASE}/about/`));
  const gallery = ctx({ down: ['/public/gallery'] });
  assert.deepEqual((await buildSitemapIndex(gallery)).failed, ['projects']);
  await assert.rejects(buildSitemapChild('projects-1.xml', gallery));
  assert.ok((await buildSitemapChild('designers-1.xml', gallery)).includes('/vendors/'));
});

await test('splitting: > 50,000 URLs -> numbered children of <= 50,000; the index lists them all', async () => {
  assert.equal(MAX_URLS, 50000);
  assert.equal(MAX_BYTES, 52428800);
  const big = Array.from({ length: 120001 }, (_, i) => ({ url: `${BASE}/vendors/${id(i)}/`, lastModified: null, priority: 0.7 }));
  const chunks = chunkEntries(big);
  assert.deepEqual(chunks.map((c) => c.length), [50000, 50000, 20001]);
  // A mocked vendor list of 50,001 through the real group/route code.
  const vendors = Array.from({ length: 50001 }, (_, i) => vendor(i + 1));
  const c = ctx({ vendors });
  const index = locs((await buildSitemapIndex(c)).xml);
  assert.ok(index.includes(`${BASE}/sitemaps/designers-1.xml`) && index.includes(`${BASE}/sitemaps/designers-2.xml`));
  assert.ok(!index.includes(`${BASE}/sitemaps/designers-3.xml`));
  assert.equal(locs(await buildSitemapChild('designers-1.xml', c)).length, 50000);
  assert.deepEqual(locs(await buildSitemapChild('designers-2.xml', c)), [`${BASE}/vendors/${id(50001)}/`]);
  assert.equal(await buildSitemapChild('designers-3.xml', c), null);
});

await test('splitting: the 50 MB byte limit also splits, and every child stays under it', async () => {
  const entries = Array.from({ length: 1000 }, (_, i) => ({ url: `${BASE}/vendors/${id(i)}/`, lastModified: '2026-05-01T10:00:00.000Z', priority: 0.7 }));
  const maxBytes = 20000;
  const chunks = chunkEntries(entries, { maxBytes });
  assert.ok(chunks.length > 1);
  assert.equal(chunks.flat().length, 1000);
  for (const ch of chunks) assert.ok(Buffer.byteLength(urlsetXml(ch)) <= maxBytes);
  const index = locs((await buildSitemapIndex(ctx({ vendors: Array.from({ length: 300 }, (_, i) => vendor(i + 1)) }), { maxBytes })).xml);
  assert.ok(index.filter((u) => u.includes('/designers-')).length > 1);
});

await test('every <loc> in every child is a www, trailing-slash URL; XML is escaped', async () => {
  const c = ctx();
  for (const g of SITEMAP_GROUPS) {
    for (const u of locs(await buildSitemapChild(`${g}-1.xml`, c))) assert.match(u, WWW, u);
  }
  assert.equal(escapeXml(`a&b<c>"d'`), 'a&amp;b&lt;c&gt;&quot;d&apos;');
});

await test('child names: only <group>-<n>.xml with a known group and n >= 1', () => {
  assert.deepEqual(parseChildFile('designers-2.xml'), { group: 'designers', n: 2 });
  for (const bad of ['designers-0.xml', 'designers.xml', 'other-1.xml', 'designers-1.xml/', '../designers-1.xml', 'designers-1.txt', '']) {
    assert.equal(parseChildFile(bad), null, bad);
  }
  assert.equal(childPath('pages', 1), '/sitemaps/pages-1.xml');
});

await test('fetches carry the group tags (purge hooks) and a 300 s window, a fresh options object per call', async () => {
  const calls = [];
  await buildSitemapIndex({ api: API, baseUrl: BASE, fetchImpl: mockApi({ calls }) });
  assert.deepEqual(GROUP_TAGS.designers, [TAGS.VENDORS]);
  assert.deepEqual(GROUP_TAGS.projects, [TAGS.PROJECTS]);
  assert.deepEqual(GROUP_TAGS.categories, [TAGS.TAXONOMY, TAGS.VENDORS, TAGS.LANDING]);
  assert.ok(calls.length > 5);
  for (const { init } of calls) {
    assert.equal(init.next.revalidate, 300);
    assert.ok(init.next.tags.length > 0);
  }
  assert.equal(new Set(calls.map((c) => c.init)).size, calls.length);
});

await test('routes: /sitemap.xml is the index route, children under /sitemaps/[file], robots points at the index', () => {
  assert.ok(!existsSync(join(ROOT, 'app/sitemap.js')), 'the old single sitemap is gone');
  const index = readFileSync(join(ROOT, 'app/sitemap.xml/route.js'), 'utf8');
  assert.match(index, /buildSitemapIndex\(/);
  assert.match(index, /export const revalidate = 300;/);
  assert.match(index, /application\/xml/);
  const child = readFileSync(join(ROOT, 'app/sitemaps/[file]/route.js'), 'utf8');
  assert.match(child, /buildSitemapChild\(params\.file/);
  assert.match(child, /export const revalidate = 300;/);
  assert.match(child, /status: 404/);
  assert.match(readFileSync(join(ROOT, 'app/robots.js'), 'utf8'), /sitemap: absoluteUrl\('\/sitemap\.xml'\)/);
});

await test('every category hub the sitemap can list is linked from the other hubs (no orphan hubs)', () => {
  const src = readFileSync(join(ROOT, 'app/(public)/[category]/page.jsx'), 'utf8');
  assert.match(src, /SERVICE_CATEGORIES\.filter\(\(c\) => c\.slug !== current\)/);
  assert.equal((src.match(/<OtherServices current=\{params\.category\} \/>/g) || []).length, 2, 'automatic and authored hub');
  assert.match(readFileSync(join(ROOT, 'lib/sitemap.js'), 'utf8'), /CATEGORY_SLUGS = Object\.freeze\(SERVICE_CATEGORIES\.map/);
});

console.log(`\n${passed} passed`);
