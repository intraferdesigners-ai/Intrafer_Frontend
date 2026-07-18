'use client'
import { useEffect, useRef, useState } from 'react';

export default function RevealOnScroll({
  children,
  delay = 0,
  direction = 'up', // 'up' | 'left' | 'right' | 'fade'
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  const transforms = {
    up:    'translateY(24px)',
    left:  'translateX(-24px)',
    right: 'translateX(24px)',
    fade:  'translateY(0)',
  };

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate(0,0)' : transforms[direction],
        transition: `opacity 600ms cubic-bezier(0.4,0,0.2,1) ${delay}ms,
                     transform 600ms cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
