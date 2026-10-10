// Run: node scripts/testLandingPlaceholders.mjs
import assert from 'node:assert/strict';
import { resolvePlaceholders, resolveLandingPage } from '../lib/landingPlaceholders.js';

const values = { city: 'Pune', state: 'Maharashtra', category: 'Interior Designers', vendorCount: 7 };
let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`ok - ${name}`); };

test('all tokens', () => {
  assert.equal(
    resolvePlaceholders('{{category}} in {{city}}, {{state}}: {{vendorCount}} listed', values),
    'Interior Designers in Pune, Maharashtra: 7 listed'
  );
});

test('whitespace inside braces', () => {
  assert.equal(resolvePlaceholders('{{ city }}', values), 'Pune');
});

test('unknown token is stripped', () => {
  assert.equal(resolvePlaceholders('Best {{foo}}designers {{ bar baz }}in {{city}}', values), 'Best designers in Pune');
});

test('repeated token', () => {
  assert.equal(resolvePlaceholders('{{city}} {{city}} {{city}}', values), 'Pune Pune Pune');
});

test('vendorCount of 0 is kept, not stripped', () => {
  assert.equal(resolvePlaceholders('{{vendorCount}} vendors', { ...values, vendorCount: 0 }), '0 vendors');
});

test('missing field resolves to empty string', () => {
  assert.equal(resolvePlaceholders(undefined, values), '');
  assert.equal(resolvePlaceholders(null, values), '');
  assert.equal(resolvePlaceholders('', values), '');
});

test('no prototype lookups', () => {
  assert.equal(resolvePlaceholders('{{toString}}{{constructor}}', values), '');
});

test('resolveLandingPage covers every authored text field', () => {
  const page = {
    banner: { headline: '{{city}} h', subheadline: '{{state}} s', ctaLabel: '{{category}} c', imageUrl: 'https://x/y.jpg' },
    heading: '{{category}} in {{city}}',
    intro: 'Intro {{vendorCount}} {{nope}}',
    sections: [
      { type: 'text', title: 'T {{city}}', body: 'B {{state}}' },
      { type: 'faq', enabled: false, faqItems: [{ question: 'Q {{city}}?', answer: 'A {{vendorCount}}' }, { question: '{{nope}}', answer: 'dropped' }] },
      { type: 'localities', localities: ['{{city}} East', '{{nope}}'] },
    ],
    seo: { metaTitle: 'M {{city}}', metaDescription: 'D {{state}}' },
  };
  const out = resolveLandingPage(page, values);
  assert.equal(out.banner.headline, 'Pune h');
  assert.equal(out.banner.subheadline, 'Maharashtra s');
  assert.equal(out.banner.ctaLabel, 'Interior Designers c');
  assert.equal(out.heading, 'Interior Designers in Pune');
  assert.equal(out.intro, 'Intro 7');
  assert.equal(out.sections[0].title, 'T Pune');
  assert.equal(out.sections[0].body, 'B Maharashtra');
  assert.equal(out.sections[1].enabled, false);
  assert.deepEqual(out.sections[1].faqItems, [{ question: 'Q Pune?', answer: 'A 7' }]);
  assert.deepEqual(out.sections[2].localities, ['Pune East']);
  assert.equal(out.seo.metaTitle, 'M Pune');
  assert.equal(out.seo.metaDescription, 'D Maharashtra');
});

test('resolveLandingPage tolerates a sparse page', () => {
  const out = resolveLandingPage({}, values);
  assert.equal(out.heading, '');
  assert.deepEqual(out.sections, []);
  assert.equal(out.banner.imageUrl, '');
});

console.log(`\n${passed} passed`);
