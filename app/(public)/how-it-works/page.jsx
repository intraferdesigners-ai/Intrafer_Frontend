import Image from 'next/image';
import Link from 'next/link';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';
import V2Button from '@/components/v2/ui/Button';
import { IMAGES } from '@/lib/images';

export const metadata = {
  title: 'How Intrafer Works | Find Your Interior Designer',
  description: 'Learn how Intrafer connects homeowners with verified interior designers in 4 simple steps.',
  openGraph: {
    title: 'How Intrafer Works | Find Your Interior Designer',
    description: 'Learn how Intrafer connects homeowners with verified interior designers in 4 simple steps.',
    url: 'https://intrafer.in/how-it-works',
    siteName: 'Intrafer',
    type: 'website',
  },
};

const HOMEOWNER_STEPS = [
  { num: '01', title: 'Tell us what you need', desc: 'Share your city, the type of space, your rough budget, and the style you\'re drawn to. Takes 90 seconds. No account required, no spam.' },
  { num: '02', title: 'Browse real portfolios', desc: 'Every designer on Intrafer has been personally verified. Every portfolio image is from a project they actually completed — no stock photos, no borrowed work.' },
  { num: '03', title: 'Submit a free enquiry', desc: 'When you find a designer (or two, or three) you like, send an enquiry. Your phone number and email stay private until a designer accepts your lead.' },
  { num: '04', title: 'Designer responds within 48 hours', desc: 'Designers who accept your lead get access to your brief and contact details. They reach out directly with a proposal tailored to your project.' },
  { num: '05', title: 'You choose who to work with', desc: 'Review the proposals, meet the designers, and choose the one who feels right. We never assign you a designer — you always have the final say.' },
];

const DESIGNER_STEPS = [
  { num: '01', title: 'Register your studio', desc: 'Free to sign up. Takes 3 minutes.' },
  { num: '02', title: 'Complete your profile', desc: 'Add your real portfolio and set your city and specialisations.' },
  { num: '03', title: 'Get approved in 24-48 hrs', desc: 'Our team reviews your portfolio and business details.' },
  { num: '04', title: 'Receive leads immediately', desc: 'Leads matched to your city and budget hit your WhatsApp the moment you\'re approved.' },
];

const TRUST_ITEMS = [
  { title: 'Every portfolio is verified', desc: 'We check every designer\'s work before they go live. No stock photos. No borrowed portfolios.' },
  { title: 'Your details stay private', desc: 'Homeowners\' contact info is only shared after a designer actively accepts their lead.' },
  { title: '48-hour response guarantee', desc: 'Designers commit to responding within 48 hours or the lead is reassigned automatically.' },
];

