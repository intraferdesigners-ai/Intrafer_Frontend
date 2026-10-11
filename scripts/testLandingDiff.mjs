// Run: node scripts/testLandingDiff.mjs
import assert from 'node:assert/strict';
import { diffContent } from '../lib/landingDiff.js';

let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`ok - ${name}`); };
const summaries = (d) => d.map((c) => c.summary);

const base = () => ({
  banner: { imageUrl: 'https://img/x.jpg', headline: 'Designers in Pune', subheadline: '', ctaLabel: 'Get quotes', ctaUrl: '/contact/' },
  heading: '', intro: 'Intro text',
  sections: [
    { type: 'text', title: 'Why hire a designer', body: 'Because.', faqItems: [], localities: [], enabled: true },
    { type: 'faq', title: 'FAQ', body: '', faqItems: [{ question: 'Q1', answer: 'A1' }, { question: 'Q2', answer: 'A2' }, { question: 'Q3', answer: 'A3' }], localities: [], enabled: true },
    { type: 'localities', title: 'Areas', body: '', faqItems: [], localities: ['Baner', 'Wakad'], enabled: true },
  ],
  vendorList: { sort: 'featured', limit: 12 },
  seo: { metaTitle: 'Top designers', metaDescription: '', ogImage: '', indexing: 'auto' },
});

test('no change → empty list (ids and key order ignored)', () => {
  const snap = base();
  snap.sections = snap.sections.map((s, i) => ({ _id: `id${i}`, ...s }));
  assert.deepEqual(diffContent(base(), snap), []);
});

test('text fields: changed, added, removed; short values quoted, long ones summarised', () => {
  const snap = base();
  snap.banner.headline = 'Designers near you';
  snap.banner.subheadline = 'New sub';
  snap.banner.ctaLabel = '';
  snap.intro = 'x'.repeat(200);
  const d = diffContent(base(), snap);
  assert.deepEqual(summaries(d), [
    'Banner headline: “Designers in Pune” → “Designers near you”',
    'Banner subheadline added',
    'CTA label removed',
    'Intro changed (10 → 200 characters)',
  ]);
  assert.equal(d[0].kind, 'text');
  assert.equal(d[0].before, 'Designers in Pune');
  assert.equal(d[0].after, 'Designers near you');
});

test('every labelled field is covered', () => {
  const snap = {
    banner: { imageUrl: 'https://img/y.jpg', headline: 'h', subheadline: 's', ctaLabel: 'c', ctaUrl: '/u/' },
    heading: 'H1', intro: 'i', sections: base().sections,
    vendorList: { sort: 'rating', limit: 20 },
    seo: { metaTitle: 'm', metaDescription: 'd', ogImage: 'https://og', indexing: 'noindex' },
  };
  assert.deepEqual(diffContent(base(), snap).map((c) => c.label), [
    'Banner headline', 'Banner subheadline', 'Banner image', 'CTA label', 'CTA URL', 'Heading (H1)', 'Intro',
    'Vendor sort', 'Vendor limit', 'Meta title', 'Meta description', 'OG image', 'Indexing',
  ]);
});

test('enum and number fields', () => {
  const snap = base();
  snap.vendorList = { sort: 'newest', limit: 30 };
  snap.seo.indexing = 'index';
  const d = diffContent(base(), snap);
  assert.deepEqual(d.map((c) => [c.kind, c.summary]), [
    ['enum', 'Vendor sort: featured → newest'],
    ['number', 'Vendor limit: 12 → 30'],
    ['enum', 'Indexing: auto → index'],
  ]);
  assert.equal(d[1].before, 12);
  assert.equal(d[1].after, 30);
});

test('null / missing fields compare as empty or the model default', () => {
  assert.deepEqual(diffContent({}, { vendorList: { sort: 'featured', limit: 12 }, seo: { indexing: 'auto' }, sections: [] }), []);
  assert.deepEqual(diffContent(null, undefined), []);
  assert.deepEqual(summaries(diffContent({ heading: null }, { heading: 'New H1' })), ['Heading (H1) added']);
  assert.deepEqual(summaries(diffContent({ vendorList: { limit: '12' } }, { vendorList: { limit: 12 } })), []);
});

test('sections: FAQ question count, localities count, title, hidden', () => {
  const snap = base();
  snap.sections[1].faqItems.pop();
  snap.sections[2].localities.push('Kothrud');
  snap.sections[0].title = 'Why hire us';
  snap.sections[0].enabled = false;
  assert.deepEqual(summaries(diffContent(base(), snap)), [
    'Section 1 (Text): hidden, title “Why hire us”',
    'Section 2 (FAQ): 3 → 2 questions',
    'Section 3 (Localities): 2 → 3 localities',
  ]);
});

test('sections: added and removed', () => {
  const snap = base();
  snap.sections.splice(2, 1);
  snap.sections.push({ type: 'text', title: 'Why hire a designer in Pune today', body: 'b' });
  const d = diffContent(base(), snap);
  // The new text section pairs with nothing (the old text section is unchanged), localities is gone.
  assert.deepEqual(summaries(d), ['Section added: Text “Why hire a designer in Pune t…”', 'Section removed: Localities “Areas” (was section 3)']);
  assert.ok(d.every((c) => c.kind === 'list' && c.label === 'Sections'));
});

test('sections: pure reorder reported once', () => {
  const snap = base();
  snap.sections = [snap.sections[2], snap.sections[0], snap.sections[1]];
  assert.deepEqual(summaries(diffContent(base(), snap)), ['Sections reordered']);
});

test('sections: from none to some and back', () => {
  const cur = { ...base(), sections: [] };
  assert.equal(diffContent(cur, base()).length, 3);
  assert.deepEqual(summaries(diffContent(base(), { ...base(), sections: null })), [
    'Section removed: Text “Why hire a designer” (was section 1)',
    'Section removed: FAQ “FAQ” (was section 2)',
    'Section removed: Localities “Areas” (was section 3)',
  ]);
});

test('values are plain strings/numbers (rendered as text)', () => {
  const snap = base();
  snap.heading = '<script>alert(1)</script>';
  const [c] = diffContent(base(), snap);
  assert.equal(typeof c.after, 'string');
  assert.equal(c.summary, 'Heading (H1) added');
});

// ── Phase 4C: hubs' Top vendors toggle ───────────────────────────────────
test('vendorList.enabled: shown/hidden; missing = shown (city pages never differ)', () => {
  const diff = diffContent({ vendorList: { enabled: false, sort: 'featured', limit: 12 } }, { vendorList: { enabled: true, sort: 'featured', limit: 12 } });
  assert.deepEqual(diff.map((d) => d.summary), ['Top vendors block: hidden → shown']);
  assert.deepEqual(diffContent({ vendorList: { enabled: true, sort: 'featured', limit: 12 } }, { vendorList: { sort: 'featured', limit: 12 } }), []);
});

console.log(`\n${passed} passed`);
