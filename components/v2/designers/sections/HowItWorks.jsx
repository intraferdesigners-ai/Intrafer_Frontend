import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';
import V2SectionHeader from '@/components/v2/ui/SectionHeader';

const STEPS = [
  { num: '01', title: 'Register your studio',   desc: 'Free to sign up. Takes 3 minutes.' },
  { num: '02', title: 'Complete your profile',  desc: 'Add your real portfolio and set your city.' },
  { num: '03', title: 'Get approved in 24-48 hrs', desc: 'Our team reviews your portfolio.' },
  { num: '04', title: 'Receive leads immediately', desc: 'Leads assigned to your city and budget.' },
];

export default function DesignerHowItWorks() {
  return (
    <section id="how-it-works" style={{ background: '#0A0F1E', padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,36px)' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
        <RevealOnScroll direction="up">
          <V2SectionHeader
            eyebrow="Getting started"
            heading="From registration to first lead in 48 hours."
            dark
            align="center"
          />
        </RevealOnScroll>
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          gap: '8px', flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {STEPS.map((step, i) => (
            <div key={step.num} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <RevealOnScroll direction="up" delay={i * 100}>
                <div style={{ width: '220px', textAlign: 'left' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: '#0F172A', border: '1px solid rgba(59,130,246,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 700, color: '#3B82F6',
                    marginBottom: '16px',
                  }}>{step.num}</div>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#F8F7F4', marginBottom: '8px' }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.65 }}>
                    {step.desc}
                  </p>
                </div>
              </RevealOnScroll>
              {i < STEPS.length - 1 && (
                <span style={{
                  fontSize: '18px', color: '#334155',
                  marginTop: '8px', flexShrink: 0,
                }}>→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
