'use client'
import Link from 'next/link';
import Image from 'next/image';

const NAV_LINKS = [
  { label: 'How it works',    href: '#how-it-works' },
  { label: 'Pricing',         href: '#pricing' },
  { label: 'Success stories', href: '#testimonials' },
  { label: 'Resources',       href: '/blog' },
];

export default function DesignerNavbar() {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      height: '60px',
      background: '#020617',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center',
      padding: '0 clamp(16px, 4vw, 36px)',
      justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <Link href="/designers" style={{
        display: 'flex', alignItems: 'center',
        gap: '10px', textDecoration: 'none', flexShrink: 0,
      }}>
        <div style={{
          width: '32px', height: '32px',
          background: '#3B82F6',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', overflow: 'hidden',
        }}>
          <Image
            src="/images/logo/logo.png"
            alt="Intrafer"
            width={28} height={28}
            style={{ objectFit: 'contain' }}
          />
        </div>
        <span style={{
          fontFamily: 'var(--v2-font-display)',
          fontSize: '20px', fontWeight: 500,
          color: '#F8F7F4',
          letterSpacing: '-0.03em',
        }}>
          Intrafer
        </span>
        <span style={{
          fontFamily: 'var(--v2-font-ui)',
          fontSize: '9px', fontWeight: 700,
          letterSpacing: '.1em', textTransform: 'uppercase',
          color: '#3B82F6',
          marginLeft: '2px',
        }}>
          for designers
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }} className="hide-mobile">
        {NAV_LINKS.map(link => (
          <Link key={link.label} href={link.href} style={{
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '13px', fontWeight: 400,
            color: '#94A3B8',
            textDecoration: 'none',
            transition: 'background 150ms, color 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#F8F7F4'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Link href="/auth/login" style={{ textDecoration: 'none' }} className="hide-mobile">
          <button style={{
            fontSize: '13px', fontWeight: 500,
            color: '#94A3B8',
            background: 'transparent',
            border: '1.5px solid rgba(255,255,255,0.1)',
            padding: '8px 18px', borderRadius: '8px',
            cursor: 'pointer', fontFamily: 'var(--v2-font-ui)',
          }}>
            Log in
          </button>
        </Link>

        <Link href="/auth/register" style={{ textDecoration: 'none' }}>
          <button style={{
            fontSize: '13px', fontWeight: 600,
            color: '#FFFFFF',
            background: '#3B82F6',
            border: 'none',
            padding: '9px 20px', borderRadius: '8px',
            cursor: 'pointer', fontFamily: 'var(--v2-font-ui)',
            transition: 'background 150ms',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
          onMouseLeave={e => e.currentTarget.style.background = '#3B82F6'}
          >
            Start free →
          </button>
        </Link>
      </div>
    </nav>
  );
}
