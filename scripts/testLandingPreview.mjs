// Run: node scripts/testLandingPreview.mjs
// Admin landing-page preview via draft mode: path validation (no open
// redirects), the entry route (token checked by the backend, cookies, no
// token in the redirect, no-store/no-referrer/noindex), the exit route,
// cachedJson's error semantics, and that nothing outside the entry route
// reads ?preview= any more.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseLandingPath, landingQuery } from '../lib/landingPath.js';
import {
  createPreviewEntry, createPreviewExit, secondsLeft, PREVIEW_COOKIE, DRAFT_COOKIE, MAX_PREVIEW_SECONDS, PREVIEW_HEADERS,
} from '../lib/landingPreviewEntry.js';
import { cachedJson } from '../lib/cachedFetch.js';

let passed = 0;
const test = async (name, fn) => { await fn(); passed += 1; console.log(`ok - ${name}`); };

// A JWT-shaped token whose payload has `exp` (signature irrelevant here:
// the backend is mocked and is what verifies it).
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const token = (expInSec = 1200) => `${b64({ alg: 'HS256' })}.${b64({ purpose: 'landing-preview', lp: 'x', exp: Math.floor(Date.now() / 1000) + expInSec })}.sig`;

// Fake Next: a cookie jar and draftMode() that, like Next, sets its cookie on path "/".
function next() {
  const jar = new Map();
  const cookies = () => ({
    get: (n) => (jar.has(n) ? { name: n, value: jar.get(n).value } : undefined),
    set: (n, value, options = {}) => jar.set(n, { value, ...options }),
  });
  const draft = { enabled: false };
  const draftMode = () => ({
    enable() { draft.enabled = true; jar.set(DRAFT_COOKIE, { value: 'per-build-bypass-id', path: '/', httpOnly: true, sameSite: 'none', secure: true }); },
    disable() { draft.enabled = false; jar.set(DRAFT_COOKIE, { value: '', path: '/', maxAge: 0 }); },
  });
  return { jar, cookies, draftMode, draft };
}

// Mock backend: answers preview:true only for `validToken` on `validPath`'s query.
function backend({ validToken, validQuery, status = 200, throws = false }) {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    if (throws) throw new Error('down');
    const u = new URL(url);
    const preview = u.searchParams.get('preview');
    u.searchParams.delete('preview');
    const ok = preview === validToken && u.searchParams.toString() === validQuery;
    return { ok: status === 200, status, json: async () => ({ data: { page: {}, ...(ok && { preview: true }) } }) };
  };
  return { fetchImpl, calls };
}

const API = 'http://api.test/api';
const PUNE = '/interior-designers/maharashtra/pune/';
const PUNE_QUERY = 'category=interior-designers&state=maharashtra&city=pune';
const entryReq = (qs, proto = 'https') => new Request(`${proto}://www.intrafer.test/api/landing-preview/?${qs}`);
const qs = (o) => new URLSearchParams(o).toString();

function expectPreviewHeaders(res) {
  for (const [k, v] of Object.entries(PREVIEW_HEADERS)) assert.equal(res.headers.get(k), v, k);
}

await test('parseLandingPath: the three landing shapes, rebuilt from the slugs', () => {
  assert.deepEqual(parseLandingPath('/interior-designers/'), { category: 'interior-designers', state: null, city: null, path: '/interior-designers/' });
  assert.deepEqual(parseLandingPath('/interior-designers/maharashtra/'), { category: 'interior-designers', state: 'maharashtra', city: null, path: '/interior-designers/maharashtra/' });
  assert.deepEqual(parseLandingPath(PUNE), { category: 'interior-designers', state: 'maharashtra', city: 'pune', path: PUNE });
  assert.equal(landingQuery(parseLandingPath(PUNE), 't'), `${PUNE_QUERY}&preview=t`);
  assert.equal(landingQuery(parseLandingPath('/architects/')), 'category=architects');
});

