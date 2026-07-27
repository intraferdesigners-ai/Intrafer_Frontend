'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

const SLOTS = ['style-card-a', 'style-card-b', 'style-card-c', 'style-card-d'];

// Photo layer parallaxes on scroll (same "photo drifts slower than the page,
// overlaid text/UI doesn't" split used in HeroImageCollage and
// BeforeAfterShowcase); the ghost "STYLE" headline sits behind the grid and
// stays static — it reads as printed background type, not a moving layer.
export default function StyleGallery({ styles }) {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const photoY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [-16, 16]);

  return (
    <div ref={sectionRef} style={{ position: 'relative', overflow: 'hidden', paddingTop: '8px' }}>
      {/* Ghost editorial headline — decorative, behind the photo grid */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '-18px', left: '-4px', zIndex: 0,
        fontFamily: 'var(--font-display)', fontWeight: 400,
        fontSize: 'clamp(70px, 11vw, 100px)', lineHeight: 1,
        color: 'rgba(181,84,30,.08)', letterSpacing: '-.02em',
        pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap',
      }}>
        STYLE
      </div>

      <div className="style-gallery-grid">
        {styles.map((s, i) => (
          <Link
            key={s.slug}
            href={`/design-styles/${s.slug}`}
            className={SLOTS[i]}
            style={{
              position: 'relative', display: 'block', textDecoration: 'none',
              borderRadius: 'var(--r-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
            }}
          >
            <motion.div
              whileHover={{ scale: shouldReduceMotion ? 1 : 1.03 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: 'easeOut' }}
              style={{ position: 'absolute', top: '-18px', left: 0, right: 0, bottom: '-18px', y: photoY }}
            >
              <Image
                src={s.image}
                alt={s.label}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw"
              />
            </motion.div>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 55%)' }} />
            <div style={{ position: 'absolute', bottom: '18px', left: '18px', right: '18px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px,2.2vw,26px)', fontWeight: 400, color: '#fff', letterSpacing: '-.01em' }}>
                {s.label}
              </div>
              {/* Live vendor count from /public/style-counts — omitted rather
                  than shown as "0 designers" when a style has no listed
                  vendors yet, per this project's no-fabricated-numbers rule. */}
              {s.count > 0 && (
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.8)', marginTop: '2px' }}>
                  {s.count} designer{s.count !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
