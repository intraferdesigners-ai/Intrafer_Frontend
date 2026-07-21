import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, Building2, ChevronLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import VendorCard from '../../../../components/vendor/VendorCard';
import ProjectsSection from '../../../../components/vendor/ProjectsSection';
import BeforeAfterSlider from '../../../../components/ui/BeforeAfterSlider';
import { getInitials, formatDate } from '../../../../lib/utils';
import VendorProfileTracker from '../../../../components/vendor/VendorProfileTracker';
import ConsultationModal from '../../../../components/vendor/ConsultationModal';

const PRICE_UNIT_LABEL = {
  flat: '',
  per_sqft: ' / sq. ft.',
  per_room: ' / room',
};

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

async function fetchReviews(id) {
  try {
    const res = await fetch(`${API}/reviews/vendor/${id}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.reviews || [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  try {
    const vendor = await fetchVendor(params.vendorId);
    if (!vendor) return { title: 'Vendor not found' };
    return {
      title: vendor.businessName,
      description: (vendor.description || '').slice(0, 155),
    };
  } catch {
    return { title: 'Vendor not found' };
  }
}

const LABEL = {
  fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
  color: 'var(--text-hint)', textTransform: 'uppercase',
  margin: '0 0 10px', display: 'block',
};

export default async function VendorProfilePage({ params }) {
  const [vendor, projects, similar, reviews] = await Promise.all([
    fetchVendor(params.vendorId),
    fetchProjects(params.vendorId),
    fetchSimilar(params.vendorId),
    fetchReviews(params.vendorId),
  ]);

  if (!vendor) {
    return (
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <Building2 size={48} color="var(--text-hint)" />
        <h1 style={{ fontSize: 24, fontWeight: 400, color: 'var(--text)', margin: '16px 0 8px' }}>
          Designer not found
        </h1>
        <Link href="/vendors" style={{ fontSize: 14, color: 'var(--primary)', textDecoration: 'none' }}>
          ← Browse all designers
        </Link>
      </main>
    );
  }

  const specs    = vendor.specializations || [];
  const location = [vendor.location?.city, vendor.location?.state].filter(Boolean).join(', ') || 'India';
  const coverImg = vendor.portfolioImages?.[0] || null;

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
      <VendorProfileTracker vendorId={String(vendor._id)} />
      <Link
        href="/vendors"
        className="back-link"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 13, color: 'var(--text-hint)',
          textDecoration: 'none', marginBottom: 24,
        }}
      >
        <ChevronLeft size={16} />
        All designers
      </Link>

      {/* Two-column grid */}
      <div className="vendor-profile-layout">

        {/* ── LEFT COLUMN ── */}
        <div>

          {/* ── COVER BANNER (avatar overlaps here, name never does) ── */}
          <div style={{ position: 'relative' }}>
            <div style={{
              height: '200px',
              background: 'linear-gradient(135deg, var(--primary-bg) 0%, var(--bg-cream) 100%)',
              borderRadius: 'var(--r-xl)',
              overflow: 'hidden',
              position: 'relative',
            }}>
              {coverImg && (
                <Image
                  src={coverImg}
                  alt=""
                  fill
                  style={{ objectFit: 'cover', opacity: 0.45 }}
                  sizes="(max-width: 768px) 100vw, 860px"
                />
              )}
              {/* Gradient overlay for readability */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, transparent 40%, rgba(15,23,42,.55) 100%)',
              }} />
            </div>

            {/* Large circular avatar — overlaps bottom of cover */}
            <div style={{
              position: 'absolute',
              left: '24px',
              bottom: '-40px',
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              border: '4px solid var(--surface)',
              overflow: 'hidden',
              background: 'var(--primary-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(15,23,42,.2)',
              zIndex: 2,
            }}>
              {vendor.profilePhoto ? (
                <Image
                  src={vendor.profilePhoto}
                  alt={vendor.businessName}
                  width={96}
                  height={96}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              ) : (
                <span style={{
                  fontSize: '36px',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  fontFamily: 'var(--font-display)',
                }}>
                  {vendor.businessName?.charAt(0) || 'I'}
                </span>
              )}
            </div>
          </div>

          {/* ── NAME + META — always below the cover, never overlaid on it ── */}
          <div style={{
            paddingLeft: '24px',
            paddingRight: '24px',
            marginTop: '52px',
            marginBottom: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(22px, 3vw, 32px)',
                fontWeight: 600,
                color: 'var(--text)',
                lineHeight: 1.2,
                margin: 0,
              }}>
                {vendor.businessName}
              </h1>
              {vendor.isApproved && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: 'var(--primary-bg)', color: 'var(--primary)',
                  padding: '3px 8px', borderRadius: '20px',
                  fontSize: '11px', fontWeight: 600, flexShrink: 0,
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Verified
                </div>
              )}
            </div>

            {/* Location + Rating */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              marginTop: '6px', flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: '14px', color: 'var(--text-hint)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {location}
              </span>
              {vendor.rating > 0 && (
                <span style={{ fontSize: '14px', color: 'var(--text-hint)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: '#F59E0B', fontSize: '15px', lineHeight: 1 }}>★</span>
                  <strong style={{ color: 'var(--text)', fontWeight: 600 }}>
                    {Number(vendor.rating).toFixed(1)}
                  </strong>
                  {vendor.reviewCount > 0 && (
                    <span>({vendor.reviewCount} review{vendor.reviewCount !== 1 ? 's' : ''})</span>
                  )}
                </span>
              )}
            </div>

            {/* Stats row — Instagram-style */}
            <div style={{ display: 'flex', gap: 'clamp(14px, 4vw, 28px)', marginTop: '14px' }}>
              {[
                { label: 'Projects', value: projects.length || 0 },
                { label: 'Reviews',  value: vendor.reviewCount || 0 },
                { label: 'Rating',   value: vendor.rating > 0 ? `${Number(vendor.rating).toFixed(1)}★` : '—' },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'clamp(14px, 4vw, 18px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-hint)', marginTop: '3px', letterSpacing: '.04em' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specializations */}
          {specs.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingLeft: '24px', marginBottom: '20px' }}>
              {specs.map(s => (
                <span key={s} className="spec-pill">{s}</span>
              ))}
            </div>
          )}

          {/* About */}
          {vendor.description && (
            <div style={{ paddingLeft: '24px', marginBottom: '28px' }}>
              <span style={LABEL}>ABOUT</span>
              <p style={{ fontSize: '15px', color: 'var(--text-sub)', lineHeight: 1.75, margin: 0 }}>
                {vendor.description}
              </p>
            </div>
          )}

          {/* Services */}
          {vendor.services?.length > 0 && (
            <div style={{ paddingLeft: '24px', paddingRight: '24px', marginBottom: '28px' }}>
              <span style={LABEL}>SERVICES</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {vendor.services.map((service, i) => (
                  <div key={i} style={{
                    border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
                    padding: '14px 16px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', margin: 0 }}>
                        {service.name}
                      </p>
                      {service.startingPrice != null && (
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                          Starting at ₹{Number(service.startingPrice).toLocaleString('en-IN')}{PRICE_UNIT_LABEL[service.priceUnit] ?? ''}
                        </span>
                      )}
                    </div>
                    {service.description && (
                      <p style={{ fontSize: '13px', color: 'var(--text-sub)', lineHeight: 1.6, margin: '6px 0 0' }}>
                        {service.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 28px' }} />

          {/* Before/After slider */}
          {projects.length >= 1 && (() => {
            // Prefer a project where the vendor explicitly set before/after images
            const projectWithBA = projects.find(p => p.beforeImage && p.afterImage);

            // Fallback: first project with at least 2 images
            const fallbackProject = projects.find(p => p.images?.length >= 2);

            const beforeImg = projectWithBA?.beforeImage || fallbackProject?.images?.[0] || null;
            const afterImg  = projectWithBA?.afterImage  || fallbackProject?.images?.[1] || null;

            if (!beforeImg || !afterImg) return null;

            return (
              <div style={{ marginBottom: 32 }}>
                <span style={LABEL}>BEFORE &amp; AFTER</span>
                <BeforeAfterSlider before={beforeImg} after={afterImg} />
              </div>
            );
          })()}

          {/* Portfolio */}
          <div>
            <span style={LABEL}>PORTFOLIO ({projects.length} projects)</span>
            <ProjectsSection projects={projects} />
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <span style={LABEL}>REVIEWS ({reviews.length})</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {reviews.map((review) => (
                  <div key={review._id} style={{
                    border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
                    padding: '16px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            size={14}
                            fill={n <= review.rating ? '#F59E0B' : 'none'}
                            color="#F59E0B"
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-hint)' }}>
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', margin: '8px 0 0' }}>
                      {review.userId?.name || 'Anonymous'}
                    </p>
                    {review.comment && (
                      <p style={{ fontSize: '13px', color: 'var(--text-sub)', lineHeight: 1.6, margin: '6px 0 0' }}>
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN — sticky enquiry card ── */}
        <div className="vendor-profile-sticky" style={{ position: 'sticky', top: 88 }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            padding: 24,
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 300,
              color: 'var(--text)', margin: '0 0 6px',
            }}>
              Get a quote
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-sub)', margin: '0 0 20px', lineHeight: 1.6 }}>
              Submit your requirements and connect with this designer.
            </p>

            <div style={{
              background: 'var(--bg-parchment)',
              borderRadius: 'var(--r-md)',
              padding: '12px 14px', marginBottom: 20,
            }}>
              {[
                ['Location',        location],
                ['Specializations', specs.length ? `${specs.length} area${specs.length !== 1 ? 's' : ''}` : 'General'],
                ['Rating',          vendor.rating > 0 ? `${Number(vendor.rating).toFixed(1)} / 5` : 'New designer'],
              ].map(([label, value]) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '5px 0', fontSize: 12,
                }}>
                  <span style={{ color: 'var(--text-hint)' }}>{label}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>

            <Link href={`/enquiry?vendorId=${vendor._id}`} style={{ display: 'block' }}>
              <Button variant="primary" size="lg" style={{ width: '100%' }}>
                Submit enquiry →
              </Button>
            </Link>

            <ConsultationModal vendor={vendor} />

            <a
              href={`https://wa.me/919876500000?text=${encodeURIComponent(
                `Hi! I found ${vendor.businessName} on Intrafer and I'm interested in discussing my interior design project. Could we connect?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%', padding: '11px', marginTop: '10px',
                borderRadius: 'var(--r-md)', background: '#25D366', color: '#fff',
                fontSize: '13px', fontWeight: 500, textDecoration: 'none',
                transition: 'opacity 150ms', boxSizing: 'border-box',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.553 4.1 1.522 5.82L.057 23.882l6.22-1.634A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.799 9.799 0 01-5.012-1.375l-.36-.214-3.732.979.996-3.638-.234-.374A9.782 9.782 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
              </svg>
              Chat on WhatsApp
            </a>

            <p style={{
              fontSize: 11, color: 'var(--text-hint)',
              textAlign: 'center', margin: '12px 0 0',
            }}>
              Free to enquire · No commitment · Verified designer
            </p>
          </div>
        </div>
      </div>

      {/* ── SIMILAR DESIGNERS ── */}
      {similar.length > 0 && (
        <div style={{ marginTop: 64, borderTop: '1px solid var(--border)', paddingTop: 48 }}>
          <span style={{ ...LABEL, marginBottom: 6 }}>SIMILAR DESIGNERS</span>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 300,
            color: 'var(--text)', margin: '0 0 28px', letterSpacing: '-.015em',
          }}>
            Similar designers you might like
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 20 }}>
            {similar.map((v) => <VendorCard key={v._id} vendor={v} />)}
          </div>
        </div>
      )}
    </main>
  );
}
