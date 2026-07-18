import Image from 'next/image';
import Link from 'next/link';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';
import { IMAGES } from '@/lib/images';

export const metadata = {
  title: 'Interior Design Styles | Intrafer',
  description: 'Explore modern, Scandinavian, luxury, minimalist, and traditional interior design styles.',
  openGraph: {
    title: 'Interior Design Styles | Intrafer',
    description: 'Explore modern, Scandinavian, luxury, minimalist, and traditional interior design styles.',
    url: 'https://intrafer.in/design-styles',
    siteName: 'Intrafer',
    type: 'website',
  },
};

const STYLES_DATA = [
  { slug: 'modern',       label: 'Modern',       desc: 'Clean lines, neutral palette, function-first.',           image: IMAGES.styles.modern,       count: '14 designers' },
  { slug: 'scandinavian', label: 'Scandinavian', desc: 'Light woods, whites, warmth without clutter.',             image: IMAGES.styles.scandinavian, count: '9 designers' },
  { slug: 'luxury',       label: 'Luxury',       desc: 'Rich materials, statement pieces, curated excess.',        image: IMAGES.styles.luxury,       count: '11 designers' },
  { slug: 'minimalist',   label: 'Minimalist',   desc: 'Less is more. Every element earns its place.',             image: IMAGES.styles.minimalist,   count: '8 designers' },
  { slug: 'traditional',  label: 'Traditional',  desc: 'Indian craftsmanship meets timeless elegance.',            image: IMAGES.styles.traditional,  count: '10 designers' },
  { slug: 'bohemian',     label: 'Bohemian',     desc: 'Layered textures, global influences, lived-in warmth.',    image: IMAGES.styles.bohemian,     count: '6 designers' },
  { slug: 'industrial',   label: 'Industrial',   desc: 'Raw materials, exposed structure, urban edge.',            image: IMAGES.styles.industrial,   count: '7 designers' },
  { slug: 'contemporary', label: 'Contemporary', desc: 'Current trends, flexible spaces, modern Indian life.',     image: IMAGES.styles.contemporary, count: '12 designers' },
];

export default function DesignStylesPage() {
  return (
    <div style={{ fontFamily: 'var(--v2-font-ui)' }}>
      {/* Hero */}
      <section style={{ background: '#0F172A', padding: 'clamp(64px,9vw,96px) clamp(16px,4vw,36px) clamp(48px,6vw,72px)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <RevealOnScroll direction="up">
            <p className="v2-eyebrow" style={{ marginBottom: '16px' }}>Design styles</p>
            <h1 className="v2-h1" style={{ color: '#F8F7F4', marginBottom: '16px' }}>
              Find a style that feels like home.
            </h1>
            <p style={{ fontSize: '16px', color: '#94A3B8', lineHeight: 1.7 }}>
              Not sure what style you want? Browse our guides to find the look that matches how you live.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Styles grid */}
      <section style={{ background: '#F8F7F4', padding: 'clamp(48px,8vw,80px) clamp(16px,4vw,36px)' }}>
        <div style={{
          maxWidth: '1140px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px',
        }} className="grid-mobile-1">
          {STYLES_DATA.map((style, i) => (
            <RevealOnScroll key={style.slug} direction="up" delay={(i % 4) * 80}>
              <Link href={`/design-styles/${style.slug}`} style={{ textDecoration: 'none' }}>
                <div className="v2-card v2-style-card">
                  <div style={{ position: 'relative', height: '200px' }}>
                    <Image src={style.image} alt={style.label} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 50vw, 25vw" />
                    <div className="v2-style-overlay" style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(15,23,42,0.25)',
                      transition: 'background 200ms',
                    }} />
                    <div style={{
                      position: 'absolute', bottom: '14px', left: '16px',
                      fontFamily: 'var(--v2-font-display)', fontSize: '22px',
                      color: '#FFFFFF', fontWeight: 500,
                    }}>
                      {style.label}
                    </div>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6, marginBottom: '10px' }}>
                      {style.desc}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>{style.count}</span>
                      <span style={{ fontSize: '13px', color: '#3B82F6', fontWeight: 500 }}>Explore →</span>
                    </div>
                  </div>
                </div>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </section>
    </div>
  );
}
