'use client';

import Link from 'next/link';
import { MapPin, AlertTriangle } from 'lucide-react';

const REASON_LABELS = {
  'same-slug': 'same URL',
  'similar-name': 'similar spelling',
  'same-place': 'same place under another name',
};

// "Pune, Maharashtra" / "Maharashtra" / "Category page" for a similar page.
const similarLabel = (p) => {
  if (p.level === 'category') return 'Category page';
  if (p.level === 'state') return p.state;
  return `${p.city}, ${p.state}`;
};

// Non-blocking hint under the location fields: whether the city (or, for
// a state page, the state) matched the Place taxonomy, the vendor count in
// the page's scope, and any similar existing pages. Hub results carry
// `level` (match-check's level-aware response).
export default function MatchCheckHint({ result, loading }) {
  if (loading && !result) {
    return <p style={{ fontSize: 12, color: 'var(--color-text-hint)', margin: 0 }}>Checking place data…</p>;
  }
  if (!result) return null;

  const { matchedPlace, vendorsByPlace, vendorsByName, similar = [] } = result;
  const hub = Boolean(result.level);
  const vendorCount = hub ? result.vendorCount : (matchedPlace ? vendorsByPlace : vendorsByName);
  const matched = hub ? (result.level === 'category' || Boolean(result.matchedState)) : Boolean(matchedPlace);
  let headline;
  if (result.level === 'category') headline = 'All listed vendors in this category';
  else if (result.level === 'state') headline = result.matchedState ? `Matches known state: ${result.matchedState}` : 'Not in place data, vendors matched by state name';
  else headline = matchedPlace ? `Matches known place: ${matchedPlace}` : 'Not in place data, vendors matched by name';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, opacity: loading ? 0.6 : 1 }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, lineHeight: 1.5,
        padding: '10px 12px', borderRadius: 'var(--radius-md)',
        background: matched ? 'var(--success-bg)' : 'var(--info-bg)',
        color: matched ? 'var(--success)' : 'var(--info)',
      }}>
        <MapPin size={14} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontWeight: 500 }}>
            {headline}
          </div>
          <div>
            {vendorCount} vendor{vendorCount === 1 ? '' : 's'} {hub ? 'in scope' : 'would be listed'}
            {!hub && matchedPlace && vendorsByName !== vendorsByPlace && ` (${vendorsByName} by name match)`}
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
                    {similarLabel(p)}
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
