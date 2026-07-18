import Link from 'next/link';
import Image from 'next/image';

const FOOTER_LINKS = {
  'How it works': [
    { label: 'Register your studio', href: '#how-it-works' },
    { label: 'Complete your profile', href: '#how-it-works' },
    { label: 'Get approved (24-48 hrs)', href: '#how-it-works' },
    { label: 'Start receiving leads', href: '#how-it-works' },
  ],
  'Resources': [
    { label: 'Pricing plans', href: '#pricing' },
    { label: 'Success stories', href: '#testimonials' },
    { label: 'Designer dashboard', href: '/vendor/dashboard' },
    { label: 'Support', href: '/contact' },
  ],
  'Legal': [
    { label: 'Privacy policy', href: '/privacy' },
    { label: 'Terms of service', href: '/terms' },
    { label: 'Contact support', href: '/contact' },
  ],
};

export default function DesignerFooter() {
  return (
    <footer style={{
      background: '#020617',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      fontFamily: 'var(--v2-font-ui)',
    }}>
      <div style={{
        maxWidth: '1140px', margin: '0 auto',
        padding: '56px clamp(16px,4vw,36px) 40px',
        display: 'grid',
        gridTemplateColumns: '260px 1fr 1fr 1fr',
        gap: '40px',
      }}>
        {/* Brand column */}
        <div>
          <Link href="/designers" style={{
            display: 'flex', alignItems: 'center',
            gap: '10px', textDecoration: 'none', marginBottom: '14px',
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
                style={{ objectFit: 'contain' }}
              />
            </div>
            <span style={{
              fontFamily: 'var(--v2-font-display)',
              fontSize: '18px', fontWeight: 500,
              color: '#F8F7F4', letterSpacing: '-0.03em',
            }}>Intrafer for designers</span>
          </Link>
          <p style={{
            fontSize: '12px', color: '#475569',
            lineHeight: 1.7, marginBottom: '14px',
          }}>
            Part of the Intrafer marketplace.
          </p>
          <Link href="/" style={{
            fontSize: '12px', color: '#3B82F6',
            textDecoration: 'none', fontWeight: 500,
          }}>
            ← For homeowners
          </Link>
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
                <Link key={link.label} href={link.href} style={{
                  fontSize: '13px', color: '#94A3B8',
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
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '16px clamp(16px,4vw,36px)',
        maxWidth: '1140px', margin: '0 auto',
      }}>
        <span style={{ fontSize: '12px', color: '#334155' }}>
          © 2026 Intrafer for Designers · designers.intrafer.in
        </span>
      </div>
    </footer>
  );
}
