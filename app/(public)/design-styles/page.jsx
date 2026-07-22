import Image from 'next/image';
import Link from 'next/link';
import { IMAGES } from '../../../lib/images';

export const metadata = {
  title: 'Interior Design Styles | Find Your Design Language | Intrafer',
  description: 'Explore modern, Scandinavian, luxury, minimalist, bohemian, industrial, traditional, and contemporary interior design styles.',
};

const STYLES_DATA = [
  { slug:'modern',       label:'Modern',       desc:'Clean lines, neutral palette, functional beauty.',       image: IMAGES.styles.modern },
  { slug:'scandinavian', label:'Scandinavian', desc:'Light woods, minimalism, cosy warmth.',                 image: IMAGES.styles.scandinavian },
  { slug:'traditional',  label:'Traditional',  desc:'Rich textures, classic furniture, timeless elegance.',  image: IMAGES.styles.traditional },
  { slug:'minimalist',   label:'Minimalist',   desc:'Less is more — curated, calm, clutter-free.',           image: IMAGES.styles.minimalist },
  { slug:'bohemian',     label:'Bohemian',     desc:'Eclectic, colourful, layered with personality.',        image: IMAGES.styles.bohemian },
  { slug:'industrial',   label:'Industrial',   desc:'Raw materials, exposed brick, urban edge.',              image: IMAGES.styles.industrial },
  { slug:'luxury',       label:'Luxury',       desc:'Bespoke materials, premium finishes, timeless grandeur.', image: IMAGES.styles.luxury },
  { slug:'contemporary', label:'Contemporary', desc:'Current trends, bold accents, sophisticated spaces.',    image: IMAGES.styles.contemporary },
];

async function fetchStyleCounts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/style-counts`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const json = await res.json();
    return json.data?.counts || {};
  } catch { return {}; }
}

export default async function DesignStylesPage() {
  const counts = await fetchStyleCounts();

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '108px 40px 80px' }}>
      <p className="caps-label-primary" style={{ marginBottom: '10px' }}>EXPLORE STYLES</p>
      <h1 className="section-heading" style={{ marginBottom: '8px' }}>Find your design language</h1>
      <p style={{ fontSize: '15px', color: 'var(--text-mid)', marginBottom: '48px' }}>
        From serene Scandinavian to bold industrial — find designers who speak your style.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))',
        gap: '20px',
      }}>
        {STYLES_DATA.map((style) => {
          const n = counts[style.slug] || 0;
          const countLabel = n > 0 ? `${n} designer${n !== 1 ? 's' : ''}` : 'New';
          return (
          <Link key={style.slug} href={`/design-styles/${style.slug}`} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '14px', overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
              transition: 'transform 200ms, box-shadow 200ms',
            }} className="card-hover">
              <div style={{ position: 'relative', height: '220px' }}>
                <Image src={style.image} alt={style.label} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 50vw, 25vw" />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,.6) 0%, transparent 60%)',
                }} />
                <div style={{
                  position: 'absolute', bottom: '14px', left: '14px',
                  fontFamily: 'var(--font-display)', fontSize: '22px',
                  color: '#fff', fontWeight: 400,
                }}>
                  {style.label}
                </div>
              </div>
              <div style={{ padding: '16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-mid)', marginBottom: '8px', lineHeight: 1.5 }}>
                  {style.desc}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-hint)' }}>{countLabel}</span>
                  <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 500 }}>View designers →</span>
                </div>
              </div>
            </div>
          </Link>
          );
        })}
      </div>
    </div>
  );
}
