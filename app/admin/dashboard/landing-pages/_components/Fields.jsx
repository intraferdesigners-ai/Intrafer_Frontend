'use client';

import { useId } from 'react';
import Input from '@/components/ui/Input';
import { FIELD_LABEL, HINT, FIELD_ERROR } from './shared';

// Input with an optional live "n / max" counter. Over the limit turns the
// counter red but doesn't block typing — the server's maxlength is the
// actual rule, and its error lands in `error`.
export function TextField({ label, value, onChange, max, counter = false, error, hint, ...rest }) {
  const length = (value || '').length;
  const count = counter && max ? `${length} / ${max}` : null;
  return (
    <div>
      <Input
        label={label}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        error={error}
        hint={[hint, count].filter(Boolean).join(' · ') || undefined}
        {...rest}
      />
      {counter && error && max && <p style={{ ...HINT, color: length > max ? 'var(--danger)' : undefined }}>{count}</p>}
    </div>
  );
}

export function TextArea({ label, value, onChange, max, counter = false, error, hint, rows = 5, ...rest }) {
  const id = useId();
  const length = (value || '').length;
  return (
    <div>
      {label && <label htmlFor={id} style={FIELD_LABEL}>{label}</label>}
      <textarea
        id={id}
        className="form-textarea-styled"
        rows={rows}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        style={{ borderColor: error ? 'var(--danger)' : undefined, fontFamily: 'var(--font-ui)', lineHeight: 1.6 }}
        {...rest}
      />
      {error && <p style={FIELD_ERROR}>{error}</p>}
      {(hint || (counter && max)) && (
        <p style={{ ...HINT, color: counter && max && length > max ? 'var(--danger)' : HINT.color }}>
          {[hint, counter && max ? `${length} / ${max}` : null].filter(Boolean).join(' · ')}
        </p>
      )}
    </div>
  );
}
