import Link from 'next/link';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';
import V2Button from '@/components/v2/ui/Button';

export const metadata = {
  title: 'About Us | Intrafer',
  description: 'We built Intrafer to make great interior design accessible to every Indian homeowner.',
  openGraph: {
    title: 'About Us | Intrafer',
    description: 'We built Intrafer to make great interior design accessible to every Indian homeowner.',
    url: 'https://intrafer.in/about',
    siteName: 'Intrafer',
    type: 'website',
  },
};

const VALUES = [
  { title: 'Honesty', desc: "We don't show you what you want to see. We show you what's actually true." },
  { title: 'Trust', desc: 'Every review is verified. Every portfolio is checked. Every designer is accountable.' },
  { title: 'Access', desc: "Great design shouldn't require a personal connection. We're building that connection at scale." },
];

const STATS = [
  { value: '480+', label: 'Verified designers' },
  { value: '12', label: 'Cities across India' },
  { value: '3,800+', label: 'Projects completed' },
  { value: '4.9★', label: 'Average rating' },
];

export default function AboutPage() {
  return (
    <div style={{ fontFamily: 'var(--v2-font-ui)' }}>
      {/* Hero */}
      <section style={{ background: '#0F172A', padding: 'clamp(64px,9vw,96px) clamp(16px,4vw,36px) clamp(48px,6vw,72px)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <RevealOnScroll direction="up">
            <h1 style={{
              fontFamily: 'var(--v2-font-display)', fontSize: 'clamp(30px,5vw,46px)',
              fontWeight: 500, color: '#F8F7F4', letterSpacing: '-0.02em', lineHeight: 1.2,
              margin: 0,
            }}>
              We built Intrafer because finding a good designer in India was harder than it needed to be.
            </h1>
          </RevealOnScroll>
        </div>
      </section>

      {/* Story */}
      <section style={{ background: '#F8F7F4', padding: 'clamp(56px,8vw,88px) clamp(16px,4vw,36px)' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <RevealOnScroll direction="up">
            <p style={{
              fontFamily: 'var(--v2-font-display)', fontSize: 'clamp(22px,3vw,28px)',
              fontStyle: 'italic', fontWeight: 400, color: '#0F172A',
              lineHeight: 1.5, margin: '0 0 48px',
            }}>
              "The average Indian homeowner speaks to 8 designers before choosing one. We wanted to make that number smaller — and the choice easier."
            </p>
          </RevealOnScroll>

          <RevealOnScroll direction="up">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <p style={{ fontSize: '16px', color: '#334155', lineHeight: 1.85, margin: 0 }}>
                Interior design in India is a ₹1.5 lakh crore industry. But if you've ever tried to renovate a home, you know the process is still frustratingly old-fashioned. You ask a friend for a referral. You search Instagram. You cold-call a studio. Half the time, the designer you find doesn't do the style you want, or doesn't work in your city, or shows up with a portfolio full of images they didn't actually create.
              </p>
              <p style={{ fontSize: '16px', color: '#334155', lineHeight: 1.85, margin: 0 }}>
                We started Intrafer to change that. Not to be a directory of every designer in the country — but to be a place where homeowners could find designers they could actually trust, based on real work, real reviews, and real credentials.
              </p>
              <p style={{ fontSize: '16px', color: '#334155', lineHeight: 1.85, margin: 0 }}>
                Every designer on Intrafer is personally reviewed before they go live. We check their portfolio, verify their completed projects, and make sure the work they show is work they actually did. It takes time. We think it's worth it.
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Mission */}
      <section style={{ background: '#0F172A', padding: 'clamp(56px,8vw,88px) clamp(16px,4vw,36px)', textAlign: 'center' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <RevealOnScroll direction="up">
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.12em', color: '#3B82F6', textTransform: 'uppercase', marginBottom: '20px' }}>
              Our mission
            </p>
            <p style={{
              fontFamily: 'var(--v2-font-display)', fontSize: 'clamp(24px,3.5vw,34px)',
              fontStyle: 'italic', fontWeight: 400, color: '#F8F7F4', lineHeight: 1.4, margin: 0,
            }}>
              To make great interior design accessible to every Indian homeowner — not just those who know the right people.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Values */}
      <section style={{ background: '#F8F7F4', padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,36px)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
          {VALUES.map((v, i) => (
            <RevealOnScroll key={v.title} direction="up" delay={i * 100}>
              <div>
                <h3 style={{
                  fontFamily: 'var(--v2-font-display)', fontSize: '20px', fontWeight: 500,
                  color: '#0F172A', margin: '0 0 10px',
                }}>{v.title}</h3>
                <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.7, margin: 0 }}>{v.desc}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* Numbers */}
      <section style={{ background: '#0F172A', padding: 'clamp(48px,7vw,72px) clamp(16px,4vw,36px)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {STATS.map((s, i) => (
            <RevealOnScroll key={s.label} direction="up" delay={i * 100}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--v2-font-display)', fontSize: 'clamp(28px,3.5vw,36px)', fontWeight: 500,
                  color: '#F8F7F4', marginBottom: '6px',
                }}>{s.value}</div>
                <div style={{ fontSize: '13px', color: '#94A3B8' }}>{s.label}</div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#F8F7F4', padding: 'clamp(56px,8vw,88px) clamp(16px,4vw,36px)', textAlign: 'center' }}>
        <RevealOnScroll direction="up">
          <h2 style={{
            fontFamily: 'var(--v2-font-display)', fontSize: 'clamp(24px,3.5vw,32px)',
            fontWeight: 500, color: '#0F172A', margin: '0 0 24px',
          }}>Join the designers on Intrafer</h2>
          <Link href="/for-designers">
            <V2Button variant="primary" size="lg">List your studio →</V2Button>
          </Link>
        </RevealOnScroll>
      </section>
    </div>
  );
}
