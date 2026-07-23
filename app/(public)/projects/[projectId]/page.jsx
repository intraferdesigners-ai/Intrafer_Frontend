import Link from 'next/link';
import Image from 'next/image';
import { Building2 } from 'lucide-react';
import BeforeAfterSlider from '../../../../components/ui/BeforeAfterSlider';
import ProjectsSection from '../../../../components/vendor/ProjectsSection';
import Reveal from '../../../../components/ui/Reveal';

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

async function fetchRelatedProjects(id) {
  try {
    const res = await fetch(`${API}/public/projects/${id}/related`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.projects || [];
  } catch {
    return [];
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
  color: 'var(--text-hint)', textTransform: 'uppercase',
  margin: '0 0 10px', display: 'block',
};

export default async function ProjectDetailPage({ params }) {
  const [project, relatedProjects] = await Promise.all([
    fetchProject(params.projectId),
    fetchRelatedProjects(params.projectId),
  ]);

  // vendorId is populated server-side into the vendor sub-document (see
  // getProjectById), so project.vendorId IS the vendor object — no second fetch.
  const vendor = project?.vendorId;

  if (!project || !vendor) {
    return (
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <Building2 size={48} color="var(--text-hint)" />
        <h1 style={{ fontSize: 24, fontWeight: 400, color: 'var(--text)', margin: '16px 0 8px' }}>
          Project not found
        </h1>
        <Link href="/vendors" style={{ fontSize: 14, color: 'var(--primary)', textDecoration: 'none' }}>
          ← Browse designers
        </Link>
      </main>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(80px,10vw,120px) clamp(16px,5vw,40px) 80px' }}>
      {/* Back link */}
      <Link
        href={`/vendors/${vendor._id}`}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 13, color: 'var(--text-hint)', textDecoration: 'none',
        }}
      >
        ← Back to {vendor.businessName}
      </Link>

      {/* Project title */}
      <Reveal>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,4vw,36px)', fontWeight: 400,
        color: 'var(--text)', margin: '20px 0 8px',
      }}>
        {project.title}
      </h1>

      {/* Meta info pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {project.projectType && <span className="spec-pill">{project.projectType}</span>}
        {project.style && <span className="spec-pill">{project.style}</span>}
        {project.location && <span className="spec-pill">📍 {project.location}</span>}
        {project.completedYear && <span className="spec-pill">📅 {project.completedYear}</span>}
        {project.budget && <span className="spec-pill">💰 {project.budget}</span>}
        {project.timeline && <span className="spec-pill">⏱️ {project.timeline}</span>}
      </div>
      </Reveal>

      {/* Two col layout: images left, vendor card right */}
      <Reveal delay={0.1} className="two-col-layout">

        {/* LEFT: Images + description */}
        <div>
          {/* Before/after slider if set */}
          {project.beforeImage && project.afterImage && (
            <div style={{ marginBottom: 24 }}>
              <span style={LABEL}>BEFORE &amp; AFTER</span>
              <BeforeAfterSlider before={project.beforeImage} after={project.afterImage} />
            </div>
          )}

          {/* Image gallery grid */}
          {project.images?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <span style={LABEL}>PROJECT PHOTOS</span>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,280px),1fr))',
                gap: 12,
              }}>
                {project.images.map((img, i) => (
                  <div key={i} style={{
                    borderRadius: 'var(--r-lg)', overflow: 'hidden',
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
              <span style={LABEL}>ABOUT THIS PROJECT</span>
              <p style={{ fontSize: 15, color: 'var(--text-sub)', lineHeight: 1.75, margin: 0 }}>
                {project.description}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT: Vendor card */}
        <div>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            padding: 24,
            position: 'sticky', top: 88,
          }}>
            <span style={{ ...LABEL, marginBottom: 16 }}>DESIGNED BY</span>

            {/* Vendor avatar + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'var(--primary-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, overflow: 'hidden', position: 'relative',
              }}>
                {vendor.profilePhoto ? (
                  <Image src={vendor.profilePhoto} alt={vendor.businessName} fill style={{ objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>
                    {vendor.businessName?.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>
                  {vendor.businessName}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-hint)' }}>
                  ⭐ {vendor.rating || 0} · {vendor.location?.city}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
              marginBottom: 16, background: 'var(--bg-parchment)',
              borderRadius: 'var(--r-md)', padding: 12,
            }}>
              {[
                { label: 'Rating', value: `${vendor.rating || 0}★` },
                { label: 'Reviews', value: vendor.reviewCount || 0 },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <Link href={`/enquiry?vendorId=${vendor._id}`} style={{ display: 'block', marginBottom: 8 }}>
              <button style={{
                width: '100%', height: 48,
                background: 'var(--primary)', color: '#fff',
                border: 'none', borderRadius: 'var(--r-md)',
                fontSize: 15, fontWeight: 600, cursor: 'pointer',
              }}>
                Submit enquiry →
              </button>
            </Link>

            <Link href={`/vendors/${vendor._id}`} style={{ display: 'block' }}>
              <button style={{
                width: '100%', height: 44,
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
                fontSize: 14, fontWeight: 500,
                color: 'var(--text)', cursor: 'pointer',
              }}>
                View full profile
              </button>
            </Link>
          </div>
        </div>
      </Reveal>

      {/* ── RELATED PROJECTS ── */}
      {relatedProjects.length > 0 && (
        <div style={{ marginTop: 64, borderTop: '1px solid var(--border)', paddingTop: 48 }}>
          <span style={{ ...LABEL, marginBottom: 6 }}>RELATED PROJECTS</span>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 300,
            color: 'var(--text)', margin: '0 0 28px', letterSpacing: '-.015em',
          }}>
            More projects you might like
          </h2>
          <ProjectsSection projects={relatedProjects} />
        </div>
      )}
    </div>
  );
}
