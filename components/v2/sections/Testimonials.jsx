'use client'
import { useTheme } from '@/context/ThemeContext';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';
import V2SectionHeader from '@/components/v2/ui/SectionHeader';

const TESTIMONIALS = [
  {
    quote: "Found our designer in 20 minutes. The before and after is something people still ask us about at every dinner party.",
    name: 'Rahul & Pooja Sharma',
    detail: '3BHK renovation · Bangalore · ₹18L project',
  },
  {
    quote: "The contact reveal feature meant I only spoke with designers who were genuinely interested. No spam, no cold calls — just one great designer.",
    name: 'Sneha Patel',
    detail: 'Modular kitchen · Bangalore',
  },
  {
    quote: "I submitted an enquiry at 9pm and had three responses by morning. Every portfolio was real work — not stock photos.",
    name: 'Arjun Mehta',
    detail: 'Office interior · Mumbai',
  },
];

export default function Testimonials() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bg = isDark ? '#1E293B' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0';
  const quoteColor = isDark ? '#CBD5E1' : '#334155';
  const nameColor = isDark ? '#F8F7F4' : '#0F172A';
  const detailColor = isDark ? '#64748B' : '#64748B';

  return (
    <section style={{ background: bg, padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,36px)' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
        <RevealOnScroll direction="up">
          <V2SectionHeader
            eyebrow="Testimonials"
            heading="Real people. Real homes. Real results."
            align="center"
            dark={isDark}
          />
        </RevealOnScroll>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {TESTIMONIALS.map((t, i) => (
            <RevealOnScroll key={t.name} direction="up" delay={i * 100}>
              <div style={{
                border: `1px solid ${cardBorder}`, borderRadius: '14px', padding: '24px',
                height: '100%',
              }}>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '14px' }}>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <span key={s} style={{ color: '#3B82F6', fontSize: '13px' }}>★</span>
                  ))}
                </div>
                <p style={{
                  fontSize: '14px', color: quoteColor, lineHeight: 1.7,
                  marginBottom: '20px', fontStyle: 'italic',
                }}>"{t.quote}"</p>
                <div style={{ fontSize: '13px', fontWeight: 600, color: nameColor }}>{t.name}</div>
                <div style={{ fontSize: '12px', color: detailColor }}>{t.detail}</div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
