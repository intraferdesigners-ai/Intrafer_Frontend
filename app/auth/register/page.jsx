'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, User, Phone, UserPlus } from 'lucide-react';
import api from '../../../lib/api';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Honeypot from '../../../components/ui/Honeypot';
import AuthSplitCard from '../../../components/auth/AuthSplitCard';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitVendor = searchParams.get('role') === 'vendor';
  const initialRole = explicitVendor ? 'vendor' : 'user';

  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [phone,           setPhone]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role,            setRole]            = useState(initialRole);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const [confirmError,    setConfirmError]    = useState('');
  const [website,         setWebsite]         = useState(''); // honeypot — see components/ui/Honeypot.jsx

  // A vendor-specific entry point (e.g. VendorNavbar's "Vendor login" ->
  // "Sign up") signals role=vendor explicitly, so the toggle starts hidden.
  // The "Not a designer?" escape hatch below can still bring it back for
  // anyone who followed a shared vendor link by mistake.
  const [showRoleToggle, setShowRoleToggle] = useState(!explicitVendor);

  const switchToHomeowner = () => {
    setRole('user');
    setShowRoleToggle(true);
  };

  useEffect(() => { document.title = 'Create account | Intrafer'; }, []);

  // Re-checked on every keystroke of either field (see the Input onChange
  // handlers below) so the mismatch error clears the moment the two fields
  // agree again, rather than lingering until the next submit attempt.
  const checkPasswordsMatch = (pw, confirmPw) => {
    setConfirmError(confirmPw && pw !== confirmPw ? 'Passwords do not match.' : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2)           { setError('Name must be at least 2 characters.'); return; }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) { setError('Enter a valid 10-digit Indian mobile number.'); return; }
    if (password.length < 8)              { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword)     { setConfirmError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        name: name.trim(), email: email.trim(),
        phone: phone.trim(), password, role, website,
      });
      const userId = data.data.userId;
      // Registration now requires OTP verification before the account can
      // log in (see backend register()/login()) — hand off to the same
      // verification step the enquiry flow already uses, rather than
      // showing the account as ready to use immediately.
      router.push(`/auth/register/verify?userId=${userId}&role=${role}&email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AuthSplitCard>
      <Link href="/" style={{ display: 'inline-flex', marginBottom: '20px' }}>
        <Image src="/images/logo/logo.png" alt="Intrafer" width={26} height={26} style={{ objectFit: 'contain' }} />
      </Link>
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: 'var(--primary-bg)', border: '1.5px solid var(--primary-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <UserPlus size={20} color="var(--primary)" strokeWidth={1.8} />
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400,
          letterSpacing: '-.01em', color: 'var(--text)', margin: '0 0 6px',
        }}>
          Create your account
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-hint)', margin: 0 }}>
          Join Intrafer — it takes under a minute.
        </p>
      </div>

      {/* Role toggle — hidden when role=vendor arrived as an explicit signal
          from a vendor-specific entry point (see showRoleToggle above) */}
      {showRoleToggle ? (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          {[['user', "I'm a homeowner"], ['vendor', "I'm a designer"]].map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setRole(val)}
              style={{
                flex: 1, padding: '10px 16px', fontSize: '13px', fontWeight: 500,
                cursor: 'pointer', textAlign: 'center', borderRadius: 'var(--r-md)',
                transition: 'all 150ms ease-out',
                background: role === val ? 'var(--primary-bg)' : 'var(--bg-parchment)',
                color:      role === val ? 'var(--primary)'    : 'var(--text-sub)',
                border:     role === val ? '1.5px solid var(--primary-light)' : '1px solid var(--border)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <div style={{
            flex: 1, padding: '10px 16px', fontSize: '13px', fontWeight: 500,
            textAlign: 'center', borderRadius: 'var(--r-md)',
            background: 'var(--primary-bg)', color: 'var(--primary)',
            border: '1.5px solid var(--primary-light)',
          }}>
            Creating a designer account
          </div>
        </div>
      )}

      <p style={{ fontSize: '12px', color: 'var(--text-hint)', textAlign: 'center', margin: showRoleToggle ? '0 0 20px' : '0 0 8px', lineHeight: 1.5 }}>
        {role === 'vendor'
          ? 'Reach homeowners actively looking for a designer · Manage every enquiry from one dashboard'
          : 'Free to browse and enquire · Verified designers only'}
      </p>

      {!showRoleToggle && (
        <p style={{ textAlign: 'center', margin: '0 0 20px' }}>
          <button
            type="button"
            onClick={switchToHomeowner}
            style={{ background: 'none', border: 'none', padding: 0, fontSize: '12px', color: 'var(--text-hint)', textDecoration: 'underline', cursor: 'pointer' }}
          >
            Not a designer? Register as a homeowner instead
          </button>
        </p>
      )}

      {error && (
        <div style={{
          background: 'var(--danger-bg)', color: 'var(--danger)',
          fontSize: '13px', padding: '12px 14px', borderRadius: 'var(--r-md)',
          marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Honeypot value={website} onChange={(e) => setWebsite(e.target.value)} />
        <Input label="Full name"     icon={User}  value={name}     onChange={(e) => setName(e.target.value)}     placeholder="Your full name"         required />
        <Input label="Email address" type="email" icon={Mail}  value={email}    onChange={(e) => setEmail(e.target.value)}    placeholder="you@example.com"        required />
        <Input label="Phone number"  type="tel"   icon={Phone} value={phone}    onChange={(e) => setPhone(e.target.value)}    placeholder="10-digit mobile number" inputMode="numeric" maxLength={10} hint="10-digit Indian mobile number" required />
        <Input label="Password"      type="password" icon={Lock} value={password} onChange={(e) => { setPassword(e.target.value); checkPasswordsMatch(e.target.value, confirmPassword); }} placeholder="Min. 8 characters"    hint="Minimum 8 characters" required />
        <Input label="Confirm password" type="password" icon={Lock} value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); checkPasswordsMatch(password, e.target.value); }} placeholder="Re-enter your password" error={confirmError} required />

        <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', marginTop: '4px' }}>
          Create account
        </Button>
      </form>

      <p style={{ fontSize: '13px', textAlign: 'center', color: 'var(--text-sub)', marginTop: '24px' }}>
        Already have an account?{' '}
        <Link href="/auth/login" style={{ color: 'var(--primary)', fontWeight: 500 }}>
          Sign in
        </Link>
      </p>
    </AuthSplitCard>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterContent />
    </Suspense>
  );
}
