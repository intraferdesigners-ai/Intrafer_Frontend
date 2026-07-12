'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function StickyMobileCTA() {
  const pathname = usePathname();

  if (pathname.startsWith('/enquiry') || pathname.startsWith('/auth')) return null;

  return (
    <>
      <style>{`
        @media (min-width: 768px) { .sticky-mobile-cta { display: none !important; } }
      `}</style>
      <div
        className="sticky-mobile-cta"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          padding: '10px 16px max(10px, env(safe-area-inset-bottom))',
          zIndex: 40,
          display: 'flex', gap: '10px',
        }}
      >
        <a
          href="tel:+919876500000"
          style={{
            width: '110px', flexShrink: 0,
            textAlign: 'center', height: '48px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid var(--border-emp)',
            borderRadius: 'var(--r-md)', fontSize: '14px',
            fontWeight: 500, color: 'var(--text-sub)',
            textDecoration: 'none',
          }}
        >
          Call us
        </a>
        <Link
          href="/enquiry"
          style={{
            flex: 1, textAlign: 'center', height: '48px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--primary)', borderRadius: 'var(--r-md)',
            fontSize: '14px', fontWeight: 500, color: '#fff',
            textDecoration: 'none',
          }}
        >
          Get free quote
        </Link>
      </div>
    </>
  );
}
