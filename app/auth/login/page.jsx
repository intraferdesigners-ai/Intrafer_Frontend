'use client';

import { Suspense, useState, useEffect } from 'react';
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
import GoogleAuthButton from '../../../components/auth/GoogleAuthButton';

// 'user' (homeowner) intentionally has no entry — that role has no login
// surface anymore (see the homeowner-removal plan, Phase 4). A pre-existing
// homeowner account attempting the password form still authenticates
// server-side (those rows are left inert, not purged), it just falls back
// to raw "user" here instead of a friendly label, and to '/' below instead
// of a dashboard that no longer exists.
const ROLE_LABELS = { vendor: 'vendor', admin: 'admin' };
const roleLabel = (r) => ROLE_LABELS[r] || r;
const articleFor = (label) => (/^[aeiou]/i.test(label) ? 'an' : 'a');

// Same {vendor, admin} -> path mapping middleware.js and Navbar.jsx keep,
// duplicated rather than imported since middleware.js runs in the Edge
// runtime and can't share a module with client-only code anyway.
const ROLE_DASHBOARDS = {
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

  // Registration never creates admin accounts (see auth.controller.js's
  // register() — role is always clamped to user/vendor server-side); real
  // admin accounts only ever come from scripts/createAdmin.js or an existing
  // super admin. Offering "Sign up" here would just lead an admin-context
  // visitor to a dead end. Covers both ways someone lands here as an admin:
  // picking the Admin card on /auth/portal (?role=admin) and middleware.js
  // bouncing an unauthenticated visit to a protected /admin/* route back to
  // login with ?redirect=/admin/....
  const isAdminContext = roleParam === 'admin' || (!!redirectParam && redirectParam.startsWith('/admin'));

  // Preserves vendor context across the login -> register hop, so a visitor
  // who arrived via a vendor-specific entry point (e.g. VendorNavbar's
  // "Vendor login") doesn't land on a neutral homeowner/designer toggle.
  const signUpHref = roleParam === 'vendor' ? '/auth/register?role=vendor' : '/auth/register';

  const heading = ROLE_COPY[roleParam]?.heading || 'Welcome back';
  const subtext = ROLE_COPY[roleParam]?.subtext || 'Sign in to your Intrafer account';

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

  // Set when POST /auth/google returns NO_ACCOUNT — no vendor account
  // exists for the Google email the visitor picked. The backend
  // deliberately does not auto-create one from the login page (see the
  // Google OAuth Enablement plan, §03), so this shows a clean "sign up
  // instead" state rather than the generic red error box.
  const [googleNoAccount, setGoogleNoAccount] = useState(false);

  useEffect(() => { document.title = 'Login | Intrafer'; }, []);

  // Navigating between role params (e.g. clicking the mismatch banner's
  // "Try {role} sign-in" link, or "Choose a different account type") is a
  // client-side transition within this same route — the component doesn't
  // remount, so a stale error/roleMismatch from the previous role would
  // otherwise still be showing (and could read as self-contradictory, e.g.
  // "registered as a vendor, not a vendor" after switching to ?role=vendor).
  useEffect(() => {
    setError('');
    setRoleMismatch(null);
    setGoogleNoAccount(false);
  }, [roleParam]);

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
    // A hard navigation, not router.push(dest) — the App Router's client
    // cache can hold a *stale, pre-login* entry for `dest` (e.g. from an
    // unauthenticated Link prefetch elsewhere on the site that hit
    // middleware's redirect-to-login before this user ever signed in — see
    // Footer.jsx's `prefetch: false` on its vendor-dashboard link for one
    // such source). router.push() would happily reuse that cached redirect
    // and strand the user back on this login page despite a successful
    // login. A full navigation always re-requests `dest` from the server
    // with the just-set cookies, so middleware evaluates it fresh.
    window.location.href = dest;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRoleMismatch(null);
    setNeedsVerification(false);
    setGoogleNoAccount(false);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      completeLogin(data.data.user, data.data.accessToken);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setNeedsVerification(err.response?.status === 403);
    }
    setLoading(false);
  };

  const handleGoogleSuccess = (result) => {
    setError('');
    setRoleMismatch(null);
    setGoogleNoAccount(false);
    completeLogin(result.user, result.accessToken);
  };

  const handleGoogleNoAccount = () => {
    setError('');
    setRoleMismatch(null);
    setNeedsVerification(false);
    setGoogleNoAccount(true);
  };

  const handleGoogleError = (message) => {
    setGoogleNoAccount(false);
    setRoleMismatch(null);
    setError(message);
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

      {googleNoAccount ? (
        <div style={{
          background: 'var(--primary-bg)', color: 'var(--text)',
          fontSize: '13px', padding: '12px 14px', borderRadius: 'var(--r-md)',
          marginBottom: '16px', lineHeight: 1.6,
        }}>
          No account found for this email.{' '}
          <Link href={signUpHref} style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign up instead
          </Link>.
        </div>
      ) : roleMismatch ? (
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

      {/* Google auth is vendor-only — never offered in an admin context, on
          top of (not instead of) the backend's own role-check lockdown
          (see auth.controller.js's googleAuth()). */}
      {!isAdminContext && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-hint)' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          <GoogleAuthButton
            intent="login"
            onSuccess={handleGoogleSuccess}
            onNoAccount={handleGoogleNoAccount}
            onError={handleGoogleError}
          />
        </>
      )}

      {!isAdminContext && (
        <p style={{ fontSize: '13px', textAlign: 'center', color: 'var(--text-sub)', marginTop: '24px' }}>
          Don&apos;t have an account?{' '}
          <Link href={signUpHref} style={{ color: 'var(--primary)', fontWeight: 500 }}>
            Sign up
          </Link>
        </p>
      )}
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
