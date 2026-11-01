// Run: node scripts/testSiteVerification.mjs
// Google Search Console verification: the token lives only in
// lib/siteConfig.js; the root layout's metadata emits it, so the homepage
// (and every page) gets <meta name="google-site-verification">; no other
// metadata export sets `verification` (a child's would replace the root's
// object). The live counterpart is scripts/checkSeoHost.mjs, which asserts
// the tag appears exactly once, with this token, on every page it checks.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GOOGLE_SITE_VERIFICATION } from '../lib/siteConfig.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`ok - ${name}`); };
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(jsx?|mjs)$/.test(name)) out.push(p);
  }
  return out;
}
const FILES = ['app', 'components', 'lib'].flatMap((d) => walk(join(ROOT, d)))
  .map((p) => ({ path: relative(ROOT, p), src: readFileSync(p, 'utf8') }));
const layout = FILES.find((f) => f.path === 'app/layout.jsx').src;

test('the token is the Search Console token, defined once in lib/siteConfig.js', () => {
  assert.equal(GOOGLE_SITE_VERIFICATION, 'Y2CwC31z7JF7KPH0wDX-xfvI_wfqk83CSr4LusOJkyw');
  assert.deepEqual(FILES.filter((f) => f.src.includes(GOOGLE_SITE_VERIFICATION)).map((f) => f.path), ['lib/siteConfig.js']);
});

test('the root layout (homepage and every page) emits verification.google from siteConfig', () => {
  const metadata = layout.slice(layout.indexOf('export const metadata = {'), layout.indexOf('\n};', layout.indexOf('export const metadata = {')));
  assert.match(metadata, /verification: \{ google: GOOGLE_SITE_VERIFICATION \}/);
  assert.match(layout, /import \{ GOOGLE_SITE_VERIFICATION \} from '\.\.\/lib\/siteConfig';/);
  // The homepage has no layout of its own between it and the root.
  assert.doesNotMatch(FILES.find((f) => f.path === 'app/page.jsx').src, /verification\s*:/);
});

test('no other metadata sets verification (it would replace the root one)', () => {
  assert.deepEqual(FILES.filter((f) => f.path !== 'app/layout.jsx' && /\bverification\s*:\s*\{/.test(f.src)).map((f) => f.path), []);
  assert.deepEqual(FILES.filter((f) => /google-site-verification/.test(f.src)).map((f) => f.path), []);
});

console.log(`\n${passed} passed`);
