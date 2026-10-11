import { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/seo/Breadcrumb';
import LandingBanner from '@/components/seo/LandingBanner';
import LandingPreviewStrip from '@/components/seo/LandingPreviewStrip';
import {
  authoredContent as resolveAuthored, authoredRobots, buildFaqJsonLd, FaqSection, LandingIntro, LandingSections,
  visibleFaqItems, visibleSections,
} from '@/components/seo/LandingAuthored';
import Reveal from '@/components/ui/Reveal';
import RevealItem from '@/components/ui/RevealItem';
import VendorCard from '@/components/vendor/VendorCard';
import { SERVICE_CATEGORIES } from '@/lib/categories';
import { fetchLandingData } from '@/lib/landingHub';
import { landingPreviewToken } from '@/lib/landingDraft';
import { cachedJson } from '@/lib/cachedFetch';
import { placeholderValues } from '@/lib/landingLevel';
import { landingPageTitle } from '@/lib/landingSerp';
import { SITE_URL } from '@/lib/siteUrl';
import { LIST_WINDOW, TAGS } from '@/lib/cacheTags';

const API = process.env.NEXT_PUBLIC_API_URL;

// Cached (ISR, 5 min) per city, purged by the backend on landing-page and
// vendor writes (tags landing, vendors, taxonomy + the page path). Nothing
// is built ahead; each path is rendered on its first request. An admin
// preview is draft mode (app/api/landing-preview/): those requests bypass
// the cache, and only they fetch the draft — uncached, with the token.
export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

// The category-cities lookups below only drive the "nearby cities" and
// "related categories" links: data cache for 1 h, purged on 'taxonomy' and
// on 'vendors' (a vendor arriving in a new city changes them). A function,
// not a shared object: Next's fetch deletes `init.next` from the object it
// is given, so a reused object would leave every later call untagged.
const taxonomyFetch = () => ({ next: { revalidate: 3600, tags: [TAGS.TAXONOMY, TAGS.VENDORS] } });

// 404 (inactive / unknown category) -> null -> notFound(); any other
// failure throws, so a backend blip is never cached as a 404.
async function fetchCategory(slug) {
  const json = await cachedJson(`${API}/public/service-categories/${encodeURIComponent(slug)}`, {
    revalidate: LIST_WINDOW, tags: [TAGS.TAXONOMY], nullOn404: true,
  });
  return json?.data?.category ?? null;
}

async function fetchVendors(categorySlug, stateSlug, citySlug) {
  // 404 (unknown state/city) -> null -> notFound(); a 500 or network error
  // throws instead — never a cached 404 for a real city.
  const json = await cachedJson(
    `${API}/public/vendors?category=${encodeURIComponent(categorySlug)}&state=${encodeURIComponent(stateSlug)}&city=${encodeURIComponent(citySlug)}`,
    { revalidate: LIST_WINDOW, tags: [TAGS.VENDORS], nullOn404: true },
  );
  return json?.data ?? null;
}

// Admin-managed landing pages: lib/landingHub.js (cached publicly; the
// draft, uncached, only with a draft-mode preview token).

// React cache() so generateMetadata and the page share one fetch of each
// per request. The landing page and the automatic page's vendor lookup run
// in parallel — which one renders isn't known until the landing response
// arrives. The preview token is part of loadCity's cache() key.
const loadCategory = cache(fetchCategory);
const loadCity = cache(async (categorySlug, stateSlug, citySlug, preview) => {
  const [landing, data] = await Promise.all([
    fetchLandingData({ category: categorySlug, state: stateSlug, city: citySlug }, preview),
    fetchVendors(categorySlug, stateSlug, citySlug),
  ]);
  return { landing, data };
});

async function load(params) {
  const [category, { landing, data }] = await Promise.all([
    loadCategory(params.category),
    loadCity(params.category, params.state, params.city, landingPreviewToken()),
  ]);
  return { category, landing, data };
}

// Display names come from the record (state/city are free text there, and
// the city may not exist in Place at all); every authored text field has
// its placeholders resolved (components/seo/LandingAuthored.jsx).
function authoredContent(category, landing) {
  const { page, vendorCount } = landing;
  const content = resolveAuthored(page, placeholderValues('city', {
    city: page.city, state: page.state, categoryName: category.name, vendorCount,
  }));
  return { ...content, city: page.city, state: page.state };
}

async function fetchFAQ(categorySlug, stateSlug, citySlug) {
  const json = await cachedJson(
    `${API}/public/city-faq?category=${encodeURIComponent(categorySlug)}&state=${encodeURIComponent(stateSlug)}&city=${encodeURIComponent(citySlug)}`,
    { revalidate: LIST_WINDOW, tags: [TAGS.TAXONOMY], nullOn404: true },
  );
  return json?.data?.faq ?? null;
}

// Step 10: "nearby cities, same category" — other cities in the SAME STATE
// with real vendor presence in this category, excluding the current city.
// Reuses GET /public/category-cities as-is (Step 4) — no new backend
// endpoint needed. Bounded to same-state rather than a looser cross-state
// fallback: Place has no lat/lng or adjacency data, and presenting an
// unrelated-state city (e.g. Delhi) as "nearby" a South Indian city (e.g.
// Bengaluru) would be a geographic claim with no real data behind it —
// same-state membership is the one defensible proximity signal actually
// available, and matches the SEO doc's own example (Ahmedabad <-> Vadodara,
// both Gujarat). Renders nothing when the state has no other city in this
// category — true for most states today (only Maharashtra and Uttar
// Pradesh currently have 2+ interior-designers cities each).
async function fetchNearbyCities(categorySlug, stateSlug, currentCitySlug) {
  try {
    const res = await fetch(
      `${API}/public/category-cities?category=${encodeURIComponent(categorySlug)}&state=${encodeURIComponent(stateSlug)}`,
      taxonomyFetch()
    );
    if (!res.ok) return [];
    const json = await res.json();
    const cities = json.data?.cities || [];
    return cities.filter((c) => c.citySlug !== currentCitySlug);
  } catch {
    return [];
  }
}

// Step 10: "related categories, same city" — which OTHER categories have
// real vendor presence in this exact city (same state). No existing
// endpoint answers "which categories exist in city X" directly, and
// GET /public/vendors/category-cities are both scoped to one category at a
// time — but looping the existing category-cities endpoint over every
// other category (12 parallel requests, cheap) answers it without adding
// new backend surface. A category's own real/active check comes for free:
// category-cities 404s for an inactive or nonexistent category slug, which
// this treats as "no match" rather than an error. Given today's real data
// (only interior-designers has any vendor presence at all, per Steps 1-9),
// this returns [] for every city right now — expected, not a bug; designed
// for when other categories gain real vendors, not to look populated today.
async function fetchRelatedCategories(currentCategorySlug, stateSlug, citySlug) {
  const others = SERVICE_CATEGORIES.filter((c) => c.slug !== currentCategorySlug);
  const results = await Promise.all(
    others.map(async (c) => {
      try {
        const res = await fetch(
          `${API}/public/category-cities?category=${encodeURIComponent(c.slug)}&state=${encodeURIComponent(stateSlug)}`,
          taxonomyFetch()
        );
        if (!res.ok) return null;
        const json = await res.json();
        const cities = json.data?.cities || [];
        return cities.some((city) => city.citySlug === citySlug) ? c : null;
      } catch {
        return null;
      }
    })
  );
  return results.filter(Boolean);
}

function buildBusinessJsonLd(category, city) {
  // Category's own schema.org business type (e.g. HomeAndConstructionBusiness,
  // GeneralContractor, FurnitureStore) — not the generic Service block the
  // category/state pages use, per the SEO doc's section 5. Product/Offer
  // schema intentionally doesn't belong here (only /pricing/ per the doc).
  return {
    '@context': 'https://schema.org',
    '@type': category.schemaOrgType,
    name: `${category.name} in ${city}`,
    areaServed: city,
    provider: { '@id': `${SITE_URL}/#organization` },
  };
}

function buildCollectionJsonLd(category, city, state, vendors) {
  if (vendors.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} in ${city}, ${state}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: vendors.map((v, i) => {
        const image = v.profilePhoto || v.cardImages?.[0] || v.bannerImage || undefined;
        // Only real review data earns an aggregateRating — an unrated
        // vendor (rating 0 / reviewCount 0, true for everyone here today)
        // gets none, rather than fabricated 0-star markup.
        const aggregateRating = v.rating > 0 && v.reviewCount > 0
          ? { '@type': 'AggregateRating', ratingValue: v.rating, reviewCount: v.reviewCount }
          : undefined;
        return {
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': category.schemaOrgType,
            name: v.businessName,
            url: `${SITE_URL}/vendors/${v._id}/`,
            ...(image && { image }),
            ...(aggregateRating && { aggregateRating }),
          },
        };
      }),
    },
  };
}

