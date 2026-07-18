'use client'
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import VendorTooltip from '@/components/vendor/VendorTooltip';
import { getPriceRange } from '@/lib/utils';
import { trackVendorInterest } from '@/lib/trackInterest';

export default function VendorCardV2({ vendor }) {
  const specs = vendor.specializations || [];
  const visible = specs.slice(0, 2);
  const extra = specs.length - 2;
  const city = vendor.location?.city || vendor.city || 'India';

  const [saved, setSaved] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const tooltipTimeout = useRef(null);

  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem('intrafer_saved') || '[]');
      setSaved(list.includes(vendor._id));
    } catch {}
  }, [vendor._id]);

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const toggleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const list = JSON.parse(localStorage.getItem('intrafer_saved') || '[]');
      const updated = list.includes(vendor._id)
        ? list.filter(id => id !== vendor._id)
        : [...list, vendor._id];
      localStorage.setItem('intrafer_saved', JSON.stringify(updated));
      setSaved(!saved);
    } catch {}
  };

  const showTooltip = () => { clearTimeout(tooltipTimeout.current); setTooltipVisible(true); };
  const hideTooltip = () => { tooltipTimeout.current = setTimeout(() => setTooltipVisible(false), 120); };

  const priceRange = getPriceRange(specs);

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '14px',
        overflow: 'hidden',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 32px rgba(15,23,42,0.12)' : '0 1px 3px rgba(15,23,42,0.06)',
        transition: 'transform 200ms, box-shadow 200ms',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover */}
      <Link
        href={`/vendors/${vendor._id}`}
        style={{ textDecoration: 'none', display: 'block' }}
        onClick={() => trackVendorInterest(vendor._id, 'card')}
      >
        <div style={{ position: 'relative', height: '160px', overflow: 'visible' }}>
          <div style={{
            height: '160px', position: 'relative', overflow: 'hidden',
            background: '#F1F5F9',
          }}>
            {vendor.portfolioImages?.[0] ? (
              <Image
                src={vendor.portfolioImages[0]}
                alt={vendor.businessName}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width:768px) 100vw, 25vw"
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1', fontSize: '32px' }}>
                🏠
              </div>
            )}

            {specs[0] && (
              <span style={{
                position: 'absolute', top: '10px', left: '10px',
                background: 'rgba(15,23,42,0.7)', color: '#F8F7F4',
                fontSize: '9px', fontWeight: 700, letterSpacing: '.06em',
                padding: '4px 9px', borderRadius: '20px', zIndex: 1,
              }}>
                {specs[0].toUpperCase()}
              </span>
            )}

            <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px', zIndex: 2 }}>
              {vendor.rating > 0 && (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: '3px',
                  background: 'rgba(255,255,255,0.95)', borderRadius: '20px',
                  padding: '4px 9px', fontSize: '11px', fontWeight: 700, color: '#0F172A',
                }}>
                  <span style={{ color: '#3B82F6' }}>★</span>
                  {Number(vendor.rating).toFixed(1)}
                </span>
              )}
              <button
                onClick={toggleSave}
                aria-label={saved ? 'Remove from saved' : 'Save designer'}
                style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.95)', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '14px', color: saved ? '#E24B4A' : '#64748B' }}>
                  {saved ? '♥' : '♡'}
                </span>
              </button>
            </div>
          </div>

          {/* Avatar overlapping */}
          <div
            style={{ position: 'absolute', bottom: '-22px', left: '16px', zIndex: 3 }}
            onMouseEnter={!isTouch ? showTooltip : undefined}
            onMouseLeave={!isTouch ? hideTooltip : undefined}
          >
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              border: '3px solid #FFFFFF', overflow: 'hidden',
              background: '#DBEAFE', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(15,23,42,0.15)',
            }}>
              {vendor.profilePhoto ? (
                <Image src={vendor.profilePhoto} alt={vendor.businessName} width={44} height={44} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
              ) : (
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#3B82F6' }}>
                  {vendor.businessName?.charAt(0) || 'I'}
                </span>
              )}
            </div>
            {!isTouch && <VendorTooltip vendor={vendor} visible={tooltipVisible} />}
          </div>
        </div>
      </Link>

      {/* Body */}
      <div style={{ padding: '28px 16px 16px' }}>
        <Link href={`/vendors/${vendor._id}`} style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>{vendor.businessName}</span>
            {vendor.isApproved && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748B', marginBottom: '10px' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {city}
          </div>
        </Link>

        {specs.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px' }}>
            {visible.map(s => (
              <span key={s} style={{
                fontSize: '10px', fontWeight: 500, color: '#3B82F6',
                background: 'rgba(59,130,246,0.08)', padding: '3px 8px', borderRadius: '20px',
              }}>{s}</span>
            ))}
            {extra > 0 && (
              <span style={{ fontSize: '10px', color: '#94A3B8', padding: '3px 6px' }}>+{extra} more</span>
            )}
          </div>
        )}

        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          borderTop: '1px solid #E2E8F0', paddingTop: '11px', marginBottom: '12px',
        }}>
          {vendor.rating > 0 ? (
            <>
              <span style={{ color: '#3B82F6', fontSize: '13px' }}>★</span>
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#0F172A' }}>{Number(vendor.rating).toFixed(1)}</span>
              {vendor.reviewCount > 0 && (
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>({vendor.reviewCount})</span>
              )}
            </>
          ) : (
            <span style={{ fontSize: '11px', color: '#94A3B8' }}>New</span>
          )}
          {priceRange && (
            <span style={{
              fontSize: '11px', fontWeight: 600, color: '#3B82F6',
              marginLeft: '6px', padding: '2px 6px',
              background: 'rgba(59,130,246,0.08)', borderRadius: '4px',
            }}>{priceRange}</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/vendors/${vendor._id}`} style={{ flex: 1, textDecoration: 'none' }}>
            <button style={{
              width: '100%', padding: '8px', borderRadius: '8px',
              background: 'transparent', color: '#334155',
              border: '1.5px solid #CBD5E1', fontSize: '12px', fontWeight: 500,
              cursor: 'pointer', fontFamily: 'var(--v2-font-ui)',
            }}>Profile</button>
          </Link>
          <Link href={`/enquiry?vendorId=${vendor._id}`} style={{ flex: 1, textDecoration: 'none' }}>
            <button style={{
              width: '100%', padding: '8px', borderRadius: '8px',
              background: '#3B82F6', color: '#FFFFFF',
              border: 'none', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--v2-font-ui)',
            }}>Get quote →</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
