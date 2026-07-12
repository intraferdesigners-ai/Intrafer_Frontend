export default function AuthLayout({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-parchment)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <a href="/" style={{
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
      {children}
    </div>
  );
}
