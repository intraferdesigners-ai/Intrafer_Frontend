import { cachedJson } from '@/lib/cachedFetch';
import { LIST_WINDOW, TAGS } from '@/lib/cacheTags';
import { SITE_URL } from '@/lib/siteUrl';
import { pageNode } from '@/lib/structuredData';
import { CITY_PAGE_SIZE, cityPath, itemPosition, pageHref } from '@/lib/cityPagination';

// Shared by the city page (page 1, ./page.jsx) and its vendor-list pages
// 2+ (./p/[page]/page.jsx, reached through the ?page=N rewrite in
// next.config.js). Both are cached (ISR, 5 min) per path.

const API = process.env.NEXT_PUBLIC_API_URL;

export const cityPathOf = (params) => cityPath(params.category, params.state, params.city);

// 404 (inactive / unknown category) -> null -> notFound(); any other
// failure throws, so a backend blip is never cached as a 404.
export async function fetchCategory(slug) {
  const json = await cachedJson(`${API}/public/service-categories/${encodeURIComponent(slug)}`, {
    revalidate: LIST_WINDOW, tags: [TAGS.TAXONOMY], nullOn404: true,
  });
  return json?.data?.category ?? null;
}

// One page (CITY_PAGE_SIZE vendors) of the automatic city page's list, with
// total / totalPages / meetsThreshold / city / state. 404 (unknown
// state/city) -> null -> notFound(); a 500 or network error throws instead
// — never a cached 404 for a real city.
export async function fetchVendors(categorySlug, stateSlug, citySlug, page = 1) {
  const json = await cachedJson(
    `${API}/public/vendors?category=${encodeURIComponent(categorySlug)}&state=${encodeURIComponent(stateSlug)}&city=${encodeURIComponent(citySlug)}&page=${page}&limit=${CITY_PAGE_SIZE}`,
    { revalidate: LIST_WINDOW, tags: [TAGS.VENDORS], nullOn404: true },
  );
  return json?.data ?? null;
}

// CollectionPage + ItemList of exactly the vendors shown on page `n`, with
// positions continuing across pages (page 2 starts at 13). Its url is the
// page's own (canonical) URL.
export function buildCollectionJsonLd(params, category, city, state, vendors, n = 1) {
  if (vendors.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    ...pageNode(pageHref(cityPathOf(params), n)),
    name: n > 1 ? `${category.name} in ${city}, ${state} — Page ${n}` : `${category.name} in ${city}, ${state}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: vendors.map((v, i) => {
        const image = v.profilePhoto || v.cardImages?.[0] || v.bannerImage || undefined;
        // Only real review data earns an aggregateRating — an unrated
        // vendor (rating 0 / reviewCount 0, true for everyone here today)
        // gets none, rather than fabricated 0-star markup.
        const aggregateRating = v.rating > 0 && v.reviewCount > 0
          ? { '@type': 'AggregateRating', ratingValue: v.rating, reviewCount: v.reviewCount }
          : undefined;
        return {
          '@type': 'ListItem',
          position: itemPosition(n, i),
          item: {
            '@type': category.schemaOrgType,
            name: v.businessName,
            url: `${SITE_URL}/vendors/${v._id}/`,
            ...(image && { image }),
            ...(aggregateRating && { aggregateRating }),
          },
        };
      }),
    },
  };
}
