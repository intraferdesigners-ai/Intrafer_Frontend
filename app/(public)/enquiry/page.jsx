'use client'
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/api';
import CitySelect from '@/components/ui/CitySelect';
import V2FormField from '@/components/v2/ui/FormField';
import V2Input from '@/components/v2/ui/Input';

// Exact value strings V1's /leads endpoint expects — kept identical for API parity,
// not the illustrative buckets from the design brief.
const PROJECT_TYPES = [
  'Residential', 'Modular Kitchen', 'Living Room', 'Office Interiors',
  'Commercial', 'Bedroom', 'Bathroom', 'Full Home Interior',
];
const BUDGET_RANGES = [
  'Below ₹3 Lakhs', '₹3–5 Lakhs', '₹5–10 Lakhs', '₹10–15 Lakhs',
  '₹15–25 Lakhs', '₹25–50 Lakhs', 'Above ₹50 Lakhs',
];

const selectStyle = {
  width: '100%', height: '48px', padding: '0 14px',
  background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '10px',
  fontSize: '14px', color: '#0F172A', fontFamily: 'var(--v2-font-ui)',
  outline: 'none', appearance: 'none', cursor: 'pointer', boxSizing: 'border-box',
};

const TIMELINE = [
  'Fill your requirements (2 mins)',
  'Verify with OTP (30 seconds)',
  'Designer responds within 48 hours',
  'Get your free proposal',
];

function VendorPreview({ vendor }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '14px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'center',
      marginBottom: '28px',
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden',
        background: '#3B82F6', flexShrink: 0, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {vendor.portfolioImages?.[0] ? (
          <Image src={vendor.portfolioImages[0]} alt={vendor.businessName} fill style={{ objectFit: 'cover' }} sizes="48px" />
        ) : (
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#F8F7F4' }}>{vendor.businessName?.charAt(0) || 'I'}</span>
        )}
      </div>
      <div>
        <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 3px' }}>You're enquiring with</p>
        <p style={{ fontSize: '14px', fontWeight: 600, color: '#F8F7F4', margin: 0 }}>{vendor.businessName}</p>
        <p style={{ fontSize: '12px', color: '#94A3B8', margin: '2px 0 0' }}>
          {vendor.rating > 0 && <><span style={{ color: '#3B82F6' }}>★</span> {Number(vendor.rating).toFixed(1)} · </>}
          {vendor.location?.city}
        </p>
      </div>
    </div>
  );
}

function EnquiryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vendorId = searchParams.get('vendorId');

  const [vendor, setVendor] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [projectType, setProjectType] = useState('');
  const [budget, setBudget] = useState('');
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!vendorId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/vendors/${vendorId}`)
      .then(r => r.json())
      .then(d => setVendor(d.data?.vendor || null))
      .catch(() => {});
  }, [vendorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !phone.trim() || !city.trim()) {
      setError('Please fill in all required fields.');
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

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', minHeight: 'calc(100vh - 60px)', fontFamily: 'var(--v2-font-ui)' }}>
      {/* Left — info */}
      <div style={{ flex: '2 1 380px', background: '#0F172A', padding: '48px' }}>
        <div style={{ maxWidth: '400px' }}>
          <h1 style={{
            fontFamily: 'var(--v2-font-display)', fontSize: 'clamp(26px,3.4vw,34px)',
            fontWeight: 500, color: '#F8F7F4', margin: '0 0 8px',
          }}>Submit an enquiry</h1>
          <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '32px' }}>
            Free. Takes 2 minutes. No account needed.
          </p>

          {vendor && <VendorPreview vendor={vendor} />}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '32px' }}>
            {TIMELINE.map((step, i) => (
              <div key={step} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700, color: '#3B82F6', flexShrink: 0,
                }}>{i + 1}</div>
                <span style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.5 }}>{step}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: '#94A3B8' }}>🔒 Your contact stays private</span>
            <span style={{ fontSize: '13px', color: '#94A3B8' }}>✓ Verified designers only</span>
            <span style={{ fontSize: '13px', color: '#94A3B8' }}>★ 4.9 average satisfaction</span>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div style={{ flex: '3 1 480px', background: '#F8F7F4', padding: '48px' }}>
        <div style={{ maxWidth: '520px' }}>
          <form onSubmit={handleSubmit}>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.1em', color: '#3B82F6', textTransform: 'uppercase', marginBottom: '16px' }}>
              Step 1 — Your details
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,220px), 1fr))', gap: '4px 16px' }}>
              <V2FormField label="Your name" required>
                <V2Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required />
              </V2FormField>
              <V2FormField label="Phone number" required>
                <V2Input type="tel" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" required />
              </V2FormField>
            </div>
            <V2FormField label="Email address" required>
              <V2Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
            </V2FormField>
            <V2FormField label="Your city" required>
              <CitySelect value={city} onChange={setCity} placeholder="Search city..." />
            </V2FormField>

            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.1em', color: '#3B82F6', textTransform: 'uppercase', margin: '24px 0 16px' }}>
              Step 2 — Project details (optional)
            </p>
            <V2FormField label="Project type">
              <select value={projectType} onChange={(e) => setProjectType(e.target.value)} style={selectStyle}>
                <option value="">No preference</option>
                {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </V2FormField>
            <V2FormField label="Budget range">
              <select value={budget} onChange={(e) => setBudget(e.target.value)} style={selectStyle}>
                <option value="">No preference</option>
                {BUDGET_RANGES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </V2FormField>
            <V2FormField label="Requirements">
              <textarea
                rows={4}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Tell us about your project..."
                style={{
                  width: '100%', padding: '12px 14px', fontSize: '14px',
                  background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '10px',
                  color: '#0F172A', fontFamily: 'var(--v2-font-ui)', outline: 'none',
                  resize: 'vertical', boxSizing: 'border-box',
                }}
              />
            </V2FormField>

            {error && (
              <div style={{ background: '#FEE2E2', color: '#DC2626', fontSize: '13px', padding: '12px 14px', borderRadius: '10px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', height: '52px', borderRadius: '10px',
                background: '#3B82F6', color: '#FFFFFF', border: 'none',
                fontSize: '15px', fontWeight: 600, cursor: loading ? 'default' : 'pointer',
                fontFamily: 'var(--v2-font-ui)', opacity: loading ? 0.7 : 1, marginTop: '8px',
              }}
            >
              {loading ? 'Sending…' : 'Send enquiry →'}
            </button>
            <p style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center', marginTop: '12px' }}>
              OTP verification required · No account needed · Free
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function EnquiryPage() {
  useEffect(() => { document.title = 'Submit an Enquiry | Intrafer'; }, []);
  return (
    <Suspense fallback={null}>
      <EnquiryForm />
    </Suspense>
  );
}
