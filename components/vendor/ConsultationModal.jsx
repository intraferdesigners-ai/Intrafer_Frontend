'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { X, User, Phone, Mail } from 'lucide-react';

// Unlike QuickEnquiryModal (which is opened/closed by its VendorCard parent,
// a client component), this is mounted directly from the vendor profile page
// — an async Server Component that can't hold isOpen state itself — so this
// component owns its own open/close state and renders both the trigger
// button and the modal.
export default function ConsultationModal({ vendor }) {
  const router = useRouter();
  const [isOpen,   setIsOpen]   = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [name,          setName]          = useState('');
  const [email,         setEmail]         = useState('');
  const [phone,         setPhone]         = useState('');
  const [selectedDate,  setSelectedDate]  = useState('');
  const [preferredDate, setPreferredDate] = useState(''); // ISO datetime of the selected slot
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading,  setSlotsLoading]  = useState(false);
  const [slotsReason,   setSlotsReason]   = useState('');
  const [note,          setNote]          = useState('');
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');

  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      setSlotsReason('');
      setPreferredDate('');
      return;
    }
    setSlotsLoading(true);
    setPreferredDate('');
    setSlotsReason('');
    api.get(`/public/vendors/${vendor._id}/available-slots`, { params: { date: selectedDate } })
      .then(({ data }) => {
        const d = data.data || {};
        setAvailableSlots(d.slots || []);
        setSlotsReason(d.reason || '');
      })
      .catch(() => {
        setAvailableSlots([]);
        setSlotsReason('Could not load availability. Please try another date.');
      })
      .finally(() => setSlotsLoading(false));
  }, [selectedDate, vendor._id]);

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

  const onClose = () => setIsOpen(false);

  const handleSubmit = async () => {
    setError('');
    if (!name.trim())                          return setError('Please enter your name.');
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email.');
    if (!/^[6-9]\d{9}$/.test(phone))          return setError('Please enter a valid 10-digit mobile number.');

    setLoading(true);
    try {
      const { data } = await api.post('/auth/send-otp', { name, email, phone });
      sessionStorage.setItem('intrafer_consultation_draft', JSON.stringify({
        name, email, phone,
        vendorId:     vendor._id,
        city:         vendor.location?.city || '',
        requirements: note,
        isConsultation: true,
        preferredDate,
      }));
      onClose();
      router.push(`/enquiry/verify?userId=${data.data.userId}&type=consultation`);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const specs  = vendor.specializations || [];
  const imgSrc = vendor.portfolioImages?.[0];
  const city   = vendor.location?.city || '';

  const fieldLabelStyle = {
    display: 'flex', justifyContent: 'space-between',
    fontSize: '12px', fontWeight: 500, color: 'var(--text-sub)', marginBottom: '6px',
  };
  const optionalBadgeStyle = {
    fontSize: '10px', color: 'var(--text-hint)', fontWeight: 400,
    letterSpacing: 'normal', textTransform: 'none',
  };
  const dateInputStyle = {
    width: '100%', padding: '12px',
    border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
    background: 'var(--surface)', color: 'var(--text)',
    fontSize: '16px', boxSizing: 'border-box',
  };
  const slotPillStyle = (slot) => {
    const active = slot === preferredDate;
    return {
      padding: '8px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
      cursor: 'pointer', letterSpacing: '0.01em',
      transition: 'all 150ms ease-out',
      ...(active
        ? { background: 'var(--primary-bg)', color: 'var(--primary)', border: '1.5px solid var(--primary)' }
        : { background: 'var(--bg-parchment)', color: 'var(--text-sub)', border: '1px solid var(--border)' }
      ),
    };
  };
  const formatSlotTime = (iso) =>
    new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });

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

      <div>
        <label style={fieldLabelStyle}>
          <span>Preferred date</span>
          <span style={optionalBadgeStyle}>Optional</span>
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          style={dateInputStyle}
        />
        {selectedDate && (
          <div style={{ marginTop: 10 }}>
            {slotsLoading ? (
              <div style={{ fontSize: '12px', color: 'var(--text-hint)' }}>Loading available times…</div>
            ) : availableSlots.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    style={slotPillStyle(slot)}
                    onClick={() => setPreferredDate(slot)}
                  >
                    {formatSlotTime(slot)}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: 'var(--text-hint)' }}>
                {slotsReason || 'No slots available this day — try another date.'}
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <label style={fieldLabelStyle}>
          <span>Note</span>
          <span style={optionalBadgeStyle}>Optional</span>
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
          placeholder="Anything you'd like the designer to know before your consultation..."
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
        Request consultation →
      </Button>

      <p style={{ fontSize: '11px', color: 'var(--text-hint)', textAlign: 'center', margin: 0 }}>
        OTP verification required. No account needed.
      </p>
    </div>
  );

  return (
    <>
      <Button variant="outline" size="lg" style={{ width: '100%', marginTop: '10px' }} onClick={() => setIsOpen(true)}>
        Request a consultation
      </Button>

      {isOpen && (isMobile ? (
        <>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 199 }}
            onClick={onClose}
          />
          <div className="modal-sheet" style={{ zIndex: 200 }}>
            <div className="modal-sheet-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 400, color: 'var(--text)' }}>
                Request a consultation
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
      ) : (
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
                  Request a consultation
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
      ))}
    </>
  );
}
