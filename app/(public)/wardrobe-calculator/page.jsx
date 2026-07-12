'use client';
import { useState } from 'react';
import Link from 'next/link';

function fmtINR(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

const CONFIG = {
  base: 35000,
  types: { 'Sliding door': 0, 'Hinged door': 0, 'Walk-in wardrobe': 20000 },
  widths: { '3 ft': 0, '4 ft': 15000, '6 ft': 30000, '8 ft': 50000, '10 ft': 75000, 'Custom': 0 },
  materials: { 'HDF': 0, 'BWP Plywood': 20000, 'MDF': 10000 },
  finishes: { 'Laminate': 0, 'Acrylic': 15000, 'PU finish': 25000, 'Membrane': 12000 },
  interiors: {
    'Hanging space only': 0,
    'Hanging + shelves': 8000,
    'Full with drawers': 20000,
    'Full with drawers + accessories': 35000,
  },
  accessories: {
    'Shoe rack': 5000,
    'Trouser pull-out': 4000,
    'Tie & belt organiser': 2500,
    'Pull-down hanger': 8000,
    'LED lighting': 6000,
    'Mirror panel': 7000,
  },
};

function PillGroup({ label, options, value, onChange }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-mid)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '10px' }}>{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
              cursor: 'pointer',
              border: value === opt ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: value === opt ? 'var(--primary-bg)' : 'var(--surface)',
              color: value === opt ? 'var(--primary)' : 'var(--text-sub)',
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function WardrobeCalculatorPage() {
  const [type, setType] = useState('Sliding door');
  const [width, setWidth] = useState('6 ft');
  const [material, setMaterial] = useState('BWP Plywood');
  const [finish, setFinish] = useState('Laminate');
  const [interior, setInterior] = useState('Hanging + shelves');
  const [accessories, setAccessories] = useState([]);

  function toggleAccessory(acc) {
    setAccessories((prev) =>
      prev.includes(acc) ? prev.filter((a) => a !== acc) : [...prev, acc]
    );
  }

  const cost =
    CONFIG.base +
    (CONFIG.types[type] || 0) +
    (CONFIG.widths[width] || 0) +
    (CONFIG.materials[material] || 0) +
    (CONFIG.finishes[finish] || 0) +
    (CONFIG.interiors[interior] || 0) +
    accessories.reduce((sum, a) => sum + (CONFIG.accessories[a] || 0), 0);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '108px 40px 80px' }}>
      <p className="caps-label-primary" style={{ marginBottom: '10px' }}>WARDROBE COST CALCULATOR</p>
      <h1 className="section-heading" style={{ marginBottom: '8px' }}>Custom wardrobe cost estimator</h1>
      <p style={{ fontSize: '15px', color: 'var(--text-mid)', marginBottom: '48px' }}>
        Get an instant estimate for your custom wardrobe. Adjust options to see live cost updates.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '40px', alignItems: 'start' }} className="guide-grid">
        {/* Left — Options */}
        <div>
          <PillGroup label="Door type" options={Object.keys(CONFIG.types)} value={type} onChange={setType} />
          <PillGroup label="Width" options={Object.keys(CONFIG.widths)} value={width} onChange={setWidth} />
          <PillGroup label="Carcass material" options={Object.keys(CONFIG.materials)} value={material} onChange={setMaterial} />
          <PillGroup label="Shutter finish" options={Object.keys(CONFIG.finishes)} value={finish} onChange={setFinish} />
          <PillGroup label="Interior layout" options={Object.keys(CONFIG.interiors)} value={interior} onChange={setInterior} />

          {/* Accessories (multi-select) */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-mid)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '10px' }}>Add-on accessories</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.entries(CONFIG.accessories).map(([acc, price]) => (
                <button
                  key={acc}
                  onClick={() => toggleAccessory(acc)}
                  style={{
                    padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 500,
                    cursor: 'pointer',
                    border: accessories.includes(acc) ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: accessories.includes(acc) ? 'var(--primary-bg)' : 'var(--surface)',
                    color: accessories.includes(acc) ? 'var(--primary)' : 'var(--text-sub)',
                  }}
                >
                  {acc} <span style={{ fontSize: '11px', opacity: 0.7 }}>+{fmtINR(price)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Result */}
        <div className="wardrobe-result" style={{ position: 'sticky', top: '100px' }}>
          <div style={{ background: 'var(--surface)', border: '2px solid var(--primary)', borderRadius: '16px', padding: '28px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.1em', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '8px' }}>YOUR ESTIMATE</p>

            <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: 'var(--text)', lineHeight: 1, marginBottom: '4px' }}>
              {fmtINR(cost)}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-hint)', marginBottom: '20px' }}>Estimate ± 15%</p>

            {/* Breakdown */}
            <div style={{ fontSize: '12px', marginBottom: '20px' }}>
              {[
                ['Base cost', CONFIG.base],
                [type, CONFIG.types[type]],
                [width, CONFIG.widths[width]],
                [material, CONFIG.materials[material]],
                [finish, CONFIG.finishes[finish]],
                [interior, CONFIG.interiors[interior]],
                ...accessories.map((a) => [a, CONFIG.accessories[a]]),
              ].filter(([, v]) => v > 0).map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-sub)' }}>
                  <span>{label}</span>
                  <span>{fmtINR(value)}</span>
                </div>
              ))}
            </div>

            <Link href="/vendors?specialization=Wardrobe" style={{
              display: 'block', textAlign: 'center', background: 'var(--primary)', color: '#fff',
              padding: '12px', borderRadius: 'var(--r-md)', fontSize: '13px',
              fontWeight: 500, textDecoration: 'none', marginBottom: '8px',
            }}>
              Find wardrobe designers →
            </Link>
            <Link href="/enquiry" style={{
              display: 'block', textAlign: 'center',
              border: '1px solid var(--border)', color: 'var(--text-sub)',
              padding: '11px', borderRadius: 'var(--r-md)', fontSize: '13px',
              textDecoration: 'none',
            }}>
              Get free quote
            </Link>
          </div>

          <p style={{ fontSize: '11px', color: 'var(--text-hint)', lineHeight: 1.6, marginTop: '12px', textAlign: 'center' }}>
            Estimates based on Bangalore market rates. Actual cost may vary based on site conditions and designer.
          </p>
        </div>
      </div>
    </div>
  );
}
