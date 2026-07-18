import GalleryGrid from '@/components/vendor/GalleryGrid';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';

export const metadata = {
  title: 'Interior Design Gallery | Intrafer',
  description: 'Browse real interior design projects completed by verified Intrafer designers across India.',
  openGraph: {
    title: 'Interior Design Gallery | Intrafer',
    description: 'Browse real interior design projects completed by verified Intrafer designers across India.',
    url: 'https://intrafer.in/gallery',
    siteName: 'Intrafer',
    type: 'website',
  },
};

async function fetchProjects() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/public/gallery`,
      { cache: 'no-store' }
    );
    if (!res.ok) throw new Error(`API ${res.status}`);
    const json = await res.json();
    return json.data?.projects || [];
  } catch {
    return [];
  }
}

export default async function GalleryPage() {
  const projects = await fetchProjects();

  return (
    <div style={{ fontFamily: 'var(--v2-font-ui)' }}>
      {/* Hero */}
      <section style={{ background: '#0F172A', padding: '48px clamp(16px,4vw,36px) 40px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <RevealOnScroll direction="up">
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.12em', color: '#3B82F6', textTransform: 'uppercase', marginBottom: '16px' }}>
              Design gallery
            </p>
            <h1 style={{
              fontFamily: 'var(--v2-font-display)', fontSize: 'clamp(28px,4.5vw,42px)',
              fontWeight: 500, color: '#F8F7F4', margin: '0 0 12px',
            }}>Real homes. Real designers. Real work.</h1>
            <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.7 }}>
              Every image in this gallery is from a verified project completed by an Intrafer designer.
              {projects.length > 0 && ` ${projects.length} projects and counting.`}
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Grid — reuses the existing GalleryGrid component (filters + masonry layout) unmodified */}
      <section style={{ background: '#F8F7F4', padding: 'clamp(40px,6vw,56px) clamp(16px,4vw,36px) clamp(56px,8vw,80px)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <GalleryGrid projects={projects} />
        </div>
      </section>
    </div>
  );
}
