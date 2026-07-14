'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Phone, Mail, MapPin } from 'lucide-react';
import api from '../../../lib/api';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const PROJECT_TYPES = [
  'Residential', 'Modular Kitchen', 'Living Room', 'Office Interiors',
  'Commercial', 'Bedroom', 'Bathroom', 'Full Home Interior',
];

const BUDGET_RANGES = [
  'Below ₹3 Lakhs', '₹3–5 Lakhs', '₹5–10 Lakhs', '₹10–15 Lakhs',
  '₹15–25 Lakhs', '₹25–50 Lakhs', 'Above ₹50 Lakhs',
];

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !phone.trim() || !city.trim()) {
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
    textTransform: 'uppercase', color: 'var(--text-hint)',
    display: 'block', marginBottom: '5px',
  };

  const optionalLabelStyle = { ...labelStyle, display: 'flex', justifyContent: 'space-between' };
  const optionalBadgeStyle = {
    fontSize: '10px', color: 'var(--text-hint)', fontWeight: 400,
    letterSpacing: 'normal', textTransform: 'none',
  };

  return (
    <div style={{ maxWidth: '560px', margin: 'clamp(80px,10vw,108px) auto 60px', padding: '0 clamp(16px,4vw,24px)' }}>
      {vendorId && (
        <Link href={`/vendors/${vendorId}`} className="back-link">
          ← Back to designer
        </Link>
      )}

      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-2xl)',
        padding: 'clamp(20px, 6vw, 40px)',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <p className="caps-label-primary" style={{ marginBottom: '6px' }}>SUBMIT ENQUIRY</p>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400,
          color: 'var(--text)', margin: '6px 0 6px',
        }}>
          Tell us about your project
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-hint)', margin: '0 0 28px' }}>
          We&apos;ll connect you with the designer. No account needed.
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
              <Input label="City" placeholder="e.g. Bangalore" icon={MapPin} value={city} onChange={(e) => setCity(e.target.value)} />
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
              background: 'var(--danger-bg)', color: 'var(--danger)',
              fontSize: '13px', padding: '12px', borderRadius: 'var(--r-md)',
            }}>
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', minHeight: '52px' }}>
            Continue — verify with OTP →
          </Button>

          <p style={{ fontSize: '11px', color: 'var(--text-hint)', textAlign: 'center', margin: 0 }}>
            By continuing you agree to receive OTP via SMS and email.
          </p>
        </form>
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
