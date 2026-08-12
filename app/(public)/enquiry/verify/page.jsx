'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import api from '../../../../lib/api';
import Button from '../../../../components/ui/Button';
import { saveContact } from '../../../../lib/session';

function VerifyContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const pendingId     = searchParams.get('pendingId');
  const draftKey     = 'intrafer_enquiry_draft';

  const [otp,           setOtp]           = useState(['', '', '', '', '', '']);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer,   setResendTimer]   = useState(60);
  const [canResend,     setCanResend]     = useState(false);

  const inputRefs = useRef([]);
  const timerRef  = useRef(null);

  useEffect(() => {
    if (!pendingId || !sessionStorage.getItem(draftKey)) {
      router.push('/enquiry');
    }
  }, []);

  const startCountdown = (from = 60) => {
    clearInterval(timerRef.current);
    setResendTimer(from);
    setCanResend(false);
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); setCanResend(true); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startCountdown();
    return () => clearInterval(timerRef.current);
  }, []);

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next  = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setOtp(next);
    inputRefs.current[Math.min(text.length - 1, 5)]?.focus();
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length < 6) { setError('Please enter all 6 digits.'); return; }
    setLoading(true);
    setError('');
    try {
      const raw   = sessionStorage.getItem(draftKey);
      const draft = JSON.parse(raw || '{}');

      // Single call — verifies the OTP and creates the Lead (or, if this
      // draft has no vendorId, a Visitor capture) together, with no session
      // or account created for the visitor. See enquiry.controller.js's
      // submitGuestEnquiry.
      const { data } = await api.post('/enquiry/submit', {
        pendingId,
        otp:          otpString,
        vendorId:     draft.vendorId,
        projectType:  draft.projectType,
        budget:       draft.budget,
        city:         draft.city,
        requirements: draft.requirements,
        sessionId:    draft.sessionId,
      });

      const lead = data.data?.lead;

      // Only now — after OTP has actually been checked server-side — does
      // this contact count as "verified" for the site's shared cache (see
      // lib/session.js). Every subsequent vendor this visitor reaches
      // reads this to auto-send without asking for OTP again.
      if (data.data?.contactToken) {
        saveContact({
          name: draft.name, phone: draft.phone, email: draft.email,
          contactToken: data.data.contactToken,
        });
      }

      sessionStorage.removeItem(draftKey);
      router.push(
        `/enquiry/success?enquiryId=${lead?._id || ''}&vendorId=${draft.vendorId || ''}`
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    try {
      const raw   = sessionStorage.getItem(draftKey);
      const draft = JSON.parse(raw || '{}');
      await api.post('/enquiry/send-otp', { name: draft.name, email: draft.email, phone: draft.phone });
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      startCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend. Try again.');
    }
    setResendLoading(false);
  };

  return (
    <div style={{ maxWidth: '440px', margin: 'clamp(64px,8vw,80px) auto', padding: '0 clamp(16px,4vw,24px)' }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-2xl)',
        padding: 'clamp(20px, 6vw, 40px)', textAlign: 'center',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ marginBottom: '20px' }}>
          <Mail size={48} color="var(--primary)" />
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400,
          color: 'var(--text)', margin: '0 0 8px',
        }}>
          Verify your identity
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-hint)', margin: '0 0 32px', lineHeight: 1.6 }}>
          Enter the 6-digit code sent to your email.
        </p>

        {/* OTP inputs */}
        <div style={{ display: 'flex', gap: 'clamp(4px,1.5vw,8px)', justifyContent: 'center', marginBottom: '24px' }}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              className="otp-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              style={{
                width: 'clamp(32px, 10vw, 52px)',
                height: 'clamp(50px, 14vw, 62px)',
                fontSize: '20px',
                textAlign: 'center',
                fontWeight: 500,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text)',
                background: 'var(--surface)',
                border: '1.5px solid var(--border-sub)',
                borderRadius: 'var(--r-md)',
                outline: 'none',
              }}
            />
          ))}
        </div>

        {error && (
          <div style={{
            background: 'var(--danger-bg)', color: 'var(--danger)',
            fontSize: '13px', padding: '10px 14px', borderRadius: 'var(--r-md)',
            marginBottom: '16px', textAlign: 'left',
          }}>
            {error}
          </div>
        )}

        <Button variant="primary" size="lg" loading={loading} onClick={handleVerify} style={{ width: '100%' }}>
          Verify and submit enquiry
        </Button>

        <div style={{ marginTop: '20px', minHeight: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {canResend ? (
            <Button variant="ghost" size="sm" loading={resendLoading} onClick={handleResend}>
              Resend code
            </Button>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--text-hint)', margin: 0 }}>
              Resend code in {resendTimer}s
            </p>
          )}
        </div>

        <Link href="/enquiry" style={{ display: 'block', marginTop: '16px', fontSize: '12px', color: 'var(--text-hint)' }}>
          ← Back to enquiry form
        </Link>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyContent />
    </Suspense>
  );
}
