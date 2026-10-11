import { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/seo/Breadcrumb';
import LandingBanner from '@/components/seo/LandingBanner';
import LandingPreviewStrip from '@/components/seo/LandingPreviewStrip';
import LandingTopVendors from '@/components/seo/LandingTopVendors';
import {
  authoredContent, authoredRobots, buildFaqJsonLd, LandingIntro, LandingSections, visibleFaqItems, visibleSections,
} from '@/components/seo/LandingAuthored';
import Reveal from '@/components/ui/Reveal';
import { fetchHubLandingPage, previewToken } from '@/lib/landingHub';
import { placeholderValues } from '@/lib/landingLevel';
import { landingPageTitle } from '@/lib/landingSerp';
import { SITE_URL } from '@/lib/siteUrl';

const API = process.env.NEXT_PUBLIC_API_URL;

async function fetchCategory(slug) {
  try {
    const res = await fetch(`${API}/public/service-categories/${encodeURIComponent(slug)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.category ?? null;
  } catch {
    return null;
  }
}

// Returns { state, cities } on a real state (cities may be empty), or null
// if the state segment doesn't match any real Indian state at all — the
// caller uses that to tell "empty state" apart from "404".
async function fetchCities(categorySlug, stateSlug) {
  try {
    const res = await fetch(
      `${API}/public/category-cities?category=${encodeURIComponent(categorySlug)}&state=${encodeURIComponent(stateSlug)}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

// Admin-authored state pages (Phase 4C): the landing page is fetched in
// parallel with the automatic page's data, shared by generateMetadata and
// the page through React cache() (the preview token is part of the key).
// No published page — or any failure — means `landing.page` is null and
// everything below renders exactly as before.
const loadCategory = cache(fetchCategory);
const loadState = cache(async (categorySlug, stateSlug, preview) => {
  const [landing, data] = await Promise.all([
    fetchHubLandingPage({ category: categorySlug, state: stateSlug }, preview),
    fetchCities(categorySlug, stateSlug),
  ]);
  return { landing, data };
});

async function load(params, searchParams) {
  const [category, { landing, data }] = await Promise.all([
    loadCategory(params.category),
    loadState(params.category, params.state, previewToken(searchParams)),
  ]);
  return { category, landing, data };
}

// Display name from the record, as on city pages (state is free text there
// and may not be in Place at all); placeholders resolved, {{city}} empty.
function stateContent(category, landing) {
  const { page, vendorCount } = landing;
  const content = authoredContent(page, placeholderValues('state', {
    state: page.state, categoryName: category.name, vendorCount,
  }));
  return { ...content, state: page.state };
}

function buildServiceJsonLd(category, state) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: category.name,
    serviceType: category.name,
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: state,
  };
}

function buildCollectionJsonLd(params, category, state, cities) {
  if (cities.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} in ${state}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: cities.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.city,
        url: `${SITE_URL}/${params.category}/${params.state}/${c.citySlug}/`,
      })),
    },
  };
}

export async function generateMetadata({ params, searchParams }) {
  const { category, landing, data } = await load(params, searchParams);
  if (!category) return { title: 'Category Not Found' };

  if (landing?.page) {
    const { state, seo, banner } = stateContent(category, landing);
    const ogImage = seo.ogImage || banner.imageUrl;
    return {
      title: landingPageTitle({ metaTitle: seo.metaTitle, categoryName: category.name, state, level: 'state' }),
      ...(seo.metaDescription && { description: seo.metaDescription }),
      ...(ogImage && { openGraph: { images: [ogImage] } }),
      // Hubs stay indexable (no robots key) unless the page is set to
      // noindex; previews are noindex, nofollow, no-referrer.
      ...authoredRobots(landing),
      alternates: { canonical: `${SITE_URL}/${params.category}/${params.state}/` },
    };
  }

  if (!data) return { title: 'State Not Found' };

  return {
    // Root layout's title template already appends " | Intrafer".
    title: `${category.name} in ${data.state}`,
    // Step 9: indexable per the client's sign-off on SEO spec section 11
    // ("Category and state hub pages stay indexable always") — reverses
    // Step 4's blanket dark-build noindex for this page level. City pages
    // (Step 5) are untouched and stay noindex. No robots key at all, same
    // reasoning as the category page above — matches how the vendor
    // profile (Step 6) and project (Step 8) pages already declare
    // "indexable" here (absent robots key, not an explicit index: true).
    alternates: { canonical: `${SITE_URL}/${params.category}/${params.state}/` },
  };
}

