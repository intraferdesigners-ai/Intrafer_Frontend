'use client';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

// Counts up from 0 the first time it scrolls into view, then re-tweens from
// the previous value to the new one whenever `end` changes afterward (slider
// drags, tenure switches, stats arriving async) instead of snapping. `live`
// holds the latest props/derived values in a ref so the IntersectionObserver
// callback (created once on mount) and the tween loop always read current
// data rather than a stale closure from whenever they were set up.
export default function AnimatedCounter({
  end, duration = 2000, suffix = '', prefix = '',
  decimals = 0, format, style, className,
}) {
  const [count, setCount] = useState(0);
  const ref      = useRef(null);
  const started  = useRef(false);
  const prevEnd  = useRef(end);
  const rafId    = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const live = useRef({});
  live.current = { end, duration, decimals, shouldReduceMotion };

  const tweenTo = (from, to) => {
    cancelAnimationFrame(rafId.current);
    const { duration: d, decimals: dec, shouldReduceMotion: reduced } = live.current;
    if (reduced) { setCount(to); return; }
    const startTime = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - startTime) / d, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = from + (to - from) * eased;
      setCount(dec > 0 ? parseFloat(current.toFixed(dec)) : Math.round(current));
      if (progress < 1) rafId.current = requestAnimationFrame(tick);
      else setCount(to);
    };
    rafId.current = requestAnimationFrame(tick);
  };

  // First appearance — count up from 0 once, the first time it's visible.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          prevEnd.current = live.current.end;
          tweenTo(0, live.current.end);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Later changes — tween from the old value instead of snapping.
  useEffect(() => {
    if (!started.current || prevEnd.current === end) return;
    tweenTo(prevEnd.current, end);
    prevEnd.current = end;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end]);

  useEffect(() => () => cancelAnimationFrame(rafId.current), []);

  const display = format
    ? format(count)
    : `${prefix}${decimals > 0 ? count.toFixed(decimals) : count.toLocaleString('en-IN')}${suffix}`;

  return (
    <span ref={ref} style={style} className={className}>
      {display}
    </span>
  );
}
