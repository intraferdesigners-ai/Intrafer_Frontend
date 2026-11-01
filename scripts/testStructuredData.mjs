// Run: node scripts/testStructuredData.mjs
// Structured data (JSON-LD): (1) unit tests of the pure builders in
// lib/structuredData.js, lib/vendorSchema.js and lib/projectSchema.js;
// (2) static source checks that every page uses them the agreed way — one
// Organization/WebSite (root layout, by @id elsewhere), contact details only
// from lib/siteConfig.js, a visible Breadcrumb on every content page, FAQ /
// plan / guide markup built from the same data the page renders, and no raw
// <script type="application/ld+json"> outside components/seo/JsonLd.jsx.
// The live counterpart is scripts/checkStructuredData.mjs <baseUrl>.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CONTACT_POINT_ID, ORG_ID, WEBSITE_ID, breadcrumbJsonLd, contactPageJsonLd, aboutPageJsonLd, faqPageJsonLd,
  guideArticleJsonLd, guidesIndexJsonLd, organizationJsonLd, plansJsonLd, serializeJsonLd, websiteJsonLd,
} from '../lib/structuredData.js';
import { vendorJsonLd, vendorAreasServed, reviewAuthorName, DEFAULT_VENDOR_TYPE } from '../lib/vendorSchema.js';
import { projectJsonLd, projectImages, galleryAlt, beforeAlt, afterAlt } from '../lib/projectSchema.js';
import { PHONE, SOCIAL_PROFILES, SUPPORT_EMAIL, WHATSAPP_URL } from '../lib/siteConfig.js';
import { FAQ_GROUPS, faqItems } from '../lib/faqData.js';
import { GUIDES, guideDateLabel } from '../lib/guides-data.js';
import { PLAN_FEATURES, planLabel, planPeriod } from '../lib/plans.js';

