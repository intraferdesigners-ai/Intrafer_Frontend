'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const SPECIALIZATIONS = [
  'All', 'Residential', 'Modular Kitchen', 'Living Room',
  'Office Interiors', 'Commercial', 'Bedroom', 'Bathroom',
];

const SORT_OPTIONS = [
  { label: 'Best rated',    value: 'rating'  },
  { label: 'Most reviewed', value: 'reviews' },
  { label: 'Newest',        value: 'newest'  },
  { label: 'A–Z',          value: 'name'    },
];

const SELECT_STYLE = {
  width: '100%', padding: '10px 14px', fontSize: 13,
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text)', outline: 'none',
  transition: 'border-color 150ms ease-out',
  appearance: 'none', cursor: 'pointer', boxSizing: 'border-box',
};

const LABEL_STYLE = {
  display: 'block', fontSize: '12px', fontWeight: 500,
  color: 'var(--color-text-sub)', marginBottom: '6px', letterSpacing: '0.01em',
};

export default function VendorSearch() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [city,           setCity]           = useState(searchParams.get('city')           || '');
  const [specialization, setSpecialization] = useState(searchParams.get('specialization') || 'All');
  const [sort,           setSort]           = useState(searchParams.get('sort')           || 'rating');

  const hasFilters = !!(searchParams.get('city') || searchParams.get('specialization'));

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city.trim())                                params.set('city', city.trim());
    if (specialization && specialization !== 'All') params.set('specialization', specialization);
    if (sort && sort !== 'rating')                  params.set('sort', sort);
    router.push('/vendors' + (params.toString() ? '?' + params.toString() : ''));
  };

  const handleClear = () => {
    setCity('');
    setSpecialization('All');
    setSort('rating');
    router.push('/vendors');
  };

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-xl)',
      padding: 20, marginBottom: 32,
    }}>
      <p style={{
        fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300,
        color: 'var(--color-text)', margin: '0 0 16px',
      }}>
        Find your designer
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
        {/* City */}
        <div style={{ flex: '1 1 160px' }}>
          <Input
            label="City"
            placeholder="e.g. Bangalore"
            icon={MapPin}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        {/* Specialization */}
        <div style={{ flex: '1 1 160px' }}>
          <label style={LABEL_STYLE}>Specialization</label>
          <select value={specialization} onChange={(e) => setSpecialization(e.target.value)} style={SELECT_STYLE}>
            {SPECIALIZATIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div style={{ flex: '1 1 140px' }}>
          <label style={LABEL_STYLE}>Sort by</label>
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={SELECT_STYLE}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Search */}
        <Button variant="primary" size="md" onClick={handleSearch} style={{ flexShrink: 0 }}>
          <Search size={14} />
          Search
        </Button>
      </div>

      {hasFilters && (
        <button
          onClick={handleClear}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontSize: 12, color: 'var(--color-text-hint)', marginTop: 12,
            textDecoration: 'underline',
          }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
