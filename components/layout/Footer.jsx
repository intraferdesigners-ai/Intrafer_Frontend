'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

const FOOTER_LINKS = [
  {
    heading: 'For Homeowners',
    links: [
      { label: 'Find designers',       href: '/vendors'          },
      { label: 'Design gallery',       href: '/gallery'          },
      { label: 'Cost calculator',      href: '/cost-calculator'  },
      { label: 'Recent projects',      href: '/recent-projects'  },
      { label: 'Testimonials',         href: '/testimonials'     },
      { label: 'FAQs',                 href: '/faq'              },
    ],
  },
  {
    heading: 'For Designers',
    links: [
      { label: 'List your studio',     href: '/for-designers'    },
      { label: 'Subscription plans',   href: '/plans'            },
      { label: 'Vendor dashboard',     href: '/vendor/dashboard' },
      { label: 'Partner benefits',     href: '/for-designers'    },
    ],
  },
  {
    heading: 'Design Ideas',
    links: [
      { label: 'Modern',               href: '/design-styles/modern'       },
      { label: 'Scandinavian',         href: '/design-styles/scandinavian' },
      { label: 'Luxury',               href: '/design-styles/luxury'       },
      { label: 'Minimalist',           href: '/design-styles/minimalist'   },
      { label: 'Traditional',          href: '/design-styles/traditional'  },
      { label: 'Bohemian',             href: '/design-styles/bohemian'     },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Blog',                 href: '/blog'             },
      { label: 'Design guides',        href: '/guides'           },
      { label: 'Wardrobe calculator',  href: '/wardrobe-calculator' },
      { label: 'How it works',         href: '/how-it-works'     },
      { label: 'About us',             href: '/about'            },
      { label: 'Contact us',           href: '/contact'          },
      { label: 'Recent projects',      href: '/recent-projects'  },
      { label: 'Testimonials',         href: '/testimonials'     },
      { label: 'FAQs',                 href: '/faq'              },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy policy',       href: '/privacy'          },
      { label: 'Terms of service',     href: '/terms'            },
      { label: 'Sitemap',              href: '/sitemap.xml'      },
    ],
  },
];

const CITIES = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune'];

const TRUST_STATS_FALLBACK = [
  { value: '500+', label: 'VERIFIED DESIGNERS' },
  { value: '4.8★', label: 'AVERAGE RATING'      },
  { value: '1200+',label: 'PROJECTS COMPLETED'  },
];

const POPULAR_SEARCHES = [
  { label: 'Modular Kitchen Designers in Bangalore', href: '/vendors?city=Bangalore&specialization=Modular+Kitchen' },
  { label: 'Interior Designers in Mumbai',            href: '/vendors?city=Mumbai' },
  { label: 'Full Home Interior Designers',            href: '/vendors?specialization=Full+Home+Interior' },
  { label: 'Living Room Designers in Delhi NCR',      href: '/vendors?city=Delhi+NCR&specialization=Living+Room' },
  { label: 'Office Interior Designers in Bangalore',  href: '/vendors?city=Bangalore&specialization=Office+Interiors' },
];

