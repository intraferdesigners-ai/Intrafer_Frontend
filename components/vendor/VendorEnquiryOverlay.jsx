'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, User, Phone, Mail, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
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

  const timerRef = useRef(null);
  const vendorId = vendor?._id ? String(vendor._id) : '';
  const vendorOwnerId = vendor?.userId?._id ? String(vendor.userId._id) : '';

  useEffect(() => {
    if (!vendorId) return undefined;
    if (hasEngagedVendor(vendorId)) return undefined;

    let cancelled = false;

    timerRef.current = setTimeout(async () => {
      const { role, user } = useAuthStore.getState();

      // Vendor previewing their own listing, or staff/admin — never prompt.
      if (role === 'admin') return;
      if (role === 'vendor' && user?.id && vendorOwnerId && String(user.id) === vendorOwnerId) return;

      // Logged-in homeowner who has already enquired with this vendor —
      // check the server (covers a returning visitor on a new device/browser
      // where the local "engaged" flag wouldn't exist yet).
      if (role === 'user' && user?.id) {
        try {
          const { data } = await api.get('/leads/user');
          const already = (data?.data?.leads || []).some(
            (lead) => String(lead.vendorId?._id || lead.vendorId) === vendorId
          );
          if (already) {
            markVendorEngaged(vendorId, 'existing-lead');
            return;
          }
        } catch {
          // If the check fails, fall through and show the overlay anyway —
          // worst case a homeowner who already enquired sees one extra prompt.
        }
      }

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
      const { data } = await api.post('/auth/send-otp', { name, email, phone });
      sessionStorage.setItem('intrafer_enquiry_draft', JSON.stringify({
        name, email, phone,
        vendorId,
        city: vendor?.location?.city || '',
        requirements: '',
      }));
      markVendorEngaged(vendorId, 'submitted');
      setVisible(false);
      router.push(`/enquiry/verify?userId=${data.data.userId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (!vendorId) return null;

  return (
    <>
      <style>{`
        .vendor-enquiry-fields {
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          background: var(--bg-parchment);
          overflow: hidden;
          transition: border-color 150ms, box-shadow 150ms;
        }
        .vendor-enquiry-fields:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(59,130,246,.12);
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
              background: 'rgba(15,23,42,.4)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
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
                background: 'color-mix(in srgb, var(--surface) 97%, transparent)',
                border: '1px solid var(--border)',
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
                  padding: '2px', color: 'var(--text-hint)',
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
                <h2 style={{
                  fontFamily: 'var(--font-display)', fontSize: '19px', fontWeight: 400,
                  color: 'var(--text)', margin: '0 0 6px',
                }}>
                  Verify your details to connect
                </h2>
                <p style={{ fontSize: '12.5px', color: 'var(--text-hint)', margin: 0, lineHeight: 1.5 }}>
                  {vendor?.businessName || 'This designer'} will reach out once we confirm it&apos;s you — takes 30 seconds.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="vendor-enquiry-fields">
                  <div style={{ borderBottom: '1px solid var(--border)' }}>
                    <Input
                      icon={User}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      aria-label="Your name"
                      style={fieldStyle}
                    />
                  </div>
                  <div style={{ borderBottom: '1px solid var(--border)' }}>
                    <Input
                      icon={Phone}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit phone"
                      inputMode="tel"
                      aria-label="Phone number"
                      style={fieldStyle}
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
                  style={{ width: '100%', marginTop: '2px' }}
                >
                  Send my details →
                </Button>

                <button
                  onClick={() => dismiss('dismissed')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '12px', color: 'var(--text-hint)',
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
