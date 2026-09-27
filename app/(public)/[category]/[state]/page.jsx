import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/seo/Breadcrumb';
import Reveal from '@/components/ui/Reveal';

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

export async function generateMetadata({ params }) {
  const category = await fetchCategory(params.category);
  if (!category) return { title: 'Category Not Found' };

  const data = await fetchCities(params.category, params.state);
  if (!data) return { title: 'State Not Found' };

  return {
    // Root layout's title template already appends " | Intrafer".
    title: `${category.name} in ${data.state}`,
    // Dark build — same blanket noindex rule as Step 3, for every
    // category/state combo, until the full chain + real content is ready.
    robots: { index: false, follow: true },
    alternates: { canonical: `${SITE_URL}/${params.category}/${params.state}` },
  };
}

export default async function StateHubPage({ params }) {
  const category = await fetchCategory(params.category);
  if (!category) notFound();

  const data = await fetchCities(params.category, params.state);
  if (!data) notFound();

  const { state, cities } = data;

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: category.name,
    serviceType: category.name,
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: state,
  };

  const collectionJsonLd = cities.length === 0 ? null : {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} in ${state}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: cities.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.city,
        url: `${SITE_URL}/${params.category}/${params.state}/${c.citySlug}`,
      })),
    },
  };

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
        { label: category.name, href: `/${params.category}` },
        { label: state },
      ]} />

      <Reveal>
        <p className="caps-label-primary" style={{ marginBottom: '10px' }}>SERVICE CATEGORY</p>
        <h1 className="section-heading" style={{ marginBottom: '16px' }}>{category.name} in {state}</h1>
        <p style={{ fontSize: '15px', color: 'var(--text-mid)', lineHeight: 1.8, maxWidth: '680px', marginBottom: '40px' }}>
          Find verified {category.name.toLowerCase()} in {state}, browsable by city.
        </p>
      </Reveal>

      {cities.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '16px' }}>
          {cities.map((c) => (
            <Link
              key={c.citySlug}
              href={`/${params.category}/${params.state}/${c.citySlug}`}
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
      )}
    </div>
  );
}
