'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import BeforeAfterSlider from '../ui/BeforeAfterSlider';

// Crossfade keyed by activeIndex, mirroring PageTransition.jsx's pattern —
// no AnimatePresence needed since there's no exit animation to coordinate,
// reduced motion collapses the fade duration to 0.
export default function BeforeAfterShowcase({ pairs }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const active = pairs[activeIndex];

  // Subtle scroll-linked parallax — the slider (photo layer) drifts a few
  // px slower than the page scroll while the caption overlay below (a
  // sibling, not a child, of this wrapper) stays untransformed, same
  // "photo moves, foreground UI doesn't" split used in HeroImageCollage
  // and StyleGallery. Scoped to this section only via useScroll's target,
  // not the global page scroll.
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const photoY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [-16, 16]);

  return (
    <div ref={sectionRef}>
      <div style={{ position: 'relative' }}>
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: 'easeOut' }}
          style={{ y: photoY }}
        >
          <BeforeAfterSlider
            before={active.before}
            after={active.after}
            height="clamp(280px, 40vw, 400px)"
          />
        </motion.div>

        {/* Caption overlay — bottom-left, over a dark scrim for legibility */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 4,
          padding: '48px 20px 16px',
          background: 'linear-gradient(to top, rgba(0,0,0,.6), transparent)',
          borderRadius: '0 0 16px 16px',
          pointerEvents: 'none',
        }}>
          <p style={{ color: '#fff', fontSize: '14px', fontWeight: 500, margin: 0, textShadow: '0 1px 3px rgba(0,0,0,.4)' }}>
            {active.caption}
          </p>
        </div>
      </div>

      {/* Thumbnail strip */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
        {pairs.map((p, i) => (
          <button
            key={p.caption}
            onClick={() => setActiveIndex(i)}
            aria-label={`Show ${p.caption}`}
            aria-pressed={i === activeIndex}
            style={{
              position: 'relative', width: '100px', height: '72px', flexShrink: 0,
              borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', padding: 0,
              border: i === activeIndex ? '2px solid var(--primary)' : '2px solid var(--border)',
              boxShadow: i === activeIndex ? '0 2px 10px rgba(59,130,246,.3)' : 'var(--shadow-sm)',
              opacity: i === activeIndex ? 1 : 0.75,
              transition: 'opacity 150ms ease, border-color 150ms ease, box-shadow 150ms ease',
            }}
          >
            <Image src={p.after} alt={p.caption} fill style={{ objectFit: 'cover' }} sizes="100px" />
          </button>
        ))}
      </div>
    </div>
  );
}
