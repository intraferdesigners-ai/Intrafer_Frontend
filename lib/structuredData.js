// Sitewide and page-level JSON-LD builders. Pure (no React, no fetch), so
// scripts/testStructuredData.mjs unit-tests them directly; pages render the
// result with components/seo/JsonLd.jsx.
//
// Ground rules (see the structured-data task list):
// - Organization and WebSite are defined ONCE, in the root layout, with the
//   @ids below; every page-level block points at them by @id only.
// - Every value comes from the API, from lib/siteConfig.js or from the same
//   data array the page renders — nothing is typed in here.
// - A property with no real value is left out, never filled with a guess.
//
// Vendor and project builders live in lib/vendorSchema.js and
// lib/projectSchema.js (scripts/testClaims.mjs keeps ratings out of any file
// that also builds the Organization/WebSite entities).

import { absoluteUrl } from './siteUrl.js';
import {
  AREA_SERVED, AVAILABLE_LANGUAGES, LOGO_PATH, ORG_EMAIL, PHONE, SITE_NAME, SOCIAL_PROFILES,
} from './siteConfig.js';
import { PLAN_FEATURES, planLabel, planPeriod } from './plans.js';
import { FOR_DESIGNERS_LEAD, FOR_DESIGNERS_TITLE } from './forDesignersCopy.js';

export const SCHEMA_CONTEXT = 'https://schema.org';
export const ORG_ID = absoluteUrl('/#organization');
export const WEBSITE_ID = absoluteUrl('/#website');
export const CONTACT_POINT_ID = absoluteUrl('/#contactpoint');
export const PLANS_PATH = '/plans/';

export const idRef = (id) => ({ '@id': id });

// JSON for a JSON-LD <script> element: `<`, `>` and `&` are
// escaped (still valid JSON) so a stored string containing "</script>" can
// never end the tag early; U+2028/2029 are escaped for old JS parsers.
export function serializeJsonLd(data) {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

// ── Sitewide entities (root layout) ─────────────────────────────────────

export function contactPoint() {
  return {
    '@type': 'ContactPoint',
    '@id': CONTACT_POINT_ID,
    contactType: 'customer support',
    telephone: PHONE.e164,
    email: ORG_EMAIL,
    areaServed: AREA_SERVED,
    availableLanguage: [...AVAILABLE_LANGUAGES],
    hoursAvailable: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [...PHONE.hours.days],
      opens: PHONE.hours.opens,
      closes: PHONE.hours.closes,
    },
  };
}

export function organizationJsonLd() {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    url: absoluteUrl('/'),
    logo: absoluteUrl(LOGO_PATH),
    telephone: PHONE.e164,
    email: ORG_EMAIL,
    contactPoint: [contactPoint()],
    sameAs: SOCIAL_PROFILES.map((p) => p.url),
  };
}

// No SearchAction: the site has no free-text search-results URL (/vendors/
// filters by city/locality/specialization only), see the task report.
export function websiteJsonLd() {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: absoluteUrl('/'),
    inLanguage: 'en',
    publisher: idRef(ORG_ID),
  };
}

// ── Breadcrumbs ─────────────────────────────────────────────────────────

// items: [{ label, href }], first to last; the last one (the current page)
// has no href and so no `item` URL, per schema.org's breadcrumb guidance.
export function breadcrumbJsonLd(items) {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  };
}

// ── Page-level blocks ───────────────────────────────────────────────────

// url, @id, language and the WebSite link every page-level block carries.
// `idSuffix` keeps two blocks on one page (e.g. a hub's CollectionPage and
// its FAQPage) from sharing an @id.
export const pageNode = (path, idSuffix = '#webpage') => ({
  '@id': `${absoluteUrl(path)}${idSuffix}`,
  url: absoluteUrl(path),
  inLanguage: 'en',
  isPartOf: idRef(WEBSITE_ID),
});

