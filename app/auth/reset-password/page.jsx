'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword]  = useState('');
  const [loading,         setLoading]          = useState(false);
  const [error,           setError]            = useState('');
  const [done,            setDone]             = useState(false);

  useEffect(() => { document.title = 'Reset password | Intrafer'; }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) return setError('This reset link is missing its token. Please request a new one.');
    if (password.length < 8) return setError('Password must be at least 8 characters');
    if (password !== confirmPassword) return setError('Passwords do not match');

    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      toast.success('Password reset successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'This reset link is invalid or has expired. Please request a new one.');
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-2xl)', padding: '40px', width: '100%',
        maxWidth: '420px', boxShadow: 'var(--shadow-lg)', textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 400,
          color: 'var(--text)', marginBottom: '10px',
        }}>
          Invalid reset link
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-mid)', marginBottom: '24px' }}>
          This link is missing its reset token. Please request a new password reset link.
        </p>
        <Link href="/auth/forgot-password">
          <Button variant="primary" size="lg" style={{ width: '100%' }}>
            Request new link
          </Button>
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-2xl)', padding: 'clamp(28px, 5vw, 48px)', width: '100%',
        maxWidth: '440px', boxShadow: 'var(--shadow-lg)', textAlign: 'center',
      }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'var(--primary-bg)', border: '2px solid var(--primary-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <CheckCircle2 size={36} color="var(--primary)" strokeWidth={1.8} />
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 4vw, 28px)',
          fontWeight: 400, color: 'var(--text)', marginBottom: '10px', letterSpacing: '-.02em',
        }}>
          Password reset
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-mid)', lineHeight: 1.65, marginBottom: '32px' }}>
          Your password has been updated. Please sign in with your new password.
        </p>
        <Button variant="primary" size="lg" style={{ width: '100%' }} onClick={() => router.push('/auth/login')}>
          Back to login
        </Button>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-2xl)', padding: '40px', width: '100%',
      maxWidth: '420px', boxShadow: 'var(--shadow-lg)',
    }}>
      <Link href="/auth/login" style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        fontSize: '13px', color: 'var(--text-hint)', textDecoration: 'none', marginBottom: '24px',
      }}>
        <ArrowLeft size={16} />
        Back to login
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
          Set a new password
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-hint)', margin: 0 }}>
          Choose a new password for your Intrafer account.
        </p>
      </div>

      {error && (
        <div style={{
          background: 'var(--danger-bg)', color: 'var(--danger)',
          fontSize: '13px', padding: '12px 14px', borderRadius: 'var(--r-md)', marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input
          label="New password"
          type="password"
          icon={Lock}
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }}
          placeholder="••••••••"
          autoFocus
          required
        />
        <Input
          label="Confirm new password"
          type="password"
          icon={Lock}
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
          placeholder="••••••••"
          required
        />

        <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', marginTop: '8px' }}>
          Reset password
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
