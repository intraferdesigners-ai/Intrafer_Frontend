'use client'
import { useTheme } from '@/context/ThemeContext';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';
import V2SectionHeader from '@/components/v2/ui/SectionHeader';
import EMICalculator from '@/components/ui/EMICalculator';

export default function EMICalculatorSection() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const bg = isDark ? '#1E293B' : '#F1F5F9';

  return (
    <section style={{ background: bg, padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,36px)' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
        <RevealOnScroll direction="up">
          <V2SectionHeader
            eyebrow="Plan your budget"
            heading="Know your monthly EMI before you commit."
            subheading="Estimate financing for your project so there are no surprises when you pick a designer."
            dark={isDark}
          />
        </RevealOnScroll>
        <RevealOnScroll direction="up" delay={100}>
          <EMICalculator />
        </RevealOnScroll>
      </div>
    </section>
  );
}
