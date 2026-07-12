'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Building2, ShieldCheck, Heart } from 'lucide-react';
import QuickEnquiryModal from './QuickEnquiryModal';
import VendorTooltip from './VendorTooltip';
import { getPriceRange } from '@/lib/utils';
import { trackVendorInterest } from '@/lib/trackInterest';

export default function VendorCard({ vendor }) {
  const specs   = vendor.specializations || [];
  const visible = specs.slice(0, 2);
  const extra   = specs.length - 2;
  const city    = vendor.location?.city || vendor.city || 'India';

  const [saved,          setSaved]          = useState(false);
  const [showModal,      setShowModal]      = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [isTouch,        setIsTouch]        = useState(false);
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
      const list    = JSON.parse(localStorage.getItem('intrafer_saved') || '[]');
      const updated = list.includes(vendor._id)
        ? list.filter(id => id !== vendor._id)
        : [...list, vendor._id];
      localStorage.setItem('intrafer_saved', JSON.stringify(updated));
      setSaved(!saved);
    } catch {}
  };

  const handleQuickEnquiry = (e) => {
    e.preventDefault();
    e.stopPropagation();
    trackVendorInterest(vendor._id, 'card');
    setShowModal(true);
  };

  const showTooltip = () => { clearTimeout(tooltipTimeout.current); setTooltipVisible(true); };
  const hideTooltip = () => { tooltipTimeout.current = setTimeout(() => setTooltipVisible(false), 120); };

  const priceRange = getPriceRange(specs);

  return (
    <>
      <div className="vendor-card-hover" style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible',
      }}>
        {/* Image area — outer allows avatar to overflow, inner clips the photo */}
        <Link href={`/vendors/${vendor._id}`} style={{ textDecoration: 'none', display: 'block' }}
          onClick={() => trackVendorInterest(vendor._id, 'card')}>
          <div style={{ position: 'relative', height: '210px', overflow: 'visible' }}>

            {/* Inner image wrapper — clipped to top rounded corners */}
            <div style={{
              height: '210px',
              background: 'var(--bg-cream)',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {vendor.portfolioImages?.[0] ? (
                <Image
                  src={vendor.portfolioImages[0]}
                  alt={vendor.businessName}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <Building2 size={36} color="var(--border-emp)" />
              )}

              {vendor.isFeatured && (
                <span style={{
                  position: 'absolute', top: '10px', left: '10px',
                  background: 'var(--primary)', color: '#fff',
                  fontSize: '9px', fontWeight: 600, padding: '3px 8px',
                  borderRadius: 4, letterSpacing: '.04em', zIndex: 2,
                }}>
                  FEATURED
                </span>
              )}
              {!vendor.isFeatured && specs[0] && (
                <span className="vendor-img-badge" style={{
                  position: 'absolute', top: '10px', left: '10px',
                  borderRadius: 'var(--r-xs)', padding: '4px 10px',
                  fontSize: '10px', fontWeight: 600, letterSpacing: '.04em',
                  zIndex: 1,
                }}>
                  {specs[0].toUpperCase()}
                </span>
              )}

              {/* Save button */}
              <button
                onClick={toggleSave}
                className={`save-btn${saved ? ' saved' : ''}`}
                style={{
                  position: 'absolute', top: '10px', right: '10px',
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'rgba(255,255,255,.9)', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', zIndex: 2,
                }}
                aria-label={saved ? 'Remove from saved' : 'Save designer'}
              >
                <Heart
                  size={16}
                  fill={saved ? '#E24B4A' : 'none'}
                  color={saved ? '#E24B4A' : '#666'}
                />
              </button>
            </div>

            {/* Circular avatar — overlaps bottom of image into card body */}
            <div
              style={{ position: 'absolute', bottom: '-28px', left: '16px', zIndex: 2 }}
              onMouseEnter={!isTouch ? showTooltip : undefined}
              onMouseLeave={!isTouch ? hideTooltip : undefined}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                border: '3px solid var(--surface)',
                overflow: 'hidden',
                background: 'var(--primary-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(15,23,42,.15)',
                cursor: 'pointer',
              }}>
                {vendor.profilePhoto ? (
                  <Image
                    src={vendor.profilePhoto}
                    alt={vendor.businessName}
                    width={56}
                    height={56}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                ) : (
                  <span style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    fontFamily: 'var(--font-ui)',
                    letterSpacing: '-0.02em',
                  }}>
                    {vendor.businessName?.charAt(0) || 'I'}
                  </span>
                )}
              </div>

              {!isTouch && <VendorTooltip vendor={vendor} visible={tooltipVisible} />}
            </div>

          </div>
        </Link>

        {/* Body — extra top padding clears the avatar overlap */}
        <div style={{ padding: '36px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Link href={`/vendors/${vendor._id}`} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
              <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)', margin: 0 }}>
                {vendor.businessName}
              </p>
              {vendor.isApproved && (
                <ShieldCheck size={13} color="var(--success)" />
              )}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '12px', color: 'var(--text-hint)', marginBottom: '10px',
            }}>
              <MapPin size={11} />
              {city}
            </div>
          </Link>

          {specs.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px' }}>
              {visible.map((s) => (
                <span key={s} className="spec-pill">{s}</span>
              ))}
              {extra > 0 && <span className="spec-pill">+{extra}</span>}
            </div>
          )}

          {/* Footer row */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderTop: '1px solid var(--border)', paddingTop: '11px', marginTop: 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {vendor.rating > 0 ? (
                <>
                  <span style={{ color: 'var(--primary)', fontSize: '13px' }}>★</span>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)' }}>
                    {Number(vendor.rating).toFixed(1)}
                  </span>
                  {vendor.reviewCount > 0 && (
                    <span style={{ fontSize: '11px', color: 'var(--text-hint)' }}>
                      ({vendor.reviewCount})
                    </span>
                  )}
                </>
              ) : (
                <span style={{ fontSize: '11px', color: 'var(--text-hint)' }}>New</span>
              )}
              {priceRange && (
                <span style={{
                  fontSize: '11px', fontWeight: 600, color: 'var(--primary)',
                  letterSpacing: '.04em', marginLeft: '6px',
                  padding: '2px 6px', background: 'var(--primary-bg)', borderRadius: '4px',
                }}>
                  {priceRange}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <Link href={`/vendors/${vendor._id}`} onClick={e => e.stopPropagation()}>
                <button style={{
                  padding: '6px 12px', borderRadius: 'var(--r-sm)',
                  background: 'var(--surface)', color: 'var(--text-sub)',
                  border: '1px solid var(--border)', fontSize: '12px',
                  fontWeight: 500, cursor: 'pointer',
                }}>
                  Profile
                </button>
              </Link>
              <button
                onClick={handleQuickEnquiry}
                style={{
                  padding: '6px 12px', borderRadius: 'var(--r-sm)',
                  background: 'var(--primary)', color: '#fff',
                  border: 'none', fontSize: '12px',
                  fontWeight: 500, cursor: 'pointer',
                }}
              >
                Get quote
              </button>
            </div>
          </div>
        </div>
      </div>

      <QuickEnquiryModal
        vendor={vendor}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
