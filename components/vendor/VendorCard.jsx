'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { MapPin, Building2, ShieldCheck, Heart, Scale } from 'lucide-react';
import QuickEnquiryModal from './QuickEnquiryModal';
import VendorTooltip from './VendorTooltip';
import { getPriceRange } from '@/lib/utils';
import { trackVendorInterest } from '@/lib/trackInterest';
import { isAuthenticated } from '@/lib/auth';
import api from '@/lib/api';
import { useCompare } from '@/context/CompareContext';

// Shared across every VendorCard instance on a page so the logged-in user's
// saved-vendor list is fetched once per page load, not once per card.
let savedIdsCache = null;
let savedIdsPromise = null;

function fetchSavedVendorIds() {
  if (savedIdsCache) return Promise.resolve(savedIdsCache);
  if (!savedIdsPromise) {
    savedIdsPromise = api.get('/auth/saved-vendors')
      .then(({ data }) => {
        const ids = new Set((data.data?.vendors || []).map((v) => v._id));
        savedIdsCache = ids;
        return ids;
      })
      .catch(() => {
        savedIdsPromise = null;
        return new Set();
      });
  }
  return savedIdsPromise;
}

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

  const { isSelected, addToCompare, removeFromCompare } = useCompare();
  const compared = isSelected(vendor._id);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchSavedVendorIds().then((ids) => setSaved(ids.has(vendor._id)));
      return;
    }
    try {
      const list = JSON.parse(localStorage.getItem('intrafer_saved') || '[]');
      setSaved(list.includes(vendor._id));
    } catch {}
  }, [vendor._id]);

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const toggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAuthenticated()) {
      const next = !saved;
      setSaved(next); // optimistic
      try {
        if (next) {
          await api.post(`/auth/saved-vendors/${vendor._id}`);
          savedIdsCache?.add(vendor._id);
        } else {
          await api.delete(`/auth/saved-vendors/${vendor._id}`);
          savedIdsCache?.delete(vendor._id);
        }
      } catch {
        setSaved(!next); // revert on failure
      }
      return;
    }

    try {
      const list    = JSON.parse(localStorage.getItem('intrafer_saved') || '[]');
      const updated = list.includes(vendor._id)
        ? list.filter(id => id !== vendor._id)
        : [...list, vendor._id];
      localStorage.setItem('intrafer_saved', JSON.stringify(updated));
      setSaved(!saved);
    } catch {}
  };

  const toggleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (compared) {
      removeFromCompare(vendor._id);
      return;
    }
    const added = addToCompare(vendor._id);
    if (!added) {
      toast.error('You can compare up to 4 designers at a time');
    }
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

              {/* Compare toggle — pill shape, visually distinct from the round save button */}
              <button
                onClick={toggleCompare}
                style={{
                  position: 'absolute', top: '48px', right: '10px',
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '5px 9px', borderRadius: '20px',
                  background: compared ? 'var(--primary)' : 'rgba(255,255,255,.9)',
                  color: compared ? '#fff' : '#444',
                  border: 'none', fontSize: '10px', fontWeight: 600,
                  cursor: 'pointer', zIndex: 2, letterSpacing: '.02em',
                }}
                aria-label={compared ? 'Remove from compare' : 'Add to compare'}
              >
                <Scale size={12} />
                {compared ? 'Comparing' : 'Compare'}
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
                <Link
                  href={`/vendors/${vendor._id}#reviews`}
                  onClick={e => e.stopPropagation()}
                  className="rating-link"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span style={{ color: 'var(--primary)', fontSize: '13px' }}>★</span>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)' }}>
                    {Number(vendor.rating).toFixed(1)}
                  </span>
                  {vendor.reviewCount > 0 && (
                    <span style={{ fontSize: '11px', color: 'var(--text-hint)' }}>
                      ({vendor.reviewCount})
                    </span>
                  )}
                </Link>
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
