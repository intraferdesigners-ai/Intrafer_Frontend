'use client'
import { useTheme } from '@/context/ThemeContext';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';
import V2SectionHeader from '@/components/v2/ui/SectionHeader';

const STEPS = [
  { num: '01', title: 'Tell us about your space',  desc: 'Share your city, style, and budget. Takes 90 seconds.' },
  { num: '02', title: 'Browse matched designers',   desc: 'We surface verified designers who fit your brief.' },
  { num: '03', title: 'Get free proposals',         desc: 'Up to 3 designers send tailored proposals.' },
  { num: '04', title: 'Transform your space',       desc: 'Work directly with your chosen designer. We stay on hand.' },
];

export default function HowItWorks() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bg = isDark ? '#0F172A' : '#F8F7F4';
  const border = isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0';
  const numColor = isDark ? '#334155' : '#E2E8F0';
  const titleColor = isDark ? '#F8F7F4' : '#0F172A';
  const descColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <section style={{ background: bg, padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,36px)' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
        <RevealOnScroll direction="up">
          <V2SectionHeader
            eyebrow="How Intrafer works"
            heading="From idea to transformation in four steps."
            subheading={`No cold calls. No guesswork. A clear path from "I need a designer" to "I love my home."`}
            align="center"
            dark={isDark}
          />
        </RevealOnScroll>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          border: `1px solid ${border}`, borderRadius: '14px', overflow: 'hidden',
        }}>
          {STEPS.map((step, i) => (
            <RevealOnScroll key={step.num} direction="up" delay={i * 100}>
              <div style={{
                padding: '28px 24px',
                borderLeft: i === 0 ? 'none' : `1px solid ${border}`,
                height: '100%',
              }}>
                <div style={{
                  fontFamily: 'var(--v2-font-display)',
                  fontSize: '40px', fontWeight: 500,
                  color: numColor, marginBottom: '14px',
                }}>{step.num}</div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: titleColor, marginBottom: '8px' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '12px', color: descColor, lineHeight: 1.65 }}>
                  {step.desc}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
