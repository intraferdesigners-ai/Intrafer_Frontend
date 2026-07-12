'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const ROOMS  = ['All', 'Residential', 'Modular Kitchen', 'Living Room', 'Bedroom', 'Bathroom', 'Office Interiors', 'Full Home Interior'];
const STYLES = ['All', 'Modern', 'Scandinavian', 'Traditional', 'Minimalist', 'Bohemian', 'Industrial', 'Luxury', 'Contemporary'];

const HEIGHTS = [240, 300, 260, 320, 280, 340, 250, 310, 270, 290, 330];

function Pill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 16px', borderRadius: '20px', fontSize: '12px',
        fontWeight: 500, cursor: 'pointer',
        transition: 'all 150ms ease-out',
        background: active ? 'var(--primary)' : 'var(--surface)',
        color:      active ? '#fff'           : 'var(--text-mid)',
        border:     active ? 'none'           : '1px solid var(--border)',
        boxShadow:  active ? '0 2px 8px rgba(181,84,30,.25)' : 'none',
      }}
    >
      {label}
    </button>
  );
}

export default function GalleryGrid({ projects }) {
  const [selectedRoom,  setSelectedRoom]  = useState('All');
  const [selectedStyle, setSelectedStyle] = useState('All');

  const filtered = projects.filter((p) => {
    const roomOk  = selectedRoom  === 'All' || p.projectType === selectedRoom;
    const styleOk = selectedStyle === 'All' || p.style        === selectedStyle;
    return roomOk && styleOk;
  });

  return (
    <>
      {/* Filters */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)', padding: '20px 24px',
        boxShadow: 'var(--shadow-sm)', marginBottom: '32px',
      }}>
        <div style={{ marginBottom: '14px' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.12em', color: 'var(--text-hint)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>ROOM</span>
          <div className="scroll-x">
            {ROOMS.map((r) => (
              <Pill key={r} label={r} active={selectedRoom === r} onClick={() => setSelectedRoom(r)} />
            ))}
          </div>
        </div>
        <div>
          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.12em', color: 'var(--text-hint)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>STYLE</span>
          <div className="scroll-x">
            {STYLES.map((s) => (
              <Pill key={s} label={s} active={selectedStyle === s} onClick={() => setSelectedStyle(s)} />
            ))}
          </div>
        </div>
        <div style={{ marginTop: '14px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-hint)' }}>
            {filtered.length} design{filtered.length !== 1 ? 's' : ''}
          </span>
          {(selectedRoom !== 'All' || selectedStyle !== 'All') && (
            <button
              onClick={() => { setSelectedRoom('All'); setSelectedStyle('All'); }}
              style={{ marginLeft: '12px', fontSize: '12px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
            >
              Clear filters ×
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ fontSize: '15px', color: 'var(--text-hint)', marginBottom: '16px' }}>No designs match your filters</p>
          <button
            onClick={() => { setSelectedRoom('All'); setSelectedStyle('All'); }}
            style={{ padding: '10px 20px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="masonry-grid">
          {filtered.map((item, idx) => {
            const h = HEIGHTS[idx % HEIGHTS.length];
            const vendorId = item.vendorId?._id || item.vendorId;
            const vendorName = item.vendorId?.businessName || '';

            return (
              <Link key={item._id || idx} href={`/vendors/${vendorId}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div
                  className="gallery-item"
                  style={{
                    position: 'relative', overflow: 'hidden',
                    borderRadius: 'var(--r-lg)', border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
                    marginBottom: '16px', height: `${h}px`,
                  }}
                >
                  {item.images?.[0] && (
                    <Image
                      src={item.images[0]}
                      alt={item.title || 'Project'}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  )}
                  <div
                    className="gallery-overlay"
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(26,26,24,.52)',
                      display: 'flex', flexDirection: 'column',
                      justifyContent: 'flex-end', padding: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: '#fff', marginBottom: '2px' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.65)' }}>
                          {vendorName ? `by ${vendorName}` : `${item.projectType || ''} · ${item.style || ''}`}
                        </div>
                      </div>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.8)', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                        View designer →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
