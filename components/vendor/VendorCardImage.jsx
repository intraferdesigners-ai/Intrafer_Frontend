'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

const SLIDE_INTERVAL_MS = 3500;

// VendorCard's own image slider — same auto-sliding crossfade UX as
// ProjectImageSlider.jsx, but through next/image (explicit dimensions via
// `fill` + a sized/positioned parent, lazy-by-default, optional `priority`
// for above-the-fold cards) instead of a raw <img> with none of that, per
// SEO spec section 16's Core Web Vitals requirements (Step 11).
//
// Kept as its own component: ProjectImageSlider (used by recent-projects,
// the vendor dashboard's projects page, ProjectsSection — the vendor
// profile's Portfolio and the project page's Related Projects — and
// GalleryGrid) now uses the same next/image pattern too, plus an
// `unoptimized` fallback for hosts missing from lib/imageRemotePatterns.js.
export default function VendorCardImage({ images, alt, sizes, priority = false }) {
  const shouldReduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const hasMultiple = (images?.length || 0) > 1;

  useEffect(() => {
    if (!hasMultiple || shouldReduceMotion) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [hasMultiple, shouldReduceMotion, images?.length]);

  if (!images?.length) return null;

  return (
    <motion.div
      key={hasMultiple ? index : 0}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: 'easeOut' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Image
        src={images[hasMultiple ? index : 0]}
        alt={alt || 'Project'}
        fill
        style={{ objectFit: 'cover' }}
        sizes={sizes || '(max-width: 768px) 100vw, 33vw'}
        // next/image errors if both `priority` and `loading` are passed
        // together — priority implies eager loading on its own.
        {...(priority ? { priority: true } : { loading: 'lazy' })}
      />
    </motion.div>
  );
}
