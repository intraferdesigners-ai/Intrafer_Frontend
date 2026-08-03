'use client';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../lib/api';

const DEBOUNCE_MS = 300;

// Secondary, optional step after a city is chosen via CitySelect — searches
// that city's localities (individual post-office/area names, e.g. "Dwarka",
// "Rohini" under Delhi). Disabled until a placeId is provided. Shares
// CitySelect's portal + flip-up positioning approach so it isn't clipped by
// the same kinds of overflow:hidden ancestors.
export default function LocalitySelect({ placeId, value, onChange, placeholder, compact = false }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [inputVal, setInputVal] = useState(value || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState(null);
  const wrapRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);

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

  useEffect(() => {
    if (!open || !placeId) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const thisRequestId = ++requestIdRef.current;
      setLoading(true);
      api.get(`/public/places/${placeId}/localities`, { params: { q: search, limit: 8 } })
        .then(({ data }) => {
          if (thisRequestId !== requestIdRef.current) return;
          setResults(data.data?.localities || []);
        })
        .catch(() => {
          if (thisRequestId === requestIdRef.current) setResults([]);
        })
        .finally(() => {
          if (thisRequestId === requestIdRef.current) setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [search, open, placeId]);

  useEffect(() => { setInputVal(value || ''); }, [value]);

  // Selecting a new city invalidates whatever locality was picked for the
  // previous one — but only a genuine *switch* (a real placeId giving way to
  // a different one, or to none). A placeId going from null to a real value
  // is city being established for the *first* time, not a switch: while
  // placeId was null this input was disabled, so nothing could have set
  // `value` interactively — the only way it's non-empty at that point is a
  // pre-filled value from the parent (e.g. hydrating from a ?locality= URL
  // param once the city's placeId resolves), which must not be wiped out
  // here right as it becomes usable.
  const prevPlaceIdRef = useRef(placeId);
  useEffect(() => {
    if (prevPlaceIdRef.current) {
      setInputVal('');
      onChange?.('');
    }
    prevPlaceIdRef.current = placeId;
  }, [placeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (locality) => {
    setInputVal(locality.name);
    onChange(locality.name);
    setSearch('');
    setOpen(false);
  };

  const handleInputChange = (e) => {
    setInputVal(e.target.value);
    setSearch(e.target.value);
    setOpen(true);
    onChange(e.target.value);
  };

  const disabled = !placeId;

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={inputVal}
        onChange={handleInputChange}
        onFocus={() => { setSearch(''); setOpen(true); }}
        disabled={disabled}
        placeholder={disabled ? 'Choose a city first' : (placeholder || 'Search locality (optional)...')}
        autoComplete="off"
        style={{
          width: '100%', padding: compact ? '9px 12px' : '10px 14px',
          fontSize: compact ? 13 : 14,
          background: disabled ? 'var(--color-surface-alt)' : 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-text)', outline: 'none',
          cursor: disabled ? 'not-allowed' : 'text',
          boxSizing: 'border-box',
        }}
      />

      {open && !disabled && dropdownStyle && (results.length > 0 || loading) && createPortal(
        <div ref={dropdownRef} style={{
          ...dropdownStyle,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1000,
          overflowY: 'auto',
        }}>
          {loading && results.length === 0 && (
            <div style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-text-hint)' }}>
              Searching...
            </div>
          )}
          {results.map(locality => (
            <div
              key={locality._id}
              onMouseDown={() => handleSelect(locality)}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                color: locality.name === inputVal ? 'var(--color-primary)' : 'var(--color-text)',
                fontWeight: locality.name === inputVal ? 600 : 400,
                background: locality.name === inputVal ? 'var(--color-primary-bg)' : 'transparent',
                borderBottom: '1px solid var(--color-border)',
              }}
              onMouseEnter={e => {
                if (locality.name !== inputVal)
                  e.currentTarget.style.background = 'var(--color-surface-alt)';
              }}
              onMouseLeave={e => {
                if (locality.name !== inputVal)
                  e.currentTarget.style.background = 'transparent';
              }}
            >
              {locality.name}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