export default function HowItWorksPage() {
  return (
    <div style={{ fontFamily: 'var(--v2-font-ui)' }}>
      {/* Hero */}
      <section style={{ background: '#0F172A', padding: 'clamp(64px,9vw,96px) clamp(16px,4vw,36px) clamp(48px,6vw,72px)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <RevealOnScroll direction="up">
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.12em', color: '#3B82F6', textTransform: 'uppercase', marginBottom: '20px' }}>
              How Intrafer works
            </p>
            <h1 style={{
              fontFamily: 'var(--v2-font-display)', fontSize: 'clamp(32px,5.5vw,52px)',
              fontWeight: 500, color: '#F8F7F4', letterSpacing: '-0.02em', lineHeight: 1.15,
              margin: '0 0 20px',
            }}>
              A better way to find your interior designer.
            </h1>
            <p style={{ fontSize: '16px', color: '#64748B', lineHeight: 1.75, maxWidth: '580px', margin: '0 auto' }}>
              We built Intrafer because finding a good interior designer in India was unnecessarily hard. Cold calls, no-shows, portfolios full of stock photos. We fixed that.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* For homeowners */}
      <section style={{ background: '#F8F7F4', padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,36px)' }}>
        <div style={{
          maxWidth: '1140px', margin: '0 auto',
          display: 'flex', gap: 'clamp(24px,5vw,56px)', flexWrap: 'wrap',
        }}>
          <div style={{ flex: '1 1 480px' }}>
            <RevealOnScroll direction="up">
              <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.12em', color: '#3B82F6', textTransform: 'uppercase', marginBottom: '12px' }}>
                For homeowners
              </p>
              <h2 style={{
                fontFamily: 'var(--v2-font-display)', fontSize: 'clamp(26px,3.5vw,36px)',
                fontWeight: 500, color: '#0F172A', margin: '0 0 32px',
              }}>Finding your designer</h2>
            </RevealOnScroll>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {HOMEOWNER_STEPS.map((step, i) => (
                <RevealOnScroll key={step.num} direction="up" delay={(i % 3) * 100}>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <span style={{
                      fontFamily: 'var(--v2-font-display)', fontSize: '32px', fontWeight: 500,
                      color: '#CBD5E1', flexShrink: 0, lineHeight: 1,
                    }}>{step.num}</span>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', margin: '4px 0 8px' }}>{step.title}</h3>
                      <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>

          <div style={{ flex: '1 1 360px', minWidth: 0 }}>
            <RevealOnScroll direction="right">
              <div style={{
                position: 'sticky', top: '96px',
                borderRadius: '20px', overflow: 'hidden',
                aspectRatio: '4/5', position: 'relative',
              }}>
                <Image src={IMAGES.banners.howItWorks} alt="Homeowner reviewing a designer's portfolio" fill style={{ objectFit: 'cover' }} sizes="(max-width:900px) 100vw, 40vw" />
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* For designers */}
      <section style={{ background: '#0F172A', padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,36px)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <RevealOnScroll direction="up">
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.12em', color: '#3B82F6', textTransform: 'uppercase', marginBottom: '12px', textAlign: 'center' }}>
              For designers
            </p>
            <h2 style={{
              fontFamily: 'var(--v2-font-display)', fontSize: 'clamp(26px,3.5vw,36px)',
              fontWeight: 500, color: '#F8F7F4', margin: '0 0 40px', textAlign: 'center',
            }}>Joining Intrafer</h2>
          </RevealOnScroll>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', overflow: 'hidden',
          }}>
            {DESIGNER_STEPS.map((step, i) => (
              <RevealOnScroll key={step.num} direction="up" delay={i * 100}>
                <div style={{
                  padding: '28px 22px', height: '100%',
                  borderLeft: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{
                    fontFamily: 'var(--v2-font-display)', fontSize: '32px', fontWeight: 500,
                    color: '#334155', marginBottom: '14px',
                  }}>{step.num}</div>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#F8F7F4', margin: '0 0 8px' }}>{step.title}</h3>
                  <p style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>

          <RevealOnScroll direction="up" delay={100}>
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Link href="/designers">
                <V2Button variant="primary" size="md">List your studio — free →</V2Button>
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Trust */}
      <section style={{ background: '#F8F7F4', padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,36px)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
          {TRUST_ITEMS.map((item, i) => (
            <RevealOnScroll key={item.title} direction="up" delay={i * 100}>
              <div>
                <h3 style={{
                  fontFamily: 'var(--v2-font-display)', fontSize: '20px', fontWeight: 500,
                  color: '#0F172A', margin: '0 0 10px',
                }}>{item.title}</h3>
                <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#0F172A', padding: 'clamp(56px,8vw,88px) clamp(16px,4vw,36px)', textAlign: 'center' }}>
        <RevealOnScroll direction="up">
          <h2 style={{
            fontFamily: 'var(--v2-font-display)', fontSize: 'clamp(26px,4vw,38px)',
            fontWeight: 500, color: '#F8F7F4', margin: '0 0 28px',
          }}>Ready to find your designer?</h2>
          <Link href="/enquiry">
            <V2Button variant="primary" size="lg">Get free quotes →</V2Button>
          </Link>
        </RevealOnScroll>
      </section>
    </div>
  );
}
