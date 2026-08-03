'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import CitySelect from '../ui/CitySelect';
import LocalitySelect from '../ui/LocalitySelect';

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
  const [city,        setCity]        = useState('');
  const [cityPlaceId, setCityPlaceId] = useState(null);
  const [locality,    setLocality]    = useState('');
  const [style,       setStyle]       = useState('Residential');
  const [focused,     setFocused]     = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city)     params.set('city', city);
    if (locality) params.set('locality', locality);
    // Vendors are filtered by `specialization` server-side — `style` here is
    // just the local field name from the hero widget's CITY/STYLE copy.
    if (style)    params.set('specialization', style);
    router.push(`/vendors?${params.toString()}`);
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <div
        className="search-widget-grid"
        // React delegates focus/blur via focusin/focusout, so these fire
        // correctly for focus landing on CitySelect's inner input or the
        // native <select> below, without needing handlers on each field.
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          background: 'var(--surface)',
          border: `1.5px solid ${focused ? 'var(--primary)' : 'var(--border-sub)'}`,
          borderRadius: '32px', overflow: 'hidden',
          display: 'flex', alignItems: 'center', padding: '4px',
          boxShadow: focused
            ? '0 6px 24px rgba(59,130,246,.18), 0 0 0 4px rgba(59,130,246,.1)'
            : 'var(--shadow-sm)',
          transition: 'border-color 220ms ease-out, box-shadow 220ms ease-out',
          position: 'relative',
        }}
      >
        <div style={{ flex: 1, padding: '9px 18px', borderRight: '1px solid var(--border)' }}>
          <div style={LABEL_STYLE}>CITY</div>
          <CitySelect
            value={city}
            onChange={(val) => { setCity(val); setCityPlaceId(null); }}
            onSelectPlace={(place) => setCityPlaceId(place._id)}
            placeholder="Any city"
          />
        </div>

        <div style={{ flex: 1, padding: '9px 18px' }}>
          <div style={LABEL_STYLE}>STYLE</div>
          <select value={style} onChange={(e) => setStyle(e.target.value)} style={SELECT_STYLE}>
            {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <button
          onClick={handleSearch}
          className="search-btn"
          aria-label="Search designers"
          style={{
            width: '44px', height: '44px', flexShrink: 0, margin: '0 2px',
            borderRadius: '50%', background: 'var(--primary)', color: '#fff', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            transition: 'transform 150ms ease-out, background 150ms ease-out',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.06)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {/* Hidden on desktop (icon-only circle); shown on mobile once the
              button goes full-width below the city/style fields — see the
              .search-widget-grid media query in globals.css — so it reads as
              a clear "Search" bar action instead of a stretched bare icon. */}
          <span className="search-btn-label">Search designers</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Area — optional second step, only surfaced once a real Place has
          been resolved (cityPlaceId), since a typed-but-unselected city has
          nothing to scope the locality search to. Rendered as its own row
          below the pill rather than squeezed inline, since the pill's three
          existing slots (city/style/button) are already sized for exactly
          three items on the compact hero widget. */}
      {cityPlaceId && (
        <div
          className="fade-in-up"
          style={{
            marginTop: '10px', background: 'var(--surface)',
            border: '1px solid var(--border-sub)', borderRadius: 'var(--r-md)',
            padding: '9px 18px', boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={LABEL_STYLE}>AREA <span style={{ opacity: 0.7 }}>(optional)</span></div>
          <LocalitySelect
            placeId={cityPlaceId}
            value={locality}
            onChange={setLocality}
            placeholder="e.g. Indiranagar, Koramangala..."
          />
        </div>
      )}
    </div>
  );
}
