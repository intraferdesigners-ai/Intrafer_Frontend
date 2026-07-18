import Link from 'next/link';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';

const INITIALS = ['PN', 'RM', 'AK', 'SD', 'VJ'];

export default function SocialProof() {
  return (
    <section style={{
      background: '#0A0F1E',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '20px clamp(16px,4vw,36px)',
    }}>
      <RevealOnScroll direction="fade">
        <div style={{
          maxWidth: '1140px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '16px',
        }}>
          <span style={{ fontSize: '13px', color: '#94A3B8' }}>
            Trusted by 480+ verified designers across India
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex' }}>
              {INITIALS.map((initials, i) => (
                <div key={initials} style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: '#3B82F6', border: '2px solid #0A0F1E',
                  marginLeft: i === 0 ? 0 : '-8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700, color: '#F8F7F4',
                }}>{initials}</div>
              ))}
            </div>
            <Link href="/auth/register" style={{
              fontSize: '13px', color: '#3B82F6', textDecoration: 'none', fontWeight: 500,
            }}>
              Join them →
            </Link>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
