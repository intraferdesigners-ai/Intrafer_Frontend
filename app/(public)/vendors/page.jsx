import { Suspense } from 'react';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import VendorSearch from '../../../components/vendor/VendorSearch';
import VendorBHKFilter from '../../../components/vendor/VendorBHKFilter';
import CompareBar from '../../../components/vendor/CompareBar';
import VendorResultsGrid from '../../../components/vendor/VendorResultsGrid';
import AnimatedCounter from '../../../components/ui/AnimatedCounter';

export const metadata = { title: 'Find Interior Designers | Intrafer' };

async function fetchVendors(searchParams) {
  try {
    const q = new URLSearchParams();
    if (searchParams.city)           q.set('city', searchParams.city);
    if (searchParams.specialization && searchParams.specialization !== 'All')
                                     q.set('specialization', searchParams.specialization);
    // Own param, not merged into `specialization` — getVendors doesn't read
    // `bhk` yet (no home-type field on the Vendor model), so this is a no-op
    // filter-wise, but it no longer collides with the specialization filter.
    if (searchParams.bhk && searchParams.bhk !== 'All')
                                     q.set('bhk', searchParams.bhk);
    if (searchParams.sort)           q.set('sort', searchParams.sort);
    if (searchParams.page)           q.set('page', searchParams.page);
    q.set('limit', '12');

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/public/vendors?${q.toString()}`,
      { cache: 'no-store' }
    );
    if (!res.ok) throw new Error(`API ${res.status}`);
    const json = await res.json();
    return json.data || { vendors: [], total: 0, page: 1, totalPages: 1 };
  } catch {
    return { vendors: [], total: 0, page: 1, totalPages: 1 };
  }
}

function buildPageUrl(searchParams, p) {
  const q = new URLSearchParams();
  if (searchParams.city)           q.set('city', searchParams.city);
  if (searchParams.specialization) q.set('specialization', searchParams.specialization);
  if (searchParams.bhk)            q.set('bhk', searchParams.bhk);
  if (searchParams.sort)           q.set('sort', searchParams.sort);
  q.set('page', String(p));
  return '/vendors?' + q.toString();
}

export default async function VendorsPage({ searchParams }) {
  const { vendors = [], total = 0, page = 1, totalPages = 1 } = await fetchVendors(searchParams);
  const resultsKey = JSON.stringify(searchParams);

  return (
    <main style={{ padding: 'clamp(80px, 10vw, 108px) clamp(16px, 4vw, 40px) 60px', maxWidth: 1280, margin: '0 auto' }}>
      <p className="caps-label-primary" style={{ margin: '0 0 8px' }}>Design directory</p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--text)', margin: '0 0 6px' }}>
        Interior designers
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-hint)', margin: '0 0 24px' }}>
        <AnimatedCounter end={total} style={{ fontWeight: 600, color: 'var(--text)' }} /> verified designer{total !== 1 ? 's' : ''}
      </p>

      <Suspense fallback={null}>
        <VendorSearch />
      </Suspense>

      {/* BHK filter pills */}
      <Suspense fallback={null}>
        <VendorBHKFilter />
      </Suspense>

      {vendors.length > 0 ? (
        <>
          <VendorResultsGrid vendors={vendors} resultsKey={resultsKey} />

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 48 }}>
              {page > 1 && (
                <Link href={buildPageUrl(searchParams, page - 1)} style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none', padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--surface)' }}>
                  ← Previous
                </Link>
              )}
              <span style={{ fontSize: 13, color: 'var(--text-hint)' }}>Page {page} of {totalPages}</span>
              {page < totalPages && (
                <Link href={buildPageUrl(searchParams, Number(page) + 1)} style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none', padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--surface)' }}>
                  Next →
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center' }}>
          <Building2 size={48} color="var(--text-hint)" />
          <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--text)', margin: '16px 0 8px' }}>No designers found</h2>
          <p style={{ fontSize: 14, color: 'var(--text-sub)', margin: '0 0 20px' }}>Try a different city or specialization</p>
          <Link href="/vendors" style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none' }}>Clear filters →</Link>
        </div>
      )}

      <CompareBar />
    </main>
  );
}
