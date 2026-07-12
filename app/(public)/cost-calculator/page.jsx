'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calculator, Home, ChevronRight, CheckCircle, Building2 } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';

const ROOM_BASE_COSTS = {
  'Modular Kitchen':           { essential: 150000, premium: 280000, luxury: 500000 },
  'Living Room':               { essential: 80000,  premium: 150000, luxury: 280000 },
  'Master Bedroom':            { essential: 100000, premium: 190000, luxury: 350000 },
  'Additional Bedroom':        { essential: 70000,  premium: 130000, luxury: 240000 },
  'Bathroom':                  { essential: 40000,  premium: 80000,  luxury: 150000 },
  'Dining Area':               { essential: 30000,  premium: 60000,  luxury: 110000 },
  'Study/Office':              { essential: 50000,  premium: 90000,  luxury: 160000 },
  'Pooja Room':                { essential: 20000,  premium: 40000,  luxury: 70000  },
  'Balcony':                   { essential: 15000,  premium: 30000,  luxury: 55000  },
  'False Ceiling (Full Home)': { essential: 50000,  premium: 90000,  luxury: 150000 },
};

const CITY_MULTIPLIERS = {
  'Mumbai':    1.25,
  'Delhi NCR': 1.15,
  'Bangalore': 1.10,
  'Hyderabad': 1.00,
  'Chennai':   1.00,
  'Pune':      1.05,
  'Kolkata':   0.95,
  'Other':     0.90,
};

const BHK_DEFAULTS = {
  '1 BHK': ['Modular Kitchen', 'Living Room', 'Master Bedroom', 'Bathroom'],
  '2 BHK': ['Modular Kitchen', 'Living Room', 'Master Bedroom', 'Additional Bedroom', 'Bathroom', 'Dining Area'],
  '3 BHK': ['Modular Kitchen', 'Living Room', 'Master Bedroom', 'Additional Bedroom', 'Additional Bedroom', 'Bathroom', 'Dining Area', 'False Ceiling (Full Home)'],
  '4 BHK': ['Modular Kitchen', 'Living Room', 'Master Bedroom', 'Additional Bedroom', 'Additional Bedroom', 'Additional Bedroom', 'Bathroom', 'Dining Area', 'Study/Office', 'False Ceiling (Full Home)'],
  'Villa':  ['Modular Kitchen', 'Living Room', 'Master Bedroom', 'Additional Bedroom', 'Additional Bedroom', 'Bathroom', 'Dining Area', 'Study/Office', 'Pooja Room', 'Balcony', 'False Ceiling (Full Home)'],
};

const ALL_ROOMS = Object.keys(ROOM_BASE_COSTS);
const BHK_OPTIONS = Object.keys(BHK_DEFAULTS);
const TIER_INFO = [
  {
    id: 'essential', label: 'Essential', symbol: '₹',
    desc: 'Basic quality materials and finishes. Functional and durable.',
    features: ['Basic modular fittings', 'Standard flooring', 'Essential lighting'],
  },
  {
    id: 'premium', label: 'Premium', symbol: '₹₹', badge: 'POPULAR',
    desc: 'Premium materials. Balance of quality and aesthetics.',
    features: ['Branded hardware', 'Engineered wood', 'Designer fixtures'],
  },
  {
    id: 'luxury', label: 'Luxury', symbol: '₹₹₹',
    desc: 'Top-of-the-line materials and bespoke finishes.',
    features: ['Imported materials', 'Custom furniture', 'Premium lighting'],
  },
];

