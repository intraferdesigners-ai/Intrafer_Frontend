'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calculator, Home, ChevronRight, CheckCircle, Building2 } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';
import V2Button from '@/components/v2/ui/Button';

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

export default function CostCalculatorClient() {
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
    <div style={{ fontFamily: 'var(--v2-font-ui)' }}>
      {/* Hero */}
      <section style={{ background: '#0F172A', padding: 'clamp(56px,8vw,88px) clamp(16px,4vw,36px) clamp(40px,6vw,56px)' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
          <RevealOnScroll direction="up">
            <p className="v2-eyebrow" style={{ marginBottom: '16px' }}>Budget planning</p>
            <h1 className="v2-h1" style={{ color: '#F8F7F4', fontSize: 'clamp(30px,4.5vw,44px)', marginBottom: '14px' }}>
              How much does interior design cost in India?
            </h1>
            <p style={{ fontSize: '15px', color: '#94A3B8', lineHeight: 1.7 }}>
              Get a rough estimate for your project based on city, home size, and scope. Updated for 2026 rates.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Calculator */}
      <section style={{ background: '#F8F7F4', padding: 'clamp(48px,7vw,64px) clamp(16px,4vw,36px)' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>

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
                  background: done || current ? '#3B82F6' : '#E2E8F0',
                }} />
              )}
              {i < STEP_LABELS.length - 1 && (
                <div style={{
                  position: 'absolute', right: 0, top: '14px', width: '50%', height: '2px',
                  background: done ? '#3B82F6' : '#E2E8F0',
                }} />
              )}
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', margin: '0 auto 6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 600, position: 'relative', zIndex: 1,
                background: done || current ? '#3B82F6' : '#FFFFFF',
                color:      done || current ? '#fff'            : '#94A3B8',
                border:     done || current ? 'none' : '1.5px solid #E2E8F0',
              }}>{done ? '✓' : n}</div>
              <div style={{ fontSize: '11px', color: current ? '#3B82F6' : '#94A3B8', fontWeight: current ? 500 : 400 }}>{label}</div>
            </div>
          );
        })}
      </div>

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '36px', boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)' }}>
          <h2 style={{ fontFamily: 'var(--v2-font-display)', fontSize: '22px', fontWeight: 400, color: '#0F172A', marginBottom: '24px' }}>
            What type of home?
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '32px' }}>
            {BHK_OPTIONS.map((b) => (
              <button key={b} onClick={() => handleBhkChange(b)} style={{
                padding: '16px 24px', border: '1.5px solid',
                borderColor: bhk === b ? '#3B82F6' : '#E2E8F0',
                borderRadius: '14px', cursor: 'pointer', textAlign: 'center',
                background: bhk === b ? 'rgba(59,130,246,0.08)' : '#FFFFFF',
                color:      bhk === b ? '#3B82F6'    : '#334155',
                minWidth: '120px', transition: 'all 150ms ease-out',
              }}>
                <Home size={20} color={bhk === b ? '#3B82F6' : '#94A3B8'} style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '14px', fontWeight: 500 }}>{b}</div>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(2)} style={{
            background: '#3B82F6', color: '#fff', padding: '13px 28px',
            borderRadius: '10px', border: 'none', fontSize: '14px',
            fontWeight: 500, cursor: 'pointer',
          }}>
            Next: Select rooms →
          </button>
        </div>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '36px', boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)' }}>
          <h2 style={{ fontFamily: 'var(--v2-font-display)', fontSize: '22px', fontWeight: 400, color: '#0F172A', marginBottom: '6px' }}>
            Which rooms to design?
          </h2>
          <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '24px' }}>
            Pre-selected based on your {bhk}. Customise as needed.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
            {ALL_ROOMS.map((room) => {
              const active = selectedRooms.includes(room);
              return (
                <button key={room} onClick={() => toggleRoom(room)} style={{
                  padding: '9px 16px', border: '1.5px solid',
                  borderColor: active ? '#3B82F6' : '#E2E8F0',
                  borderRadius: '24px', cursor: 'pointer', fontSize: '13px',
                  background: active ? 'rgba(59,130,246,0.08)' : '#FFFFFF',
                  color:      active ? '#3B82F6'    : '#334155',
                  transition: 'all 150ms ease-out', fontWeight: active ? 500 : 400,
                }}>
                  {room}
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '28px' }}>
            * Multiple bedrooms: select Additional Bedroom once per extra room.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setStep(1)} style={{
              background: '#FFFFFF', color: '#334155', padding: '12px 22px',
              borderRadius: '10px', border: '1px solid #E2E8F0',
              fontSize: '14px', cursor: 'pointer',
            }}>
              ← Back
            </button>
            <button onClick={() => setStep(3)} style={{
              background: '#3B82F6', color: '#fff', padding: '13px 28px',
              borderRadius: '10px', border: 'none', fontSize: '14px',
              fontWeight: 500, cursor: 'pointer',
            }}>
              Next: Quality →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3 ── */}
      {step === 3 && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '36px', boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)' }}>
          <h2 style={{ fontFamily: 'var(--v2-font-display)', fontSize: '22px', fontWeight: 400, color: '#0F172A', marginBottom: '24px' }}>
            Quality level &amp; location
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '14px', marginBottom: '28px' }}>
            {TIER_INFO.map((t) => (
              <div key={t.id} onClick={() => setTier(t.id)} style={{
                border: '1.5px solid',
                borderColor: tier === t.id ? '#3B82F6' : '#E2E8F0',
                borderRadius: '20px', padding: '20px', cursor: 'pointer',
                background: tier === t.id ? 'rgba(59,130,246,0.08)' : '#FFFFFF',
                position: 'relative', transition: 'all 150ms ease-out',
              }}>
                {t.badge && (
                  <span style={{
                    position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                    background: '#3B82F6', color: '#fff', fontSize: '9px',
                    fontWeight: 700, letterSpacing: '.1em', padding: '3px 10px',
                    borderRadius: '20px',
                  }}>{t.badge}</span>
                )}
                <div style={{ fontSize: '22px', marginBottom: '4px' }}>{t.symbol}</div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: '#0F172A', marginBottom: '6px' }}>{t.label}</div>
                <div style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.6, marginBottom: '12px' }}>{t.desc}</div>
                {t.features.map((f) => (
                  <div key={f} style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '4px' }}>✓ {f}</div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', color: '#94A3B8', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Project location (affects pricing)
            </label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="v2-input" style={{ cursor: 'pointer' }}>
              {Object.keys(CITY_MULTIPLIERS).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setStep(2)} style={{
              background: '#FFFFFF', color: '#334155', padding: '12px 22px',
              borderRadius: '10px', border: '1px solid #E2E8F0',
              fontSize: '14px', cursor: 'pointer',
            }}>
              ← Back
            </button>
            <button onClick={() => setStep(4)} style={{
              background: '#3B82F6', color: '#fff', padding: '13px 28px',
              borderRadius: '10px', border: 'none', fontSize: '14px',
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
            background: 'rgba(59,130,246,0.08)', border: '1.5px solid rgba(59,130,246,0.2)',
            borderRadius: '20px', padding: '36px', textAlign: 'center',
            marginBottom: '24px',
          }}>
            <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.14em', color: '#3B82F6', textTransform: 'uppercase', marginBottom: '10px' }}>
              ESTIMATED RANGE
            </p>
            <div style={{
              fontFamily: 'var(--v2-font-display)', fontSize: '40px', fontWeight: 400,
              color: '#3B82F6', letterSpacing: '-.02em', lineHeight: 1.1,
              marginBottom: '10px',
            }}>
              {formatINR(estimate.min)} – {formatINR(estimate.max)}
            </div>
            <p style={{ fontSize: '14px', color: '#94A3B8' }}>
              Based on {tier} quality in {city}
            </p>
          </div>

          {/* Breakdown */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr auto',
              background: '#F1F5F9', padding: '10px 16px',
              borderBottom: '1px solid #E2E8F0',
            }}>
              <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', color: '#94A3B8', textTransform: 'uppercase' }}>Room</span>
              <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', color: '#94A3B8', textTransform: 'uppercase' }}>Estimated Cost</span>
            </div>
            {Object.entries(estimate.counts).map(([room, count]) => {
              const cost = (ROOM_BASE_COSTS[room]?.[tier] || 0) * count * estimate.multiplier;
              return (
                <div key={room} style={{
                  display: 'grid', gridTemplateColumns: '1fr auto',
                  padding: '12px 16px', borderBottom: '1px solid #E2E8F0',
                }}>
                  <span style={{ fontSize: '14px', color: '#334155' }}>
                    {room}{count > 1 ? ` (×${count})` : ''}
                  </span>
                  <span style={{ fontSize: '14px', color: '#0F172A', fontWeight: 400 }}>
                    {formatINR(Math.round(cost))}
                  </span>
                </div>
              );
            })}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr auto',
              padding: '14px 16px', background: '#F1F5F9',
            }}>
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>Total (mid-estimate)</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#3B82F6' }}>{formatINR(estimate.total)}</span>
            </div>
          </div>

          <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '28px', lineHeight: 1.6 }}>
            * Estimates are indicative and may vary based on site conditions, design complexity, and material availability.
            Get quotes from multiple designers for accurate pricing.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href={`/vendors${city ? `?city=${encodeURIComponent(city)}` : ''}`} style={{
              display: 'block', background: '#3B82F6', color: '#fff',
              padding: '14px', borderRadius: '10px', textAlign: 'center',
              fontSize: '14px', fontWeight: 500, textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(59,130,246,.3)',
            }}>
              Find designers in your budget →
            </Link>
            <button onClick={reset} style={{
              background: '#FFFFFF', color: '#334155', padding: '13px',
              borderRadius: '10px', border: '1px solid #E2E8F0',
              fontSize: '14px', cursor: 'pointer', width: '100%',
            }}>
              ← Recalculate
            </button>
          </div>

          {/* Matching vendors */}
          <div style={{
            background: '#F1F5F9', borderRadius: '20px',
            padding: '24px', marginTop: '24px',
          }}>
            <p className="v2-eyebrow" style={{ marginBottom: '4px' }}>
              DESIGNERS IN YOUR BUDGET · {city.toUpperCase()}
            </p>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '16px' }}>
              Top-rated designers for your project range
            </p>

            {vendorsLoading && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <Spinner size="sm" />
              </div>
            )}

            {!vendorsLoading && matchingVendors.length === 0 && (
              <p style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center' }}>
                No designers found in {city}.{' '}
                <Link href="/vendors" style={{ color: '#3B82F6', fontWeight: 500 }}>Try all cities →</Link>
              </p>
            )}

            {!vendorsLoading && matchingVendors.map(v => (
              <div key={v._id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: '#FFFFFF', border: '1px solid #E2E8F0',
                borderRadius: '14px', padding: '12px 16px', marginBottom: '8px',
              }}>
                {v.portfolioImages?.[0] ? (
                  <div style={{ position: 'relative', width: 40, height: 40, borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                    <Image src={v.portfolioImages[0]} alt={v.businessName} fill style={{ objectFit: 'cover' }} sizes="40px" />
                  </div>
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: '8px', background: 'rgba(59,130,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Building2 size={18} color="#3B82F6" />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#0F172A', margin: 0 }}>{v.businessName}</p>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>{v.location?.city}</span>
                    {v.specializations?.[0] && (
                      <span style={{ fontSize: '10px', background: 'rgba(59,130,246,0.08)', color: '#3B82F6', padding: '1px 6px', borderRadius: '10px', fontWeight: 500 }}>
                        {v.specializations[0]}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  {v.rating > 0 && (
                    <span style={{ fontSize: '12px', color: '#3B82F6', fontWeight: 500 }}>★ {Number(v.rating).toFixed(1)}</span>
                  )}
                  <Link href={`/enquiry?vendorId=${v._id}`} style={{
                    fontSize: '12px', fontWeight: 500, color: '#3B82F6',
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
      </section>

      {/* Guide section */}
      <section style={{ background: '#F1F5F9', padding: 'clamp(48px,7vw,72px) clamp(16px,4vw,36px)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <p className="v2-eyebrow" style={{ marginBottom: '12px' }}>Cost factors</p>
          <h2 className="v2-h3" style={{ color: '#0F172A', marginBottom: '32px' }}>What affects interior design costs?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }} className="grid-mobile-1">
            {[
              { title: 'City location', desc: 'Bangalore and Mumbai cost more than Tier-2 cities due to labour and material rates.' },
              { title: 'Scope of work', desc: 'A full home fit-out costs proportionally more than designing a single room.' },
              { title: 'Material quality', desc: 'Basic, mid-range, and premium material choices shift the budget significantly.' },
            ].map((f, i) => (
              <RevealOnScroll key={f.title} direction="up" delay={i * 100}>
                <div>
                  <h3 style={{ fontFamily: 'var(--v2-font-display)', fontSize: '18px', fontWeight: 500, color: '#0F172A', marginBottom: '8px' }}>{f.title}</h3>
                  <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#0F172A', padding: 'clamp(56px,8vw,88px) clamp(16px,4vw,36px)', textAlign: 'center' }}>
        <RevealOnScroll direction="up">
          <h2 className="v2-h2" style={{ color: '#F8F7F4', marginBottom: '24px' }}>
            Get accurate quotes from verified designers
          </h2>
          <Link href="/enquiry">
            <V2Button variant="primary" size="lg">Submit an enquiry →</V2Button>
          </Link>
        </RevealOnScroll>
      </section>
    </div>
  );
}
