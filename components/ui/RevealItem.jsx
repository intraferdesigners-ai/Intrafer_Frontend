'use client';

import { motion, useReducedMotion } from 'framer-motion';

// Generic scroll-reveal wrapper for a single item inside a grid/list — same
// fade+slide-up + stagger-by-index pattern as HowItWorksCard.jsx, extracted
// so any grid (vendor cards, compare cards, gallery tiles) can reuse it
// without re-deriving the reduced-motion handling each time. Always renders
// motion.div (see Reveal.jsx for why branching under reduced-motion caused a
// hydration mismatch that left content stuck invisible).
export default function RevealItem({ children, index = 0, className, style, hoverLift = false }) {
  const shouldReduceMotion = useReducedMotion();

  const hoverProps = hoverLift
    ? { whileHover: { y: shouldReduceMotion ? 0 : -4, transition: { duration: shouldReduceMotion ? 0 : 0.18, ease: 'easeOut' } } }
    : {};

  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{
        opacity: 1, y: 0,
        transition: { duration: shouldReduceMotion ? 0 : 0.45, ease: 'easeOut', delay: shouldReduceMotion ? 0 : index * 0.08 },
      }}
      viewport={{ once: true, amount: 0.2 }}
      {...hoverProps}
    >
      {children}
    </motion.div>
  );
}
