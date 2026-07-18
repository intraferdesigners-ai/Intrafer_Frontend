import Image from 'next/image';
import Link from 'next/link';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';
import V2Button from '@/components/v2/ui/Button';
import TestimonialsGrid from './TestimonialsGrid';

export const metadata = {
  title: 'Homeowner Reviews | Intrafer',
  description: 'Read real reviews from homeowners who found their interior designer through Intrafer.',
  openGraph: {
    title: 'Homeowner Reviews | Intrafer',
    description: 'Read real reviews from homeowners who found their interior designer through Intrafer.',
    url: 'https://intrafer.in/testimonials',
    siteName: 'Intrafer',
    type: 'website',
  },
};

const TESTIMONIALS = [
  { name:'Rahul Sharma', city:'Bangalore', project:'3BHK Residential', designer:'Art Studio Interiors', rating:5, text:'Intrafer connected me with Priya from Art Studio Interiors. Our 3BHK in Whitefield was completely transformed in just 45 days — on time, on budget, and beyond expectations.', avatar:'/images/testimonials/r1.jpg', completedMonth:'March 2026', category:'Full Home' },
  { name:'Anjali Menon', city:'Bangalore', project:'Modular Kitchen', designer:'Kitchen Kulture', rating:5, text:'I had tried 3 kitchen companies before finding Kitchen Kulture through Intrafer. Vikram and his team designed our L-shaped kitchen with island perfectly. The Häfele hardware is exceptional.', avatar:'/images/testimonials/r2.jpg', completedMonth:'April 2026', category:'Kitchen' },
  { name:'Deepak Nair', city:'Bangalore', project:'Luxury Villa', designer:'Luxe Spaces', rating:5, text:'For our 4500 sqft villa in Sarjapur, we needed someone exceptional. Sneha from Luxe Spaces delivered a penthouse-quality finish. The Italian marble work is stunning.', avatar:'/images/testimonials/r3.jpg', completedMonth:'February 2026', category:'Full Home' },
  { name:'Preethi Rao', city:'Bangalore', project:'1BHK Compact', designer:'Urban Canvas', rating:5, text:'Arun transformed our 550 sqft 1BHK into what feels like a 900 sqft apartment. The murphy bed and hidden storage are ingenious. Best space-saving design I have seen.', avatar:'/images/testimonials/r4.jpg', completedMonth:'May 2026', category:'Full Home' },
  { name:'Suresh Iyer', city:'Bangalore', project:'Scandinavian 2BHK', designer:'Design Nest', rating:5, text:'Rahul from Design Nest understood our Scandinavian vision immediately. The white oak flooring, linen upholstery, and minimal aesthetic is exactly what we wanted.', avatar:'/images/testimonials/r5.jpg', completedMonth:'January 2026', category:'Full Home' },
  { name:'Kavitha Krishnan', city:'Bangalore', project:'Sustainable Home', designer:'Eco Home Decor', rating:5, text:'Divya helped us create a biophilic home that is both beautiful and sustainable. The living wall in our living room is a conversation starter every time guests visit.', avatar:'/images/testimonials/r6.jpg', completedMonth:'March 2026', category:'Full Home' },
  { name:'Manish Gupta', city:'Bangalore', project:'Office Interior', designer:'Office Craft', rating:5, text:'Our startup needed an office that reflected our brand. Meera from Office Craft delivered a 5000 sqft space that our team absolutely loves coming to every day.', avatar:'/images/testimonials/r1.jpg', completedMonth:'April 2026', category:'Office' },
  { name:'Sunita Reddy', city:'Bangalore', project:'Traditional 4BHK', designer:'Vaastu Home Design', rating:5, text:'Karthik designed our home with both Vaastu principles and modern aesthetics. The teak wood work and brass fixtures give it an authentic heritage feel.', avatar:'/images/testimonials/r2.jpg', completedMonth:'December 2025', category:'Full Home' },
  { name:'Arjun Patel', city:'Bangalore', project:'Luxury Kitchen', designer:'Kitchen Kulture', rating:5, text:'Our chef kitchen with the U-shaped layout and 6-burner hob is now the heart of our home. The Häfele pull-outs and Blum hinges make every interaction a pleasure.', avatar:'/images/testimonials/r3.jpg', completedMonth:'May 2026', category:'Kitchen' },
  { name:'Meena Joshi', city:'Bangalore', project:'Master Bedroom', designer:'Design Nest', rating:5, text:'The walk-in wardrobe that Rahul designed for our master bedroom is extraordinary. Custom lit shelving, his-and-hers sections, and a vanity area. Absolute luxury.', avatar:'/images/testimonials/r4.jpg', completedMonth:'February 2026', category:'Bedroom' },
  { name:'Ravi Kumar', city:'Bangalore', project:'Bohemian Living Room', designer:'Eco Home Decor', rating:5, text:'We wanted a bohemian aesthetic that still felt curated, not cluttered. Divya nailed it — the macramé wall art, terracotta pots, and vintage textiles are perfect.', avatar:'/images/testimonials/r5.jpg', completedMonth:'March 2026', category:'Living Room' },
  { name:'Pooja Singh', city:'Bangalore', project:'Penthouse Interior', designer:'Luxe Spaces', rating:4, text:'Working with Luxe Spaces was an experience in itself. The Italian furniture sourcing took time but the end result — a penthouse that looks straight out of Architectural Digest.', avatar:'/images/testimonials/r6.jpg', completedMonth:'January 2026', category:'Full Home' },
];

