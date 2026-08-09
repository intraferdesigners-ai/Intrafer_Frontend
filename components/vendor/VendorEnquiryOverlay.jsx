'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, User, Phone, Mail, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Honeypot from '@/components/ui/Honeypot';
import useAuthStore from '@/store/authStore';
import { hasEngagedVendor, markVendorEngaged } from '@/lib/session';

// Near-immediate: a long artificial delay here reads as "the site is slow"
// even though no network call is involved in it — this used to be 4000ms,
// which is what visitors were actually reacting to (see the investigation
// in the commit history). A short delay still avoids popping in before the
// page itself has painted, but nothing close to 4s.
const SHOW_DELAY_MS = 400;

// Fields sit borderless inside one grouped, divided container rather than
// each being its own bordered box — same "seamless input inside a shared
// pill" language HeroSearch/CitySelect already use for the homepage search
// bar, reused here instead of inventing a new input style.
//
// The divider between rows is drawn on a plain wrapper div, not on the
// <Input> itself: Input.jsx's own inline style already sets `borderColor`
// on focus/error, and pairing that with a `borderBottom` override here
// triggered React's "don't mix shorthand and non-shorthand border
// properties" warning (borderColor vs borderBottom both touch the bottom
// edge's color). Overriding the same `borderColor` key Input already uses
// avoids the conflict entirely — border width/style still come from its
// existing `.form-input-styled` class, just made invisible.
const fieldStyle = {
  borderColor: 'transparent',
  borderRadius: 0,
  background: 'transparent',
  boxShadow: 'none',
  padding: '12px 14px 12px 38px',
};

