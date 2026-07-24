'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { X, Percent, MapPin, ShieldCheck } from 'lucide-react';

const GRADIENT = 'linear-gradient(120deg, #0F172A 0%, #1E3A5F 65%, #16305A 100%)';

const NAV_LINKS = [
  { label: 'Benefits',     href: '/for-designers#benefits'     },
  { label: 'Pricing',      href: '/plans'                      },
  { label: 'How it works', href: '/for-designers#how-it-works' },
  { label: 'FAQ',          href: '/for-designers#faq'          },
];

const TRUST_ITEMS = [
  { Icon: Percent,     label: 'Flat subscription, zero commission'        },
  { Icon: MapPin,      label: 'Leads matched to your city and specialty'  },
  { Icon: ShieldCheck, label: 'OTP-verified enquiries only'                },
];

export default function VendorNavbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  return (
    <>
      <style>{`
        .vendor-nav-link { color: rgba(240,246,255,.68); transition: color 150ms; }
        .vendor-nav-link:hover { color: #F0F6FF; }
        .vendor-login-link { color: rgba(240,246,255,.8); transition: color 150ms; }
        .vendor-login-link:hover { color: #F0F6FF; }
        .vendor-cta-btn { background: #60A5FA; transition: background 150ms, transform 150ms; }
        .vendor-cta-btn:hover { background: #7DB6FB; transform: translateY(-1px); }
      `}</style>

      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: GRADIENT, boxShadow: '0 2px 16px rgba(0,0,0,.25)' }}>
        {/* Main nav row */}
        <div style={{
          height: '64px', display: 'flex', alignItems: 'center',
          maxWidth: '1280px', margin: '0 auto', padding: '0 20px',
          justifyContent: 'space-between',
        }}>
          {/* Logo lockup */}
          <Link href="/for-designers" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: '32px', height: '32px', flexShrink: 0, borderRadius: '6px',
              background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px',
            }}>
              <Image src="/images/logo/logo.png" alt="Intrafer" width={28} height={28} style={{ objectFit: 'contain' }} priority />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '20px', color: '#F0F6FF', letterSpacing: '-.01em' }}>
              Intrafer
            </span>
            <span style={{
              background: '#60A5FA', color: '#0F172A',
              fontSize: '10px', fontWeight: 700, letterSpacing: '.06em',
              padding: '3px 9px', borderRadius: '20px', textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}>
              For Designers
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="nav-desktop-links hide-mobile" style={{ gap: '4px', alignItems: 'center' }}>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="vendor-nav-link"
                style={{ fontSize: '13px', padding: '6px 12px', letterSpacing: '.01em', textDecoration: 'none', fontWeight: 400 }}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right actions */}
          <div className="nav-desktop-links hide-mobile" style={{ gap: '18px', alignItems: 'center' }}>
            <Link href="/auth/login" className="vendor-login-link" style={{ fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}>
              Vendor login
            </Link>
            <Link href="/auth/register?role=vendor" className="vendor-cta-btn" style={{
              display: 'inline-flex', alignItems: 'center', color: '#0F172A',
              fontSize: '13px', fontWeight: 600, padding: '9px 18px',
              borderRadius: 'var(--r-md)', textDecoration: 'none',
            }}>
              List your studio
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="show-mobile-flex nav-hamburger"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            style={{ color: '#F0F6FF' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <line x1="2" y1="5" x2="18" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="2" y1="15" x2="18" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Trust-bar row — hidden below 768px: at mobile widths the three
            phrases wrap onto 2-3 lines and balloon the fixed header's
            height (measured 131-159px vs 103px desktop), which would push
            it out of sync with every vendor-site page's top padding. Hiding
            it keeps the mobile header locked to the nav row's 64px, same
            as the homeowner Navbar. */}
        <div className="hide-mobile" style={{
          borderTop: '1px solid rgba(240,246,255,.1)',
          padding: '10px 20px',
        }}>
          <div className="grid-mobile-1" style={{
            maxWidth: '1280px', margin: '0 auto',
            display: 'flex', flexWrap: 'wrap', gap: '10px 32px', justifyContent: 'center',
          }}>
            {TRUST_ITEMS.map(({ Icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Icon size={13} color="#60A5FA" strokeWidth={2} />
                <span style={{ fontSize: '12px', color: 'rgba(240,246,255,.6)', letterSpacing: '.01em' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile drawer backdrop */}
      <div className={`nav-drawer-backdrop${drawerOpen ? ' open' : ''}`} onClick={() => setDrawerOpen(false)} />

      {/* Mobile slide-in drawer */}
      <div className={`nav-drawer${drawerOpen ? ' open' : ''}`} style={{ background: GRADIENT }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', flexShrink: 0, borderRadius: '5px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px' }}>
              <Image src="/images/logo/logo.png" alt="Intrafer" width={24} height={24} style={{ objectFit: 'contain' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '17px', color: '#F0F6FF' }}>Intrafer</span>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            style={{ width: '36px', height: '36px', background: 'rgba(240,246,255,.1)', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F0F6FF' }}
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setDrawerOpen(false)}
              style={{ display: 'flex', alignItems: 'center', padding: '13px 0', fontSize: '15px', color: 'rgba(240,246,255,.85)', borderBottom: '1px solid rgba(240,246,255,.1)', textDecoration: 'none' }}>
              {link.label}
            </Link>
          ))}
        </div>

        <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link href="/auth/login" onClick={() => setDrawerOpen(false)} style={{ textDecoration: 'none' }}>
            <button style={{ width: '100%', height: '50px', borderRadius: 'var(--r-md)', background: 'rgba(240,246,255,.08)', border: '1px solid rgba(240,246,255,.2)', fontSize: '15px', fontWeight: 500, color: '#F0F6FF', cursor: 'pointer' }}>
              Vendor login
            </button>
          </Link>
          <Link href="/auth/register?role=vendor" onClick={() => setDrawerOpen(false)} style={{ textDecoration: 'none' }}>
            <button style={{ width: '100%', height: '50px', borderRadius: 'var(--r-md)', background: '#60A5FA', border: 'none', fontSize: '15px', fontWeight: 600, color: '#0F172A', cursor: 'pointer' }}>
              List your studio
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}
