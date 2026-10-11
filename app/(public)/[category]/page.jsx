import { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/seo/Breadcrumb';
import LandingBanner from '@/components/seo/LandingBanner';
import LandingPreviewStrip from '@/components/seo/LandingPreviewStrip';
import LandingTopVendors from '@/components/seo/LandingTopVendors';
import {
  authoredContent, authoredRobots, buildFaqJsonLd, FaqSection, LandingIntro, LandingSections,
  visibleFaqItems, visibleSections,
} from '@/components/seo/LandingAuthored';
import Reveal from '@/components/ui/Reveal';
import { slugify } from '@/lib/slug';
import { getCategoryFaq } from '@/lib/categoryFaq';
import { fetchLandingData } from '@/lib/landingHub';
import { landingPreviewToken } from '@/lib/landingDraft';
import { cachedJson } from '@/lib/cachedFetch';
import { LIST_WINDOW, TAGS } from '@/lib/cacheTags';
import { placeholderValues } from '@/lib/landingLevel';
import { landingPageTitle } from '@/lib/landingSerp';
import { SITE_URL } from '@/lib/siteUrl';

const API = process.env.NEXT_PUBLIC_API_URL;

// Cached (ISR, 5 min), purged by the backend on landing-page and vendor
// writes (tags landing, vendors, taxonomy + the page path). Nothing is built
// ahead; each path is rendered on its first request. An admin preview is
// draft mode (app/api/landing-preview/): those requests bypass the cache,
// and only they fetch the draft — uncached, with the token.
export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

// 404 (inactive / unknown category) -> null -> notFound(); any other
// failure throws, so a backend blip is never cached as a 404.
async function fetchCategory(slug) {
  const json = await cachedJson(`${API}/public/service-categories/${encodeURIComponent(slug)}`, {
    revalidate: LIST_WINDOW, tags: [TAGS.TAXONOMY], nullOn404: true,
  });
  return json?.data?.category ?? null;
}

async function fetchStates(slug) {
  // 404 (unknown category) -> []; other failures throw.
  const json = await cachedJson(`${API}/public/states?category=${encodeURIComponent(slug)}`, {
    revalidate: LIST_WINDOW, tags: [TAGS.TAXONOMY, TAGS.VENDORS], nullOn404: true,
  });
  return json?.data?.states || [];
}

// Admin-authored category pages (Phase 4C): the landing page is fetched
// in parallel with the automatic page's data, shared by generateMetadata
// and the page through React cache() (the preview token is part of the
// key). No published page means `landing.page` is null and everything
// below renders the automatic page.
const loadCategory = cache(fetchCategory);
const loadHub = cache(async (categorySlug, preview) => {
  const [landing, states] = await Promise.all([
    fetchLandingData({ category: categorySlug }, preview),
    fetchStates(categorySlug),
  ]);
  return { landing, states };
});

async function load(params) {
  const [category, { landing, states }] = await Promise.all([
    loadCategory(params.category),
    loadHub(params.category, landingPreviewToken()),
  ]);
  return { category, landing, states };
}

// Placeholders resolved; {{state}} and {{city}} are empty on this level.
function categoryContent(category, landing) {
  return authoredContent(landing.page, placeholderValues('category', {
    categoryName: category.name, vendorCount: landing.vendorCount,
  }));
}

function buildServiceJsonLd(category) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: category.name,
    serviceType: category.name,
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: 'India',
  };
}

