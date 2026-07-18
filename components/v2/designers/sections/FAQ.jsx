'use client'
import { useState } from 'react';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';
import V2SectionHeader from '@/components/v2/ui/SectionHeader';

const FAQS = [
  {
    q: 'How are leads assigned to me?',
    a: 'Leads are matched based on your city and specialisations. You receive an alert and can review the brief before accepting. You are never forced to take a lead.',
  },
  {
    q: "What happens if I don't accept a lead?",
    a: 'Leads expire after 48 hours if not accepted. They are then reassigned to another designer in your city. Your monthly credit is not used for expired leads.',
  },
  {
    q: 'Can I choose which types of projects I receive?',
    a: 'Yes. During profile setup you select your specialisations (residential, modular kitchen, office interiors, etc.). Leads are matched to your selected categories.',
  },
  {
    q: 'Is there a commission on projects I win?',
    a: 'Never. Intrafer charges only the subscription fee. We take zero percentage of your project value — ever.',
  },
  {
    q: 'How long does profile approval take?',
    a: 'Our team reviews new profiles within 24–48 hours. We check portfolio quality and business details. You receive a WhatsApp notification on approval.',
  },
  {
    q: 'Can I upgrade my plan later?',
    a: 'Yes. You can upgrade from 3-month to 6-month or 12-month at any time. The remaining days from your current plan are credited toward the new plan.',
  },
];

function FAQItem({ faq, open, onToggle, isLast }) {
  return (
    <div style={{
      borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.08)',
      borderLeft: open ? '2px solid #3B82F6' : '2px solid transparent',
      transition: 'border-color 200ms',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '16px', padding: '20px 20px 20px 18px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          textAlign: 'left', fontFamily: 'var(--v2-font-ui)',
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#F8F7F4' }}>{faq.q}</span>
        <span style={{
          fontSize: '14px', color: '#64748B', flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 200ms',
        }}>▾</span>
      </button>
      <div style={{
        maxHeight: open ? '200px' : '0px',
        overflow: 'hidden',
        transition: 'max-height 300ms ease',
      }}>
        <p style={{
          fontSize: '13px', color: '#94A3B8', lineHeight: 1.75,
          padding: '0 20px 20px 18px', margin: 0,
        }}>{faq.a}</p>
      </div>
    </div>
  );
}

export default function DesignerFAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section style={{ background: '#0A0F1E', padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,36px)' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <RevealOnScroll direction="up">
          <V2SectionHeader
            eyebrow="FAQ"
            heading="Questions designers ask us."
            dark
            align="center"
          />
        </RevealOnScroll>
        <RevealOnScroll direction="up" delay={100}>
          <div style={{ background: '#020617', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            {FAQS.map((faq, i) => (
              <FAQItem
                key={faq.q}
                faq={faq}
                open={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
                isLast={i === FAQS.length - 1}
              />
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
