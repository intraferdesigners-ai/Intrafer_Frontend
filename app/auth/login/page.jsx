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
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-2xl)',
      padding: '40px',
      width: '100%',
      maxWidth: '420px',
      boxShadow: 'var(--shadow-lg)',
    }}>
      <div style={{ marginBottom: '28px' }}>
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

      {error && (
        <div style={{
          background: 'var(--danger-bg)', color: 'var(--danger)',
          fontSize: '13px', padding: '12px 14px', borderRadius: 'var(--r-md)',
          marginBottom: '16px',
        }}>
          {error}
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
    </div>
  );
}
