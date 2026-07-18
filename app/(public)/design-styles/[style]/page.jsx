import Image from 'next/image';
import Link from 'next/link';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';
import V2Button from '@/components/v2/ui/Button';
import VendorCardV2 from '@/components/v2/vendors/VendorCard';
import { IMAGES } from '@/lib/images';

const STYLE_META = {
  modern:       { label: 'Modern',       desc: 'Clean lines, functional furniture, and a neutral palette define the modern aesthetic. Expect open floor plans, hidden storage, and materials like glass, steel, and concrete.', hero: IMAGES.styles.modernHero,       gallery: [IMAGES.styles.modern, IMAGES.styles.contemporary, IMAGES.styles.minimalist] },
  scandinavian: { label: 'Scandinavian', desc: 'Born in the Nordic countries, Scandinavian design embraces simplicity, natural light, and cosy warmth. Think white walls, pale wood, linen fabrics, and unfussy furnishings.', hero: IMAGES.styles.scandinavianHero, gallery: [IMAGES.styles.scandinavian, IMAGES.styles.minimalist, IMAGES.styles.modern] },
  luxury:       { label: 'Luxury',       desc: 'Bespoke joinery, premium stones, imported furniture, and impeccable craftsmanship. Luxury design is the art of restraint combined with the finest materials money can buy.', hero: IMAGES.styles.luxuryHero,       gallery: [IMAGES.styles.luxury, IMAGES.styles.traditional, IMAGES.styles.contemporary] },
  minimalist:   { label: 'Minimalist',   desc: 'Less is more. Minimalist spaces are carefully curated — every object earns its place. Monochromatic palettes, clean surfaces, and maximum natural light.', hero: IMAGES.styles.minimalistHero,   gallery: [IMAGES.styles.minimalist, IMAGES.styles.modern, IMAGES.styles.scandinavian] },
  traditional:  { label: 'Traditional',  desc: 'Indian craftsmanship meets timeless elegance. Classic proportions, rich wood tones, ornate detailing, and plush upholstery define the traditional style.', hero: IMAGES.styles.traditionalHero,  gallery: [IMAGES.styles.traditional, IMAGES.styles.luxury, IMAGES.styles.bohemian] },
  bohemian:     { label: 'Bohemian',     desc: 'Eclectic, free-spirited, and deeply personal. Bohemian interiors mix global textiles, handmade objects, and abundant plants with a fearless use of colour and pattern.', hero: IMAGES.styles.bohemianHero,     gallery: [IMAGES.styles.bohemian, IMAGES.styles.traditional, IMAGES.styles.industrial] },
  industrial:   { label: 'Industrial',   desc: 'Raw materials take centre stage: exposed brick, concrete floors, steel beams, and Edison bulbs. Urban and honest, industrial spaces celebrate the beauty of the unfinished.', hero: IMAGES.styles.industrialHero,   gallery: [IMAGES.styles.industrial, IMAGES.styles.modern, IMAGES.styles.contemporary] },
  contemporary: { label: 'Contemporary', desc: 'Always current, never static. Contemporary design incorporates the best of now — bold accents, mixed materials, sculptural forms, and a sophisticated editorial quality.', hero: IMAGES.styles.contemporaryHero, gallery: [IMAGES.styles.contemporary, IMAGES.styles.modern, IMAGES.styles.luxury] },
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
  return { title: `${meta.label} Interior Designers | Intrafer` };
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
  if (!meta) {
    return (
      <div style={{ background: '#0F172A', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '80px 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--v2-font-display)', fontSize: '28px', color: '#F8F7F4', marginBottom: '16px' }}>Style not found</h1>
        <Link href="/design-styles" style={{ color: '#3B82F6', fontSize: '14px', textDecoration: 'none' }}>← All styles</Link>
      </div>
    );
  }

  const vendors = await fetchVendors(params.style);

  return (
    <div style={{ fontFamily: 'var(--v2-font-ui)' }}>
      {/* Hero */}
      <section style={{ background: '#0F172A', padding: 'clamp(56px,8vw,88px) clamp(16px,4vw,36px) clamp(48px,6vw,64px)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <RevealOnScroll direction="up">
            <Link href="/design-styles" style={{
              fontSize: '13px', color: '#94A3B8', textDecoration: 'none',
              display: 'inline-block', marginBottom: '24px',
            }}>
              ← All styles
            </Link>
            <h1 className="v2-h1" style={{ color: '#F8F7F4', marginBottom: '18px' }}>
              {meta.label}
            </h1>
            <p style={{ fontSize: '16px', color: '#94A3B8', lineHeight: 1.8, marginBottom: '28px', maxWidth: '620px' }}>
              {meta.desc}
            </p>
            <Link href={`/vendors?specialization=${encodeURIComponent(STYLE_SPECIALIZATIONS[params.style] || meta.label)}`}>
              <V2Button variant="primary" size="lg">Find {meta.label} designers →</V2Button>
            </Link>
          </RevealOnScroll>
        </div>
      </section>

      {/* Inspiration grid */}
      <section style={{ background: '#F8F7F4', padding: 'clamp(48px,7vw,72px) clamp(16px,4vw,36px)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <p className="v2-eyebrow" style={{ marginBottom: '12px' }}>Inspiration</p>
          <h2 className="v2-h3" style={{ color: '#0F172A', marginBottom: '28px' }}>{meta.label} spaces</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }} className="grid-mobile-1">
            {meta.gallery.map((img, i) => (
              <RevealOnScroll key={img + i} direction="up" delay={i * 80}>
                <div style={{ position: 'relative', height: '280px', borderRadius: '14px', overflow: 'hidden' }}>
                  <Image src={img} alt={`${meta.label} inspiration ${i + 1}`} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 100vw, 33vw" />
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Designers */}
      <section style={{ background: '#0F172A', padding: 'clamp(48px,7vw,72px) clamp(16px,4vw,36px)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <p className="v2-eyebrow" style={{ marginBottom: '12px' }}>Designers</p>
          <h2 className="v2-h3" style={{ color: '#F8F7F4', marginBottom: '28px' }}>
            Designers specialising in {meta.label}
          </h2>

          {vendors.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
              {vendors.map((v, i) => (
                <RevealOnScroll key={v._id} direction="up" delay={(i % 4) * 100}>
                  <VendorCardV2 vendor={v} />
                </RevealOnScroll>
              ))}
            </div>
          ) : (
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px', padding: '48px', textAlign: 'center',
            }}>
              <p style={{ fontSize: '15px', color: '#94A3B8', marginBottom: '16px' }}>
                Browse all our designers to find {meta.label.toLowerCase()} specialists.
              </p>
              <Link href="/vendors" style={{ color: '#3B82F6', fontWeight: 500, fontSize: '14px', textDecoration: 'none' }}>
                Browse all designers →
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
