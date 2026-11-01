'use client';

import useRevealState from './useRevealState';

// Generic scroll-reveal wrapper — fades/slides content up once as it enters
// the viewport (CSS .m-reveal, see ./useRevealState.js). Server-rendered
// visible: only blocks that start below the fold are hidden after mount and
// faded in on scroll, so the first screen (and its LCP element) never waits
// for hydration. `delay` (seconds) staggers the fade. Reduced motion: shown
// at once (app/globals.css).
export default function Reveal({ children, delay = 0, className, style, id }) {
  const { phase, revealProps } = useRevealState();
  return (
    <div
      id={id}
      className={className ? `m-reveal ${className}` : 'm-reveal'}
      style={phase === 'shown' && delay ? { ...style, transitionDelay: `${delay}s` } : style}
      {...revealProps}
    >
      {children}
    </div>
  );
}
