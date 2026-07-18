'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const NAV_LINKS = [
  {
    label: 'Find designers',
    href: '/vendors',
    dropdown: [
      { label: 'All designers', href: '/vendors' },
      { label: 'Bangalore', href: '/cities/bangalore' },
      { label: 'Mumbai', href: '/cities/mumbai' },
      { label: 'Delhi NCR', href: '/cities/delhi' },
      { label: 'Design gallery', href: '/gallery' },
    ],
  },
  {
    label: 'Design ideas',
    href: '/design-styles',
    dropdown: [
      { label: 'Modern', href: '/design-styles/modern' },
      { label: 'Scandinavian', href: '/design-styles/scandinavian' },
      { label: 'Luxury', href: '/design-styles/luxury' },
      { label: 'Minimalist', href: '/design-styles/minimalist' },
      { label: 'Traditional', href: '/design-styles/traditional' },
    ],
  },
  {
    label: 'Calculators',
    href: '/cost-calculator',
    dropdown: [
      { label: 'Cost calculator', href: '/cost-calculator' },
      { label: 'Wardrobe calculator', href: '/wardrobe-calculator' },
    ],
  },
  { label: 'Blog', href: '/blog' },
];

export default function V2Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 100,
        height: '60px',
        background: scrolled ? 'rgba(248,247,244,0.95)' : '#F8F7F4',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: '1px solid rgba(15,23,42,0.08)',
        transition: 'background 300ms var(--v2-ease), border-color 300ms var(--v2-ease)',
        display: 'flex', alignItems: 'center',
        padding: '0 clamp(16px, 4vw, 36px)',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{
          display: 'flex', alignItems: 'center',
          gap: '10px', textDecoration: 'none', flexShrink: 0,
        }}>
          <div style={{
            width: '32px', height: '32px',
            background: '#0F172A',
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
            color: '#0F172A',
            letterSpacing: '-0.03em',
          }}>
            Intrafer
          </span>
        </Link>

        {/* Desktop nav links */}
        <div style={{
          display: 'flex', gap: '4px', alignItems: 'center',
        }} className="hide-mobile">
          {NAV_LINKS.map(link => (
            <div
              key={link.label}
              style={{ position: 'relative' }}
              onMouseEnter={() => link.dropdown && setOpenMenu(link.label)}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <Link href={link.href} style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px', fontWeight: '400',
                color: '#475569',
                textDecoration: 'none',
                transition: 'background 150ms, color 150ms',
                background: openMenu === link.label ? 'rgba(15,23,42,0.05)' : 'transparent',
              }}>
                {link.label}
                {link.dropdown && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )}
              </Link>

              {/* Dropdown */}
              {link.dropdown && openMenu === link.label && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 4px)',
                  left: '50%', transform: 'translateX(-50%)',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '8px',
                  minWidth: '180px',
                  boxShadow: '0 8px 32px rgba(15,23,42,0.12)',
                  zIndex: 200,
                }}>
                  {link.dropdown.map(item => (
                    <Link key={item.href} href={item.href} style={{
                      display: 'block', padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#334155',
                      textDecoration: 'none',
                      transition: 'background 120ms',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F8F7F4'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link href="/auth/login" style={{ textDecoration: 'none' }} className="hide-mobile">
            <button style={{
              fontSize: '13px', fontWeight: '500',
              color: '#475569',
              background: 'transparent',
              border: '1.5px solid #CBD5E1',
              padding: '8px 18px', borderRadius: '8px',
              cursor: 'pointer', fontFamily: 'var(--v2-font-ui)',
            }}>
              Log in
            </button>
          </Link>

          <Link href="/enquiry" style={{ textDecoration: 'none' }} className="hide-mobile">
            <button style={{
              fontSize: '13px', fontWeight: '600',
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
              Get free quotes →
            </button>
          </Link>

          {/* Mobile hamburger */}
          <button
            className="show-mobile"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              width: '36px', height: '36px',
              background: 'transparent', border: 'none',
              cursor: 'pointer',
              color: '#0F172A',
              display: 'none',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <line x1="2" y1="5" x2="18" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="2" y1="15" x2="18" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* Spacer for fixed nav */}
      <div style={{ height: '60px' }} />
    </>
  );
}
