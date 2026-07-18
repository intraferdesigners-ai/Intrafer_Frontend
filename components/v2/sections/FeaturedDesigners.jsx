import Link from 'next/link';
import Image from 'next/image';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';
import V2SectionHeader from '@/components/v2/ui/SectionHeader';

export default function FeaturedDesigners({ vendors = [] }) {
  return (
    <section style={{ background: '#0F172A', padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,36px)' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
        <RevealOnScroll direction="up">
          <V2SectionHeader
            eyebrow="Featured designers"
            heading="Designers worth knowing about."
            dark
            action={{ label: 'View all 480+ designers', href: '/vendors' }}
          />
        </RevealOnScroll>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {vendors.map((v, i) => {
            const name = v.businessName || 'Design Studio';
            const city = v.location?.city || v.city || '';
            const rating = v.rating ?? null;
            const specializations = v.specializations || [];
            const cover = v.portfolioImages?.[0];
            const initial = name.charAt(0).toUpperCase();

            return (
              <RevealOnScroll key={v._id || name} direction="up" delay={i * 100}>
                <Link href={`/vendors/${v._id || ''}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: '#0A0F1E', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '14px', overflow: 'hidden',
                  }}>
                    <div style={{ position: 'relative', height: '120px' }}>
                      {cover && (
                        <Image src={cover} alt={name} fill style={{ objectFit: 'cover' }} sizes="33vw" />
                      )}
                      <div style={{
                        position: 'absolute', bottom: '-24px', left: '20px',
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: '#3B82F6', border: '3px solid #0A0F1E',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px', fontWeight: 700, color: '#F8F7F4',
                      }}>{initial}</div>
                    </div>
                    <div style={{ padding: '36px 20px 20px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#F8F7F4', marginBottom: '4px' }}>
                        {name}
                      </h3>
                      <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '10px' }}>{city}</p>
                      {rating != null && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '14px' }}>
                          <span style={{ color: '#3B82F6', fontSize: '13px' }}>★</span>
                          <span style={{ fontSize: '13px', color: '#CBD5E1', fontWeight: 500 }}>
                            {Number(rating).toFixed(1)}
                          </span>
                          {v.reviewCount != null && (
                            <span style={{ fontSize: '12px', color: '#475569' }}>({v.reviewCount})</span>
                          )}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
                        {specializations.map(tag => (
                          <span key={tag} style={{
                            fontSize: '11px', color: '#93C5FD',
                            background: 'rgba(59,130,246,0.12)',
                            padding: '4px 10px', borderRadius: '20px',
                          }}>{tag}</span>
                        ))}
                      </div>
                      <span style={{ fontSize: '13px', color: '#3B82F6', fontWeight: 500 }}>
                        View profile →
                      </span>
                    </div>
                  </div>
                </Link>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
