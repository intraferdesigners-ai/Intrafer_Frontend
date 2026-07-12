'use client';
import Image from 'next/image';
import Link from 'next/link';
import { getPriceRange } from '@/lib/utils';

export default function VendorTooltip({ vendor, visible }) {
  if (!visible) return null;

  const priceRange = getPriceRange(vendor.specializations) || '₹₹';

  return (
    <div style={{
      position: 'absolute',
      bottom: 'calc(100% + 12px)',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 50,
      width: '260px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-xl)',
      boxShadow: '0 8px 32px rgba(15,23,42,.16), 0 2px 8px rgba(15,23,42,.08)',
      overflow: 'hidden',
      pointerEvents: 'none',
      animation: 'tooltipIn 180ms cubic-bezier(.34,1.56,.64,1) forwards',
    }}>

      {/* Cover strip */}
      <div style={{
        height: '80px',
        position: 'relative',
        background: 'var(--primary-bg)',
        overflow: 'hidden',
      }}>
        {vendor.portfolioImages?.[0] && (
          <Image
            src={vendor.portfolioImages[0]}
            alt=""
            fill
            style={{ objectFit: 'cover', opacity: 0.7 }}
            sizes="260px"
          />
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 30%, rgba(15,23,42,.5) 100%)',
        }} />
        {/* Rating badge */}
        <div style={{
          position: 'absolute', top: '8px', right: '8px',
          background: 'rgba(255,255,255,.95)',
          borderRadius: '20px', padding: '3px 8px',
          display: 'flex', alignItems: 'center', gap: '3px',
          fontSize: '11px', fontWeight: 700, color: '#0F172A',
        }}>
          <span style={{ color: '#F59E0B', fontSize: '12px' }}>★</span>
          {vendor.rating > 0 ? Number(vendor.rating).toFixed(1) : 'New'}
        </div>
      </div>

      {/* Mini avatar overlapping cover */}
      <div style={{ padding: '0 14px', marginTop: '-20px', marginBottom: 0, position: 'relative', zIndex: 2 }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          border: '2.5px solid var(--surface)',
          background: 'var(--primary-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,.15)',
        }}>
          {vendor.profilePhoto ? (
            <Image
              src={vendor.profilePhoto}
              alt={vendor.businessName}
              width={40}
              height={40}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          ) : (
            <span style={{
              fontSize: '16px', fontWeight: 700,
              color: 'var(--primary)', fontFamily: 'var(--font-display)',
            }}>
              {vendor.businessName?.charAt(0) || 'I'}
            </span>
          )}
        </div>
      </div>

      {/* Main content */}
      <div style={{ padding: '8px 14px 14px' }}>

        {/* Name + verified */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <span style={{
            fontSize: '14px', fontWeight: 600, color: 'var(--text)',
            fontFamily: 'var(--font-display)', lineHeight: 1.2,
          }}>
            {vendor.businessName}
          </span>
          {vendor.isApproved && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          )}
        </div>

        {/* Location */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          fontSize: '12px', color: 'var(--text-hint)', marginBottom: '10px',
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {vendor.location?.city}, {vendor.location?.state}
        </div>

        {/* Stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
          gap: '4px', marginBottom: '12px',
          background: 'var(--bg-parchment)',
          borderRadius: 'var(--r-md)', padding: '8px',
        }}>
          {[
            { label: 'Rating',   value: vendor.rating > 0 ? `${Number(vendor.rating).toFixed(1)}★` : '—' },
            { label: 'Reviews',  value: vendor.reviewCount || 0 },
            { label: 'Price',    value: priceRange },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-hint)', marginTop: '3px', letterSpacing: '.03em' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Specialization pills */}
        {vendor.specializations?.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {vendor.specializations.slice(0, 3).map(spec => (
              <span key={spec} style={{
                fontSize: '10px', fontWeight: 500,
                background: 'var(--primary-bg)', color: 'var(--primary)',
                padding: '3px 7px', borderRadius: '20px',
                border: '1px solid var(--primary-light)',
              }}>{spec}</span>
            ))}
            {vendor.specializations.length > 3 && (
              <span style={{ fontSize: '10px', color: 'var(--text-hint)', padding: '3px 6px' }}>
                +{vendor.specializations.length - 3} more
              </span>
            )}
          </div>
        )}

        <div style={{ height: '1px', background: 'var(--border)', marginBottom: '10px' }} />

        {/* Description — 2 lines clamped */}
        {vendor.description && (
          <p style={{
            fontSize: '11.5px', color: 'var(--text-mid)',
            lineHeight: 1.6, margin: '0 0 12px',
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {vendor.description}
          </p>
        )}

        {/* CTA */}
        <Link
          href={`/vendors/${vendor._id}`}
          style={{
            display: 'block', textAlign: 'center',
            background: 'var(--primary)', color: '#fff',
            borderRadius: 'var(--r-md)', padding: '8px',
            fontSize: '12px', fontWeight: 600,
            textDecoration: 'none',
            pointerEvents: 'all',
          }}
        >
          View full profile →
        </Link>
      </div>

      {/* Downward arrow pointing to avatar */}
      <div style={{
        position: 'absolute',
        bottom: '-6px',
        left: '50%',
        width: '12px', height: '12px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderTop: 'none', borderLeft: 'none',
        transform: 'translateX(-50%) rotate(45deg)',
      }} />
    </div>
  );
}
