'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
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

const ROLE_LABELS = { user: 'homeowner', vendor: 'vendor', admin: 'admin' };
const roleLabel = (r) => ROLE_LABELS[r] || r;
const articleFor = (label) => (/^[aeiou]/i.test(label) ? 'an' : 'a');

// Same {user, vendor, admin} -> path mapping middleware.js and Navbar.jsx
// keep, duplicated rather than imported since middleware.js runs in the Edge
// runtime and can't share a module with client-only code anyway.
const ROLE_DASHBOARDS = {
  user:   '/user/dashboard',
  vendor: '/vendor/dashboard',
  admin:  '/admin/dashboard',
};

// A `redirect` query param is only safe to send the browser to if it's a
// same-site relative path — anything else (a bare "//evil.com" or an
// absolute "https://evil.com" URL, both of which the browser still honors
// as a redirect target) would turn this into an open redirect.
const isSafeRedirect = (path) => !!path && path.startsWith('/') && !path.startsWith('//');

// Only vendor/admin get tailored copy — 'user' and no-param both fall
// through to the original "Welcome back" default, unchanged.
const ROLE_COPY = {
  vendor: { heading: 'Vendor sign in', subtext: 'Sign in to manage your studio' },
  admin:  { heading: 'Admin sign in',  subtext: 'Sign in to the operations console' },
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  const roleParam = searchParams.get('role');
  const hasRoleParam = searchParams.has('role');
  const redirectParam = searchParams.get('redirect');

  // Preserves vendor context across the login -> register hop, so a visitor
  // who arrived via a vendor-specific entry point (e.g. VendorNavbar's
  // "Vendor login") doesn't land on a neutral homeowner/designer toggle.
  const signUpHref = roleParam === 'vendor' ? '/auth/register?role=vendor' : '/auth/register';

  const heading = ROLE_COPY[roleParam]?.heading || 'Welcome back';
  const subtext = ROLE_COPY[roleParam]?.subtext || 'Sign in to your Intrafer account';

  // Email-code sign-in is a homeowner convenience for accounts that may not
  // have a real password yet. Vendor/admin accounts always have one, and
  // send-otp silently auto-creates a placeholder homeowner account for any
  // email that doesn't already exist — exposing it here would be a latent
  // bug risk on top of the UX mismatch, so it's hidden for those roles.
  const showOtpTab = roleParam !== 'vendor' && roleParam !== 'admin';

  const [authMethod, setAuthMethod] = useState('password'); // 'password' | 'otp'
  const effectiveAuthMethod = showOtpTab ? authMethod : 'password';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [roleMismatch, setRoleMismatch] = useState(null); // { actual } | null

  // Set when login() rejects with 403 — a registered account that never
  // completed the OTP step (see backend register()/login()). Offers a way
  // back into that same verification step rather than a dead end.
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendingVerify,   setResendingVerify]   = useState(false);

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

  // Navigating between role params (e.g. clicking the mismatch banner's
  // "Try {role} sign-in" link, or "Choose a different account type") is a
  // client-side transition within this same route — the component doesn't
  // remount, so a stale error/roleMismatch from the previous role would
  // otherwise still be showing (and could read as self-contradictory, e.g.
  // "registered as a vendor, not a vendor" after switching to ?role=vendor).
  useEffect(() => {
    setError('');
    setRoleMismatch(null);
  }, [roleParam]);

  const switchMethod = (method) => {
    setAuthMethod(method);
    setError('');
    setRoleMismatch(null);
  };

  // Shared by both the password and email-code paths so the redirect logic
  // never diverges between the two sign-in methods.
  const completeLogin = (user, accessToken) => {
    // If the visitor picked a specific role card (or arrived with ?role= from
    // a role-specific entry point), block sign-in when the real account is a
    // different role — e.g. picking "Admin" but authenticating as a vendor —
    // rather than silently dropping them into the wrong dashboard.
    if (roleParam && user.role !== roleParam) {
      setRoleMismatch({ actual: user.role });
      return;
    }
    setAuthTokens(accessToken, user.role);
    setAuth(user, accessToken);
    toast.success('Welcome back, ' + user.name + '!');
    const dest = isSafeRedirect(redirectParam) ? redirectParam : (ROLE_DASHBOARDS[user.role] || '/');
    router.push(dest);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRoleMismatch(null);
    setNeedsVerification(false);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      completeLogin(data.data.user, data.data.accessToken);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setNeedsVerification(err.response?.status === 403);
    }
    setLoading(false);
  };

  const handleResendVerification = async () => {
    setResendingVerify(true);
    try {
      const { data } = await api.post('/auth/send-otp', { email });
      const { userId, role } = data.data;
      router.push(`/auth/register/verify?userId=${userId}&role=${role}&email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend. Try again.');
    }
    setResendingVerify(false);
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
    setRoleMismatch(null);
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
    setRoleMismatch(null);
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
          {heading}
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-hint)', margin: 0 }}>
          {subtext}
        </p>
      </div>

      {hasRoleParam && (
        <Link href="/auth/portal" style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          fontSize: '12px', color: 'var(--text-hint)', marginBottom: '18px',
        }}>
          <ArrowLeft size={12} /> Choose a different account type
        </Link>
      )}

      {showOtpTab && (
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
      )}

      {roleMismatch ? (
        <div style={{
          background: 'var(--danger-bg)', color: 'var(--danger)',
          fontSize: '13px', padding: '12px 14px', borderRadius: 'var(--r-md)',
          marginBottom: '16px', lineHeight: 1.6,
        }}>
          This account is registered as {articleFor(roleLabel(roleMismatch.actual))} {roleLabel(roleMismatch.actual)}, not {articleFor(roleLabel(roleParam))} {roleLabel(roleParam)}.{' '}
          Try{' '}
          <Link href={`/auth/login?role=${roleMismatch.actual}`} style={{ color: 'inherit', textDecoration: 'underline', fontWeight: 600 }}>
            {roleLabel(roleMismatch.actual)} sign-in
          </Link>{' '}
          instead.
        </div>
      ) : error && (
        <div style={{
          background: 'var(--danger-bg)', color: 'var(--danger)',
          fontSize: '13px', padding: '12px 14px', borderRadius: 'var(--r-md)',
          marginBottom: '16px',
        }}>
          {error}
          {needsVerification && (
            <div style={{ marginTop: '8px' }}>
              <Button variant="ghost" size="sm" loading={resendingVerify} onClick={handleResendVerification}>
                Resend verification email
              </Button>
            </div>
          )}
        </div>
      )}

      {effectiveAuthMethod === 'password' ? (
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
        <Link href={signUpHref} style={{ color: 'var(--primary)', fontWeight: 500 }}>
          Sign up
        </Link>
      </p>
    </AuthSplitCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
