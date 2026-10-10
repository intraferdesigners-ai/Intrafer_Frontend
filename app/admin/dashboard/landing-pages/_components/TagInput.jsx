'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { HINT } from './shared';

// Tag-style list input: Enter or comma adds, click a tag to remove it.
// Pasting "A, B, C" adds all three. Duplicates (case-insensitive) are
// skipped; stops at `max`.
export default function TagInput({ value, onChange, max, maxLength, placeholder, ariaLabel }) {
  const [draft, setDraft] = useState('');
  const full = value.length >= max;

  const add = (raw) => {
    const seen = new Set(value.map((v) => v.toLowerCase()));
    const next = [...value];
    for (const part of raw.split(',')) {
      const tag = part.trim().slice(0, maxLength);
      if (!tag || seen.has(tag.toLowerCase()) || next.length >= max) continue;
      seen.add(tag.toLowerCase());
      next.push(tag);
    }
    if (next.length !== value.length) onChange(next);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(draft);
      setDraft('');
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  const handleChange = (e) => {
    const text = e.target.value;
    if (text.includes(',')) {
      add(text);
      setDraft('');
    } else {
      setDraft(text);
    }
  };

  return (
    <div>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
        padding: 8, minHeight: 44, borderRadius: 'var(--r-md)',
        border: '1px solid var(--border-sub)', background: 'var(--surface)',
      }}>
        {value.map((tag, i) => (
          <button
            key={`${tag}-${i}`}
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            title={`Remove ${tag}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '4px 8px 4px 10px', borderRadius: 20, fontSize: 12,
              background: 'var(--color-primary-bg)', color: 'var(--color-primary)',
              border: '1px solid var(--border-sub)', cursor: 'pointer',
            }}
          >
            {tag} <X size={11} />
          </button>
        ))}
        <input
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (draft.trim()) { add(draft); setDraft(''); } }}
          disabled={full}
          placeholder={full ? `Limit of ${max} reached` : placeholder}
          aria-label={ariaLabel}
          style={{
            flex: 1, minWidth: 140, border: 'none', outline: 'none', background: 'transparent',
            fontSize: 13, color: 'var(--text-sub)', fontFamily: 'var(--font-ui)', padding: '4px 2px',
          }}
        />
      </div>
      <p style={HINT}>Enter or comma adds · click a name to remove · {value.length} / {max}</p>
    </div>
  );
}
