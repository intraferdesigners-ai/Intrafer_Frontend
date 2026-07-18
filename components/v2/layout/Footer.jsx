import Link from 'next/link';
import Image from 'next/image';

const FOOTER_LINKS = {
  'For homeowners': [
    { label: 'Find designers', href: '/vendors' },
    { label: 'Design gallery', href: '/gallery' },
    { label: 'Cost calculator', href: '/cost-calculator' },
    { label: 'How it works', href: '/how-it-works' },
    { label: 'Testimonials', href: '/testimonials' },
    { label: 'FAQs', href: '/faq' },
  ],
  'Design ideas': [
    { label: 'Modern', href: '/design-styles/modern' },
    { label: 'Scandinavian', href: '/design-styles/scandinavian' },
    { label: 'Luxury', href: '/design-styles/luxury' },
    { label: 'Minimalist', href: '/design-styles/minimalist' },
    { label: 'Traditional', href: '/design-styles/traditional' },
    { label: 'Bohemian', href: '/design-styles/bohemian' },
  ],
  'Resources': [
    { label: 'Blog', href: '/blog' },
    { label: 'Design guides', href: '/guides' },
    { label: 'About us', href: '/about' },
    { label: 'Contact us', href: '/contact' },
    { label: 'Privacy policy', href: '/privacy' },
    { label: 'Terms of service', href: '/terms' },
  ],
};

export default function V2Footer() {
  return (
    <footer style={{
      background: '#020617',
      borderTop: '1px solid rgba(255,255,255,0.04)',
      fontFamily: 'var(--v2-font-ui)',
    }}>
      {/* Main footer */}
      <div style={{
        maxWidth: '1140px', margin: '0 auto',
        padding: '56px clamp(16px,4vw,36px) 40px',
        display: 'grid',
        gridTemplateColumns: '240px 1fr 1fr 1fr',
        gap: '40px',
      }}>
        {/* Brand column */}
        <div>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center',
            gap: '10px', textDecoration: 'none', marginBottom: '16px',
          }}>
            <div style={{
              width: '32px', height: '32px',
              background: '#3B82F6', borderRadius: '8px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', overflow: 'hidden',
            }}>
              <Image
                src="/images/logo/logo.png"
                alt="Intrafer"
                width={28} height={28}
                style={{ objectFit: 'contain', filter: 'brightness(10)' }}
              />
            </div>
            <span style={{
              fontFamily: 'var(--v2-font-display)',
              fontSize: '18px', fontWeight: 500,
              color: '#F8F7F4', letterSpacing: '-0.03em',
            }}>Intrafer</span>
          </Link>
          <p style={{
            fontSize: '12px', color: '#334155',
            lineHeight: 1.7, marginBottom: '20px',
          }}>
            India's most trusted interior designer marketplace.
          </p>
          {/* Cities */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune'].map(city => (
              <Link key={city} href={`/cities/${city.toLowerCase()}`} style={{
                fontSize: '11px', color: '#1E293B',
                textDecoration: 'none', border: '1px solid #1E293B',
                padding: '3px 8px', borderRadius: '20px',
                transition: 'border-color 150ms, color 150ms',
              }}>
                {city}
              </Link>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([col, links]) => (
          <div key={col}>
            <div style={{
              fontSize: '11px', fontWeight: 600,
              letterSpacing: '.1em', textTransform: 'uppercase',
              color: '#475569', marginBottom: '16px',
            }}>{col}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {links.map(link => (
                <Link key={link.href} href={link.href} style={{
                  fontSize: '13px', color: '#334155',
                  textDecoration: 'none',
                  transition: 'color 150ms',
                }}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.04)',
        padding: '16px clamp(16px,4vw,36px)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1140px', margin: '0 auto',
      }}>
        <span style={{ fontSize: '12px', color: '#1E293B' }}>
          © 2026 Intrafer · Made with ♥ in India
        </span>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link href="https://instagram.com/intrafer"
            style={{ color: '#334155', fontSize: '12px', textDecoration: 'none' }}>
            Instagram
          </Link>
          <Link href="https://linkedin.com/company/intrafer"
            style={{ color: '#334155', fontSize: '12px', textDecoration: 'none' }}>
            LinkedIn
          </Link>
          <Link href="/for-designers"
            style={{ color: '#3B82F6', fontSize: '12px',
              textDecoration: 'none', fontWeight: 500 }}>
            For designers →
          </Link>
        </div>
      </div>
    </footer>
  );
}
