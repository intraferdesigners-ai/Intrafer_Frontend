// Run: node scripts/testPlanPrices.mjs
// Subscription prices have one source of truth: the backend's plans table
// (Intrafer_Backend/src/config/plans.js), served by GET /subscriptions/plans.
// (1) No frontend file holds an old price (₹5,999 / ₹14,999 / ₹19,999, in
//     rupees or paise) unless that line is marked `legacy-price-fixture`.
// (2) No frontend file hardcodes a current price either, nor a plan table
//     with prices — every page that shows or charges a price reads the API.
// (3) Claims that the current prices make false stay out of the plan pages.
// (4) The lib/plans.js display helpers, incl. the older API shape.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cheapestPlan, planLabel, planPeriod, sortPlans, termList } from '../lib/plans.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SELF = 'scripts/testPlanPrices.mjs';
const SOURCE_DIRS = ['app', 'components', 'lib', 'context', 'store', 'public', 'scripts'];
const ROOT_FILES = ['middleware.js', 'next.config.js', 'vercel.json', 'README.md'];
const SOURCE_EXT = /\.(jsx?|tsx?|mjs|cjs|json|mdx?|txt|html|xml)$/;
const posix = (p) => p.split(sep).join('/');

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

const FILES = [...SOURCE_DIRS.flatMap((d) => walk(join(ROOT, d))), ...ROOT_FILES.map((f) => join(ROOT, f))]
  .filter((p) => { try { return statSync(p).isFile(); } catch { return false; } })
  .map((p) => ({ path: posix(relative(ROOT, p)), src: readFileSync(p, 'utf8') }))
  .filter((f) => f.path !== SELF);

let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`ok - ${name}`); };

// Number not embedded in a longer number (so 15999 or 5,9990 don't count).
const amount = (digits) => new RegExp(`(?<![\\d,.])${digits}(?![\\d,])`);
// Old prices: 5,999 / 5999, 14,999 / 14999, 19,999 / 19999, and paise.
const OLD = ['5,?999', '14,?999', '19,?999', '599900', '1499900', '1999900'].map(amount);
// Current prices: hardcoding them would make a second source of truth.
const CURRENT = ['1,?999', '3,?999', '7,?999', '199900', '399900', '799900'].map(amount);

const hits = (patterns) => FILES.flatMap(({ path, src }) => src.split('\n').flatMap((line, i) => (
  patterns.some((re) => re.test(line)) && !line.includes('legacy-price-fixture') ? [`${path}:${i + 1}: ${line.trim().slice(0, 120)}`] : []
)));

test('the scan covers the pricing pages', () => {
  const paths = FILES.map((f) => f.path);
  for (const f of [
    'app/(vendor-site)/plans/PlansClient.jsx', 'app/(vendor-site)/for-designers/ForDesignersClient.jsx',
    'app/vendor/dashboard/subscription/page.jsx', 'app/(public)/faq/page.jsx', 'app/(public)/terms/page.jsx',
  ]) assert.ok(paths.includes(f), f);
  assert.ok(FILES.length > 100);
});

test('no file contains an old price (5,999 / 14,999 / 19,999 or 599900 / 1499900 / 1999900) outside a marked legacy fixture', () => {
  assert.deepEqual(hits(OLD), []);
});

test('no file hardcodes a current price (1,999 / 3,999 / 7,999 or paise): prices come from the plans API', () => {
  assert.deepEqual(hits(CURRENT), []);
});

