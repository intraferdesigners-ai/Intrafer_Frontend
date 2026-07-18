import { Suspense } from 'react';
import Link from 'next/link';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';
import VendorSearchBar from '@/components/v2/vendors/SearchBar';
import VendorBHKFilterV2 from '@/components/v2/vendors/BHKFilter';
import VendorCardV2 from '@/components/v2/vendors/VendorCard';

export const metadata = {
  title: 'Interior Designers in India | Intrafer',
  description: 'Find verified interior designers near you. Filter by city, style, and budget. Free to browse and enquire.',
  openGraph: {
    title: 'Interior Designers in India | Intrafer',
    description: 'Find verified interior designers near you. Filter by city, style, and budget. Free to browse and enquire.',
    url: 'https://intrafer.in/vendors',
    siteName: 'Intrafer',
    type: 'website',
  },
};

async function fetchVendors(searchParams) {
  try {
    const q = new URLSearchParams();
    if (searchParams.city) q.set('city', searchParams.city);
    if (searchParams.specialization && searchParams.specialization !== 'All')
      q.set('specialization', searchParams.specialization);
    // Mirrors V1's app/(public)/vendors/page.jsx: the backend has no dedicated
    // 'bhk' filter, so bhk is folded into 'specialization' — kept identical here
    // for API parity rather than silently diverging from proven V1 behavior.
    if (searchParams.bhk && searchParams.bhk !== 'All')
      q.set('specialization', searchParams.bhk);
    if (searchParams.sort) q.set('sort', searchParams.sort);
    if (searchParams.page) q.set('page', searchParams.page);
    q.set('limit', '12');

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/vendors?${q.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const json = await res.json();
    return json.data || { vendors: [], total: 0, page: 1, totalPages: 1 };
  } catch {
    return { vendors: [], total: 0, page: 1, totalPages: 1 };
  }
}

function buildPageUrl(searchParams, p) {
  const q = new URLSearchParams();
  if (searchParams.city) q.set('city', searchParams.city);
  if (searchParams.specialization) q.set('specialization', searchParams.specialization);
  if (searchParams.bhk) q.set('bhk', searchParams.bhk);
  if (searchParams.sort) q.set('sort', searchParams.sort);
  q.set('page', String(p));
  return '/vendors?' + q.toString();
}

export default async function VendorsPage({ searchParams }) {
  const { vendors = [], total = 0, page = 1, totalPages = 1 } = await fetchVendors(searchParams);

  return (
    <div style={{ fontFamily: 'var(--v2-font-ui)' }}>
      {/* Hero */}
      <section style={{ background: '#0F172A', padding: '48px clamp(16px,4vw,36px) 40px' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <RevealOnScroll direction="up">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 14px', borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.1)', marginBottom: '20px',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6', display: 'inline-block' }} />
              <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>480+ verified designers</span>
            </div>

            <h1 style={{
              fontFamily: 'var(--v2-font-display)', fontSize: 'clamp(28px,4.5vw,44px)',
              fontWeight: 500, color: '#F8F7F4', letterSpacing: '-0.02em',
              lineHeight: 1.15, margin: '0 0 10px',
            }}>
              Find your perfect interior designer.
            </h1>
            <p style={{ fontSize: '15px', color: '#64748B', marginBottom: '28px' }}>
              Verified portfolios. Real reviews. Free to enquire.
            </p>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={100}>
            <Suspense fallback={null}>
              <VendorSearchBar />
            </Suspense>
          </RevealOnScroll>
        </div>
      </section>

      {/* BHK filter */}
      <section style={{ background: '#F8F7F4', borderBottom: '1px solid #E2E8F0', padding: '20px clamp(16px,4vw,36px)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <Suspense fallback={null}>
            <VendorBHKFilterV2 />
          </Suspense>
        </div>
      </section>

      {/* Results */}
      <section style={{ background: '#F8F7F4', padding: '32px clamp(16px,4vw,36px) 64px' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px' }}>
            {total} verified designer{total !== 1 ? 's' : ''}
          </p>

          {vendors.length > 0 ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                {vendors.map((v, i) => (
                  <RevealOnScroll key={v._id} direction="up" delay={(i % 4) * 100}>
                    <VendorCardV2 vendor={v} />
                  </RevealOnScroll>
                ))}
              </div>

              {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '48px' }}>
                  {page > 1 && (
                    <Link href={buildPageUrl(searchParams, page - 1)} style={{
                      fontSize: '13px', color: '#3B82F6', textDecoration: 'none',
                      padding: '8px 16px', border: '1px solid #E2E8F0', borderRadius: '10px', background: '#FFFFFF',
                    }}>← Previous</Link>
                  )}
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Page {page} of {totalPages}</span>
                  {page < totalPages && (
                    <Link href={buildPageUrl(searchParams, Number(page) + 1)} style={{
                      fontSize: '13px', color: '#3B82F6', textDecoration: 'none',
                      padding: '8px 16px', border: '1px solid #E2E8F0', borderRadius: '10px', background: '#FFFFFF',
                    }}>Next →</Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 20px', textAlign: 'center' }}>
              <span style={{ fontSize: '40px' }}>🏢</span>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A', margin: '16px 0 8px' }}>No designers found</h2>
              <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 20px' }}>Try a different city or specialization</p>
              <Link href="/vendors" style={{ fontSize: '13px', color: '#3B82F6', textDecoration: 'none' }}>Clear filters →</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
