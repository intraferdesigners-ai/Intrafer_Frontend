'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { IMAGES } from '../../lib/images';

// Larger than the sitewide var(--r-xl)/var(--r-lg) tokens (20px/16px), which
// are reused in 100+ places — a local literal value here avoids bumping
// those shared tokens just for this one collage.
const CARD_RADIUS = '22px';

// Each card is a fixed-size frame (overflow hidden) containing an oversized
// inner photo layer that scroll-parallaxes independently of anything else
// pinned to the frame (e.g. the studio-name badge) — the badge is a sibling
// of the photo layer, not a child, so the scroll transform never touches it.
function ParallaxCard({ height, boxShadow, photoY, hoverScale, image, alt, priority, badge }) {
  return (
    <div style={{ height, borderRadius: CARD_RADIUS, position: 'relative', overflow: 'hidden', boxShadow }}>
      <motion.div
        whileHover={{ scale: hoverScale }}
        transition={{ duration: hoverScale === 1 ? 0 : 0.25, ease: 'easeOut' }}
        style={{ position: 'absolute', top: '-18px', left: 0, right: 0, bottom: '-18px', y: photoY }}
      >
        <Image src={image} alt={alt} fill style={{ objectFit: 'cover' }} priority={priority} sizes="(max-width: 768px) 100vw, 50vw" />
      </motion.div>
      {badge}
    </div>
  );
}

export default function HeroImageCollage() {
  const shouldReduceMotion = useReducedMotion();
  const hoverScale = shouldReduceMotion ? 1 : 1.02;

  // Scoped to this collage only (not the global page scroll) — the photo
  // layer in each card drifts a few px slower than the page as it scrolls
  // past, while the studio badge sitting on top stays put. Reduced motion
  // locks the transform range to [0, 0] rather than skipping the hook.
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const photoY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [-16, 16]);

  return (
    <div ref={sectionRef} className="hide-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <ParallaxCard
        height="300px"
        boxShadow="var(--shadow-md)"
        photoY={photoY}
        hoverScale={hoverScale}
        image={IMAGES.hero.main}
        alt="Modern interior design"
        priority
        badge={
          <div className="vendor-img-badge" style={{ position: 'absolute', bottom: '12px', left: '12px', borderRadius: 'var(--r-sm)', padding: '7px 12px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12px', fontWeight: 500 }}>Priya Design Studio</div>
            <div style={{ fontSize: '11px', opacity: 0.65, marginTop: '1px' }}>Bangalore · ★ 4.9</div>
          </div>
        }
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <ParallaxCard
          height="290px"
          boxShadow="var(--shadow-sm)"
          photoY={photoY}
          hoverScale={hoverScale}
          image={IMAGES.vendors.studio1.cover}
          alt="Studio interior"
        />
        <ParallaxCard
          height="290px"
          boxShadow="var(--shadow-sm)"
          photoY={photoY}
          hoverScale={hoverScale}
          image={IMAGES.vendors.studio2.cover}
          alt="Studio interior"
        />
      </div>
    </div>
  );
}
