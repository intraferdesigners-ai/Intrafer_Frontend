'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import RotatingWord from '../ui/RotatingWord';

const PROJECT_WORDS = ['Kitchen', 'Living Room', 'Full Home', 'Bedroom'];

export default function CostEstimatorTeaser() {
  return (
    <div style={{
      background: 'var(--bg-parchment)', border: '1px solid var(--border-sub)',
      borderRadius: 'var(--r-2xl)', padding: 'clamp(28px,5vw,48px)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '24px', flexWrap: 'wrap',
    }}>
      <div>
        <p className="caps-label-primary" style={{ marginBottom: '10px' }}>WONDERING ABOUT THE COST?</p>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,30px)',
          fontWeight: 400, color: 'var(--text)', margin: 0, letterSpacing: '-.01em',
        }}>
          Estimate your{' '}
          <RotatingWord words={PROJECT_WORDS} style={{ color: 'var(--primary)', fontStyle: 'italic' }} />{' '}
          budget in minutes
        </h3>
      </div>
      <Link href="/cost-calculator" style={{ textDecoration: 'none', flexShrink: 0 }}>
        <button style={{
          background: 'var(--primary)', color: '#fff', padding: '13px 28px',
          borderRadius: '999px', fontSize: '14px', fontWeight: 500, border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 4px 14px rgba(181,84,30,.3)', whiteSpace: 'nowrap',
        }}>
          Estimate my budget <ArrowRight size={14} />
        </button>
      </Link>
    </div>
  );
}
