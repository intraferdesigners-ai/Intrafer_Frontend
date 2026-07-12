import Link from 'next/link';
import TestimonialsGrid from './TestimonialsGrid';

export const metadata = {
  title: 'Testimonials | What Homeowners Say | Intrafer',
  description: 'Read verified reviews from homeowners who transformed their spaces with Intrafer designers.',
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

export default function TestimonialsPage() {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(80px,10vw,108px) clamp(16px,4vw,40px) 80px' }}>
      <p className="caps-label-primary" style={{ marginBottom: '10px' }}>VERIFIED REVIEWS</p>
      <h1 className="section-heading" style={{ marginBottom: '8px' }}>What homeowners say</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '36px', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '48px', color: 'var(--primary)', lineHeight: 1 }}>4.9★</span>
        <div>
          <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>134 verified reviews</p>
          <div style={{ fontSize: '20px', color: 'var(--primary)', letterSpacing: '3px' }}>★★★★★</div>
        </div>
      </div>

      <TestimonialsGrid testimonials={TESTIMONIALS} />

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <Link href="/vendors" style={{ display: 'inline-block', background: 'var(--primary)', color: '#fff', padding: '13px 32px', borderRadius: 'var(--r-md)', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>
          Find your designer →
        </Link>
      </div>
    </div>
  );
}
