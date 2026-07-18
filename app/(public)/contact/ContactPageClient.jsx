'use client'
import { useState } from 'react';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';
import V2FormField from '@/components/v2/ui/FormField';
import V2Input from '@/components/v2/ui/Input';

export default function ContactPageClient() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [audience, setAudience] = useState('Homeowner');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSuccess(true);
  };

  return (
    <div style={{ fontFamily: 'var(--v2-font-ui)' }}>
      {/* Hero */}
      <section style={{ background: '#0F172A', padding: '48px clamp(16px,4vw,36px) 40px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <RevealOnScroll direction="up">
            <h1 style={{
              fontFamily: 'var(--v2-font-display)', fontSize: 'clamp(28px,4.5vw,42px)',
              fontWeight: 500, color: '#F8F7F4', margin: '0 0 10px',
            }}>Get in touch</h1>
            <p style={{ fontSize: '15px', color: '#64748B' }}>
              We're a small team and we actually read every message.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Two column */}
      <section style={{ background: '#F8F7F4', padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,36px)' }}>
        <div style={{
          maxWidth: '1140px', margin: '0 auto',
          display: 'flex', gap: 'clamp(24px,5vw,56px)', flexWrap: 'wrap',
        }}>
          {/* Left — contact info */}
          <div style={{ flex: '1 1 380px' }}>
            <RevealOnScroll direction="up">
              <h2 style={{
                fontFamily: 'var(--v2-font-display)', fontSize: '24px', fontWeight: 500,
                color: '#0F172A', margin: '0 0 28px',
              }}>Talk to us</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '28px' }}>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.08em', color: '#3B82F6', textTransform: 'uppercase', marginBottom: '6px' }}>Email us</p>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', margin: '0 0 4px' }}>support@intrafer.in</p>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>We respond within 4 hours on weekdays.</p>
                </div>

                <div>
                  <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.08em', color: '#3B82F6', textTransform: 'uppercase', marginBottom: '6px' }}>For designers</p>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 4px' }}>Questions about listing your studio?</p>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', margin: 0 }}>designers@intrafer.in</p>
                </div>

                <div>
                  <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.08em', color: '#3B82F6', textTransform: 'uppercase', marginBottom: '6px' }}>WhatsApp</p>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', margin: '0 0 4px' }}>+91 98765 00000</p>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Mon–Sat, 9am–6pm IST</p>
                </div>

                <div>
                  <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.08em', color: '#3B82F6', textTransform: 'uppercase', marginBottom: '6px' }}>Office</p>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.7 }}>
                    We're a remote-first team based across Bangalore, Mumbai, and Delhi.
                  </p>
                </div>
              </div>

              <div style={{ width: '100%', height: '260px', borderRadius: '14px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0!2d77.5946!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzE3LjgiTiA3N8KwMzUnNDAuNiJF!5e0!3m2!1sen!2sin!4v1234567890"
                  width="100%" height="100%" style={{ border: 0 }}
                  allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Intrafer Office Location"
                />
              </div>
            </RevealOnScroll>
          </div>

          {/* Right — form */}
          <div style={{ flex: '1 1 380px' }}>
            <RevealOnScroll direction="up" delay={100}>
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '28px' }}>
                {success ? (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '50%',
                      background: '#DCFCE7', border: '2px solid #16A34A',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 20px',
                    }}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A', margin: '0 0 8px' }}>Message sent!</h3>
                    <p style={{ fontSize: '13px', color: '#64748B' }}>We'll get back to you within 4 hours on weekdays.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <V2FormField label="Your name" required>
                      <V2Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required />
                    </V2FormField>
                    <V2FormField label="Email address" required>
                      <V2Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                    </V2FormField>

                    <V2FormField label="I am a">
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {['Homeowner', 'Designer', 'Press/Other'].map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setAudience(opt)}
                            style={{
                              flex: 1, padding: '9px 8px', fontSize: '12px', fontWeight: 500,
                              cursor: 'pointer', textAlign: 'center', borderRadius: '8px',
                              fontFamily: 'var(--v2-font-ui)', transition: 'all 150ms',
                              background: audience === opt ? '#3B82F6' : 'transparent',
                              color: audience === opt ? '#FFFFFF' : '#64748B',
                              border: audience === opt ? '1.5px solid #3B82F6' : '1.5px solid #CBD5E1',
                            }}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </V2FormField>

                    <V2FormField label="Message" required>
                      <textarea
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        style={{
                          width: '100%', minHeight: '120px', padding: '12px 14px', fontSize: '14px',
                          background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '10px',
                          color: '#0F172A', fontFamily: 'var(--v2-font-ui)', outline: 'none',
                          resize: 'vertical', boxSizing: 'border-box',
                        }}
                      />
                    </V2FormField>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: '100%', height: '48px', borderRadius: '10px',
                        background: '#3B82F6', color: '#FFFFFF', border: 'none',
                        fontSize: '14px', fontWeight: 600, cursor: loading ? 'default' : 'pointer',
                        fontFamily: 'var(--v2-font-ui)', opacity: loading ? 0.7 : 1,
                      }}
                    >
                      {loading ? 'Sending…' : 'Send message →'}
                    </button>

                    <p style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center', marginTop: '14px' }}>
                      We don't share your details with third parties. Read our{' '}
                      <a href="/privacy" style={{ color: '#3B82F6' }}>privacy policy</a>.
                    </p>
                  </form>
                )}
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </div>
  );
}
