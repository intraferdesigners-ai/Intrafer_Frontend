import GalleryGrid from '@/components/vendor/GalleryGrid';

export const metadata = {
  title: 'Design Gallery | Intrafer',
  description: 'Browse real interior design projects from verified designers across India.',
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
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '108px 32px 80px' }}>
      <p className="caps-label-primary" style={{ marginBottom: '8px' }}>DESIGN GALLERY</p>
      <h1 className="page-heading" style={{ marginBottom: '10px' }}>Find your style</h1>
      <p style={{ fontSize: '14px', color: 'var(--text-mid)', marginBottom: '36px' }}>
        Browse real interior design projects from verified designers across India.
        {projects.length > 0 && ` ${projects.length} projects and counting.`}
      </p>

      <GalleryGrid projects={projects} />
    </div>
  );
}
