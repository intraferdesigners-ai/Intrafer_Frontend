'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, User, Phone, Mail } from 'lucide-react';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import useAuthStore from '@/store/authStore';
import { hasEngagedVendor, markVendorEngaged } from '@/lib/session';

const SHOW_DELAY_MS = 4000;

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
        .vendor-enquiry-overlay {
          position: fixed;
          right: 20px;
          bottom: 20px;
          z-index: 150;
          width: 340px;
          max-width: calc(100vw - 40px);
        }
        @media (max-width: 640px) {
          .vendor-enquiry-overlay {
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            max-width: 100%;
            padding: 0 12px max(12px, env(safe-area-inset-bottom));
            box-sizing: border-box;
          }
        }
      `}</style>
      <AnimatePresence>
        {visible && (
          <motion.div
            className="vendor-enquiry-overlay"
            role="dialog"
            aria-label={`Leave your contact details for ${vendor?.businessName || 'this designer'}`}
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.32, ease: 'easeOut' }}
            style={{
              background: 'color-mix(in srgb, var(--surface) 90%, transparent)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              boxShadow: '0 12px 32px rgba(15,23,42,.18)',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
              <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: 0, lineHeight: 1.4 }}>
                Interested in {vendor?.businessName || 'this designer'}? Leave your details and they&apos;ll reach out.
              </p>
              <button
                onClick={() => dismiss('dismissed')}
                aria-label="Close"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
                  padding: '2px', color: 'var(--text-hint)',
                  width: '24px', height: '24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Input
                icon={User}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                aria-label="Your name"
              />
              <Input
                icon={Phone}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit phone"
                inputMode="tel"
                aria-label="Phone number"
              />
              <Input
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                inputMode="email"
                aria-label="Email address"
              />

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
        )}
      </AnimatePresence>
    </>
  );
}
