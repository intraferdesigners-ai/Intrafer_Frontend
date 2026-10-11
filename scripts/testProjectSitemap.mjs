// Run: node scripts/testProjectSitemap.mjs
import assert from 'node:assert/strict';
import { fetchPublicProjects, projectEntries, isPublicProject, MAX_PROJECTS, PROJECT_PRIORITY } from '../lib/projectSitemap.js';
import { mergeLandingPages } from '../lib/landingSitemap.js';
import { SITE_URL } from '../lib/siteUrl.js';

// The sitemap's real base (app/sitemap.js uses SITE_URL), not a copy of it.
const BASE = SITE_URL;
// Every <loc> must be on the one canonical host — apex or any other host fails.
const CANONICAL = /^https:\/\/www\.intrafer\.in\//;
const assertCanonicalHost = (entries) => entries.forEach((e) => assert.match(e.url, CANONICAL));
const NOW = '2026-01-01T00:00:00.000Z';
const API = 'https://api.example/api';
let passed = 0;
const test = async (name, fn) => { await fn(); passed += 1; console.log(`ok - ${name}`); };
const noSleep = { sleep: async () => {} };

const id = (n) => n.toString(16).padStart(24, '0');
const project = (n, extra = {}) => ({
  _id: id(n), title: `P${n}`, isPublished: true, moderationStatus: 'approved',
  vendorId: { _id: id(1000 + n), businessName: 'V' }, updatedAt: '2026-05-01T10:00:00.000Z', createdAt: '2026-04-01T10:00:00.000Z', ...extra,
});

// Mocked paginated GET /public/gallery over `all`; `fail` maps page -> times to fail.
function galleryApi(all, { fail = {}, status = 500 } = {}) {
  const calls = [];
  const impl = async (url) => {
    calls.push(url);
    const u = new URL(url);
    assert.equal(u.pathname, '/api/public/gallery');
    const page = Number(u.searchParams.get('page'));
    const limit = Number(u.searchParams.get('limit'));
    if (fail[page] > 0) { fail[page] -= 1; return { ok: false, status, json: async () => ({}) }; }
    const totalPages = Math.max(1, Math.ceil(all.length / limit));
    return { ok: true, json: async () => ({ success: true, data: { projects: all.slice((page - 1) * limit, page * limit), total: all.length, page, totalPages } }) };
  };
  return { impl, calls };
}

await test('pages through every project (limit 50) and keeps them all', async () => {
  const all = Array.from({ length: 123 }, (_, i) => project(i + 1));
  const { impl, calls } = galleryApi(all);
  const r = await fetchPublicProjects(API, {}, impl, noSleep);
  assert.equal(r.projects.length, 123);
  assert.equal(r.truncated, false);
  assert.deepEqual(calls.map((c) => new URL(c).searchParams.get('page')), ['1', '2', '3']);
  assert.ok(calls.every((c) => new URL(c).searchParams.get('limit') === '50'));
});

await test('entries: canonical URL form (www host, trailing slash), lastmod updatedAt → createdAt → now, priority', async () => {
  const out = projectEntries([
    project(1),
    project(2, { updatedAt: undefined }),
    project(3, { updatedAt: undefined, createdAt: undefined }),
    project(4, { updatedAt: 'not a date' }),
  ], BASE, NOW);
  assert.deepEqual(out, [
    { url: `${BASE}/projects/${id(1)}/`, lastModified: '2026-05-01T10:00:00.000Z', priority: PROJECT_PRIORITY },
    { url: `${BASE}/projects/${id(2)}/`, lastModified: '2026-04-01T10:00:00.000Z', priority: PROJECT_PRIORITY },
    { url: `${BASE}/projects/${id(3)}/`, lastModified: NOW, priority: PROJECT_PRIORITY },
    { url: `${BASE}/projects/${id(4)}/`, lastModified: NOW, priority: PROJECT_PRIORITY },
  ]);
  // Same shape as the page's canonical: `${SITE_URL}/projects/${id}/`.
  assert.match(out[0].url, /^https:\/\/www\.intrafer\.in\/projects\/[a-f0-9]{24}\/$/);
  assertCanonicalHost(out);
});

