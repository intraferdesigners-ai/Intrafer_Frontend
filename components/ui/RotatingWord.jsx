'use client';

import { useEffect, useState } from 'react';
import { useIsFirstRender } from './useRevealState';

// Crossfade-on-interval, key-remount pattern: each new word fades and
// slides up 8px over 0.35 s (CSS .m-fade-up). The interval always runs —
// under reduced motion the word still rotates, just without the animation.
// The first word is server-rendered visible.
export default function RotatingWord({ words, interval = 2200, style }) {
  const [index, setIndex] = useState(0);
  const firstRender = useIsFirstRender();

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words, interval]);

  return (
    <span
      key={index}
      className={firstRender ? undefined : 'm-fade-up'}
      style={{ display: 'inline-block', ...style }}
    >
      {words[index]}
    </span>
  );
}
