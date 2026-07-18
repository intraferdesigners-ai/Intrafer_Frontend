import Link from 'next/link';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';
import V2Button from '@/components/v2/ui/Button';

export default function CTA() {
  return (
    <section style={{ background: '#0F172A', padding: 'clamp(56px,8vw,96px) clamp(16px,4vw,36px)' }}>
      <div style={{
        maxWidth: '1140px', margin: '0 auto',
        display: 'flex', flexWrap: 'wrap', gap: '32px',
        alignItems: 'center', justifyContent: 'space-between',
      }}>
        <RevealOnScroll direction="left">
          <div style={{ maxWidth: '480px' }}>
            <h2 style={{
              fontFamily: 'var(--v2-font-display)',
              fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400,
              color: '#F8F7F4', letterSpacing: '-0.02em', lineHeight: 1.2,
              margin: '0 0 12px',
            }}>
              Your dream space is one enquiry <span style={{ color: '#3B82F6', fontStyle: 'italic' }}>away.</span>
            </h2>
            <p style={{ fontSize: '15px', color: '#94A3B8', lineHeight: 1.7 }}>
              Free to browse. Free to enquire. No commitment required.
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll direction="right" delay={100}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/vendors">
              <V2Button variant="primary" size="lg">Browse designers →</V2Button>
            </Link>
            <Link href="/designers">
              <V2Button variant="ghost" size="lg">List your studio</V2Button>
            </Link>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