export default function Footer() {
  const [trustStats, setTrustStats] = useState(TRUST_STATS_FALLBACK);
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/stats`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const json = await res.json();
        const data = json.data;
        if (!cancelled && data) {
          setTrustStats([
            { value: `${data.vendorCount}+`, label: 'VERIFIED DESIGNERS' },
            { value: `${data.avgRating}★`,   label: 'AVERAGE RATING'      },
            { value: `${data.projectCount}+`,label: 'PROJECTS COMPLETED'  },
          ]);
        }
      } catch {
        // keep fallback values
      }
    }

    fetchStats();
    return () => { cancelled = true; };
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Subscription failed');
      }
      toast.success('Subscribed! Watch your inbox for design inspiration.');
      setEmail('');
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    }
    setSubscribing(false);
  };

  return (
    <footer className="site-footer" style={{ background: '#0F172A', padding: '56px 40px 24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Trust stats row */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '32px',
          paddingBottom: '32px', marginBottom: '32px',
          borderBottom: '1px solid rgba(240,246,255,.08)',
        }}>
          {trustStats.map((stat) => (
            <div key={stat.label}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(240,246,255,.4)', letterSpacing: '.08em', marginTop: '4px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Top grid */}
        <div style={{ marginBottom: '40px' }} className="footer-grid">
          {/* Brand column */}
          <div>
            <Link href="/" style={{ display: 'inline-block', marginBottom: '20px' }}>
              <div style={{
                background: '#FFFFFF',
                borderRadius: '10px',
                padding: '10px 16px',
                display: 'inline-flex',
                boxShadow: '0 2px 8px rgba(0,0,0,.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Image
                  src="/images/logo/logo2.png"
                  alt="Intrafer — Find. Compare. Design."
                  width={140}
                  height={126}
                  style={{
                    objectFit: 'contain',
                    width: '140px',
                    height: 'auto',
                    display: 'block',
                  }}
                />
              </div>
            </Link>
            <p style={{ fontSize: '13px', color: 'rgba(240,246,255,.35)', lineHeight: 1.7, maxWidth: '220px', marginBottom: '16px' }}>
              India&apos;s most trusted interior designer marketplace. 500+ verified designers across India.
            </p>
            <a
              href="https://wa.me/919876500000"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '13px', color: '#25D366', textDecoration: 'none',
                marginBottom: '20px', fontWeight: 500,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                <path
                  d="M16 2C8.268 2 2 8.268 2 16c0 2.444.63 4.74 1.73 6.74L2 30l7.46-1.7A13.93 13.93 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2z"
                  fill="#25D366"
                />
                <path
                  d="M22.5 19.5c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.41-1.49-.89-.79-1.49-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17 0-.37-.02-.57-.02-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.49 1.7.63.71.23 1.36.19 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z"
                  fill="#FFFFFF"
                />
              </svg>
              Chat with us on WhatsApp
            </a>
            {/* City pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {CITIES.map((city) => (
                <Link
                  key={city}
                  href={`/cities/${city.toLowerCase()}`}
                  style={{
                    fontSize: '11px', color: 'rgba(240,246,255,.3)',
                    border: '1px solid rgba(240,246,255,.1)',
                    padding: '3px 10px', borderRadius: '20px',
                    textDecoration: 'none', transition: 'color 150ms',
                  }}
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map(({ heading, links }) => (
            <div key={heading}>
              <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.1em', color: 'rgba(240,246,255,.5)', marginBottom: '12px', textTransform: 'uppercase' }}>
                {heading}
              </p>
              {links.map((l) => (
                <Link key={l.label} href={l.href} style={{ fontSize: '13px', color: 'rgba(240,246,255,.3)', marginBottom: '8px', display: 'block', transition: 'color 150ms', textDecoration: 'none' }}>
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Newsletter + Popular searches */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '32px',
          justifyContent: 'space-between',
          paddingTop: '24px', paddingBottom: '24px', marginBottom: '24px',
          borderTop: '1px solid rgba(240,246,255,.08)',
        }}>
          {/* Popular searches */}
          <div style={{ flex: '2 1 320px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.1em', color: 'rgba(240,246,255,.5)', marginBottom: '12px', textTransform: 'uppercase' }}>
              Popular Searches
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
              {POPULAR_SEARCHES.map((s) => (
                <Link key={s.href} href={s.href} style={{
                  fontSize: '12px', color: 'rgba(240,246,255,.3)',
                  textDecoration: 'none', transition: 'color 150ms',
                }}>
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter signup */}
          <div style={{ flex: '1 1 260px', maxWidth: '320px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.1em', color: 'rgba(240,246,255,.5)', marginBottom: '12px', textTransform: 'uppercase' }}>
              Stay Inspired
            </p>
            <p style={{ fontSize: '13px', color: 'rgba(240,246,255,.35)', lineHeight: 1.6, marginBottom: '12px' }}>
              Get design tips and new designer spotlights in your inbox.
            </p>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                style={{
                  flex: '1 1 160px',
                  fontSize: '13px', padding: '10px 12px',
                  background: 'rgba(255,255,255,.06)',
                  border: '1px solid rgba(240,246,255,.15)',
                  borderRadius: '8px', color: '#FFFFFF', outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={subscribing}
                style={{
                  fontSize: '13px', fontWeight: 500, padding: '10px 16px',
                  background: subscribing ? 'rgba(255,255,255,.15)' : '#FFFFFF',
                  color: subscribing ? 'rgba(240,246,255,.5)' : '#0F172A',
                  border: 'none', borderRadius: '8px',
                  cursor: subscribing ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {subscribing ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ borderTop: '1px solid rgba(240,246,255,.08)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(240,246,255,.2)' }}>
            © {new Date().getFullYear()} Intrafer · Made with ♥ in India
          </span>
          {/* Social icons */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <a href="https://instagram.com/intrafer" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: 'rgba(240,246,255,.4)', display: 'flex' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a href="https://linkedin.com/company/intrafer" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={{ color: 'rgba(240,246,255,.4)', display: 'flex' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/>
                <rect x="2" y="9" width="4" height="12"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