test('no hardcoded plan table: no `price: <number>` and no plan-name list in app/ or lib/', () => {
  const offenders = FILES
    .filter((f) => /^(app|lib|components)\//.test(f.path))
    .filter((f) => /\bprice:\s*\d/.test(f.src) || /\[\s*'\d+ Month',\s*'\d+ Month'/.test(f.src))
    .map((f) => f.path);
  assert.deepEqual(offenders, []);
});

test('every page that shows or charges a plan price reads it from /subscriptions/plans', () => {
  for (const f of [
    'app/(vendor-site)/plans/page.jsx',
    'app/(vendor-site)/for-designers/page.jsx',
    'app/vendor/dashboard/subscription/page.jsx',
    'app/admin/dashboard/coupons/new/page.jsx',
    'app/admin/dashboard/coupons/[id]/edit/page.jsx',
  ]) assert.match(FILES.find((x) => x.path === f).src, /\/subscriptions\/plans/, f);
  // The cached marketing pages are tagged so the backend's boot purge reaches them.
  for (const f of ['app/(vendor-site)/plans/page.jsx', 'app/(vendor-site)/for-designers/page.jsx']) {
    assert.match(FILES.find((x) => x.path === f).src, /tags: \[TAGS\.PLANS\]/, f);
  }
});

test('plan pages carry no per-month savings / best-value claims (false at the current prices)', () => {
  const PLAN_FILES = [
    'app/(vendor-site)/plans/PlansClient.jsx', 'app/(vendor-site)/for-designers/ForDesignersClient.jsx',
    'app/vendor/dashboard/subscription/page.jsx', 'app/(public)/faq/page.jsx',
    'app/(public)/terms/page.jsx', 'app/(vendor-site)/for-designers/terms/page.jsx',
  ];
  for (const f of PLAN_FILES) {
    const code = FILES.find((x) => x.path === f).src.replace(/^\s*\/\/.*$/gm, '');
    assert.doesNotMatch(code, /best value|cheaper per month|save \d+\s*%|\d+\s*% off|per month equivalent/i, f);
  }
});

test('static legal/FAQ copy quotes no plan terms, so it cannot drift from the API', () => {
  for (const f of ['app/(public)/faq/page.jsx', 'app/(public)/terms/page.jsx', 'app/(vendor-site)/for-designers/terms/page.jsx']) {
    assert.doesNotMatch(FILES.find((x) => x.path === f).src, /\b1, 6,? or 12\b|\b3, 6,? or 12\b/, f);
  }
});

// ── lib/plans.js ────────────────────────────────────────────────────────
const API_PLANS = [ // current API shape (prices in paise)
  { name: '12 Month', displayName: '12 Months', period: '12 months', price: 8, durationDays: 365 },
  { name: '3 Month', displayName: '3 Months', period: '3 months', price: 2, durationDays: 90 },
  { name: '6 Month', displayName: '6 Months', period: '6 months', price: 4, durationDays: 180 },
];
const OLD_SHAPE = [ // the API before displayName/period existed
  { name: '1 Month', price: 1, durationDays: 30 },
  { name: '6 Month', price: 2, durationDays: 180 },
  { name: '12 Month', price: 3, durationDays: 365 },
];

test('sortPlans orders by duration and tolerates a missing list', () => {
  assert.deepEqual(sortPlans(API_PLANS).map((p) => p.name), ['3 Month', '6 Month', '12 Month']);
  assert.deepEqual(sortPlans(undefined), []);
  assert.equal(API_PLANS[0].name, '12 Month'); // not mutated
});

test('planLabel / planPeriod: API fields, else derived from name and durationDays', () => {
  assert.equal(planLabel(API_PLANS[1]), '3 Months');
  assert.equal(planPeriod(API_PLANS[1]), '3 months');
  assert.equal(planLabel(OLD_SHAPE[0]), '1 Month');
  assert.deepEqual(OLD_SHAPE.map(planPeriod), ['1 month', '6 months', '12 months']);
});

test('termList / cheapestPlan', () => {
  assert.equal(termList(API_PLANS), '3, 6, or 12');
  assert.equal(termList(OLD_SHAPE), '1, 6, or 12');
  assert.equal(termList(API_PLANS.slice(1)), '3 or 6');
  assert.equal(termList([]), '');
  assert.equal(cheapestPlan(API_PLANS).name, '3 Month');
  assert.equal(cheapestPlan([]), null);
});

console.log(`\n${passed} passed`);
