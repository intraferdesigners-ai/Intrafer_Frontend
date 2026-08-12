'use client';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getSessionId, shouldShowPopup, markPopupDismissed, getSavedContact, recordFirstVisit, getSecondsSinceFirstVisit } from '@/lib/session';
import CitySelect from './CitySelect';
import Honeypot from './Honeypot';

// Don't show the popup on auth or dashboard pages. '/vendors/' (trailing
// slash, so this doesn't match the /vendors listing page) is excluded
// because vendor detail pages have their own targeted VendorEnquiryOverlay,
// which — unlike this generic /visitor/capture popup — actually creates a
// real lead for that specific vendor. Showing both would compete for the
// same visitor's attention on the same page.
const EXCLUDED_PATHS = [
  '/auth',
  '/vendor/dashboard',
  '/admin/dashboard',
  '/enquiry',
  '/vendors/',
  // A guest who clicked a review-invite email link (see the homeowner-removal
  // plan's Reviews rework) is here to do exactly one task — pitching them an
  // unrelated "find a designer" popup mid-task is jarring, not a lead-gen
  // opportunity worth taking.
  '/review/',
];

export default function LeadCapturePopup() {
  const pathname = usePathname();
  const router    = useRouter();
  const isExcluded = EXCLUDED_PATHS.some(p => pathname.startsWith(p));

  const [visible,  setVisible]  = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [form,     setForm]     = useState({ name: '', phone: '', email: '', city: '' });
  const [website,  setWebsite]  = useState(''); // honeypot — see components/ui/Honeypot.jsx
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const timerRef      = useRef(null);
  const rescheduleRef = useRef(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);

    if (isExcluded) return;

    const schedulePopup = () => {
      if (!shouldShowPopup()) return null;

      recordFirstVisit();
      const secondsElapsed = getSecondsSinceFirstVisit();
      const remainingMs = Math.max(0, 20000 - (secondsElapsed * 1000));

      // If already been on site 20s+ → show in 1 second
      // If 15s elapsed → show in 5s
      // If fresh visit → show in 20s
      timerRef.current = setTimeout(() => {
        if (shouldShowPopup()) setVisible(true);
      }, remainingMs || 1000);

      const handleMouseLeave = (e) => {
        if (e.clientY <= 0 && shouldShowPopup() && !isExcluded) {
          clearTimeout(timerRef.current);
          setVisible(true);
        }
      };
      document.addEventListener('mouseleave', handleMouseLeave);
      return handleMouseLeave;
    };

    const cleanup = schedulePopup();

    return () => {
      clearTimeout(timerRef.current);
      if (cleanup) document.removeEventListener('mouseleave', cleanup);
    };
  }, [isExcluded]);

  // When popup closes, re-schedule if user said "later" (not verified)
  useEffect(() => {
    if (!visible && !isExcluded) {
      clearTimeout(rescheduleRef.current);
      if (!getSavedContact()) {
        rescheduleRef.current = setTimeout(() => {
          if (shouldShowPopup() && !isExcluded) setVisible(true);
        }, 300000); // 5 minutes
      }
    }
    return () => clearTimeout(rescheduleRef.current);
  }, [visible, isExcluded]);

  useEffect(() => {
    if (visible) document.body.style.overflow = 'hidden';
    else         document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [visible]);

  const handleDismiss = () => {
    markPopupDismissed();
    setVisible(false);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      e.name = 'Please enter your name';
    if (!form.city)
      e.city = 'Please select your city';
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, '')))
      e.phone = 'Enter a valid 10-digit mobile number';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email address';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Same OTP-verify pipeline as VendorEnquiryOverlay/QuickEnquiryModal (see
  // enquiry/verify/page.jsx) — unified per the decision to standardize
  // every guest-contact-capture entry point on OTP rather than this popup's
  // old submit-and-done shape. No vendorId in the draft: this is the
  // site-wide "match me with designers" capture, not tied to one vendor —
  // see enquiry.controller.js's submitGuestEnquiry for how a vendor-less
  // draft becomes a Visitor capture instead of a Lead.
  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/enquiry/send-otp', {
        name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), website,
      });
      sessionStorage.setItem('intrafer_enquiry_draft', JSON.stringify({
        name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(),
        city: form.city, requirements: '', vendorId: null, sessionId: getSessionId(),
      }));
      setVisible(false);
      router.push(`/enquiry/verify?pendingId=${data.data.pendingId}`);
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Something went wrong. Please try again.' });
    }
    setLoading(false);
  };

  if (isExcluded || !visible) return null;

  return (
    <>
      {/* ── SINGLE WRAPPER handles both backdrop + centering ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          background: 'rgba(15,23,42,.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '0' : '16px',
          boxSizing: 'border-box',
        }}
        onClick={handleDismiss}
      >
        {/* ── MODAL CARD ── */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: isMobile ? '100%' : '660px',
            maxHeight: isMobile ? '92vh' : 'calc(100vh - 40px)',
            background: 'var(--surface)',
            borderRadius: isMobile ? '24px 24px 0 0' : '24px',
            overflow: 'hidden',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(15,23,42,.3)',
            animation: isMobile
              ? 'slideUp 300ms cubic-bezier(.34,1.1,.64,1) forwards'
              : 'popIn 280ms cubic-bezier(.34,1.2,.64,1) forwards',
            flexShrink: 0,
            /* Mobile: stick to bottom */
            ...(isMobile && {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              paddingBottom: 'env(safe-area-inset-bottom)',
            }),
          }}
        >
          {/* Mobile handle bar */}
          {isMobile && (
            <div style={{
              width: '36px', height: '4px',
              background: 'var(--border-emp)',
              borderRadius: '2px',
              margin: '12px auto 4px',
              flexShrink: 0,
            }} />
          )}

          <PopupContent
            form={form}
            setForm={setForm}
            website={website}
            setWebsite={setWebsite}
            errors={errors}
            loading={loading}
            onSubmit={handleSubmit}
            onDismiss={handleDismiss}
            isMobile={isMobile}
          />
        </div>
      </div>
    </>
  );
}

