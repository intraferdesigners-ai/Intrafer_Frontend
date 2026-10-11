'use client';

import { useState } from 'react';
import { buildSerpPreview } from '@/lib/landingSerp';
import { FIELD_LABEL, HINT } from './shared';

// Live "how this looks in Google" card under the meta fields. Colours are
// Google's own on a white card, so it reads the same in either admin theme.
// Truncation is a character approximation (see lib/landingSerp.js).
export default function SerpPreview({ seo, categoryName, city, state, vendorCount, path, level = 'city' }) {
  const [device, setDevice] = useState('desktop');
  const { title, description, displayUrl } = buildSerpPreview({
    metaTitle: seo.metaTitle, metaDescription: seo.metaDescription,
    categoryName, city, state, vendorCount, path, device, level,
  });
  const mobile = device === 'mobile';

  const toggle = (value, label) => (
    <button
      type="button"
      onClick={() => setDevice(value)}
      aria-pressed={device === value}
      style={{
        padding: '4px 10px', minHeight: 0, fontSize: 11, fontWeight: 500, cursor: 'pointer',
        border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
        background: device === value ? 'var(--color-primary-bg)' : 'transparent',
        color: device === value ? 'var(--color-text)' : 'var(--color-text-hint)',
        fontFamily: 'var(--font-ui)',
      }}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ ...FIELD_LABEL, marginBottom: 0 }}>Google preview</span>
        <div style={{ display: 'flex', gap: 4 }} role="group" aria-label="Preview device">
          {toggle('desktop', 'Desktop')}
          {toggle('mobile', 'Mobile')}
        </div>
      </div>
      <div style={{
        background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
        padding: mobile ? '12px 14px' : '14px 18px', maxWidth: mobile ? 380 : 600,
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}>
        <div style={{ fontSize: 12, color: '#4d5156', lineHeight: 1.4, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayUrl}
        </div>
        <div style={{ fontSize: mobile ? 18 : 20, color: '#1a0dab', lineHeight: 1.3, marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 14, color: description ? '#4d5156' : '#9aa0a6', lineHeight: 1.58, fontStyle: description ? 'normal' : 'italic' }}>
          {description || 'No meta description — Google will choose text from the page.'}
        </div>
      </div>
      <p style={HINT}>Approximate — Google may rewrite titles and descriptions, and cuts by pixel width, not characters.</p>
    </div>
  );
}
