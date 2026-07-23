import Image from 'next/image';
import Link from 'next/link';
import VendorCard from '../../../../components/vendor/VendorCard';
import { IMAGES } from '../../../../lib/images';
import Reveal from '../../../../components/ui/Reveal';
import RevealItem from '../../../../components/ui/RevealItem';

const STYLE_META = {
  modern:       { label:'Modern',       desc:'Clean lines, functional furniture, and a neutral palette define the modern aesthetic. Expect open floor plans, hidden storage, and materials like glass, steel, and concrete.', hero: IMAGES.styles.modernHero },
  scandinavian: { label:'Scandinavian', desc:'Born in the Nordic countries, Scandinavian design embraces simplicity, natural light, and cosy warmth. Think white walls, pale wood, linen fabrics, and unfussy furnishings.', hero: IMAGES.styles.scandinavianHero },
  traditional:  { label:'Traditional', desc:'Classic proportions, rich wood tones, ornate detailing, and plush upholstery define the traditional style. Timeless, familiar, and deeply comfortable.', hero: IMAGES.styles.traditionalHero },
  minimalist:   { label:'Minimalist', desc:'Less is more. Minimalist spaces are carefully curated — every object earns its place. Monochromatic palettes, clean surfaces, and maximum natural light.', hero: IMAGES.styles.minimalistHero },
  bohemian:     { label:'Bohemian', desc:'Eclectic, free-spirited, and deeply personal. Bohemian interiors mix global textiles, handmade objects, and abundant plants with a fearless use of colour and pattern.', hero: IMAGES.styles.bohemianHero },
  industrial:   { label:'Industrial', desc:'Raw materials take centre stage: exposed brick, concrete floors, steel beams, and Edison bulbs. Urban and honest, industrial spaces celebrate the beauty of the unfinished.', hero: IMAGES.styles.industrialHero },
  luxury:       { label:'Luxury', desc:'Bespoke joinery, premium stones, imported furniture, and impeccable craftsmanship. Luxury design is the art of restraint combined with the finest materials money can buy.', hero: IMAGES.styles.luxuryHero },
  contemporary: { label:'Contemporary', desc:'Always current, never static. Contemporary design incorporates the best of now — bold accents, mixed materials, sculptural forms, and a sophisticated editorial quality.', hero: IMAGES.styles.contemporaryHero },
};

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
  return { title: `${meta.label} Interior Designers in Bangalore | Intrafer` };
}

export function generateStaticParams() {
  return Object.keys(STYLE_META).map((style) => ({ style }));
}

async function fetchVendors(style) {
  try {
    const spec = STYLE_SPECIALIZATIONS[style] || style;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/public/vendors?specialization=${encodeURIComponent(spec)}&limit=6`,
      { cache: 'no-store' }
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
