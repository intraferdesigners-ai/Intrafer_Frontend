'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function OfferBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('intrafer-offer-dismissed');
    if (!saved) setDismissed(false);
  }, []);

  function dismiss() {
    setDismissed(true);
    localStorage.setItem('intrafer-offer-dismissed', '1');
  }

  if (dismissed) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60,
      background: 'linear-gradient(90deg, #1D4ED8, #3B82F6)',
      color: '#fff', padding: '10px 20px',
      textAlign: 'center', fontSize: '13px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    }}>
      <span>
        🎉 Limited time: Get ₹10,000 off on bookings above ₹5 lakhs this month.{' '}
        <Link href="/enquiry" style={{ color: '#fff', textDecoration: 'underline', fontWeight: 500 }}>
          Book now →
        </Link>
      </span>
      <button
        onClick={dismiss}
        style={{
          position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', color: 'rgba(255,255,255,.8)',
          fontSize: '18px', cursor: 'pointer', lineHeight: 1, padding: '0 4px',
        }}
        aria-label="Dismiss offer"
      >
        ×
      </button>
    </div>
  );
}
