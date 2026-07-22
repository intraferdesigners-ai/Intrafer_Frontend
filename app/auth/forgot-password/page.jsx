'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, MailCheck, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import AuthSplitCard from '@/components/auth/AuthSplitCard';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => { document.title = 'Forgot password | Intrafer'; }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim())              return setError('Please enter your email address');
    if (!EMAIL_REGEX.test(email))   return setError('Please enter a valid email');

    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
    } catch {
      // Always show the sent state — don't reveal whether the email exists
    }
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 10,
        minHeight: '100vh', background: 'var(--bg)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 20px', overflowY: 'auto',
      }}>
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          textDecoration: 'none', marginBottom: '48px',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: '#FFFFFF', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,.15)',
          }}>
            <Image src="/images/logo/logo.png" alt="Intrafer"
              width={30} height={30} style={{ objectFit: 'contain' }} />
          </div>
          <span style={{
            fontFamily: 'var(--font-ui)', fontWeight: 800,
            fontSize: '18px', color: 'var(--text)',
            letterSpacing: '-0.03em',
          }}>Intrafer</span>
        </Link>

        <div style={{
          width: '100%', maxWidth: '440px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-2xl)',
          padding: 'clamp(28px, 5vw, 48px)',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'var(--primary-bg)',
            border: '2px solid var(--primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <MailCheck size={36} color="var(--primary)" strokeWidth={1.8} />
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(22px, 4vw, 28px)',
            fontWeight: 400, color: 'var(--text)',
            marginBottom: '10px', letterSpacing: '-.02em',
          }}>
            Check your email
          </h1>

          <p style={{
            fontSize: '15px', color: 'var(--text-mid)',
            lineHeight: 1.65, marginBottom: '8px',
          }}>
            If <strong>{email}</strong> is registered on Intrafer,
            you&apos;ll receive a password reset link shortly.
          </p>

          <p style={{
            fontSize: '13px', color: 'var(--text-hint)',
            lineHeight: 1.6, marginBottom: '32px',
          }}>
            Check your spam folder if you don&apos;t see it within a few minutes.
          </p>

          <Link href="/auth/login">
            <Button variant="primary" size="lg" style={{ width: '100%' }}>
              Back to login
            </Button>
          </Link>

          <button
            onClick={() => { setSent(false); setEmail(''); }}
            style={{
              marginTop: '12px', background: 'none', border: 'none',
              fontSize: '13px', color: 'var(--text-hint)',
              cursor: 'pointer', textDecoration: 'underline',
              textDecorationStyle: 'dotted', textUnderlineOffset: '3px',
            }}
          >
            Try a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthSplitCard>
      <Image src="/images/logo/logo.png" alt="Intrafer" width={26} height={26} style={{ objectFit: 'contain', marginBottom: '20px' }} />
      <Link href="/auth/login" style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        fontSize: '13px', color: 'var(--text-hint)',
        textDecoration: 'none', marginBottom: '24px',
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
          <Mail size={20} color="var(--primary)" strokeWidth={1.8} />
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400,
          letterSpacing: '-.01em', color: 'var(--text)', margin: '0 0 6px',
        }}>
          Forgot password?
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-hint)', margin: 0 }}>
          Enter your email and we&apos;ll send you a link to reset your password.
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
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          placeholder="you@example.com"
          autoFocus
          required
        />

        <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', marginTop: '8px' }}>
          Send reset link
        </Button>
      </form>

      <p style={{ fontSize: '13px', textAlign: 'center', color: 'var(--text-sub)', marginTop: '24px' }}>
        Remember your password?{' '}
        <Link href="/auth/login" style={{ color: 'var(--primary)', fontWeight: 500 }}>
          Sign in
        </Link>
      </p>
    </AuthSplitCard>
  );
}
