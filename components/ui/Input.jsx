'use client';
import { useState } from 'react';

export default function Input({ label, error, hint, icon: Icon, className, style, ...rest }) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && (
        <label style={{
          fontSize: '10px', fontWeight: 600, letterSpacing: '.1em',
          textTransform: 'uppercase', color: 'var(--text-hint)',
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {Icon && (
          <Icon size={15} style={{
            position: 'absolute', left: '12px',
            top: '50%', transform: 'translateY(-50%)',
            color: focused ? 'var(--primary)' : 'var(--text-hint)',
            transition: 'color 150ms', pointerEvents: 'none',
          }} />
        )}
        <input
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="form-input-styled"
          style={{
            paddingLeft: Icon ? '38px' : '14px',
            borderColor: error ? 'var(--danger)' : focused ? 'var(--primary)' : 'var(--border-sub)',
            boxShadow:   error   ? '0 0 0 3px rgba(155,35,53,.08)'
                       : focused ? '0 0 0 3px rgba(181,84,30,.1)' : 'none',
            ...style,
          }}
          {...rest}
        />
      </div>
      {error && <p style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '2px' }}>{error}</p>}
      {!error && hint && <p style={{ fontSize: '11px', color: 'var(--text-hint)', marginTop: '2px' }}>{hint}</p>}
    </div>
  );
}
