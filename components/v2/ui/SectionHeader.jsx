export default function V2SectionHeader({
  eyebrow,
  heading,
  subheading,
  align = 'left',
  dark = false,
  action,
}) {
  return (
    <div style={{
      textAlign: align,
      marginBottom: '40px',
    }}>
      {eyebrow && (
        <div style={{
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: '#3B82F6',
          marginBottom: '12px',
          fontFamily: 'var(--v2-font-ui)',
        }}>
          {eyebrow}
        </div>
      )}
      <div style={{
        display: 'flex', alignItems: 'flex-end',
        justifyContent: align === 'left' ? 'space-between' : 'center',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        <h2 style={{
          fontFamily: 'var(--v2-font-display)',
          fontSize: 'clamp(28px, 4vw, 42px)',
          fontWeight: 400,
          color: dark ? '#F8F7F4' : '#0F172A',
          letterSpacing: '-0.02em',
          lineHeight: 1.15,
          margin: 0,
        }}>
          {heading}
        </h2>
        {action && (
          <a href={action.href} style={{
            fontSize: '13px', color: '#3B82F6',
            textDecoration: 'none', fontWeight: 500,
            whiteSpace: 'nowrap', flexShrink: 0,
            marginBottom: '4px',
          }}>
            {action.label} →
          </a>
        )}
      </div>
      {subheading && (
        <p style={{
          fontSize: '15px',
          color: dark ? '#64748B' : '#64748B',
          lineHeight: 1.7,
          marginTop: '10px',
          maxWidth: align === 'center' ? '520px' : '500px',
          margin: align === 'center' ? '10px auto 0' : '10px 0 0',
          fontFamily: 'var(--v2-font-ui)',
          fontWeight: 300,
        }}>
          {subheading}
        </p>
      )}
    </div>
  );
}
