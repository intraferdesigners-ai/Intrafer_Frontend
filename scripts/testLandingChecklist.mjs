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

const labels = (checks) => Object.fromEntries(checks.map((c) => [c.id, c.label]));
const IDS = ['metaTitle', 'metaDescription', 'bannerImage', 'bannerHeadline', 'cta', 'words', 'faq', 'localities', 'tokens', 'vendors', 'indexing', 'heading'];

test('pass labels describe what is there', () => {
  const checks = evaluateChecklist(good(), ctx);
  assert.deepEqual(checks.map((c) => c.id), IDS);
  assert.deepEqual(labels(checks), {
    metaTitle: 'Meta title fits in search results (≤ 60 characters)',
    metaDescription: 'Meta description is 120–160 characters',
    bannerImage: 'Banner image added',
    bannerHeadline: 'Banner headline added',
    cta: 'CTA button added',
    words: 'Enough text (162 words)', // intro 100 + 'Why Ghaziabad' 2 + body 60
    faq: 'FAQ has 2 questions',
    localities: '3 localities listed',
    tokens: 'No unknown placeholders',
    vendors: '7 vendors listed for this city',
    indexing: 'Indexing: automatic',
    heading: 'Heading (H1) is 70 characters or fewer',
  });
  assert.equal(labels(evaluateChecklist(good(), { ...ctx, vendorCount: 1 })).vendors, '1 vendor listed for this city');
});

test('warn labels say what is missing; ids, hints and count unchanged', () => {
  const form = good();
  form.banner = { imageUrl: '', headline: '', subheadline: '', ctaLabel: 'Get quotes', ctaUrl: '' };
  form.heading = 'h'.repeat(71);
  form.intro = words(10);
  form.sections = [
    { type: 'faq', enabled: true, faqItems: [{ question: 'Q1?', answer: 'A1' }, { question: 'Q2?', answer: '' }] },
    { type: 'localities', enabled: true, localities: ['A', 'B'] },
  ];
  form.seo = { metaTitle: 'x'.repeat(60), metaDescription: 'Too short {{phone}}', ogImage: '', indexing: 'index' };
  const checks = evaluateChecklist(form, { ...ctx, vendorCount: 0 });
  assert.deepEqual(checks.map((c) => c.id), IDS);
  assert.ok(checks.every((c) => c.level === 'warn' && c.hint), JSON.stringify(checks.filter((c) => c.level !== 'warn' || !c.hint)));
  assert.deepEqual(labels(checks), {
    metaTitle: 'Meta title is too long for search results',
    metaDescription: 'Meta description is too short',
    bannerImage: 'Add a banner image',
    bannerHeadline: 'Add a banner headline',
    cta: 'Finish the CTA button', // half-filled; empty reads "Add a CTA button (optional)"
    words: 'Add more text — 10 of 150 words',
    faq: 'Add an FAQ with at least 2 questions',
    localities: 'List at least 3 localities',
    tokens: 'Unknown placeholders found',
    vendors: 'No vendors yet — the page will show an empty list',
    indexing: 'Forced indexing on a thin page',
    heading: 'Heading (H1) is too long',
  });

  form.banner.ctaLabel = '';
  form.seo.metaTitle = '';
  form.seo.metaDescription = 'x'.repeat(161);
  const more = labels(evaluateChecklist(form, ctx));
  assert.equal(more.cta, 'Add a CTA button (optional)');
  assert.equal(more.metaTitle, 'Meta title not set');
  assert.equal(more.metaDescription, 'Meta description is too long');
  form.seo.metaDescription = '';
  assert.equal(labels(evaluateChecklist(form, ctx)).metaDescription, 'Meta description not set');
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