const FEATURED = TESTIMONIALS.slice(0, 3);
const REST = TESTIMONIALS.slice(3);

export default function TestimonialsPage() {
  return (
    <div style={{ fontFamily: 'var(--v2-font-ui)' }}>
      {/* Hero */}
      <section style={{ background: '#0F172A', padding: 'clamp(64px,9vw,96px) clamp(16px,4vw,36px) clamp(48px,6vw,64px)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <RevealOnScroll direction="up">
            <p className="v2-eyebrow" style={{ marginBottom: '16px' }}>Verified reviews</p>
            <h1 className="v2-h1" style={{ color: '#F8F7F4', marginBottom: '16px' }}>
              What homeowners say about Intrafer
            </h1>
            <p style={{ fontSize: '16px', color: '#94A3B8', lineHeight: 1.7 }}>
              Real reviews from verified completed projects. We never delete honest feedback.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Featured */}
      <section style={{ background: '#F8F7F4', padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,36px)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <p className="v2-eyebrow" style={{ marginBottom: '12px' }}>Featured</p>
          <h2 className="v2-h3" style={{ color: '#0F172A', marginBottom: '28px' }}>Stories from real homeowners</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }} className="grid-mobile-1">
            {FEATURED.map((t, i) => (
              <RevealOnScroll key={t.name} direction="up" delay={i * 100}>
                <div className="v2-card" style={{ padding: '28px', height: '100%' }}>
                  <span style={{ color: '#3B82F6', fontSize: '16px', letterSpacing: '2px' }}>
                    {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
                  </span>
                  <p style={{
                    fontFamily: 'var(--v2-font-display)', fontStyle: 'italic',
                    fontSize: '18px', color: '#0F172A', lineHeight: 1.6, margin: '16px 0 20px',
                  }}>
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ position: 'relative', width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#DBEAFE' }}>
                      <Image src={t.avatar} alt={t.name} fill style={{ objectFit: 'cover' }} sizes="44px" />
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', margin: 0 }}>{t.name}</p>
                      <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>{t.city} · {t.project}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', background: 'rgba(59,130,246,0.08)', color: '#3B82F6', padding: '3px 8px', borderRadius: '20px', fontWeight: 500 }}>
                    by {t.designer}
                  </span>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section style={{ background: '#F1F5F9', padding: 'clamp(48px,7vw,72px) clamp(16px,4vw,36px)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <p className="v2-eyebrow" style={{ marginBottom: '12px' }}>More reviews</p>
          <h2 className="v2-h3" style={{ color: '#0F172A', marginBottom: '28px' }}>From every corner of India</h2>
          <TestimonialsGrid testimonials={REST} />
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: '#0F172A', padding: 'clamp(48px,7vw,72px) clamp(16px,4vw,36px)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }} className="stats-grid-3">
          {[
            { value: '4.9★', label: 'Average rating' },
            { value: '2,400+', label: 'Reviews' },
            { value: '100%', label: 'Verified' },
          ].map((s, i) => (
            <RevealOnScroll key={s.label} direction="up" delay={i * 100}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--v2-font-display)', fontSize: 'clamp(28px,3.5vw,36px)', fontWeight: 500, color: '#F8F7F4', marginBottom: '6px' }}>{s.value}</div>
                <div style={{ fontSize: '13px', color: '#94A3B8' }}>{s.label}</div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#F8F7F4', padding: 'clamp(48px,7vw,64px) clamp(16px,4vw,36px)', textAlign: 'center' }}>
        <Link href="/vendors">
          <V2Button variant="primary" size="lg">Find your designer →</V2Button>
        </Link>
      </section>
    </div>
  );
}
