import AuthHeroPanel from './AuthHeroPanel';

// Full-bleed split screen — both columns fill the entire viewport, edge to
// edge, no card chrome. Right column centers its content vertically and
// caps it to a readable width rather than stretching inputs full-bleed too.
export default function AuthSplitCard({ children }) {
  return (
    <div className="auth-split-card" style={{
      width: '100%', minHeight: '100dvh', background: 'var(--surface)',
    }}>
      <AuthHeroPanel />
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100dvh', padding: 'clamp(24px, 5vw, 48px)',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
