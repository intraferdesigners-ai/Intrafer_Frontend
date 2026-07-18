'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, MailCheck, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import AuthSplitLayout from '@/components/v2/auth/AuthSplitLayout';
import V2FormField from '@/components/v2/ui/FormField';
import V2Input from '@/components/v2/ui/Input';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
      <p style={{ fontSize: '13px', color: '#64748B' }}>— The Intrafer promise</p>
    </div>
  );
}

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
      <AuthSplitLayout left={<LeftContent />}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(59,130,246,0.08)',
            border: '2px solid rgba(59,130,246,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <MailCheck size={28} color="#3B82F6" strokeWidth={1.8} />
          </div>

          <h1 style={{
            fontFamily: 'var(--v2-font-display)', fontSize: '26px', fontWeight: 500,
            color: '#0F172A', margin: '0 0 10px', letterSpacing: '-.01em',
          }}>
            Check your email
          </h1>

          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.65, marginBottom: '8px' }}>
            If <strong>{email}</strong> is registered on Intrafer, you&apos;ll receive a password reset link shortly.
          </p>

          <p style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.6, marginBottom: '28px' }}>
            Check your spam folder if you don&apos;t see it within a few minutes.
          </p>

          <Link href="/auth/login" style={{ display: 'block', textDecoration: 'none' }}>
            <button style={{
              width: '100%', height: '48px', borderRadius: '10px',
              background: '#3B82F6', color: '#FFFFFF', border: 'none',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--v2-font-ui)',
            }}>
              Back to login
            </button>
          </Link>

          <button
            onClick={() => { setSent(false); setEmail(''); }}
            style={{
              marginTop: '12px', background: 'none', border: 'none',
              fontSize: '13px', color: '#94A3B8',
              cursor: 'pointer', textDecoration: 'underline',
              textDecorationStyle: 'dotted', textUnderlineOffset: '3px',
              fontFamily: 'var(--v2-font-ui)',
            }}
          >
            Try a different email
          </button>
        </div>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout left={<LeftContent />}>
      <Link href="/auth/login" style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        fontSize: '13px', color: '#94A3B8',
        textDecoration: 'none', marginBottom: '24px',
      }}>
        <ArrowLeft size={16} />
        Back to login
      </Link>

      <h1 style={{
        fontFamily: 'var(--v2-font-display)', fontSize: '28px', fontWeight: 500,
        color: '#0F172A', margin: '0 0 6px',
      }}>Forgot password?</h1>
      <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 28px' }}>
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>

      {error && (
        <div style={{
          background: '#FEE2E2', color: '#DC2626', fontSize: '13px',
          padding: '12px 14px', borderRadius: '10px', marginBottom: '16px',
        }}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <V2FormField label="Email address" required>
          <V2Input
            type="email"
            icon={<Mail size={16} />}
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            placeholder="you@example.com"
            autoFocus
            required
          />
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
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

      <p style={{ fontSize: '13px', textAlign: 'center', color: '#64748B', marginTop: '24px' }}>
        Remember your password?{' '}
        <Link href="/auth/login" style={{ color: '#3B82F6', fontWeight: 500, textDecoration: 'none' }}>
          Sign in
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
