'use client';
import { useState } from 'react';
import usePrefersReducedMotion from '../../lib/usePrefersReducedMotion';

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
  const shouldReduceMotion = usePrefersReducedMotion();
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;

  return (
    // Press scale (0.97) and the hover lift are CSS (.m-btn in
    // app/globals.css); the lift amount comes in through --btn-y.
    <button
      className={className ? `m-btn ${className}` : 'm-btn'}
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
        // Hover lift: same trigger and -1px value as before; .m-btn turns it
        // into translateY() and composes the press scale with it.
        '--btn-y':      hov && !loading && !rest.disabled ? '-1px' : '0px',
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
          animation: shouldReduceMotion ? 'none' : 'spin .7s linear infinite',
          opacity: shouldReduceMotion ? 0.6 : 1,
          flexShrink: 0,
          display: 'inline-block',
        }} />
      )}
      {children}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </button>
  );
}
