// JSON-LD for a designer (vendor) profile, /vendors/<id>/. Pure, so
// scripts/testStructuredData.mjs unit-tests it. Built from the same vendor
// document and review list the page renders.
//
// - @type: the vendor's primary ServiceCategory's schemaOrgType (the same
//   source the /[category]/... pages use); HomeAndConstructionBusiness when
//   the vendor has no category or the category has no type.
// - A vendor has ONE ServiceCategory (Vendor.primaryCategory). What else it
//   offers is its specializations and services, emitted as
//   makesOffer -> Offer -> itemOffered Service (names as shown on the page;
//   no price — Product/priced Offer markup stays on /plans/ only).
// - areaServed: every city the vendor serves (location.city + every
//   serviceLocations[].city), deduped case-insensitively, first spelling kept.
// - Review entries: only the stored reviews the page lists; aggregateRating
//   only when the stored rating and review count are both > 0.
// - No address / geo (the page shows city and state only).

import { absoluteUrl } from './siteUrl.js';

export const SCHEMA_CONTEXT = 'https://schema.org';
export const DEFAULT_VENDOR_TYPE = 'HomeAndConstructionBusiness';

export const vendorPath = (vendor) => `/vendors/${vendor._id}/`;
export const vendorBusinessId = (vendor) => `${absoluteUrl(vendorPath(vendor))}#business`;

// The page and the schema share this: "who wrote it" exactly as displayed.
export const reviewAuthorName = (review) => review?.leadId?.contactName || review?.userId?.name || 'Anonymous';

const absolutize = (src) => (typeof src === 'string' && src.startsWith('/') ? absoluteUrl(src) : src);
const clean = (s) => (typeof s === 'string' ? s.trim() : '');

export function vendorAreasServed(vendor) {
  const names = [vendor?.location?.city, ...(vendor?.serviceLocations || []).map((l) => l?.city)];
  const seen = new Set();
  const out = [];
  for (const raw of names) {
    const name = clean(raw);
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    out.push({ '@type': 'City', name });
  }
  return out;
}

export function vendorOffers(vendor) {
  const entries = [
    ...(vendor?.specializations || []).map((name) => ({ name: clean(name) })),
    ...(vendor?.services || []).map((s) => ({ name: clean(s?.name), description: clean(s?.description) })),
  ];
  const byName = new Map();
  for (const e of entries) {
    if (!e.name) continue;
    const key = e.name.toLowerCase();
    const prev = byName.get(key);
    if (!prev) byName.set(key, e);
    else if (!prev.description && e.description) prev.description = e.description;
  }
  return [...byName.values()].map((e) => ({
    '@type': 'Offer',
    itemOffered: { '@type': 'Service', name: e.name, ...(e.description && { description: e.description }) },
  }));
}

function reviewJsonLd(review) {
  const date = review?.createdAt ? new Date(review.createdAt) : null;
  return {
    '@type': 'Review',
    author: { '@type': 'Person', name: reviewAuthorName(review) },
    reviewRating: { '@type': 'Rating', ratingValue: review.rating, bestRating: 5, worstRating: 1 },
    ...(date && !Number.isNaN(date.getTime()) && { datePublished: date.toISOString().slice(0, 10) }),
    ...(clean(review.comment) && { reviewBody: clean(review.comment) }),
  };
}

// `reviews`: exactly the list the page renders (GET /reviews/vendor/:id).
export function vendorJsonLd(vendor, reviews = []) {
  const url = absoluteUrl(vendorPath(vendor));
  const listed = (Array.isArray(reviews) ? reviews : []).filter((r) => Number.isFinite(r?.rating) && r.rating >= 1 && r.rating <= 5);
  const areas = vendorAreasServed(vendor);
  const offers = vendorOffers(vendor);
  const v = vendor;
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': v.primaryCategory?.schemaOrgType || DEFAULT_VENDOR_TYPE,
    '@id': vendorBusinessId(v),
    name: v.businessName,
    url,
    ...(clean(v.description) && { description: clean(v.description) }),
    ...(v.profilePhoto && { image: absolutize(v.profilePhoto) }),
    ...(areas.length > 0 && { areaServed: areas }),
    ...(offers.length > 0 && { makesOffer: offers }),
    ...(listed.length > 0 && { review: listed.map(reviewJsonLd) }),
    // Only real review data earns an aggregateRating.
    ...(v.rating > 0 && v.reviewCount > 0 && {
      aggregateRating: { '@type': 'AggregateRating', ratingValue: v.rating, reviewCount: v.reviewCount, bestRating: 5, worstRating: 1 },
    }),
  };
}
