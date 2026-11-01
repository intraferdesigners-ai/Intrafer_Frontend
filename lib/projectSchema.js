// Project page (/projects/<id>/) images + CreativeWork JSON-LD. Pure, so
// scripts/testStructuredData.mjs unit-tests it. The page renders its <img>
// alts from projectImages() too, so each ImageObject's caption is the alt
// text on the page, word for word.

import { absoluteUrl } from './siteUrl.js';

export const SCHEMA_CONTEXT = 'https://schema.org';

export const galleryAlt = (project, i) => `${project.title} ${i + 1}`;
export const beforeAlt = (project) => `${project.title} — before`;
export const afterAlt = (project) => `${project.title} — after`;

// Whether the page shows the before/after slider (it needs both images).
export const hasBeforeAfter = (project) => Boolean(project?.beforeImage && project?.afterImage);

const absolutize = (src) => (typeof src === 'string' && src.startsWith('/') ? absoluteUrl(src) : src);

// Every image the page shows, in page order (slider first, then the photo
// grid), each once: an image that appears twice keeps its first alt.
export function projectImages(project) {
  const shown = [
    ...(hasBeforeAfter(project) ? [
      { url: project.beforeImage, alt: beforeAlt(project) },
      { url: project.afterImage, alt: afterAlt(project) },
    ] : []),
    ...(project?.images || []).map((url, i) => ({ url, alt: galleryAlt(project, i) })),
  ];
  const seen = new Set();
  return shown.filter((img) => img.url && !seen.has(img.url) && seen.add(img.url));
}

// Real fields only: no rating/review, no width/height (not stored), and
// datePublished from createdAt (completedYear is only a year). `genre` holds
// the visible project type: schema.org's `category` is not a CreativeWork
// property (it belongs to Product/Offer/Service), `genre` is.
export function projectJsonLd(project, vendor) {
  const url = absoluteUrl(`/projects/${project._id}/`);
  const images = projectImages(project);
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'CreativeWork',
    '@id': `${url}#work`,
    name: project.title,
    url,
    ...(project.description && { description: project.description }),
    ...(project.projectType && { genre: project.projectType }),
    ...(project.createdAt && { datePublished: new Date(project.createdAt).toISOString() }),
    creator: {
      '@type': 'Organization',
      name: vendor.businessName,
      url: absoluteUrl(`/vendors/${vendor._id}/`),
    },
    ...(images.length > 0 && {
      image: images.map((img) => ({
        '@type': 'ImageObject',
        contentUrl: absolutize(img.url),
        name: img.alt,
        caption: img.alt,
      })),
    }),
  };
}
