'use client'
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';
import V2SectionHeader from '@/components/v2/ui/SectionHeader';
import { IMAGES } from '@/lib/images';

const PROJECTS = [
  {
    before: IMAGES.beforeAfter.livingBefore,
    after: IMAGES.beforeAfter.livingAfter,
    title: 'Living room makeover',
    location: 'Bangalore',
    budget: '₹6.5L',
    designer: 'Priya Design Studio',
  },
  {
    before: IMAGES.beforeAfter.kitchenBefore,
    after: IMAGES.beforeAfter.kitchenAfter,
    title: 'Modular kitchen upgrade',
    location: 'Pune',
    budget: '₹4.2L',
    designer: 'The Aesthetic Co.',
  },
];

export default function BeforeAfter() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bg = isDark ? '#1E293B' : '#F1F5F9';
  const cardBg = isDark ? '#0F172A' : '#FFFFFF';
  const border = isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0';
  const titleColor = isDark ? '#F8F7F4' : '#0F172A';
  const metaColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <section style={{ background: bg, padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,36px)' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
        <RevealOnScroll direction="up">
          <V2SectionHeader
            eyebrow="Real transformations"
            heading="See the difference a great designer makes."
            dark={isDark}
            action={{ label: 'View all projects', href: '/recent-projects' }}
          />
        </RevealOnScroll>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
          {PROJECTS.map((p, i) => (
            <RevealOnScroll key={p.title} direction="up" delay={i * 100}>
              <div style={{
                background: cardBg, border: `1px solid ${border}`,
                borderRadius: '14px', overflow: 'hidden',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                  <div style={{ position: 'relative', aspectRatio: '4/3' }}>
                    <Image src={p.before} alt={`${p.title} before`} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 50vw, 25vw" />
                    <span style={{
                      position: 'absolute', top: '10px', left: '10px',
                      fontSize: '10px', fontWeight: 700, letterSpacing: '.08em',
                      color: '#F8F7F4', background: 'rgba(15,23,42,0.75)',
                      padding: '4px 10px', borderRadius: '20px',
                    }}>BEFORE</span>
                  </div>
                  <div style={{ position: 'relative', aspectRatio: '4/3' }}>
                    <Image src={p.after} alt={`${p.title} after`} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 50vw, 25vw" />
                    <span style={{
                      position: 'absolute', top: '10px', left: '10px',
                      fontSize: '10px', fontWeight: 700, letterSpacing: '.08em',
                      color: '#F8F7F4', background: '#3B82F6',
                      padding: '4px 10px', borderRadius: '20px',
                    }}>AFTER</span>
                  </div>
                </div>
                <div style={{ padding: '18px 20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: titleColor, marginBottom: '6px' }}>
                    {p.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: metaColor }}>
                    {p.location} · {p.budget} project · Designed by {p.designer}
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
