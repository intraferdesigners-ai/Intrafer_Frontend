'use client';
import Link from 'next/link';
import Image from 'next/image';

const GRADIENT = 'linear-gradient(120deg, #0F172A 0%, #1E3A5F 65%, #16305A 100%)';

const LINK_COLUMNS = [
  {
    heading: 'Platform',
    links: [
      { label: 'Benefits',      href: '/for-designers#benefits' },
      { label: 'Pricing',       href: '/plans'                  },
      { label: 'Vendor login',  href: '/auth/login'              },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Vendor terms',          href: '/for-designers/terms'   },
      { label: 'Vendor privacy policy', href: '/for-designers/privacy' },
    ],
  },
];

export default function VendorFooter() {
  return (
    <footer style={{ background: GRADIENT }}>
      {/* CTA strip */}
      <div style={{ borderBottom: '1px solid rgba(240,246,255,.1)', padding: '48px 40px' }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px',
        }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400, color: '#F0F6FF', letterSpacing: '-.01em', marginBottom: '6px' }}>
              Ready to grow your studio?
            </h2>
            <p style={{ fontSize: '14px', color: 'rgba(240,246,255,.55)' }}>
              Join the designers already listed on Intrafer.
            </p>
          </div>
          <Link href="/auth/register?role=vendor" style={{
            display: 'inline-flex', alignItems: 'center',
            background: '#60A5FA', color: '#0F172A',
            fontSize: '14px', fontWeight: 600, padding: '13px 26px',
            borderRadius: 'var(--r-md)', textDecoration: 'none', whiteSpace: 'nowrap',
          }}>
            List your studio
          </Link>
        </div>
      </div>

      {/* Link columns */}
      <div style={{ padding: '48px 40px 32px' }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          display: 'flex', flexWrap: 'wrap', gap: '48px', justifyContent: 'space-between',
        }}>
          {/* Brand */}
          <div style={{ maxWidth: '280px' }}>
            <Link href="/for-designers" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '14px' }}>
              <div style={{ width: '30px', height: '30px', flexShrink: 0, borderRadius: '6px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px' }}>
                <Image src="/images/logo/logo.png" alt="Intrafer" width={26} height={26} style={{ objectFit: 'contain' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '18px', color: '#F0F6FF' }}>Intrafer</span>
            </Link>
            <p style={{ fontSize: '13px', color: 'rgba(240,246,255,.4)', lineHeight: 1.7 }}>
              The marketplace connecting interior designers with homeowners actively planning a project.
            </p>
          </div>

          {/* Link columns */}
          {LINK_COLUMNS.map(({ heading, links }) => (
            <div key={heading}>
              <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.1em', color: 'rgba(240,246,255,.45)', marginBottom: '14px', textTransform: 'uppercase' }}>
                {heading}
              </p>
              {links.map((l) => (
                <Link key={l.label} href={l.href} style={{ fontSize: '13px', color: 'rgba(240,246,255,.65)', marginBottom: '10px', display: 'block', textDecoration: 'none' }}>
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(240,246,255,.1)', padding: '20px 40px' }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
        }}>
          <span style={{ fontSize: '12px', color: 'rgba(240,246,255,.35)' }}>
            © {new Date().getFullYear()} Intrafer · For designers
          </span>
          <Link href="/" style={{ fontSize: '13px', color: 'rgba(240,246,255,.6)', textDecoration: 'none' }}>
            ← Back to intrafer.in
          </Link>
        </div>
      </div>
    </footer>
  );
}
