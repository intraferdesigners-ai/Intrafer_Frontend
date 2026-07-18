'use client'
import { useState } from 'react';
import Link from 'next/link';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';

const CATEGORIES = [
  {
    id: 'homeowners',
    label: 'For homeowners',
    faqs: [
      { q: 'Is Intrafer free for homeowners?', a: 'Completely free. You can browse every designer profile, view portfolios, and submit enquiries without paying anything. We charge designers a subscription fee — not homeowners.' },
      { q: 'How do designers find out about my project?', a: "When you submit an enquiry, designers in your city who match your brief can view your project details — but not your contact information. Only after a designer actively accepts your lead do they get access to your phone number and email." },
      { q: 'How long does it take to hear back from a designer?', a: "Designers on Intrafer commit to responding within 48 hours of accepting a lead. If they don't respond in time, the lead is reassigned automatically." },
      { q: 'Can I contact multiple designers?', a: 'Yes. We recommend enquiring with 2–3 designers so you can compare proposals and find the right fit.' },
      { q: 'Are the portfolio images real projects?', a: "Every portfolio image on Intrafer is verified by our team to be from a project the designer actually completed. We don't allow stock photos or images borrowed from other designers." },
    ],
  },
  {
    id: 'designers',
    label: 'For designers',
    faqs: [
      { q: 'How does lead assignment work?', a: 'Leads are matched to designers based on city and specialisation. You receive a WhatsApp alert and can review the brief before deciding to accept.' },
      { q: "What happens if I don't accept a lead?", a: "Leads expire after 48 hours. Expired leads don't use your monthly credit — they're simply reassigned to another designer in your city." },
      { q: 'Do you take commission on projects?', a: 'Never. Intrafer charges only the subscription fee. We take zero percentage of any project you win.' },
    ],
  },
  {
    id: 'pricing',
    label: 'Pricing',
    faqs: [
      { q: "What's included in the subscription?", a: 'All plans include up to 10 qualified leads per month, a verified profile listing, portfolio showcase, WhatsApp lead alerts, and access to the analytics dashboard.' },
      { q: 'Can I upgrade my plan mid-subscription?', a: 'Yes. You can upgrade at any time. Remaining days from your current plan are credited toward the new one.' },
      { q: 'Is there a refund policy?', a: "We offer a full refund within 7 days of subscribing if you haven't accepted any leads during that period." },
    ],
  },
];

function FAQItem({ faq, open, onToggle }) {
  return (
    <div style={{
      borderBottom: '1px solid #E2E8F0',
      borderLeft: open ? '2px solid #3B82F6' : '2px solid transparent',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '16px', padding: '18px 16px 18px 18px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          textAlign: 'left', fontFamily: 'var(--v2-font-ui)',
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>{faq.q}</span>
        <span style={{
          fontSize: '14px', color: '#94A3B8', flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms',
        }}>▾</span>
      </button>
      <div style={{ maxHeight: open ? '260px' : '0px', overflow: 'hidden', transition: 'max-height 300ms ease' }}>
        <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.75, padding: '0 16px 18px 18px', margin: 0 }}>{faq.a}</p>
      </div>
    </div>
  );
}

export default function FaqPageClient() {
  const [openId, setOpenId] = useState('homeowners-0');

  return (
    <div style={{ fontFamily: 'var(--v2-font-ui)' }}>
      {/* Hero */}
      <section style={{ background: '#0F172A', padding: '48px clamp(16px,4vw,36px) 40px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <RevealOnScroll direction="up">
            <h1 style={{ fontFamily: 'var(--v2-font-display)', fontSize: 'clamp(28px,4.5vw,42px)', fontWeight: 500, color: '#F8F7F4', margin: '0 0 10px' }}>
              Frequently asked questions
            </h1>
            <p style={{ fontSize: '15px', color: '#64748B' }}>Everything homeowners and designers ask us.</p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Two column */}
      <section style={{ background: '#F8F7F4', padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,36px)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'flex', gap: 'clamp(24px,5vw,56px)', flexWrap: 'wrap' }}>
          {/* Left — category nav */}
          <div style={{ flex: '0 1 220px' }}>
            <div style={{ position: 'sticky', top: '96px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {CATEGORIES.map(cat => (
                <a key={cat.id} href={`#${cat.id}`} style={{
                  padding: '9px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                  color: '#334155', textDecoration: 'none',
                }}>
                  {cat.label}
                </a>
              ))}
              <Link href="/about" style={{
                padding: '9px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                color: '#334155', textDecoration: 'none',
              }}>
                About Intrafer
              </Link>
            </div>
          </div>

          {/* Right — accordions */}
          <div style={{ flex: '1 1 480px', minWidth: 0 }}>
            {CATEGORIES.map((cat, ci) => (
              <RevealOnScroll key={cat.id} direction="up" delay={ci * 100}>
                <div id={cat.id} style={{ marginBottom: '40px', scrollMarginTop: '96px' }}>
                  <h2 style={{
                    fontFamily: 'var(--v2-font-display)', fontSize: '22px', fontWeight: 500,
                    color: '#0F172A', margin: '0 0 16px',
                  }}>{cat.label}</h2>
                  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden' }}>
                    {cat.faqs.map((faq, i) => {
                      const id = `${cat.id}-${i}`;
                      return (
                        <FAQItem
                          key={id}
                          faq={faq}
                          open={openId === id}
                          onToggle={() => setOpenId(openId === id ? null : id)}
                        />
                      );
                    })}
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
