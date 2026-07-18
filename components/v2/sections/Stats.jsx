'use client'
import { useTheme } from '@/context/ThemeContext';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';

const STATS = [
  { value: '480+',   label: 'Verified designers',        sub: '' },
  { value: '3,800+', label: 'Projects completed',         sub: 'Across 12 cities' },
  { value: '4.9★',   label: 'Average designer rating',    sub: 'From verified reviews only' },
  { value: '48h',    label: 'First response',             sub: 'Guaranteed or reassigned' },
];

export default function Stats() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bg = isDark ? '#1E293B' : '#F1F5F9';
  const border = isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0';
  const numberColor = isDark ? '#F8F7F4' : '#0F172A';
  const labelColor = isDark ? '#F8F7F4' : '#0F172A';

  return (
    <section style={{
      background: bg,
      borderTop: `1px solid ${border}`,
      borderBottom: `1px solid ${border}`,
      padding: 'clamp(32px,5vw,48px) clamp(16px,4vw,36px)',
    }}>
      <div style={{
        maxWidth: '1140px', margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
      }}>
        {STATS.map((stat, i) => (
          <RevealOnScroll key={stat.label} direction="up" delay={i * 100}>
            <div style={{
              padding: '0 24px',
              borderLeft: i === 0 ? 'none' : `1px solid ${border}`,
            }}>
              <div style={{
                fontFamily: 'var(--v2-font-display)',
                fontSize: '28px', fontWeight: 500,
                color: numberColor, marginBottom: '6px',
              }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: labelColor, fontWeight: 500, marginBottom: stat.sub ? '4px' : 0 }}>
                {stat.label}
              </div>
              {stat.sub && (
                <div style={{ fontSize: '11px', color: '#3B82F6' }}>{stat.sub}</div>
              )}
            </div>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}
