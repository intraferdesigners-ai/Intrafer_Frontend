export default function AuthLayout({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <a
          href="/"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            fontWeight: 400,
            color: 'var(--color-text)',
            letterSpacing: '.04em',
            textDecoration: 'none',
          }}
        >
          Intrafer
        </a>
      </div>
      {children}
    </div>
  );
}
