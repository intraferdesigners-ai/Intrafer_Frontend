'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { IMAGES } from '../../lib/images';

// Larger than the sitewide var(--r-xl)/var(--r-lg) tokens (20px/16px), which
// are reused in 100+ places — a local literal value here avoids bumping
// those shared tokens just for this one collage.
const CARD_RADIUS = '22px';

export default function HeroImageCollage() {
  const shouldReduceMotion = useReducedMotion();
  const hoverProps = {
    whileHover: { scale: shouldReduceMotion ? 1 : 1.02 },
    transition: { duration: shouldReduceMotion ? 0 : 0.25, ease: 'easeOut' },
  };

  return (
    <div className="hide-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <motion.div
        {...hoverProps}
        style={{ height: '300px', borderRadius: CARD_RADIUS, position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}
      >
        <Image src={IMAGES.hero.main} alt="Modern interior design" fill style={{ objectFit: 'cover' }} priority sizes="(max-width: 768px) 100vw, 50vw" />
        <div className="vendor-img-badge" style={{ position: 'absolute', bottom: '12px', left: '12px', borderRadius: 'var(--r-sm)', padding: '7px 12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '12px', fontWeight: 500 }}>Priya Design Studio</div>
          <div style={{ fontSize: '11px', opacity: 0.65, marginTop: '1px' }}>Bangalore · ★ 4.9</div>
        </div>
      </motion.div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <motion.div
          {...hoverProps}
          style={{ height: '290px', borderRadius: CARD_RADIUS, position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}
        >
          <Image src={IMAGES.vendors.studio1.cover} alt="Studio interior" fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 25vw" />
        </motion.div>
        <motion.div
          {...hoverProps}
          style={{ height: '290px', borderRadius: CARD_RADIUS, position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}
        >
          <Image src={IMAGES.vendors.studio2.cover} alt="Studio interior" fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 25vw" />
        </motion.div>
      </div>
    </div>
  );
}
