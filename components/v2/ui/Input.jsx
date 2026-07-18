'use client'
import { useState } from 'react';

export default function V2Input({
  icon,
  error,
  type = 'text',
  style: extraStyle = {},
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const isPassword = type === 'password';
  const [showPassword, setShowPassword] = useState(false);

  const borderColor = error ? '#DC2626' : focused ? '#3B82F6' : '#CBD5E1';

  return (
    <div style={{ position: 'relative' }}>
      {icon && (
        <div style={{
          position: 'absolute', left: '14px', top: '50%',
          transform: 'translateY(-50%)',
          color: '#94A3B8', pointerEvents: 'none',
          display: 'flex', alignItems: 'center',
        }}>
          {icon}
        </div>
      )}
      <input
        {...props}
        type={isPassword ? (showPassword ? 'text' : 'password') : type}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        style={{
          width: '100%', height: '48px',
          padding: `0 ${isPassword ? '44px' : '14px'} 0 ${icon ? '42px' : '14px'}`,
          background: '#FFFFFF',
          border: `1.5px solid ${borderColor}`,
          borderRadius: '10px',
          fontSize: '14px', color: '#0F172A',
          fontFamily: 'var(--v2-font-ui)',
          outline: 'none',
          transition: 'border-color 150ms',
          boxSizing: 'border-box',
          ...extraStyle,
        }}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(s => !s)}
          style={{
            position: 'absolute', right: '14px', top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: '12px', color: '#64748B', fontWeight: 500,
            fontFamily: 'var(--v2-font-ui)',
          }}
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      )}
    </div>
  );
}
