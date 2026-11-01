'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

// Core Web Vitals: scroll-reveal without hiding the first screen.
//
// The old pattern (`initial={{ opacity: 0 }}` + whileInView) server-rendered
// every revealed block at opacity 0, so nothing in the first viewport —
// usually the LCP heading or image — could paint until React hydrated and
// the fade finished. Now the server HTML and the first client render are
// always visible. Right after mount (before the browser paints that
// commit) a block that starts below the fold is switched to its hidden
// state, and fades in when it scrolls into view, exactly as before.
// Above-the-fold blocks simply stay visible.
//
// Returns { ref, visible }: put `ref` on the motion element and animate to
// the visible/hidden variant from `visible`.
const MARGIN_PX = 120; // same lead as the old viewport margin
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export default function useRevealState() {
  const ref = useRef(null);
  const [armed, setArmed] = useState(false);
  const inView = useInView(ref, { once: true, amount: 0, margin: `0px 0px ${MARGIN_PX}px 0px` });

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (el && el.getBoundingClientRect().top > window.innerHeight + MARGIN_PX) setArmed(true);
  }, []);

  return { ref, visible: !armed || inView };
}

// True only for the first render of a component instance on the page
// (server render and hydration): slideshow/crossfade wrappers use it to
// show their first frame without a fade, and fade every later one.
export function useIsFirstRender() {
  const first = useRef(true);
  useEffect(() => { first.current = false; }, []);
  return first.current;
}
