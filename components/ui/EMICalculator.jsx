'use client';
import { useState } from 'react';

function fmtINR(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export default function EMICalculator({ defaultAmount }) {
  const [principal, setPrincipal] = useState(defaultAmount || 500000);
  const [tenure, setTenure] = useState(24);
  const [rate] = useState(10.5);

  const r = rate / 1200;
  const n = tenure;
  const emi = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  const total = emi * tenure;

  const TENURES = [12, 24, 36];

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: '16px', padding: '28px', maxWidth: '520px',
    }}>
      <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.1em', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '4px' }}>EMI ESTIMATOR</p>
      <p style={{ fontSize: '20px', fontWeight: 500, color: 'var(--text)', marginBottom: '24px' }}>Plan your budget</p>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-mid)' }}>Project budget</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{fmtINR(principal)}</span>
        </div>
        <input
          type="range"
          min={100000}
          max={5000000}
          step={50000}
          value={principal}
          onChange={(e) => setPrincipal(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--primary)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-hint)', marginTop: '4px' }}>
          <span>₹1 Lakh</span><span>₹50 Lakhs</span>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-mid)', marginBottom: '10px' }}>Loan tenure</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {TENURES.map((t) => (
            <button
              key={t}
              onClick={() => setTenure(t)}
              style={{
                flex: 1, padding: '8px',
                borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                cursor: 'pointer',
                border: tenure === t ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: tenure === t ? 'var(--primary-bg)' : 'var(--bg)',
                color: tenure === t ? 'var(--primary)' : 'var(--text-sub)',
              }}
            >
              {t} mo
            </button>
          ))}
        </div>
      </div>

      <div style={{
        background: 'var(--primary-bg)', borderRadius: '12px',
        padding: '20px', marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-mid)' }}>Monthly EMI</span>
          <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
            {fmtINR(Math.round(emi))}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-hint)' }}>Total amount ({tenure} months)</span>
          <span style={{ fontSize: '13px', color: 'var(--text-sub)', fontWeight: 500 }}>{fmtINR(Math.round(total))}</span>
        </div>
      </div>

      <p style={{ fontSize: '11px', color: 'var(--text-hint)', lineHeight: 1.5 }}>
        Subject to bank approval. Interest rate @{rate}% p.a. (indicative). Actual rate may vary.
      </p>
    </div>
  );
}
