import Image from 'next/image';
import Link from 'next/link';
import VendorCard from '../../../../components/vendor/VendorCard';
import { STYLE_META } from '../../../../lib/designStyles';
import Reveal from '../../../../components/ui/Reveal';
import RevealItem from '../../../../components/ui/RevealItem';
import { TAGS } from '../../../../lib/cacheTags';
import { SITE_URL } from '../../../../lib/siteUrl';
import Breadcrumb from '@/components/seo/Breadcrumb';

// Cached (ISR): regenerated at most every 5 minutes. A failed fetch keeps
// the page's existing fallback, so a backend blip during regeneration can
// show that fallback until the next regeneration.
export const revalidate = 300;
// Only the known slugs exist: anything else is a real 404, and can't add
// an entry to the ISR cache.
export const dynamicParams = false;


const STYLE_SPECIALIZATIONS = {
  modern: 'Residential',
  scandinavian: 'Scandinavian',
  traditional: 'Traditional',
  minimalist: 'Minimalist',
  bohemian: 'Bohemian',
  industrial: 'Industrial',
  luxury: 'Luxury',
  contemporary: 'Contemporary',
};

export async function generateMetadata({ params }) {
  const meta = STYLE_META[params.style] || { label: params.style };
  return {
    title: `${meta.label} Interior Designers in India`,
    alternates: { canonical: `${SITE_URL}/design-styles/${params.style}/` },
  };
}

export function generateStaticParams() {
  return Object.keys(STYLE_META).map((style) => ({ style }));
}

async function fetchVendors(style) {
  try {
    const spec = STYLE_SPECIALIZATIONS[style] || style;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/public/vendors?specialization=${encodeURIComponent(spec)}&limit=6`,
      { next: { revalidate: 300, tags: [TAGS.VENDORS] } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.vendors || json.vendors || [];
  } catch { return []; }
}

export default async function StylePage({ params }) {
  const meta = STYLE_META[params.style];
  if (!meta) return (
    <div style={{ padding: '120px 40px', textAlign: 'center' }}>
      <h1>Style not found</h1>
      <Link href="/design-styles">Browse all styles →</Link>
    </div>
  );

  const vendors = await fetchVendors(params.style);

  return (
    <div>
      {/* Hero */}
      <div style={{ position: 'relative', height: '400px', overflow: 'hidden' }}>
        <Image src={meta.hero} alt={meta.label} fill style={{ objectFit: 'cover' }} priority sizes="100vw" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,.2) 0%, rgba(0,0,0,.6) 100%)' }} />
        <div style={{
          position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)',
          textAlign: 'center', color: '#fff',
        }}>
          <p style={{ fontSize: '11px', letterSpacing: '.14em', color: 'rgba(255,255,255,.7)', marginBottom: '8px' }}>DESIGN STYLE</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px,6vw,72px)', fontWeight: 400, letterSpacing: '-.02em', color: '#fff' }}>
            {meta.label}
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '64px 40px 80px' }}>
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'Design styles', href: '/design-styles/' },
          { label: meta.label },
        ]} />
        <Reveal>
          <p style={{ fontSize: '16px', color: 'var(--text-mid)', lineHeight: 1.8, maxWidth: '680px', marginBottom: '64px' }}>
            {meta.desc}
          </p>

          {/* Vendors */}
          <p className="caps-label-primary" style={{ marginBottom: '10px' }}>{meta.label.toUpperCase()} DESIGNERS</p>
          <h2 className="section-heading" style={{ marginBottom: '32px' }}>
            {vendors.length > 0 ? `${vendors.length} designers for ${meta.label} style` : `Find ${meta.label} designers`}
          </h2>
        </Reveal>

        {vendors.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '48px' }}>
            {vendors.map((v, i) => (
              <RevealItem key={v._id} index={i % 6}>
                <VendorCard vendor={v} />
              </RevealItem>
            ))}
          </div>
        ) : (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '48px', textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '15px', color: 'var(--text-mid)' }}>Browse all our designers to find {meta.label.toLowerCase()} specialists.</p>
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <Link href={`/vendors`} style={{
            display: 'inline-block', background: 'var(--primary)', color: '#fff',
            padding: '13px 32px', borderRadius: 'var(--r-md)', fontSize: '14px',
            fontWeight: 500, textDecoration: 'none',
          }}>
            Find a {meta.label} designer →
          </Link>
        </div>
      </div>
    </div>
  );
}
