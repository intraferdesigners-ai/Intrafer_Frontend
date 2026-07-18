'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import CitySelect from '@/components/ui/CitySelect';
import AuthSplitLayout from '@/components/v2/auth/AuthSplitLayout';
import V2FormField from '@/components/v2/ui/FormField';
import V2Input from '@/components/v2/ui/Input';

const HOMEOWNER_POINTS = [
  'Free to browse and enquire',
  'Get quotes from verified designers',
  'Your contact stays private until you choose',
];
const DESIGNER_POINTS = [
  '10 qualified leads per month',
  'Zero commission on projects',
  'WhatsApp alerts for new leads',
];

function LeftContent({ role }) {
  const isVendor = role === 'vendor';
  return (
    <div>
      <h2 style={{
        fontFamily: 'var(--v2-font-display)', fontSize: 'clamp(26px,3.4vw,36px)',
        fontWeight: 500, color: '#F8F7F4', lineHeight: 1.25, margin: '0 0 28px',
      }}>
        {isVendor
          ? (<>More clients. <span style={{ color: '#3B82F6', fontStyle: 'italic' }}>Less chasing.</span></>)
          : 'Your dream home starts with the right designer.'}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {(isVendor ? DESIGNER_POINTS : HOMEOWNER_POINTS).map(point => (
          <div key={point} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#3B82F6', fontSize: '15px' }}>✓</span>
            <span style={{ fontSize: '14px', color: '#CBD5E1' }}>{point}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  useEffect(() => { document.title = 'Create Account | Intrafer'; }, []);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [city, setCity] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isVendor = role === 'vendor';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) { setError('Name must be at least 2 characters.'); return; }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) { setError('Enter a valid 10-digit Indian mobile number.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }

    setLoading(true);
    try {
      // Matches V1's exact /auth/register payload — businessName/city are collected
      // here for a smoother designer signup, but persisted during profile completion
      // (not this call), since that's the only field set the backend contract proves.
      await api.post('/auth/register', {
        name: name.trim(), email: email.trim(), phone: phone.trim(), password, role,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <AuthSplitLayout left={<LeftContent role={role} />}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: '#DCFCE7', border: '2px solid #16A34A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 style={{
            fontFamily: 'var(--v2-font-display)', fontSize: '26px', fontWeight: 500,
            color: '#0F172A', margin: '0 0 10px',
          }}>
            {isVendor ? 'Your studio is registered!' : 'Welcome to Intrafer!'}
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.65, marginBottom: '28px' }}>
            {isVendor
              ? 'Your designer account is ready. Complete your profile to start receiving leads from homeowners.'
              : 'Your account is ready. Start browsing verified interior designers and submit your first enquiry.'}
          </p>
          <Link href="/auth/login" style={{ display: 'block', textDecoration: 'none' }}>
            <button style={{
              width: '100%', height: '48px', borderRadius: '10px',
              background: '#3B82F6', color: '#FFFFFF', border: 'none',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--v2-font-ui)',
            }}>
              {isVendor ? 'Go to my dashboard' : 'Log in and get started'} →
            </button>
          </Link>
          <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '14px' }}>
            Use the email and password you just created to log in.
          </p>
        </div>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout left={<LeftContent role={role} />}>
      <h1 style={{
        fontFamily: 'var(--v2-font-display)', fontSize: '28px', fontWeight: 500,
        color: '#0F172A', margin: '0 0 6px',
      }}>Create your account</h1>
      <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 24px' }}>
        Join Intrafer — it takes under a minute.
      </p>

      {/* Role toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[['user', '🏠 Homeowner'], ['vendor', '🏢 Designer']].map(([val, label]) => (
          <button
            key={val}
            type="button"
            onClick={() => setRole(val)}
            style={{
              flex: 1, padding: '10px 16px', fontSize: '13px', fontWeight: 500,
              cursor: 'pointer', textAlign: 'center', borderRadius: '10px',
              fontFamily: 'var(--v2-font-ui)', transition: 'all 150ms',
              background: role === val ? '#3B82F6' : 'transparent',
              color: role === val ? '#FFFFFF' : '#64748B',
              border: role === val ? '1.5px solid #3B82F6' : '1.5px solid #CBD5E1',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{
          background: '#FEE2E2', color: '#DC2626', fontSize: '13px',
          padding: '12px 14px', borderRadius: '10px', marginBottom: '16px',
        }}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <V2FormField label="Full name" required>
          <V2Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required />
        </V2FormField>
        <V2FormField label="Email address" required>
          <V2Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        </V2FormField>
        <V2FormField label="Password" required>
          <V2Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" required />
        </V2FormField>

        {isVendor && (
          <>
            <V2FormField label="Business name" required>
              <V2Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Your studio name" required />
            </V2FormField>
            <V2FormField label="Phone number" required>
              <V2Input type="tel" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile number" required />
            </V2FormField>
            <V2FormField label="City" required>
              <CitySelect value={city} onChange={setCity} placeholder="Your city" />
            </V2FormField>
          </>
        )}

        {!isVendor && (
          <V2FormField label="Phone number" required>
            <V2Input type="tel" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile number" required />
          </V2FormField>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', height: '48px', borderRadius: '10px',
            background: '#3B82F6', color: '#FFFFFF', border: 'none',
            fontSize: '14px', fontWeight: 600, cursor: loading ? 'default' : 'pointer',
            fontFamily: 'var(--v2-font-ui)', opacity: loading ? 0.7 : 1, marginTop: '4px',
          }}
        >
          {loading ? 'Creating account…' : (isVendor ? 'List my studio →' : 'Create account →')}
        </button>
      </form>

      <p style={{ fontSize: '13px', textAlign: 'center', color: '#64748B', marginTop: '24px' }}>
        Already have an account?{' '}
        <Link href="/auth/login" style={{ color: '#3B82F6', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
      </p>
    </AuthSplitLayout>
  );
}
