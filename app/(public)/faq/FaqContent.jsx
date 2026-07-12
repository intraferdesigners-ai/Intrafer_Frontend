'use client';
import { useState } from 'react';

function FaqAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            style={{ width: '100%', textAlign: 'left', padding: '18px 0', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}
          >
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', lineHeight: 1.4 }}>{item.q}</span>
            <span style={{ fontSize: '20px', color: 'var(--text-hint)', flexShrink: 0, transform: openIndex === i ? 'rotate(45deg)' : 'none', transition: 'transform 200ms' }}>+</span>
          </button>
          <div style={{ maxHeight: openIndex === i ? '300px' : '0', overflow: 'hidden', transition: 'max-height 250ms ease' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-sub)', lineHeight: 1.75, paddingBottom: '18px' }}>{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FaqContent({ groups }) {
  const [search, setSearch] = useState('');

  const filtered = groups.map((g) => ({
    ...g,
    items: g.items.filter(
      (item) =>
        !search ||
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <input
        type="search"
        placeholder="Search questions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: '14px', background: 'var(--surface)', color: 'var(--text)', marginBottom: '48px', outline: 'none', boxSizing: 'border-box' }}
      />
      {filtered.length === 0 && (
        <p style={{ color: 'var(--text-hint)', textAlign: 'center', padding: '40px 0' }}>No matching questions found.</p>
      )}
      {filtered.map((group) => (
        <div key={group.category} style={{ marginBottom: '48px' }}>
          <p className="caps-label-primary" style={{ marginBottom: '16px' }}>{group.category}</p>
          <FaqAccordion items={group.items} />
        </div>
      ))}
    </>
  );
}
