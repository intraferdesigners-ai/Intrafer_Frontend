import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/seo/Breadcrumb';
import Reveal from '@/components/ui/Reveal';
import RevealItem from '@/components/ui/RevealItem';
import VendorCard from '@/components/vendor/VendorCard';
import { SERVICE_CATEGORIES } from '@/lib/categories';

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
      { cache: 'no-store' }
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
          { cache: 'no-store' }
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

  const [nearbyCities, relatedCategories] = await Promise.all([
    fetchNearbyCities(params.category, params.state, params.city),
    fetchRelatedCategories(params.category, params.state, params.city),
  ]);

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
                href={`/${params.category}/${params.state}/${c.citySlug}`}
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
                href={`/${c.slug}/${params.state}/${params.city}`}
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
    </div>
  );
}
