import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'How Intrafer Works | Interior Design Made Simple',
  description: 'Learn how Intrafer connects homeowners with verified interior designers in 5 simple steps.',
};

const STEPS = [
  {
    num: '01', title: 'Browse verified designers',
    desc: 'Search by city, specialization, budget, and style. Every designer is manually verified before listing. Read real reviews from completed projects.',
    image: '/images/how-it-works/step1.jpg',
    features: ['500+ verified designers', 'Real portfolio photos only', 'Transparent ratings'],
  },
  {
    num: '02', title: 'Submit your enquiry',
    desc: 'Fill in your project requirements in under 2 minutes. No account needed — verify with OTP. Your details stay private until a designer accepts.',
    image: '/images/how-it-works/step2.jpg',
    features: ['No account needed', 'OTP verification only', 'Private until accepted'],
  },
  {
    num: '03', title: 'Designer accepts your lead',
    desc: 'Matched designers review your requirements and accept leads that fit their expertise. Once accepted, your contact details are instantly revealed to them.',
    image: '/images/how-it-works/step3.jpg',
    features: ['Designers choose relevant projects', 'No spam calls', 'Instant contact reveal'],
  },
  {
    num: '04', title: 'Get your personalised quote',
    desc: 'The designer contacts you directly to discuss requirements and provide a detailed quote. Compare quotes from multiple designers before deciding.',
    image: '/images/how-it-works/step4.jpg',
    features: ['Direct conversation', 'Detailed written quote', 'No hidden charges'],
  },
  {
    num: '05', title: 'Transform your space',
    desc: 'Work with your chosen designer to bring your vision to life. Track progress, provide feedback, and enjoy your beautifully transformed home.',
    image: '/images/how-it-works/step5.jpg',
    features: ['Timeline tracking', 'Regular updates', 'Quality assured'],
  },
];

const TRUST_BADGES = [
  { icon: '🛡', title: 'Verified designers only' },
  { icon: '★', title: '4.9★ average rating' },
  { icon: '⏱', title: '48h response guarantee' },
  { icon: '🔒', title: 'Privacy protected' },
];

export default function HowItWorksPage() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(80px,10vw,108px) clamp(16px,4vw,40px) 80px' }}>
      <p className="caps-label-primary" style={{ marginBottom: '10px' }}>PROCESS</p>
      <h1 className="section-heading" style={{ marginBottom: '8px' }}>How Intrafer works</h1>
      <p style={{ fontSize: '15px', color: 'var(--text-mid)', marginBottom: '64px' }}>
        From inspiration to transformation in 5 simple steps.
      </p>

      {/* Progress indicators */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '64px', overflowX: 'auto', paddingBottom: '8px' }}>
        {STEPS.map((step, i) => (
          <div key={step.num} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, flexShrink: 0,
            }}>
              {step.num}
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ width: '60px', height: '2px', background: 'var(--border-emp)', flexShrink: 0 }} />
            )}
          </div>
        ))}
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
        {STEPS.map((step, i) => (
          <div
            key={step.num}
            style={{
              display: 'grid',
              gridTemplateColumns: i % 2 === 0 ? '1fr 420px' : '420px 1fr',
              gap: '60px', alignItems: 'center',
            }}
            className="steps-alt-grid grid-mobile-1"
          >
            {/* Content (always first in DOM, reordered visually on desktop) */}
            <div style={{ order: i % 2 === 0 ? 1 : 2 }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '80px', fontWeight: 400,
                color: 'var(--border)', lineHeight: 1, marginBottom: '8px',
              }}>
                {step.num}
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 400, color: 'var(--text)', marginBottom: '16px', letterSpacing: '-.02em' }}>
                {step.title}
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--text-mid)', lineHeight: 1.8, marginBottom: '20px' }}>
                {step.desc}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {step.features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-sub)' }}>
                    <span style={{ color: 'var(--primary)', fontSize: '16px', fontWeight: 700 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Image */}
            <div style={{ position: 'relative', height: '280px', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-md)', order: i % 2 === 0 ? 2 : 1, flexShrink: 0 }}>
              <Image src={step.image} alt={step.title} fill style={{ objectFit: 'cover' }} sizes="420px" />
            </div>
          </div>
        ))}
      </div>

      {/* Trust badges */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px', marginTop: '80px', marginBottom: '60px',
      }} className="grid-2col">
        {TRUST_BADGES.map((b) => (
          <div key={b.title} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '20px', textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{b.icon}</div>
            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>{b.title}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="cta-always-dark" style={{ borderRadius: 'var(--r-xl)', padding: '60px 40px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: '#FAFAF8', fontWeight: 400, marginBottom: '12px' }}>
          Ready to find your designer?
        </h2>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,.5)', marginBottom: '24px' }}>Join 1,200+ homeowners who transformed their homes through Intrafer.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/vendors" style={{
            display: 'inline-block', background: 'var(--primary)', color: '#fff',
            padding: '13px 32px', borderRadius: 'var(--r-md)', fontSize: '14px',
            fontWeight: 500, textDecoration: 'none',
          }}>
            Browse designers
          </Link>
          <Link href="/enquiry" style={{
            display: 'inline-block', background: 'transparent', color: 'rgba(255,255,255,.6)',
            padding: '12px 28px', borderRadius: 'var(--r-md)', fontSize: '14px',
            border: '1px solid rgba(255,255,255,.2)', textDecoration: 'none',
          }}>
            Submit enquiry
          </Link>
        </div>
      </div>
    </div>
  );
}
