'use client';

import Image from 'next/image';
import useRevealState from './useRevealState';

// Shared (not per-card inline) so all 4 numeral chips stay pixel-identical.
const STEP_CHIP_STYLE = {
  position: 'absolute', bottom: '-18px', left: '16px', zIndex: 2,
  width: '38px', height: '38px', borderRadius: '10px',
  background: 'var(--primary)', color: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 500,
  boxShadow: '0 4px 10px rgba(29,78,216,.35)',
};

const CARD_STYLE = {
  display: 'flex', flexDirection: 'column', height: '100%',
  borderRadius: 'var(--r-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
};

// CSS reveal + hover lift (.m-reveal / .m-lift); reduced motion: neither.
export default function HowItWorksCard({ step, index }) {
  // Reveal (server-rendered visible; below-the-fold cards fade in on
  // scroll) + 4px hover lift, CSS only (app/globals.css).
  const { phase, revealProps } = useRevealState();

  return (
    <div
      className="m-reveal m-lift"
      style={phase === 'shown' && index > 0 ? { ...CARD_STYLE, transitionDelay: `${index * 0.08}s` } : CARD_STYLE}
      {...revealProps}
    >
      {/* Photo strip — outer wrapper lets the numeral chip overlap below it */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{ position: 'relative', height: '120px', overflow: 'hidden' }}>
          <Image src={step.image} alt={step.title} fill style={{ objectFit: 'cover' }} sizes="(max-width: 840px) 50vw, 25vw" />
        </div>
        <div style={STEP_CHIP_STYLE}>{step.n}</div>
      </div>

      {/* Navy card body — flex:1 fills any leftover height so all 4 card bottoms stay flush */}
      <div style={{ background: '#0F172A', padding: '26px 20px 20px', flex: 1 }}>
        <p style={{ fontSize: '15px', fontWeight: 500, color: '#fff', margin: '0 0 8px' }}>{step.title}</p>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,.6)', lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
      </div>
    </div>
  );
}
