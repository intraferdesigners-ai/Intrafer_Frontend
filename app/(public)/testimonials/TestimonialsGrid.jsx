'use client';
import { useState } from 'react';
import Image from 'next/image';

const FILTERS = ['All', 'Kitchen', 'Bedroom', 'Living Room', 'Office', 'Full Home'];

function Stars({ n }) {
  return <span style={{ color: '#3B82F6', fontSize: '13px', letterSpacing: '2px' }}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>;
}

export default function TestimonialsGrid({ testimonials }) {
  const [active, setActive] = useState('All');
  const list = active === 'All' ? testimonials : testimonials.filter((t) => t.category === active);

  return (
    <>
      <div className="scroll-x" style={{ marginBottom: '32px', paddingBottom: '4px' }}>
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setActive(f)} style={{
            padding: '7px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            border: active === f ? 'none' : '1.5px solid #CBD5E1',
            background: active === f ? '#3B82F6' : '#FFFFFF',
            color: active === f ? '#FFFFFF' : '#475569',
            fontFamily: 'var(--v2-font-ui)',
            whiteSpace: 'nowrap',
          }}>
            {f}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }} className="grid-mobile-1">
        {list.map((t, i) => (
          <div key={i} className="v2-card" style={{ padding: '22px' }}>
            <Stars n={t.rating} />
            <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.75, margin: '12px 0 16px' }}>&ldquo;{t.text}&rdquo;</p>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ position: 'relative', width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#DBEAFE' }}>
                <Image src={t.avatar} alt={t.name} fill style={{ objectFit: 'cover' }} sizes="36px" />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', margin: 0 }}>{t.name}</p>
                <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>{t.city} · {t.project}</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', background: 'rgba(59,130,246,0.08)', color: '#3B82F6', padding: '3px 8px', borderRadius: '20px', fontWeight: 500 }}>by {t.designer}</span>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>{t.completedMonth}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
