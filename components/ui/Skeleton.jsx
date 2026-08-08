// Bare pulsing block for route-level loading.js skeletons — no props beyond
// sizing/radius since every current use is a static placeholder shape, not
// an interactive or data-driven element.
export default function Skeleton({ width = '100%', height = '16px', radius = 'var(--r-sm)', style }) {
  return (
    <>
      <div
        className="skeleton-pulse"
        style={{ width, height, borderRadius: radius, background: 'var(--border)', ...style }}
      />
      <style>{`
        @keyframes skeleton-pulse { 0%, 100% { opacity: .5; } 50% { opacity: 1; } }
        .skeleton-pulse { animation: skeleton-pulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .skeleton-pulse { animation: none; opacity: .7; }
        }
      `}</style>
    </>
  );
}
