import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';
import V2SectionHeader from '@/components/v2/ui/SectionHeader';

const TESTIMONIALS = [
  {
    quote: "I spent 3 hours a week on Instagram to get 2 leads a month. Intrafer gave me 8 qualified leads in my first 30 days — all with real budgets.",
    author: 'Priya Nair',
    detail: 'Art Studio Interiors · Bangalore',
    metric: '₹24L in projects this quarter',
  },
  {
    quote: "The leads come with real budgets attached. I stopped wasting time on people who wanted a full 2BHK done for 2 lakhs. Now I only take calls that make sense.",
    author: 'Rahul Mehta',
    detail: 'Design Nest · Bangalore',
    metric: '4.8★ rating · 24 verified reviews',
  },
];

export default function DesignerTestimonials() {
  return (
    <section id="testimonials" style={{ background: '#020617', padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,36px)' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
        <RevealOnScroll direction="up">
          <V2SectionHeader
            eyebrow="Success stories"
            heading="Designers who made the switch."
            dark
            align="center"
          />
        </RevealOnScroll>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px',
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px', overflow: 'hidden',
        }}>
          {TESTIMONIALS.map((t, i) => (
            <RevealOnScroll key={t.author} direction="up" delay={i * 100}>
              <div style={{ background: '#0A0F1E', padding: '32px', height: '100%' }}>
                <p style={{
                  fontSize: '16px', color: '#CBD5E1', lineHeight: 1.75,
                  fontStyle: 'italic', marginBottom: '24px',
                }}>"{t.quote}"</p>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#F8F7F4', marginBottom: '2px' }}>
                  {t.author}
                </div>
                <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>{t.detail}</div>
                <span style={{
                  display: 'inline-block', fontSize: '12px', fontWeight: 600,
                  color: '#93C5FD', background: 'rgba(59,130,246,0.12)',
                  padding: '6px 14px', borderRadius: '20px',
                }}>{t.metric}</span>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
