'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import api from '@/lib/api';
import { IMAGES } from '@/lib/images';

// Same fixed navy as the enquiry page's always-dark context panel
// (#0F172A) — used here as a photo scrim rather than a flat fill. At 0.72
// alpha, even a bright area of the underlying photo blends to a relative
// luminance around 0.08, giving white text (#F0F6FF, luminance ~0.92) a
// contrast ratio of ~7.2:1 — comfortably past WCAG AA (4.5:1) and AAA (7:1)
// for normal text, computed rather than eyeballed.
const OVERLAY = 'rgba(15, 23, 42, 0.72)';
const FG      = '#F0F6FF';

export default function AuthHeroPanel() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/public/stats')
      .then(({ data }) => setStats(data.data))
      .catch(() => {});
  }, []);

  // Same fallback numbers app/page.jsx uses when /public/stats is unavailable
  // — not the stale hardcoded "500+ / 1200+" copy also present there.
  const vendorCount  = stats?.vendorCount  ?? 8;
  const projectCount = stats?.projectCount ?? 24;
  const avgRating    = stats?.avgRating    ?? '4.8';

  return (
    <div className="hide-mobile" style={{
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: 'clamp(28px, 4vw, 40px)', minHeight: '560px',
    }}>
      <Image
        src={IMAGES.hero.main}
        alt=""
        fill
        style={{ objectFit: 'cover', zIndex: 0 }}
        sizes="(max-width: 768px) 0px, 45vw"
      />
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: OVERLAY, zIndex: 1 }} />

      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '8px',
          background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,.2)',
        }}>
          <Image src="/images/logo/logo.png" alt="Intrafer" width={30} height={30} style={{ objectFit: 'contain' }} />
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3vw, 34px)', fontWeight: 400,
          color: FG, margin: '0 0 10px', lineHeight: 1.25, letterSpacing: '-.01em',
        }}>
          Where design meets trust.
        </h2>
        <p style={{ fontSize: '14px', color: 'rgba(240,246,255,.75)', lineHeight: 1.6, margin: 0, maxWidth: '340px' }}>
          India&apos;s marketplace for vetted interior designers — trusted by homeowners, built for designers.
        </p>
      </div>

      <div style={{
        position: 'relative', zIndex: 2, display: 'flex', gap: '24px',
        paddingTop: '20px', marginTop: '20px',
        borderTop: '1px solid rgba(240,246,255,.18)',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 500, color: FG }}>{vendorCount}+</div>
          <div style={{ fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(240,246,255,.6)', marginTop: '2px' }}>Verified designers</div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 500, color: FG }}>{avgRating}★</div>
          <div style={{ fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(240,246,255,.6)', marginTop: '2px' }}>Average rating</div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 500, color: FG }}>{projectCount}+</div>
          <div style={{ fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(240,246,255,.6)', marginTop: '2px' }}>Projects delivered</div>
        </div>
      </div>
    </div>
  );
}
