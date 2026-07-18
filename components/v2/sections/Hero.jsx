'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import CitySelect from '@/components/ui/CitySelect';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';
import { IMAGES } from '@/lib/images';

const STYLE_OPTIONS = [
  { value: '', label: 'Any style' },
  { value: 'modern', label: 'Modern' },
  { value: 'scandinavian', label: 'Scandinavian' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'traditional', label: 'Traditional' },
  { value: 'bohemian', label: 'Bohemian' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'contemporary', label: 'Contemporary' },
];

const TRUST_AVATARS = [
  IMAGES.testimonials.r1,
  IMAGES.testimonials.r2,
  IMAGES.testimonials.r3,
  IMAGES.testimonials.r4,
];

const RIGHT_GRID = [
  { src: IMAGES.vendors.studio1.cover, badge: 'RESIDENTIAL', city: 'Bangalore' },
  { src: IMAGES.vendors.studio2.cover, badge: 'LUXURY',      city: 'Mumbai' },
  { src: IMAGES.vendors.studio3.cover, badge: 'MODULAR',     city: 'Delhi NCR' },
  { src: IMAGES.vendors.studio4.cover, badge: 'OFFICE',      city: 'Pune' },
];

export default function Hero() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [style, setStyle] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (style) params.set('style', style);
    const qs = params.toString();
    router.push(qs ? `/vendors?${qs}` : '/vendors');
  };

  return (
    <section style={{
      position: 'relative',
      background: '#0F172A',
      overflow: 'hidden',
      padding: 'clamp(64px,10vw,120px) clamp(16px,4vw,36px) clamp(48px,6vw,72px)',
    }}>
      {/* Background decoration — watermark */}
      <div aria-hidden style={{
        position: 'absolute', top: '-40px', right: '-20px',
        fontFamily: 'var(--v2-font-display)',
        fontSize: 'clamp(160px,22vw,320px)',
        fontWeight: 700,
        color: '#F8F7F4',
        opacity: 0.03,
        lineHeight: 1,
        letterSpacing: '-0.02em',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 0,
        whiteSpace: 'nowrap',
      }}>
        DESIGN
      </div>

      {/* Background decoration — blue glow */}
      <div aria-hidden style={{
        position: 'absolute', top: '-120px', right: '-120px',
        width: '480px', height: '480px', borderRadius: '50%',
        background: 'radial-gradient(closest-side, rgba(59,130,246,0.22), transparent)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: '1240px', margin: '0 auto',
        display: 'flex', flexWrap: 'wrap', gap: '48px',
        alignItems: 'center',
      }}>
        {/* Left — 60% */}
        <div style={{ flex: '1 1 560px', maxWidth: '640px' }}>
          <RevealOnScroll direction="up">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 14px', borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.1)',
              marginBottom: '24px',
            }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: '#3B82F6', display: 'inline-block',
              }} />
              <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>
                500+ verified designers across India
              </span>
            </div>

            <h1 style={{
              fontFamily: 'var(--v2-font-display)',
              fontSize: 'clamp(34px, 5.2vw, 56px)',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              lineHeight: 1.12,
              margin: '0 0 20px',
            }}>
              <span style={{ color: '#F8F7F4' }}>Find designers who bring </span>
              <span style={{ color: '#3B82F6', fontStyle: 'italic' }}>your vision</span>
              <span style={{ color: '#334155' }}> to life.</span>
            </h1>

            <p style={{
              fontSize: '16px', color: '#64748B', lineHeight: 1.7,
              fontWeight: 300, maxWidth: '480px', marginBottom: '32px',
            }}>
              India's most trusted interior design marketplace. Browse verified portfolios, compare quotes, and get free quotes — without the cold calls.
            </p>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={100}>
            {/* Search widget */}
            <div style={{
              display: 'flex', gap: '10px', flexWrap: 'wrap',
              alignItems: 'stretch', marginBottom: '28px',
            }}>
              <div style={{ width: '220px', maxWidth: '100%' }}>
                <CitySelect value={city} onChange={setCity} placeholder="Search city..." />
              </div>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                style={{
                  height: '48px', padding: '0 14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  color: '#F8F7F4', fontSize: '14px',
                  fontFamily: 'var(--v2-font-ui)',
                  minWidth: '160px',
                  outline: 'none',
                }}
              >
                {STYLE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value} style={{ color: '#0F172A' }}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleSearch}
                style={{
                  height: '48px', padding: '0 24px',
                  background: '#3B82F6', color: '#FFFFFF',
                  border: 'none', borderRadius: '10px',
                  fontSize: '14px', fontWeight: 600,
                  fontFamily: 'var(--v2-font-ui)',
                  cursor: 'pointer',
                  transition: 'background 150ms',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
                onMouseLeave={e => e.currentTarget.style.background = '#3B82F6'}
              >
                Search designers →
              </button>
            </div>

            {/* Trust row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex' }}>
                {TRUST_AVATARS.map((src, i) => (
                  <div key={src} style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    overflow: 'hidden', border: '2px solid #0F172A',
                    marginLeft: i === 0 ? 0 : '-10px', position: 'relative',
                  }}>
                    <Image src={src} alt="" fill style={{ objectFit: 'cover' }} sizes="32px" />
                  </div>
                ))}
              </div>
              <span style={{ fontSize: '13px', color: '#64748B' }}>
                Trusted by 2,400+ homeowners this year
              </span>
            </div>
          </RevealOnScroll>
        </div>

        {/* Right — 40%, 2x2 grid */}
        <div style={{ flex: '1 1 380px', maxWidth: '480px' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px',
          }}>
            {RIGHT_GRID.map((item, i) => (
              <RevealOnScroll key={item.badge} direction="right" delay={i * 100}>
                <div style={{
                  position: 'relative', aspectRatio: '1/1',
                  borderRadius: '14px', overflow: 'hidden',
                }}>
                  <Image src={item.src} alt={item.badge} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 50vw, 20vw" />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(transparent 40%, rgba(0,0,0,0.65))',
                  }} />
                  <span style={{
                    position: 'absolute', top: '10px', left: '10px',
                    fontSize: '9px', fontWeight: 700, letterSpacing: '.08em',
                    color: '#F8F7F4', background: 'rgba(15,23,42,0.55)',
                    padding: '4px 9px', borderRadius: '20px',
                  }}>{item.badge}</span>
                  <span style={{
                    position: 'absolute', bottom: '10px', left: '12px',
                    fontSize: '12px', fontWeight: 500, color: '#F8F7F4',
                  }}>{item.city}</span>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
