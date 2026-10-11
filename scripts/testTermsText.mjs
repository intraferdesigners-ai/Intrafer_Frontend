// Run: node scripts/testTermsText.mjs
// Liability wording in both terms pages: the exact approved paragraphs, no
// leftover "3 months" cap, and no subscription-fee cap in the homeowner
// terms (homeowners pay no subscription).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const PUBLIC = read('app/(public)/terms/page.jsx');
const VENDOR = read('app/(vendor-site)/for-designers/terms/page.jsx');
let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`ok - ${name}`); };

// Rendered text of the <LegalSection title="..."> block: tags stripped,
// entities decoded, whitespace collapsed.
function sectionText(src, title) {
  const start = src.indexOf(`<LegalSection title="${title}">`);
  assert.notEqual(start, -1, `section "${title}" not found`);
  const end = src.indexOf('</LegalSection>', start);
  return src.slice(start, end)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ').trim();
}

const PUBLIC_LIABILITY = 'Intrafer is a marketplace that connects homeowners with independent interior designers. Designers are not employees or agents of Intrafer, and any contract for design or construction work is solely between you and the designer. We do not guarantee the quality, timing, pricing or outcome of any designer\'s work. Intrafer\'s platform is provided on an "as is" basis. To the extent permitted by law, Intrafer is not liable for disputes, damages or losses arising from your dealings with a designer. Nothing in these terms limits any liability that cannot be excluded under applicable law.';
const VENDOR_LIABILITY = 'Intrafer provides a marketplace platform on an "as is" basis. To the extent permitted by law, Intrafer\'s total liability to you for any claim is limited to the subscription fees you paid in the 12 months preceding the claim. We are not liable for disputes, damages or losses arising from interactions or contracts between you and homeowners.';

test('neither terms file contains "3 months"', () => {
  assert.doesNotMatch(PUBLIC, /3 months/i);
  assert.doesNotMatch(VENDOR, /3 months/i);
});

test('homeowner liability section: exact approved text, no subscription-fee cap', () => {
  const text = sectionText(PUBLIC, '7. Limitation of liability');
  assert.equal(text, PUBLIC_LIABILITY);
  assert.doesNotMatch(text, /subscription fee/i);
});

test('designer liability section: exact approved text (12-month cap)', () => {
  assert.equal(sectionText(VENDOR, '6. Limitation of liability'), VENDOR_LIABILITY);
});

console.log(`\n${passed} passed`);
