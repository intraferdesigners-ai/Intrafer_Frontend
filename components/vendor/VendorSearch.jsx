'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Tag, ArrowUpDown, MapPin, Navigation } from 'lucide-react';
import Button from '../ui/Button';
import CitySelect from '../ui/CitySelect';
import LocalitySelect from '../ui/LocalitySelect';
import api from '../../lib/api';

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
  display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 500,
  color: 'var(--color-text-sub)', marginBottom: '6px', letterSpacing: '0.01em',
};

export default function VendorSearch() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [city,           setCity]           = useState(searchParams.get('city')           || '');
  const [cityPlaceId,    setCityPlaceId]    = useState(null);
  const [locality,       setLocality]       = useState(searchParams.get('locality')        || '');
  const [specialization, setSpecialization] = useState(searchParams.get('specialization') || 'All');
  const [sort,           setSort]           = useState(searchParams.get('sort')           || 'rating');
  const [specOptions,    setSpecOptions]    = useState(SPECIALIZATIONS);

  const hasFilters = !!(searchParams.get('city') || searchParams.get('specialization') || searchParams.get('locality'));

  // Prefer admin-managed categories when available; silently keep the
  // hardcoded fallback list if the endpoint fails or returns nothing.
  useEffect(() => {
    api.get('/public/categories')
      .then(({ data }) => {
        const names = (data.data?.categories || []).map((c) => c.name);
        if (names.length > 0) setSpecOptions(['All', ...names]);
      })
      .catch(() => {});
  }, []);

  // A `city` query param on initial load is just a name, not a placeId —
  // CitySelect only ever learns a placeId via its onSelectPlace callback,
  // which fires from user interaction, never from a URL. Without this,
  // loading /vendors?city=X&locality=Y shows the city name but leaves
  // LocalitySelect permanently disabled (no placeId to scope its search to)
  // even though the locality filter itself is already applied server-side.
  // Resolved once on mount only — not kept in sync with `city` afterwards,
  // since that would re-resolve on every keystroke as the user types.
  useEffect(() => {
    const initialCity = searchParams.get('city');
    if (!initialCity) return;
    let cancelled = false;
    api.get('/public/places', { params: { q: initialCity, limit: 8 } })
      .then(({ data }) => {
        if (cancelled) return;
        // Exclude locality-fallback pseudo-places (isLocality: true) — their
        // _id refers to a Locality document, not a Place, so using one here
        // would 404 against /public/places/:placeId/localities.
        const places = (data.data?.places || []).filter((p) => !p.isLocality);
        const match = places.find((p) => p.name.toLowerCase() === initialCity.toLowerCase()) || places[0];
        if (match) setCityPlaceId(match._id);
        // No match (bad/stale URL) — leave cityPlaceId null; city/locality
        // text stays as-is and LocalitySelect simply stays disabled.
      })
      .catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city.trim())                                params.set('city', city.trim());
    if (locality.trim())                            params.set('locality', locality.trim());
    if (specialization && specialization !== 'All') params.set('specialization', specialization);
    if (sort && sort !== 'rating')                  params.set('sort', sort);
    router.push('/vendors' + (params.toString() ? '?' + params.toString() : ''));
  };

  const handleClear = () => {
    setCity('');
    setCityPlaceId(null);
    setLocality('');
    setSpecialization('All');
    setSort('rating');
    router.push('/vendors');
  };

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-sm)',
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
          <label style={LABEL_STYLE}><MapPin size={12} />City</label>
          <CitySelect
            value={city}
            onChange={(val) => { setCity(val); setCityPlaceId(null); }}
            onSelectPlace={(place) => setCityPlaceId(place._id)}
            placeholder="Search city..."
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        {/* Locality — optional, appears once a city has been picked from
            the dropdown (a typed-but-unselected city has no known placeId
            to scope the locality search to). */}
        <div style={{ flex: '1 1 160px' }}>
          <label style={LABEL_STYLE}><Navigation size={12} />Locality <span style={{ fontWeight: 400, color: 'var(--color-text-hint)' }}>(optional)</span></label>
          <LocalitySelect
            placeId={cityPlaceId}
            value={locality}
            onChange={(val) => setLocality(val)}
          />
        </div>

        {/* Specialization */}
        <div style={{ flex: '1 1 160px' }}>
          <label style={LABEL_STYLE}><Tag size={12} />Specialization</label>
          <select value={specialization} onChange={(e) => setSpecialization(e.target.value)} style={SELECT_STYLE}>
            {specOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div style={{ flex: '1 1 140px' }}>
          <label style={LABEL_STYLE}><ArrowUpDown size={12} />Sort by</label>
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
