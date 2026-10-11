// Run: node scripts/testRevalidateRoute.mjs
// POST /api/revalidate (lib/revalidateRequest.js) with injected
// revalidateTag/revalidatePath: auth, body validation and limits. Also pins
// the cache tag constants.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRevalidateHandler, parseRevalidateBody, secretMatches, LIMITS } from '../lib/revalidateRequest.js';
import { TAGS, TAG_PREFIXES, vendorTag, projectTag, LIST_WINDOW, DETAIL_WINDOW } from '../lib/cacheTags.js';

const SECRET = 'test-only-secret-not-real';
let passed = 0;
const test = async (name, fn) => { await fn(); passed += 1; console.log(`ok - ${name}`); };

// handler() -> the real secret; handler(undefined) -> env var missing.
function handler(...args) {
  const secret = args.length ? args[0] : SECRET;
  const calls = { tags: [], paths: [] };
  const POST = createRevalidateHandler({
    revalidateTag: (t) => calls.tags.push(t),
    revalidatePath: (p) => calls.paths.push(p),
    getSecret: () => secret,
  });
  return { POST, calls };
}
const req = (body, headers = { 'x-revalidate-secret': SECRET }) => new Request('http://localhost/api/revalidate/', {
  method: 'POST',
  headers: { 'content-type': 'application/json', ...headers },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});

await test('tag constants are exactly the agreed set', () => {
  assert.deepEqual(Object.values(TAGS).sort(), ['homepage', 'landing', 'projects', 'reviews', 'stats', 'taxonomy', 'vendors']);
  assert.deepEqual(TAG_PREFIXES, { VENDOR: 'vendor:', PROJECT: 'project:' });
  assert.equal(vendorTag('abc'), 'vendor:abc');
  assert.equal(projectTag('p1'), 'project:p1');
  assert.equal(LIST_WINDOW, 300);
  assert.equal(DETAIL_WINDOW, 900);
});

await test('right secret + valid body: revalidates every tag and path, 200 { ok, tags, paths }, no-store + noindex', async () => {
  const { POST, calls } = handler();
  const res = await POST(req({ tags: ['vendors', 'vendor:6acb0000000000000000000a', 'project:x_y-1'], paths: ['/interior-designers/goa/'] }));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, tags: ['vendors', 'vendor:6acb0000000000000000000a', 'project:x_y-1'], paths: ['/interior-designers/goa/'] });
  assert.deepEqual(calls, { tags: ['vendors', 'vendor:6acb0000000000000000000a', 'project:x_y-1'], paths: ['/interior-designers/goa/'] });
  assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.equal(res.headers.get('x-robots-tag'), 'noindex');
});

await test('paths are optional', async () => {
  const { POST, calls } = handler();
  const res = await POST(req({ tags: ['stats'] }));
  assert.deepEqual(await res.json(), { ok: true, tags: ['stats'], paths: [] });
  assert.deepEqual(calls.paths, []);
});

await test('401 with an empty body: missing header, wrong secret, wrong-length secret, missing env, empty env', async () => {
  for (const [secret, headers] of [
    [SECRET, {}],
    [SECRET, { 'x-revalidate-secret': 'wrong' }],
    [SECRET, { 'x-revalidate-secret': `${SECRET}x` }],
    [SECRET, { 'x-revalidate-secret': '' }],
    [undefined, { 'x-revalidate-secret': SECRET }],
    ['', { 'x-revalidate-secret': '' }],
  ]) {
    const { POST, calls } = handler(secret);
    const res = await POST(req({ tags: ['vendors'] }, headers));
    assert.equal(res.status, 401);
    assert.equal(await res.text(), '');
    assert.deepEqual(calls, { tags: [], paths: [] });
  }
});

await test('auth is checked before the body: a bad body with a wrong secret is still 401', async () => {
  const { POST } = handler();
  assert.equal((await POST(req('{not json', { 'x-revalidate-secret': 'nope' }))).status, 401);
});

await test('400 for bad bodies, and nothing is revalidated', async () => {
  const bad = [
    '{not json', '', 'null', '[]', '"tags"',
    {}, { tags: 'vendors' }, { tags: [] }, { tags: [], paths: [] }, { paths: ['/a/'] },
    { tags: ['vendors'], extra: 1 },
    { tags: ['Vendors'] }, { tags: ['vendors '] }, { tags: ['a/b'] }, { tags: ['vendor:<id>'] }, { tags: [''] }, { tags: [1] }, { tags: [null] },
    { tags: ['x'.repeat(LIMITS.MAX_TAG_LENGTH + 1)] },
    { tags: Array.from({ length: LIMITS.MAX_TAGS + 1 }, (_, i) => `t${i}`) },
    { tags: ['vendors'], paths: 'x' }, { tags: ['vendors'], paths: ['no-slash'] }, { tags: ['vendors'], paths: ['/has space/'] },
    { tags: ['vendors'], paths: [`/${'a'.repeat(LIMITS.MAX_PATH_LENGTH)}`] },
    { tags: ['vendors'], paths: Array.from({ length: LIMITS.MAX_PATHS + 1 }, (_, i) => `/p${i}/`) },
    JSON.stringify({ tags: ['vendors'], paths: ['/a/'], pad: 'x'.repeat(LIMITS.MAX_BODY_BYTES) }),
  ];
  for (const body of bad) {
    const { POST, calls } = handler();
    const res = await POST(req(body));
    assert.equal(res.status, 400, JSON.stringify(body).slice(0, 60));
    assert.deepEqual(calls, { tags: [], paths: [] });
  }
});

await test('limits are inclusive: exactly 20 tags of 80 chars and 10 paths of 200 chars are accepted', async () => {
  const tags = Array.from({ length: LIMITS.MAX_TAGS }, (_, i) => `t${i}`.padEnd(LIMITS.MAX_TAG_LENGTH, 'x'));
  const paths = Array.from({ length: LIMITS.MAX_PATHS }, (_, i) => `/${i}`.padEnd(LIMITS.MAX_PATH_LENGTH, 'y'));
  assert.deepEqual(parseRevalidateBody({ tags, paths }), { tags, paths });
});

await test('secretMatches: constant-time compare semantics', () => {
  assert.equal(secretMatches(SECRET, SECRET), true);
  for (const [g, e] of [['a', 'b'], ['', SECRET], [SECRET, ''], [undefined, SECRET], [SECRET, undefined], [null, null], [SECRET.slice(1), SECRET]]) {
    assert.equal(secretMatches(g, e), false);
  }
});

await test('the route file: POST only, force-dynamic, secret from REVALIDATE_SECRET', () => {
  const src = readFileSync(new URL('../app/api/revalidate/route.js', import.meta.url), 'utf8');
  assert.match(src, /export const dynamic = 'force-dynamic';/);
  assert.match(src, /export const POST = createRevalidateHandler\(/);
  assert.match(src, /getSecret: \(\) => process\.env\.REVALIDATE_SECRET/);
  assert.doesNotMatch(src, /export (const|async function|function) (GET|PUT|PATCH|DELETE|HEAD)\b/);
  assert.doesNotMatch(src, /export const revalidate/);
});

console.log(`\n${passed} passed`);
