'use client'

export default function V2Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  fullWidth = false,
  style: extraStyle = {},
}) {
  const sizes = {
    sm: { padding: '7px 16px', fontSize: '13px' },
    md: { padding: '10px 22px', fontSize: '14px' },
    lg: { padding: '14px 32px', fontSize: '15px' },
  };

  const variants = {
    primary: {
      background: '#3B82F6',
      color: '#FFFFFF',
      border: 'none',
      hoverBg: '#1D4ED8',
    },
    secondary: {
      background: 'transparent',
      color: '#475569',
      border: '1.5px solid #CBD5E1',
      hoverBg: '#F1F5F9',
    },
    ghost: {
      background: 'transparent',
      color: '#F8F7F4',
      border: '1px solid rgba(255,255,255,0.1)',
      hoverBg: 'rgba(255,255,255,0.06)',
    },
    dark: {
      background: '#0F172A',
      color: '#F8F7F4',
      border: 'none',
      hoverBg: '#1E293B',
    },
  };

  const v = variants[variant];
  const s = sizes[size];

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--v2-font-ui)',
    fontWeight: 500,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 150ms, transform 100ms',
    textDecoration: 'none',
    width: fullWidth ? '100%' : 'auto',
    ...s,
    background: v.background,
    color: v.color,
    border: v.border || 'none',
    ...extraStyle,
  };

  const element = (
    <button
      style={baseStyle}
      onClick={onClick}
      onMouseEnter={e => e.currentTarget.style.background = v.hoverBg}
      onMouseLeave={e => e.currentTarget.style.background = v.background}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {children}
    </button>
  );

  if (href) {
    return (
      <a href={href} style={{ textDecoration: 'none' }}>
        {element}
      </a>
    );
  }

  return element;
}
