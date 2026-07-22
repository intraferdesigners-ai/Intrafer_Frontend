export default function AuthLayout({ children }) {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      minHeight: '100vh',
      background: 'var(--bg-parchment)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Decorative background: dot grid + soft blurred shapes — same
          corrected technique as app/(public)/enquiry/page.jsx, applied once
          here since every /auth/* page renders through this layout. */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, color-mix(in srgb, var(--primary) 30%, transparent) 1px, transparent 1px)',
        backgroundSize: '26px 26px', opacity: 0.45,
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', top: '-60px', left: '-60px', width: '320px', height: '320px',
        borderRadius: '50%', background: 'var(--primary)', opacity: 0.18,
        filter: 'blur(45px)', zIndex: 0, pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: '-90px', right: '-70px', width: '340px', height: '340px',
        borderRadius: '50%', background: 'var(--text)', opacity: 0.15,
        filter: 'blur(50px)', zIndex: 0, pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', top: '55%', right: '10%', width: '160px', height: '160px',
        borderRadius: '50%', background: 'var(--primary)', opacity: 0.18,
        filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none',
      }} />

      <a href="/" style={{
        position: 'relative', zIndex: 1,
        fontFamily: 'var(--font-display)',
        fontSize: '26px',
        fontWeight: 400,
        color: 'var(--text)',
        letterSpacing: '.04em',
        textDecoration: 'none',
        marginBottom: '32px',
        textAlign: 'center',
        display: 'block',
      }}>
        Intrafer
      </a>
      <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}
