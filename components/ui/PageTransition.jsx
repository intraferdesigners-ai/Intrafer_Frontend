'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';

// Subtle fade-in on route change. Keyed by pathname so React remounts the
// motion.div on navigation, replaying initial->animate — no AnimatePresence
// needed since there's no exit animation to coordinate (opacity-only enter,
// no slide), which also avoids AnimatePresence's `mode="wait"` blocking the
// next page's mount behind the previous page's exit. Always renders
// motion.div; reduced motion collapses duration to 0 (see Reveal.jsx).
export default function PageTransition({ children, duration = 0.25 }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : duration, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