export default function VendorEnquiryOverlay({ vendor }) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const [visible, setVisible] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [website, setWebsite] = useState(''); // honeypot — see components/ui/Honeypot.jsx

  const timerRef = useRef(null);
  const vendorId = vendor?._id ? String(vendor._id) : '';
  const vendorOwnerId = vendor?.userId?._id ? String(vendor.userId._id) : '';

  useEffect(() => {
    if (!vendorId) return undefined;
    if (hasEngagedVendor(vendorId)) return undefined;

    let cancelled = false;

    timerRef.current = setTimeout(() => {
      const { role, user } = useAuthStore.getState();

      // Vendor previewing their own listing, or staff/admin — never prompt.
      if (role === 'admin') return;
      if (role === 'vendor' && user?.id && vendorOwnerId && String(user.id) === vendorOwnerId) return;

      // Dedup is localStorage-only now (hasEngagedVendor above) — guest
      // enquiries no longer create a logged-in session to check server-side
      // leads against (see enquiry.controller.js). A returning visitor on a
      // new device/browser will see the overlay again once; that's the
      // accepted trade-off of not requiring an account.
      if (!cancelled) setVisible(true);
    }, SHOW_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(timerRef.current);
    };
  }, [vendorId, vendorOwnerId]);

  // Body-scroll lock while shown, same as QuickEnquiryModal/LeadCapturePopup
  // — consistent with the centered-backdrop treatment those already use.
  useEffect(() => {
    if (visible) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [visible]);

  const dismiss = useCallback((reason) => {
    markVendorEngaged(vendorId, reason);
    setVisible(false);
  }, [vendorId]);

  const handleSubmit = async () => {
    setError('');
    if (!name.trim()) return setError('Please enter your name.');
    if (!/^[6-9]\d{9}$/.test(phone)) return setError('Please enter a valid 10-digit mobile number.');
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email.');

    setLoading(true);
    try {
      const { data } = await api.post('/enquiry/send-otp', { name, email, phone, website });
      sessionStorage.setItem('intrafer_enquiry_draft', JSON.stringify({
        name, email, phone,
        vendorId,
        city: vendor?.location?.city || '',
        requirements: '',
      }));
      markVendorEngaged(vendorId, 'submitted');
      setVisible(false);
      router.push(`/enquiry/verify?pendingId=${data.data.pendingId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (!vendorId) return null;

  return (
    <>
      <style>{`
        /* Same glass language as the card/button — translucent fill instead
           of the solid --bg-parchment block this used to be. Kept more
           opaque than both the card (42%) and the button (50%): this is the
           one piece of the card the visitor stares at and edits character by
           character, so it gets the highest opacity floor of the three glass
           surfaces to keep typed text, placeholders, and icons sharp. The
           card element already blurs whatever is behind it via its own
           blur(28px) — this fill just needs to stay legible sitting on top
           of that, not blur anything itself.
           Fixed white-on-dark instead of the theme-driven var(--bg-parchment)/
           var(--text) — see the card comment below for why. */
        .vendor-enquiry-fields {
          border: 0.5px solid rgba(255,255,255,.16);
          border-radius: var(--r-md);
          background: rgba(255,255,255,.08);
          overflow: hidden;
          transition: border-color 150ms, box-shadow 150ms;
        }
        .vendor-enquiry-fields:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(59,130,246,.12);
        }
        .vendor-enquiry-fields input.form-input-styled {
          color: rgba(255,255,255,.95);
        }
        .vendor-enquiry-fields input.form-input-styled::placeholder {
          color: rgba(255,255,255,.5);
        }
      `}</style>
      <AnimatePresence>
        {visible && (
          <motion.div
            role="presentation"
            onClick={() => dismiss('dismissed')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: 'easeOut' }}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(15,23,42,.45)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '16px',
            }}
          >
            <motion.div
              role="dialog"
              aria-label={`Leave your contact details for ${vendor?.businessName || 'this designer'}`}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96, y: shouldReduceMotion ? 0 : 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.97, y: shouldReduceMotion ? 0 : 6 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: 'easeOut' }}
              style={{
                width: '100%', maxWidth: '360px',
                // Glass card: fixed dark navy (matching the backdrop's own
                // tint) rather than color-mixing the theme's var(--surface),
                // which flips to a light tone in light theme — this card
                // composites over an arbitrary vendor banner photo, not the
                // page's own background, so it can't rely on the site theme
                // to land on a readable result the way a normal modal can.
                // A fixed dark glass + fixed light text (below) holds
                // contrast the same way regardless of theme or of how light
                // or dark the photo underneath happens to be. Nudged up from
                // the 42% this used to blend at (of --surface) to 58% of a
                // guaranteed-dark color, per live testing against real
                // vendor banners — 42% let bright banners wash the text out.
                background: 'rgba(15,23,42,.58)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                border: '0.5px solid rgba(255,255,255,.16)',
                borderRadius: 'var(--r-xl)',
                boxShadow: '0 24px 64px rgba(15,23,42,.28)',
                padding: '24px', position: 'relative',
              }}
            >
              <button
                onClick={() => dismiss('dismissed')}
                aria-label="Close"
                style={{
                  position: 'absolute', top: '14px', right: '14px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '2px', color: 'rgba(255,255,255,.7)',
                  width: '28px', height: '28px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'var(--primary-bg)', border: '1.5px solid var(--primary-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px',
                }}>
                  <ShieldCheck size={18} color="var(--primary)" strokeWidth={1.8} />
                </div>
                {/* Fixed white + a text-shadow (not var(--text), which is
                    dark in light theme and would sit unreadably close to
                    this card's own dark glass) — see the card background
                    comment above. */}
                <h2 style={{
                  fontFamily: 'var(--font-display)', fontSize: '19px', fontWeight: 400,
                  color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,.45)', margin: '0 0 6px',
                }}>
                  Verify your details to connect
                </h2>
                <p style={{
                  fontSize: '12.5px', color: 'rgba(255,255,255,.8)',
                  textShadow: '0 1px 3px rgba(0,0,0,.4)', margin: 0, lineHeight: 1.5,
                }}>
                  {vendor?.businessName || 'This designer'} will reach out once we confirm it&apos;s you — takes 30 seconds.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Honeypot value={website} onChange={(e) => setWebsite(e.target.value)} />
                <div className="vendor-enquiry-fields">
                  <div style={{ borderBottom: '0.5px solid rgba(255,255,255,.14)' }}>
                    <Input
                      icon={User}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      aria-label="Your name"
                      style={fieldStyle}
                      iconColor="rgba(255,255,255,.55)"
                    />
                  </div>
                  <div style={{ borderBottom: '0.5px solid rgba(255,255,255,.14)' }}>
                    <Input
                      icon={Phone}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit phone"
                      inputMode="tel"
                      aria-label="Phone number"
                      style={fieldStyle}
                      iconColor="rgba(255,255,255,.55)"
                    />
                  </div>
                  <Input
                    icon={Mail}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    inputMode="email"
                    aria-label="Email address"
                    style={fieldStyle}
                    iconColor="rgba(255,255,255,.55)"
                  />
                </div>

                {error && (
                  <div style={{
                    background: 'var(--danger-bg)', color: 'var(--danger)',
                    fontSize: '12px', padding: '8px 10px', borderRadius: 'var(--r-md)',
                  }}>
                    {error}
                  </div>
                )}

                <Button
                  variant="primary"
                  size="md"
                  loading={loading}
                  onClick={handleSubmit}
                  style={{
                    width: '100%', marginTop: '2px',
                    // Same glass language as the card itself — tinted fill
                    // + defining border instead of a solid block. Kept a bit
                    // less transparent than the card body (50% vs 42%) since
                    // this carries white button text that needs to stay
                    // legible on its own, not just blend into the glass.
                    background: 'color-mix(in srgb, var(--primary) 50%, transparent)',
                    border: '1px solid var(--primary)',
                    boxShadow: 'none',
                  }}
                >
                  Send my details →
                </Button>

                <button
                  onClick={() => dismiss('dismissed')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '12px', color: 'rgba(255,255,255,.65)',
                    textDecoration: 'underline', textDecorationStyle: 'dotted',
                    textUnderlineOffset: '3px', padding: '2px', alignSelf: 'center',
                  }}
                >
                  I&apos;ll do it later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
