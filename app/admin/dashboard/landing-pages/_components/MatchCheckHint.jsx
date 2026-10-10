'use client';

import Link from 'next/link';
import { MapPin, AlertTriangle } from 'lucide-react';

const REASON_LABELS = {
  'same-slug': 'same URL',
  'similar-name': 'similar spelling',
  'same-place': 'same place under another name',
};

// Non-blocking hint under the state/city fields: whether the city matched
// the Place taxonomy, vendor counts, and any similar existing pages.
export default function MatchCheckHint({ result, loading }) {
  if (loading && !result) {
    return <p style={{ fontSize: 12, color: 'var(--color-text-hint)', margin: 0 }}>Checking place data…</p>;
  }
  if (!result) return null;

  const { matchedPlace, vendorsByPlace, vendorsByName, similar = [] } = result;
  const vendorCount = matchedPlace ? vendorsByPlace : vendorsByName;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, opacity: loading ? 0.6 : 1 }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, lineHeight: 1.5,
        padding: '10px 12px', borderRadius: 'var(--radius-md)',
        background: matchedPlace ? 'var(--success-bg)' : 'var(--info-bg)',
        color: matchedPlace ? 'var(--success)' : 'var(--info)',
      }}>
        <MapPin size={14} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontWeight: 500 }}>
            {matchedPlace ? `Matches known place: ${matchedPlace}` : 'Not in place data, vendors matched by name'}
          </div>
          <div>
            {vendorCount} vendor{vendorCount === 1 ? '' : 's'} would be listed
            {matchedPlace && vendorsByName !== vendorsByPlace && ` (${vendorsByName} by name match)`}
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, lineHeight: 1.5,
          padding: '10px 12px', borderRadius: 'var(--radius-md)',
          background: 'var(--warning-bg)', color: 'var(--warning)',
        }}>
          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 500 }}>Similar pages exist</div>
            <ul style={{ margin: '4px 0 0', paddingLeft: 16, listStyle: 'disc' }}>
              {similar.map((p) => (
                <li key={p._id}>
                  <Link href={`/admin/dashboard/landing-pages/${p._id}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                    {p.city}, {p.state}
                  </Link>
                  {' '}({p.status}) — {REASON_LABELS[p.reason] || p.reason}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
