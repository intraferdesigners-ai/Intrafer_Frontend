// Run: node scripts/testLandingSerp.mjs
import assert from 'node:assert/strict';
import { buildSerpPreview, landingPageTitle, truncate, serpDisplayUrl } from '../lib/landingSerp.js';

const ctx = {
  categoryName: 'Interior Designers', state: 'Uttar Pradesh', city: 'Ghaziabad', vendorCount: 7,
  path: '/interior-designers/uttar-pradesh/ghaziabad/',
};
let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`ok - ${name}`); };
const chars = (n) => 'x'.repeat(n);

test('truncate: 59 and 60 chars unchanged, 61 cut', () => {
  assert.equal(truncate(chars(59), 60), chars(59));
  assert.equal(truncate(chars(60), 60), chars(60));
  const cut = truncate(chars(61), 60);
  assert.equal(cut.length, 60);
  assert.ok(cut.endsWith('…'));
});

test('truncate breaks on a word boundary and drops trailing punctuation', () => {
  // 'aaaa bbbb, cccc' (15) at max 12 -> room 'aaaa bbbb, ' -> 'aaaa bbbb…'
  assert.equal(truncate('aaaa bbbb, cccc', 12), 'aaaa bbbb…');
});

test('title boundaries: full title of 59 / 60 / 61 chars (with " | Intrafer")', () => {
  const suffix = ' | Intrafer'.length; // 11
  for (const [len, cut] of [[59, false], [60, false], [61, true]]) {
    const metaTitle = `word ${chars(len - suffix - 5)}`;
    const { title, fullTitle } = buildSerpPreview({ ...ctx, metaTitle });
    assert.equal(fullTitle.length, len);
    assert.equal(title.endsWith('…'), cut, `len ${len}`);
    assert.ok(title.length <= 60);
  }
});

test('default title fallback matches the live page rule', () => {
  const { title } = buildSerpPreview({ ...ctx, metaTitle: '' });
  assert.equal(title, 'Interior Designers in Ghaziabad, Uttar Pradesh | Intrafer');
  assert.equal(landingPageTitle({ metaTitle: '', categoryName: 'X', city: 'C', state: 'S' }), 'X in C, S');
});

test('typed "| Intrafer" is not doubled; whitespace-only title falls back', () => {
  assert.equal(buildSerpPreview({ ...ctx, metaTitle: 'Best designers - Intrafer' }).title, 'Best designers | Intrafer');
  assert.equal(buildSerpPreview({ ...ctx, metaTitle: '   ' }).title, 'Interior Designers in Ghaziabad, Uttar Pradesh | Intrafer');
});

test('placeholders resolve in title and description; vendorCount falls back to 0', () => {
  const out = buildSerpPreview({ ...ctx, metaTitle: '{{vendorCount}} {{category}} in {{city}}', metaDescription: 'Hire in {{state}} {{nope}}today.' });
  assert.equal(out.title, '7 Interior Designers in Ghaziabad | Intrafer');
  assert.equal(out.description, 'Hire in Uttar Pradesh today.');
  assert.equal(buildSerpPreview({ ...ctx, vendorCount: null, metaTitle: '{{vendorCount}} studios' }).title, '0 studios | Intrafer');
});

test('description: 160 unchanged, 161 cut; empty stays empty', () => {
  assert.equal(buildSerpPreview({ ...ctx, metaDescription: chars(160) }).description, chars(160));
  assert.equal(buildSerpPreview({ ...ctx, metaDescription: chars(161) }).description.length, 160);
  assert.equal(buildSerpPreview({ ...ctx, metaDescription: '' }).description, '');
});

test('mobile uses tighter limits', () => {
  const metaTitle = 'word '.repeat(10).trim(); // 49 + 11 = 60
  assert.equal(buildSerpPreview({ ...ctx, metaTitle }).title.endsWith('…'), false);
  assert.ok(buildSerpPreview({ ...ctx, metaTitle, device: 'mobile' }).title.length <= 55);
  assert.ok(buildSerpPreview({ ...ctx, metaDescription: chars(130), device: 'mobile' }).description.endsWith('…'));
});

test('display URL is a breadcrumb; query string dropped', () => {
  assert.equal(serpDisplayUrl(ctx.path), 'intrafer.in › interior-designers › uttar-pradesh › ghaziabad');
  assert.equal(serpDisplayUrl('/a/b/c/?preview=secret'), 'intrafer.in › a › b › c');
  assert.equal(buildSerpPreview(ctx).displayUrl, 'intrafer.in › interior-designers › uttar-pradesh › ghaziabad');
});

console.log(`\n${passed} passed`);
