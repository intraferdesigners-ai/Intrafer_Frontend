'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User, Phone, Mail, MapPin, Lock, Clock, BadgeCheck, ArrowRight } from 'lucide-react';
import api from '../../../lib/api';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import CitySelect from '../../../components/ui/CitySelect';

const PROJECT_TYPES = [
  'Residential', 'Modular Kitchen', 'Living Room', 'Office Interiors',
  'Commercial', 'Bedroom', 'Bathroom', 'Full Home Interior',
];

const BUDGET_RANGES = [
  'Below ₹3 Lakhs', '₹3–5 Lakhs', '₹5–10 Lakhs', '₹10–15 Lakhs',
  '₹15–25 Lakhs', '₹25–50 Lakhs', 'Above ₹50 Lakhs',
];

const STEPS = [
  { n: 1, label: 'Submit your project' },
  { n: 2, label: 'Verify with a code' },
  { n: 3, label: 'Get matched' },
];

// Navbar renders position:fixed at height:64px (components/layout/Navbar.jsx)
// and doesn't occupy document flow, so it never pushes this page down on its
// own — unlike the auth pages (no site nav at all, full 100dvh available),
// this page has to explicitly reserve that space itself.
const HEADER_HEIGHT = '64px';

// Left panel: fixed dark navy regardless of site theme, reusing the exact
// same background/text/accent-link triplet as the codebase's existing
// .cta-always-dark pattern (see app/globals.css and its usage on e.g. the
// homepage's closing CTA band) — not theme-relative tokens, since --text/
// --surface swap meaning under .dark and would invert this panel to a
// light background with navy text instead of staying navy. Applied via
// inline styles rather than the .cta-always-dark className itself because
// that class's `* { color: #F0F6FF !important }` rule would force every
// icon/badge/rating star in this panel to one flat color and block the
// accent-blue highlights below (same problem .cta-always-dark works around
// with its own `a { color: #60A5FA !important }` carve-out for links).
const PANEL_BG      = '#0F172A';
const PANEL_FG      = '#F0F6FF';
const PANEL_ACCENT  = '#60A5FA';

function EnquiryForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const vendorId     = searchParams.get('vendorId');

  const [name,         setName]         = useState('');
  const [email,        setEmail]        = useState('');
  const [phone,        setPhone]        = useState('');
  const [projectType,  setProjectType]  = useState('');
  const [budget,       setBudget]       = useState('');
  const [city,         setCity]         = useState('');
  const [requirements, setRequirements] = useState('');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [vendor,       setVendor]       = useState(null);

  // The vendor's own city is already known once the enquiry is tied to a
  // specific vendor, so City can default to that and become optional here —
  // matching QuickEnquiryModal's vendor.location?.city auto-fill behaviour.
  // The same fetch also feeds the left panel's mini vendor card below.
  useEffect(() => {
    if (!vendorId) return;
    api.get(`/public/vendors/${vendorId}`)
      .then(({ data }) => {
        const v = data.data?.vendor;
        setVendor(v || null);
        if (v?.location?.city) setCity(v.location.city);
      })
      .catch(() => {});
  }, [vendorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !phone.trim() || (!vendorId && !city.trim())) {
      setError('Please fill in all fields.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setError('Enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/send-otp', {
        name: name.trim(), email: email.trim(), phone: phone.trim(),
      });

      sessionStorage.setItem('intrafer_enquiry_draft', JSON.stringify({
        name: name.trim(), email: email.trim(), phone: phone.trim(),
        projectType, budget, city: city.trim(), requirements: requirements.trim(),
        vendorId,
      }));

      router.push(`/enquiry/verify?userId=${data.data.userId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    }
    setLoading(false);
  };

  const labelStyle = {
    fontSize: '10px', fontWeight: 600, letterSpacing: '.1em',
    textTransform: 'uppercase', color: 'var(--color-text-hint)',
    display: 'block', marginBottom: '5px',
  };

  const optionalLabelStyle = { ...labelStyle, display: 'flex', justifyContent: 'space-between' };
  const optionalBadgeStyle = {
    fontSize: '10px', color: 'var(--color-text-hint)', fontWeight: 400,
    letterSpacing: 'normal', textTransform: 'none',
  };

  const dividerStyle = {
    height: '1px', margin: '24px 0',
    background: `color-mix(in srgb, ${PANEL_FG} 16%, transparent)`,
  };

  return (
    <div style={{
      paddingTop: HEADER_HEIGHT, minHeight: `calc(100dvh - ${HEADER_HEIGHT})`,
      display: 'flex', flexDirection: 'column',
    }}>
      <div className="enquiry-split-card" style={{
        flex: 1, width: '100%',
        background: 'var(--color-surface)',
      }}>
        {/* ── LEFT PANEL ── */}
        <div style={{
          background: PANEL_BG, color: PANEL_FG,
          padding: 'clamp(28px, 4vw, 40px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {vendorId && (
                <Link href={`/vendors/${vendorId}`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  width: 'fit-content', fontSize: '12px',
                  color: `color-mix(in srgb, ${PANEL_FG} 70%, transparent)`,
                }}>
                  ← Back to designer
                </Link>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '8px', flexShrink: 0,
                  background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,.2)',
                }}>
                  <Image src="/images/logo/logo.png" alt="Intrafer" width={30} height={30} style={{ objectFit: 'contain' }} />
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: 700, letterSpacing: '.16em',
                  opacity: 0.6, color: PANEL_FG,
                }}>
                  INTRAFER
                </span>
              </div>
            </div>

            <div>
              {vendor ? (
                <div style={{ marginTop: '28px' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '50%',
                    background: `color-mix(in srgb, ${PANEL_FG} 14%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${PANEL_FG} 24%, transparent)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 500,
                    marginBottom: '14px', color: PANEL_FG,
                  }}>
                    {vendor.businessName?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 400,
                    margin: '0 0 6px', color: PANEL_FG,
                  }}>
                    {vendor.businessName}
                  </p>
                  {vendor.location?.city && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      opacity: 0.7, fontSize: '12px', marginBottom: '8px', color: PANEL_FG,
                    }}>
                      <MapPin size={12} /> {vendor.location.city}
                    </div>
                  )}
                  {vendor.rating > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '14px' }}>
                      <span style={{ color: PANEL_ACCENT, fontSize: '13px' }}>★</span>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: PANEL_FG }}>
                        {Number(vendor.rating).toFixed(1)}
                      </span>
                      {vendor.reviewCount > 0 && (
                        <span style={{ fontSize: '11px', opacity: 0.6, color: PANEL_FG }}>
                          ({vendor.reviewCount})
                        </span>
                      )}
                    </div>
                  )}
                  {vendor.specializations?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {vendor.specializations.slice(0, 2).map((s) => (
                        <span key={s} style={{
                          fontSize: '10px', padding: '3px 9px', borderRadius: '20px', color: PANEL_FG,
                          background: `color-mix(in srgb, ${PANEL_FG} 12%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${PANEL_FG} 20%, transparent)`,
                        }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p style={{
                  fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400,
                  lineHeight: 1.35, margin: '28px 0 0', color: PANEL_FG,
                }}>
                  Get matched with vetted interior designers
                </p>
              )}

              <div style={dividerStyle} />

              {/* Trust lines */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: PANEL_FG, opacity: 0.85 }}>
                  <Lock size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
                  No password needed
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: PANEL_FG, opacity: 0.85 }}>
                  <Clock size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
                  Designers typically reply within 48 hours
                </div>
                {vendor && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: PANEL_FG, opacity: 0.85 }}>
                    <BadgeCheck size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
                    Verified designer
                  </div>
                )}
              </div>
            </div>

            {/* 3-step mini timeline — border-top (not a standalone divider)
                so the space-between gap above it reads as one clean pause
                rather than a divider line floating in empty space. */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '14px',
              paddingTop: '20px',
              borderTop: `1px solid color-mix(in srgb, ${PANEL_FG} 16%, transparent)`,
            }}>
              {STEPS.map((step) => (
                <div key={step.n} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 600,
                    background: step.n === 1 ? PANEL_ACCENT : 'transparent',
                    color: step.n === 1 ? '#fff' : PANEL_FG,
                    border: step.n === 1 ? 'none' : `1px solid color-mix(in srgb, ${PANEL_FG} 30%, transparent)`,
                    opacity: step.n === 1 ? 1 : 0.6,
                  }}>
                    {step.n}
                  </div>
                  <span style={{
                    fontSize: '12px', color: PANEL_FG,
                    opacity: step.n === 1 ? 1 : 0.6,
                    fontWeight: step.n === 1 ? 500 : 400,
                  }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT PANEL — form, vertically centered and width-capped
              like the auth pages' right column, rather than stretching
              fields edge-to-edge across a much wider column ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'clamp(24px, 5vw, 48px)',
          }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>
              <p className="caps-label-primary" style={{ marginBottom: '6px' }}>SUBMIT ENQUIRY</p>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400,
                color: 'var(--color-text)', margin: '6px 0 6px',
              }}>
                Tell us about your project
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--color-text-hint)', margin: '0 0 28px' }}>
                We&apos;ll connect you with the designer. No password required — we&apos;ll verify your number with a quick code.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Personal details */}
                <div>
                  <p className="caps-label-primary" style={{ marginBottom: '12px' }}>YOUR DETAILS</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px' }}>
                    <Input label="Full name" placeholder="Your name" icon={User} value={name} onChange={(e) => setName(e.target.value)} />
                    <Input label="Phone" placeholder="10-digit mobile" icon={Phone} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="numeric" maxLength={10} />
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <Input label="Email" placeholder="your@email.com" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
                  </div>
                </div>

                {/* Project details */}
                <div>
                  <p className="caps-label-primary" style={{ marginBottom: '12px' }}>PROJECT DETAILS</p>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={optionalLabelStyle}>
                      <span>Project type</span>
                      <span style={optionalBadgeStyle}>Optional</span>
                    </label>
                    <select
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      className="form-select-styled"
                    >
                      <option value="">No preference</option>
                      {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={optionalLabelStyle}>
                        <span>Budget range</span>
                        <span style={optionalBadgeStyle}>Optional</span>
                      </label>
                      <select
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="form-select-styled"
                      >
                        <option value="">No preference</option>
                        {BUDGET_RANGES.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      {vendorId ? (
                        <label style={optionalLabelStyle}>
                          <span>City</span>
                          <span style={optionalBadgeStyle}>Optional</span>
                        </label>
                      ) : (
                        <label style={labelStyle}>City</label>
                      )}
                      <CitySelect value={city} onChange={(val) => setCity(val)} placeholder="e.g. Bangalore" />
                    </div>
                  </div>

                  <div>
                    <label style={optionalLabelStyle}>
                      <span>Requirements</span>
                      <span style={optionalBadgeStyle}>Optional</span>
                    </label>
                    <textarea
                      className="form-textarea-styled"
                      rows={4}
                      placeholder="Describe your requirements, timeline, special requests..."
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div style={{
                    background: 'var(--color-danger-bg)', color: 'var(--color-danger)',
                    fontSize: '13px', padding: '12px', borderRadius: 'var(--radius-md)',
                  }}>
                    {error}
                  </div>
                )}

                <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', minHeight: '52px' }}>
                  Continue — verify with OTP <ArrowRight size={16} />
                </Button>

                <p style={{ fontSize: '11px', color: 'var(--color-text-hint)', textAlign: 'center', margin: 0 }}>
                  By continuing you agree to receive OTP via SMS and email.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
}

export default function EnquiryPage() {
  return (
    <Suspense fallback={null}>
      <EnquiryForm />
    </Suspense>
  );
}
