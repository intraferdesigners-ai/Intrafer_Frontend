'use client';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../lib/api';

const DEBOUNCE_MS = 300;

// `endpoint` defaults to the full ~740-place taxonomy (/public/places) — the
// vendors-page filter and the vendor-profile location picker both rely on
// searching that complete dataset. The homepage/sticky search widgets pass
// `/public/vendor-cities` instead, which returns only cities at least one
// live vendor actually serves (see place.controller.js's searchVendorCities)
// — the "no zero-result cities suggested at the door" pivot. Both endpoints
// return the same { places: [{_id, name, state}] } shape, so this is a
// drop-in swap with no other changes needed here.
// seamless — strips the input's own border/background so it blends
// directly into a parent pill container (e.g. HeroSearch's combined
// city-dropdown-plus-search-button bar) instead of reading as a separate
// boxed field floating inside another box. The parent's own border/focus
// ring carries the "this is one control" affordance instead.
export default function CitySelect({ value, onChange, onSelectPlace, placeholder, onKeyDown, compact = false, seamless = false, endpoint = '/public/places' }) {
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

  // Server-side search-as-you-type against `endpoint` (debounced, with
  // stale-response protection since requests can resolve out of order).
  useEffect(() => {
    if (!open) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const thisRequestId = ++requestIdRef.current;
      setLoading(true);
      api.get(endpoint, { params: { q: search, limit: 8 } })
        .then(({ data }) => {
          if (thisRequestId !== requestIdRef.current) return; // stale
          setResults(data.data?.places || []);
        })
        .catch(() => {
          if (thisRequestId === requestIdRef.current) setResults([]);
        })
        .finally(() => {
          if (thisRequestId === requestIdRef.current) setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [search, open, endpoint]);

  // Sync with parent value
  useEffect(() => { setInputVal(value || ''); }, [value]);

  const handleSelect = (place) => {
    setInputVal(place.name);
    onChange(place.name);
    onSelectPlace?.(place);
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
    if (!seamless) e.target.style.borderColor = 'var(--primary)';
  };

  const handleInputBlur = (e) => {
    if (!seamless) e.target.style.borderColor = 'var(--border)';
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
            background: seamless ? 'transparent' : 'var(--bg-parchment)',
            border: seamless ? 'none' : '1.5px solid var(--border)',
            borderRadius: seamless ? 0 : 'var(--r-md)',
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
      {open && dropdownStyle && (results.length > 0 || loading) && createPortal(
        <div ref={dropdownRef} style={{
          ...dropdownStyle,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1000,
          overflowY: 'auto',
        }}>
          {loading && results.length === 0 && (
            <div style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-hint)' }}>
              Searching...
            </div>
          )}
          {results.map(place => (
            <div
              key={place._id}
              onMouseDown={() => handleSelect(place)}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                color: place.name === inputVal ? 'var(--primary)' : 'var(--text)',
                fontWeight: place.name === inputVal ? 600 : 400,
                background: place.name === inputVal
                  ? 'var(--primary-bg)' : 'transparent',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center',
                gap: '8px',
                transition: 'background 100ms',
              }}
              onMouseEnter={e => {
                if (place.name !== inputVal)
                  e.currentTarget.style.background = 'var(--bg-parchment)';
              }}
              onMouseLeave={e => {
                if (place.name !== inputVal)
                  e.currentTarget.style.background = 'transparent';
              }}
            >
              {place.name === inputVal && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="var(--primary)" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
              <span style={{ flex: 1 }}>{place.name}</span>
              {place.state && (
                <span style={{ fontSize: '12px', color: 'var(--text-hint)' }}>{place.state}</span>
              )}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
