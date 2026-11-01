import { cache } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import Breadcrumb from '@/components/seo/Breadcrumb';
import JsonLd from '@/components/seo/JsonLd';
import VendorPagination from '@/components/seo/VendorPagination';
import { authoredRobots } from '@/components/seo/LandingAuthored';
import RevealItem from '@/components/ui/RevealItem';
import VendorCard from '@/components/vendor/VendorCard';
import { fetchLandingData } from '@/lib/landingHub';
import { landingPreviewToken } from '@/lib/landingDraft';
import { CITY_PAGE_SIZE, parsePageParam } from '@/lib/cityPagination';
import { SITE_URL } from '@/lib/siteUrl';
import { buildCollectionJsonLd, cityPathOf, fetchCategory, fetchVendors } from '../../cityData';

// Vendor-list page N (>= 2) of a city landing page. Public URL:
// /<category>/<state>/<city>/?page=N — next.config.js rewrites it here, so
// the city page itself (page 1) never reads searchParams and stays fully
// cached; a direct visit to this internal /p/N/ path is redirected to the
// public URL. Shows a short heading and the vendor list only (the intro,
// sections and FAQ stay on page 1), with its own self-canonical, title and
// description. ?page=1 -> 308 to the city URL; a page past the last one,
// or a malformed value (0, negative, decimal, leading zero, non-digit,
// > 9999) -> 404.

// Cached (ISR, 5 min) per page, purged with the city page's tags (vendors,
// landing, taxonomy). Nothing built ahead.
export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

const load = cache(async (category, state, city, raw, token) => {
  const parsed = parsePageParam(raw);
  if (parsed.kind !== 'page') return { parsed };
  const n = parsed.n;
  const [cat, landing] = await Promise.all([
    fetchCategory(category),
    fetchLandingData({ category, state, city, vendorPage: n }, token),
  ]);
  if (!cat) return { parsed };
  // A published authored page lists its vendors in its own sort order (the
  // landing response, 12 per page); otherwise the automatic page's list.
  if (landing?.page) {
    return {
      parsed, n, cat, landing, vendors: landing.vendors || [], total: landing.vendorPages || 1,
      count: landing.vendorCount || 0, city: landing.page.city, state: landing.page.state,
    };
  }
  const data = await fetchVendors(category, state, city, n);
  if (!data) return { parsed };
  return {
    parsed, n, cat, data, vendors: data.vendors || [], total: data.totalPages || 1,
    count: data.total || 0, city: data.city, state: data.state,
  };
});

const loadFor = (params) => load(params.category, params.state, params.city, params.page, landingPreviewToken());

// Missing category/city, or a page past the last one.
const exists = (r) => r.cat && r.n <= r.total && r.vendors.length > 0;

export async function generateMetadata({ params }) {
  const r = await loadFor(params);
  if (r.parsed.kind === 'first') permanentRedirect(cityPathOf(params));
  if (r.parsed.kind !== 'page' || !exists(r)) return { title: 'Page not found', robots: { index: false, follow: false } };
  const where = `${r.city}, ${r.state}`;
  return {
    // Root layout's title template appends " | Intrafer".
    title: `${r.cat.name} in ${where} — Page ${r.n}`,
    description: `Page ${r.n} of ${r.total}: ${r.cat.name.toLowerCase()} in ${where}, listed on Intrafer — compare portfolios and request quotes.`,
    // Same indexing as page 1 (authored: its own setting / threshold;
    // automatic: the vendor threshold) — pages 2+ are indexable whenever
    // page 1 is, but only page 1 is in the sitemap.
    ...(r.landing ? authoredRobots(r.landing) : (!r.data.meetsThreshold && { robots: { index: false, follow: true } })),
    alternates: { canonical: `${SITE_URL}/${params.category}/${params.state}/${params.city}/?page=${r.n}` },
  };
}

export default async function CityVendorsPage({ params }) {
  const r = await loadFor(params);
  if (r.parsed.kind === 'first') permanentRedirect(cityPathOf(params));
  if (r.parsed.kind !== 'page' || !exists(r)) notFound();

  const { n, cat, vendors, total, count, city, state } = r;
  const basePath = cityPathOf(params);
  const from = (n - 1) * CITY_PAGE_SIZE + 1;
  const to = from + vendors.length - 1;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '108px 40px 80px' }}>
      <JsonLd data={buildCollectionJsonLd(params, cat, city, state, vendors, n)} />
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: cat.name, href: `/${params.category}/` },
        { label: state, href: `/${params.category}/${params.state}/` },
        { label: city, href: basePath },
        { label: `Page ${n}` },
      ]} />

      <h1 className="section-heading" style={{ marginBottom: '8px' }}>
        {cat.name} in {city}, {state} — page {n}
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-mid)', marginBottom: '32px' }}>
        Showing {from}–{to} of {count}.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '20px' }}>
        {vendors.map((v, i) => (
          <RevealItem key={v._id} index={i % 6}>
            <VendorCard vendor={v} priority={i < 2} />
          </RevealItem>
        ))}
      </div>

      <VendorPagination basePath={basePath} current={n} total={total} />
    </div>
  );
}
