// Run: node scripts/testLandingChecklist.mjs
import assert from 'node:assert/strict';
import { evaluateChecklist, countWords, findUnknownTokens } from '../lib/landingChecklist.js';

const ctx = { categoryName: 'Interior Designers', state: 'Uttar Pradesh', city: 'Ghaziabad', vendorCount: 7 };
let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`ok - ${name}`); };
const words = (n) => Array.from({ length: n }, (_, i) => `word${i}`).join(' ');
const byId = (checks) => Object.fromEntries(checks.map((c) => [c.id, c]));

// A page that should pass every check.
const good = () => ({
  banner: { imageUrl: 'https://img/x.jpg', headline: 'Designers in {{city}}', subheadline: '', ctaLabel: 'Get quotes', ctaUrl: '/contact/' },
  heading: '{{category}} in {{city}}',
  intro: words(100),
  sections: [
    { type: 'text', enabled: true, title: 'Why {{city}}', body: words(60), faqItems: [], localities: [] },
    { type: 'faq', enabled: true, title: 'FAQ', body: '', faqItems: [{ question: 'Q1?', answer: 'A1' }, { question: 'Q2?', answer: 'A2' }], localities: [] },
    { type: 'localities', enabled: true, title: '', body: '', faqItems: [], localities: ['Indirapuram', 'Vaishali', 'Raj Nagar'] },
  ],
  vendorList: { sort: 'featured', limit: 12 },
  seo: {
    metaTitle: 'Top {{category}} in {{city}}',
    metaDescription: `Compare ${'verified '.repeat(12)}interior designers in {{city}} and get free quotes today.`.slice(0, 150),
    ogImage: '', indexing: 'auto',
  },
});

test('fully-passing example', () => {
  const checks = evaluateChecklist(good(), ctx);
  const failing = checks.filter((c) => c.level !== 'pass');
  assert.deepEqual(failing, [], JSON.stringify(failing));
  assert.equal(checks.length, 12);
  assert.ok(checks.every((c) => c.hint === ''));
});

test('countWords strips Markdown syntax', () => {
  assert.equal(countWords('# Heading here\n\n- one two\n- three\n\n1. four\n\n> five'), 7);
  assert.equal(countWords('See [our guides](/guides/) and ![alt text](https://x/y.jpg) **bold** _it_'), 8);
  assert.equal(countWords('Visit <https://example.com> or https://example.com/a now'), 3);
  assert.equal(countWords('a - b -- c * d'), 4);
  assert.equal(countWords(''), 0);
  assert.equal(countWords(undefined), 0);
});

test('word count: disabled sections and non-text sections do not count; placeholders resolved', () => {
  const form = good();
  form.intro = words(140);
  form.sections[0].enabled = false; // its 60+2 words drop out
  form.sections[1].faqItems[0].answer = words(50); // FAQ text doesn't count
  const c = byId(evaluateChecklist(form, ctx)).words;
  assert.equal(c.level, 'warn');
  assert.match(c.hint, /140 words/);
  form.sections[0].enabled = true;
  form.sections[0].body = words(7) + ' {{city}} {{state}}'; // 'Why Ghaziabad' (2) + 7 + 1 + 2
  assert.equal(byId(evaluateChecklist(form, ctx)).words.level, 'pass'); // 140 + 12 = 152
});

test('unknown tokens detected and listed (case-sensitive, deduped, all fields)', () => {
  assert.deepEqual(findUnknownTokens(['{{city}} {{ state }} {{City}}', '{{nope}} {{nope}}', null]), ['{{City}}', '{{nope}}']);
  const form = good();
  form.sections[1].faqItems[1].answer = 'Call {{phone}}';
  form.sections[2].localities.push('{{area}}');
  const c = byId(evaluateChecklist(form, ctx)).tokens;
  assert.equal(c.level, 'warn');
  assert.match(c.hint, /\{\{phone\}\}, \{\{area\}\} aren’t placeholders/);
});

test('forced index on thin content warns; forced index on a rich page passes', () => {
  const form = good();
  form.seo.indexing = 'index';
  assert.equal(byId(evaluateChecklist(form, ctx)).indexing.level, 'pass');
  assert.equal(byId(evaluateChecklist(form, { ...ctx, vendorCount: 2 })).indexing.level, 'warn');
  form.intro = words(10);
  const c = byId(evaluateChecklist(form, ctx)).indexing;
  assert.equal(c.level, 'warn');
  assert.match(c.hint, /thin content/);
  form.seo.indexing = 'auto';
  assert.equal(byId(evaluateChecklist(form, { ...ctx, vendorCount: 0 })).indexing.level, 'pass');
});

test('vendorCount 0 warns; unknown count omits the check', () => {
  const zero = byId(evaluateChecklist(good(), { ...ctx, vendorCount: 0 }));
  assert.equal(zero.vendors.level, 'warn');
  assert.match(zero.vendors.hint, /empty vendor list/);
  assert.equal(byId(evaluateChecklist(good(), { ...ctx, vendorCount: null })).vendors, undefined);
});

test('meta title: blank warns with the automatic title; too long warns', () => {
  const form = good();
  form.seo.metaTitle = '';
  const blank = byId(evaluateChecklist(form, ctx)).metaTitle;
  assert.equal(blank.level, 'warn');
  assert.match(blank.hint, /automatic title “Interior Designers in Ghaziabad, Uttar Pradesh \| Intrafer”/);
  form.seo.metaTitle = 'x'.repeat(49); // + " | Intrafer" = 60
  assert.equal(byId(evaluateChecklist(form, ctx)).metaTitle.level, 'pass');
  form.seo.metaTitle = 'x'.repeat(50); // 61
  assert.equal(byId(evaluateChecklist(form, ctx)).metaTitle.level, 'warn');
});

test('meta description: blank, 119, 120, 160, 161 chars', () => {
  const at = (s) => { const f = good(); f.seo.metaDescription = s; return byId(evaluateChecklist(f, ctx)).metaDescription.level; };
  assert.equal(at(''), 'warn');
  assert.equal(at('x'.repeat(119)), 'warn');
  assert.equal(at('x'.repeat(120)), 'pass');
  assert.equal(at('x'.repeat(160)), 'pass');
  assert.equal(at('x'.repeat(161)), 'warn');
});

test('banner, CTA, FAQ, localities and heading checks', () => {
  const form = good();
  form.banner.imageUrl = '';
  form.banner.headline = '{{nope}}'; // resolves to empty
  form.banner.ctaUrl = '';
  form.sections[1].faqItems[1].answer = ' ';
  form.sections[2].localities = ['A', 'B'];
  form.heading = 'h'.repeat(71);
  const c = byId(evaluateChecklist(form, ctx));
  for (const id of ['bannerImage', 'bannerHeadline', 'cta', 'faq', 'localities', 'heading']) assert.equal(c[id].level, 'warn', id);
  assert.match(c.cta.hint, /saving is blocked/);
  form.heading = '';
  assert.equal(byId(evaluateChecklist(form, ctx)).heading.level, 'pass');
});

test('never throws on a sparse form', () => {
  const checks = evaluateChecklist({}, { ...ctx, vendorCount: undefined });
  assert.ok(checks.length > 0);
});

console.log(`\n${passed} passed`);
