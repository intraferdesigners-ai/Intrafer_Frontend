import { Target, EyeOff, MessageCircle, ChartLine, ShieldCheck, Star } from 'lucide-react';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';
import V2SectionHeader from '@/components/v2/ui/SectionHeader';

const ITEMS = [
  {
    Icon: Target,
    title: 'Qualified leads only',
    desc: 'Every lead has a verified budget, a real location, and a clear project scope. No tire-kickers.',
  },
  {
    Icon: EyeOff,
    title: 'You choose who to contact',
    desc: 'Review the full brief before accepting. Your contact details stay private until you decide to engage.',
  },
  {
    Icon: MessageCircle,
    title: 'WhatsApp alerts in real time',
    desc: "New leads hit your WhatsApp the moment they're assigned. Accept in one tap — even while you're on site.",
  },
  {
    Icon: ChartLine,
    title: 'Analytics that show what’s working',
    desc: 'Profile views, project click-through rates, conversion data. Know exactly which work attracts the right clients.',
  },
  {
    Icon: ShieldCheck,
    title: 'Verified badge builds instant trust',
    desc: 'Our approval process separates serious studios from the rest. Homeowners choose verified designers first.',
  },
  {
    Icon: Star,
    title: 'Reviews that compound over time',
    desc: 'Verified reviews from completed projects improve your search ranking automatically. Good work pays forward.',
  },
];

export default function WhyIntrafer() {
  return (
    <section style={{ background: '#020617', padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,36px)' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
        <RevealOnScroll direction="up">
          <V2SectionHeader
            eyebrow="Why designers choose Intrafer"
            heading="The business side of design, handled for you."
            dark
            align="center"
          />
        </RevealOnScroll>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px',
        }}>
          {ITEMS.map((item, i) => (
            <RevealOnScroll key={item.title} direction="up" delay={(i % 3) * 100}>
              <div style={{
                background: '#0A0F1E', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px', padding: '24px',
                height: '100%',
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px',
                  background: '#0A0F1E', border: '1px solid rgba(59,130,246,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '18px',
                }}>
                  <item.Icon size={20} color="#3B82F6" strokeWidth={1.75} />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#F8F7F4', marginBottom: '8px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.7 }}>
                  {item.desc}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
