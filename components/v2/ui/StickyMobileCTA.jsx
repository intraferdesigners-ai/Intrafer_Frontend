'use client'
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function V2StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      background: '#0F172A',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      padding: '12px 16px',
      display: 'flex',
      gap: '10px',
      zIndex: 55,
      transform: visible ? 'translateY(0)' : 'translateY(100%)',
      transition: 'transform 300ms cubic-bezier(0.4,0,0.2,1)',
    }}
    className="show-mobile-only"
    >
      <a href="tel:+919876500000" style={{
        flex: 1,
        height: '46px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: '1.5px solid rgba(255,255,255,0.15)',
        borderRadius: '8px',
        color: '#F8F7F4',
        fontSize: '14px',
        fontWeight: 500,
        textDecoration: 'none',
        fontFamily: 'var(--v2-font-ui)',
        gap: '6px',
      }}>
        📞 Call us
      </a>
      <Link href="/enquiry" style={{
        flex: 2,
        height: '46px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#3B82F6',
        border: 'none',
        borderRadius: '8px',
        color: '#FFFFFF',
        fontSize: '14px',
        fontWeight: 600,
        textDecoration: 'none',
        fontFamily: 'var(--v2-font-ui)',
      }}>
        Get free quote →
      </Link>
    </div>
  );
}
