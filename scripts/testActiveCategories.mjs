// Run: node scripts/testActiveCategories.mjs
// "Other services" on category hubs links only categories whose hub page
// answers 200 (lib/activeCategories.js), against a mocked API: an inactive
// category (the API 404s it, as the backend does for isActive: false), a
// failing lookup and a network error are all left out — never a 404 link.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { activeCategories, isActiveCategory } from '../lib/activeCategories.js';
import { SERVICE_CATEGORIES } from '../lib/categories.js';
import { TAGS } from '../lib/cacheTags.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const API = 'https://api.example/api';
let passed = 0;
const test = async (name, fn) => { await fn(); passed += 1; console.log(`ok - ${name}`); };

// GET /public/service-categories/:slug, like the backend: 404 when the
// category is inactive or unknown. `broken`: slug -> 'error' | 500.
function mockApi({ inactive = [], broken = {}, calls = [] } = {}) {
  return async (url, init) => {
    calls.push({ url, init });
    const slug = decodeURIComponent(new URL(url).pathname.split('/').pop());
    if (broken[slug] === 'error') throw new Error('network down');
    if (broken[slug]) return { status: broken[slug], ok: false, json: async () => ({}) };
    const known = SERVICE_CATEGORIES.find((c) => c.slug === slug);
    if (!known || inactive.includes(slug)) return { status: 404, ok: false, json: async () => ({ success: false }) };
    return { status: 200, ok: true, json: async () => ({ data: { category: { slug, name: known.name, isActive: true } } }) };
  };
}

await test('an inactive category is not linked; every active sibling is, in order, without the current hub', async () => {
  const out = await activeCategories(API, { exceptSlug: 'interior-designers', fetchImpl: mockApi({ inactive: ['lighting'] }) });
  const slugs = out.map((c) => c.slug);
  assert.ok(!slugs.includes('lighting'), 'inactive category linked');
  assert.ok(!slugs.includes('interior-designers'), 'links to itself');
  assert.deepEqual(slugs, SERVICE_CATEGORIES.map((c) => c.slug).filter((s) => s !== 'interior-designers' && s !== 'lighting'));
});

await test('a failing lookup (5xx, network error) is left out rather than risk a broken link', async () => {
  const out = await activeCategories(API, { exceptSlug: 'architects', fetchImpl: mockApi({ broken: { painting: 500, wallpaper: 'error' } }) });
  const slugs = out.map((c) => c.slug);
  assert.ok(!slugs.includes('painting') && !slugs.includes('wallpaper'));
  assert.equal(slugs.length, SERVICE_CATEGORIES.length - 3);
});

await test('all inactive -> no links at all', async () => {
  const fetchImpl = mockApi({ inactive: SERVICE_CATEGORIES.map((c) => c.slug) });
  assert.deepEqual(await activeCategories(API, { exceptSlug: 'architects', fetchImpl }), []);
});

await test('a 200 for a different slug is not trusted', async () => {
  const fetchImpl = async () => ({ status: 200, ok: true, json: async () => ({ data: { category: { slug: 'other' } } }) });
  assert.equal(await isActiveCategory(API, 'lighting', fetchImpl), false);
});

await test('lookups are the hub page\'s own request: same endpoint, cached and tagged taxonomy, fresh options per call', async () => {
  const calls = [];
  await activeCategories(API, { exceptSlug: 'architects', fetchImpl: mockApi({ calls }) });
  assert.equal(calls.length, SERVICE_CATEGORIES.length - 1);
  for (const { url, init } of calls) {
    assert.match(url, /^https:\/\/api\.example\/api\/public\/service-categories\/[a-z-]+$/);
    assert.deepEqual(init.next.tags, [TAGS.TAXONOMY]);
    assert.equal(init.next.revalidate, 300);
  }
  assert.equal(new Set(calls.map((c) => c.init)).size, calls.length);
  const hub = readFileSync(join(ROOT, 'app/(public)/[category]/page.jsx'), 'utf8');
  assert.match(hub, /\/public\/service-categories\/\$\{encodeURIComponent\(slug\)\}/, 'hub 404s on the same endpoint');
});

await test('both hub variants render OtherServices from activeCategories (no static list)', () => {
  const src = readFileSync(join(ROOT, 'app/(public)/[category]/page.jsx'), 'utf8');
  assert.match(src, /await activeCategories\(API, \{ exceptSlug: current \}\)/);
  assert.equal((src.match(/<OtherServices current=\{params\.category\} \/>/g) || []).length, 2);
  assert.doesNotMatch(src, /SERVICE_CATEGORIES/);
});

console.log(`\n${passed} passed`);
