'use client';
import { useState } from 'react';

const VARIANTS = {
  primary:   { bg: 'var(--primary)',      color: '#fff',             border: 'none',                           hoverBg: 'var(--primary-dark)' },
  secondary: { bg: 'var(--bg-parchment)', color: 'var(--text)',      border: '1px solid var(--border-sub)',    hoverBg: 'var(--bg-cream)'     },
  ghost:     { bg: 'transparent',         color: 'var(--text-mid)',  border: 'none',                           hoverBg: 'var(--bg-parchment)' },
  danger:    { bg: 'var(--danger-bg)',    color: 'var(--danger)',    border: '1px solid transparent',          hoverBg: 'var(--danger-bg)'    },
  success:   { bg: 'var(--success-bg)',   color: 'var(--success)',   border: '1px solid transparent',          hoverBg: 'var(--success-bg)'   },
  gold:      { bg: 'var(--primary)',      color: '#fff',             border: 'none',                           hoverBg: 'var(--primary-dark)' },
  outline:   { bg: 'transparent',         color: 'var(--primary)',   border: '1px solid var(--primary)',       hoverBg: 'var(--primary-bg)'   },
  dark:      { bg: '#0F172A',             color: '#F0F6FF',          border: 'none',                           hoverBg: '#1E293B'             },
};

const SIZES = {
  sm: { padding: '6px 14px',  fontSize: '12px', borderRadius: 'var(--r-sm)', fontWeight: 500 },
  md: { padding: '10px 20px', fontSize: '13px', borderRadius: 'var(--r-md)', fontWeight: 500 },
  lg: { padding: '13px 28px', fontSize: '14px', borderRadius: 'var(--r-md)', fontWeight: 500, letterSpacing: '.01em' },
};

export default function Button({
  children, variant = 'primary', size = 'md',
  loading = false, className = '', style: styleProp = {}, ...rest
}) {
  const [hov, setHov] = useState(false);
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;

  return (
    <button
      className={className}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      disabled={loading || rest.disabled}
      style={{
        ...s,
        background:     hov && !loading ? v.hoverBg : v.bg,
        color:          v.color,
        border:         v.border,
        fontFamily:     'var(--font-ui)',
        cursor:         loading || rest.disabled ? 'not-allowed' : 'pointer',
        opacity:        loading || rest.disabled ? 0.55 : 1,
        transition:     'all 150ms ease-out',
        display:        'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            '7px',
        whiteSpace:     'nowrap',
        transform:      hov && !loading && !rest.disabled ? 'translateY(-1px)' : 'none',
        boxShadow:      hov && !loading && !rest.disabled && variant === 'primary'
                          ? '0 4px 12px rgba(59,130,246,.35)' : 'none',
        ...styleProp,
      }}
      {...rest}
    >
      {loading && (
        <span style={{
          width: '14px', height: '14px', borderRadius: '50%',
          border: '2px solid currentColor', borderTopColor: 'transparent',
          animation: 'spin .7s linear infinite', flexShrink: 0,
          display: 'inline-block',
        }} />
      )}
      {children}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </button>
  );
}
