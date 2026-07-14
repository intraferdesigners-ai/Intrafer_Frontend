import Image from 'next/image';
import Link from 'next/link';

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
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '108px 40px 80px' }}>
      <p className="caps-label-primary" style={{ marginBottom: '10px' }}>PORTFOLIO</p>
      <h1 className="section-heading" style={{ marginBottom: '8px' }}>Recent projects</h1>
      <p style={{ fontSize: '15px', color: 'var(--text-mid)', marginBottom: '48px' }}>
        Delivered across India — {projects.length} real completed projects.
      </p>

      {projects.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }} className="grid-mobile-1">
          {projects.map((project) => {
            const img = project.images?.[0] || project.coverImage;
            return (
              <Link
                key={project._id}
                href={project._id ? `/projects/${project._id}` : '/vendors'}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
                }} className="card-hover">
                  <div style={{ position: 'relative', height: '220px' }}>
                    {img ? (
                      <Image src={img.startsWith('/') || img.startsWith('http') ? img : `/${img}`} alt={project.title || 'Project'} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 100vw, 33vw" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-hint)', fontSize: '13px' }}>No image</div>
                    )}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px', lineHeight: 1.3 }}>
                      {project.title || 'Interior Project'}
                    </h3>
                    {project.vendor?.businessName && (
                      <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 500, marginBottom: '6px' }}>
                        by {project.vendor.businessName}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {project.projectType && (
                        <span style={{ fontSize: '11px', background: 'var(--primary-bg)', color: 'var(--primary)', padding: '3px 8px', borderRadius: '20px', fontWeight: 500 }}>
                          {project.projectType}
                        </span>
                      )}
                      {project.location && (
                        <span style={{ fontSize: '11px', color: 'var(--text-hint)' }}>📍 {project.location}</span>
                      )}
                      {project.year && (
                        <span style={{ fontSize: '11px', color: 'var(--text-hint)' }}>{project.year}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '80px', textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: 'var(--text-mid)', marginBottom: '20px' }}>Projects loading...</p>
          <Link href="/vendors" style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '14px', textDecoration: 'none' }}>Browse designers →</Link>
        </div>
      )}

      {/* CTA */}
      <div className="cta-always-dark" style={{ marginTop: '60px', borderRadius: '20px', padding: '60px 40px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: '#FAFAF8', fontWeight: 400, marginBottom: '12px' }}>
          Add your project to this list
        </h2>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,.5)', marginBottom: '24px' }}>
          Connect with a verified designer and transform your space.
        </p>
        <Link href="/enquiry" style={{
          display: 'inline-block', background: 'var(--primary)', color: '#fff',
          padding: '13px 32px', borderRadius: 'var(--r-md)', fontSize: '14px',
          fontWeight: 500, textDecoration: 'none',
        }}>
          Submit an enquiry
        </Link>
      </div>
    </div>
  );
}
