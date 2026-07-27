'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Crossfade-on-interval, same key-remount pattern as BeforeAfterShowcase's
// thumbnail crossfade. The interval itself always runs — even under reduced
// motion the word still rotates, just with the transition collapsed to 0s
// (per Reveal.jsx's established convention: always render the motion
// element, never skip the animation branch entirely).
export default function RotatingWord({ words, interval = 2200, style }) {
  const [index, setIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words, interval]);

  return (
    <motion.span
      key={index}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: 'easeOut' }}
      style={{ display: 'inline-block', ...style }}
    >
      {words[index]}
    </motion.span>
  );
}