// Nearby cities + related services, shared by both page variants.
function RelatedLinks({ params, category, state, city, nearbyCities, relatedCategories }) {
  return (
    <>
      {/* Step 10: contextual internal linking (SEO doc section 15) — both
          sections render nothing when there's genuinely no related
          content, never a placeholder/empty heading. */}
      {nearbyCities.length > 0 && (
        <section style={{ marginTop: '48px' }}>
          <p className="caps-label-primary" style={{ marginBottom: '10px' }}>NEARBY CITIES</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, color: 'var(--text)', marginBottom: '16px' }}>
            {category.name} in other {state} cities
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {nearbyCities.map((c) => (
              <Link
                key={c.citySlug}
                href={`/${params.category}/${params.state}/${c.citySlug}/`}
                style={{
                  display: 'block', padding: '10px 16px', borderRadius: 'var(--r-md)',
                  border: '1px solid var(--border)', background: 'var(--surface)',
                  textDecoration: 'none', color: 'var(--text)', fontSize: '13px',
                }}
              >
                {category.name} in {c.city}
              </Link>
            ))}
          </div>
        </section>
      )}

      {relatedCategories.length > 0 && (
        <section style={{ marginTop: '48px' }}>
          <p className="caps-label-primary" style={{ marginBottom: '10px' }}>RELATED SERVICES IN {city.toUpperCase()}</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, color: 'var(--text)', marginBottom: '16px' }}>
            Other services available in {city}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {relatedCategories.map((c) => (
              <Link
                key={c.slug}
                href={`/${c.slug}/${params.state}/${params.city}/`}
                style={{
                  display: 'block', padding: '10px 16px', borderRadius: 'var(--r-md)',
                  border: '1px solid var(--border)', background: 'var(--surface)',
                  textDecoration: 'none', color: 'var(--text)', fontSize: '13px',
                }}
              >
                {c.name} in {city}
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export async function generateMetadata({ params }) {
  const { category, landing, data } = await load(params);
  if (!category) return { title: 'Category Not Found' };

  if (landing?.page) {
    const { city, state, seo, banner } = authoredContent(category, landing);
    const ogImage = seo.ogImage || banner.imageUrl;
    return {
      // Root layout's title template appends " | Intrafer"; shared with the
      // editor's Google-snippet preview (lib/landingSerp.js).
      title: landingPageTitle({ metaTitle: seo.metaTitle, categoryName: category.name, city, state }),
      ...(seo.metaDescription && { description: seo.metaDescription }),
      ...(ogImage && { openGraph: { images: [ogImage] } }),
      // `indexable` is computed backend-side from the page's seo.indexing
      // (auto = the same vendor threshold as the automatic page); previews
      // are noindex, nofollow and no-referrer (see authoredRobots).
      ...authoredRobots(landing),
      alternates: { canonical: `${SITE_URL}/${params.category}/${params.state}/${params.city}/` },
    };
  }

  if (!data) return { title: 'City Not Found' };

  return {
    // Root layout's title template already appends " | Intrafer".
    title: `${category.name} in ${data.city}, ${data.state}`,
    // Step 12: real threshold-based indexation, replacing Step 5's
    // hardcoded blanket noindex. `data.meetsThreshold` comes straight from
    // GET /public/vendors (computed backend-side by
    // meetsIndexThreshold/MIN_VENDORS_TO_INDEX, src/utils/indexThreshold.js
    // — kept in one place rather than duplicating that constant here),
    // using the real, pagination-unaffected vendor count for this exact
    // category+state+city. Below threshold: keep the noindex override.
    // At/above threshold: omit the robots key entirely, matching how
    // indexable pages elsewhere (Steps 6/8/9) declare it.
    ...(!data.meetsThreshold && { robots: { index: false, follow: true } }),
    alternates: { canonical: `${SITE_URL}/${params.category}/${params.state}/${params.city}/` },
  };
}

export default async function CityHubPage({ params }) {
  const { category, landing, data } = await load(params);
  if (!category) notFound();

  // A published authored page renders even when the city isn't in Place
  // (the automatic page's 404 rule); the category 404 above still applies.
  if (landing?.page) return <AuthoredCityPage params={params} category={category} landing={landing} />;

  if (!data) notFound();

  const { state, city, vendors } = data;
  const faq = await fetchFAQ(params.category, params.state, params.city);
  const hasFaq = faq && faq.questions?.length > 0;

  const [nearbyCities, relatedCategories] = await Promise.all([
    fetchNearbyCities(params.category, params.state, params.city),
    fetchRelatedCategories(params.category, params.state, params.city),
  ]);

  const businessJsonLd = buildBusinessJsonLd(category, city);
  const collectionJsonLd = buildCollectionJsonLd(category, city, state, vendors);
  const faqJsonLd = !hasFaq ? null : buildFaqJsonLd(faq.questions);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '108px 40px 80px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
      />
      {collectionJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
        />
      )}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: category.name, href: `/${params.category}/` },
        { label: state, href: `/${params.category}/${params.state}/` },
        { label: city },
      ]} />

      <Reveal>
        <p className="caps-label-primary" style={{ marginBottom: '10px' }}>SERVICE CATEGORY</p>
        <h1 className="section-heading" style={{ marginBottom: '16px' }}>{category.name} in {city}, {state}</h1>
        <p style={{ fontSize: '15px', color: 'var(--text-mid)', lineHeight: 1.8, maxWidth: '680px', marginBottom: '40px' }}>
          Find verified {category.name.toLowerCase()} in {city}.
        </p>
      </Reveal>

      {vendors.length > 0 ? (
        // Renders whatever page 1 of GET /api/public/vendors returns — no
        // real pagination UI yet since no city has more than a couple of
        // listings today. `total`/`totalPages` from the response are
        // available but unused; revisit before any city with heavy listing
        // volume goes live, so results past page 1 aren't silently hidden.
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '20px' }}>
          {vendors.map((v, i) => (
            <RevealItem key={v._id} index={i % 6}>
              {/* Step 11: no hero image above this grid on this page, so the
                  first card is plausibly the LCP element — eager-load just
                  that one (and the second, in case the first is off-viewport
                  on a narrow layout), lazy for the rest. */}
              <VendorCard vendor={v} priority={i < 2} />
            </RevealItem>
          ))}
        </div>
      ) : (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px',
          padding: '48px', textAlign: 'center',
        }}>
          <p style={{ fontSize: '15px', color: 'var(--text-mid)' }}>
            No {category.name.toLowerCase()} listed yet in {city}, {state}.
          </p>
        </div>
      )}

      {hasFaq && <FaqSection title="Frequently asked questions" questions={faq.questions} />}

      <RelatedLinks params={params} category={category} state={state} city={city} nearbyCities={nearbyCities} relatedCategories={relatedCategories} />
    </div>
  );
}

