import Link from 'next/link';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';
import V2Button from '@/components/v2/ui/Button';

const METRICS = [
  { value: '10',     label: 'leads/mo included' },
  { value: '₹0',     label: 'per lead ever' },
  { value: '48h',    label: 'avg contact time' },
  { value: '2,400+', label: 'homeowners active' },
];

export default function DesignerHero() {
  return (
    <section style={{
      background: '#020617',
      padding: '80px clamp(16px,4vw,36px) clamp(56px,8vw,88px)',
      display: 'flex', justifyContent: 'center',
    }}>
      <div style={{ maxWidth: '760px', textAlign: 'center' }}>
        <RevealOnScroll direction="up">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 14px', borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '28px',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#3B82F6', display: 'inline-block',
            }} />
            <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>
              Built exclusively for interior designers
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--v2-font-display)',
            fontSize: 'clamp(38px, 7vw, 64px)',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            margin: '0 0 20px',
          }}>
            <span style={{ display: 'block', color: '#3B82F6' }}>More clients.</span>
            <span style={{ display: 'block', color: '#1E3A5F' }}>Less chasing.</span>
          </h1>

          <p style={{
            fontSize: '16px', color: '#64748B', lineHeight: 1.7,
            maxWidth: '480px', margin: '0 auto 32px',
          }}>
            Intrafer connects you with homeowners who already know what they want and what they're willing to pay. Verified leads, real budgets, zero cold outreach.
          </p>

          <div style={{
            display: 'flex', gap: '12px', justifyContent: 'center',
            flexWrap: 'wrap', marginBottom: '48px',
          }}>
            <Link href="/auth/register">
              <V2Button variant="primary" size="lg">List your studio — free</V2Button>
            </Link>
            <Link href="#how-it-works">
              <V2Button variant="ghost" size="lg">See how it works</V2Button>
            </Link>
          </div>
        </RevealOnScroll>

        <RevealOnScroll direction="up" delay={100}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px', overflow: 'hidden',
            background: '#0A0F1E',
          }}>
            {METRICS.map((m, i) => (
              <div key={m.label} style={{
                padding: '20px 12px',
                borderLeft: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.08)',
              }}>
                <div style={{
                  fontFamily: 'var(--v2-font-display)',
                  fontSize: '24px', fontWeight: 500,
                  color: '#F8F7F4', marginBottom: '4px',
                }}>{m.value}</div>
                <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.4 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
