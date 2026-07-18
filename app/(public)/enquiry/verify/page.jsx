'use client'
import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { setAuthTokens } from '@/lib/auth';
import useAuthStore from '@/store/authStore';
import V2OTPInput from '@/components/v2/ui/OTPInput';

function maskPhone(phone) {
  if (!phone || phone.length < 4) return '';
  return `+91 XXXXXX${phone.slice(-4)}`;
}

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const { setAuth } = useAuthStore();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [phone, setPhone] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    if (!userId || !sessionStorage.getItem('intrafer_enquiry_draft')) {
      router.push('/enquiry');
      return;
    }
    try {
      const draft = JSON.parse(sessionStorage.getItem('intrafer_enquiry_draft') || '{}');
      setPhone(draft.phone || '');
    } catch {}
  }, []);

  const startCountdown = (from = 30) => {
    clearInterval(timerRef.current);
    setResendTimer(from);
    setCanResend(false);
    timerRef.current = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); setCanResend(true); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startCountdown();
    return () => clearInterval(timerRef.current);
  }, []);

  const handleVerify = async () => {
    if (otp.length < 6) { setError('Please enter all 6 digits.'); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/verify-otp', { userId, otp });
      const { accessToken, user } = data.data;
      setAuthTokens(accessToken, user.role);
      setAuth(user, accessToken);

      const draft = JSON.parse(sessionStorage.getItem('intrafer_enquiry_draft') || '{}');
      const leadRes = await api.post('/leads', {
        vendorId: draft.vendorId,
        projectType: draft.projectType,
        budget: draft.budget,
        city: draft.city,
        requirements: draft.requirements,
      });

      const lead = leadRes.data?.data?.lead;
      sessionStorage.removeItem('intrafer_enquiry_draft');
      router.push(`/enquiry/success?enquiryId=${lead?._id || ''}&vendorId=${draft.vendorId || ''}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    try {
      const draft = JSON.parse(sessionStorage.getItem('intrafer_enquiry_draft') || '{}');
      await api.post('/auth/send-otp', { name: draft.name, email: draft.email, phone: draft.phone });
      setOtp('');
      startCountdown(30);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend. Try again.');
    }
    setResendLoading(false);
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)', background: '#0F172A',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', fontFamily: 'var(--v2-font-ui)',
    }}>
      <div style={{
        width: '100%', maxWidth: '440px',
        background: '#0A0F1E', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px', padding: 'clamp(24px,6vw,40px)', textAlign: 'center',
      }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '24px' }}>
          <div style={{ width: '30px', height: '30px', background: '#3B82F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <Image src="/images/logo/logo.png" alt="Intrafer" width={26} height={26} style={{ objectFit: 'contain' }} />
          </div>
          <span style={{ fontFamily: 'var(--v2-font-display)', fontSize: '18px', fontWeight: 500, color: '#F8F7F4' }}>Intrafer</span>
        </Link>

        <h1 style={{
          fontFamily: 'var(--v2-font-display)', fontSize: '28px', fontWeight: 500,
          color: '#F8F7F4', margin: '0 0 8px',
        }}>Verify your number</h1>
        <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 32px', lineHeight: 1.6 }}>
          We sent a 6-digit code to {maskPhone(phone) || 'your phone'}
        </p>

        <div style={{ marginBottom: '24px' }}>
          <V2OTPInput length={6} value={otp} onChange={setOtp} dark />
        </div>

        {error && (
          <div style={{ background: 'rgba(220,38,38,0.15)', color: '#FCA5A5', fontSize: '13px', padding: '10px 14px', borderRadius: '10px', marginBottom: '16px', textAlign: 'left' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={loading}
          style={{
            width: '100%', height: '48px', borderRadius: '10px',
            background: '#3B82F6', color: '#FFFFFF', border: 'none',
            fontSize: '14px', fontWeight: 600, cursor: loading ? 'default' : 'pointer',
            fontFamily: 'var(--v2-font-ui)', opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Verifying…' : 'Verify →'}
        </button>

        <div style={{ marginTop: '20px', minHeight: '20px' }}>
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={resendLoading}
              style={{ background: 'transparent', border: 'none', color: '#3B82F6', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--v2-font-ui)' }}
            >
              {resendLoading ? 'Resending…' : 'Resend code'}
            </button>
          ) : (
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Resend code in {resendTimer}s</p>
          )}
        </div>

        <Link href="/enquiry" style={{ display: 'block', marginTop: '16px', fontSize: '12px', color: '#64748B' }}>
          ← Back to enquiry form
        </Link>
      </div>
    </div>
  );
}

export default function EnquiryVerifyPage() {
  useEffect(() => { document.title = 'Verify Your Number | Intrafer'; }, []);
  return (
    <Suspense fallback={null}>
      <VerifyContent />
    </Suspense>
  );
}
