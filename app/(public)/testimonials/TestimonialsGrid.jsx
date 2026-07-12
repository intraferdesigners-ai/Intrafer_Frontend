'use client';
import { useState } from 'react';
import Image from 'next/image';

const FILTERS = ['All', 'Kitchen', 'Bedroom', 'Living Room', 'Office', 'Full Home'];

function Stars({ n }) {
  return <span style={{ color: 'var(--primary)', fontSize: '14px', letterSpacing: '2px' }}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>;
}

export default function TestimonialsGrid({ testimonials }) {
  const [active, setActive] = useState('All');
  const list = active === 'All' ? testimonials : testimonials.filter((t) => t.category === active);

  return (
    <>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setActive(f)} style={{ padding: '7px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', border: '1.5px solid', borderColor: active === f ? 'var(--primary)' : 'var(--border)', background: active === f ? 'var(--primary-bg)' : 'var(--surface)', color: active === f ? 'var(--primary)' : 'var(--text-sub)' }}>
            {f}
          </button>
        ))}
      </div>
      <div className="masonry-fallback">
        {list.map((t, i) => (
          <div key={i} style={{ breakInside: 'avoid', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
            <Stars n={t.rating} />
            <p style={{ fontSize: '14px', color: 'var(--text-sub)', fontStyle: 'italic', lineHeight: 1.75, margin: '10px 0 16px' }}>&ldquo;{t.text}&rdquo;</p>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ position: 'relative', width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                <Image src={t.avatar} alt={t.name} fill style={{ objectFit: 'cover' }} sizes="36px" />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>{t.name}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-hint)' }}>{t.city} · {t.project}</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', background: 'var(--primary-bg)', color: 'var(--primary)', padding: '3px 8px', borderRadius: '20px', fontWeight: 500 }}>by {t.designer}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-hint)' }}>{t.completedMonth}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
