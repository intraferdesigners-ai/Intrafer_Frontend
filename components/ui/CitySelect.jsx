'use client';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../lib/api';

const INDIAN_CITIES = [
  'Agra', 'Ahmedabad', 'Ajmer', 'Aligarh', 'Allahabad',
  'Amravati', 'Amritsar', 'Aurangabad',
  'Bangalore', 'Bareilly', 'Bhopal', 'Bhubaneswar',
  'Chandigarh', 'Chennai', 'Coimbatore',
  'Dehradun', 'Delhi NCR',
  'Faridabad', 'Ghaziabad', 'Goa', 'Gurugram',
  'Guwahati', 'Gwalior',
  'Howrah', 'Hubli', 'Hyderabad',
  'Indore', 'Jabalpur', 'Jaipur', 'Jalandhar',
  'Jammu', 'Jodhpur',
  'Kanpur', 'Kochi', 'Kolkata', 'Kozhikode',
  'Lucknow', 'Ludhiana',
  'Madurai', 'Mangalore', 'Meerut', 'Mumbai', 'Mysore',
  'Nagpur', 'Nashik', 'Navi Mumbai', 'Noida',
  'Patna', 'Pune',
  'Raipur', 'Rajkot', 'Ranchi',
  'Srinagar', 'Surat',
  'Thane', 'Thiruvananthapuram', 'Tiruchirappalli',
  'Udaipur',
  'Vadodara', 'Varanasi', 'Vijayawada', 'Visakhapatnam',
  'Other',
];

export default function CitySelect({ value, onChange, placeholder, onKeyDown, compact = false }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [inputVal, setInputVal] = useState(value || '');
  const [cities, setCities] = useState(INDIAN_CITIES);
  const [dropdownStyle, setDropdownStyle] = useState(null);
  const wrapRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close on outside click — check both the input wrapper and the portaled
  // dropdown, since the dropdown no longer lives inside wrapRef in the DOM.
  useEffect(() => {
    const handler = (e) => {
      if (
        wrapRef.current && !wrapRef.current.contains(e.target) &&
        (!dropdownRef.current || !dropdownRef.current.contains(e.target))
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Position the dropdown (rendered in a portal so it can't be clipped by an
  // ancestor's overflow:hidden) against the input's live viewport position,
  // flipping upward when there isn't room below.
  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      if (!wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const maxListHeight = 220;
      const gap = 4;
      const margin = 8;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openUp = spaceBelow < maxListHeight + gap && spaceAbove > spaceBelow;

      setDropdownStyle({
        position: 'fixed',
        left: rect.left,
        width: rect.width,
        maxHeight: Math.max(0, Math.min(maxListHeight, (openUp ? spaceAbove : spaceBelow) - gap - margin)),
        ...(openUp
          ? { bottom: window.innerHeight - rect.top + gap }
          : { top: rect.bottom + gap }),
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open]);

  // Prefer admin-managed cities when available; silently keep the hardcoded
  // fallback list if the endpoint fails or returns nothing.
  useEffect(() => {
    api.get('/public/cities')
      .then(({ data }) => {
        const names = (data.data?.cities || []).map((c) => c.name);
        if (names.length > 0) setCities(names);
      })
      .catch(() => {});
  }, []);

  // Sync with parent value
  useEffect(() => { setInputVal(value || ''); }, [value]);

  const filtered = cities.filter(c =>
    c.toLowerCase().startsWith(search.toLowerCase())
  ).concat(
    cities.filter(c =>
      !c.toLowerCase().startsWith(search.toLowerCase()) &&
      c.toLowerCase().includes(search.toLowerCase())
    )
  ).slice(0, 8);

  const handleSelect = (city) => {
    setInputVal(city);
    onChange(city);
    setSearch('');
    setOpen(false);
  };

  const handleInputChange = (e) => {
    setInputVal(e.target.value);
    setSearch(e.target.value);
    setOpen(true);
    // Allow custom city entry
    onChange(e.target.value);
  };

  const handleInputFocus = (e) => {
    setSearch('');
    setOpen(true);
    e.target.style.borderColor = 'var(--primary)';
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = 'var(--border)';
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      {/* Input */}
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', left: '14px', top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-hint)', pointerEvents: 'none',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <input
          type="text"
          value={inputVal}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={onKeyDown}
          placeholder={placeholder || 'Search city...'}
          autoComplete="off"
          style={{
            width: '100%', height: compact ? '38px' : '48px',
            padding: '0 40px 0 42px',
            background: 'var(--bg-parchment)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--r-md)',
            fontSize: compact ? '14px' : '15px', color: 'var(--text)',
            outline: 'none',
            transition: 'border-color 150ms',
            boxSizing: 'border-box',
          }}
        />
        {/* Chevron */}
        <div style={{
          position: 'absolute', right: '14px', top: '50%',
          transform: `translateY(-50%) rotate(${open ? '180deg' : '0'})`,
          color: 'var(--text-hint)', pointerEvents: 'none',
          transition: 'transform 200ms',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      {/* Dropdown — portaled to document.body so it can't be clipped by an
          ancestor's overflow:hidden (e.g. the rounded search-widget pill) */}
      {open && filtered.length > 0 && dropdownStyle && createPortal(
        <div ref={dropdownRef} style={{
          ...dropdownStyle,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1000,
          overflowY: 'auto',
        }}>
          {filtered.map(city => (
            <div
              key={city}
              onMouseDown={() => handleSelect(city)}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                color: city === inputVal ? 'var(--primary)' : 'var(--text)',
                fontWeight: city === inputVal ? 600 : 400,
                background: city === inputVal
                  ? 'var(--primary-bg)' : 'transparent',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center',
                gap: '8px',
                transition: 'background 100ms',
              }}
              onMouseEnter={e => {
                if (city !== inputVal)
                  e.currentTarget.style.background = 'var(--bg-parchment)';
              }}
              onMouseLeave={e => {
                if (city !== inputVal)
                  e.currentTarget.style.background = 'transparent';
              }}
            >
              {city === inputVal && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="var(--primary)" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
              {city}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
