import Link from 'next/link';
import Image from 'next/image';

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

export default function Footer() {
  return (
    <footer className="site-footer" style={{ background: '#0F172A', padding: '56px 40px 24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
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
            <p style={{ fontSize: '13px', color: 'rgba(240,246,255,.35)', lineHeight: 1.7, maxWidth: '220px', marginBottom: '20px' }}>
              India&apos;s most trusted interior designer marketplace. 500+ verified designers across India.
            </p>
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
