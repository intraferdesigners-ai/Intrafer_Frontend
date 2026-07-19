'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, User, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const CONTACT_INFO = [
  { Icon: Mail,           label: 'Email',    value: 'support@intrafer.in' },
  { Icon: Phone,          label: 'Phone',    value: '+91 80 4567 8900 (Mon–Sat, 9am–6pm)' },
  { Icon: MessageCircle,  label: 'WhatsApp', value: '+91 98765 00000' },
  { Icon: MapPin,         label: 'Office',   value: '123 Koramangala, Bangalore 560034' },
];

const SUBJECTS = ['General enquiry', 'Find a designer', 'List my studio', 'Report an issue', 'Partnership'];

export default function ContactPage() {
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [phone,   setPhone]   = useState('');
  const [subject, setSubject] = useState('General enquiry');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/public/support-tickets', { name, email, phone, subject, message });
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message. Please try again.');
    }
    setLoading(false);
  };

  const labelStyle = {
    fontSize: '10px', fontWeight: 600, letterSpacing: '.1em',
    textTransform: 'uppercase', color: 'var(--text-hint)',
    display: 'block', marginBottom: '5px',
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '108px 40px 80px' }}>

      {/* Header */}
      <p className="caps-label-primary" style={{ marginBottom: '8px' }}>GET IN TOUCH</p>
      <h1 className="page-heading" style={{ marginBottom: '40px' }}>We&apos;d love to hear from you</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }} className="grid-mobile-1">

        {/* Left — Contact info */}
        <div>
          <p style={{ fontSize: '14px', color: 'var(--text-mid)', lineHeight: 1.75, marginBottom: '32px' }}>
            Whether you have a question about our platform, need help finding a designer, or want to list your studio — we&apos;re here to help.
          </p>

          {CONTACT_INFO.map(({ Icon, label, value }) => (
            <div key={label} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)', padding: '16px',
              marginBottom: '12px', display: 'flex', gap: '14px', alignItems: 'center',
            }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                background: 'var(--primary-bg)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={16} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', color: 'var(--text-hint)', textTransform: 'uppercase', marginBottom: '2px' }}>{label}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-sub)' }}>{value}</div>
              </div>
            </div>
          ))}

          <a
            href="https://wa.me/919876500000"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              width: '100%', marginTop: '20px', padding: '13px',
              background: '#25D366', color: '#fff', borderRadius: 'var(--r-md)',
              fontSize: '14px', fontWeight: 500, textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(37,211,102,.3)',
            }}
          >
            <MessageCircle size={16} />
            Chat on WhatsApp
          </a>

          <div className="caps-label" style={{ marginTop: '24px', marginBottom: '8px' }}>
            FIND US
          </div>
          <div style={{
            width: '100%',
            height: '320px',
            borderRadius: 'var(--r-xl)',
            overflow: 'hidden',
            border: '1px solid var(--border)',
          }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0!2d77.5946!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzE3LjgiTiA3N8KwMzUnNDAuNiJF!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Intrafer Office Location"
            />
          </div>
        </div>

        {/* Right — Form */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-2xl)', padding: '32px',
          boxShadow: 'var(--shadow-md)',
        }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <CheckCircle size={48} color="var(--success)" style={{ marginBottom: '16px' }} />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 400, color: 'var(--text)', marginBottom: '8px' }}>
                Message sent!
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-hint)' }}>
                We&apos;ll get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Input label="Full name"    icon={User}  value={name}  onChange={(e) => setName(e.target.value)}  placeholder="Your name"  required />
                <Input label="Phone"        icon={Phone} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile"     type="tel" />
              </div>
              <Input label="Email address" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" required />

              <div>
                <label style={labelStyle}>Subject</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)} className="form-select-styled">
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Message</label>
                <textarea
                  className="form-textarea-styled"
                  rows={5}
                  placeholder="How can we help you?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', marginTop: '4px' }}>
                Send message →
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
