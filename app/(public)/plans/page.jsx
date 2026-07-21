'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import api from '@/lib/api';
import { formatINR } from '@/lib/utils';


const FALLBACK_PLANS = [
  {
    name: '3 Month',
    displayName: '3 Months',
    price: 799900,
    period: '3 months',
    leadsPerMonth: 10,
    durationDays: 90,
    features: [
      'Upto 10 qualified leads per month',
      'Verified designer badge',
      'Portfolio showcase',
      'Email support',
    ],
  },
  {
    name: '6 Month',
    displayName: '6 Months',
    price: 1499900,
    period: '6 months',
    leadsPerMonth: 10,
    durationDays: 180,
    popular: true,
    features: [
      'Upto 10 qualified leads per month',
      'Priority placement in search',
      'Portfolio showcase',
      'Advanced analytics dashboard',
      'Priority email + WhatsApp support',
      'Lead quality guarantee',
    ],
  },
  {
    name: '12 Month',
    displayName: '12 Months',
    price: 1999900,
    period: '12 months',
    leadsPerMonth: 10,
    durationDays: 365,
    features: [
      'Upto 10 qualified leads per month',
      'Top featured placement',
      'Portfolio showcase',
      'Full analytics + export',
      'Dedicated account manager',
      'Lead quality guarantee',
      'Best value — 12 month billing',
    ],
  },
];

const FAQS = [
  {
    q: 'Can I cancel my subscription anytime?',
    a: "You can stop renewing at any time from your dashboard. Plans are prepaid for their full 3, 6, or 12-month term and are non-refundable, but your listing stays live for the term you've already paid for.",
  },
  {
    q: 'What counts as a "lead"?',
    a: 'A lead is a verified homeowner enquiry assigned to your studio. Each lead includes the homeowner\'s name, project details, and contact information (revealed after you accept). Spam or duplicate enquiries are not counted.',
  },
  {
    q: 'Do unused leads roll over?',
    a: 'Unused leads do not roll over to the next month. We recommend upgrading to a higher plan if you consistently reach your monthly limit.',
  },
  {
    q: 'Is there a free trial?',
    a: 'We don\'t offer a free trial, but the 3 Month plan at ₹7,999 is a low-risk way to evaluate the platform. Most designers recoup this within their first accepted project.',
  },
  {
    q: 'How do I get paid — do you take a commission?',
    a: 'Intrafer charges a flat subscription fee only. We take zero commission on your projects. All revenue from your clients goes directly to you.',
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: 'var(--r-xl)',
      overflow: 'hidden', marginBottom: '8px', background: 'var(--surface)',
    }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '18px 20px',
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '14px', fontWeight: 500, color: 'var(--text)',
          textAlign: 'left',
        }}
      >
        {q}
        {open ? <ChevronUp size={16} color="var(--text-hint)" /> : <ChevronDown size={16} color="var(--text-hint)" />}
      </button>
      {open && (
        <div style={{
          padding: '0 20px 18px',
          fontSize: '14px', color: 'var(--text-mid)', lineHeight: 1.75,
          borderTop: '1px solid var(--border)',
          paddingTop: '14px',
        }}>
          {a}
        </div>
      )}
    </div>
  );
}