function formatINR(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

const STEP_LABELS = ['Home Type', 'Select Rooms', 'Quality & City', 'Your Estimate'];

export default function CostCalculatorPage() {
  useEffect(() => { document.title = 'Interior Design Cost Calculator | Intrafer'; }, []);

  const [step,            setStep]            = useState(1);
  const [bhk,             setBhk]             = useState('2 BHK');
  const [selectedRooms,   setSelectedRooms]   = useState(BHK_DEFAULTS['2 BHK']);
  const [tier,            setTier]            = useState('premium');
  const [city,            setCity]            = useState('Bangalore');
  const [matchingVendors, setMatchingVendors] = useState([]);
  const [vendorsLoading,  setVendorsLoading]  = useState(false);

  useEffect(() => {
    if (step !== 4) return;
    setVendorsLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/vendors?city=${encodeURIComponent(city)}&limit=3&sort=rating`)
      .then(r => r.json())
      .then(d => setMatchingVendors(d.data?.vendors || []))
      .catch(() => {})
      .finally(() => setVendorsLoading(false));
  }, [step, city]);

  const handleBhkChange = (b) => {
    setBhk(b);
    setSelectedRooms([...BHK_DEFAULTS[b]]);
  };

  const toggleRoom = (room) => {
    setSelectedRooms((prev) =>
      prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room]
    );
  };

  const estimate = useMemo(() => {
    const multiplier = CITY_MULTIPLIERS[city] || 1;
    const counts = {};
    for (const r of selectedRooms) counts[r] = (counts[r] || 0) + 1;
    let total = 0;
    for (const [room, count] of Object.entries(counts)) {
      const base = ROOM_BASE_COSTS[room]?.[tier] || 0;
      total += base * count;
    }
    total = Math.round(total * multiplier);
    return { total, min: Math.round(total * 0.9), max: Math.round(total * 1.15), multiplier, counts };
  }, [selectedRooms, tier, city]);

  const reset = () => { setStep(1); setBhk('2 BHK'); setSelectedRooms(BHK_DEFAULTS['2 BHK']); setTier('premium'); setCity('Bangalore'); };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: 'clamp(80px, 10vw, 108px) clamp(16px, 4vw, 32px) 80px' }}>

      {/* Header */}
      <p className="caps-label-primary" style={{ marginBottom: '8px' }}>COST CALCULATOR</p>
      <h1 className="page-heading" style={{ marginBottom: '10px' }}>Estimate your interior design budget</h1>
      <p style={{ fontSize: '14px', color: 'var(--text-mid)', marginBottom: '40px' }}>
        Get an instant estimate based on your home size, rooms, and quality preference.
      </p>

      {/* Progress */}
      <div style={{ display: 'flex', marginBottom: '40px', gap: 0 }}>
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const done = step > n;
          const current = step === n;
          return (
            <div key={n} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
              {i > 0 && (
                <div style={{
                  position: 'absolute', left: 0, top: '14px', width: '50%', height: '2px',
                  background: done || current ? 'var(--primary)' : 'var(--border)',
                }} />
              )}
              {i < STEP_LABELS.length - 1 && (
                <div style={{
                  position: 'absolute', right: 0, top: '14px', width: '50%', height: '2px',
                  background: done ? 'var(--primary)' : 'var(--border)',
                }} />
              )}
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', margin: '0 auto 6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 600, position: 'relative', zIndex: 1,
                background: done || current ? 'var(--primary)' : 'var(--surface)',
                color:      done || current ? '#fff'            : 'var(--text-hint)',
                border:     done || current ? 'none' : '1.5px solid var(--border)',
              }}>{done ? '✓' : n}</div>
              <div style={{ fontSize: '11px', color: current ? 'var(--primary)' : 'var(--text-hint)', fontWeight: current ? 500 : 400 }}>{label}</div>
            </div>
          );
        })}
      </div>

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-2xl)', padding: '36px', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, color: 'var(--text)', marginBottom: '24px' }}>
            What type of home?
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '32px' }}>
            {BHK_OPTIONS.map((b) => (
              <button key={b} onClick={() => handleBhkChange(b)} style={{
                padding: '16px 24px', border: '1.5px solid',
                borderColor: bhk === b ? 'var(--primary)' : 'var(--border)',
                borderRadius: 'var(--r-lg)', cursor: 'pointer', textAlign: 'center',
                background: bhk === b ? 'var(--primary-bg)' : 'var(--surface)',
                color:      bhk === b ? 'var(--primary)'    : 'var(--text-sub)',
                minWidth: '120px', transition: 'all 150ms ease-out',
              }}>
                <Home size={20} color={bhk === b ? 'var(--primary)' : 'var(--text-hint)'} style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '14px', fontWeight: 500 }}>{b}</div>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(2)} style={{
            background: 'var(--primary)', color: '#fff', padding: '13px 28px',
            borderRadius: 'var(--r-md)', border: 'none', fontSize: '14px',
            fontWeight: 500, cursor: 'pointer',
          }}>
            Next: Select rooms →
          </button>
        </div>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-2xl)', padding: '36px', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, color: 'var(--text)', marginBottom: '6px' }}>
            Which rooms to design?
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-hint)', marginBottom: '24px' }}>
            Pre-selected based on your {bhk}. Customise as needed.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
            {ALL_ROOMS.map((room) => {
              const active = selectedRooms.includes(room);
              return (
                <button key={room} onClick={() => toggleRoom(room)} style={{
                  padding: '9px 16px', border: '1.5px solid',
                  borderColor: active ? 'var(--primary)' : 'var(--border)',
                  borderRadius: '24px', cursor: 'pointer', fontSize: '13px',
                  background: active ? 'var(--primary-bg)' : 'var(--surface)',
                  color:      active ? 'var(--primary)'    : 'var(--text-sub)',
                  transition: 'all 150ms ease-out', fontWeight: active ? 500 : 400,
                }}>
                  {room}
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-hint)', marginBottom: '28px' }}>
            * Multiple bedrooms: select Additional Bedroom once per extra room.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setStep(1)} style={{
              background: 'var(--surface)', color: 'var(--text-sub)', padding: '12px 22px',
              borderRadius: 'var(--r-md)', border: '1px solid var(--border)',
              fontSize: '14px', cursor: 'pointer',
            }}>
              ← Back
            </button>
            <button onClick={() => setStep(3)} style={{
              background: 'var(--primary)', color: '#fff', padding: '13px 28px',
              borderRadius: 'var(--r-md)', border: 'none', fontSize: '14px',
              fontWeight: 500, cursor: 'pointer',
            }}>
              Next: Quality →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3 ── */}
      {step === 3 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-2xl)', padding: '36px', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, color: 'var(--text)', marginBottom: '24px' }}>
            Quality level &amp; location
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '14px', marginBottom: '28px' }}>
            {TIER_INFO.map((t) => (
              <div key={t.id} onClick={() => setTier(t.id)} style={{
                border: '1.5px solid',
                borderColor: tier === t.id ? 'var(--primary)' : 'var(--border)',
                borderRadius: 'var(--r-xl)', padding: '20px', cursor: 'pointer',
                background: tier === t.id ? 'var(--primary-bg)' : 'var(--surface)',
                position: 'relative', transition: 'all 150ms ease-out',
              }}>
                {t.badge && (
                  <span style={{
                    position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--primary)', color: '#fff', fontSize: '9px',
                    fontWeight: 700, letterSpacing: '.1em', padding: '3px 10px',
                    borderRadius: '20px',
                  }}>{t.badge}</span>
                )}
                <div style={{ fontSize: '22px', marginBottom: '4px' }}>{t.symbol}</div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>{t.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: '12px' }}>{t.desc}</div>
                {t.features.map((f) => (
                  <div key={f} style={{ fontSize: '11px', color: 'var(--text-hint)', marginBottom: '4px' }}>✓ {f}</div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', color: 'var(--text-hint)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Project location (affects pricing)
            </label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="form-select-styled">
              {Object.keys(CITY_MULTIPLIERS).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setStep(2)} style={{
              background: 'var(--surface)', color: 'var(--text-sub)', padding: '12px 22px',
              borderRadius: 'var(--r-md)', border: '1px solid var(--border)',
              fontSize: '14px', cursor: 'pointer',
            }}>
              ← Back
            </button>
            <button onClick={() => setStep(4)} style={{
              background: 'var(--primary)', color: '#fff', padding: '13px 28px',
              borderRadius: 'var(--r-md)', border: 'none', fontSize: '14px',
              fontWeight: 500, cursor: 'pointer',
            }}>
              Calculate my estimate →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4 ── */}
      {step === 4 && (
        <div>
          {/* Result card */}
          <div style={{
            background: 'var(--primary-bg)', border: '1.5px solid var(--primary-light)',
            borderRadius: 'var(--r-2xl)', padding: '36px', textAlign: 'center',
            marginBottom: '24px',
          }}>
            <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.14em', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '10px' }}>
              ESTIMATED RANGE
            </p>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: 400,
              color: 'var(--primary)', letterSpacing: '-.02em', lineHeight: 1.1,
              marginBottom: '10px',
            }}>
              {formatINR(estimate.min)} – {formatINR(estimate.max)}
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-hint)' }}>
              Based on {tier} quality in {city}
            </p>
          </div>

          {/* Breakdown */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr auto',
              background: 'var(--bg-parchment)', padding: '10px 16px',
              borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', color: 'var(--text-hint)', textTransform: 'uppercase' }}>Room</span>
              <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', color: 'var(--text-hint)', textTransform: 'uppercase' }}>Estimated Cost</span>
            </div>
            {Object.entries(estimate.counts).map(([room, count]) => {
              const cost = (ROOM_BASE_COSTS[room]?.[tier] || 0) * count * estimate.multiplier;
              return (
                <div key={room} style={{
                  display: 'grid', gridTemplateColumns: '1fr auto',
                  padding: '12px 16px', borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-sub)' }}>
                    {room}{count > 1 ? ` (×${count})` : ''}
                  </span>
                  <span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 400 }}>
                    {formatINR(Math.round(cost))}
                  </span>
                </div>
              );
            })}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr auto',
              padding: '14px 16px', background: 'var(--bg-parchment)',
            }}>
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>Total (mid-estimate)</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary)' }}>{formatINR(estimate.total)}</span>
            </div>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-hint)', marginBottom: '28px', lineHeight: 1.6 }}>
            * Estimates are indicative and may vary based on site conditions, design complexity, and material availability.
            Get quotes from multiple designers for accurate pricing.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href={`/vendors${city ? `?city=${encodeURIComponent(city)}` : ''}`} style={{
              display: 'block', background: 'var(--primary)', color: '#fff',
              padding: '14px', borderRadius: 'var(--r-md)', textAlign: 'center',
              fontSize: '14px', fontWeight: 500, textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(181,84,30,.3)',
            }}>
              Find designers in your budget →
            </Link>
            <button onClick={reset} style={{
              background: 'var(--surface)', color: 'var(--text-sub)', padding: '13px',
              borderRadius: 'var(--r-md)', border: '1px solid var(--border)',
              fontSize: '14px', cursor: 'pointer', width: '100%',
            }}>
              ← Recalculate
            </button>
          </div>

          {/* Matching vendors */}
          <div style={{
            background: 'var(--bg-parchment)', borderRadius: 'var(--r-xl)',
            padding: '24px', marginTop: '24px',
          }}>
            <p className="caps-label-primary" style={{ marginBottom: '4px' }}>
              DESIGNERS IN YOUR BUDGET · {city.toUpperCase()}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-hint)', marginBottom: '16px' }}>
              Top-rated designers for your project range
            </p>

            {vendorsLoading && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <Spinner size="sm" />
              </div>
            )}

            {!vendorsLoading && matchingVendors.length === 0 && (
              <p style={{ fontSize: '13px', color: 'var(--text-hint)', textAlign: 'center' }}>
                No designers found in {city}.{' '}
                <Link href="/vendors" style={{ color: 'var(--primary)', fontWeight: 500 }}>Try all cities →</Link>
              </p>
            )}

            {!vendorsLoading && matchingVendors.map(v => (
              <div key={v._id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-lg)', padding: '12px 16px', marginBottom: '8px',
              }}>
                {v.portfolioImages?.[0] ? (
                  <div style={{ position: 'relative', width: 40, height: 40, borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                    <Image src={v.portfolioImages[0]} alt={v.businessName} fill style={{ objectFit: 'cover' }} sizes="40px" />
                  </div>
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: '8px', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Building2 size={18} color="var(--primary)" />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', margin: 0 }}>{v.businessName}</p>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-hint)' }}>{v.location?.city}</span>
                    {v.specializations?.[0] && (
                      <span style={{ fontSize: '10px', background: 'var(--primary-bg)', color: 'var(--primary)', padding: '1px 6px', borderRadius: '10px', fontWeight: 500 }}>
                        {v.specializations[0]}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  {v.rating > 0 && (
                    <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 500 }}>★ {Number(v.rating).toFixed(1)}</span>
                  )}
                  <Link href={`/enquiry?vendorId=${v._id}`} style={{
                    fontSize: '12px', fontWeight: 500, color: 'var(--primary)',
                    textDecoration: 'none', whiteSpace: 'nowrap',
                  }}>
                    Get quote →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
