'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Phone, CheckCircle } from 'lucide-react';
import api from '../../../lib/api';
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

export default function RegisterPage() {
  const router = useRouter();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [phone,    setPhone]    = useState('');
  const [password, setPassword] = useState('');
  const [role,     setRole]     = useState('user');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState(false);

  useEffect(() => { document.title = 'Create account | Intrafer'; }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setError('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: name.trim(), email: email.trim(),
        phone: phone.trim(), password, role,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ ...CARD, textAlign: 'center' }}>
        <CheckCircle size={48} color="var(--color-success)" style={{ marginBottom: 16 }} />
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 300,
          color: 'var(--color-text)', margin: '0 0 10px',
        }}>
          Account created!
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-sub)', margin: '0 0 28px', lineHeight: 1.7 }}>
          {role === 'vendor'
            ? 'Your designer account is ready. Complete your profile after logging in.'
            : 'Your account is ready. Log in to continue.'}
        </p>
        <Button
          variant="primary"
          size="lg"
          style={{ width: '100%' }}
          onClick={() => router.push('/auth/login')}
        >
          Go to login
        </Button>
      </div>
    );
  }

  const roleBtn = (val, label) => ({
    flex: 1, padding: '10px 16px', fontSize: 13, fontWeight: 500,
    cursor: 'pointer', textAlign: 'center', borderRadius: 'var(--radius-md)',
    transition: 'all 150ms ease-out',
    ...(role === val
      ? { background: 'var(--color-primary-bg)', color: 'var(--color-primary)', border: '1.5px solid var(--color-accent)' }
      : { background: 'var(--color-surface-alt)', color: 'var(--color-text-sub)', border: '1px solid var(--color-border)' }
    ),
  });

  return (
    <div style={CARD}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 300,
          letterSpacing: '-0.01em', color: 'var(--color-text)', margin: '0 0 6px',
        }}>
          Create your account
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-sub)', margin: 0 }}>
          Join Intrafer — it takes under a minute.
        </p>
      </div>

      {/* Role toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button type="button" style={roleBtn('user')}   onClick={() => setRole('user')}>
          I&apos;m a homeowner
        </button>
        <button type="button" style={roleBtn('vendor')} onClick={() => setRole('vendor')}>
          I&apos;m a designer
        </button>
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

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input
          label="Full name"
          icon={User}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          required
        />
        <Input
          label="Email address"
          type="email"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        <Input
          label="Phone number"
          type="tel"
          icon={Phone}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="10-digit mobile number"
          inputMode="numeric"
          maxLength={10}
          hint="10-digit Indian mobile number"
          required
        />
        <Input
          label="Password"
          type="password"
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 8 characters"
          hint="Minimum 8 characters"
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          style={{ width: '100%', marginTop: 4 }}
        >
          Create account
        </Button>
      </form>

      <p style={{ fontSize: 13, textAlign: 'center', color: 'var(--color-text-sub)', marginTop: 24 }}>
        Already have an account?{' '}
        <Link href="/auth/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
