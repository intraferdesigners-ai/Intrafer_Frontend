import GalleryGrid from '@/components/vendor/GalleryGrid';
import { cachedJson } from '@/lib/cachedFetch';
import { LIST_WINDOW, TAGS } from '@/lib/cacheTags';
import { SITE_URL } from '@/lib/siteUrl';

// Cached (ISR, 5 min), purged on 'projects'. Same unpaginated
// GET /public/gallery call as before; a failure throws at runtime so the
// last good page stays up (see lib/cachedFetch.js).
export const revalidate = 300;

export const metadata = {
  title: 'Design Gallery',
  description: 'Browse real interior design projects from verified designers across India.',
  alternates: { canonical: `${SITE_URL}/gallery/` },
};

async function fetchProjects() {
  const json = await cachedJson(`${process.env.NEXT_PUBLIC_API_URL}/public/gallery`, { revalidate: LIST_WINDOW, tags: [TAGS.PROJECTS] });
  return json?.data?.projects || [];
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
