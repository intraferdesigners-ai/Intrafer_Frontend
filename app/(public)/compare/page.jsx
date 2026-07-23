import Image from 'next/image';
import Link from 'next/link';
import { Building2, MapPin, ShieldCheck } from 'lucide-react';

export const metadata = { title: 'Compare Designers | Intrafer' };

async function fetchVendors(ids) {
  if (!ids) return [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/public/vendors/compare?ids=${encodeURIComponent(ids)}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.vendors || [];
  } catch {
    return [];
  }
}

export default async function ComparePage({ searchParams }) {
  const ids = searchParams?.ids || '';
  const vendors = await fetchVendors(ids);

  if (vendors.length === 0) {
    return (
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(80px, 10vw, 108px) clamp(16px, 4vw, 40px) 80px', textAlign: 'center' }}>
        <Building2 size={48} color="var(--text-hint)" />
        <h1 style={{ fontSize: 24, fontWeight: 400, color: 'var(--text)', margin: '16px 0 8px' }}>
          Nothing to compare
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-sub)', margin: '0 0 20px' }}>
          {ids
            ? 'These designers are no longer available for comparison.'
            : 'Select a few designers from the listing to compare them side by side.'}
        </p>
        <Link href="/vendors" style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none' }}>
          ← Browse designers
        </Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(80px, 10vw, 108px) clamp(16px, 4vw, 40px) 80px' }}>
      <Link
        href="/vendors"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 13, color: 'var(--text-hint)', textDecoration: 'none', marginBottom: 16,
        }}
      >
        ← Back to all designers
      </Link>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--text)', margin: '0 0 6px' }}>
        Compare designers
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-hint)', margin: '0 0 32px' }}>
        {vendors.length} designer{vendors.length !== 1 ? 's' : ''} selected
      </p>

      <div style={{ overflowX: 'auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${vendors.length}, minmax(240px, 1fr))`,
          gap: 20,
          minWidth: vendors.length > 2 ? `${vendors.length * 260}px` : undefined,
        }}>
          {vendors.map((vendor) => {
            const specs = vendor.specializations || [];
            const location = [vendor.location?.city, vendor.location?.state].filter(Boolean).join(', ') || 'India';
            const cover = vendor.portfolioImages?.[0];

            return (
              <div key={vendor._id} style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-xl)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}>
                {/* Photo */}
                <div style={{
                  height: 160, position: 'relative',
                  background: 'var(--bg-cream)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {cover ? (
                    <Image src={cover} alt={vendor.businessName} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 25vw" />
                  ) : (
                    <Building2 size={36} color="var(--border-emp)" />
                  )}
                </div>

                <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Name + verified */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                    <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', margin: 0 }}>
                      {vendor.businessName}
                    </p>
                    {vendor.isApproved && <ShieldCheck size={13} color="var(--success)" />}
                  </div>

                  {/* Location */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-hint)', marginBottom: 10 }}>
                    <MapPin size={11} />
                    {location}
                  </div>

                  {/* Rating */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                    {vendor.rating > 0 ? (
                      <Link
                        href={`/vendors/${vendor._id}#reviews`}
                        className="rating-link"
                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <span style={{ color: 'var(--primary)', fontSize: 13 }}>★</span>
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>
                          {Number(vendor.rating).toFixed(1)}
                        </span>
                        {vendor.reviewCount > 0 && (
                          <span style={{ fontSize: 11, color: 'var(--text-hint)' }}>
                            ({vendor.reviewCount} review{vendor.reviewCount !== 1 ? 's' : ''})
                          </span>
                        )}
                      </Link>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--text-hint)' }}>New</span>
                    )}
                  </div>

                  {/* Specializations */}
                  <div style={{ marginBottom: 16, flex: 1 }}>
                    <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.08em', color: 'var(--text-hint)', textTransform: 'uppercase', margin: '0 0 6px' }}>
                      Specializations
                    </p>
                    {specs.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {specs.map((s) => (
                          <span key={s} className="spec-pill">{s}</span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--text-hint)' }}>—</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
                    <Link href={`/vendors/${vendor._id}`} style={{ textDecoration: 'none' }}>
                      <button style={{
                        width: '100%', padding: '9px 12px', borderRadius: 'var(--r-sm)',
                        background: 'var(--surface)', color: 'var(--text-sub)',
                        border: '1px solid var(--border)', fontSize: 12,
                        fontWeight: 500, cursor: 'pointer',
                      }}>
                        View profile
                      </button>
                    </Link>
                    <Link href={`/enquiry?vendorId=${vendor._id}`} style={{ textDecoration: 'none' }}>
                      <button style={{
                        width: '100%', padding: '9px 12px', borderRadius: 'var(--r-sm)',
                        background: 'var(--primary)', color: '#fff',
                        border: 'none', fontSize: 12,
                        fontWeight: 500, cursor: 'pointer',
                      }}>
                        Enquire
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
