'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isAuthenticated } from '../../../lib/auth';

const HOW_IT_WORKS = [
  { n: '1', title: 'Share your referral code', desc: 'Send your unique code to a friend who is planning a home interior.' },
  { n: '2', title: 'Friend books a designer', desc: 'Your friend submits an enquiry and books a verified designer through Intrafer.' },
  { n: '3', title: 'You earn ₹2,000', desc: 'Your account gets credited ₹2,000 off your next booking once their project is confirmed.' },
  { n: '4', title: 'Friend saves ₹1,000', desc: 'Your friend automatically receives ₹1,000 off their first booking.' },
];

function randomCode() {
  return 'INTRA-' + Math.random().toString(36).toUpperCase().substring(2, 8);
}

export default function ReferAFriendPage() {
  const [authed, setAuthed] = useState(false);
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  useEffect(() => {
    document.title = 'Refer a Friend | Intrafer';
    setAuthed(isAuthenticated());
    setCode(randomCode());
  }, []);

  function copyCode() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const shareUrl = `https://intrafer.com?ref=${code}`;

  if (!authed) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '120px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 400, color: 'var(--text)', marginBottom: '12px' }}>
          Sign in to refer friends
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-mid)', marginBottom: '28px' }}>
          You need to be logged in to access your referral code and start earning rewards.
        </p>
        <Link href="/auth/login" style={{
          display: 'inline-block', background: 'var(--primary)', color: '#fff',
          padding: '13px 32px', borderRadius: 'var(--r-md)', fontSize: '14px',
          fontWeight: 500, textDecoration: 'none',
        }}>
          Login to continue
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '108px 40px 80px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎁</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,5vw,48px)', fontWeight: 400, color: 'var(--text)', marginBottom: '12px', letterSpacing: '-.02em' }}>
          Refer a friend, earn ₹2,000
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-mid)', maxWidth: '480px', margin: '0 auto' }}>
          Share your referral code. When your friend books through Intrafer, you both save.
        </p>
      </div>

      {/* Referral code box */}
      <div style={{
        background: 'var(--surface)', border: '2px solid var(--primary)',
        borderRadius: '20px', padding: '32px', textAlign: 'center', marginBottom: '48px',
      }}>
        <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '.1em', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '12px' }}>
          YOUR REFERRAL CODE
        </p>
        <div style={{
          fontFamily: 'var(--font-mono, monospace)', fontSize: '32px', fontWeight: 700,
          color: 'var(--text)', letterSpacing: '.1em',
          background: 'var(--primary-bg)', padding: '16px 32px',
          borderRadius: '12px', marginBottom: '20px', display: 'inline-block',
        }}>
          {code}
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={copyCode}
            style={{
              padding: '11px 28px', background: copied ? '#22c55e' : 'var(--primary)',
              color: '#fff', border: 'none', borderRadius: 'var(--r-md)',
              fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              transition: 'background 200ms',
            }}
          >
            {copied ? '✓ Copied!' : 'Copy code'}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Use my referral code ${code} to get ₹1,000 off your first interior design booking on Intrafer! ${shareUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '11px 28px', background: '#25D366',
              color: '#fff', borderRadius: 'var(--r-md)',
              fontSize: '13px', fontWeight: 500, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: '6px',
            }}
          >
            Share on WhatsApp
          </a>
        </div>
      </div>

      {/* How it works */}
      <h2 className="section-heading" style={{ marginBottom: '28px', textAlign: 'center' }}>How it works</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '48px' }} className="grid-mobile-1">
        {HOW_IT_WORKS.map((step) => (
          <div key={step.n} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'var(--primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 700, marginBottom: '12px',
            }}>{step.n}</div>
            <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>{step.title}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-mid)', lineHeight: 1.6 }}>{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Terms accordion */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <button
          onClick={() => setTermsOpen((v) => !v)}
          style={{
            width: '100%', padding: '16px 20px', background: 'none',
            border: 'none', display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', cursor: 'pointer', fontSize: '14px',
            fontWeight: 500, color: 'var(--text)',
          }}
        >
          Terms & conditions
          <span style={{ transform: termsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms', color: 'var(--text-hint)' }}>▼</span>
        </button>
        <div style={{ maxHeight: termsOpen ? '400px' : '0', overflow: 'hidden', transition: 'max-height 250ms ease' }}>
          <div style={{ padding: '0 20px 20px', fontSize: '13px', color: 'var(--text-mid)', lineHeight: 1.75 }}>
            <p style={{ marginBottom: '8px' }}>• Referral rewards are credited only when the referred friend completes a booking worth ₹1 lakh or more.</p>
            <p style={{ marginBottom: '8px' }}>• The ₹2,000 referrer reward can be used against your next Intrafer booking within 12 months.</p>
            <p style={{ marginBottom: '8px' }}>• The ₹1,000 friend discount applies to their first booking only.</p>
            <p style={{ marginBottom: '8px' }}>• Each referral code is single-use per person. Multiple accounts are not allowed.</p>
            <p style={{ marginBottom: '8px' }}>• Intrafer reserves the right to modify or discontinue the referral programme at any time.</p>
            <p>• Rewards cannot be transferred, combined with other offers, or redeemed as cash.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
