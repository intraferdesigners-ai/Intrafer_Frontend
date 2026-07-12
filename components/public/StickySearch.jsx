'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function StickySearch() {
  const router = useRouter();
  const [city,    setCity]    = useState('');
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsStuck(window.scrollY > 520);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!isStuck) return null;

  return (
    <div
      className="slide-down"
      style={{
        position: 'fixed', top: '68px', left: 0, right: 0, zIndex: 40,
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)', padding: '10px 32px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}
    >
      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-hint)', whiteSpace: 'nowrap' }}
        className="hide-mobile">
        Find designers
      </span>

      <div style={{ flex: 1, maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '8px', minWidth: 0 }}>
        <input
          value={city}
          onChange={e => setCity(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && router.push('/vendors' + (city ? `?city=${encodeURIComponent(city)}` : ''))}
          placeholder="City — e.g. Bangalore"
          style={{
            flex: 1, minWidth: 0, padding: '9px 14px',
            border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
            fontSize: '13px', background: 'var(--bg-parchment)', color: 'var(--text)',
          }}
        />
        <button
          onClick={() => router.push('/vendors' + (city ? `?city=${encodeURIComponent(city)}` : ''))}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            flexShrink: 0,
            padding: '9px clamp(12px, 3vw, 20px)', background: 'var(--primary)', color: '#fff',
            border: 'none', borderRadius: 'var(--r-md)',
            fontSize: '13px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          <Search size={13} />
          <span className="search-btn-text">Search designers</span>
        </button>
      </div>

      <a href="/vendors" style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 500, whiteSpace: 'nowrap', textDecoration: 'none' }}
        className="hide-mobile">
        Browse all →
      </a>
    </div>
  );
}
