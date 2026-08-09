'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, ShieldCheck, Heart, Scale, Star, ArrowRight } from 'lucide-react';
import QuickEnquiryModal from './QuickEnquiryModal';
import VendorTooltip from './VendorTooltip';
import ProjectImageSlider from './ProjectImageSlider';
import { trackVendorInterest } from '@/lib/trackInterest';
import { useCompare } from '@/context/CompareContext';

// Last-resort fallback when a vendor has neither published project photos
// nor a banner image — a colored initial reads as an intentional identity
// mark (same idea as Slack/Gmail avatars), unlike the old generic Building2
// icon, which looked like a broken image rather than a designed empty state.
function VendorMonogram({ name, size }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--primary)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <span style={{
        fontSize: size * 0.42, fontWeight: 700, color: '#fff',
        fontFamily: 'var(--font-ui)', letterSpacing: '-0.02em',
      }}>
        {name?.charAt(0)?.toUpperCase() || 'I'}
      </span>
    </div>
  );
}

// variant="editorial" (default) — full-bleed photo card used on the public
// browse/discovery surfaces (vendors listing, city/style landing pages,
// similar-designers). variant="compact" keeps the original image-top +
// white-body layout, used only on the account dashboard's saved-designers
// list where the rest of the UI is utilitarian, not editorial.
export default function VendorCard({ vendor, variant = 'editorial' }) {
  const specs   = vendor.specializations || [];
  const visible = specs.slice(0, 2);
  const extra   = specs.length - 2;
  const city    = vendor.location?.city || vendor.city || 'India';
  // vendor.cardImages (see attachCardImages, public.controller.js) already
  // resolves the full fallback chain server-side — project photos, then
  // bannerImage/profilePhoto for vendors with no published projects yet.
  // portfolioImages is a legacy Vendor field nothing writes to anymore,
  // kept only as a last-resort safety net for any caller that skipped
  // attachCardImages.
  const cardImages = vendor.cardImages?.length ? vendor.cardImages : (vendor.portfolioImages || []);

  const [saved,          setSaved]          = useState(false);
  const [showModal,      setShowModal]      = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [isTouch,        setIsTouch]        = useState(false);
  const [savePulse,      setSavePulse]      = useState(false);
  const [hovered,        setHovered]        = useState(false);
  const tooltipTimeout = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const { isSelected, addToCompare, removeFromCompare } = useCompare();
  const compared = isSelected(vendor._id);

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

    if (!shouldReduceMotion) {
      setSavePulse(true);
      setTimeout(() => setSavePulse(false), 260);
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

  if (variant === 'compact') {
    // portfolioImages is the same dead field noted on the editorial variant
    // above (nothing writes to it anymore) — profilePhoto deliberately isn't
    // in this chain: it's a personal headshot, not a project/cover photo,
    // so it's excluded from the card image here the same as it now is from
    // attachCardImages's server-side fallback.
    const compactImage = vendor.portfolioImages?.[0] || vendor.bannerImage || null;
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
                {/* /auth/saved-vendors doesn't run project photos through
                    attachCardImages (see public.controller.js) — the same
                    portfolioImages dead-field issue as the editorial variant,
                    so fall back to bannerImage here too rather than dropping
                    straight to the placeholder. */}
                {compactImage ? (
                  <Image
                    src={compactImage}
                    alt={vendor.businessName}
                    fill
                    className="blog-card-img"
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <VendorMonogram name={vendor.businessName} size={56} />
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
                  <motion.span
                    animate={{ scale: savePulse ? 1.35 : 1 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    style={{ display: 'flex' }}
                  >
                    <Heart
                      size={16}
                      fill={saved ? '#E24B4A' : 'none'}
                      color={saved ? '#E24B4A' : '#666'}
                    />
                  </motion.span>
                </button>

                {/* Compare toggle — pill shape, visually distinct from the round save button */}
                <motion.button
                  onClick={toggleCompare}
                  whileTap={{ scale: shouldReduceMotion ? 1 : 0.93 }}
                  style={{
                    position: 'absolute', top: '48px', right: '10px',
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '5px 9px', borderRadius: '20px',
                    background: compared ? 'var(--primary)' : 'rgba(255,255,255,.9)',
                    color: compared ? '#fff' : '#444',
                    border: 'none', fontSize: '10px', fontWeight: 600,
                    cursor: 'pointer', zIndex: 2, letterSpacing: '.02em',
                    transition: 'background 150ms ease, color 150ms ease',
                  }}
                  aria-label={compared ? 'Remove from compare' : 'Add to compare'}
                >
                  <Scale size={12} />
                  {compared ? 'Comparing' : 'Compare'}
                </motion.button>
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

  // ── Editorial (default) — full-bleed photo card ──────────────────────────
  const showActions = isTouch || hovered;

  return (
    <>
      <Link
        href={`/vendors/${vendor._id}`}
        onClick={() => trackVendorInterest(vendor._id, 'card')}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="vendor-card-hover"
        style={{
          position: 'relative', display: 'block', textDecoration: 'none',
          borderRadius: 'var(--r-xl)', overflow: 'hidden',
          aspectRatio: '3 / 4', boxShadow: 'var(--shadow-sm)',
          // A shadow alone barely reads as a card in dark mode (--shadow-sm
          // there is a near-black rgba(0,0,0,.4) against an already-dark
          // page background) — a visible border, same convention as the
          // shared .card class, is what actually separates the card from
          // the page at rest, regardless of theme.
          border: '1px solid var(--border)',
          background: 'var(--bg-cream)',
        }}
      >
        {/* Photo layer — zooms on hover, same whileHover pattern as StyleGallery.
            cardImages (see attachCardImages in public.controller.js) is
            published-project photos only when any exist — never mixed with
            the banner — falling back to bannerImage alone for vendors with
            no published projects yet, and finally to the monogram below for
            vendors with neither. */}
        <motion.div
          whileHover={{ scale: shouldReduceMotion ? 1 : 1.06 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: 'easeOut' }}
          style={{ position: 'absolute', inset: 0 }}
        >
          {cardImages.length > 0 ? (
            <ProjectImageSlider images={cardImages} alt={vendor.businessName} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <VendorMonogram name={vendor.businessName} size={88} />
            </div>
          )}
        </motion.div>

        {/* Bottom gradient scrim — always on, dark-mode-aware (see .dark rule) */}
        <div aria-hidden="true" className="vendor-card-editorial-scrim" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

        {/* Top-left: featured ribbon + verified glass circle */}
        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
          {vendor.isFeatured && (
            <span style={{
              background: 'var(--primary)', color: '#fff',
              fontSize: 9, fontWeight: 600, padding: '4px 9px',
              borderRadius: 4, letterSpacing: '.04em',
            }}>
              FEATURED
            </span>
          )}
          {vendor.isApproved && (
            <span
              className="vendor-glass-circle"
              title="Verified designer"
              style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ShieldCheck size={14} color="var(--success)" />
            </span>
          )}
        </div>

        {/* Top-right: favorite + compare glass circles — hover-reveal like the
            bottom actions below, rather than always-on, so the resting card
            reads as a clean photo and every actionable control appears
            together on hover/touch. */}
        <motion.div
          initial={false}
          animate={{
            opacity: showActions ? 1 : 0,
            y: showActions ? 0 : (shouldReduceMotion ? 0 : -6),
          }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: 'easeOut' }}
          style={{
            position: 'absolute', top: 12, right: 12, zIndex: 2, display: 'flex', gap: 8,
            pointerEvents: showActions ? 'auto' : 'none',
          }}
        >
          <button
            onClick={toggleSave}
            className="vendor-glass-circle"
            style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            aria-label={saved ? 'Remove from saved' : 'Save designer'}
          >
            <motion.span
              animate={{ scale: savePulse ? 1.35 : 1 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              style={{ display: 'flex' }}
            >
              <Heart size={14} fill={saved ? '#E24B4A' : 'none'} color={saved ? '#E24B4A' : 'currentColor'} />
            </motion.span>
          </button>
          <motion.button
            onClick={toggleCompare}
            whileTap={{ scale: shouldReduceMotion ? 1 : 0.9 }}
            className="vendor-glass-circle"
            style={{
              width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: compared ? 'var(--primary)' : undefined,
              color: compared ? '#fff' : undefined,
            }}
            aria-label={compared ? 'Remove from compare' : 'Add to compare'}
          >
            <Scale size={14} />
          </motion.button>
        </motion.div>

        {/* Bottom info overlay — name, location, rating, tags, all on the photo */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 2, padding: 16 }}>
          {specs.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
              {visible.map((s) => (
                <span key={s} style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: '.03em', color: '#fff',
                  background: 'rgba(255,255,255,.16)', border: '1px solid rgba(255,255,255,.3)',
                  padding: '3px 9px', borderRadius: 20,
                  backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
                }}>
                  {s}
                </span>
              ))}
              {extra > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 600, color: '#fff',
                  background: 'rgba(255,255,255,.16)', border: '1px solid rgba(255,255,255,.3)',
                  padding: '3px 9px', borderRadius: 20,
                }}>
                  +{extra}
                </span>
              )}
            </div>
          )}

          <p style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(19px, 2vw, 23px)',
            fontWeight: 400, color: '#fff', letterSpacing: '-.01em', margin: 0,
          }}>
            {vendor.businessName}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 5, fontSize: 12, color: 'rgba(255,255,255,.85)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <MapPin size={11} />
              {city}
            </span>
            {vendor.rating > 0 ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Star size={11} fill="#FBBF24" color="#FBBF24" />
                {Number(vendor.rating).toFixed(1)}
                {vendor.reviewCount > 0 && (
                  <span style={{ color: 'rgba(255,255,255,.65)' }}>({vendor.reviewCount})</span>
                )}
              </span>
            ) : (
              <span style={{ color: 'rgba(255,255,255,.7)' }}>New</span>
            )}
          </div>

          {/* Hover-reveal actions — always shown on touch (no hover state there) */}
          <motion.div
            initial={false}
            animate={{
              opacity: showActions ? 1 : 0,
              y: showActions ? 0 : (shouldReduceMotion ? 0 : 10),
            }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: 'easeOut' }}
            style={{ display: 'flex', gap: 8, marginTop: 12, pointerEvents: showActions ? 'auto' : 'none' }}
          >
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 20,
              background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.4)',
              color: '#fff', fontSize: 12, fontWeight: 500,
              backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
            }}>
              View profile <ArrowRight size={12} />
            </span>
            <button
              onClick={handleQuickEnquiry}
              style={{
                padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
                background: 'var(--primary)', color: '#fff', fontSize: 12, fontWeight: 500,
              }}
            >
              Get quote
            </button>
          </motion.div>
        </div>
      </Link>

      <QuickEnquiryModal
        vendor={vendor}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
