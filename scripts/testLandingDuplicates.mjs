// Run: node scripts/testLandingDuplicates.mjs
// The admin's duplicate-text warning (lib/landingChecklist.js): checklist
// lines, the stronger warning for indexable pages, the FAQ-only line, the
// list badge — and that it never changes the existing checks or blocks
// anything (it is advisory, level 'warn', like every other check).
import assert from 'node:assert/strict';
import { duplicateChecks, duplicateBadge, evaluateChecklist, placeList } from '../lib/landingChecklist.js';

let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`ok - ${name}`); };
const pg = (city, status = 'published') => ({ _id: city, city, state: 'S', status });
const SEVEN = ['Mumbai', 'Nagpur', 'Bengaluru', 'Mysuru', 'Chennai', 'Hyderabad', 'Jaipur'].map((c) => pg(c));
const FORM = { banner: {}, seo: {}, intro: '', sections: [], heading: '' };
const CTX = { categoryName: 'Interior Designers', city: 'Pune', state: 'Maharashtra', vendorCount: 1, level: 'city' };

test('identical text: the exact warning, names listed (max 5, then …)', () => {
  const [c] = duplicateChecks({ sameText: SEVEN, sameFaq: [], indexable: false });
  assert.equal(c.level, 'warn');
  assert.equal(c.strong, false);
  assert.equal(c.label, 'Text is identical to 7 other pages after replacing the city name: Mumbai, Nagpur, Bengaluru, Mysuru, Chennai…');
  assert.equal(c.hint, 'Write city-specific FAQs and intro before publishing.');
  assert.equal(placeList(SEVEN.slice(0, 2)), 'Mumbai, Nagpur');
});

test('indexable and duplicated: stronger warning', () => {
  const [c] = duplicateChecks({ sameText: [pg('Mumbai')], sameFaq: [], indexable: true });
  assert.equal(c.strong, true);
  assert.equal(c.label, 'Text is identical to 1 other page after replacing the city name: Mumbai');
  assert.match(c.hint, /indexable/);
});

test('FAQ-only duplicates get their own line', () => {
  const checks = duplicateChecks({ sameText: [], sameFaq: [pg('Mumbai'), pg('Nagpur', 'draft')], indexable: false });
  assert.deepEqual(checks.map((c) => c.id), ['duplicateFaq']);
  assert.equal(checks[0].label, 'FAQs are identical to 2 other pages: Mumbai, Nagpur');
  const both = duplicateChecks({ sameText: [pg('Jaipur')], sameFaq: [pg('Mumbai')], indexable: true });
  assert.deepEqual(both.map((c) => [c.id, c.strong]), [['duplicateText', true], ['duplicateFaq', false]]);
});

test('unique text passes; not loaded yet adds nothing', () => {
  assert.deepEqual(duplicateChecks(null).map((c) => [c.id, c.level]), [['duplicateText', 'pass']]);
  assert.deepEqual(duplicateChecks(undefined), []);
});

test('checklist: duplicates only append their lines; every other check is unchanged', () => {
  const base = evaluateChecklist(FORM, CTX);
  const withDup = evaluateChecklist(FORM, { ...CTX, duplicates: { sameText: SEVEN, sameFaq: [], indexable: false } });
  assert.deepEqual(withDup.slice(0, base.length), base);
  assert.deepEqual(withDup.slice(base.length).map((c) => c.id), ['duplicateText']);
  assert.ok(withDup.every((c) => c.level === 'pass' || c.level === 'warn'), 'advisory only');
});

test('list badge', () => {
  assert.equal(duplicateBadge({ sameText: SEVEN, sameFaq: [] }), 'Same text as 7 pages');
  assert.equal(duplicateBadge({ sameText: [pg('A')], sameFaq: [] }), 'Same text as 1 page');
  assert.equal(duplicateBadge({ sameText: [], sameFaq: [pg('A'), pg('B')] }), 'Same FAQs as 2 pages');
  assert.equal(duplicateBadge(null), null);
});

console.log(`\n${passed} passed`);
