'use client'
import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import CitySelect from '@/components/ui/CitySelect';

const SPECIALIZATIONS = [
  'All', 'Residential', 'Modular Kitchen', 'Living Room',
  'Office Interiors', 'Commercial', 'Bedroom', 'Bathroom',
];

const SORT_OPTIONS = [
  { label: 'Best rated',    value: 'rating'  },
  { label: 'Most reviewed', value: 'reviews' },
  { label: 'Newest',        value: 'newest'  },
  { label: 'A–Z',           value: 'name'    },
];

const selectStyle = {
  width: '100%', height: '48px', padding: '0 12px',
  background: 'transparent', border: 'none', outline: 'none',
  color: '#F8F7F4', fontSize: '13px',
  fontFamily: 'var(--v2-font-ui)', appearance: 'none', cursor: 'pointer',
};

export default function VendorSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [city, setCity] = useState(searchParams.get('city') || '');
  const [specialization, setSpecialization] = useState(searchParams.get('specialization') || 'All');
  const [sort, setSort] = useState(searchParams.get('sort') || 'rating');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city.trim()) params.set('city', city.trim());
    if (specialization && specialization !== 'All') params.set('specialization', specialization);
    if (sort && sort !== 'rating') params.set('sort', sort);
    const bhk = searchParams.get('bhk');
    if (bhk) params.set('bhk', bhk);
    router.push(pathname + (params.toString() ? '?' + params.toString() : ''));
  };

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', alignItems: 'stretch',
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <div style={{
        flex: '1 1 200px',
        borderRight: '1px solid rgba(255,255,255,0.12)',
        padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <span style={{ fontSize: '14px', flexShrink: 0 }}>📍</span>
        <div style={{ flex: 1 }}>
          <CitySelect value={city} onChange={setCity} placeholder="City" compact />
        </div>
      </div>

      <div style={{
        flex: '1 1 180px',
        borderRight: '1px solid rgba(255,255,255,0.12)',
        padding: '0 8px', display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        <span style={{ fontSize: '13px', color: '#3B82F6', flexShrink: 0 }}>◆</span>
        <select value={specialization} onChange={(e) => setSpecialization(e.target.value)} style={selectStyle}>
          {SPECIALIZATIONS.map(s => (
            <option key={s} value={s} style={{ color: '#0F172A' }}>{s}</option>
          ))}
        </select>
      </div>

      <div style={{
        flex: '1 1 140px',
        borderRight: '1px solid rgba(255,255,255,0.12)',
        padding: '0 8px',
      }}>
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={selectStyle}>
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value} style={{ color: '#0F172A' }}>{o.label}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleSearch}
        style={{
          flex: '0 0 auto',
          padding: '0 24px',
          background: '#3B82F6', color: '#FFFFFF',
          border: 'none', fontSize: '14px', fontWeight: 600,
          fontFamily: 'var(--v2-font-ui)', cursor: 'pointer',
          transition: 'background 150ms',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
        onMouseLeave={e => e.currentTarget.style.background = '#3B82F6'}
      >
        🔍 Search
      </button>
    </div>
  );
}