await test('parseLandingPath rejects open-redirect and malformed paths', () => {
  for (const bad of [
    '//evil.com', '//evil.com/', '\\\\evil.com', '/\\evil.com/', '\\/evil.com/', 'https://evil.com/', 'http:/evil.com/', 'evil.com/a/',
    '/%2F%2Fevil.com/', '/a%2Fb/', '/a/../b/', '/./a/', '/a//b/', '/a/b/c/d/', '/a', '/a/b', '', '/', '//', '/A/', '/a b/', '/a/\n/',
    '/a-/', '/-a/', '/a--b/', '/api/landing-preview/', '/_next/x/', '/a/b/?x=1', '/a/#x', ' /a/', `/${'a'.repeat(250)}/`, null, undefined, 42, ['/a/'],
  ]) assert.equal(parseLandingPath(bad), null, JSON.stringify(bad));
});

await test('entry, valid token: draft mode + both cookies limited to the page and the token life; 307 to the page without the token', async () => {
  const n = next();
  const t = token(1200);
  const { fetchImpl, calls } = backend({ validToken: t, validQuery: PUNE_QUERY });
  const GET = createPreviewEntry({ api: API, fetchImpl, draftMode: n.draftMode, cookies: n.cookies });
  const res = await GET(entryReq(qs({ path: PUNE, token: t })));
  assert.equal(res.status, 307);
  assert.equal(res.headers.get('location'), PUNE);
  assert.ok(!res.headers.get('location').includes(t));
  expectPreviewHeaders(res);
  assert.equal(n.draft.enabled, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, `${API}/public/landing-page?${PUNE_QUERY}&preview=${t}`);
  assert.deepEqual(calls[0].options, { cache: 'no-store' });
  const bypass = n.jar.get(DRAFT_COOKIE);
  const preview = n.jar.get(PREVIEW_COOKIE);
  assert.deepEqual({ ...bypass, maxAge: undefined }, { value: 'per-build-bypass-id', path: PUNE, maxAge: undefined, httpOnly: true, sameSite: 'lax', secure: true });
  assert.ok(bypass.maxAge > 1190 && bypass.maxAge <= 1200, String(bypass.maxAge));
  assert.deepEqual({ ...preview, maxAge: undefined }, { value: t, path: PUNE, maxAge: undefined, httpOnly: true, sameSite: 'lax', secure: true });
  assert.equal(preview.maxAge, bypass.maxAge);
});

await test('entry over plain http (local): same, but cookies not Secure', async () => {
  const n = next();
  const t = token();
  const GET = createPreviewEntry({ api: API, ...backend({ validToken: t, validQuery: PUNE_QUERY }), draftMode: n.draftMode, cookies: n.cookies });
  await GET(entryReq(qs({ path: PUNE, token: t }), 'http'));
  assert.equal(n.jar.get(PREVIEW_COOKIE).secure, false);
});

await test('cookie life never exceeds 30 min, even if a token claims more', async () => {
  assert.equal(secondsLeft(token(99999)), MAX_PREVIEW_SECONDS);
  assert.equal(secondsLeft(token(-50)), 1);
  assert.equal(secondsLeft('garbage'), MAX_PREVIEW_SECONDS);
  assert.ok(Math.abs(secondsLeft(token(600)) - 600) <= 1);
});

await test('entry, hubs: state and category paths are checked against their own query', async () => {
  for (const [path, query] of [['/interior-designers/maharashtra/', 'category=interior-designers&state=maharashtra'], ['/architects/', 'category=architects']]) {
    const n = next();
    const t = token();
    const GET = createPreviewEntry({ api: API, ...backend({ validToken: t, validQuery: query }), draftMode: n.draftMode, cookies: n.cookies });
    const res = await GET(entryReq(qs({ path, token: t })));
    assert.equal(res.headers.get('location'), path);
    assert.equal(n.draft.enabled, true, path);
  }
});

await test('entry: old ?preview= alias (via the next.config.js redirect) works the same', async () => {
  const n = next();
  const t = token();
  const GET = createPreviewEntry({ api: API, ...backend({ validToken: t, validQuery: PUNE_QUERY }), draftMode: n.draftMode, cookies: n.cookies });
  const res = await GET(entryReq(qs({ path: PUNE, preview: t })));
  assert.equal(res.headers.get('location'), PUNE);
  assert.equal(n.draft.enabled, true);
});

