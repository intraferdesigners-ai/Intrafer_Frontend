'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// Core Web Vitals: scroll-reveal without hiding the first screen, and
// without framer-motion (plain IntersectionObserver + the .m-reveal CSS in
// app/globals.css — same 24px slide, .45s ease-out, 120px lead).
//
// The server HTML and the first client render are always visible. Right
// after mount (before the browser paints that commit) a block that starts
// below the fold is switched to data-reveal="hidden", and to "shown" (CSS
// transition) when it scrolls within 120px of the viewport; "done" once the
// transition ends, so later hover effects aren't slowed by a reveal delay.
// Above-the-fold blocks never get the attribute and stay visible.
//
// Returns { phase, revealProps }: spread revealProps (ref, data-reveal,
// onTransitionEnd) on the element, which also needs the m-reveal class.
const MARGIN_PX = 120;
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export default function useRevealState() {
  const ref = useRef(null);
  const [phase, setPhase] = useState(undefined); // undefined | 'hidden' | 'shown' | 'done'

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || el.getBoundingClientRect().top <= window.innerHeight + MARGIN_PX) return undefined;
    setPhase('hidden');
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setPhase('shown');
        io.disconnect();
      }
    }, { rootMargin: `0px 0px ${MARGIN_PX}px 0px` });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onTransitionEnd = (e) => {
    if (e.target === ref.current) setPhase((p) => (p === 'shown' ? 'done' : p));
  };

  return { phase, revealProps: { ref, 'data-reveal': phase, onTransitionEnd } };
}

// True only for the first render of a component instance on the page
// (server render and hydration): slideshow/crossfade wrappers use it to
// show their first frame without a fade, and fade every later one.
export function useIsFirstRender() {
  const first = useRef(true);
  useEffect(() => { first.current = false; }, []);
  return first.current;
}
