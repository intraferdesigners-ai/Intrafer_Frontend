'use client';

import { motion, useReducedMotion } from 'framer-motion';
import useRevealState from './useRevealState';

// Generic scroll-reveal wrapper — fades/slides content up once as it enters
// the viewport. Always renders the same `motion.div` on server and client
// (branching to a plain <div> under reduced-motion caused a hydration
// mismatch — server never knows the OS preference, so it always rendered
// the motion branch, and React's mismatch recovery left reduced-motion
// users' content permanently stuck at its pre-animation opacity:0 instead
// of visible). Instead, reduced motion collapses the transition to 0s, so
// whileInView still fires and lands the element at its visible state —
// just instantly instead of animated.
//
// Server-rendered visible (see ./useRevealState.js): only blocks that start
// below the fold are hidden after mount and faded in on scroll, so the
// first screen (and its LCP element) never waits for hydration.
export default function Reveal({ children, delay = 0, className, style, id }) {
  const shouldReduceMotion = useReducedMotion();
  const { ref, visible } = useRevealState();

  return (
    <motion.div
      ref={ref}
      id={id}
      className={className}
      style={style}
      initial={false}
      animate={visible ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0, y: 24, transition: { duration: 0 } },
        visible: { opacity: 1, y: 0, transition: { duration: shouldReduceMotion ? 0 : 0.45, ease: 'easeOut', delay: shouldReduceMotion ? 0 : delay } },
      }}
    >
      {children}
    </motion.div>
  );
}
