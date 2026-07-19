'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Scale } from 'lucide-react';
import { useCompare } from '@/context/CompareContext';
import api from '@/lib/api';

export default function CompareBar() {
  const { compareIds, removeFromCompare, clearCompare } = useCompare();
  const [vendors, setVendors] = useState([]);
  const router = useRouter();

  const idsKey = compareIds.join(',');

  useEffect(() => {
    if (!idsKey) {
      setVendors([]);
      return;
    }
    let cancelled = false;
    api.get(`/public/vendors/compare?ids=${idsKey}`)
      .then(({ data }) => {
        if (!cancelled) setVendors(data.data?.vendors || []);
      })
      .catch(() => { if (!cancelled) setVendors([]); });
    return () => { cancelled = true; };
  }, [idsKey]);

  if (compareIds.length === 0) return null;

  return (
    <>
      {/* Sit above the mobile sticky CTA bar (also bottom:0) instead of overlapping it */}
      <style>{`
        @media (max-width: 767px) { .compare-bar { bottom: 70px !important; } }
      `}</style>
      <div className="compare-bar" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90,
        background: 'var(--surface)', borderTop: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        padding: '12px clamp(16px, 4vw, 40px)',
      }}>
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
      }}>
        {/* Selected vendor chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
          {compareIds.map((id) => {
            const v = vendors.find((x) => x._id === id);
            const thumb = v?.profilePhoto || v?.portfolioImages?.[0];
            return (
              <div key={id} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'var(--bg-parchment)', border: '1px solid var(--border)',
                borderRadius: '20px', padding: '4px 8px 4px 4px',
              }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden',
                  background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: '10px', fontWeight: 700, color: 'var(--primary)',
                }}>
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    v?.businessName?.charAt(0) || '?'
                  )}
                </div>
                <span style={{
                  fontSize: '12px', color: 'var(--text)', maxWidth: '120px',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {v?.businessName || 'Loading…'}
                </span>
                <button
                  onClick={() => removeFromCompare(id)}
                  aria-label={`Remove ${v?.businessName || 'vendor'} from compare`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-hint)', padding: 0 }}
                >
                  <X size={13} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <button
            onClick={clearCompare}
            style={{ background: 'none', border: 'none', fontSize: '13px', color: 'var(--text-hint)', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Clear all
          </button>
          <button
            disabled={compareIds.length < 2}
            onClick={() => router.push(`/compare?ids=${idsKey}`)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
              padding: '10px 20px', borderRadius: 'var(--r-md)',
              background: compareIds.length < 2 ? 'var(--border)' : 'var(--primary)',
              color: compareIds.length < 2 ? 'var(--text-hint)' : '#fff',
              border: 'none', fontSize: '13px', fontWeight: 500,
              cursor: compareIds.length < 2 ? 'not-allowed' : 'pointer',
            }}
          >
            <Scale size={14} />
            Compare ({compareIds.length})
          </button>
        </div>
      </div>
      </div>
    </>
  );
}
