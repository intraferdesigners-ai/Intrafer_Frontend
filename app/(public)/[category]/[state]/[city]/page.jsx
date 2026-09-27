import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/seo/Breadcrumb';
import Reveal from '@/components/ui/Reveal';
import RevealItem from '@/components/ui/RevealItem';
import VendorCard from '@/components/vendor/VendorCard';

const API = process.env.NEXT_PUBLIC_API_URL;
const SITE_URL = 'https://intrafer.in';

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

// Returns { vendors, total, page, totalPages, state, city } on a real
// state+city (vendors may be empty), or null if the state/city segment
// doesn't resolve to a real Place at all — the caller uses that to tell
// "empty state" apart from "404". Doesn't pass page/limit — no city has
// enough listings yet to need real pagination (see the note below the
// vendor grid); this only ever renders whatever page 1 returns.
async function fetchVendors(categorySlug, stateSlug, citySlug) {
  try {
    const res = await fetch(
      `${API}/public/vendors?category=${encodeURIComponent(categorySlug)}&state=${encodeURIComponent(stateSlug)}&city=${encodeURIComponent(citySlug)}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

async function fetchFAQ(categorySlug, stateSlug, citySlug) {
  try {
    const res = await fetch(
      `${API}/public/city-faq?category=${encodeURIComponent(categorySlug)}&state=${encodeURIComponent(stateSlug)}&city=${encodeURIComponent(citySlug)}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.faq ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const category = await fetchCategory(params.category);
  if (!category) return { title: 'Category Not Found' };

  const data = await fetchVendors(params.category, params.state, params.city);
  if (!data) return { title: 'City Not Found' };

  return {
    // Root layout's title template already appends " | Intrafer".
    title: `${category.name} in ${data.city}, ${data.state}`,
    // Dark build — same blanket noindex rule as Steps 3-4, for every
    // category/state/city combo, until the full chain + real content is
    // ready and an explicit later step turns indexation on.
    robots: { index: false, follow: true },
    alternates: { canonical: `${SITE_URL}/${params.category}/${params.state}/${params.city}` },
  };
}

export default async function CityHubPage({ params }) {
  const category = await fetchCategory(params.category);
  if (!category) notFound();

  const data = await fetchVendors(params.category, params.state, params.city);
  if (!data) notFound();

  const { state, city, vendors } = data;
  const faq = await fetchFAQ(params.category, params.state, params.city);
  const hasFaq = faq && faq.questions?.length > 0;

  // Category's own schema.org business type (e.g. HomeAndConstructionBusiness,
  // GeneralContractor, FurnitureStore) — not the generic Service block the
  // category/state pages use, per the SEO doc's section 5. Product/Offer
  // schema intentionally doesn't belong here (only /pricing/ per the doc).
  const businessJsonLd = {
    '@context': 'https://schema.org',
    '@type': category.schemaOrgType,
    name: `${category.name} in ${city}`,
    areaServed: city,
    provider: { '@id': `${SITE_URL}/#organization` },
  };

  const collectionJsonLd = vendors.length === 0 ? null : {
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
            url: `${SITE_URL}/vendors/${v._id}`,
            ...(image && { image }),
            ...(aggregateRating && { aggregateRating }),
          },
        };
      }),
    },
  };

  const faqJsonLd = !hasFaq ? null : {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answer },
    })),
  };

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
        { label: category.name, href: `/${params.category}` },
        { label: state, href: `/${params.category}/${params.state}` },
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
              <VendorCard vendor={v} />
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

      {hasFaq && (
        <section style={{ marginTop: '60px' }}>
          <h2 className="page-heading" style={{ marginBottom: '24px' }}>Frequently asked questions</h2>
          {faq.questions.map((q, i) => (
            <div key={i} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 500, marginBottom: '8px', color: 'var(--text)' }}>{q.question}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-mid)', lineHeight: 1.7 }}>{q.answer}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