const require = createRequire(import.meta.url);
const { formatINR } = require('../lib/utils.js');

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const WWW = 'https://www.intrafer.in';
let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`ok - ${name}`); };
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(jsx?|mjs)$/.test(name)) out.push(relative(ROOT, p));
  }
  return out;
}
const SOURCES = ['app', 'components', 'lib'].flatMap((d) => walk(join(ROOT, d)));
// Every URL / @id string inside a JSON-LD value, recursively.
const urlsIn = (v) => (typeof v === 'string' ? (/^https?:\/\//.test(v) ? [v] : [])
  : Array.isArray(v) ? v.flatMap(urlsIn) : v && typeof v === 'object' ? Object.values(v).flatMap(urlsIn) : []);
const typesIn = (v) => (Array.isArray(v) ? v.flatMap(typesIn) : v && typeof v === 'object'
  ? [...(v['@type'] ? [v['@type']] : []), ...Object.values(v).flatMap(typesIn)] : []);
const ownHost = (u) => /intrafer\.in$/.test(new URL(u).hostname);

// ── Sitewide entities ───────────────────────────────────────────────────

test('Organization: @id, logo, ContactPoint and sameAs all from siteConfig, www host', () => {
  const org = organizationJsonLd();
  assert.equal(org['@type'], 'Organization');
  assert.equal(org['@id'], `${WWW}/#organization`);
  assert.equal(org.url, `${WWW}/`);
  assert.equal(org.logo, `${WWW}/images/logo/logo.png`);
  assert.equal(org.telephone, PHONE.e164);
  assert.deepEqual(org.sameAs, SOCIAL_PROFILES.map((p) => p.url));
  const [cp] = org.contactPoint;
  assert.equal(cp['@id'], CONTACT_POINT_ID);
  assert.equal(cp.contactType, 'customer support');
  assert.equal(cp.telephone, PHONE.e164);
  assert.equal(cp.email, SUPPORT_EMAIL);
  assert.equal(org.email, SUPPORT_EMAIL);
  assert.equal(cp.areaServed, 'IN');
  assert.deepEqual(cp.availableLanguage, ['English']);
  assert.deepEqual(cp.hoursAvailable.dayOfWeek, [...PHONE.hours.days]);
  assert.ok(!('aggregateRating' in org) && !('address' in org) && !('geo' in org));
  urlsIn(org).filter(ownHost).forEach((u) => assert.ok(u.startsWith(`${WWW}/`), u));
});

test('siteConfig: phone forms agree (e164, display, wa.me)', () => {
  assert.equal(PHONE.e164.replace(/\D/g, ''), PHONE.display.replace(/\D/g, ''));
  assert.equal(WHATSAPP_URL, `https://wa.me/${PHONE.e164.slice(1)}`);
});

test('WebSite: @id https://www.intrafer.in/#website, publisher by @id, no SearchAction (no site search exists)', () => {
  const site = websiteJsonLd();
  assert.equal(site['@id'], 'https://www.intrafer.in/#website');
  assert.equal(site['@id'], WEBSITE_ID);
  assert.deepEqual(site.publisher, { '@id': ORG_ID });
  assert.ok(!('potentialAction' in site));
});

test('serializeJsonLd: stored text cannot close the <script> tag, and the JSON round-trips', () => {
  const data = { name: 'a </script><script>alert(1)</script> & b \u2028' };
  const out = serializeJsonLd(data);
  assert.doesNotMatch(out, /<\/script/i);
  assert.ok(!out.includes('<') && !out.includes('>'));
  assert.deepEqual(JSON.parse(out), data);
});

// ── Breadcrumbs ─────────────────────────────────────────────────────────

test('BreadcrumbList: positions, absolute www item URLs, last crumb without item', () => {
  const ld = breadcrumbJsonLd([{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Kitchen' }]);
  assert.deepEqual(ld.itemListElement, [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${WWW}/` },
    { '@type': 'ListItem', position: 2, name: 'Guides', item: `${WWW}/guides/` },
    { '@type': 'ListItem', position: 3, name: 'Kitchen' },
  ]);
});

// ── Page blocks ─────────────────────────────────────────────────────────

test('AboutPage / ContactPage reference the Organization / ContactPoint by @id only', () => {
  const about = aboutPageJsonLd({ name: 'About', description: 'd' });
  assert.equal(about['@type'], 'AboutPage');
  assert.deepEqual(about.about, { '@id': ORG_ID });
  assert.deepEqual(about.mainEntity, { '@id': ORG_ID });
  assert.deepEqual(about.isPartOf, { '@id': WEBSITE_ID });
  const contact = contactPageJsonLd({ name: 'Contact Us' });
  assert.equal(contact['@type'], 'ContactPage');
  assert.deepEqual(contact.mainEntity, { '@id': CONTACT_POINT_ID });
  // No duplicated phone/email literal: the ContactPoint lives in the layout.
  assert.doesNotMatch(JSON.stringify(contact), new RegExp(`${PHONE.e164.slice(1)}|${SUPPORT_EMAIL}`));
});

test('FAQPage on /faq/: one Question per visible item, text identical to the rendered array', () => {
  const items = faqItems(FAQ_GROUPS);
  const ld = faqPageJsonLd({ path: '/faq/', name: 'FAQ', items });
  assert.equal(ld['@type'], 'FAQPage');
  assert.equal(ld.mainEntity.length, FAQ_GROUPS.reduce((n, g) => n + g.items.length, 0));
  ld.mainEntity.forEach((q, i) => {
    assert.equal(q.name, items[i].q);
    assert.equal(q.acceptedAnswer.text, items[i].a);
  });
  assert.equal(faqPageJsonLd({ path: '/x/', name: 'x', items: [] }), null);
});

test('Plans: Product + Offer per tier; Offer price (number, INR) equals the price the card displays', () => {
  // Fixture prices (paise), deliberately not the live ones (testPlanPrices).
  const plans = [
    { name: 'A Month', displayName: 'A Months', period: '2 months', price: 123400, durationDays: 60 },
    { name: 'B Month', displayName: 'B Months', period: '4 months', price: 5678900, durationDays: 120 },
  ];
  const ld = plansJsonLd(plans);
  assert.equal(ld['@graph'].length, 2);
  ld['@graph'].forEach((product, i) => {
    const plan = plans[i];
    assert.equal(product['@type'], 'Product');
    assert.equal(product.name, planLabel(plan));
    assert.equal(product.description, `For ${planPeriod(plan)}: ${PLAN_FEATURES.join(', ')}.`);
    assert.deepEqual(product.brand, { '@id': ORG_ID });
    const { offers } = product;
    assert.equal(typeof offers.price, 'number');
    // What the price card shows (PlansClient: formatINR(plan.price)).
    assert.equal(offers.price, Number(formatINR(plan.price).replace(/[^\d.]/g, '')));
    assert.equal(offers.priceCurrency, 'INR');
    assert.equal(offers.availability, 'https://schema.org/InStock');
    assert.equal(offers.url, `${WWW}/plans/`);
    assert.ok(!('priceValidUntil' in offers), 'no real end date exists');
  });
  // A displayed price that diverged from the markup would fail the check above.
  assert.notEqual(plansJsonLd([{ ...plans[0], price: 123500 }])['@graph'][0].offers.price, Number(formatINR(plans[0].price).replace(/[^\d.]/g, '')));
  assert.equal(plansJsonLd([]), null);
});

test('guide page shows the same dates as its Article markup (same fields, same instant)', () => {
  const src = read('app/(public)/guides/[slug]/page.jsx');
  assert.match(src, /Published <time dateTime=\{guide\.datePublished\}>\{guideDateLabel\(guide\.datePublished\)\}<\/time>/);
  assert.match(src, /Updated <time dateTime=\{guide\.dateModified\}>\{guideDateLabel\(guide\.dateModified\)\}<\/time>/);
  assert.match(src, /<JsonLd data=\{guideArticleJsonLd\(guide\)\} \/>/);
  for (const g of GUIDES) {
    const ld = guideArticleJsonLd(g);
    assert.equal(ld.datePublished, g.datePublished, g.slug);
    assert.equal(ld.dateModified, g.dateModified, g.slug);
  }
  // India time, so 23:30 UTC is already the next day — as shown on the page.
  assert.equal(guideDateLabel('2026-07-12T12:51:56+05:30'), '12 July 2026');
  assert.equal(guideDateLabel('2026-07-12T23:30:00Z'), '13 July 2026');
});

test('Guides index: CollectionPage + ItemList of every guide URL', () => {
  const ld = guidesIndexJsonLd({ name: 'Guides', description: 'd', guides: GUIDES });
  assert.equal(ld['@type'], 'CollectionPage');
  assert.deepEqual(ld.mainEntity.itemListElement.map((e) => e.url), GUIDES.map((g) => `${WWW}/guides/${g.slug}/`));
});

test('Guide Article: headline/description/image from the guide, author+publisher by @id; dates only when the data has them', () => {
  for (const g of GUIDES) {
    const ld = guideArticleJsonLd(g);
    assert.equal(ld['@type'], 'Article');
    assert.equal(ld.headline, g.title);
    assert.equal(ld.description, g.desc);
    assert.equal(ld.image, `${WWW}${g.image}`);
    assert.deepEqual(ld.author, { '@id': ORG_ID });
    assert.deepEqual(ld.publisher, { '@id': ORG_ID });
    assert.equal(ld.mainEntityOfPage, `${WWW}/guides/${g.slug}/`);
    // A guide with a date field must have it in the markup; none without.
    for (const k of ['datePublished', 'dateModified']) {
      if (g[k]) assert.equal(ld[k], g[k], `${g.slug}.${k}`);
    }
    if (!g.datePublished && !g.dateModified) assert.ok(!('datePublished' in ld) && !('dateModified' in ld), g.slug);
  }
  // Every guide has both dates today (from git history, hard-coded).
  for (const g of GUIDES) {
    assert.match(g.datePublished || '', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/, `${g.slug}.datePublished`);
    assert.match(g.dateModified || '', /^\d{4}-\d{2}-\d{2}T/, `${g.slug}.dateModified`);
    assert.ok(g.dateModified >= g.datePublished, g.slug);
  }
  const dated = guideArticleJsonLd({ ...GUIDES[0], datePublished: '2026-03-14', dateModified: '2026-05-01' });
  assert.equal(dated.datePublished, '2026-03-14');
  assert.equal(dated.dateModified, '2026-05-01');
  assert.equal(guideArticleJsonLd({ ...GUIDES[0], datePublished: '2026-03-14', dateModified: undefined }).dateModified, '2026-03-14');
});

// ── Vendor ──────────────────────────────────────────────────────────────

const VENDOR = {
  _id: 'a'.repeat(24), businessName: 'Studio', description: 'Warm homes.', profilePhoto: '/images/x.jpg',
  rating: 0, reviewCount: 0,
  primaryCategory: { name: 'Architects', slug: 'architects', schemaOrgType: 'GeneralContractor' },
  location: { city: 'Mumbai', state: 'Maharashtra', lat: 19.1, lng: 72.9 },
  serviceLocations: [{ city: 'Thane', state: 'Maharashtra' }, { city: ' mumbai ', state: 'Maharashtra' }, { city: 'Pune', state: 'Maharashtra' }],
  specializations: ['Modular Kitchen', 'Residential'],
  services: [{ name: 'Full home', description: 'All rooms.', startingPrice: 1000 }, { name: 'modular kitchen', description: 'Kitchens.' }],
};

test('Vendor: @type from the primary category, HomeAndConstructionBusiness fallback', () => {
  assert.equal(vendorJsonLd(VENDOR)['@type'], 'GeneralContractor');
  assert.equal(vendorJsonLd({ ...VENDOR, primaryCategory: null })['@type'], DEFAULT_VENDOR_TYPE);
  assert.equal(DEFAULT_VENDOR_TYPE, 'HomeAndConstructionBusiness');
  assert.equal(vendorJsonLd({ ...VENDOR, primaryCategory: { name: 'X', slug: 'x' } })['@type'], DEFAULT_VENDOR_TYPE);
});

test('Vendor areaServed: location city + every serviceLocations city, deduped, names as stored', () => {
  assert.deepEqual(vendorAreasServed(VENDOR).map((c) => c.name), ['Mumbai', 'Thane', 'Pune']);
  assert.ok(vendorAreasServed(VENDOR).every((c) => c['@type'] === 'City'));
  assert.ok(!('areaServed' in vendorJsonLd({ ...VENDOR, location: {}, serviceLocations: [] })));
});

test('Vendor makesOffer: specializations and services as Service offers (deduped), no price', () => {
  const offers = vendorJsonLd(VENDOR).makesOffer;
  assert.deepEqual(offers.map((o) => o.itemOffered.name), ['Modular Kitchen', 'Residential', 'Full home']);
  assert.equal(offers[0].itemOffered.description, 'Kitchens.');
  assert.ok(offers.every((o) => o['@type'] === 'Offer' && o.itemOffered['@type'] === 'Service' && !('price' in o)));
  assert.ok(!('makesOffer' in vendorJsonLd({ ...VENDOR, specializations: [], services: [] })));
});

test('Vendor: no rating/review markup without stored reviews; no address/geo ever', () => {
  const ld = vendorJsonLd(VENDOR, []);
  for (const k of ['aggregateRating', 'review', 'address', 'geo']) assert.ok(!(k in ld), k);
  // rating set but reviewCount 0 (or vice versa) -> still none
  assert.ok(!('aggregateRating' in vendorJsonLd({ ...VENDOR, rating: 4.5, reviewCount: 0 })));
  assert.ok(!('aggregateRating' in vendorJsonLd({ ...VENDOR, rating: 0, reviewCount: 3 })));
});

test('Vendor: one Review per listed stored review; aggregateRating from stored rating/reviewCount', () => {
  const reviews = [
    { _id: '1', rating: 5, comment: 'Great', createdAt: '2026-04-02T10:00:00.000Z', leadId: { contactName: 'Asha' } },
    { _id: '2', rating: 4, comment: '', createdAt: '2026-04-03T10:00:00.000Z', userId: { name: 'Ravi' } },
  ];
  const ld = vendorJsonLd({ ...VENDOR, rating: 4.5, reviewCount: 2 }, reviews);
  assert.deepEqual(ld.aggregateRating, { '@type': 'AggregateRating', ratingValue: 4.5, reviewCount: 2, bestRating: 5, worstRating: 1 });
  assert.equal(ld.review.length, 2);
  assert.deepEqual(ld.review.map((r) => r.author.name), reviews.map(reviewAuthorName));
  assert.deepEqual(ld.review.map((r) => r.reviewRating.ratingValue), [5, 4]);
  assert.equal(ld.review[0].reviewBody, 'Great');
  assert.ok(!('reviewBody' in ld.review[1]));
  assert.equal(ld.review[0].datePublished, '2026-04-02');
});

// ── Project ─────────────────────────────────────────────────────────────

test('Project: genre = projectType; ImageObject name/caption = the alt text the page renders', () => {
  const project = {
    _id: 'b'.repeat(24), title: 'Flat', projectType: 'Kitchen', createdAt: '2026-01-02T00:00:00.000Z',
    images: ['https://x/1.jpg', 'https://x/2.jpg'], beforeImage: 'https://x/b.jpg', afterImage: 'https://x/1.jpg',
  };
  const ld = projectJsonLd(project, { _id: 'c'.repeat(24), businessName: 'Studio' });
  assert.equal(ld.genre, 'Kitchen');
  assert.equal(ld.creator.url, `${WWW}/vendors/${'c'.repeat(24)}/`);
  assert.deepEqual(ld.image.map((i) => [i.contentUrl, i.caption]), [
    ['https://x/b.jpg', beforeAlt(project)], ['https://x/1.jpg', afterAlt(project)], ['https://x/2.jpg', galleryAlt(project, 1)],
  ]);
  assert.ok(ld.image.every((i) => i.name === i.caption && !('width' in i) && !('height' in i)));
  // Before without after: the page shows no slider, so the image isn't marked up.
  assert.deepEqual(projectImages({ ...project, afterImage: '' }).map((i) => i.url), ['https://x/1.jpg', 'https://x/2.jpg']);
});

// ── Static source checks ────────────────────────────────────────────────

test('raw <script type="application/ld+json"> only in components/seo/JsonLd.jsx', () => {
  assert.deepEqual(SOURCES.filter((p) => p !== 'components/seo/JsonLd.jsx' && /application\/ld\+json/.test(read(p))), []);
});

test('Organization/WebSite defined only in the root layout; #organization/#website ids only in lib/structuredData.js', () => {
  assert.deepEqual(SOURCES.filter((p) => /organizationJsonLd\(\)|websiteJsonLd\(\)/.test(read(p)) && !p.startsWith('lib/')), ['app/layout.jsx']);
  assert.deepEqual(SOURCES.filter((p) => p !== 'lib/structuredData.js' && /#organization|#website/.test(read(p))), []);
});

test('contact/brand literals (business phone, emails, social URLs) live only in lib/siteConfig.js', () => {
  const digits = PHONE.e164.slice(3);
  const re = new RegExp(`${digits}|${digits.slice(0, 5)} ${digits.slice(5)}|${SUPPORT_EMAIL}|${SOCIAL_PROFILES.map((p) => p.url.replace(/^https:\/\//, '').replace(/\./g, '\\.')).join('|')}`, 'i');
  assert.deepEqual(SOURCES.filter((p) => p !== 'lib/siteConfig.js' && !p.startsWith('app/admin/') && re.test(read(p))), []);
});

test('footer, contact page and floating buttons read siteConfig', () => {
  for (const p of ['components/layout/Footer.jsx', 'app/(public)/contact/page.jsx', 'components/ui/WhatsAppButton.jsx', 'components/ui/StickyMobileCTA.jsx']) {
    assert.match(read(p), /from '@\/lib\/siteConfig'/, p);
  }
});

const BREADCRUMB_PAGES = [
  'app/(public)/about/page.jsx', 'app/(public)/contact/page.jsx', 'app/(public)/how-it-works/page.jsx',
  'app/(public)/faq/page.jsx', 'app/(vendor-site)/plans/PlansClient.jsx', 'app/(vendor-site)/for-designers/ForDesignersClient.jsx',
  'app/(vendor-site)/for-designers/privacy/page.jsx', 'app/(vendor-site)/for-designers/terms/page.jsx',
  'app/(public)/guides/page.jsx', 'app/(public)/guides/[slug]/page.jsx', 'app/(public)/gallery/page.jsx',
  'app/(public)/recent-projects/page.jsx', 'app/(public)/testimonials/page.jsx', 'app/(public)/design-styles/page.jsx',
  'app/(public)/design-styles/[style]/page.jsx', 'app/(public)/cities/[city]/page.jsx', 'app/(public)/vendors/(list)/page.jsx',
  'app/(public)/terms/page.jsx', 'app/(public)/privacy/page.jsx',
  // already had one
  'app/(public)/[category]/page.jsx', 'app/(public)/[category]/[state]/page.jsx', 'app/(public)/[category]/[state]/[city]/page.jsx',
  'app/(public)/vendors/[vendorId]/page.jsx', 'app/(public)/projects/[projectId]/page.jsx',
];

test('every content page renders the shared visible Breadcrumb (which also emits the BreadcrumbList)', () => {
  for (const p of BREADCRUMB_PAGES) assert.match(read(p), /<Breadcrumb\s/, p);
  assert.match(read('components/seo/Breadcrumb.jsx'), /breadcrumbJsonLd\(items\)/);
  // The vendor page always has one (primary-city trail, category, or Designers fallback).
  assert.doesNotMatch(read('app/(public)/vendors/[vendorId]/page.jsx'), /breadcrumbItems &&/);
});

test('FAQ markup is built from the array the FAQ renders; /how-it-works/ has none', () => {
  const faq = read('app/(public)/faq/page.jsx');
  assert.match(faq, /faqPageJsonLd\(\{[^}]*items: faqItems\(FAQ_GROUPS\)/);
  assert.match(faq, /<FaqContent groups=\{FAQ_GROUPS\}/);
  assert.doesNotMatch(read('app/(public)/how-it-works/page.jsx'), /faqPageJsonLd|'FAQPage'/);
});

test('Product/Offer markup only on /plans/, from the same plans the cards render', () => {
  const plans = read('app/(vendor-site)/plans/page.jsx');
  assert.match(plans, /<JsonLd data=\{plansJsonLd\(plans\)\} \/>\s*<PlansClient plans=\{plans\} \/>/);
  assert.deepEqual(SOURCES.filter((p) => /plansJsonLd\(/.test(read(p)) && !p.startsWith('lib/')), ['app/(vendor-site)/plans/page.jsx']);
  assert.deepEqual(SOURCES.filter((p) => p !== 'lib/structuredData.js' && /'@type': 'Product'/.test(read(p))), []);
});

test('vendor and project pages render from the same helpers as their markup', () => {
  const vendor = read('app/(public)/vendors/[vendorId]/page.jsx');
  assert.match(vendor, /vendorJsonLd\(vendor, reviews\)/);
  assert.match(vendor, /\{reviewAuthorName\(review\)\}/);
  const project = read('app/(public)/projects/[projectId]/page.jsx');
  assert.match(project, /alt=\{galleryAlt\(project, i\)\}/);
  assert.match(project, /beforeAlt=\{beforeAlt\(project\)\}/);
  assert.match(project, /afterAlt=\{afterAlt\(project\)\}/);
  assert.match(project, /projectJsonLd\(project, vendor\)/);
});

test('no page-level block carries an apex-host or non-https own URL', () => {
  const blocks = [organizationJsonLd(), websiteJsonLd(), aboutPageJsonLd({ name: 'a' }), contactPageJsonLd({ name: 'c' }),
    guidesIndexJsonLd({ name: 'g', guides: GUIDES }), ...GUIDES.map(guideArticleJsonLd), vendorJsonLd(VENDOR)];
  for (const u of blocks.flatMap(urlsIn).filter(ownHost)) assert.ok(u.startsWith(`${WWW}/`), u);
  assert.ok(!blocks.flatMap(typesIn).includes('Product'));
});

console.log(`\n${passed} passed`);
