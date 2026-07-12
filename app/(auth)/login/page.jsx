'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../lib/api';
import useAuthStore from '../../../store/authStore';
import { setAuthTokens } from '../../../lib/auth';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const CARD = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-xl)',
  padding: 36,
  width: '100%',
  maxWidth: 400,
};

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => { document.title = 'Login | Intrafer'; }, []);

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
      if (user.role === 'admin')       router.push('/admin/dashboard');
      else if (user.role === 'vendor') router.push('/vendor/dashboard');
      else                             router.push('/user/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={CARD}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 300,
          letterSpacing: '-0.01em', color: 'var(--color-text)', margin: '0 0 6px',
        }}>
          Welcome back
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-sub)', margin: 0 }}>
          Sign in to your Intrafer account
        </p>
      </div>

      {error && (
        <div style={{
          background: 'var(--color-danger-bg)', color: 'var(--color-danger)',
          fontSize: 13, padding: '12px 14px', borderRadius: 'var(--radius-md)',
          marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
          <div style={{ textAlign: 'right', marginTop: 6 }}>
            <Link
              href="/auth/forgot-password"
              style={{ fontSize: 12, color: 'var(--color-primary)', textDecoration: 'none' }}
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          style={{ width: '100%', marginTop: 8 }}
        >
          Sign in
        </Button>
      </form>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
        <span style={{ fontSize: 12, color: 'var(--color-text-hint)' }}>or</span>
        <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
      </div>

      {/* Google placeholder */}
      <button
        type="button"
        disabled
        style={{
          width: '100%', padding: '10px 16px',
          background: 'var(--color-surface-alt)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontSize: 13, fontWeight: 500, color: 'var(--color-text-sub)',
          cursor: 'not-allowed', opacity: 0.7,
        }}
      >
        <span style={{
          width: 18, height: 18, borderRadius: '50%',
          background: 'linear-gradient(135deg, #4285F4 25%, #34A853 50%, #FBBC05 75%, #EA4335 100%)',
          display: 'inline-block', flexShrink: 0,
        }} />
        Continue with Google
      </button>

      <p style={{ fontSize: 13, textAlign: 'center', color: 'var(--color-text-sub)', marginTop: 24 }}>
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>
          Sign up
        </Link>
      </p>
    </div>
  );
}
