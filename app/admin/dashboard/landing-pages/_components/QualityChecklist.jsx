'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle, ChevronDown } from 'lucide-react';
import { evaluateChecklist } from '@/lib/landingChecklist';
import { CARD, SECTION_LABEL, HINT } from './shared';

// Advisory quality checks (lib/landingChecklist.js), re-evaluated as the
// form changes. Never blocks saving or publishing. Open by default for
// drafts, collapsed for published pages.
export default function QualityChecklist({ form, categoryName, city, state, level = 'city', vendorCount, published }) {
  const [open, setOpen] = useState(!published);
  const checks = useMemo(
    () => evaluateChecklist(form, { categoryName, city, state, vendorCount, level }),
    [form, categoryName, city, state, vendorCount, level]
  );
  const passed = checks.filter((c) => c.level === 'pass').length;

  return (
    <section style={CARD} aria-labelledby="lp-checklist-heading">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="lp-checklist"
        style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%', minHeight: 0,
          padding: 0, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span id="lp-checklist-heading" style={{ ...SECTION_LABEL, marginBottom: 0 }}>Quality checklist</span>
        <span style={{ fontSize: 12, fontWeight: 500, color: passed === checks.length ? 'var(--success)' : 'var(--warning)' }}>
          {passed} of {checks.length} passed
        </span>
        <ChevronDown
          size={14}
          style={{ marginLeft: 'auto', color: 'var(--color-text-hint)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}
        />
      </button>
      <p style={{ ...HINT, margin: '4px 0 0' }}>Advisory — you can publish regardless.</p>

      {open && (
        <ul id="lp-checklist" style={{ listStyle: 'none', padding: 0, margin: '14px 0 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {checks.map((c) => (
            <li key={c.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              {c.level === 'pass'
                ? <CheckCircle2 size={15} aria-label="Passed" style={{ color: 'var(--success)', flexShrink: 0, marginTop: 1 }} />
                : <AlertTriangle size={15} aria-label="Warning" style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 1 }} />}
              <span>
                <span style={{ fontSize: 13, color: 'var(--color-text)' }}>{c.label}</span>
                {c.hint && <span style={{ ...HINT, display: 'block', marginTop: 1 }}>{c.hint}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
