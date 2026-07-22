'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, User, Phone, UserPlus } from 'lucide-react';
import api from '../../../lib/api';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

export default function RegisterPage() {
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

    if (name.trim().length < 2)           { setError('Name must be at least 2 characters.'); return; }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) { setError('Enter a valid 10-digit Indian mobile number.'); return; }
    if (password.length < 8)              { setError('Password must be at least 8 characters.'); return; }

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

  const cardStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-2xl)',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: 'var(--shadow-lg)',
  };

  if (success) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        overflowY: 'auto',
      }}>
        {/* Decorative background blobs */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: '240px', height: '240px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,163,74,.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo at top */}
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          textDecoration: 'none', marginBottom: '48px',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: '#FFFFFF', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
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

        {/* Main card */}
        <div style={{
          width: '100%', maxWidth: '520px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '24px',
          padding: 'clamp(28px, 5vw, 48px)',
          textAlign: 'center',
          boxShadow: '0 8px 40px rgba(15,23,42,.08)',
          position: 'relative',
        }}>
          {/* Animated success circle */}
          <div style={{
            width: '88px', height: '88px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',
            border: '2px solid var(--success)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 28px',
            boxShadow: '0 8px 24px rgba(22,163,74,.2)',
            animation: 'scaleIn 500ms cubic-bezier(.34,1.56,.64,1) forwards',
          }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
              stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"
              strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>

          {/* Heading */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(26px, 4vw, 36px)',
            fontWeight: 400, color: 'var(--text)',
            marginBottom: '10px', letterSpacing: '-.02em',
            lineHeight: 1.2,
          }}>
            {role === 'vendor'
              ? 'Your studio is registered! 🎨'
              : 'Welcome to Intrafer! 🏠'}
          </h1>

          {/* Subheading */}
          <p style={{
            fontSize: '15px', color: 'var(--text-mid)',
            lineHeight: 1.65, marginBottom: '32px',
            maxWidth: '380px', margin: '0 auto 32px',
          }}>
            {role === 'vendor'
              ? 'Your designer account is ready. Complete your profile to start receiving leads from homeowners.'
              : 'Your account is ready. Start browsing verified interior designers and submit your first enquiry.'}
          </p>

          {/* Divider with label */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            marginBottom: '20px',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-hint)',
              fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}>
              What&apos;s next
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          {/* Next steps grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: role === 'vendor' ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
            gap: '10px',
            marginBottom: '28px',
          }}>
            {(role === 'vendor' ? [
              { icon: '👤', step: '01', title: 'Complete profile', desc: 'Add bio, city, specialisations' },
              { icon: '🖼', step: '02', title: 'Upload projects', desc: 'Show your best work' },
              { icon: '💳', step: '03', title: 'Subscribe', desc: 'Start receiving leads' },
            ] : [
              { icon: '🔍', step: '01', title: 'Browse designers', desc: 'Find verified studios near you' },
              { icon: '📋', step: '02', title: 'Submit enquiry', desc: 'Free, takes 2 minutes' },
            ]).map(item => (
              <div key={item.step} style={{
                background: 'var(--bg-parchment)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-lg)',
                padding: '14px 10px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '26px', marginBottom: '6px' }}>{item.icon}</div>
                <div style={{
                  fontSize: '10px', fontWeight: 700, color: 'var(--primary)',
                  letterSpacing: '.08em', marginBottom: '4px',
                }}>{item.step}</div>
                <div style={{
                  fontSize: '12px', fontWeight: 600,
                  color: 'var(--text)', marginBottom: '3px',
                }}>{item.title}</div>
                <div style={{
                  fontSize: '11px', color: 'var(--text-hint)',
                  lineHeight: 1.4,
                }}>{item.desc}</div>
              </div>
            ))}
          </div>

          {/* CTA button */}
          <Link href="/auth/login" style={{ display: 'block' }}>
            <button style={{
              width: '100%', height: '52px',
              background: 'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)',
              color: '#fff', border: 'none',
              borderRadius: 'var(--r-lg)',
              fontSize: '16px', fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(59,130,246,.35)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '8px',
              transition: 'transform 150ms, box-shadow 150ms',
            }}>
              {role === 'vendor' ? 'Go to my dashboard' : 'Log in and get started'}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </Link>

          {/* Helper text */}
          <p style={{
            fontSize: '12px', color: 'var(--text-hint)',
            marginTop: '14px',
          }}>
            Use the email and password you just created to log in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
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

      {/* Role toggle */}
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

      <p style={{ fontSize: '12px', color: 'var(--text-hint)', textAlign: 'center', margin: '0 0 20px', lineHeight: 1.5 }}>
        {role === 'vendor'
          ? 'Reach homeowners actively looking for a designer · Manage every enquiry from one dashboard'
          : 'Free to browse and enquire · Verified designers only'}
      </p>

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
        <Input label="Full name"     icon={User}  value={name}     onChange={(e) => setName(e.target.value)}     placeholder="Your full name"         required />
        <Input label="Email address" type="email" icon={Mail}  value={email}    onChange={(e) => setEmail(e.target.value)}    placeholder="you@example.com"        required />
        <Input label="Phone number"  type="tel"   icon={Phone} value={phone}    onChange={(e) => setPhone(e.target.value)}    placeholder="10-digit mobile number" inputMode="numeric" maxLength={10} hint="10-digit Indian mobile number" required />
        <Input label="Password"      type="password" icon={Lock} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters"    hint="Minimum 8 characters" required />

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
    </div>
  );
}
