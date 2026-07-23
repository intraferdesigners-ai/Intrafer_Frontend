'use client';

import { motion, useReducedMotion } from 'framer-motion';

// Pure hover-lift wrapper, no entrance animation — for dashboard elements
// (stat cards, list rows, Kanban cards) that should render immediately
// (task-oriented UI, not a scroll story) but still get a quick lift on
// hover. Always renders motion.div; reduced motion zeroes the offset/duration
// rather than skipping the wrapper (same reasoning as Reveal.jsx).
export default function HoverLift({ children, className, style, y = -3, duration = 0.15, ...rest }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      style={style}
      whileHover={{
        y: shouldReduceMotion ? 0 : y,
        transition: { duration: shouldReduceMotion ? 0 : duration, ease: 'easeOut' },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
