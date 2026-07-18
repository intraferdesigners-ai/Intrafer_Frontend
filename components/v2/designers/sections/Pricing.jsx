import Link from 'next/link';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';
import V2SectionHeader from '@/components/v2/ui/SectionHeader';
import V2Button from '@/components/v2/ui/Button';

const PLANS = [
  {
    name: '3 MONTHS',
    price: '₹7,999',
    note: 'Billed once',
    featured: false,
    features: ['Verified profile', 'Portfolio showcase', 'WhatsApp alerts', 'Analytics dashboard', 'Email support'],
  },
  {
    name: '6 MONTHS',
    price: '₹14,999',
    note: 'Billed once',
    featured: true,
    badge: 'MOST POPULAR',
    features: ['Verified profile', 'Portfolio showcase', 'WhatsApp alerts', 'Analytics dashboard', 'Email support', 'Priority listing', 'Phone support'],
  },
  {
    name: '12 MONTHS',
    price: '₹19,999',
    note: 'Billed once',
    featured: false,
    features: ['Verified profile', 'Portfolio showcase', 'WhatsApp alerts', 'Analytics dashboard', 'Email support', 'Priority listing', 'Phone support', 'Featured badge', 'Dedicated support'],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" style={{ background: '#030712', padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,36px)' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
        <RevealOnScroll direction="up">
          <V2SectionHeader
            eyebrow="Pricing"
            heading="One flat subscription. No commissions. Ever."
            subheading="Pay once, receive leads all month. We never take a percentage of your projects. Ever."
            dark
            align="center"
          />
        </RevealOnScroll>

        <RevealOnScroll direction="up" delay={50}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              fontSize: '13px', fontWeight: 600, color: '#93C5FD',
              background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
              padding: '8px 18px', borderRadius: '20px',
            }}>
              ✓ All plans include upto 10 leads / month
            </span>
          </div>
        </RevealOnScroll>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden',
        }}>
          {PLANS.map((plan, i) => (
            <RevealOnScroll key={plan.name} direction="up" delay={i * 100}>
              <div style={{
                background: plan.featured ? '#0A0F1E' : '#020617',
                borderLeft: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.08)',
                padding: '32px 28px',
                height: '100%',
                position: 'relative',
              }}>
                {plan.badge && (
                  <span style={{
                    position: 'absolute', top: '16px', right: '16px',
                    fontSize: '10px', fontWeight: 700, letterSpacing: '.06em',
                    color: '#3B82F6', background: 'rgba(59,130,246,0.12)',
                    padding: '4px 10px', borderRadius: '20px',
                  }}>{plan.badge}</span>
                )}
                <div style={{
                  fontSize: '12px', fontWeight: 600, letterSpacing: '.08em',
                  color: '#64748B', marginBottom: '14px',
                }}>{plan.name}</div>
                <div style={{
                  fontFamily: 'var(--v2-font-display)',
                  fontSize: '36px', fontWeight: 500, color: '#F8F7F4',
                  marginBottom: '4px',
                }}>{plan.price}</div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '24px' }}>{plan.note}</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#3B82F6', fontSize: '13px' }}>✓</span>
                      <span style={{ fontSize: '13px', color: '#CBD5E1' }}>{f}</span>
                    </div>
                  ))}
                </div>

                <Link href="/auth/register" style={{ display: 'block' }}>
                  <V2Button
                    variant={plan.featured ? 'primary' : 'ghost'}
                    size="md"
                    fullWidth
                  >
                    Get started
                  </V2Button>
                </Link>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        <p style={{
          textAlign: 'center', fontSize: '13px', color: '#475569', marginTop: '28px',
        }}>
          No hidden fees. No commissions. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