export default async function StateHubPage({ params, searchParams }) {
  const { category, landing, data } = await load(params, searchParams);
  if (!category) notFound();

  // A published authored page renders even when the state isn't in Place
  // (the automatic page's 404 rule) — its city grid is then just empty.
  if (landing?.page) return <AuthoredStatePage params={params} category={category} landing={landing} cities={data?.cities || []} />;

  if (!data) notFound();

  const { state, cities } = data;

  const serviceJsonLd = buildServiceJsonLd(category, state);
  const collectionJsonLd = buildCollectionJsonLd(params, category, state, cities);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '108px 40px 80px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      {collectionJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
        />
      )}

      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: category.name, href: `/${params.category}/` },
        { label: state },
      ]} />

      <Reveal>
        <p className="caps-label-primary" style={{ marginBottom: '10px' }}>SERVICE CATEGORY</p>
        <h1 className="section-heading" style={{ marginBottom: '16px' }}>{category.name} in {state}</h1>
        <p style={{ fontSize: '15px', color: 'var(--text-mid)', lineHeight: 1.8, maxWidth: '680px', marginBottom: '40px' }}>
          Find verified {category.name.toLowerCase()} in {state}, browsable by city.
        </p>
      </Reveal>

      <CityGrid params={params} category={category} state={state} cities={cities} />
    </div>
  );
}

function CityGrid({ params, category, state, cities }) {
  return cities.length > 0 ? (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '16px' }}>
      {cities.map((c) => (
        <Link
          key={c.citySlug}
          href={`/${params.category}/${params.state}/${c.citySlug}/`}
          style={{
            display: 'block', padding: '20px', borderRadius: 'var(--r-md)',
            border: '1px solid var(--border)', background: 'var(--surface)',
            textDecoration: 'none', color: 'var(--text)',
          }}
        >
          <div style={{ fontSize: '15px', fontWeight: 500 }}>{c.city}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-hint)', marginTop: '4px' }}>
            {c.vendorCount} {c.vendorCount === 1 ? 'vendor' : 'vendors'}
          </div>
        </Link>
      ))}
    </div>
  ) : (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px',
      padding: '48px', textAlign: 'center',
    }}>
      <p style={{ fontSize: '15px', color: 'var(--text-mid)' }}>
        No cities listed yet in {state} for {category.name}.
      </p>
    </div>
  );
}

// Admin-authored version of this page: banner, authored h1/intro, the same
// city grid, the optional "Top vendors" block (only when the page turned
// it on — the backend sends vendors: [] otherwise), then the authored
// sections in order.
function AuthoredStatePage({ params, category, landing, cities }) {
  const { state, banner, heading, intro, sections } = stateContent(category, landing);
  const shown = visibleSections(sections);
  const faqItems = visibleFaqItems(shown);

  const serviceJsonLd = buildServiceJsonLd(category, state);
  const collectionJsonLd = buildCollectionJsonLd(params, category, state, cities);

  const faqJsonLd = faqItems.length === 0 ? null : buildFaqJsonLd(faqItems);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '108px 40px 80px' }}>
      {landing.preview === true && <LandingPreviewStrip published={landing.page.status === 'published'} />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
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
        { label: state },
      ]} />

      <LandingBanner banner={banner} />

      <LandingIntro
        heading={heading}
        defaultHeading={`${category.name} in ${state}`}
        intro={intro}
        defaultBlurb={<>Find verified {category.name.toLowerCase()} in {state}, browsable by city.</>}
      />

      <CityGrid params={params} category={category} state={state} cities={cities} />

      <LandingTopVendors title={`Top ${category.name.toLowerCase()} in ${state}`} vendors={landing.vendors || []} />

      <LandingSections sections={shown} localitiesTitle={`Localities in ${state}`} />
    </div>
  );
}
