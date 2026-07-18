'use client'
import { useState } from 'react';
import Link from 'next/link';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';
import V2Button from '@/components/v2/ui/Button';

const PLANS = [
  {
    name: '3 MONTHS', price: '₹7,999', note: 'Billed once', featured: false,
    features: ['Verified profile', 'Portfolio showcase', 'WhatsApp alerts', 'Analytics dashboard', 'Email support'],
  },
  {
    name: '6 MONTHS', price: '₹14,999', note: 'Billed once', featured: true, badge: 'MOST POPULAR',
    features: ['Verified profile', 'Portfolio showcase', 'WhatsApp alerts', 'Analytics dashboard', 'Email support', 'Priority listing', 'Phone support'],
  },
  {
    name: '12 MONTHS', price: '₹19,999', note: 'Billed once', featured: false,
    features: ['Verified profile', 'Portfolio showcase', 'WhatsApp alerts', 'Analytics dashboard', 'Email support', 'Priority listing', 'Phone support', 'Featured badge', 'Dedicated support'],
  },
];

const COMPARISON_ROWS = [
  { feature: 'Leads per month',     values: ['10', '10', '10'] },
  { feature: 'Profile listing',     values: [true, true, true] },
  { feature: 'Portfolio showcase',  values: [true, true, true] },
  { feature: 'WhatsApp alerts',     values: [true, true, true] },
  { feature: 'Analytics dashboard', values: [true, true, true] },
  { feature: 'Priority listing',    values: [false, true, true] },
  { feature: 'Phone support',       values: [false, true, true] },
  { feature: 'Featured badge',      values: [false, false, true] },
  { feature: 'Dedicated support',   values: [false, false, true] },
];

const FAQS = [
  { q: "What's included in the subscription?", a: 'All plans include up to 10 qualified leads per month, a verified profile listing, portfolio showcase, WhatsApp lead alerts, and access to the analytics dashboard.' },
  { q: 'Can I upgrade my plan mid-subscription?', a: 'Yes. You can upgrade at any time. Remaining days from your current plan are credited toward the new one.' },
  { q: 'Is there a refund policy?', a: "We offer a full refund within 7 days of subscribing if you haven't accepted any leads during that period." },
];

function Mark({ value }) {
  return value
    ? <span style={{ color: '#3B82F6', fontSize: '15px' }}>✓</span>
    : <span style={{ color: '#CBD5E1', fontSize: '15px' }}>✗</span>;
}

export default function PlansPageClient() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div style={{ fontFamily: 'var(--v2-font-ui)' }}>
      {/* Hero */}
      <section style={{ background: '#0F172A', padding: 'clamp(56px,8vw,88px) clamp(16px,4vw,36px) clamp(40px,5vw,56px)' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
          <RevealOnScroll direction="up">
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.12em', color: '#3B82F6', textTransform: 'uppercase', marginBottom: '16px' }}>
              Simple, transparent pricing
            </p>
            <h1 style={{
              fontFamily: 'var(--v2-font-display)', fontSize: 'clamp(30px,4.5vw,42px)',
              fontWeight: 500, color: '#F8F7F4', margin: '0 0 14px',
            }}>One subscription. No commissions.</h1>
            <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.7 }}>
              Pay once, receive leads all month. We never take a percentage of your projects. Not now, not ever.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Plan cards */}
      <section style={{ background: '#F8F7F4', padding: 'clamp(40px,6vw,64px) clamp(16px,4vw,36px) clamp(48px,7vw,72px)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden', marginBottom: '56px',
          }}>
            {PLANS.map((plan, i) => (
              <RevealOnScroll key={plan.name} direction="up" delay={i * 100}>
                <div style={{
                  background: plan.featured ? '#FFFFFF' : '#F8F7F4',
                  borderLeft: i === 0 ? 'none' : '1px solid #E2E8F0',
                  padding: '32px 28px', height: '100%', position: 'relative',
                }}>
                  {plan.badge && (
                    <span style={{
                      position: 'absolute', top: '16px', right: '16px',
                      fontSize: '10px', fontWeight: 700, letterSpacing: '.06em',
                      color: '#3B82F6', background: 'rgba(59,130,246,0.1)',
                      padding: '4px 10px', borderRadius: '20px',
                    }}>{plan.badge}</span>
                  )}
                  <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '.08em', color: '#64748B', marginBottom: '14px' }}>{plan.name}</div>
                  <div style={{ fontFamily: 'var(--v2-font-display)', fontSize: '36px', fontWeight: 500, color: '#0F172A', marginBottom: '4px' }}>{plan.price}</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '24px' }}>{plan.note}</div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#3B82F6', fontSize: '13px' }}>✓</span>
                        <span style={{ fontSize: '13px', color: '#334155' }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="/auth/register" style={{ display: 'block' }}>
                    <V2Button variant={plan.featured ? 'primary' : 'secondary'} size="md" fullWidth>Get started</V2Button>
                  </Link>
                </div>
              </RevealOnScroll>
            ))}
          </div>

          {/* Comparison table */}
          <RevealOnScroll direction="up">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Feature</th>
                    {PLANS.map(p => (
                      <th key={p.name} style={{ textAlign: 'center', padding: '12px 8px', fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>{p.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map(row => (
                    <tr key={row.feature} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '12px 8px', fontSize: '13px', color: '#334155' }}>{row.feature}</td>
                      {row.values.map((v, i) => (
                        <td key={i} style={{ textAlign: 'center', padding: '12px 8px' }}>
                          {typeof v === 'boolean' ? <Mark value={v} /> : <span style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>{v}</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: '#F8F7F4', padding: '0 clamp(16px,4vw,36px) clamp(48px,7vw,72px)' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <RevealOnScroll direction="up">
            <h2 style={{ fontFamily: 'var(--v2-font-display)', fontSize: '22px', fontWeight: 500, color: '#0F172A', margin: '0 0 20px', textAlign: 'center' }}>
              Common questions
            </h2>
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden' }}>
              {FAQS.map((faq, i) => {
                const open = openFaq === i;
                return (
                  <div key={faq.q} style={{ borderBottom: i < FAQS.length - 1 ? '1px solid #E2E8F0' : 'none', borderLeft: open ? '2px solid #3B82F6' : '2px solid transparent' }}>
                    <button
                      onClick={() => setOpenFaq(open ? -1 : i)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: '16px', padding: '16px 18px', background: 'transparent', border: 'none',
                        cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--v2-font-ui)',
                      }}
                    >
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>{faq.q}</span>
                      <span style={{ fontSize: '14px', color: '#94A3B8', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}>▾</span>
                    </button>
                    <div style={{ maxHeight: open ? '200px' : '0px', overflow: 'hidden', transition: 'max-height 300ms ease' }}>
                      <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.7, padding: '0 18px 16px', margin: 0 }}>{faq.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#0F172A', padding: 'clamp(56px,8vw,88px) clamp(16px,4vw,36px)', textAlign: 'center' }}>
        <RevealOnScroll direction="up">
          <h2 style={{ fontFamily: 'var(--v2-font-display)', fontSize: 'clamp(26px,4vw,38px)', fontWeight: 500, color: '#F8F7F4', margin: '0 0 12px' }}>
            Ready to start receiving leads?
          </h2>
          <p style={{ fontSize: '15px', color: '#94A3B8', marginBottom: '28px' }}>Join 480+ designers already on Intrafer.</p>
          <Link href="/auth/register">
            <V2Button variant="primary" size="lg">Get started →</V2Button>
          </Link>
        </RevealOnScroll>
      </section>
    </div>
  );
}
