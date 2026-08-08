import Skeleton from '../../../../components/ui/Skeleton';

// Shown instantly on navigation while the real page's Promise.all (vendor +
// projects + similar + reviews) resolves — the actual data fetch is fast
// (~150ms measured), but with no loading boundary at all a click into a
// vendor card previously left the old page frozen on screen for that whole
// window with zero feedback, reading as an unresponsive click. Mirrors
// page.jsx's own container/grid classes so nothing jumps when real content
// swaps in.
export default function VendorProfileLoading() {
  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
      <Skeleton width="90px" height="13px" style={{ marginBottom: 24 }} />

      <div className="vendor-profile-layout">
        <div>
          <Skeleton height="200px" radius="var(--r-xl)" />

          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Skeleton width="260px" height="28px" />
            <Skeleton width="160px" height="14px" />

            <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Skeleton width="32px" height="20px" />
                  <Skeleton width="48px" height="11px" />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Skeleton width="90px" height="26px" radius="var(--r-md)" />
              <Skeleton width="90px" height="26px" radius="var(--r-md)" />
              <Skeleton width="90px" height="26px" radius="var(--r-md)" />
            </div>
          </div>

          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton width="60px" height="11px" />
            <Skeleton height="14px" />
            <Skeleton height="14px" />
            <Skeleton width="70%" height="14px" />
          </div>
        </div>

        <div className="vendor-profile-sticky" style={{ position: 'sticky', top: 88 }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)', padding: 24,
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <Skeleton width="120px" height="16px" />
            <Skeleton height="12px" />
            <Skeleton width="80%" height="12px" />
            <Skeleton height="48px" radius="var(--r-md)" style={{ marginTop: 8 }} />
            <Skeleton height="48px" radius="var(--r-md)" />
          </div>
        </div>
      </div>
    </main>
  );
}
