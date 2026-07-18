'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';
import { setAuthTokens } from '@/lib/auth';
import AuthSplitLayout from '@/components/v2/auth/AuthSplitLayout';
import V2FormField from '@/components/v2/ui/FormField';
import V2Input from '@/components/v2/ui/Input';

const TRUST_POINTS = [
  '480+ verified designers',
  'Real portfolios, real reviews',
  'Free to browse and enquire',
];

function LeftContent() {
  return (
    <div>
      <p style={{
        fontFamily: 'var(--v2-font-display)', fontSize: 'clamp(24px,3vw,32px)',
        fontStyle: 'italic', fontWeight: 400, color: '#F8F7F4',
        lineHeight: 1.4, margin: '0 0 20px',
      }}>
        "Your home is the one place in the world where you can be exactly who you are."
      </p>
      <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '36px' }}>— The Intrafer promise</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {TRUST_POINTS.map(point => (
          <div key={point} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#3B82F6', fontSize: '15px' }}>✓</span>
            <span style={{ fontSize: '14px', color: '#CBD5E1' }}>{point}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LoginPage() {
  useEffect(() => { document.title = 'Log In | Intrafer'; }, []);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { accessToken, user } = data.data;
      setAuthTokens(accessToken, user.role);
      useAuthStore.getState().setAuth(user, accessToken);
      toast.success('Welcome back, ' + user.name + '!');
      if (user.role === 'admin') router.push('/admin/dashboard');
      else if (user.role === 'vendor') router.push('/vendor/dashboard');
      else router.push('/user/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <AuthSplitLayout left={<LeftContent />}>
      <h1 style={{
        fontFamily: 'var(--v2-font-display)', fontSize: '28px', fontWeight: 500,
        color: '#0F172A', margin: '0 0 6px',
      }}>Welcome back</h1>
      <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 28px' }}>
        Sign in to your Intrafer account
      </p>

      {error && (
        <div style={{
          background: '#FEE2E2', color: '#DC2626', fontSize: '13px',
          padding: '12px 14px', borderRadius: '10px', marginBottom: '16px',
        }}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <V2FormField label="Email address" required>
          <V2Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        </V2FormField>

        <V2FormField label="Password" required>
          <V2Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          <div style={{ textAlign: 'right', marginTop: '8px' }}>
            <Link href="/auth/forgot-password" style={{ fontSize: '12px', color: '#3B82F6', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>
        </V2FormField>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', height: '48px', borderRadius: '10px',
            background: '#3B82F6', color: '#FFFFFF', border: 'none',
            fontSize: '14px', fontWeight: 600, cursor: loading ? 'default' : 'pointer',
            fontFamily: 'var(--v2-font-ui)', opacity: loading ? 0.7 : 1,
            marginTop: '4px',
          }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
        <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
        <span style={{ fontSize: '12px', color: '#94A3B8' }}>or</span>
        <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
      </div>

      <button
        type="button"
        disabled
        style={{
          width: '100%', padding: '10px 16px',
          background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          fontSize: '13px', fontWeight: 500, color: '#334155',
          cursor: 'not-allowed', opacity: 0.6, fontFamily: 'var(--v2-font-ui)',
        }}
      >
        <span style={{
          width: '18px', height: '18px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #4285F4 25%, #34A853 50%, #FBBC05 75%, #EA4335 100%)',
          display: 'inline-block', flexShrink: 0,
        }} />
        Continue with Google
      </button>

      <p style={{ fontSize: '13px', textAlign: 'center', color: '#64748B', marginTop: '24px' }}>
        Don't have an account?{' '}
        <Link href="/auth/register" style={{ color: '#3B82F6', fontWeight: 500, textDecoration: 'none' }}>Sign up</Link>
      </p>
    </AuthSplitLayout>
  );
}
