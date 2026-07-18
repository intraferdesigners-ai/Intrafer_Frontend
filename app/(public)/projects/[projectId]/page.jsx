import Link from 'next/link';
import Image from 'next/image';
import { Building2 } from 'lucide-react';
import BeforeAfterSlider from '../../../../components/ui/BeforeAfterSlider';
import V2Button from '@/components/v2/ui/Button';

const API = process.env.NEXT_PUBLIC_API_URL;

async function fetchProject(id) {
  try {
    const res = await fetch(`${API}/public/projects/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.project ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const project = await fetchProject(params.projectId);
  if (!project) return { title: 'Project not found' };
  return {
    title: `${project.title} | Intrafer`,
    description: (project.description || '').slice(0, 155),
  };
}

const LABEL = {
  fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
  color: '#94A3B8', textTransform: 'uppercase',
  margin: '0 0 10px', display: 'block',
};

const PILL_STYLE = {
  fontSize: '11px', fontWeight: 500, color: '#CBD5E1',
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
  padding: '4px 12px', borderRadius: '20px',
};

export default async function ProjectDetailPage({ params }) {
  const project = await fetchProject(params.projectId);

  // vendorId is populated server-side into the vendor sub-document (see
  // getProjectById), so project.vendorId IS the vendor object — no second fetch.
  const vendor = project?.vendorId;

  if (!project || !vendor) {
    return (
      <div style={{ background: '#0F172A', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '80px 24px', textAlign: 'center' }}>
        <Building2 size={40} color="#475569" />
        <h1 style={{ fontFamily: 'var(--v2-font-display)', fontSize: 24, fontWeight: 500, color: '#F8F7F4', margin: '16px 0 8px' }}>
          Project not found
        </h1>
        <Link href="/vendors" style={{ fontSize: 14, color: '#3B82F6', textDecoration: 'none' }}>
          ← Browse designers
        </Link>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'var(--v2-font-ui)' }}>
      {/* Hero */}
      <section style={{ background: '#0F172A', padding: 'clamp(56px,8vw,88px) clamp(16px,4vw,36px) clamp(32px,5vw,44px)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <Link
            href={`/vendors/${vendor._id}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 13, color: '#94A3B8', textDecoration: 'none', marginBottom: '20px',
            }}
          >
            ← Back to {vendor.businessName}
          </Link>

          <h1 style={{
            fontFamily: 'var(--v2-font-display)', fontSize: 'clamp(28px,4.5vw,40px)', fontWeight: 500,
            color: '#F8F7F4', margin: '0 0 16px', letterSpacing: '-0.02em',
          }}>
            {project.title}
          </h1>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {project.projectType && <span style={PILL_STYLE}>{project.projectType}</span>}
            {project.style && <span style={PILL_STYLE}>{project.style}</span>}
            {project.location && <span style={PILL_STYLE}>📍 {project.location}</span>}
            {project.completedYear && <span style={PILL_STYLE}>📅 {project.completedYear}</span>}
          </div>
        </div>
      </section>

      {/* Two column */}
      <section style={{ background: '#F8F7F4', padding: 'clamp(40px,6vw,64px) clamp(16px,4vw,36px) clamp(56px,8vw,80px)' }}>
        <div className="two-col-layout" style={{ maxWidth: '1140px', margin: '0 auto' }}>

          {/* LEFT: Images + description */}
          <div>
            {/* Before/after slider if set */}
            {project.beforeImage && project.afterImage && (
              <div style={{ marginBottom: 24 }}>
                <span style={LABEL}>Before &amp; after</span>
                <BeforeAfterSlider before={project.beforeImage} after={project.afterImage} />
              </div>
            )}

            {/* Image gallery grid */}
            {project.images?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <span style={LABEL}>Project photos</span>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,280px),1fr))',
                  gap: 12,
                }}>
                  {project.images.map((img, i) => (
                    <div key={i} style={{
                      borderRadius: '14px', overflow: 'hidden',
                      aspectRatio: '4/3', position: 'relative',
                    }}>
                      <Image
                        src={img}
                        alt={`${project.title} ${i + 1}`}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 768px) 100vw, 280px"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {project.description && (
              <div>
                <span style={LABEL}>About this project</span>
                <p style={{ fontSize: 15, color: '#334155', lineHeight: 1.75, margin: 0 }}>
                  {project.description}
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: Vendor card */}
          <div>
            <div className="v2-card vendor-profile-sticky" style={{
              padding: 24,
              position: 'sticky', top: 88,
            }}>
              <span style={{ ...LABEL, color: '#94A3B8', marginBottom: 16 }}>Designed by</span>

              {/* Vendor avatar + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: '#DBEAFE',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, overflow: 'hidden', position: 'relative',
                }}>
                  {vendor.profilePhoto ? (
                    <Image src={vendor.profilePhoto} alt={vendor.businessName} fill style={{ objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#3B82F6' }}>
                      {vendor.businessName?.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#0F172A' }}>
                    {vendor.businessName}
                  </div>
                  <div style={{ fontSize: 13, color: '#94A3B8' }}>
                    ⭐ {vendor.rating || 0} · {vendor.location?.city}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
                marginBottom: 16, background: '#F1F5F9',
                borderRadius: '10px', padding: 12,
              }}>
                {[
                  { label: 'Rating', value: `${vendor.rating || 0}★` },
                  { label: 'Reviews', value: vendor.reviewCount || 0 },
                ].map((s) => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#3B82F6' }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <Link href={`/enquiry?vendor=${vendor._id}`} style={{ display: 'block', marginBottom: 8 }}>
                <V2Button variant="primary" fullWidth>Submit enquiry →</V2Button>
              </Link>

              <Link href={`/vendors/${vendor._id}`} style={{ display: 'block' }}>
                <V2Button variant="secondary" fullWidth>View full profile</V2Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
