'use client';

// Category · State · City segmented control for the new-page form.
const LEVEL_OPTIONS = [
  { value: 'category', label: 'Category page' },
  { value: 'state', label: 'State page' },
  { value: 'city', label: 'City page' },
];

export default function LevelControl({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Page type" style={{ display: 'inline-flex', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexWrap: 'wrap' }}>
      {LEVEL_OPTIONS.map((o, i) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            style={{
              padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-ui)',
              border: 'none', borderLeft: i ? '1px solid var(--color-border)' : 'none',
              background: active ? 'var(--color-primary-bg)' : 'transparent',
              color: active ? 'var(--color-text)' : 'var(--color-text-sub)',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

