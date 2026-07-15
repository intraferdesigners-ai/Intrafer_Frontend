'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import CitySelect from '../ui/CitySelect';

const STYLES = [
  'Residential', 'Modular Kitchen', 'Living Room',
  'Office Interiors', 'Commercial', 'Bedroom', 'Bathroom',
];

const LABEL_STYLE = {
  fontSize: '9px', letterSpacing: '.1em', color: 'var(--text-hint)', marginBottom: '3px',
};

const SELECT_STYLE = {
  width: '100%', border: 'none', background: 'transparent', padding: 0,
  fontSize: '13px', color: 'var(--text-sub)', outline: 'none', cursor: 'pointer',
  appearance: 'none',
};

export default function HeroSearch() {
  const router = useRouter();
  const [city,  setCity]  = useState('');
  const [style, setStyle] = useState('Residential');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city)  params.set('city', city);
    // Vendors are filtered by `specialization` server-side — `style` here is
    // just the local field name from the hero widget's CITY/STYLE copy.
    if (style) params.set('specialization', style);
    router.push(`/vendors?${params.toString()}`);
  };

  return (
    <div
      className="search-widget-grid"
      style={{
        marginTop: '24px', background: 'var(--surface)', border: '1px solid var(--border-sub)',
        borderRadius: 'var(--r-lg)', display: 'flex', boxShadow: 'var(--shadow-sm)',
        position: 'relative',
      }}
    >
      <div style={{ flex: 1, padding: '13px 16px', borderRight: '1px solid var(--border)' }}>
        <div style={LABEL_STYLE}>CITY</div>
        <CitySelect value={city} onChange={setCity} placeholder="Any city" />
      </div>

      <div style={{ flex: 1, padding: '13px 16px' }}>
        <div style={LABEL_STYLE}>STYLE</div>
        <select value={style} onChange={(e) => setStyle(e.target.value)} style={SELECT_STYLE}>
          {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <button
        onClick={handleSearch}
        className="search-btn"
        style={{
          padding: '13px 22px', background: 'var(--primary)', color: '#fff', border: 'none',
          fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center',
          borderTopRightRadius: 'var(--r-lg)', borderBottomRightRadius: 'var(--r-lg)',
        }}
      >
        <Search size={13} /> Search
      </button>
    </div>
  );
}
