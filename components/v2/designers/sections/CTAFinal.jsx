import Link from 'next/link';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';
import V2Button from '@/components/v2/ui/Button';

export default function CTAFinal() {
  return (
    <section style={{
      background: '#030712',
      padding: 'clamp(56px,8vw,96px) clamp(16px,4vw,36px)',
      display: 'flex', justifyContent: 'center',
    }}>
      <RevealOnScroll direction="up">
        <div style={{ maxWidth: '600px', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: 'var(--v2-font-display)',
            fontSize: 'clamp(28px,4.5vw,44px)', fontWeight: 400,
            color: '#F8F7F4', letterSpacing: '-0.02em', lineHeight: 1.2,
            marginBottom: '16px',
          }}>
            Ready to grow your <span style={{ color: '#3B82F6', fontStyle: 'italic' }}>studio?</span>
          </h2>
          <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.7, marginBottom: '32px' }}>
            Join 480+ verified designers already receiving leads through Intrafer. Profile review takes 24–48 hours. Leads start the moment you're approved.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/register">
              <V2Button variant="primary" size="lg">List your studio — free →</V2Button>
            </Link>
            <Link href="/contact">
              <V2Button variant="ghost" size="lg">Talk to our team</V2Button>
            </Link>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
