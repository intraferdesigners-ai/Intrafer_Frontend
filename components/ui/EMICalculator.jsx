'use client';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter';

function fmtINR(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

const TENURES = [12, 24, 36];
const MIN = 100000;
const MAX = 5000000;

export default function EMICalculator({ defaultAmount }) {
  const [principal, setPrincipal] = useState(defaultAmount || 500000);
  const [tenure, setTenure] = useState(24);
  const [rate] = useState(10.5);
  const shouldReduceMotion = useReducedMotion();

  const r = rate / 1200;
  const n = tenure;
  const emi = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  const total = emi * tenure;
  const progress = ((principal - MIN) / (MAX - MIN)) * 100;

  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(155deg, var(--surface) 0%, var(--bg-parchment) 100%)',
      border: '1px solid var(--border-sub)',
      borderRadius: 'var(--r-2xl)',
      padding: 'clamp(24px, 3vw, 36px)',
      maxWidth: '520px',
      boxShadow: 'var(--shadow-lg)',
    }}>
      {/* Ambient two-tone glow — same brand-consistent blue+rust depth
          treatment as the hero section's decorative blobs. */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '-60px', right: '-60px',
        width: '180px', height: '180px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(29,78,216,.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: '-40px', left: '-40px',
        width: '140px', height: '140px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(181,84,30,.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative' }}>
        <p className="caps-label-primary" style={{ marginBottom: '4px' }}>EMI ESTIMATOR</p>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 400, color: 'var(--text)', marginBottom: '28px' }}>
          Plan your budget
        </p>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-mid)' }}>Project budget</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{fmtINR(principal)}</span>
          </div>
          <input
            type="range"
            className="emi-range"
            min={MIN}
            max={MAX}
            step={50000}
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            style={{ '--range-progress': `${progress}%` }}
            aria-label="Project budget"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-hint)', marginTop: '8px' }}>
            <span>₹1 Lakh</span><span>₹50 Lakhs</span>
          </div>
        </div>

        <div style={{ marginBottom: '26px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-mid)', marginBottom: '10px' }}>Loan tenure</p>
          <div style={{
            display: 'flex', gap: '4px', background: 'var(--bg-parchment)',
            padding: '4px', borderRadius: '12px', border: '1px solid var(--border)',
          }}>
            {TENURES.map((t) => (
              <button
                key={t}
                onClick={() => setTenure(t)}
                style={{
                  flex: 1, position: 'relative', padding: '9px 8px',
                  borderRadius: '9px', fontSize: '13px', fontWeight: 500,
                  cursor: 'pointer', border: 'none', background: 'transparent',
                  color: tenure === t ? '#fff' : 'var(--text-sub)',
                  transition: 'color 200ms',
                }}
              >
                {tenure === t && (
                  <motion.div
                    layoutId="emi-tenure-highlight"
                    style={{
                      position: 'absolute', inset: 0, zIndex: 0,
                      background: 'var(--primary)', borderRadius: '9px',
                      boxShadow: '0 2px 8px rgba(29,78,216,.35)',
                    }}
                    transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>{t} mo</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 60%, #1D4ED8 100%)',
          borderRadius: 'var(--r-lg)', padding: '22px', marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,.7)' }}>Monthly EMI</span>
            <AnimatedCounter
              end={Math.round(emi)}
              duration={700}
              format={fmtINR}
              style={{ fontSize: '22px', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.55)' }}>Total amount ({tenure} months)</span>
            <AnimatedCounter
              end={Math.round(total)}
              duration={700}
              format={fmtINR}
              style={{ fontSize: '13px', color: 'rgba(255,255,255,.85)', fontWeight: 500 }}
            />
          </div>
        </div>

        <p style={{ fontSize: '11px', color: 'var(--text-hint)', lineHeight: 1.5 }}>
          Subject to bank approval. Interest rate @{rate}% p.a. (indicative). Actual rate may vary.
        </p>
      </div>
    </div>
  );
}