export default function PlansPage() {
  const [plans, setPlans] = useState(FALLBACK_PLANS);

  useEffect(() => {
    api.get('/subscriptions/plans')
      .then(({ data }) => {
        const apiPlans = data.data?.plans || data.plans;
        if (Array.isArray(apiPlans) && apiPlans.length > 0) {
          setPlans(apiPlans.map((p, i) => ({ ...FALLBACK_PLANS[i], ...p })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Header */}
      <section style={{ background: 'var(--bg-parchment)', padding: '108px 40px 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p className="caps-label-primary" style={{ marginBottom: '10px' }}>PRICING</p>
          <h1 className="section-heading" style={{ marginBottom: '14px' }}>
            Simple, transparent pricing
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-mid)', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto' }}>
            Pay a flat subscription. Receive qualified leads. Zero commission on your projects — ever.
          </p>
        </div>
      </section>

      {/* Plan cards */}
      <section style={{ padding: '60px 40px 80px' }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px',
        }} className="grid-mobile-1">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={plan.popular ? 'plan-card-popular' : undefined}
              style={{
                background: 'var(--surface)',
                border: plan.popular ? '2px solid var(--primary)' : '1px solid var(--border)',
                borderRadius: 'var(--r-xl)', padding: '28px',
                boxShadow: plan.popular ? '0 4px 24px rgba(59,130,246,.15)' : 'var(--shadow-sm)',
                position: 'relative',
              }}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--primary)', color: '#fff',
                  fontSize: '10px', fontWeight: 600, letterSpacing: '.1em',
                  padding: '4px 12px', borderRadius: '20px', whiteSpace: 'nowrap',
                }}>
                  MOST POPULAR
                </div>
              )}

              <p className="caps-label-primary" style={{ marginBottom: '8px' }}>{(plan.displayName || plan.name).toUpperCase()}</p>

              <div style={{ marginBottom: '6px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 400, color: 'var(--text)' }}>
                  {formatINR(plan.price || 0)}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-hint)', marginLeft: '4px' }}>
                  for {plan.period}
                </span>
              </div>

              <div style={{
                display: 'inline-block', marginBottom: '20px',
                background: 'var(--primary-bg)', color: 'var(--primary)',
                fontSize: '11px', fontWeight: 600, padding: '4px 10px',
                borderRadius: '20px', letterSpacing: '.04em',
              }}>
                Upto {plan.leadsPerMonth} leads / month
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginBottom: '24px' }}>
                {(plan.features || []).map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                    <Check size={15} color="var(--success)" style={{ flexShrink: 0, marginTop: '1px' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-sub)', lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>

              <Link href="/auth/register" style={{ display: 'block' }}>
                <button style={{
                  width: '100%', padding: '13px',
                  background: plan.popular ? 'var(--primary)' : 'var(--surface)',
                  color: plan.popular ? '#fff' : 'var(--text)',
                  border: plan.popular ? 'none' : '1.5px solid var(--border-emp)',
                  borderRadius: 'var(--r-md)', fontSize: '14px', fontWeight: 500,
                  cursor: 'pointer', transition: 'all 150ms ease-out',
                  boxShadow: plan.popular ? '0 4px 14px rgba(181,84,30,.3)' : 'none',
                }}>
                  Get started →
                </button>
              </Link>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '13px', color: 'var(--text-hint)' }}>
          All prices exclusive of GST · Payments secured by Razorpay
        </p>
      </section>

      <div className="divider" />

      {/* FAQ */}
      <section style={{ padding: '80px 40px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <p className="caps-label-primary" style={{ textAlign: 'center', marginBottom: '10px' }}>FAQ</p>
          <h2 className="section-heading" style={{ textAlign: 'center', marginBottom: '40px' }}>
            Frequently asked questions
          </h2>
          {FAQS.map((faq) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--bg)', padding: '40px 40px 80px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="cta-always-dark" style={{
            borderRadius: 'var(--r-2xl)',
            padding: '60px', textAlign: 'center',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 400,
              color: '#FAFAF8', letterSpacing: '-.02em', marginBottom: '14px',
            }}>
              Ready to grow your studio?
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,.5)', marginBottom: '28px' }}>
              Join 500+ verified designers on Intrafer.
            </p>
            <Link href="/auth/register">
              <button style={{
                background: 'var(--primary)', color: '#fff',
                padding: '14px 36px', borderRadius: 'var(--r-md)',
                fontSize: '14px', fontWeight: 500, border: 'none',
                cursor: 'pointer', boxShadow: '0 4px 14px rgba(181,84,30,.4)',
              }}>
                List your studio free
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
