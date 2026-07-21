'use client';
import { useState } from 'react';
import { getInitials } from '@/lib/utils';

function Stars({ n }) {
  return <span style={{ color: 'var(--primary)', fontSize: '14px', letterSpacing: '2px' }}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>;
}

function formatMonthYear(dateString) {
  return new Date(dateString).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export default function TestimonialsGrid({ reviews }) {
  const [active, setActive] = useState('All');

  if (!reviews || reviews.length === 0) return null;

  const filters = ['All', ...Array.from(new Set(reviews.map((r) => r.projectType).filter(Boolean)))];
  const list = active === 'All' ? reviews : reviews.filter((r) => r.projectType === active);

  return (
    <>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
        {filters.map((f) => (
          <button key={f} onClick={() => setActive(f)} style={{ padding: '7px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', border: '1.5px solid', borderColor: active === f ? 'var(--primary)' : 'var(--border)', background: active === f ? 'var(--primary-bg)' : 'var(--surface)', color: active === f ? 'var(--primary)' : 'var(--text-sub)' }}>
            {f}
          </button>
        ))}
      </div>
      <div className="masonry-fallback">
        {list.map((r) => (
          <div key={r.id} style={{ breakInside: 'avoid', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
            <Stars n={r.rating} />
            {r.comment && (
              <p style={{ fontSize: '14px', color: 'var(--text-sub)', fontStyle: 'italic', lineHeight: 1.75, margin: '10px 0 16px' }}>&ldquo;{r.comment}&rdquo;</p>
            )}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'var(--primary-bg)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 600, flexShrink: 0,
              }}>
                {getInitials(r.userName)}
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>{r.userName}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-hint)' }}>
                  {[r.vendorCity, r.projectType].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {r.vendorName && (
                <span style={{ fontSize: '11px', background: 'var(--primary-bg)', color: 'var(--primary)', padding: '3px 8px', borderRadius: '20px', fontWeight: 500 }}>{r.vendorName}</span>
              )}
              <span style={{ fontSize: '11px', color: 'var(--text-hint)' }}>{formatMonthYear(r.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
