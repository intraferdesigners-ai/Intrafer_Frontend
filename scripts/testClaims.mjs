// Run: node scripts/testClaims.mjs
// Unsupported marketing claims stay out of the source: (1) none of the
// hardcoded figures/ratings/promises removed in the claims audit come back,
// and stats never fall back to a literal number; (2) any JSON-LD
// AggregateRating is built only from a vendor's stored rating/reviewCount
// (recomputed from Review documents in the backend's review.controller.js),
// guarded so an unrated vendor gets none — never a literal, and never on the
// sitewide Organization/WebSite entities.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SOURCE_DIRS = ['app', 'components', 'lib', 'context', 'store'];
const SOURCE_EXT = /\.(jsx?|tsx?|mjs|json|mdx?)$/;

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const name of entries) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (SOURCE_EXT.test(name)) out.push(p);
  }
  return out;
}

const FILES = SOURCE_DIRS.flatMap((d) => walk(join(ROOT, d)))
  .map((p) => ({ path: relative(ROOT, p), src: readFileSync(p, 'utf8') }));

let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`ok - ${name}`); };

// Exact strings removed in the claims audit.
const DENYLIST = [
  '4.9★ average rating',
  '48h response guarantee',
  '500+ verified designers',
  'Join 1,200+ homeowners',
  'Join 500+ verified designers',
  "value: '500+'",
  "value: '4.8★'",
  "value: '1200+'",
  "useState('4.8')",
  "'4.9★'",
  "value: '48h'",
  '★ 4.9',
  'Priya Design Studio',
  'India&apos;s most trusted',
  'Find the best interior designers',
  'Top-rated interior designers in Mumbai',
  "Pune\\'s best interior designers",
  '>★★★★★<',
];

// A stats field falling back to a made-up figure, e.g.
// `statsData?.vendorCount ?? 8` or `avgRating ?? '4.8'` (a 0 default is fine).
const STAT_FALLBACK = /\b(vendorCount|projectCount|enquiryCount|avgRating|reviewCount)\s*(\?\?|\|\|)\s*['"`]?[1-9]/;

test('no removed claim string appears in any source file', () => {
  const hits = [];
  for (const { path, src } of FILES) {
    for (const s of DENYLIST) if (src.includes(s)) hits.push(`${path}: ${s}`);
  }
  assert.deepEqual(hits, []);
});

test('no stat falls back to a literal number', () => {
  const hits = FILES.filter(({ src }) => STAT_FALLBACK.test(src))
    .map(({ path, src }) => `${path}: ${src.match(STAT_FALLBACK)[0]}`);
  assert.deepEqual(hits, []);
});

// ── JSON-LD ratings ──
// Every AggregateRating literal must read ratingValue/reviewCount from a
// stored `<x>.rating` / `<x>.reviewCount` and sit behind a
// `<x>.rating > 0 && <x>.reviewCount > 0` guard just before it. Any other
// ratingValue, any schema.org Review, or a rating on the sitewide entities
// fails.
function ratingProblems(path, src) {
  const problems = [];
  const literals = [...src.matchAll(/['"]@type['"]\s*:\s*['"]AggregateRating['"][^}]*\}/g)];
  for (const m of literals) {
    const body = m[0];
    const value = body.match(/ratingValue\s*:\s*([^,}\s]+)/)?.[1];
    const count = body.match(/reviewCount\s*:\s*([^,}\s]+)/)?.[1];
    const v = value?.match(/^([A-Za-z_$][\w$]*)\.rating$/);
    const c = count?.match(/^([A-Za-z_$][\w$]*)\.reviewCount$/);
    if (!v || !c || v[1] !== c[1]) {
      problems.push(`${path}: AggregateRating not built from stored x.rating/x.reviewCount (${value}, ${count})`);
      continue;
    }
    const before = src.slice(Math.max(0, m.index - 300), m.index);
    const x = v[1].replace(/\$/g, '\\$');
    const guard = new RegExp(`${x}\\.rating\\s*>\\s*0\\s*&&\\s*${x}\\.reviewCount\\s*>\\s*0`);
    if (!guard.test(before)) problems.push(`${path}: AggregateRating for ${v[1]} not guarded by rating > 0 && reviewCount > 0`);
  }
  const ratingValues = (src.match(/ratingValue\s*:/g) || []).length;
  if (ratingValues !== literals.length) problems.push(`${path}: ratingValue outside an AggregateRating literal`);
  if (/['"]@type['"]\s*:\s*['"]Review['"]/.test(src)) problems.push(`${path}: schema.org Review markup`);
  if (/aggregateRating/i.test(src) && /['"]@type['"]\s*:\s*['"](Organization|WebSite)['"]/.test(src)) {
    problems.push(`${path}: rating alongside Organization/WebSite JSON-LD`);
  }
  return problems;
}

test('rating checker rejects made-up and unguarded ratings (self-test)', () => {
  const bad = [
    "const ld = { '@type': 'Organization', aggregateRating: { '@type': 'AggregateRating', ratingValue: 4.8, reviewCount: 120 } };",
    "const r = { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: total };",
    "const r = { '@type': 'AggregateRating', ratingValue: v.rating, reviewCount: v.reviewCount };",
    "const r = { ratingValue: stats.avgRating };",
    "const r = { '@type': 'Review', reviewRating: 5 };",
  ];
  for (const src of bad) assert.notDeepEqual(ratingProblems('sample', src), [], src);
  const good = "const a = v.rating > 0 && v.reviewCount > 0\n  ? { '@type': 'AggregateRating', ratingValue: v.rating, reviewCount: v.reviewCount }\n  : undefined;";
  assert.deepEqual(ratingProblems('sample', good), []);
});

test('every JSON-LD rating in the repo comes from stored review data', () => {
  assert.deepEqual(FILES.flatMap(({ path, src }) => ratingProblems(path, src)), []);
});

test('sitewide Organization/WebSite JSON-LD carries no rating', () => {
  const layout = readFileSync(join(ROOT, 'app/layout.jsx'), 'utf8');
  assert.doesNotMatch(layout, /aggregateRating|ratingValue|reviewCount/i);
});

console.log(`\n${passed} passed`);
