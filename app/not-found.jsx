import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0F172A',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: 'var(--v2-font-display)',
        fontSize: 'clamp(80px, 15vw, 140px)',
        fontWeight: 400,
        color: 'rgba(59,130,246,0.15)',
        lineHeight: 1,
        marginBottom: '24px',
      }}>
        404
      </div>
      <h1 style={{
        fontFamily: 'var(--v2-font-display)',
        fontSize: 'clamp(24px, 4vw, 36px)',
        fontWeight: 400,
        color: '#F8F7F4',
        marginBottom: '12px',
        letterSpacing: '-0.02em',
      }}>
        This page doesn't exist.
      </h1>
      <p style={{
        fontSize: '15px',
        color: '#64748B',
        marginBottom: '32px',
        maxWidth: '400px',
        lineHeight: 1.65,
      }}>
        The page you're looking for has moved, been deleted,
        or never existed. Let's get you back on track.
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" style={{
          background: '#3B82F6',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: 600,
          fontFamily: 'var(--v2-font-ui)',
        }}>
          Back to home
        </Link>
        <Link href="/vendors" style={{
          background: 'transparent',
          color: '#94A3B8',
          textDecoration: 'none',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: 400,
          fontFamily: 'var(--v2-font-ui)',
        }}>
          Browse designers
        </Link>
      </div>
    </div>
  );
}
