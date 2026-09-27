import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/seo/Breadcrumb';
import Reveal from '@/components/ui/Reveal';
import { slugify } from '@/lib/slug';
import { getCategoryFaq } from '@/lib/categoryFaq';

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

export async function generateMetadata({ params }) {
  const category = await fetchCategory(params.category);
  if (!category) return { title: 'Category Not Found' };

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
  const category = await fetchCategory(params.category);
  if (!category) notFound();

  const states = await fetchStates(params.category);
  // Step 13: the client-approved 5-question FAQ set, adapted per category
  // (see lib/categoryFaq.js for sourcing/exclusions). Every one of the 12
  // known category slugs resolves to a real set; null only if params.category
  // somehow isn't one of them despite fetchCategory having already resolved
  // it above — defensive, not expected in practice.
  const faq = getCategoryFaq(params.category);

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
        url: `${SITE_URL}/${params.category}/${slugify(s.state)}/`,
      })),
    },
  };

  const faqJsonLd = !faq ? null : {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
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

      {states.length > 0 ? (
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
      )}

      {faq && (
        <section style={{ marginTop: '60px' }}>
          <h2 className="page-heading" style={{ marginBottom: '24px' }}>Frequently asked questions</h2>
          {faq.map((item, i) => (
            <div key={i} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 500, marginBottom: '8px', color: 'var(--text)' }}>{item.question}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-mid)', lineHeight: 1.7 }}>{item.answer}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
