'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle, TrendingUp, Users, Star, Zap } from 'lucide-react';
import { IMAGES } from '@/lib/images';

const BENEFITS = [
  { Icon: TrendingUp, title: 'Qualified leads only',    desc: "Every lead is from a verified homeowner actively planning an interior project. No tire-kickers, no spam." },
  { Icon: Users,      title: 'You choose your leads',   desc: "Browse leads that match your specialization and location. Accept only the ones that fit your capacity." },
  { Icon: Star,       title: 'Build your reputation',   desc: "Collect verified reviews from completed projects. A strong profile compounds over time." },
  { Icon: Zap,        title: 'Instant notifications',   desc: "Get WhatsApp and email alerts the moment a new lead matches your profile. Never miss an opportunity." },
  { Icon: CheckCircle,title: 'No commission cuts',      desc: "We charge a flat subscription. Every rupee of project revenue goes directly to you." },
  { Icon: TrendingUp, title: 'Analytics dashboard',     desc: "Track your leads, conversion rate, and win rate. Understand what's working and optimize your business." },
];

const STEPS = [
  { n: '01', title: 'Create your profile',       desc: 'Sign up free, add your portfolio, set your specializations and service areas. Takes under 15 minutes.' },
  { n: '02', title: 'Get verified',               desc: 'Our team reviews your portfolio and credentials. Once verified, your listing goes live and leads start flowing.' },
  { n: '03', title: 'Receive & convert leads',    desc: 'Accept leads that match your expertise. Client contact details revealed instantly on acceptance.' },
];

const PLANS = [
  {
    name: '3 Months', price: '₹7,999', period: ' for 3 months', highlight: false,
    desc: 'Perfect for designers just getting started.',
    features: ['Upto 10 leads/month', 'Profile listing', 'Portfolio showcase', 'Email support'],
  },
  {
    name: '6 Months', price: '₹14,999', period: ' for 6 months', highlight: true,
    desc: 'For active designers who want to grow.',
    features: ['Upto 10 leads/month', 'Priority listing', 'WhatsApp + Email alerts', 'Analytics dashboard', 'Priority support'],
  },
  {
    name: '12 Months', price: '₹19,999', period: ' for 12 months', highlight: false,
    desc: 'For established studios managing high volume.',
    features: ['Upto 10 leads/month', 'Top of search listing', 'Featured badge', 'Dedicated account manager', 'Custom portfolio pages'],
  },
];

const FAQS = [
  { q: 'How are leads verified?',              a: 'Every user submits an OTP-verified enquiry. We confirm phone and email before the lead reaches you.' },
  { q: 'Can I cancel my subscription?',        a: 'Yes, cancel anytime. Your listing stays active until the end of your current billing period.' },
  { q: 'How many leads will I get?',           a: 'Depends on your location and specialization — all plans offer upto 10 leads/month.' },
  { q: 'What happens after I accept a lead?',  a: "The client's phone and email are instantly revealed. You contact them directly — Intrafer is not involved." },
  { q: 'Is my portfolio public?',              a: 'Yes, your profile and portfolio are publicly visible on the marketplace, which also helps your own SEO.' },
];

