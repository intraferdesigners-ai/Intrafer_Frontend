import Image from 'next/image';
import Link from 'next/link';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';
import V2Button from '@/components/v2/ui/Button';

export const metadata = {
  title: 'Recent Projects | Interior Design Work | Intrafer',
  description: 'Browse recently completed interior design projects across India by verified Intrafer designers.',
};

async function fetchProjects() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/gallery`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.projects || json.projects || json.data || [];
  } catch { return []; }
}

export default async function RecentProjectsPage() {
  const projects = await fetchProjects();

  return (
    <div style={{ fontFamily: 'var(--v2-font-ui)' }}>
      {/* Hero */}
      <section style={{ background: '#0F172A', padding: 'clamp(64px,9vw,96px) clamp(16px,4vw,36px) clamp(48px,6vw,64px)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <RevealOnScroll direction="up">
            <p className="v2-eyebrow" style={{ marginBottom: '16px' }}>Recent projects</p>
            <h1 className="v2-h1" style={{ color: '#F8F7F4', marginBottom: '16px' }}>
              Work completed by Intrafer designers.
            </h1>
            <p style={{ fontSize: '16px', color: '#94A3B8', lineHeight: 1.7 }}>
              Every project you see here was completed by a verified designer on our platform.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Project grid */}
      <section style={{ background: '#F8F7F4', padding: 'clamp(48px,8vw,80px) clamp(16px,4vw,36px)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          {projects.length > 0 ? (
            <div className="masonry-grid">
              {projects.map((project, i) => {
                const img = project.images?.[0] || project.coverImage;
                return (
                  <div key={project._id} className="gallery-item" style={{ marginBottom: '20px', breakInside: 'avoid' }}>
                    <RevealOnScroll direction="up" delay={(i % 6) * 60}>
                      <Link
                        href={project._id ? `/projects/${project._id}` : '/vendors'}
                        style={{ textDecoration: 'none' }}
                      >
                        <div className="v2-card">
                          <div style={{ position: 'relative', height: '240px' }}>
                            {img ? (
                              <Image src={img.startsWith('/') || img.startsWith('http') ? img : `/${img}`} alt={project.title || 'Project'} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 100vw, 33vw" />
                            ) : (
                              <div style={{ width: '100%', height: '100%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '13px' }}>No image</div>
                            )}
                          </div>
                          <div style={{ padding: '16px' }}>
                            <h3 style={{ fontFamily: 'var(--v2-font-display)', fontSize: '17px', fontWeight: 500, color: '#0F172A', marginBottom: '6px', lineHeight: 1.3 }}>
                              {project.title || 'Interior Project'}
                            </h3>
                            {project.vendor?.businessName && (
                              <p style={{ fontSize: '12px', color: '#3B82F6', fontWeight: 500, marginBottom: '8px' }}>
                                by {project.vendor.businessName}
                              </p>
                            )}
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              {project.projectType && (
                                <span style={{ fontSize: '11px', background: 'rgba(59,130,246,0.08)', color: '#3B82F6', padding: '3px 8px', borderRadius: '20px', fontWeight: 500 }}>
                                  {project.projectType}
                                </span>
                              )}
                              {project.location && (
                                <span style={{ fontSize: '11px', color: '#94A3B8' }}>📍 {project.location}</span>
                              )}
                              {project.year && (
                                <span style={{ fontSize: '11px', color: '#94A3B8' }}>{project.year}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </RevealOnScroll>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="v2-card" style={{ padding: '80px', textAlign: 'center' }}>
              <p style={{ fontSize: '16px', color: '#64748B', marginBottom: '20px' }}>Projects loading...</p>
              <Link href="/vendors" style={{ color: '#3B82F6', fontWeight: 500, fontSize: '14px', textDecoration: 'none' }}>Browse designers →</Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#0F172A', padding: 'clamp(56px,8vw,88px) clamp(16px,4vw,36px)', textAlign: 'center' }}>
        <RevealOnScroll direction="up">
          <h2 className="v2-h2" style={{ color: '#F8F7F4', marginBottom: '12px' }}>
            Add your project to this list
          </h2>
          <p style={{ fontSize: '15px', color: '#94A3B8', marginBottom: '28px' }}>
            Connect with a verified designer and transform your space.
          </p>
          <Link href="/enquiry">
            <V2Button variant="primary" size="lg">Submit an enquiry →</V2Button>
          </Link>
        </RevealOnScroll>
      </section>
    </div>
  );
}
