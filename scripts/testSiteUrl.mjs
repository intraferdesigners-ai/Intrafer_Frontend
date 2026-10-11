// Run: node scripts/testSiteUrl.mjs
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeSiteUrl, absoluteUrl, SITE_URL, DEFAULT_SITE_URL } from '../lib/siteUrl.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const WWW = 'https://www.intrafer.in';
let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`ok - ${name}`); };

test('default and SITE_URL (no env) are https://www.intrafer.in', () => {
  assert.equal(DEFAULT_SITE_URL, WWW);
  assert.equal(SITE_URL, WWW);
});

test('apex → www, in every spelling', () => {
  for (const raw of [
    'https://intrafer.in', 'https://intrafer.in/', 'http://intrafer.in', 'intrafer.in',
    'https://INTRAFER.IN', 'https://intrafer.in//', 'https://intrafer.in/some/path/',
    'http://www.intrafer.in', 'www.intrafer.in', 'https://www.intrafer.in',
  ]) assert.equal(normalizeSiteUrl(raw), WWW, raw);
});

test('trailing slash, whitespace and double slashes stripped from the base', () => {
  assert.equal(normalizeSiteUrl('https://www.intrafer.in/'), WWW);
  assert.equal(normalizeSiteUrl('https://www.intrafer.in///'), WWW);
  assert.equal(normalizeSiteUrl('  https://www.intrafer.in/ \n'), WWW);
  assert.equal(normalizeSiteUrl('\thttps://intrafer.in\t'), WWW);
  assert.equal(normalizeSiteUrl('https://staging.example.com//'), 'https://staging.example.com');
  assert.equal(normalizeSiteUrl('http://localhost:3000/'), 'http://localhost:3000');
});

test('empty / missing / garbage → default', () => {
  for (const raw of [undefined, null, '', '   ', 'https://', 'not a url at all', 'ftp://intrafer.in', 'javascript:alert(1)', 42]) {
    assert.equal(normalizeSiteUrl(raw), WWW, String(raw));
  }
});

test('absoluteUrl: pages keep their trailing slash, double slashes collapse', () => {
  assert.equal(absoluteUrl('/'), `${WWW}/`);
  assert.equal(absoluteUrl(), `${WWW}/`);
  assert.equal(absoluteUrl('/vendors/abc/'), `${WWW}/vendors/abc/`);
  assert.equal(absoluteUrl('vendors/abc/'), `${WWW}/vendors/abc/`);
  assert.equal(absoluteUrl('//vendors//abc//'), `${WWW}/vendors/abc/`);
  assert.equal(absoluteUrl('/sitemap.xml'), `${WWW}/sitemap.xml`);
  assert.equal(absoluteUrl('/#organization'), `${WWW}/#organization`);
  assert.equal(absoluteUrl('/a/?next=https://x//y'), `${WWW}/a/?next=https://x//y`);
  assert.equal(absoluteUrl('/a/', 'https://intrafer.in/'), `${WWW}/a/`);
});

// SITE_URL is computed at import time, so a stale env is checked in a fresh process.
const siteUrlWithEnv = (value) => execFileSync(process.execPath, [
  '--no-warnings', '--input-type=module', '-e',
  `import { SITE_URL } from ${JSON.stringify(new URL('../lib/siteUrl.js', import.meta.url).href)}; process.stdout.write(SITE_URL);`,
], { env: { ...process.env, NEXT_PUBLIC_SITE_URL: value } }).toString();

test('a stale apex NEXT_PUBLIC_SITE_URL still yields www', () => {
  assert.equal(siteUrlWithEnv('https://intrafer.in'), WWW);
  assert.equal(siteUrlWithEnv('https://intrafer.in/'), WWW);
  assert.equal(siteUrlWithEnv(' https://www.intrafer.in/ '), WWW);
  assert.equal(siteUrlWithEnv(''), WWW);
});

// Source guard: nothing outside lib/siteUrl.js may build our host itself.
function sourceFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return sourceFiles(p);
    return /\.(m?js|jsx|ts|tsx)$/.test(name) ? [p] : [];
  });
}
const files = ['app', 'components', 'lib'].flatMap((d) => sourceFiles(join(ROOT, d)))
  .map((p) => ({ rel: relative(ROOT, p), src: readFileSync(p, 'utf8') }))
  .filter((f) => f.rel !== join('lib', 'siteUrl.js'));

test('no hardcoded intrafer.in URL (apex or www) outside lib/siteUrl.js', () => {
  const hits = files.filter((f) => /https?:\/\/(www\.)?intrafer\.in/i.test(f.src)).map((f) => f.rel);
  assert.deepEqual(hits, []);
  const localConsts = files.filter((f) => /const\s+(SITE_URL|baseUrl|BASE_URL)\s*=\s*['"`]/.test(f.src)).map((f) => f.rel);
  assert.deepEqual(localConsts, []);
});

test('every canonical is built from SITE_URL or is a relative path (resolved against metadataBase)', () => {
  const bad = [];
  for (const f of files) {
    for (const m of f.src.matchAll(/canonical:\s*([^\n]+)/g)) {
      if (!/^(`\$\{SITE_URL\}\/|'\/|absoluteUrl\()/.test(m[1].trim())) bad.push(`${f.rel}: ${m[1].trim()}`);
    }
  }
  assert.deepEqual(bad, []);
});

test('sitemap, robots and metadataBase all come from lib/siteUrl', () => {
  const src = (rel) => files.find((f) => f.rel === rel).src;
  assert.match(src('app/sitemap.js'), /from '@\/lib\/siteUrl'/);
  assert.match(src('app/sitemap.js'), /const baseUrl = SITE_URL;/);
  assert.match(src('app/robots.js'), /sitemap: absoluteUrl\('\/sitemap\.xml'\)/);
  assert.match(src('app/layout.jsx'), /metadataBase: new URL\(SITE_URL\)/);
});

console.log(`\n${passed} passed`);
