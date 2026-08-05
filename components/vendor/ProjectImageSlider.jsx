'use client';
import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const SLIDE_INTERVAL_MS = 3500;

// Auto-sliding background for a project's uploaded photos, meant for the
// larger portfolio-card contexts (public gallery, vendor profile, vendor's
// own portfolio manager, recent-projects) — not the small admin table-row
// thumbnails, where a slideshow would just be visual noise.
//
// Renders into whatever `position: relative` + sized parent the caller
// already has (matching how these cards render their single static image
// today) — this just absolutely-fills it. Crossfade keyed by index, same
// pattern as BeforeAfterShowcase.jsx: no AnimatePresence, since the
// outgoing photo can just be swapped out instantly underneath the
// incoming one's fade-in rather than coordinating an exit animation.
export default function ProjectImageSlider({ images, alt, style }) {
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
    <motion.img
      key={hasMultiple ? index : 0}
      src={images[hasMultiple ? index : 0]}
      alt={alt || 'Project'}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: 'easeOut' }}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%', objectFit: 'cover', display: 'block',
        ...style,
      }}
    />
  );
}