await test('non-public projects excluded (unpublished, pending/rejected, no vendor, bad id)', async () => {
  const rows = [
    project(1),
    project(2, { isPublished: false }),
    project(3, { moderationStatus: 'pending' }),
    project(4, { moderationStatus: 'rejected' }),
    project(5, { vendorId: null }),
    project(6, { _id: 'not-an-object-id' }),
    project(7, { _id: undefined }),
    project(8, { vendorId: id(9999) }), // unpopulated id still counts as a vendor
    null,
  ];
  assert.deepEqual(projectEntries(rows, BASE, NOW).map((e) => e.url), [`${BASE}/projects/${id(1)}/`, `${BASE}/projects/${id(8)}/`]);
  assert.equal(isPublicProject(undefined), false);
});

await test('no duplicate URLs (a project seen twice across pages is listed once)', async () => {
  const out = projectEntries([project(1), project(2), project(1)], BASE, NOW);
  assert.equal(out.length, 2);
  assert.equal(new Set(out.map((e) => e.url)).size, 2);
});

await test('one transient failure per page is retried', async () => {
  const all = Array.from({ length: 60 }, (_, i) => project(i + 1));
  const { impl } = galleryApi(all, { fail: { 2: 1 } });
  const r = await fetchPublicProjects(API, {}, impl, noSleep);
  assert.equal(r.projects.length, 60);
});

await test('API failure → null → no project entries, every other group intact', async () => {
  const { impl } = galleryApi([project(1)], { fail: { 1: 2 } });
  const r = await fetchPublicProjects(API, {}, impl, noSleep);
  assert.equal(r, null);
  const throwing = await fetchPublicProjects(API, {}, async () => { throw new Error('network down'); }, noSleep);
  assert.equal(throwing, null);
  const malformed = await fetchPublicProjects(API, {}, async () => ({ ok: true, json: async () => ({ data: {} }) }), noSleep);
  assert.equal(malformed, null);

  // Composed as app/sitemap.js does it.
  const others = [
    { url: `${BASE}/`, priority: 1, lastModified: NOW },
    { url: `${BASE}/vendors/${id(77)}/`, priority: 0.7, lastModified: NOW },
    { url: `${BASE}/interior-designers/`, priority: 0.8, lastModified: NOW },
  ];
  const sitemap = mergeLandingPages([others[0], others[1], ...projectEntries(r?.projects, BASE, NOW), others[2]], [], BASE, NOW);
  assert.deepEqual(sitemap, others);
  assertCanonicalHost(sitemap);
});

await test(`stops at MAX_PROJECTS (${MAX_PROJECTS}) and reports truncated`, async () => {
  const all = Array.from({ length: MAX_PROJECTS + 120 }, (_, i) => project(i + 1));
  const { impl, calls } = galleryApi(all);
  const r = await fetchPublicProjects(API, {}, impl, noSleep);
  assert.equal(r.projects.length, MAX_PROJECTS);
  assert.equal(r.truncated, true);
  assert.equal(calls.length, MAX_PROJECTS / 50);
});

await test('empty catalogue → no entries, one request', async () => {
  const { impl, calls } = galleryApi([]);
  const r = await fetchPublicProjects(API, {}, impl, noSleep);
  assert.deepEqual(r, { projects: [], truncated: false });
  assert.equal(calls.length, 1);
  assert.deepEqual(projectEntries(r.projects, BASE, NOW), []);
});

await test('every entry is on www.intrafer.in, never the apex', async () => {
  const out = projectEntries(Array.from({ length: 5 }, (_, i) => project(i + 1)), BASE, NOW);
  assertCanonicalHost(out);
  assert.ok(out.every((e) => !e.url.startsWith('https://intrafer.in')));
});

console.log(`\n${passed} passed`);
