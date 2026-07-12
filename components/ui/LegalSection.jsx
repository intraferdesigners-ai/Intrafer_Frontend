export default function LegalSection({ title, children }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '20px', fontWeight: 400,
        color: 'var(--text)', marginBottom: '12px',
        letterSpacing: '-.01em',
      }}>{title}</h2>
      <div style={{
        fontSize: '15px', color: 'var(--text-mid)',
        lineHeight: 1.75,
      }}>{children}</div>
    </div>
  );
}
