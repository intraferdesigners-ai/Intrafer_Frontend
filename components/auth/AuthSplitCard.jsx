import AuthHeroPanel from './AuthHeroPanel';

// Split screen filling the viewport below the site's fixed 64px Navbar (see
// app/auth/layout.jsx) — both columns fill the remaining height, edge to
// edge, no card chrome. Right column centers its content vertically and
// caps it to a readable width rather than stretching inputs full-bleed too.
export default function AuthSplitCard({ children }) {
  return (
    <div className="auth-split-card" style={{
      width: '100%', minHeight: 'calc(100dvh - 64px)', background: 'var(--surface)',
    }}>
      <AuthHeroPanel />
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 'calc(100dvh - 64px)', padding: 'clamp(24px, 5vw, 48px)',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
