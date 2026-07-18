import { IMAGES } from '@/lib/images';
import Hero from '@/components/v2/sections/Hero';
import Stats from '@/components/v2/sections/Stats';
import HowItWorks from '@/components/v2/sections/HowItWorks';
import FeaturedDesigners from '@/components/v2/sections/FeaturedDesigners';
import BeforeAfter from '@/components/v2/sections/BeforeAfter';
import BrowseByRoom from '@/components/v2/sections/BrowseByRoom';
import Testimonials from '@/components/v2/sections/Testimonials';
import EMICalculatorSection from '@/components/v2/sections/EMICalculatorSection';
import CTA from '@/components/v2/sections/CTA';

export const metadata = {
  title: 'Find Verified Interior Designers in India | Intrafer',
  description: 'Browse 480+ verified interior designers across India. Real portfolios, honest reviews, free quotes. No cold calls, no spam.',
  openGraph: {
    title: 'Find Verified Interior Designers in India | Intrafer',
    description: 'Browse 480+ verified interior designers across India. Real portfolios, honest reviews, free quotes. No cold calls, no spam.',
    url: 'https://intrafer.in/',
    siteName: 'Intrafer',
    type: 'website',
  },
};

const FEATURED_FALLBACK = [
  { _id: 'f1', businessName: 'Priya Design Studio', location: { city: 'Bangalore' }, specializations: ['Residential', 'Modular Kitchen'], rating: 4.9, reviewCount: 42, portfolioImages: [IMAGES.vendors.studio1.cover] },
  { _id: 'f2', businessName: 'The Aesthetic Co.',   location: { city: 'Mumbai' },    specializations: ['Living Room', 'Full Home'],      rating: 4.7, reviewCount: 28, portfolioImages: [IMAGES.vendors.studio2.cover] },
  { _id: 'f3', businessName: 'Luxe Interiors',      location: { city: 'Delhi NCR' }, specializations: ['Luxury', 'Commercial'],          rating: 4.8, reviewCount: 67, portfolioImages: [IMAGES.vendors.studio3.cover] },
];

async function fetchFeaturedVendors() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/vendors?featured=true&limit=3`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const json = await res.json();
    const list = json.data?.vendors || json.vendors || json;
    return Array.isArray(list) && list.length > 0 ? list : [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const apiVendors = await fetchFeaturedVendors();
  const vendors = apiVendors.length > 0 ? apiVendors : FEATURED_FALLBACK;

  return (
    <div style={{ fontFamily: 'var(--v2-font-ui)' }}>
      <Hero />
      <Stats />
      <HowItWorks />
      <FeaturedDesigners vendors={vendors} />
      <BeforeAfter />
      <BrowseByRoom />
      <Testimonials />
      <EMICalculatorSection />
      <CTA />
    </div>
  );
}
