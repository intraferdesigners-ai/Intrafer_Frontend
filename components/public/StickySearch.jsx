'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import CitySelect from '../ui/CitySelect';
import LocalitySelect from '../ui/LocalitySelect';

export default function StickySearch() {
  const router = useRouter();
  const [city,        setCity]        = useState('');
  const [cityPlaceId, setCityPlaceId] = useState(null);
  const [locality,    setLocality]    = useState('');
  const [isStuck,     setIsStuck]     = useState(false);

  useEffect(() => {
    const onScroll = () => setIsStuck(window.scrollY > 520);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!isStuck) return null;

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city)     params.set('city', city);
    if (locality) params.set('locality', locality);
    router.push('/vendors' + (params.toString() ? `?${params.toString()}` : ''));
  };

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

      <div style={{ flex: 1, maxWidth: '600px', margin: '0 auto', minWidth: 0 }}>
        <div style={{ display: 'flex', gap: '8px', minWidth: 0, alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <CitySelect
              value={city}
              onChange={(val) => { setCity(val); setCityPlaceId(null); }}
              onSelectPlace={(place) => setCityPlaceId(place._id)}
              placeholder="City — e.g. Bangalore"
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              compact={true}
              endpoint="/public/vendor-cities"
            />
          </div>
          {/* Area — optional, only shown once a real Place has been resolved
              (cityPlaceId). Kept inline here (unlike the hero widget's
              second row) since this bar's own row is already the whole
              widget — a second fixed row would need its own height/offset
              bookkeeping for no real benefit at this width. */}
          {cityPlaceId && (
            <div className="fade-in-up" style={{ flex: 1, minWidth: 0 }}>
              <LocalitySelect
                placeId={cityPlaceId}
                value={locality}
                onChange={setLocality}
                placeholder="Area (optional)..."
                compact={true}
              />
            </div>
          )}
          <button
            onClick={handleSearch}
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
      </div>

      <a href="/vendors" style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 500, whiteSpace: 'nowrap', textDecoration: 'none' }}
        className="hide-mobile">
        Browse all →
      </a>
    </div>
  );
}
