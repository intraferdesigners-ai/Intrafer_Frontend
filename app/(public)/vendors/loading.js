import Skeleton from '../../../components/ui/Skeleton';

// Shown instantly on navigation into /vendors — covers both the first visit
// (e.g. from the homepage) and every filter/sort change, since those also
// go through router.push('/vendors?...') against this same fully dynamic,
// previously loading-boundary-less route. Grid matches
// VendorResultsGrid's own minmax(280px,1fr) columns so cards don't reflow
// when real results swap in.
export default function VendorsLoading() {
  return (
    <main style={{ padding: 'clamp(80px, 10vw, 108px) clamp(16px, 4vw, 40px) 60px', maxWidth: 1280, margin: '0 auto' }}>
      <Skeleton width="140px" height="12px" style={{ marginBottom: 8 }} />
      <Skeleton width="280px" height="32px" style={{ marginBottom: 6 }} />
      <Skeleton width="200px" height="14px" style={{ marginBottom: 24 }} />

      <Skeleton height="64px" radius="var(--r-xl)" style={{ marginBottom: 32 }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Skeleton height="210px" radius="var(--r-lg)" />
            <Skeleton width="70%" height="16px" />
            <Skeleton width="45%" height="12px" />
          </div>
        ))}
      </div>
    </main>
  );
}
