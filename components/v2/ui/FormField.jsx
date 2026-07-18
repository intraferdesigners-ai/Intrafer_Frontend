export default function V2FormField({ label, error, required, children }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '11px', fontWeight: 600,
          letterSpacing: '.08em', textTransform: 'uppercase',
          color: '#475569', marginBottom: '8px',
        }}>
          {label}{required && <span style={{ color: '#3B82F6' }}> *</span>}
        </label>
      )}
      {children}
      {error && (
        <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '6px' }}>{error}</p>
      )}
    </div>
  );
}
