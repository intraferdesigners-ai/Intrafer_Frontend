'use client';

import { useEffect, useState } from 'react';

// prefers-reduced-motion, without framer-motion. false on the server and
// on the first client render (like framer's useReducedMotion), then the
// real value, kept in sync with the OS setting.
export default function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduce;
}
