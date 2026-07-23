import Image from 'next/image';
import Link from 'next/link';
import { IMAGES } from '@/lib/images';
import Reveal from '@/components/ui/Reveal';

export const metadata = {
  title: "About Intrafer | India's Interior Designer Marketplace",
};

const STATS = [
  { value: '500+',   label: 'VERIFIED DESIGNERS' },
  { value: '12,000+',label: 'ENQUIRIES PLACED'   },
  { value: '4.9★',   label: 'AVERAGE RATING'     },
  { value: '48h',    label: 'RESPONSE GUARANTEE'  },
];

const STEPS = [
  { n: '01', title: 'Portfolio review',   desc: "Every portfolio project is reviewed by hand — we confirm the images are real, credited to the right designer, and consistent with the quality being advertised." },
  { n: '02', title: 'Credential check',   desc: 'We confirm business registration, check professional background, and follow up with past clients where possible. Designers from recognised institutions are noted on their profile.' },
  { n: '03', title: 'Quality assessment', desc: "New designers are monitored closely for their first three leads. Anyone who consistently misses the 48-hour response window is flagged and removed from the platform." },
];

const TEAM = [
  { initials: 'RS', name: 'Rahul Sharma',  role: 'Co-founder & CEO', bio: 'Eight years as an interior design consultant before co-founding Intrafer.' },
  { initials: 'PK', name: 'Priya Kumar',   role: 'Co-founder & CTO', bio: 'Previously built marketplace systems at Flipkart; now leads product and engineering.' },
  { initials: 'AM', name: 'Aryan Mehta',   role: 'Head of Design',   bio: 'Trained as an architect at IIT Bombay, now leads design across the platform.' },
];

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── HERO ── */}
      <section style={{ background: 'var(--bg-parchment)', padding: '108px 40px 80px', textAlign: 'center' }}>
        <Reveal style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p className="caps-label-primary" style={{ marginBottom: '12px' }}>ABOUT INTRAFER</p>
          <h1 className="section-heading" style={{ marginBottom: '18px' }}>
            Built to fix how India hires interior designers
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-mid)', lineHeight: 1.8, maxWidth: '540px', margin: '0 auto 40px' }}>
            Most homeowners still find a designer through a WhatsApp forward or a neighbour&apos;s recommendation, with no way to check if the portfolio is real. Intrafer checks every designer&apos;s credentials and completed work before they&apos;re listed, so you can compare verified options instead of guessing.
          </p>
          <div style={{ position: 'relative', height: '400px', borderRadius: 'var(--r-2xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', maxWidth: '960px', margin: '0 auto' }}>
            <Image src={IMAGES.banners.about} alt="Interior design inspiration" fill style={{ objectFit: 'cover' }} priority sizes="(max-width: 768px) 100vw, 960px" />
          </div>
        </Reveal>
      </section>

      <div className="divider" />

      {/* ── MISSION ── */}
      <section style={{ background: 'var(--bg)', padding: '80px 40px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '64px', alignItems: 'start' }} className="grid-mobile-1">
          <div>
            <h2 className="section-heading">Why we built Intrafer</h2>
          </div>
          <div>
            <p style={{ fontSize: '15px', color: 'var(--text-sub)', lineHeight: 1.85, marginBottom: '20px' }}>
              The interior design industry in India is fragmented and opaque. Homeowners typically find a designer through WhatsApp groups or a neighbour&apos;s referral, with portfolio photos that are often stock images and no reliable way to compare pricing without collecting multiple quotes.
            </p>
            <p style={{ fontSize: '15px', color: 'var(--text-sub)', lineHeight: 1.85, marginBottom: '20px' }}>
              Intrafer&apos;s answer is a marketplace where enquiries cost nothing and every listed designer has been checked — their completed projects, business registration, and client references reviewed before their profile goes live.
            </p>
            <p style={{ fontSize: '15px', color: 'var(--text-sub)', lineHeight: 1.85 }}>
              Today, more than 500 verified designers across India are listed on Intrafer, with new applicants added only after they pass this review.
            </p>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── STATS ── */}
      <section style={{ background: 'var(--bg-parchment)', padding: '60px 40px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px' }} className="grid-mobile-1">
          {STATS.map((s) => (
            <div key={s.label} style={{ textAlign: 'center', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 400, color: 'var(--text)', lineHeight: 1, marginBottom: '6px' }}>{s.value}</div>
              <div style={{ fontSize: '10px', letterSpacing: '.1em', color: 'var(--text-hint)', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* ── HOW WE VERIFY ── */}
      <section style={{ background: 'var(--bg)', padding: '80px 40px' }}>
        <Reveal style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p className="caps-label-primary" style={{ marginBottom: '10px' }}>TRUST & QUALITY</p>
          <h2 className="section-heading" style={{ marginBottom: '44px' }}>How we verify designers</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }} className="grid-mobile-1">
            {STEPS.map((s) => (
              <div key={s.n} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '52px', fontWeight: 400, color: 'var(--border-emp)', lineHeight: 1, marginBottom: '14px' }}>{s.n}</div>
                <div style={{ width: '28px', height: '2px', background: 'var(--primary)', marginBottom: '14px' }} />
                <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>{s.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-mid)', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <div className="divider" />

      {/* ── TEAM ── */}
      <section style={{ background: 'var(--bg-parchment)', padding: '80px 40px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p className="caps-label-primary" style={{ marginBottom: '10px' }}>THE TEAM</p>
          <h2 className="section-heading" style={{ marginBottom: '44px' }}>Built by designers and technologists</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }} className="grid-mobile-1">
            {TEAM.map((m) => (
              <div key={m.name} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '28px', boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '50%',
                  background: 'var(--primary-bg)', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 400,
                  margin: '0 auto 16px', border: '2px solid var(--primary-light)',
                }}>
                  {m.initials}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>{m.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 500, marginBottom: '8px' }}>{m.role}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-mid)' }}>{m.bio}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── CTA ── */}
      <section style={{ background: 'var(--bg)', padding: '80px 40px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="cta-always-dark" style={{ borderRadius: 'var(--r-xl)', padding: '60px 40px', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: '#FAFAF8', fontWeight: 400, marginBottom: '12px' }}>
              See the verified designers for yourself
            </h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,.5)', marginBottom: '24px' }}>
              Browse real portfolios from 500+ checked designers, or submit your requirements and let them come to you.
            </p>
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
      </section>
    </div>
  );
}
