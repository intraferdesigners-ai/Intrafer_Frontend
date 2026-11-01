// Lifts its content by `y` px (default -3) on hover over `duration` seconds
// (default 0.15), ease-out — CSS (.m-lift in app/globals.css); reduced
// motion: no lift.
export default function HoverLift({ children, className, style, y = -3, duration = 0.15, ...rest }) {
  return (
    <div
      className={className ? `m-lift ${className}` : 'm-lift'}
      style={{ '--m-lift': `${y}px`, '--m-lift-duration': `${duration}s`, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}
