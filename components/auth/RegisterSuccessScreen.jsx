'use client';

import Link from 'next/link';
import Image from 'next/image';

// Shown once OTP verification completes at the end of registration (see
// app/auth/register/verify/page.jsx). Previously lived inline in
// app/auth/register/page.jsx and was shown right after register() itself —
// moved here unchanged since it now only applies post-verification.
export default function RegisterSuccessScreen({ role, ctaHref = '/auth/login' }) {
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
            ? 'Your designer account is ready. Complete your profile and subscribe to start receiving leads from homeowners.'
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
            // Order matches the actual gate, not a suggested reading order:
            // the backend rejects portfolio uploads with a 403 until a
            // subscription is active (see createProject in
            // vendor.controller.js), so subscribing has to come before
            // uploading projects — same Profile -> Subscribe -> Portfolio
            // sequence OnboardingChecklist.jsx enforces in the dashboard.
            { icon: '👤', step: '01', title: 'Complete profile', desc: 'Add bio, city, specialisations' },
            { icon: '💳', step: '02', title: 'Subscribe', desc: 'Activate your listing' },
            { icon: '🖼', step: '03', title: 'Upload projects', desc: 'Show your best work' },
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
        <Link href={ctaHref} style={{ display: 'block' }}>
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
            {role === 'vendor' ? 'Go to my dashboard' : 'Start browsing designers'}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </Link>
      </div>
    </div>
  );
}