function PopupContent({ form, setForm, website, setWebsite, errors, loading, onSubmit, onDismiss, isMobile }) {
  // No more inline "Thank you" step — a submission here only requests an
  // OTP and navigates to the shared /enquiry/verify page (same as
  // VendorEnquiryOverlay/QuickEnquiryModal), which itself redirects to
  // /enquiry/success once verification actually completes.
  const formFields = (
    <FormFields
      form={form} setForm={setForm} website={website} setWebsite={setWebsite}
      errors={errors} loading={loading}
      onSubmit={onSubmit} onDismiss={onDismiss}
    />
  );

  if (!isMobile) {
    return (
      <div style={{ display: 'flex' }}>
        {/* ── LEFT RAIL — narrow brand panel ── */}
        <div style={{
          width: '38%', flexShrink: 0,
          background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 60%, #1D4ED8 100%)',
          position: 'relative', overflow: 'hidden',
          padding: 'clamp(24px, 4vh, 32px) 24px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{
            position: 'absolute', top: '-30px', right: '-30px',
            width: '120px', height: '120px', borderRadius: '50%',
            background: 'rgba(96,165,250,.15)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-20px', left: '40px',
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(96,165,250,.1)',
          }} />

          <div style={{ position: 'relative' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '16px',
              background: 'rgba(255,255,255,.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,.2)',
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>

            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '23px',
              fontWeight: 400, color: '#fff', lineHeight: 1.2, marginBottom: '8px',
            }}>
              Find your perfect<br />interior designer
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,.7)', lineHeight: 1.5 }}>
              Get matched with a designer for your city.
            </div>
          </div>

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {TRUST_LINES.map(label => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '13px', color: 'rgba(255,255,255,.85)',
              }}>
                <span style={{
                  width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(134,239,172,.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                    stroke="#86EFAC" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT COLUMN — form ── */}
        <div style={{
          flex: 1, position: 'relative',
          padding: 'clamp(44px, 6vh, 56px) 28px clamp(16px, 3vh, 28px)',
        }}>
          <button onClick={onDismiss} aria-label="Close" style={{
            position: 'absolute', top: '16px', right: '16px',
            width: '44px', height: '44px', borderRadius: '50%',
            background: 'var(--bg-parchment)', border: '1px solid var(--border)',
            color: 'var(--text-hint)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', lineHeight: 1, padding: 0,
          }}>✕</button>

          {formFields}
        </div>
      </div>
    );
  }

  // ── Mobile — unchanged stacked bottom-sheet layout ──
  return (
    <>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 60%, #1D4ED8 100%)',
        padding: '24px 20px 20px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-30px', right: '-30px',
          width: '120px', height: '120px', borderRadius: '50%',
          background: 'rgba(96,165,250,.15)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20px', left: '40px',
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'rgba(96,165,250,.1)',
        }} />

        <button onClick={onDismiss} aria-label="Close" style={{
          position: 'absolute', top: '16px', right: '16px',
          width: '44px', height: '44px', borderRadius: '50%',
          background: 'rgba(255,255,255,.15)', border: 'none',
          color: 'rgba(255,255,255,.8)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', lineHeight: 1, padding: 0,
        }}>✕</button>

        <div style={{
          width: '52px', height: '52px', borderRadius: '16px',
          background: 'rgba(255,255,255,.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '16px',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,.2)',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="1.8" strokeLinecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>

        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '26px',
          fontWeight: 400, color: '#fff', lineHeight: 1.2, marginBottom: '8px',
        }}>
          Find your perfect<br />interior designer
        </div>
        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,.7)', lineHeight: 1.5 }}>
          Tell us about yourself and we&apos;ll match you with verified designers in your city. Free.
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
          {TRUST_LINES.map(badge => (
            <div key={badge} style={{
              fontSize: '11px', color: 'rgba(255,255,255,.85)',
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'rgba(255,255,255,.1)', padding: '4px 10px',
              borderRadius: '20px', border: '1px solid rgba(255,255,255,.15)',
            }}>
              <span style={{ color: '#86EFAC' }}>✓</span> {badge}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div style={{ padding: '16px 20px 20px' }}>
        {formFields}
      </div>
    </>
  );
}

const TRUST_LINES = ['Vetted designers', 'Free to enquire', 'No spam, ever'];

function FormFields({ form, setForm, website, setWebsite, errors, loading, onSubmit, onDismiss }) {
  return (
    <>
      <Honeypot value={website} onChange={e => setWebsite(e.target.value)} />

      <Field label="Your city" error={errors.city}>
        <CitySelect
          value={form.city}
          onChange={city => setForm(f => ({ ...f, city }))}
          placeholder="Select your city..."
        />
      </Field>

      <Field label="Your name" error={errors.name}>
        <InputWithIcon icon={<PersonIcon />} error={errors.name}>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Rahul Sharma"
            style={inputStyle(errors.name)}
          />
        </InputWithIcon>
      </Field>

      <Field label="Mobile number" error={errors.phone}>
        <InputWithIcon icon={<PhoneIcon />} error={errors.phone}>
          <input
            type="text"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="9876543210"
            inputMode="tel"
            maxLength={10}
            style={inputStyle(errors.phone)}
          />
        </InputWithIcon>
      </Field>

      <Field label="Email" error={errors.email} last>
        <InputWithIcon icon={<MailIcon />} error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="you@email.com"
            inputMode="email"
            style={inputStyle(errors.email)}
          />
        </InputWithIcon>
      </Field>

      {errors.submit && (
        <div style={{ fontSize: '12px', color: 'var(--danger)', marginBottom: '10px' }}>{errors.submit}</div>
      )}

      <button
        onClick={onSubmit}
        disabled={loading}
        style={{
          width: '100%', height: '52px',
          background: loading
            ? 'var(--border)'
            : 'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)',
          color: '#fff', border: 'none',
          borderRadius: '14px', fontSize: '16px', fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          boxShadow: loading ? 'none' : '0 4px 16px rgba(59,130,246,.4)',
        }}
      >
        {loading ? (
          <>
            <div style={{
              width: '18px', height: '18px', borderRadius: '50%',
              border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff',
              animation: 'spin 600ms linear infinite',
            }} />
            Sending code...
          </>
        ) : (
          <>
            Continue — verify with OTP
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </>
        )}
      </button>

      <div style={{
        textAlign: 'center', marginTop: '12px',
        fontSize: '11px', color: 'var(--text-hint)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
      }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
        100% free · No spam · Your data is private
      </div>

      <div style={{
        display: 'flex', justifyContent: 'center',
        alignItems: 'center', gap: '24px', marginTop: '14px',
      }}>
        {[
          { label: "I'll do it later", onClick: onDismiss },
        ].map(({ label, onClick }) => (
          <button key={label} onClick={onClick} style={{
            background: 'none', border: 'none',
            fontSize: '14px', fontWeight: 600, color: 'var(--text-mid)',
            cursor: 'pointer', padding: '4px 8px',
            borderRadius: '6px',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
            textUnderlineOffset: '3px',
          }}>{label}</button>
        ))}
      </div>
    </>
  );
}

// ── Tiny sub-components ────────────────────────────────────
function Field({ label, error, children, last }) {
  return (
    <div style={{ marginBottom: last ? 'clamp(14px, 3vh, 20px)' : 'clamp(8px, 2vh, 14px)' }}>
      <label style={{
        display: 'block', fontSize: '12px', fontWeight: 600,
        color: 'var(--text-hint)', letterSpacing: '.05em',
        textTransform: 'uppercase', marginBottom: '6px',
      }}>{label}</label>
      {children}
      {error && <div style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px' }}>{error}</div>}
    </div>
  );
}

function InputWithIcon({ icon, error, children }) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute', left: '14px', top: '50%',
        transform: 'translateY(-50%)', color: 'var(--text-hint)', pointerEvents: 'none',
      }}>{icon}</div>
      {children}
    </div>
  );
}

const inputStyle = (error) => ({
  width: '100%', height: '48px', padding: '0 14px 0 42px',
  background: 'var(--bg-parchment)',
  border: `1.5px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
  borderRadius: '12px', fontSize: '15px', color: 'var(--text)',
  outline: 'none',
});

function PersonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="M22 6l-10 7L2 6"/>
    </svg>
  );
}
