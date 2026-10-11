import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import BeforeAfterSlider from '../../../../components/ui/BeforeAfterSlider';
import ProjectsSection from '../../../../components/vendor/ProjectsSection';
import Reveal from '../../../../components/ui/Reveal';
import Breadcrumb from '../../../../components/seo/Breadcrumb';
import { SITE_URL } from '../../../../lib/siteUrl';
import { isPublicProject } from '../../../../lib/projectSitemap';
import { cachedJson } from '../../../../lib/cachedFetch';
import { DETAIL_WINDOW, TAGS, projectTag, vendorTag } from '../../../../lib/cacheTags';

const API = process.env.NEXT_PUBLIC_API_URL;

// Cached per project (ISR, 15 min) — the 404 for a missing/hidden project
// included — and purged by the backend on any change to the project or its
// vendor (project:<id>, vendor:<id>, projects).
export const revalidate = 900; // = DETAIL_WINDOW (Next needs a literal here)

// No ids are built ahead; each one is rendered on its first request and
// then cached (on-demand ISR). Without this, Next 14 renders the dynamic
// segment on every request.
export function generateStaticParams() {
  return [];
}

const OBJECT_ID = /^[a-f0-9]{24}$/i;

// The project if it's public, null if it isn't: malformed id (never sent —
// the backend would 500 on the cast), a 404 from the API (missing,
// unpublished or unapproved), or a project failing the same isPublicProject
// rule the sitemap uses (e.g. its vendor is gone, so vendorId populates to
// null). Any other failure — network, 5xx — throws, so a backend blip is a
// 5xx crawlers retry (and never a cached 404) rather than a dropped page.
async function fetchProject(id) {
  if (!OBJECT_ID.test(id)) return null;
  const json = await cachedJson(`${API}/public/projects/${id}`, {
    revalidate: DETAIL_WINDOW, tags: [projectTag(id), TAGS.PROJECTS], nullOn404: true,
  });
  const project = json?.data?.project;
  return isPublicProject(project) && typeof project.vendorId === 'object' ? project : null;
}

// 404 (the project itself is missing or hidden) -> [] so the page's own
// 404 wins; other failures throw like fetchProject's.
async function fetchRelatedProjects(id) {
  if (!OBJECT_ID.test(id)) return [];
  const json = await cachedJson(`${API}/public/projects/${id}/related`, {
    revalidate: DETAIL_WINDOW, tags: [projectTag(id), TAGS.PROJECTS], nullOn404: true,
  });
  return json?.data?.projects || [];
}

// getProjectById's populated vendorId sub-document doesn't include
// primaryCategory (public.controller.js, untouched this step). Rather than
// extend that endpoint — this step explicitly excludes touching any Step
// 1-7 backend file — this reuses GET /api/public/vendors/:id, which Step 6
// already populates primaryCategory on, for the one extra field the
// breadcrumb needs. Returns null if the vendor has none set (or 404s), so
// the page falls back to the shorter breadcrumb; other failures throw.
async function fetchVendorCategory(vendorId) {
  const json = await cachedJson(`${API}/public/vendors/${vendorId}`, {
    revalidate: DETAIL_WINDOW, tags: [vendorTag(vendorId), TAGS.VENDORS], nullOn404: true,
  });
  return json?.data?.vendor?.primaryCategory ?? null;
}

export async function generateMetadata({ params }) {
  const project = await fetchProject(params.projectId);
  if (!project) return { title: 'Project not found', robots: { index: false, follow: false } };
  return {
    // Root layout's title template already appends " | Intrafer" — this
    // used to append it a second time too, rendering "X | Intrafer |
    // Intrafer" (same bug already fixed on the category page in Step 3).
    title: project.title,
    description: (project.description || '').slice(0, 155),
    // Step 8 of the SEO restructuring project: this page is now reachable
    // from more places (vendor profile, related projects, ...) and needs
    // to state its own canonical explicitly. No robots override — this
    // page had no robots meta before this step and still doesn't; that's
    // an indexation decision out of scope here.
    alternates: { canonical: `${SITE_URL}/projects/${params.projectId}/` },
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

  // Real HTTP 404 (rendered by ./not-found.jsx) instead of a 200 "not
  // found" page that search engines would index as a soft 404.
  if (!project) notFound();

  // vendorId is populated server-side into the vendor sub-document (see
  // getProjectById), so project.vendorId IS the vendor object — no second fetch.
  const vendor = project.vendorId;

  // Step 8 of the SEO restructuring project: Home > Category > Vendor >
  // Project, falling back to Home > Vendor > Project when the vendor has
  // no primaryCategory set (never omitted entirely — a fallback shape is
  // always renderable once we know project+vendor exist, unlike Step 6's
  // vendor-page breadcrumb which needs a resolvable Place too).
  const category = await fetchVendorCategory(vendor._id);
  const breadcrumbItems = category?.slug && category?.name
    ? [
        { label: 'Home', href: '/' },
        { label: category.name, href: `/${category.slug}/` },
        { label: vendor.businessName, href: `/vendors/${vendor._id}/` },
        { label: project.title },
      ]
    : [
        { label: 'Home', href: '/' },
        { label: vendor.businessName, href: `/vendors/${vendor._id}/` },
        { label: project.title },
      ];

  // Real fields only — no rating/review, no fabricated date beyond the
  // project's own createdAt (the one real timestamp Project.model.js has;
  // completedYear is just a year number, not precise enough for
  // datePublished). ImageObject entries per image/before/after — the
  // "CreativeWork+ImageObject combination" the task calls for when
  // before/after images exist.
  // Deduped: beforeImage/afterImage are sometimes the same URL as one of
  // the gallery images (real data can double up), and repeating an
  // identical ImageObject entry would just be redundant structured data.
  const allImages = [...new Set([
    ...(project.images || []),
    ...(project.beforeImage ? [project.beforeImage] : []),
    ...(project.afterImage ? [project.afterImage] : []),
  ])];
  const projectJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    url: `${SITE_URL}/projects/${project._id}/`,
    ...(project.description && { description: project.description }),
    ...(project.createdAt && { datePublished: new Date(project.createdAt).toISOString() }),
    creator: {
      '@type': 'Organization',
      name: vendor.businessName,
      url: `${SITE_URL}/vendors/${vendor._id}/`,
    },
    ...(allImages.length > 0 && {
      image: allImages.map((url) => ({ '@type': 'ImageObject', contentUrl: url })),
    }),
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(80px,10vw,120px) clamp(16px,5vw,40px) 80px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />
      <Breadcrumb items={breadcrumbItems} />

      {/* Back link */}
      <Link
        href={`/vendors/${vendor._id}/`}
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
            <Link href={`/enquiry/?vendorId=${vendor._id}`} style={{ display: 'block', marginBottom: 8 }}>
              <button style={{
                width: '100%', height: 48,
                background: 'var(--primary)', color: '#fff',
                border: 'none', borderRadius: 'var(--r-md)',
                fontSize: 15, fontWeight: 600, cursor: 'pointer',
              }}>
                Submit enquiry →
              </button>
            </Link>

            <Link href={`/vendors/${vendor._id}/`} style={{ display: 'block' }}>
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
