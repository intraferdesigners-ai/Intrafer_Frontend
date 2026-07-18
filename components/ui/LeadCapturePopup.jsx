'use client';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { getSessionId, shouldShowPopup, markPopupFilled, markPopupDismissed, markPopupNotInterested, hasFilledPopup, recordFirstVisit, getSecondsSinceFirstVisit } from '@/lib/session';
import CitySelect from './CitySelect';

// Don't show the popup on auth or dashboard pages
const EXCLUDED_PATHS = [
  '/auth',
  '/user/dashboard',
  '/vendor/dashboard',
  '/admin/dashboard',
  '/enquiry',
];

export default function LeadCapturePopup() {
  const pathname = usePathname();
  const isExcluded = EXCLUDED_PATHS.some(p => pathname.startsWith(p));

  const [visible,  setVisible]  = useState(false);
  const [step,     setStep]     = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [form,     setForm]     = useState({ name: '', contact: '', city: '' });
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

  // When popup closes, re-schedule if user said "later" (not submitted / not interested)
  useEffect(() => {
    if (!visible && !isExcluded) {
      clearTimeout(rescheduleRef.current);
      if (!hasFilledPopup() && !localStorage.getItem('intrafer_popup_not_interested')) {
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

  const handleNotInterested = () => {
    markPopupNotInterested();
    clearTimeout(rescheduleRef.current);
    setVisible(false);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      e.name = 'Please enter your name';
    if (!form.city)
      e.city = 'Please select your city';
    if (!form.contact.trim()) {
      e.contact = 'Please enter your phone or email';
    } else {
      const isPhone = /^[6-9]\d{9}$/.test(form.contact.replace(/\s/g, ''));
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact);
      if (!isPhone && !isEmail)
        e.contact = 'Enter a valid 10-digit mobile or email address';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/visitor/capture`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: getSessionId(),
          name:      form.name.trim(),
          contact:   form.contact.trim(),
          city:      form.city,
          userAgent: navigator.userAgent,
        }),
      });
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
    markPopupFilled();
    setStep(2);
    setTimeout(() => setVisible(false), 5000);
  };

  if (isExcluded || !visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(15,23,42,.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '0' : '16px',
        boxSizing: 'border-box',
        fontFamily: 'var(--v2-font-ui)',
      }}
      onClick={handleDismiss}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: isMobile ? '100%' : '480px',
          maxHeight: isMobile ? '92vh' : 'calc(100vh - 40px)',
          background: '#FFFFFF',
          borderRadius: isMobile ? '20px 20px 0 0' : '20px',
          overflow: 'hidden',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(15,23,42,.35)',
          animation: isMobile
            ? 'v2SlideUp 300ms cubic-bezier(.34,1.1,.64,1) forwards'
            : 'v2PopIn 280ms cubic-bezier(.34,1.2,.64,1) forwards',
          flexShrink: 0,
          ...(isMobile && {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingBottom: 'env(safe-area-inset-bottom)',
          }),
        }}
      >
        {isMobile && (
          <div style={{
            width: '36px', height: '4px',
            background: 'rgba(255,255,255,.3)',
            borderRadius: '2px',
            margin: '12px auto -8px',
            flexShrink: 0,
          }} />
        )}

        <PopupContent
          step={step}
          form={form}
          setForm={setForm}
          errors={errors}
          loading={loading}
          onSubmit={handleSubmit}
          onDismiss={handleDismiss}
          onNotInterested={handleNotInterested}
          isMobile={isMobile}
        />
      </div>

      <style>{`
        @keyframes v2PopIn   { from { opacity: 0; transform: scale(.94); } to { opacity: 1; transform: scale(1); } }
        @keyframes v2SlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes v2ScaleIn { from { opacity: 0; transform: scale(.7); } to { opacity: 1; transform: scale(1); } }
        @keyframes v2Spin    { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function PopupContent({ step, form, setForm, errors, loading, onSubmit, onDismiss, onNotInterested, isMobile }) {
  if (step === 2) {
    return (
      <div style={{ padding: '56px 28px', textAlign: 'center' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: '#DCFCE7', border: '2px solid #16A34A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          animation: 'v2ScaleIn 400ms cubic-bezier(.34,1.56,.64,1) forwards',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
            stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div style={{
          fontFamily: 'var(--v2-font-display)', fontSize: '26px',
          fontWeight: 500, color: '#0F172A', marginBottom: '8px',
        }}>
          We'll be in touch, {form.name.split(' ')[0]}!
        </div>
        <div style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.65 }}>
          A designer in {form.city} will reach out within 48 hours.
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div style={{
        background: '#0F172A',
        padding: isMobile ? '24px 20px 20px' : 'clamp(20px, 4vh, 32px) 28px clamp(16px, 3vh, 28px)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div aria-hidden style={{
          position: 'absolute', top: '-30px', right: '-30px',
          width: '140px', height: '140px', borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(59,130,246,0.25), transparent)',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <div style={{
            width: '26px', height: '26px', borderRadius: '7px',
            background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          }}>
            <Image src="/images/logo/logo.png" alt="Intrafer" width={20} height={20} style={{ objectFit: 'contain' }} />
          </div>
          <span style={{ fontFamily: 'var(--v2-font-display)', fontSize: '14px', fontWeight: 500, color: '#F8F7F4' }}>Intrafer</span>
        </div>

        <button onClick={onDismiss} aria-label="Close" style={{
          position: 'absolute', top: '16px', right: '16px',
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'rgba(255,255,255,.1)', border: 'none',
          color: 'rgba(255,255,255,.8)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px',
        }}>✕</button>

        <div style={{
          width: '52px', height: '52px', borderRadius: '14px',
          background: 'rgba(59,130,246,.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '16px',
          border: '1px solid rgba(59,130,246,.3)',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>

        <div style={{
          fontFamily: 'var(--v2-font-display)', fontSize: '26px',
          fontWeight: 500, color: '#F8F7F4', lineHeight: 1.25, marginBottom: '8px',
        }}>
          Find your perfect interior designer
        </div>
        <div style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.55 }}>
          Tell us about yourself and we'll match you with verified designers in your city. Free.
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
          {['500+ designers', 'Free', '48h response'].map(badge => (
            <div key={badge} style={{
              fontSize: '11px', color: '#CBD5E1',
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'rgba(255,255,255,.06)', padding: '4px 10px',
              borderRadius: '20px', border: '1px solid rgba(255,255,255,.1)',
            }}>
              <span style={{ color: '#3B82F6' }}>✓</span> {badge}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div style={{ padding: isMobile ? '16px 20px 20px' : 'clamp(16px, 3vh, 24px) 28px clamp(16px, 3vh, 28px)' }}>
        <Field label="Your city" error={errors.city}>
          <CitySelect
            value={form.city}
            onChange={city => setForm(f => ({ ...f, city }))}
            placeholder="Select your city..."
          />
        </Field>

        <Field label="Your name" error={errors.name}>
          <InputWithIcon icon={<PersonIcon />}>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Rahul Sharma"
              style={inputStyle(errors.name)}
            />
          </InputWithIcon>
        </Field>

        <Field label="Mobile or email" error={errors.contact} last>
          <InputWithIcon icon={<PhoneIcon />}>
            <input
              type="text"
              value={form.contact}
              onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
              placeholder="9876543210 or you@email.com"
              inputMode="tel"
              style={inputStyle(errors.contact)}
            />
          </InputWithIcon>
        </Field>

        <button
          onClick={onSubmit}
          disabled={loading}
          style={{
            width: '100%', height: '52px',
            background: loading ? '#94A3B8' : '#3B82F6',
            color: '#fff', border: 'none',
            borderRadius: '12px', fontSize: '15px', fontWeight: 600,
            fontFamily: 'var(--v2-font-ui)',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'background 150ms',
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: '18px', height: '18px', borderRadius: '50%',
                border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff',
                animation: 'v2Spin 600ms linear infinite',
              }} />
              Connecting you...
            </>
          ) : (
            <>Get matched with designers →</>
          )}
        </button>

        <div style={{
          textAlign: 'center', marginTop: '12px',
          fontSize: '11px', color: '#94A3B8',
        }}>
          🔒 100% free · No spam · Your data is private
        </div>

        <div style={{
          display: 'flex', justifyContent: 'center',
          alignItems: 'center', gap: '24px', marginTop: '14px',
        }}>
          {[
            { label: "I'll do it later", onClick: onDismiss },
            { label: 'Not interested',   onClick: onNotInterested },
          ].map(({ label, onClick }) => (
            <button key={label} onClick={onClick} style={{
              background: 'none', border: 'none',
              fontSize: '12px', color: '#94A3B8',
              cursor: 'pointer', padding: '4px 8px',
              borderRadius: '6px', fontFamily: 'var(--v2-font-ui)',
              textDecoration: 'underline',
              textDecorationStyle: 'dotted',
              textUnderlineOffset: '3px',
            }}>{label}</button>
          ))}
        </div>
      </div>
    </>
  );
}

function Field({ label, error, children, last }) {
  return (
    <div style={{ marginBottom: last ? 'clamp(14px, 3vh, 20px)' : 'clamp(8px, 2vh, 14px)' }}>
      <label style={{
        display: 'block', fontSize: '11px', fontWeight: 600,
        color: '#64748B', letterSpacing: '.08em',
        textTransform: 'uppercase', marginBottom: '6px',
      }}>{label}</label>
      {children}
      {error && <div style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>{error}</div>}
    </div>
  );
}

function InputWithIcon({ icon, children }) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute', left: '14px', top: '50%',
        transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none',
      }}>{icon}</div>
      {children}
    </div>
  );
}

const inputStyle = (error) => ({
  width: '100%', height: '48px', padding: '0 14px 0 42px',
  background: '#FFFFFF',
  border: `1.5px solid ${error ? '#DC2626' : '#CBD5E1'}`,
  borderRadius: '10px', fontSize: '14px', color: '#0F172A',
  fontFamily: 'var(--v2-font-ui)',
  outline: 'none',
  boxSizing: 'border-box',
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
