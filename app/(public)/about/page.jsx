import Image from 'next/image';
import { IMAGES } from '@/lib/images';

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
  { n: '01', title: 'Portfolio review',   desc: "We manually review every project in a designer's portfolio. We check that images are real, credits are accurate, and completed work matches the quoted quality." },
  { n: '02', title: 'Credential check',   desc: 'We verify business registration, past client references, and professional background. Designers from recognized institutions are highlighted in their profiles.' },
  { n: '03', title: 'Quality assessment', desc: "New designers start on probation — their first 3 leads are monitored for quality. Designers who don't respond within 48 hours are flagged and eventually removed." },
];

const TEAM = [
  { initials: 'RS', name: 'Rahul Sharma',  role: 'Co-founder & CEO', bio: 'Former design consultant, 8 years in interior industry.' },
  { initials: 'PK', name: 'Priya Kumar',   role: 'Co-founder & CTO', bio: 'Ex-Flipkart engineer, passionate about marketplace design.' },
  { initials: 'AM', name: 'Aryan Mehta',   role: 'Head of Design',   bio: 'Architect turned product designer, IIT Bombay.' },
];

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── HERO ── */}
      <section style={{ background: 'var(--bg-parchment)', padding: '108px 40px 80px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p className="caps-label-primary" style={{ marginBottom: '12px' }}>OUR STORY</p>
          <h1 className="section-heading" style={{ marginBottom: '18px' }}>
            We believe everyone deserves a beautiful home
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-mid)', lineHeight: 1.8, maxWidth: '540px', margin: '0 auto 40px' }}>
            Intrafer was built to solve a simple problem: finding a trustworthy interior designer is harder than it should be.
            We created a marketplace where verification, transparency, and quality are built in from day one.
          </p>
          <div style={{ position: 'relative', height: '400px', borderRadius: 'var(--r-2xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', maxWidth: '960px', margin: '0 auto' }}>
            <Image src={IMAGES.banners.about} alt="Interior design inspiration" fill style={{ objectFit: 'cover' }} priority sizes="(max-width: 768px) 100vw, 960px" />
          </div>
        </div>
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
              The interior design industry in India is fragmented and opaque. Homeowners struggle to find designers they can trust — recommendations are scattered across WhatsApp groups and local referrals, portfolio images are often stock photos, and pricing is impossible to benchmark without getting multiple quotes.
            </p>
            <p style={{ fontSize: '15px', color: 'var(--text-sub)', lineHeight: 1.85, marginBottom: '20px' }}>
              We built a platform where designers are verified, portfolios are real, and enquiries are free for homeowners. Our verification process checks every designer's completed work, credentials, and client references before they appear on Intrafer.
            </p>
            <p style={{ fontSize: '15px', color: 'var(--text-sub)', lineHeight: 1.85 }}>
              Today Intrafer connects homeowners with 500+ verified designers across India. We're growing quickly — but our commitment to verification standards remains absolute.
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
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
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
        </div>
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
    </div>
  );
}
