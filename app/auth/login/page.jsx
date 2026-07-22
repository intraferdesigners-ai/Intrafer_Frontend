'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Mail, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../lib/api';
import useAuthStore from '../../../store/authStore';
import { setAuthTokens } from '../../../lib/auth';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import AuthSplitCard from '../../../components/auth/AuthSplitCard';

const tabStyle = (active) => ({
  flex: 1, padding: '8px 12px', borderRadius: 'var(--r-sm)', border: 'none',
  background: active ? 'var(--surface)' : 'transparent',
  color: active ? 'var(--primary)' : 'var(--text-sub)',
  fontSize: '13px', fontWeight: 500, cursor: 'pointer',
  boxShadow: active ? 'var(--shadow-sm)' : 'none',
  transition: 'all 150ms ease-out',
});

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [authMethod, setAuthMethod] = useState('password'); // 'password' | 'otp'

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  // Email-code sign-in state
  const [otpUserId,     setOtpUserId]     = useState('');
  const [otpSent,       setOtpSent]       = useState(false);
  const [otp,           setOtp]           = useState(['', '', '', '', '', '']);
  const [sendingCode,   setSendingCode]   = useState(false);
  const [resendTimer,   setResendTimer]   = useState(0);
  const [canResend,     setCanResend]     = useState(true);

  const inputRefs = useRef([]);
  const timerRef  = useRef(null);

  useEffect(() => { document.title = 'Login | Intrafer'; }, []);
  useEffect(() => () => clearInterval(timerRef.current), []);

  const switchMethod = (method) => {
    setAuthMethod(method);
    setError('');
  };

  // Shared by both the password and email-code paths so the redirect logic
  // never diverges between the two sign-in methods.
  const completeLogin = (user, accessToken) => {
    setAuthTokens(accessToken, user.role);
    setAuth(user, accessToken);
    toast.success('Welcome back, ' + user.name + '!');
    if (user.role === 'admin')       router.push('/admin/dashboard');
    else if (user.role === 'vendor') router.push('/vendor/dashboard');
    else                             router.push('/user/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      completeLogin(data.data.user, data.data.accessToken);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
    setLoading(false);
  };

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

  const handleSendCode = async () => {
    if (!email) { setError('Please enter your email address.'); return; }
    setSendingCode(true);
    setError('');
    try {
      const { data } = await api.post('/auth/send-otp', { email });
      setOtpUserId(data.data.userId);
      setOtp(['', '', '', '', '', '']);
      setOtpSent(true);
      toast.success('Code sent! Check your email.');
      startCountdown();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send code. Please try again.');
    }
    setSendingCode(false);
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next  = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setOtp(next);
    inputRefs.current[Math.min(text.length - 1, 5)]?.focus();
  };

  const handleVerifyCode = async () => {
    const otpString = otp.join('');
    if (otpString.length < 6) { setError('Please enter all 6 digits.'); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/verify-otp', { userId: otpUserId, otp: otpString });
      completeLogin(data.data.user, data.data.accessToken);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code. Please try again.');
    }
    setLoading(false);
  };

  const handleUseDifferentEmail = () => {
    setOtpSent(false);
    setOtp(['', '', '', '', '', '']);
    setError('');
    clearInterval(timerRef.current);
  };

  return (
    <AuthSplitCard>
      <Link href="/" style={{ display: 'inline-flex', marginBottom: '20px' }}>
        <Image src="/images/logo/logo.png" alt="Intrafer" width={26} height={26} style={{ objectFit: 'contain' }} />
      </Link>
      <div style={{ marginBottom: '28px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: 'var(--primary-bg)', border: '1.5px solid var(--primary-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <Lock size={20} color="var(--primary)" strokeWidth={1.8} />
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400,
          letterSpacing: '-.01em', color: 'var(--text)', margin: '0 0 6px',
        }}>
          Welcome back
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-hint)', margin: 0 }}>
          Sign in to your Intrafer account
        </p>
      </div>

      <div style={{
        display: 'flex', gap: '4px', padding: '4px', marginBottom: '20px',
        background: 'var(--bg-parchment)', borderRadius: 'var(--r-md)',
      }}>
        <button type="button" style={tabStyle(authMethod === 'password')} onClick={() => switchMethod('password')}>
          Password
        </button>
        <button type="button" style={tabStyle(authMethod === 'otp')} onClick={() => switchMethod('otp')}>
          Email code
        </button>
      </div>

      {error && (
        <div style={{
          background: 'var(--danger-bg)', color: 'var(--danger)',
          fontSize: '13px', padding: '12px 14px', borderRadius: 'var(--r-md)',
          marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      {authMethod === 'password' ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Email address"
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <div>
            <Input
              label="Password"
              type="password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <div style={{ textAlign: 'right', marginTop: '6px' }}>
              <Link href="/auth/forgot-password" style={{ fontSize: '12px', color: 'var(--primary)' }}>
                Forgot password?
              </Link>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', marginTop: '8px' }}>
            Sign in
          </Button>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!otpSent ? (
            <>
              <Input
                label="Email address"
                type="email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
              <p style={{ fontSize: '12px', color: 'var(--text-hint)', margin: 0 }}>
                We&apos;ll send a 6-digit code to this email — no password needed.
              </p>
              <Button
                type="button"
                variant="primary"
                size="lg"
                loading={sendingCode}
                onClick={handleSendCode}
                style={{ width: '100%', marginTop: '8px' }}
              >
                Send code
              </Button>
            </>
          ) : (
            <>
              <p style={{ fontSize: '13px', color: 'var(--text-sub)', margin: '0 0 4px' }}>
                Enter the 6-digit code sent to <strong>{email}</strong>.
              </p>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
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
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={i === 0 ? handleOtpPaste : undefined}
                    style={{
                      width: 'clamp(32px, 10vw, 48px)',
                      height: 'clamp(46px, 12vw, 56px)',
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

              <Button
                type="button"
                variant="primary"
                size="lg"
                loading={loading}
                onClick={handleVerifyCode}
                style={{ width: '100%', marginTop: '8px' }}
              >
                Sign in
              </Button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <button
                  type="button"
                  onClick={handleUseDifferentEmail}
                  style={{ background: 'none', border: 'none', padding: 0, fontSize: '12px', color: 'var(--text-hint)', cursor: 'pointer' }}
                >
                  Use a different email
                </button>
                {canResend ? (
                  <Button variant="ghost" size="sm" loading={sendingCode} onClick={handleSendCode}>
                    Resend code
                  </Button>
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--text-hint)' }}>
                    Resend in {resendTimer}s
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        <span style={{ fontSize: '12px', color: 'var(--text-hint)' }}>or</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      <button
        type="button"
        disabled
        style={{
          width: '100%', padding: '10px 16px',
          background: 'var(--bg-parchment)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          fontSize: '13px', fontWeight: 500, color: 'var(--text-sub)',
          cursor: 'not-allowed', opacity: 0.6,
        }}
      >
        <span style={{
          width: '18px', height: '18px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #4285F4 25%, #34A853 50%, #FBBC05 75%, #EA4335 100%)',
          display: 'inline-block', flexShrink: 0,
        }} />
        Continue with Google
      </button>

      <p style={{ fontSize: '13px', textAlign: 'center', color: 'var(--text-sub)', marginTop: '24px' }}>
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" style={{ color: 'var(--primary)', fontWeight: 500 }}>
          Sign up
        </Link>
      </p>
    </AuthSplitCard>
  );
}