// Admin-authored version of this page (landing pages, Phase 2): banner,
// authored h1/intro, the landing response's vendor list, then the authored
// sections in order. Disabled or empty sections render nothing.
async function AuthoredCityPage({ params, category, landing }) {
  const { city, state, banner, heading, intro, sections } = authoredContent(category, landing);
  const { vendors } = landing;
  const shown = visibleSections(sections);

  const [nearbyCities, relatedCategories] = await Promise.all([
    fetchNearbyCities(params.category, params.state, params.city),
    fetchRelatedCategories(params.category, params.state, params.city),
  ]);

  const businessJsonLd = buildBusinessJsonLd(category, city);
  const collectionJsonLd = buildCollectionJsonLd(category, city, state, vendors);
  // Every enabled FAQ section's items, exactly as rendered below.
  const faqItems = visibleFaqItems(shown);
  const faqJsonLd = faqItems.length === 0 ? null : buildFaqJsonLd(faqItems);

  // With a banner image, that image is the LCP — no vendor card competes
  // for priority. Without one, same first-two-cards rule as the automatic page.
  const hasBannerImage = Boolean(banner.imageUrl);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '108px 40px 80px' }}>
      {landing.preview === true && <LandingPreviewStrip published={landing.page.status === 'published'} path={`/${params.category}/${params.state}/${params.city}/`} />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
      />
      {collectionJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
        />
      )}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: category.name, href: `/${params.category}/` },
        { label: state, href: `/${params.category}/${params.state}/` },
        { label: city },
      ]} />

      <LandingBanner banner={banner} />

      <LandingIntro
        heading={heading}
        defaultHeading={`${category.name} in ${city}, ${state}`}
        intro={intro}
        defaultBlurb={<>Find verified {category.name.toLowerCase()} in {city}.</>}
      />

      {vendors.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '20px' }}>
          {vendors.map((v, i) => (
            <RevealItem key={v._id} index={i % 6}>
              <VendorCard vendor={v} priority={!hasBannerImage && i < 2} />
            </RevealItem>
          ))}
        </div>
      ) : (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px',
          padding: '48px', textAlign: 'center',
        }}>
          <p style={{ fontSize: '15px', color: 'var(--text-mid)' }}>
            No {category.name.toLowerCase()} listed yet in {city}, {state}.
          </p>
        </div>
      )}

      <LandingSections sections={shown} localitiesTitle={`Localities in ${city}`} />

      <RelatedLinks params={params} category={category} state={state} city={city} nearbyCities={nearbyCities} relatedCategories={relatedCategories} />
    </div>
  );
}
