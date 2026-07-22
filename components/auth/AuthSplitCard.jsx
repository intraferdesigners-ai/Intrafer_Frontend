import AuthHeroPanel from './AuthHeroPanel';

export default function AuthSplitCard({ children, maxWidth = '880px' }) {
  return (
    <div className="auth-split-card" style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-2xl)', boxShadow: 'var(--shadow-lg)',
      overflow: 'hidden', width: '100%', maxWidth,
    }}>
      <AuthHeroPanel />
      <div style={{ padding: 'clamp(24px, 5vw, 40px)' }}>
        {children}
      </div>
    </div>
  );
}
