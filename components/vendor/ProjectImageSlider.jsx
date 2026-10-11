'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { canOptimize } from '@/lib/imageHost';

const SLIDE_INTERVAL_MS = 3500;

// Auto-sliding background for a project's uploaded photos, meant for the
// larger portfolio-card contexts (public gallery, vendor profile, vendor's
// own portfolio manager, recent-projects) — not the small admin table-row
// thumbnails, where a slideshow would just be visual noise.
//
// Renders into whatever `position: relative` + sized parent the caller
// already has — this just absolutely-fills it. Crossfade keyed by index,
// same pattern as BeforeAfterShowcase.jsx / VendorCardImage.jsx: no
// AnimatePresence, since the outgoing photo can just be swapped out
// instantly underneath the incoming one's fade-in.
//
// Through next/image (fill, lazy unless `priority`, responsive srcset per
// `sizes`). A URL next/image can't optimize — a host missing from
// lib/imageRemotePatterns.js, a relative path, a data: URL — is rendered
// `unoptimized`, i.e. exactly like the plain <img> this used to be, instead
// of erroring. `style` is merged into the Image's style after objectFit.
export default function ProjectImageSlider({
  images, alt, style, sizes = '(max-width: 768px) 100vw, 33vw', priority = false,
}) {
  const shouldReduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const list = (images || []).filter((src) => typeof src === 'string' && src.trim());
  const hasMultiple = list.length > 1;

  useEffect(() => {
    if (!hasMultiple || shouldReduceMotion) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % list.length), SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [hasMultiple, shouldReduceMotion, list.length]);

  if (!list.length) return null;

  const src = list[hasMultiple ? index % list.length : 0];
  return (
    <motion.div
      key={hasMultiple ? index : 0}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: 'easeOut' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Image
        src={src}
        alt={alt || 'Project'}
        fill
        sizes={sizes}
        unoptimized={!canOptimize(src)}
        style={{ objectFit: 'cover', ...style }}
        // next/image errors if both `priority` and `loading` are passed
        // together — priority implies eager loading on its own.
        {...(priority ? { priority: true } : { loading: 'lazy' })}
      />
    </motion.div>
  );
}
