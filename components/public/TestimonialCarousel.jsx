'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { getInitials } from '@/lib/utils';

const AUTO_ADVANCE_MS = 6000;
const SWIPE_DISTANCE = 80;
const SWIPE_VELOCITY = 500;

export default function TestimonialCarousel({ reviews }) {
  const [[index, direction], setSlide] = useState([0, 0]);
  const [paused, setPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const count = reviews.length;
  const hasMultiple = count > 1;

  const paginate = useCallback((dir) => {
    setSlide(([prev]) => [(prev + dir + count) % count, dir]);
  }, [count]);

  const goTo = useCallback((i) => {
    setSlide(([prev]) => [i, i > prev ? 1 : -1]);
  }, []);

  // Auto-advance — off entirely for a single review, for reduced-motion
  // users, and while the carousel has hover/focus.
  useEffect(() => {
    if (!hasMultiple || shouldReduceMotion || paused) return;
    const id = setInterval(() => paginate(1), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [hasMultiple, shouldReduceMotion, paused, paginate]);

  const handleKeyDown = (e) => {
    if (!hasMultiple) return;
    if (e.key === 'ArrowLeft')  { e.preventDefault(); paginate(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); paginate(1); }
  };

  if (count === 0) return null;
  const r = reviews[index];

  const variants = {
    enter: (dir) => ({ x: shouldReduceMotion ? 0 : dir >= 0 ? 48 : -48, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: shouldReduceMotion ? 0 : dir >= 0 ? -48 : 48, opacity: 0 }),
  };

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        // Only resume autoplay once focus leaves the carousel entirely —
        // moving focus between the region and its own arrow/dot buttons
        // (e.g. clicking "Next") shouldn't silently un-pause it.
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
      onKeyDown={handleKeyDown}
      tabIndex={hasMultiple ? 0 : -1}
      role="region"
      aria-roledescription="carousel"
      aria-label="Homeowner testimonials"
      style={{ maxWidth: '760px', margin: '0 auto', outline: 'none' }}
    >
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={r.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: 'easeInOut' }}
          drag={hasMultiple ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragEnd={(e, info) => {
            const swiped = Math.abs(info.offset.x) > SWIPE_DISTANCE || Math.abs(info.velocity.x) > SWIPE_VELOCITY;
            if (!swiped) return;
            paginate(info.offset.x < 0 ? 1 : -1);
          }}
          style={{
            position: 'relative', overflow: 'hidden', cursor: hasMultiple ? 'grab' : 'default',
            background: 'linear-gradient(155deg, var(--surface) 0%, var(--bg-parchment) 100%)',
            border: '1px solid var(--border-sub)',
            borderRadius: 'var(--r-2xl)',
            padding: 'clamp(32px, 5vw, 56px)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div aria-hidden="true" style={{
            position: 'absolute', top: '-50px', right: '-50px',
            width: '160px', height: '160px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(29,78,216,.10) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <Quote
            size={44}
            aria-hidden="true"
            style={{ color: '#B5541E', opacity: 0.16, marginBottom: '4px' }}
            fill="currentColor"
          />

          <div style={{ display: 'flex', gap: '3px', marginBottom: '18px', position: 'relative' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                color="var(--primary)"
                fill={i < r.rating ? 'var(--primary)' : 'none'}
                strokeWidth={1.5}
              />
            ))}
          </div>

          <p style={{
            position: 'relative',
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: 'clamp(20px, 2.6vw, 27px)', fontWeight: 400,
            color: 'var(--text)', lineHeight: 1.5, letterSpacing: '-.01em',
            marginBottom: '28px',
          }}>
            &ldquo;{r.comment}&rdquo;
          </p>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', position: 'relative' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
              background: 'var(--primary-bg)', color: 'var(--primary)',
              fontSize: '14px', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {getInitials(r.userName)}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>{r.userName}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-hint)', marginTop: '2px' }}>
                {[r.vendorName, r.vendorCity, r.projectType].filter(Boolean).join(' · ')}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {hasMultiple && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginTop: '28px' }}>
          <button
            onClick={() => paginate(-1)}
            aria-label="Previous testimonial"
            className="testimonial-nav-btn"
            style={{
              width: '40px', height: '40px', borderRadius: '50%',
              border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text-sub)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
            }}
          >
            <ChevronLeft size={18} />
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {reviews.map((rv, i) => (
              <motion.button
                key={rv.id}
                onClick={() => goTo(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                aria-current={i === index}
                animate={{ width: i === index ? 22 : 8 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: 'easeOut' }}
                style={{
                  height: '8px', borderRadius: '4px', border: 'none', padding: 0, cursor: 'pointer',
                  background: i === index ? 'var(--primary)' : 'var(--border-emp)',
                  transition: 'background 200ms',
                }}
              />
            ))}
          </div>

          <button
            onClick={() => paginate(1)}
            aria-label="Next testimonial"
            className="testimonial-nav-btn"
            style={{
              width: '40px', height: '40px', borderRadius: '50%',
              border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text-sub)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
