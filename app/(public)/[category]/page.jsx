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

async function fetchStates(slug) {
  try {
    const res = await fetch(`${API}/public/states?category=${encodeURIComponent(slug)}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.states || [];
  } catch {
    return [];
  }
}

// Plain kebab-case slug of a state name, for the /[category]/[state]/ links
// below — Step 4 resolves this back to the actual state string the same way.
const slugifyState = (state) =>
  state.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export async function generateMetadata({ params }) {
  const category = await fetchCategory(params.category);
  if (!category) return { title: 'Category Not Found' };

  return {
    // Root layout's title template already appends " | Intrafer".
    title: `${category.name} in India`,
    // Dark build — this whole category -> state -> city chain stays
    // noindex, for every category including interior-designers, until it's
    // complete end-to-end with real per-city content. Indexation is a
    // deliberate later step, not implicit once the pages exist.
    robots: { index: false, follow: true },
    alternates: { canonical: `${SITE_URL}/${params.category}` },
  };
}

export default async function CategoryHubPage({ params }) {
  const category = await fetchCategory(params.category);
  if (!category) notFound();

  const states = await fetchStates(params.category);

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: category.name,
    serviceType: category.name,
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: 'India',
  };

  const collectionJsonLd = states.length === 0 ? null : {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} in India`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: states.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: s.state,
        url: `${SITE_URL}/${params.category}/${slugifyState(s.state)}`,
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

      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: category.name }]} />

      <Reveal>
        <p className="caps-label-primary" style={{ marginBottom: '10px' }}>SERVICE CATEGORY</p>
        <h1 className="section-heading" style={{ marginBottom: '16px' }}>{category.name} in India</h1>
        <p style={{ fontSize: '15px', color: 'var(--text-mid)', lineHeight: 1.8, maxWidth: '680px', marginBottom: '40px' }}>
          Find verified {category.name.toLowerCase()} across India, browsable by state and city.
        </p>
      </Reveal>

      {states.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '16px' }}>
          {states.map((s) => (
            <Link
              key={s.state}
              href={`/${params.category}/${slugifyState(s.state)}`}
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
      )}
    </div>
  );
}
