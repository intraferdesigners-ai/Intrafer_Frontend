'use client'
import { useState } from 'react';
import Link from 'next/link';

export default function V2OfferBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div style={{
      background: '#3B82F6',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      position: 'relative',
    }}>
      <span style={{
        fontSize: '13px',
        color: '#FFFFFF',
        fontFamily: 'var(--v2-font-ui)',
        fontWeight: 400,
      }}>
        Limited time: 15% off when you book this month.{' '}
        <Link href="/enquiry" style={{
          color: '#FFFFFF',
          fontWeight: 600,
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
        }}>
          Book now →
        </Link>
      </span>
      <button
        onClick={() => setDismissed(true)}
        style={{
          position: 'absolute',
          right: '12px',
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer',
          fontSize: '16px',
          lineHeight: 1,
          padding: '4px',
        }}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
