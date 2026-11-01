// Run: node scripts/testCompanyEmail.mjs
// One company email everywhere: every email address a page can show (text
// or mailto:) is the Organization / ContactPoint email in the JSON-LD —
// lib/siteConfig.js SUPPORT_EMAIL. Exceptions: designer profiles show each
// designer's own business/account email, and the vendor dashboard shows a
// lead's email; form placeholders (placeholder="you@...") are hints, not
// addresses shown. The live counterpart is checkStructuredData.mjs, which
// compares each rendered page's emails with its Organization JSON-LD.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUPPORT_EMAIL } from '../lib/siteConfig.js';
import { organizationJsonLd } from '../lib/structuredData.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`ok - ${name}`); };
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(jsx?|mjs|md|json)$/.test(name)) out.push(p);
  }
  return out;
}
const FILES = ['app', 'components', 'lib', 'public'].flatMap((d) => walk(join(ROOT, d)))
  .map((p) => ({ path: relative(ROOT, p), src: readFileSync(p, 'utf8') }));
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[a-z]{2,}/g;

test('the schema email is SUPPORT_EMAIL (Organization and its ContactPoint)', () => {
  const org = organizationJsonLd();
  assert.equal(org.email, SUPPORT_EMAIL);
  assert.equal(org.contactPoint[0].email, SUPPORT_EMAIL);
});

test('lib/siteConfig.js holds exactly one email address', () => {
  const src = FILES.find((f) => f.path === 'lib/siteConfig.js').src.replace(/^\s*\/\/.*$/gm, '');
  assert.deepEqual([...new Set(src.match(EMAIL))], [SUPPORT_EMAIL]);
});

test('no other email address is written anywhere a page could show it (placeholders excepted)', () => {
  const hits = [];
  for (const f of FILES) {
    if (f.path === 'lib/siteConfig.js') continue;
    const code = f.src.replace(/placeholder=(["'])[^"']*\1/g, '').replace(/placeholder:\s*(["'])[^"']*\1/g, '');
    for (const m of code.matchAll(EMAIL)) {
      if (m[0].endsWith('.test')) continue;
      hits.push(`${f.path}:${code.slice(0, m.index).split('\n').length}: ${m[0]}`);
    }
  }
  assert.deepEqual(hits, []);
});

// mailto: links may only target SUPPORT_EMAIL or the per-record addresses.
const ALLOWED_MAILTO = ['SUPPORT_EMAIL', 'vendorContactEmail', 'lead.contactEmail'];

test('every mailto: link targets SUPPORT_EMAIL (designer/lead emails excepted)', () => {
  const bad = [];
  for (const f of FILES) {
    for (const m of f.src.matchAll(/mailto:(\$\{([^}]+)\}|[^`'"\s)]*)/g)) {
      const target = m[2]?.trim();
      if (target && ALLOWED_MAILTO.includes(target)) continue;
      if (f.path === 'components/ui/RouteProgressBar.jsx' || f.path === 'components/seo/LandingMarkdown.jsx') continue; // scheme checks, not links
      bad.push(`${f.path}: mailto:${m[1]}`);
    }
  }
  assert.deepEqual(bad, []);
});

test('the contact page shows SUPPORT_EMAIL as a mailto link; legal pages show SUPPORT_EMAIL', () => {
  const contact = FILES.find((f) => f.path === 'app/(public)/contact/page.jsx').src;
  assert.match(contact, /value: SUPPORT_EMAIL, href: `mailto:\$\{SUPPORT_EMAIL\}`/);
  for (const p of ['app/(public)/privacy/page.jsx', 'app/(public)/terms/page.jsx', 'app/(vendor-site)/for-designers/privacy/page.jsx', 'app/(vendor-site)/for-designers/terms/page.jsx']) {
    assert.match(FILES.find((f) => f.path === p).src, /\{SUPPORT_EMAIL\}/, p);
  }
});

console.log(`\n${passed} passed`);
