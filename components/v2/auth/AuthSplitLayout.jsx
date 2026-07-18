import Link from 'next/link';
import Image from 'next/image';

export default function AuthSplitLayout({ left, children, minHeight = '100vh', homeHref = '/' }) {
  return (
    <div style={{
      minHeight,
      display: 'flex', flexWrap: 'wrap',
    }}>
      {/* Left — decorative dark panel */}
      <div style={{
        flex: '1 1 480px',
        background: '#0F172A',
        position: 'relative', overflow: 'hidden',
        padding: 'clamp(40px,6vw,64px)',
        display: 'flex', alignItems: 'center',
      }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 32px)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '440px' }}>
          {left}
        </div>
      </div>

      {/* Right — form panel */}
      <div style={{
        flex: '1 1 420px',
        background: '#F8F7F4',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(32px,6vw,64px) 24px',
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <Link href={homeHref} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '32px' }}>
            <div style={{
              width: '30px', height: '30px', background: '#0F172A', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            }}>
              <Image src="/images/logo/logo.png" alt="Intrafer" width={26} height={26} style={{ objectFit: 'contain' }} />
            </div>
            <span style={{
              fontFamily: 'var(--v2-font-display)', fontSize: '18px', fontWeight: 500,
              color: '#0F172A', letterSpacing: '-0.03em',
            }}>Intrafer</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