function buildCollectionJsonLd(params, category, states) {
  if (states.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} in India`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: states.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: s.state,
        url: `${SITE_URL}/${params.category}/${slugify(s.state)}/`,
      })),
    },
  };
}

export async function generateMetadata({ params }) {
  const { category, landing } = await load(params);
  if (!category) return { title: 'Category Not Found' };

  if (landing?.page) {
    const { seo, banner } = categoryContent(category, landing);
    const ogImage = seo.ogImage || banner.imageUrl;
    return {
      title: landingPageTitle({ metaTitle: seo.metaTitle, categoryName: category.name, level: 'category' }),
      ...(seo.metaDescription && { description: seo.metaDescription }),
      ...(ogImage && { openGraph: { images: [ogImage] } }),
      // Hubs stay indexable (no robots key) unless the page is set to
      // noindex; previews are noindex, nofollow, no-referrer.
      ...authoredRobots(landing),
      alternates: { canonical: `${SITE_URL}/${params.category}/` },
    };
  }

  return {
    // Root layout's title template already appends " | Intrafer".
    title: `${category.name} in India`,
    // Step 9: indexable per the client's sign-off on SEO spec section 11
    // ("Category and state hub pages stay indexable always — they are
    // aggregation pages, not empty listings") — this reverses the Step 3
    // blanket dark-build noindex for this page level only; city pages
    // (Step 5) stay noindex. No robots key at all, not an explicit
    // { index: true }: matches how the vendor profile (Step 6) and project
    // (Step 8) pages already declare "indexable" in this app — Next omits
    // the <meta name="robots"> tag entirely when the key is absent, which
    // is the indexable default.
    alternates: { canonical: `${SITE_URL}/${params.category}/` },
  };
}

export default async function CategoryHubPage({ params }) {
  const { category, landing, states } = await load(params);
  if (!category) notFound();

  if (landing?.page) return <AuthoredCategoryPage params={params} category={category} landing={landing} states={states} />;

  // Step 13: the client-approved 5-question FAQ set, adapted per category
  // (see lib/categoryFaq.js for sourcing/exclusions). Every one of the 12
  // known category slugs resolves to a real set; null only if params.category
  // somehow isn't one of them despite fetchCategory having already resolved
  // it above — defensive, not expected in practice.
  const faq = getCategoryFaq(params.category);

  const serviceJsonLd = buildServiceJsonLd(category);
  const collectionJsonLd = buildCollectionJsonLd(params, category, states);
  const faqJsonLd = !faq ? null : buildFaqJsonLd(faq);

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
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: category.name }]} />

      <Reveal>
        <p className="caps-label-primary" style={{ marginBottom: '10px' }}>SERVICE CATEGORY</p>
        <h1 className="section-heading" style={{ marginBottom: '16px' }}>{category.name} in India</h1>
        <p style={{ fontSize: '15px', color: 'var(--text-mid)', lineHeight: 1.8, maxWidth: '680px', marginBottom: '40px' }}>
          Find verified {category.name.toLowerCase()} across India, browsable by state and city.
        </p>
      </Reveal>

      <StateGrid params={params} states={states} />

      {faq && <FaqSection title="Frequently asked questions" questions={faq} />}
    </div>
  );
}

function StateGrid({ params, states }) {
  return states.length > 0 ? (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '16px' }}>
      {states.map((s) => (
        <Link
          key={s.state}
          href={`/${params.category}/${slugify(s.state)}/`}
          style={{
            display: 'block', padding: '20px', borderRadius: 'var(--r-md)',
            border: '1px solid var(--border)', background: 'var(--surface)',
            textDecoration: 'none', color: 'var(--text)',
          }}
        >
          <div style={{ fontSize: '15px', fontWeight: 500 }}>{s.state}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-hint)', marginTop: '4px' }}>
            {s.cityCount} {s.cityCount === 1 ? 'city' : 'cities'}
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
        No cities listed yet in this category.
      </p>
    </div>
  );
}

// Admin-authored version of this page: banner, authored h1/intro, the same
// state grid, the optional "Top vendors" block, then the authored sections.
// The built-in category FAQ still shows (with its JSON-LD) unless the page
// has an FAQ section of its own, which then replaces it — never two FAQs.
function AuthoredCategoryPage({ params, category, landing, states }) {
  const { banner, heading, intro, sections } = categoryContent(category, landing);
  const shown = visibleSections(sections);
  const faqItems = visibleFaqItems(shown);
  const builtInFaq = faqItems.length === 0 ? getCategoryFaq(params.category) : null;

  const serviceJsonLd = buildServiceJsonLd(category);
  const collectionJsonLd = buildCollectionJsonLd(params, category, states);
  const faqJsonLd = faqItems.length > 0 ? buildFaqJsonLd(faqItems) : (builtInFaq && buildFaqJsonLd(builtInFaq));

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '108px 40px 80px' }}>
      {landing.preview === true && <LandingPreviewStrip published={landing.page.status === 'published'} path={`/${params.category}/`} />}
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

      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: category.name }]} />

      <LandingBanner banner={banner} />

      <LandingIntro
        heading={heading}
        defaultHeading={`${category.name} in India`}
        intro={intro}
        defaultBlurb={<>Find verified {category.name.toLowerCase()} across India, browsable by state and city.</>}
      />

      <StateGrid params={params} states={states} />

      <LandingTopVendors title={`Top ${category.name.toLowerCase()} in India`} vendors={landing.vendors || []} />

      <LandingSections sections={shown} localitiesTitle="Areas we cover" />

      {builtInFaq && <FaqSection title="Frequently asked questions" questions={builtInFaq} />}
    </div>
  );
}