await test('entry, token NOT accepted (expired, another page\'s, garbage, missing, backend error/down): no cookies, 307 to the public page', async () => {
  const t = token();
  const cases = [
    ['expired / invalid (backend says no preview)', { token: token(-10) }, backend({ validToken: t, validQuery: PUNE_QUERY })],
    ['another page\'s token', { token: t }, backend({ validToken: t, validQuery: 'category=interior-designers&state=maharashtra&city=nashik' })],
    ['garbage', { token: 'not-a-jwt' }, backend({ validToken: t, validQuery: PUNE_QUERY })],
    ['missing token', {}, backend({ validToken: t, validQuery: PUNE_QUERY })],
    ['oversized token', { token: 'x'.repeat(3000) }, backend({ validToken: t, validQuery: PUNE_QUERY })],
    ['backend 500', { token: t }, backend({ validToken: t, validQuery: PUNE_QUERY, status: 500 })],
    ['backend down', { token: t }, backend({ validToken: t, validQuery: PUNE_QUERY, throws: true })],
  ];
  for (const [label, params, be] of cases) {
    const n = next();
    const GET = createPreviewEntry({ api: API, fetchImpl: be.fetchImpl, draftMode: n.draftMode, cookies: n.cookies });
    const res = await GET(entryReq(qs({ path: PUNE, ...params })));
    assert.equal(res.status, 307, label);
    assert.equal(res.headers.get('location'), PUNE, label);
    expectPreviewHeaders(res);
    assert.equal(n.draft.enabled, false, label);
    assert.equal(n.jar.size, 0, label);
  }
});

await test('entry, bad/missing path or open-redirect attempt: 400, backend never called, no cookies', async () => {
  for (const path of [undefined, '', '//evil.com', '\\\\evil.com', 'https://evil.com/', '/%2F%2Fevil.com/', '/a/../b/', '/a/b/c/d/']) {
    const n = next();
    const be = backend({ validToken: 't', validQuery: PUNE_QUERY });
    const GET = createPreviewEntry({ api: API, fetchImpl: be.fetchImpl, draftMode: n.draftMode, cookies: n.cookies });
    const res = await GET(entryReq(qs(path === undefined ? { token: 't' } : { path, token: 't' })));
    assert.equal(res.status, 400, String(path));
    assert.equal(res.headers.get('location'), null);
    expectPreviewHeaders(res);
    assert.equal(be.calls.length, 0);
    assert.equal(n.jar.size, 0);
  }
});

await test('exit: clears both cookies on the page path (and Next\'s "/" one), 307 to the page; bad path -> "/"', async () => {
  const n = next();
  const GET = createPreviewExit({ draftMode: n.draftMode, cookies: n.cookies });
  const res = await GET(entryReq(qs({ path: PUNE })));
  assert.equal(res.status, 307);
  assert.equal(res.headers.get('location'), PUNE);
  expectPreviewHeaders(res);
  assert.equal(n.jar.get(PREVIEW_COOKIE).maxAge, 0);
  assert.equal(n.jar.get(PREVIEW_COOKIE).path, PUNE);
  assert.equal(n.jar.get(DRAFT_COOKIE).maxAge, 0);
  const bad = await createPreviewExit({ draftMode: next().draftMode, cookies: next().cookies })(entryReq(qs({ path: '//evil.com' })));
  assert.equal(bad.headers.get('location'), '/');
});

await test('cachedJson: a 500 or network error throws (never a cached 404 / fallback); 404 -> null only with nullOn404', async () => {
  const realFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ ok: false, status: 500, json: async () => ({}) });
    await assert.rejects(cachedJson('http://api.test/api/public/vendors?x', { revalidate: 300, tags: ['vendors'], nullOn404: true }), /failed: 500/);
    globalThis.fetch = async () => { throw new Error('ECONNREFUSED'); };
    await assert.rejects(cachedJson('http://api.test/x', { revalidate: 300, tags: [], nullOn404: true }), /ECONNREFUSED/);
    globalThis.fetch = async () => ({ ok: false, status: 404, json: async () => ({}) });
    assert.equal(await cachedJson('http://api.test/x', { revalidate: 300, tags: [], nullOn404: true }), null);
    await assert.rejects(cachedJson('http://api.test/x', { revalidate: 300, tags: [] }), /failed: 404/);
  } finally {
    globalThis.fetch = realFetch;
  }
});

