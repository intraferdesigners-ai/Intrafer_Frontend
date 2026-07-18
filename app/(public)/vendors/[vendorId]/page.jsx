import Image from 'next/image';
import Link from 'next/link';
import BeforeAfterSlider from '@/components/ui/BeforeAfterSlider';
import VendorProfileTracker from '@/components/vendor/VendorProfileTracker';
import VendorCardV2 from '@/components/v2/vendors/VendorCard';
import EnquiryCard from '@/components/v2/vendors/EnquiryCard';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';
import { formatDate } from '@/lib/utils';

const API = process.env.NEXT_PUBLIC_API_URL;

async function fetchVendor(id) {
  try {
    const res = await fetch(`${API}/public/vendors/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.vendor ?? null;
  } catch {
    return null;
  }
}

async function fetchProjects(id) {
  try {
    const res = await fetch(`${API}/public/vendors/${id}/projects`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.projects || [];
  } catch {
    return [];
  }
}

async function fetchSimilar(id) {
  try {
    const res = await fetch(`${API}/public/vendors/${id}/similar`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.vendors || [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  try {
    const vendor = await fetchVendor(params.vendorId);
    if (!vendor) return { title: 'Designer not found' };
    return { title: vendor.businessName, description: (vendor.description || '').slice(0, 155) };
  } catch {
    return { title: 'Designer not found' };
  }
}

const EYEBROW = {
  fontSize: '11px', fontWeight: 600, letterSpacing: '.1em',
  color: '#3B82F6', textTransform: 'uppercase', margin: '0 0 14px', display: 'block',
};

export default async function VendorProfilePage({ params }) {
  const [vendor, projects, similar] = await Promise.all([
    fetchVendor(params.vendorId),
    fetchProjects(params.vendorId),
    fetchSimilar(params.vendorId),
  ]);

  if (!vendor) {
    return (
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
        <span style={{ fontSize: '40px' }}>🏢</span>
        <h1 style={{ fontFamily: 'var(--v2-font-display)', fontSize: '24px', fontWeight: 500, color: '#0F172A', margin: '16px 0 8px' }}>
          Designer not found
        </h1>
        <Link href="/vendors" style={{ fontSize: '14px', color: '#3B82F6', textDecoration: 'none' }}>
          ← Browse all designers
        </Link>
      </div>
    );
  }

  const specs = vendor.specializations || [];
  const location = [vendor.location?.city, vendor.location?.state].filter(Boolean).join(', ') || 'India';
  const coverImg = vendor.portfolioImages?.[0] || null;
  const reviews = Array.isArray(vendor.reviews) ? vendor.reviews : [];

  const projectWithBA = projects.find(p => p.beforeImage && p.afterImage);
  const fallbackProject = projects.find(p => p.images?.length >= 2);
  const beforeImg = projectWithBA?.beforeImage || fallbackProject?.images?.[0] || null;
  const afterImg = projectWithBA?.afterImage || fallbackProject?.images?.[1] || null;

  return (
    <div style={{ fontFamily: 'var(--v2-font-ui)' }}>
      <VendorProfileTracker vendorId={String(vendor._id)} />

      {/* Cover */}
      <div style={{ position: 'relative', height: '280px', overflow: 'hidden' }}>
        {coverImg ? (
          <Image src={coverImg} alt="" fill style={{ objectFit: 'cover' }} sizes="100vw" />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#0F172A' }} />
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.85) 100%)',
        }} />
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          padding: '0 clamp(16px,4vw,36px) 24px',
          maxWidth: '1140px', margin: '0 auto',
          display: 'flex', alignItems: 'flex-end', gap: '18px', flexWrap: 'wrap',
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            border: '4px solid #FFFFFF', overflow: 'hidden',
            background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: '0 4px 16px rgba(15,23,42,0.2)',
          }}>
            {vendor.profilePhoto ? (
              <Image src={vendor.profilePhoto} alt={vendor.businessName} width={80} height={80} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
            ) : (
              <span style={{ fontSize: '30px', fontWeight: 700, color: '#3B82F6', fontFamily: 'var(--v2-font-display)' }}>
                {vendor.businessName?.charAt(0) || 'I'}
              </span>
            )}
          </div>
          <div style={{ paddingBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{
                fontFamily: 'var(--v2-font-display)', fontSize: 'clamp(24px,3.5vw,32px)',
                fontWeight: 500, color: '#F8F7F4', margin: 0,
              }}>{vendor.businessName}</h1>
              {vendor.isApproved && (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: 'rgba(59,130,246,0.2)', color: '#93C5FD',
                  padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                }}>✓ Verified</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: '#CBD5E1' }}>📍 {location}</span>
              {vendor.rating > 0 && (
                <span style={{ fontSize: '13px', color: '#CBD5E1' }}>
                  <span style={{ color: '#3B82F6' }}>★</span> {Number(vendor.rating).toFixed(1)}
                  {vendor.reviewCount > 0 && ` (${vendor.reviewCount} review${vendor.reviewCount !== 1 ? 's' : ''})`}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{
        maxWidth: '1140px', margin: '0 auto', padding: '40px clamp(16px,4vw,36px) 64px',
        display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap',
      }}>
        {/* Left */}
        <div style={{ flex: '1 1 620px', minWidth: 0 }}>
          <RevealOnScroll direction="up">
            <div style={{ display: 'flex', gap: 'clamp(16px,4vw,32px)', marginBottom: '32px' }}>
              {[
                { label: 'Projects', value: projects.length || 0 },
                { label: 'Reviews', value: vendor.reviewCount || 0 },
                { label: 'Rating', value: vendor.rating > 0 ? `${Number(vendor.rating).toFixed(1)}★` : '—' },
              ].map(stat => (
                <div key={stat.label} style={{
                  flex: '1 1 120px', background: '#F8F7F4', border: '1px solid #E2E8F0',
                  borderRadius: '12px', padding: '16px', textAlign: 'center',
                }}>
                  <div style={{ fontFamily: 'var(--v2-font-display)', fontSize: '22px', fontWeight: 500, color: '#0F172A' }}>{stat.value}</div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </RevealOnScroll>

          {specs.length > 0 && (
            <RevealOnScroll direction="up">
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
                {specs.map(s => (
                  <span key={s} style={{
                    fontSize: '12px', fontWeight: 500, color: '#3B82F6',
                    background: 'rgba(59,130,246,0.08)', padding: '6px 14px', borderRadius: '20px',
                  }}>{s}</span>
                ))}
              </div>
            </RevealOnScroll>
          )}

          {vendor.description && (
            <RevealOnScroll direction="up">
              <div style={{ marginBottom: '32px' }}>
                <span style={EYEBROW}>About</span>
                <p style={{ fontSize: '15px', color: '#334155', lineHeight: 1.75, margin: 0 }}>{vendor.description}</p>
              </div>
            </RevealOnScroll>
          )}

          {beforeImg && afterImg && (
            <RevealOnScroll direction="up">
              <div style={{ marginBottom: '32px' }}>
                <span style={EYEBROW}>Before &amp; after</span>
                <BeforeAfterSlider before={beforeImg} after={afterImg} />
              </div>
            </RevealOnScroll>
          )}

          <RevealOnScroll direction="up">
            <div style={{ marginBottom: '32px' }}>
              <span style={EYEBROW}>Portfolio ({projects.length} project{projects.length !== 1 ? 's' : ''})</span>
              {projects.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {projects.map(p => (
                    <Link key={p._id} href={`/projects/${p._id}`} style={{ textDecoration: 'none', display: 'block' }}>
                      <div style={{
                        position: 'relative', aspectRatio: '4/3', borderRadius: '12px',
                        overflow: 'hidden', background: '#F1F5F9',
                      }}
                      className="v2-portfolio-tile"
                      >
                        {p.images?.[0] && (
                          <Image src={p.images[0]} alt={p.title || ''} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 33vw, 20vw" />
                        )}
                        <div className="v2-portfolio-overlay" style={{
                          position: 'absolute', inset: 0,
                          background: 'linear-gradient(transparent 50%, rgba(15,23,42,0.75))',
                          display: 'flex', alignItems: 'flex-end', padding: '10px',
                          opacity: 0, transition: 'opacity 200ms',
                        }}>
                          <span style={{ fontSize: '12px', fontWeight: 500, color: '#F8F7F4' }}>{p.title}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: '#94A3B8', fontStyle: 'italic' }}>No portfolio projects yet.</p>
              )}
            </div>
          </RevealOnScroll>

          <RevealOnScroll direction="up">
            <div>
              <span style={EYEBROW}>Reviews</span>
              {reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {reviews.map((r, i) => (
                    <div key={r._id || i} style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '20px' }}>
                      <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                        {Array.from({ length: 5 }).map((_, s) => (
                          <span key={s} style={{ color: s < (r.rating || 0) ? '#3B82F6' : '#E2E8F0', fontSize: '13px' }}>★</span>
                        ))}
                      </div>
                      <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.7, margin: '0 0 8px' }}>{r.text || r.comment}</p>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>
                        {r.author || r.name || 'Verified homeowner'}{r.createdAt ? ` · ${formatDate(r.createdAt)}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: '#94A3B8', fontStyle: 'italic' }}>No reviews yet — be the first to work with this designer.</p>
              )}
            </div>
          </RevealOnScroll>
        </div>

        {/* Right — sticky enquiry card */}
        <div style={{ flex: '1 1 300px', maxWidth: '320px', position: 'sticky', top: '80px' }}>
          <EnquiryCard vendor={vendor} location={location} specs={specs} />
        </div>
      </div>

      {/* Similar designers */}
      {similar.length > 0 && (
        <div style={{
          maxWidth: '1140px', margin: '0 auto', padding: '0 clamp(16px,4vw,36px) 64px',
          borderTop: '1px solid #E2E8F0', paddingTop: '48px',
        }}>
          <span style={EYEBROW}>Similar designers</span>
          <h2 style={{
            fontFamily: 'var(--v2-font-display)', fontSize: '24px', fontWeight: 500,
            color: '#0F172A', margin: '0 0 24px',
          }}>Similar designers you might like</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: '20px' }}>
            {similar.map(v => <VendorCardV2 key={v._id} vendor={v} />)}
          </div>
        </div>
      )}
    </div>
  );
}
