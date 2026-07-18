'use client'
export default function Error({ reset }) {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F8F7F4',
      gap: '16px',
      padding: '40px 20px',
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: 'var(--v2-font-display)',
        fontSize: '28px',
        color: '#0F172A',
      }}>
        Something went wrong
      </div>
      <p style={{ color: '#64748B', fontSize: '15px' }}>
        We couldn't load the gallery. Please try again.
      </p>
      <button
        onClick={reset}
        style={{
          background: '#3B82F6',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 24px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'var(--v2-font-ui)',
        }}
      >
        Try again
      </button>
    </div>
  );
}
