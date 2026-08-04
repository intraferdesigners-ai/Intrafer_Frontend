'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import Button from '../ui/Button';
import useAuthStore from '../../store/authStore';

const NAV_LINKS = [
  { label: 'Find Designers',  href: '/vendors'         },
  { label: 'How It Works',    href: '/how-it-works'    },
  { label: 'Design Ideas',    href: '/gallery'         },
];

// Same three-way role->dashboard mapping already used by middleware.js (route
// protection) and the login page's post-login redirect — kept as its own
// small local copy rather than a shared import, matching how those two
// existing spots already each define it independently (middleware.js runs
// in the Edge runtime, so it can't share a module with client-only code
// like this one anyway).
const ROLE_DASHBOARDS = { user: '/user/dashboard', vendor: '/vendor/dashboard', admin: '/admin/dashboard' };

const DRAWER_SECTIONS = [
  {
    heading: 'Menu',
    links: [
      { href: '/vendors',         label: 'Find Designers'  },
      { href: '/how-it-works',    label: 'How It Works'    },
      { href: '/gallery',         label: 'Design Ideas'    },
    ],
  },
];

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const pathname  = usePathname();
  const { theme } = useTheme();
  const { role, initFromCookies } = useAuthStore();

  // Public pages never mount DashboardLayout (the only other place that
  // currently calls this), so without it here, a returning logged-in user's
  // role/token would stay unhydrated (null) on any page load that starts
  // from a public route — including a hard refresh of the homepage — and
  // the header would wrongly show "Login" until they happened to navigate
  // through a dashboard first. Same call DashboardLayout already makes.
  //
  // Skipped on /auth/* specifically: this hydration can carry a stale
  // leftover token cookie from a previous/expired session, which silently
  // triggers a background 401 -> refresh-token attempt. If that refresh
  // fails (e.g. the account has since logged in elsewhere and its single-slot
  // refresh token was rotated out from under it), the interceptor hard-wipes
  // auth cookies and force-redirects to /auth/login — which can land *after*
  // the user has just completed a fresh, legitimate login on this same page,
  // clobbering it and bouncing them right back to the login form. Already-
  // authenticated visitors to /auth/login are sent to their dashboard by
  // middleware.js before this even mounts, so there's nothing for this call
  // to usefully hydrate here anyway.
  useEffect(() => {
    if (pathname.startsWith('/auth')) return;
    initFromCookies();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dashboardHref = ROLE_DASHBOARDS[role] || '/auth/portal';
  const isLoggedIn = !!role;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close drawer on route change */
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  /* Lock body scroll when drawer open */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  return (
    <>
      <nav
        className={`navbar-surface${scrolled ? ' scrolled' : ''}`}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          height: '64px', display: 'flex', alignItems: 'center',
        }}
      >
        <div style={{
          width: '100%', maxWidth: '1280px', margin: '0 auto',
          padding: '0 20px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', height: '100%',
        }}>
          {/* Logo — always visible */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: '32px', height: '32px', flexShrink: 0,
              borderRadius: '6px',
              background: theme === 'dark' ? '#FFFFFF' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: theme === 'dark' ? '2px' : '0',
              transition: 'background 200ms',
            }}>
              <Image src="/images/logo/logo.png" alt="Intrafer" width={28} height={28}
                style={{ objectFit: 'contain', mixBlendMode: theme === 'dark' ? 'normal' : 'multiply' }}
                priority />
            </div>
            <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '18px',
              color: 'var(--text)', letterSpacing: '-0.02em' }}>
              Intrafer
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="nav-desktop-links hide-mobile" style={{ gap: '4px', alignItems: 'center' }}>
            {NAV_LINKS.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link key={link.href} href={link.href}
                  style={{
                    fontSize: '13px', padding: '6px 12px',
                    color: isActive ? 'var(--primary)' : 'var(--text-mid)',
                    fontWeight: isActive ? 500 : 400,
                    letterSpacing: '.01em', borderRadius: 'var(--r-sm)',
                    transition: 'color 150ms', textDecoration: 'none',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop right actions — swaps Login for Dashboard once
              role/token has hydrated from cookies (see the initFromCookies
              effect above), so a returning logged-in visitor lands on their
              own dashboard in one click instead of the login form. */}
          <div className="nav-desktop-links hide-mobile" style={{ gap: '10px', alignItems: 'center' }}>
            <ThemeToggle />
            <Link href={isLoggedIn ? dashboardHref : '/auth/portal'}>
              <Button variant="outline" size="sm">{isLoggedIn ? 'Dashboard' : 'Login'}</Button>
            </Link>
            <Link href="/for-designers">
              <Button variant="primary" size="sm">For designers →</Button>
            </Link>
          </div>

          {/* Mobile right: theme + hamburger */}
          <div className="show-mobile-flex" style={{ gap: '4px', alignItems: 'center' }}>
            <ThemeToggle />
            <button
              className="nav-hamburger"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <line x1="2" y1="5"  x2="18" y2="5"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="2" y1="15" x2="18" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer backdrop */}
      <div
        className={`nav-drawer-backdrop${drawerOpen ? ' open' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Mobile slide-in drawer */}
      <div className={`nav-drawer${drawerOpen ? ' open' : ''}`}>
        {/* Drawer header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', flexShrink: 0,
              borderRadius: '5px',
              background: theme === 'dark' ? '#FFFFFF' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: theme === 'dark' ? '2px' : '0',
              transition: 'background 200ms',
            }}>
              <Image src="/images/logo/logo.png" alt="Intrafer" width={24} height={24}
                style={{ objectFit: 'contain', mixBlendMode: theme === 'dark' ? 'normal' : 'multiply' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text)' }}>Intrafer</span>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            style={{ width: '36px', height: '36px', background: 'var(--bg-parchment)', border: 'none',
              borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'var(--text)' }}
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {DRAWER_SECTIONS.map((section) => (
            <div key={section.heading}>
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.1em',
                color: 'var(--text-hint)', textTransform: 'uppercase', padding: '14px 0 6px' }}>
                {section.heading}
              </div>
              {section.links.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setDrawerOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', padding: '13px 0', fontSize: '15px',
                    color: pathname === link.href ? 'var(--primary)' : 'var(--text-sub)',
                    borderBottom: '1px solid var(--border)', textDecoration: 'none',
                    fontWeight: pathname === link.href ? 500 : 400 }}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link href={isLoggedIn ? dashboardHref : '/auth/portal'} onClick={() => setDrawerOpen(false)} style={{ textDecoration: 'none' }}>
            <button style={{ width: '100%', height: '50px', borderRadius: 'var(--r-md)',
              background: 'var(--bg-parchment)', border: '1px solid var(--border)',
              fontSize: '15px', fontWeight: 500, color: 'var(--text)', cursor: 'pointer' }}>
              {isLoggedIn ? 'Dashboard' : 'Log in'}
            </button>
          </Link>
          <Link href="/for-designers" onClick={() => setDrawerOpen(false)} style={{ textDecoration: 'none' }}>
            <button style={{ width: '100%', height: '50px', borderRadius: 'var(--r-md)',
              background: 'var(--primary)', border: 'none',
              fontSize: '15px', fontWeight: 500, color: '#fff', cursor: 'pointer' }}>
              For designers →
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}