export default function ForDesignersPage() {
  useEffect(() => { document.title = 'List Your Interior Design Studio | Intrafer'; }, []);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── HERO ── */}
      <section style={{ background: 'var(--bg-parchment)', padding: '108px 40px 80px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '64px', alignItems: 'center' }} className="grid-mobile-1">
          <div>
            <p className="caps-label-primary" style={{ marginBottom: '12px' }}>FOR INTERIOR DESIGNERS</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(38px,4vw,52px)', fontWeight: 400, color: 'var(--text)', lineHeight: 1.1, letterSpacing: '-.025em', marginBottom: '18px' }}>
              Grow your <em style={{ color: 'var(--primary)', fontStyle: 'italic' }}>design business</em> with Intrafer
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-mid)', lineHeight: 1.75, maxWidth: '480px' }}>
              Join 500+ verified designers who receive qualified leads directly from homeowners actively looking for interior design services. No cold calling. No agencies. Just real clients.
            </p>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: '32px', marginTop: '28px', flexWrap: 'wrap' }}>
              {[
                { val: '15–20', label: 'LEADS/MONTH AVG' },
                { val: '₹45K',  label: 'AVG REVENUE UPLIFT' },
                { val: '4.8★',  label: 'DESIGNER RATING' },
              ].map((s) => (
                <div key={s.label}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 400, color: 'var(--primary)', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: '10px', letterSpacing: '.1em', color: 'var(--text-hint)', textTransform: 'uppercase', marginTop: '4px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px', flexWrap: 'wrap' }}>
              <Link href="/auth/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'var(--primary)', color: '#fff',
                padding: '13px 28px', borderRadius: 'var(--r-md)',
                fontSize: '14px', fontWeight: 500, textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(181,84,30,.3)',
              }}>
                List your studio free <ArrowRight size={14} />
              </Link>
              <Link href="/plans" style={{
                display: 'inline-flex', alignItems: 'center',
                background: 'var(--surface)', color: 'var(--text-sub)',
                padding: '12px 24px', borderRadius: 'var(--r-md)',
                fontSize: '14px', border: '1px solid var(--border-sub)',
                textDecoration: 'none', boxShadow: 'var(--shadow-sm)',
              }}>
                View pricing
              </Link>
            </div>
          </div>

          <div>
            {/* Card 1 */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '20px', boxShadow: 'var(--shadow-md)', marginBottom: '12px' }}>
              <div style={{ position: 'relative', height: '160px', borderRadius: 'var(--r-lg)', overflow: 'hidden', marginBottom: '14px' }}>
                <Image src={IMAGES.banners.forDesigners} alt="Designer studio" fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 400px" />
              </div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '2px' }}>Priya Design Studio</div>
              <div style={{ fontSize: '12px', color: 'var(--text-hint)', marginBottom: '8px' }}>Bangalore · ★ 4.9 · 42 reviews</div>
              <div style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--primary-dark)' }}>
                Joined Intrafer 8 months ago — now receives 18 leads/month
              </div>
            </div>
            {/* Card 2 */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
              <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  { label: 'Leads this month', val: '18' },
                  { label: 'Conversion rate', val: '72%' },
                  { label: 'Revenue uplift', val: '₹52K' },
                  { label: 'Rating', val: '4.9★' },
                ].map((s) => (
                  <div key={s.label}>
                    <div style={{ fontSize: '10px', letterSpacing: '.08em', color: 'var(--text-hint)', textTransform: 'uppercase', marginBottom: '3px' }}>{s.label}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, color: 'var(--primary)' }}>{s.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: 'var(--bg)', padding: '80px 40px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p className="caps-label-primary" style={{ marginBottom: '10px' }}>HOW IT WORKS</p>
          <h2 className="section-heading">Start receiving leads in 3 steps</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', marginTop: '44px' }} className="grid-mobile-1">
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

      {/* ── BENEFITS ── */}
      <section style={{ background: 'var(--bg-parchment)', padding: '80px 40px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p className="caps-label-primary" style={{ marginBottom: '10px' }}>WHY INTRAFER</p>
          <h2 className="section-heading">Everything you need to grow</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginTop: '44px' }} className="grid-mobile-1">
            {BENEFITS.map(({ Icon, title, desc }) => (
              <div key={title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <Icon size={20} color="var(--primary)" />
                </div>
                <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>{title}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-mid)', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── PRICING ── */}
      <section style={{ background: 'var(--bg)', padding: '80px 40px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p className="caps-label-primary" style={{ marginBottom: '10px' }}>PRICING</p>
          <h2 className="section-heading">Simple, transparent plans</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', marginTop: '44px' }} className="grid-mobile-1">
            {PLANS.map((plan) => (
              <div key={plan.name} style={{
                background: plan.highlight ? 'var(--primary-bg)' : 'var(--surface)',
                border: `${plan.highlight ? '2px' : '1px'} solid ${plan.highlight ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 'var(--r-2xl)', padding: '28px',
                boxShadow: plan.highlight ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                position: 'relative',
              }}>
                {plan.highlight && (
                  <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: '#fff', fontSize: '10px', fontWeight: 700, letterSpacing: '.1em', padding: '4px 14px', borderRadius: '20px' }}>
                    MOST POPULAR
                  </span>
                )}
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{plan.name}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 400, color: plan.highlight ? 'var(--primary)' : 'var(--text)', lineHeight: 1, marginBottom: '4px' }}>
                  {plan.price}<span style={{ fontSize: '14px', color: 'var(--text-hint)', fontFamily: 'var(--font-ui)' }}>{plan.period}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-mid)', marginBottom: '20px', lineHeight: 1.6 }}>{plan.desc}</p>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-sub)', marginBottom: '8px' }}>
                    <CheckCircle size={14} color="var(--success)" style={{ flexShrink: 0, marginTop: '1px' }} />
                    {f}
                  </div>
                ))}
                <Link href="/auth/register" style={{
                  display: 'block', marginTop: '24px',
                  background: plan.highlight ? 'var(--primary)' : 'var(--surface)',
                  color: plan.highlight ? '#fff' : 'var(--text-sub)',
                  border: plan.highlight ? 'none' : '1px solid var(--border)',
                  borderRadius: 'var(--r-md)', padding: '12px',
                  textAlign: 'center', fontSize: '13px', fontWeight: 500,
                  textDecoration: 'none',
                }}>
                  Get started
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div style={{ maxWidth: '700px', margin: '60px auto 0' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400, color: 'var(--text)', marginBottom: '24px', textAlign: 'center' }}>
              Frequently asked questions
            </h3>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ borderBottom: '1px solid var(--border)', padding: '18px 0' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>{faq.q}</span>
                  <span style={{ fontSize: '18px', color: 'var(--text-hint)', fontWeight: 300, marginLeft: '16px', flexShrink: 0 }}>{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <p style={{ fontSize: '13px', color: 'var(--text-mid)', lineHeight: 1.75, marginTop: '12px' }}>{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── CTA ── */}
      <section style={{ background: 'var(--bg)', padding: '60px 40px 80px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="cta-always-dark" style={{ borderRadius: 'var(--r-2xl)', padding: '80px 60px', textAlign: 'center' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: '14px' }}>START TODAY</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '44px', fontWeight: 400, color: '#FAFAF8', letterSpacing: '-.02em', marginBottom: '14px' }}>
              Start growing your design business today
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,.5)', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto 32px' }}>
              Free to list. No commission. Just a flat subscription and direct access to clients who want to work with you.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/auth/register" style={{
                background: 'var(--primary)', color: '#fff',
                padding: '14px 32px', borderRadius: 'var(--r-md)',
                fontSize: '14px', fontWeight: 500, textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(181,84,30,.4)',
              }}>
                List your studio free
              </Link>
              <Link href="/plans" style={{
                background: 'transparent', color: 'rgba(255,255,255,.5)',
                padding: '13px 28px', borderRadius: 'var(--r-md)',
                fontSize: '14px', border: '1px solid rgba(255,255,255,.15)',
                textDecoration: 'none',
              }}>
                View all plans
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
