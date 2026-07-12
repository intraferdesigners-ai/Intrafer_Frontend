'use client';
import { useEffect, useRef, useState } from 'react';

export default function AnimatedCounter({
  end, duration = 2000, suffix = '', prefix = '',
  decimals = 0, style, className,
}) {
  const [count, setCount] = useState(0);
  const ref     = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const tick = (now) => {
            const elapsed  = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased    = 1 - Math.pow(1 - progress, 3);
            const current  = end * eased;
            setCount(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.floor(current));
            if (progress < 1) requestAnimationFrame(tick);
            else setCount(end);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, decimals]);

  return (
    <span ref={ref} style={style} className={className}>
      {prefix}{decimals > 0 ? count.toFixed(decimals) : count.toLocaleString('en-IN')}{suffix}
    </span>
  );
}
