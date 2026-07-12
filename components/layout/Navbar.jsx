'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, X } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import Button from '../ui/Button';

const MEGA_MENUS = {
  'Find designers': {
    href: '/vendors',
    cols: [
      {
        heading: 'BY LOCATION',
        links: [
          { label: 'Bangalore', href: '/cities/bangalore' },
          { label: 'Mumbai',    href: '/cities/mumbai'    },
          { label: 'Delhi NCR', href: '/cities/delhi'     },
          { label: 'Hyderabad', href: '/cities/hyderabad' },
        ],
      },
      {
        heading: 'BY STYLE',
        links: [
          { label: 'Modern',      href: '/design-styles/modern'      },
          { label: 'Scandinavian',href: '/design-styles/scandinavian'},
          { label: 'Luxury',      href: '/design-styles/luxury'      },
          { label: 'Minimalist',  href: '/design-styles/minimalist'  },
        ],
      },
    ],
    footer: { label: 'View all designers →', href: '/vendors' },
  },
  'Design ideas': {
    href: '/gallery',
    cols: [
      {
        heading: 'BY ROOM',
        links: [
          { label: 'Kitchen',     href: '/gallery?room=Kitchen'      },
          { label: 'Living Room', href: '/gallery?room=Living+Room'  },
          { label: 'Bedroom',     href: '/gallery?room=Bedroom'      },
          { label: 'Bathroom',    href: '/gallery?room=Bathroom'     },
          { label: 'Office',      href: '/gallery?room=Office'       },
        ],
      },
      {
        heading: 'BY STYLE',
        links: [
          { label: 'Modern',       href: '/design-styles/modern'       },
          { label: 'Bohemian',     href: '/design-styles/bohemian'     },
          { label: 'Industrial',   href: '/design-styles/industrial'   },
          { label: 'Contemporary', href: '/design-styles/contemporary' },
        ],
      },
    ],
    footer: { label: 'Browse full gallery →', href: '/gallery' },
  },
  'Calculators': {
    href: '/cost-calculator',
    cols: [
      {
        heading: 'TOOLS',
        links: [
          { label: 'Home interior calculator', href: '/cost-calculator'       },
          { label: 'Wardrobe calculator',       href: '/wardrobe-calculator'   },
          { label: 'EMI estimator',             href: '/cost-calculator#emi'  },
          { label: 'Packages & pricing',        href: '/packages'             },
        ],
      },
    ],
    footer: null,
  },
  'Resources': {
    href: '/blog',
    cols: [
      {
        heading: 'LEARN',
        links: [
          { label: 'Design guides',   href: '/guides'          },
          { label: 'Blog & articles', href: '/blog'            },
          { label: 'Recent projects', href: '/recent-projects' },
          { label: 'Testimonials',    href: '/testimonials'    },
          { label: 'FAQs',            href: '/faq'             },
        ],
      },
    ],
    footer: null,
  },
};

const NAV_KEYS = Object.keys(MEGA_MENUS);

const DRAWER_SECTIONS = [
  {
    heading: 'Find designers',
    links: [
      { href: '/vendors',              label: 'All designers'   },
      { href: '/cities/bangalore',     label: 'Bangalore'       },
      { href: '/cities/mumbai',        label: 'Mumbai'          },
      { href: '/cities/delhi',         label: 'Delhi NCR'       },
      { href: '/gallery',              label: 'Design gallery'  },
      { href: '/design-styles',        label: 'Design styles'   },
    ],
  },
  {
    heading: 'Tools & resources',
    links: [
      { href: '/cost-calculator',   label: 'Cost calculator'      },
      { href: '/wardrobe-calculator',label: 'Wardrobe calculator' },
      { href: '/blog',              label: 'Blog'                  },
      { href: '/guides',            label: 'Design guides'        },
      { href: '/faq',               label: 'FAQ'                  },
    ],
  },
];

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [openMenu,    setOpenMenu]    = useState(null);
  const navRef    = useRef(null);
  const closeTimer = useRef(null);
  const pathname  = usePathname();
  const router    = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Close drawer on route change */
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  /* Lock body scroll when drawer open */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const openDropdown  = useCallback((key) => { clearTimeout(closeTimer.current); setOpenMenu(key); }, []);
  const closeDropdown = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 150);
  }, []);

  return (
    <>
      <nav
        ref={navRef}
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
            {NAV_KEYS.map((key) => {
              const menu = MEGA_MENUS[key];
              const isActive = pathname.startsWith(menu.href);
              return (
                <div key={key} style={{ position: 'relative' }}
                  onMouseEnter={() => openDropdown(key)} onMouseLeave={closeDropdown}>
                  <button
                    onClick={() => router.push(menu.href)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '13px', padding: '6px 12px',
                      color: isActive ? 'var(--primary)' : 'var(--text-mid)',
                      fontWeight: isActive ? 500 : 400,
                      letterSpacing: '.01em', display: 'flex', alignItems: 'center', gap: '3px',
                      borderRadius: 'var(--r-sm)', transition: 'color 150ms',
                    }}
                  >
                    {key}
                    <ChevronDown size={12} style={{ transition: 'transform 150ms',
                      transform: openMenu === key ? 'rotate(180deg)' : 'none' }} />
                  </button>

                  {openMenu === key && (
                    <div onMouseEnter={() => openDropdown(key)} onMouseLeave={closeDropdown}
                      style={{
                        position: 'absolute', top: 'calc(100% + 8px)', left: '-16px',
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-lg)',
                        minWidth: menu.cols.length > 1 ? '380px' : '220px', zIndex: 100,
                      }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${menu.cols.length}, 1fr)`, gap: '24px' }}>
                        {menu.cols.map((col) => (
                          <div key={col.heading}>
                            <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.12em',
                              color: 'var(--text-hint)', textTransform: 'uppercase', marginBottom: '12px' }}>
                              {col.heading}
                            </p>
                            {col.links.map((link) => (
                              <Link key={link.href} href={link.href} onClick={() => setOpenMenu(null)}
                                style={{ display: 'block', fontSize: '13px', color: 'var(--text-sub)',
                                  padding: '6px 0', textDecoration: 'none', transition: 'color 120ms' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-sub)'}
                              >
                                {link.label}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                      {menu.footer && (
                        <Link href={menu.footer.href} onClick={() => setOpenMenu(null)}
                          style={{ display: 'block', marginTop: '16px', paddingTop: '14px',
                            borderTop: '1px solid var(--border)', fontSize: '13px',
                            color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>
                          {menu.footer.label}
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop right actions — public site always shows logged-out state */}
          <div className="nav-desktop-links hide-mobile" style={{ gap: '10px', alignItems: 'center' }}>
            <ThemeToggle />
            <Link href="/auth/login"><Button variant="outline" size="sm">Login</Button></Link>
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
          <Link href="/auth/login" onClick={() => setDrawerOpen(false)} style={{ textDecoration: 'none' }}>
            <button style={{ width: '100%', height: '50px', borderRadius: 'var(--r-md)',
              background: 'var(--bg-parchment)', border: '1px solid var(--border)',
              fontSize: '15px', fontWeight: 500, color: 'var(--text)', cursor: 'pointer' }}>
              Log in
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