await test('city page: vendors fetch is cachedJson(nullOn404) and only a null result reaches notFound()', () => {
  const src = readFileSync(new URL('../app/(public)/[category]/[state]/[city]/page.jsx', import.meta.url), 'utf8');
  const fn = src.slice(src.indexOf('async function fetchVendors('), src.indexOf('\n}\n', src.indexOf('async function fetchVendors(')));
  assert.match(fn, /cachedJson\(/);
  assert.match(fn, /nullOn404: true/);
  assert.doesNotMatch(fn, /try \{|catch/);
  assert.match(src, /if \(!data\) notFound\(\);/);
});

const LANDING_SOURCES = [
  'app/(public)/[category]/page.jsx', 'app/(public)/[category]/[state]/page.jsx', 'app/(public)/[category]/[state]/[city]/page.jsx',
  'lib/landingHub.js', 'lib/landingDraft.js', 'components/seo/LandingPreviewStrip.jsx', 'components/seo/LandingAuthored.jsx', 'components/ui/LeadCapturePopup.jsx',
];

await test('no landing-page source reads searchParams / ?preview= any more (only the entry route does)', () => {
  for (const f of LANDING_SOURCES) {
    const src = readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
    assert.doesNotMatch(src, /searchParams|useSearchParams|previewToken\(|\.preview\b(?! === true)|get\('preview'\)|has\('preview'\)/, f);
  }
  const entry = readFileSync(new URL('../lib/landingPreviewEntry.js', import.meta.url), 'utf8');
  assert.match(entry, /searchParams\.get\('preview'\)/);
});

await test('the preview routes never log: no console calls, force-dynamic, GET only', () => {
  for (const f of ['lib/landingPreviewEntry.js', 'lib/landingPath.js', 'lib/landingDraft.js', 'app/api/landing-preview/route.js', 'app/api/landing-preview/exit/route.js']) {
    assert.doesNotMatch(readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'), /console\./, f);
  }
  for (const f of ['app/api/landing-preview/route.js', 'app/api/landing-preview/exit/route.js']) {
    const src = readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
    assert.match(src, /export const dynamic = 'force-dynamic';/);
    assert.doesNotMatch(src, /export (const|async function|function) (POST|PUT|PATCH|DELETE)\b/);
  }
});

await test('draft content is gated on draft mode: the token cookie is read only when draftMode().isEnabled', () => {
  const src = readFileSync(new URL('../lib/landingDraft.js', import.meta.url), 'utf8');
  assert.match(src, /if \(!draftMode\(\)\.isEnabled\) return null;\n  return cookies\(\)\.get\(PREVIEW_COOKIE\)\?\.value \|\| null;/);
});

await test('next.config.js: old ?preview= links on landing paths go to the entry route; never the entry route itself', async () => {
  const { createRequire } = await import('node:module');
  const require = createRequire(import.meta.url);
  const { pathToRegexp } = require('next/dist/compiled/path-to-regexp');
  const config = require('../next.config.js');
  const rules = (await config.redirects()).filter((r) => r.has?.[0]?.key === 'preview');
  assert.equal(rules.length, 3);
  const matches = (path) => rules.filter((r) => pathToRegexp(r.source, [], { strict: true }).test(path));
  for (const path of ['/interior-designers/', '/interior-designers/maharashtra/', '/interior-designers/maharashtra/pune/']) {
    const hit = matches(path);
    assert.equal(hit.length, 1, path);
    assert.equal(hit[0].permanent, false);
    assert.match(hit[0].destination, /^\/api\/landing-preview\/\?path=\//);
  }
  for (const path of ['/api/landing-preview/', '/api/landing-preview/exit/', '/api/revalidate/', '/_next/static/x/', '/api/', '/a/b/c/d/']) {
    assert.deepEqual(matches(path), [], path);
  }
});

console.log(`\n${passed} passed`);
