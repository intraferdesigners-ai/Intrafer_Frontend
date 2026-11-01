'use client';

import useRevealState from './useRevealState';

// Scroll-reveal for one item in a grid/list — same fade + slide-up as
// Reveal.jsx, staggered by index (0.08 s each); `hoverLift` adds the 4px
// hover lift (.m-lift). CSS only (app/globals.css), no animation library.
export default function RevealItem({ children, index = 0, className, style, hoverLift = false }) {
  const { phase, revealProps } = useRevealState();
  const classes = ['m-reveal', hoverLift && 'm-lift', className].filter(Boolean).join(' ');
  return (
    <div
      className={classes}
      style={phase === 'shown' && index > 0 ? { ...style, transitionDelay: `${index * 0.08}s` } : style}
      {...revealProps}
    >
      {children}
    </div>
  );
}