export function webPageJsonLd({ type = 'WebPage', path, name, description, idSuffix, ...extra }) {
  const { url, ...node } = pageNode(path, idSuffix);
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': type,
    '@id': node['@id'],
    url,
    name,
    ...(description && { description }),
    inLanguage: 'en',
    isPartOf: idRef(WEBSITE_ID),
    ...extra,
  };
}

export const aboutPageJsonLd = ({ name, description }) => webPageJsonLd({
  type: 'AboutPage', path: '/about/', name, description, about: idRef(ORG_ID), mainEntity: idRef(ORG_ID),
});

export const contactPageJsonLd = ({ name, description }) => webPageJsonLd({
  type: 'ContactPage', path: '/contact/', name, description, about: idRef(ORG_ID), mainEntity: idRef(CONTACT_POINT_ID),
});

// items: [{ q, a }] — the SAME array the page renders, so the markup's text
// is the visible text word for word.
export function faqPageJsonLd({ path, name, items }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return webPageJsonLd({
    type: 'FAQPage',
    path,
    idSuffix: '#faq',
    name,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  });
}

// ── /plans/ ─────────────────────────────────────────────────────────────

// Paise (the API's unit, see lib/utils.js formatINR) -> rupees, as a number.
export const planPriceInr = (plan) => plan.price / 100;
export const planSlug = (plan) => String(plan.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// One Product + Offer per tier, from the same plans array that renders the
// price cards. Description = the card's own copy (term + the feature list
// every card shows). No priceValidUntil: plans have no end date.
export function plansJsonLd(plans) {
  const list = Array.isArray(plans) ? plans.filter((p) => Number.isFinite(p?.price)) : [];
  if (list.length === 0) return null;
  const url = absoluteUrl(PLANS_PATH);
  return {
    '@context': SCHEMA_CONTEXT,
    '@graph': list.map((plan) => ({
      '@type': 'Product',
      '@id': `${url}#plan-${planSlug(plan)}`,
      name: planLabel(plan),
      description: `For ${planPeriod(plan)}: ${PLAN_FEATURES.join(', ')}.`,
      brand: idRef(ORG_ID),
      offers: {
        '@type': 'Offer',
        price: planPriceInr(plan),
        priceCurrency: 'INR',
        // The page states "All prices exclusive of GST".
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: planPriceInr(plan),
          priceCurrency: 'INR',
          valueAddedTaxIncluded: false,
        },
        availability: 'https://schema.org/InStock',
        url,
        seller: idRef(ORG_ID),
      },
    })),
  };
}

// ── /guides/ ────────────────────────────────────────────────────────────

export const guidePath = (guide) => `/guides/${guide.slug}/`;

export function guidesIndexJsonLd({ name, description, guides }) {
  return webPageJsonLd({
    type: 'CollectionPage',
    path: '/guides/',
    name,
    description,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: guides.map((g, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: absoluteUrl(guidePath(g)),
        name: g.title,
      })),
    },
  });
}

// Dates only when the guide's source data has them (lib/guides-data.js:
// datePublished / dateModified, ISO 8601) — none do today.
export function guideArticleJsonLd(guide) {
  const url = absoluteUrl(guidePath(guide));
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: guide.title,
    ...(guide.desc && { description: guide.desc }),
    ...(guide.image && { image: absoluteUrl(guide.image) }),
    ...(guide.category && { articleSection: guide.category }),
    inLanguage: 'en',
    author: idRef(ORG_ID),
    publisher: idRef(ORG_ID),
    mainEntityOfPage: url,
    isPartOf: idRef(WEBSITE_ID),
    ...(guide.datePublished && { datePublished: guide.datePublished }),
    ...((guide.dateModified || guide.datePublished) && { dateModified: guide.dateModified || guide.datePublished }),
  };
}

// ── /for-designers/ ─────────────────────────────────────────────────────

// Name and description: the page's own title and hero copy.
export const forDesignersJsonLd = () => webPageJsonLd({
  path: '/for-designers/',
  name: FOR_DESIGNERS_TITLE,
  description: FOR_DESIGNERS_LEAD,
  about: idRef(ORG_ID),
  audience: { '@type': 'BusinessAudience', audienceType: 'Interior designers' },
});
