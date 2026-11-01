'use client';

import { motion, useReducedMotion } from 'framer-motion';
import useRevealState from './useRevealState';

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

  // Server-rendered visible; hidden after mount only when below the fold
  // (./useRevealState.js).
  const { ref, visible } = useRevealState();

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={false}
      animate={visible ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0, y: 24, transition: { duration: 0 } },
        visible: { opacity: 1, y: 0, transition: { duration: shouldReduceMotion ? 0 : 0.45, ease: 'easeOut', delay: shouldReduceMotion ? 0 : index * 0.08 } },
      }}
      {...hoverProps}
    >
      {children}
    </motion.div>
  );
}
