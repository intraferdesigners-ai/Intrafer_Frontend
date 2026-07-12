'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { X, User, Phone, Mail } from 'lucide-react';

const PROJECT_TYPES = [
  'Residential', 'Modular Kitchen', 'Full Home Interior',
  'Living Room', 'Bedroom', 'Bathroom', 'Office Interiors', 'Other',
];

const BUDGET_RANGES = [
  'Below ₹3 Lakhs', '₹3–5 Lakhs', '₹5–10 Lakhs',
  '₹10–15 Lakhs', '₹15–25 Lakhs', '₹25–50 Lakhs', 'Above ₹50 Lakhs',
];

export default function QuickEnquiryModal({ vendor, isOpen, onClose }) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  const [name,         setName]         = useState('');
  const [email,        setEmail]        = useState('');
  const [phone,        setPhone]        = useState('');
  const [projectType,  setProjectType]  = useState('Residential');
  const [budget,       setBudget]       = useState('₹5–10 Lakhs');
  const [requirements, setRequirements] = useState('');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  /* Lock body scroll when open */
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError('');
    if (!name.trim())                          return setError('Please enter your name.');
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email.');
    if (!/^[6-9]\d{9}$/.test(phone))          return setError('Please enter a valid 10-digit mobile number.');
    if (!requirements.trim())                  return setError('Please briefly describe your project.');

    setLoading(true);
    try {
      const { data } = await api.post('/auth/send-otp', { name, email, phone });
      sessionStorage.setItem('intrafer_enquiry_draft', JSON.stringify({
        name, email, phone,
        vendorId:     vendor._id,
        projectType,
        budget,
        city:         vendor.location?.city || '',
        requirements,
      }));
      onClose();
      router.push(`/enquiry/verify?userId=${data.data.userId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const specs  = vendor.specializations || [];
  const imgSrc = vendor.portfolioImages?.[0];
  const city   = vendor.location?.city || '';

  const selectStyle = {
    width: '100%', padding: '12px',
    border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
    background: 'var(--surface)', color: 'var(--text)',
    fontSize: '16px', cursor: 'pointer',
    minHeight: '48px',
  };

  const formContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Vendor preview strip */}
      <div style={{
        background: 'var(--bg-parchment)', borderRadius: 'var(--r-md)',
        padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'center',
      }}>
        {imgSrc && (
          <div style={{ position: 'relative', width: 48, height: 48, borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
            <Image src={imgSrc} alt={vendor.businessName} fill style={{ objectFit: 'cover' }} sizes="48px" />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>{vendor.businessName}</div>
          {city && <div style={{ fontSize: '12px', color: 'var(--text-hint)', marginTop: '2px' }}>{city}</div>}
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '4px' }}>
            {specs.slice(0, 2).map(s => (
              <span key={s} style={{
                fontSize: '10px', background: 'var(--primary-bg)', color: 'var(--primary)',
                padding: '2px 7px', borderRadius: '10px', fontWeight: 500,
              }}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Name + Phone */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px' }}>
        <Input label="Your name" icon={User} value={name}
          onChange={e => setName(e.target.value)} placeholder="Full name" />
        <Input label="Phone" icon={Phone} value={phone}
          onChange={e => setPhone(e.target.value)} placeholder="10-digit number" />
      </div>

      <Input label="Email" icon={Mail} value={email}
        onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />

      {/* Project type + Budget */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-sub)', marginBottom: '6px' }}>
            Project type
          </label>
          <select value={projectType} onChange={e => setProjectType(e.target.value)} style={selectStyle}>
            {PROJECT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-sub)', marginBottom: '6px' }}>
            Budget range
          </label>
          <select value={budget} onChange={e => setBudget(e.target.value)} style={selectStyle}>
            {BUDGET_RANGES.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-sub)', marginBottom: '6px' }}>
          Requirements
        </label>
        <textarea
          value={requirements}
          onChange={e => setRequirements(e.target.value)}
          rows={3}
          placeholder="Briefly describe your project..."
          style={{
            width: '100%', padding: '12px',
            border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
            background: 'var(--surface)', color: 'var(--text)',
            fontSize: '16px', resize: 'vertical', boxSizing: 'border-box',
          }}
        />
      </div>

      {error && (
        <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)',
          fontSize: '13px', padding: '10px 12px', borderRadius: 'var(--r-md)' }}>
          {error}
        </div>
      )}

      <Button variant="primary" size="lg" loading={loading} onClick={handleSubmit}
        style={{ width: '100%', height: '52px' }}>
        Send enquiry →
      </Button>

      <p style={{ fontSize: '11px', color: 'var(--text-hint)', textAlign: 'center', margin: 0 }}>
        OTP verification required. No account needed.
      </p>
    </div>
  );

  /* ── MOBILE: bottom sheet ── */
  if (isMobile) {
    return (
      <>
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 199 }}
          onClick={onClose}
        />
        <div className="modal-sheet" style={{ zIndex: 200 }}>
          <div className="modal-sheet-handle" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 400, color: 'var(--text)' }}>
              Quick enquiry
            </div>
            <button onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer',
                padding: '4px', color: 'var(--text-hint)', width: '36px', height: '36px',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={20} />
            </button>
          </div>
          {formContent}
        </div>
      </>
    );
  }

  /* ── DESKTOP: centered modal ── */
  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,.65)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '80px 16px 24px', overflowY: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--surface)', borderRadius: '20px',
          padding: '28px', width: '100%', maxWidth: '520px',
          overflow: 'hidden', boxShadow: '0 20px 60px rgba(15,23,42,.25)',
          flexShrink: 0, marginBottom: '24px', position: 'relative' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, color: 'var(--text)' }}>
              Quick enquiry
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-hint)', marginTop: '2px' }}>
              {vendor.businessName}{city ? ` · ${city}` : ''}
            </div>
          </div>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              padding: '4px', color: 'var(--text-hint)', width: '36px', height: '36px',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={20} />
          </button>
        </div>
        {formContent}
      </div>
    </div>
  );
}
