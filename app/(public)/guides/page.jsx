import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Interior Design Guides | Room-by-Room Expertise | Intrafer',
  description: 'Free interior design guides for every room. Kitchen, bedroom, living room, bathroom, and more.',
};

const GUIDES = [
  { slug:'modular-kitchen', title:'The Complete Modular Kitchen Guide', category:'Kitchen', readTime:'8 min', image:'/images/guides/kitchen-guide.jpg', desc:'Everything about kitchen layouts, materials, hardware, and costs.' },
  { slug:'bedroom-design', title:'Bedroom Design Checklist for Indian Homes', category:'Bedroom', readTime:'6 min', image:'/images/guides/bedroom-guide.jpg', desc:'Wardrobe design, lighting, colour palette, and space planning for bedrooms.' },
  { slug:'living-room-design', title:'Living Room Interior Design Checklist', category:'Living Room', readTime:'5 min', image:'/images/guides/living-room-guide.jpg', desc:'Sofa placement, lighting tiers, TV unit, and making small spaces feel large.' },
  { slug:'bathroom-design', title:'Bathroom Interior Design Checklist', category:'Bathroom', readTime:'4 min', image:'/images/guides/bathroom-guide.jpg', desc:'Fixtures, tiles, vanity design, and wet vs dry zone planning.' },
  { slug:'dining-room-design', title:'Dining Room Design Ideas for Indian Homes', category:'Dining', readTime:'4 min', image:'/images/guides/dining-guide.jpg', desc:'Table sizes, lighting, and crockery unit designs for Indian dining rooms.' },
  { slug:'kids-bedroom-design', title:'Kids Bedroom Design Ideas & Safety Tips', category:'Kids Room', readTime:'5 min', image:'/images/guides/kids-room-guide.jpg', desc:'Safe, fun, and functional kids room designs that grow with your child.' },
  { slug:'study-room-design', title:'Study Room Interior Design Ideas', category:'Study Room', readTime:'4 min', image:'/images/guides/study-room-guide.jpg', desc:'Ergonomic study setups, lighting, and storage for home offices and study rooms.' },
  { slug:'balcony-design', title:'How to Design Your Balcony', category:'Balcony', readTime:'3 min', image:'/images/guides/balcony-guide.jpg', desc:'Transform your balcony into a green retreat or an outdoor lounge.' },
];

export default function GuidesPage() {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '108px clamp(16px,4vw,40px) 80px' }}>
      <p className="caps-label-primary" style={{ marginBottom: '10px' }}>DESIGN GUIDES</p>
      <h1 className="section-heading" style={{ marginBottom: '8px' }}>Room-by-room design expertise</h1>
      <p style={{ fontSize: '15px', color: 'var(--text-mid)', marginBottom: '48px' }}>
        Free guides written by interior design professionals.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 160px), 1fr))', gap: '16px' }}>
        {GUIDES.map((guide) => (
          <Link key={guide.slug} href={`/guides/${guide.slug}`} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '14px', overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
            }} className="card-hover">
              <div style={{ position: 'relative', height: '160px' }}>
                <Image src={guide.image} alt={guide.title} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 50vw, 25vw" />
              </div>
              <div style={{ padding: '14px' }}>
                <span style={{
                  fontSize: '10px', fontWeight: 600, letterSpacing: '.08em',
                  background: 'var(--primary-bg)', color: 'var(--primary)',
                  padding: '3px 8px', borderRadius: '20px', textTransform: 'uppercase',
                  display: 'inline-block', marginBottom: '8px',
                }}>
                  {guide.category}
                </span>
                <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', lineHeight: 1.4, marginBottom: '6px' }}>
                  {guide.title}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-mid)', lineHeight: 1.5, marginBottom: '8px' }}>
                  {guide.desc}
                </p>
                <span style={{ fontSize: '11px', color: 'var(--text-hint)' }}>{guide.readTime} read</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: '60px', background: 'var(--primary-bg)', border: '1px solid var(--primary-light)', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
        <p style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Ready to start your project?</p>
        <p style={{ fontSize: '13px', color: 'var(--text-mid)', marginBottom: '20px' }}>Find a verified designer who specialises in your room type.</p>
        <Link href="/vendors" style={{
          display: 'inline-block', background: 'var(--primary)', color: '#fff',
          padding: '11px 28px', borderRadius: 'var(--r-md)', fontSize: '13px',
          fontWeight: 500, textDecoration: 'none',
        }}>
          Find designers →
        </Link>
      </div>
    </div>
  );
}
