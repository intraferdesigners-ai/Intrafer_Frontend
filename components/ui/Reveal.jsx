'use client';

import { motion, useReducedMotion } from 'framer-motion';

// Generic scroll-reveal wrapper — fades/slides content up once as it enters
// the viewport. Always renders the same `motion.div` on server and client
// (branching to a plain <div> under reduced-motion caused a hydration
// mismatch — server never knows the OS preference, so it always rendered
// the motion branch, and React's mismatch recovery left reduced-motion
// users' content permanently stuck at its pre-animation opacity:0 instead
// of visible). Instead, reduced motion collapses the transition to 0s, so
// whileInView still fires and lands the element at its visible state —
// just instantly instead of animated.
export default function Reveal({ children, delay = 0, className, style, id }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      id={id}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      // amount:0 + a bottom margin (not the old amount:0.2) — sections here can be
      // taller than a mobile viewport, so requiring 20% visible before firing meant
      // most of a tall section was already scrolled into view, still at opacity 0,
      // during a normal-speed scroll. That read as a blank gap, not a fade-in.
      viewport={{ once: true, amount: 0, margin: '0px 0px 120px 0px' }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.45, ease: 'easeOut', delay: shouldReduceMotion ? 0 : delay }}
    >
      {children}
    </motion.div>
  );
}
