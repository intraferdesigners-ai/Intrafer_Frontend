import DesignerHero from '@/components/v2/designers/sections/Hero';
import SocialProof from '@/components/v2/designers/sections/SocialProof';
import WhyIntrafer from '@/components/v2/designers/sections/WhyIntrafer';
import DesignerHowItWorks from '@/components/v2/designers/sections/HowItWorks';
import Pricing from '@/components/v2/designers/sections/Pricing';
import DesignerTestimonials from '@/components/v2/designers/sections/Testimonials';
import DesignerFAQ from '@/components/v2/designers/sections/FAQ';
import CTAFinal from '@/components/v2/designers/sections/CTAFinal';

export const metadata = {
  title: 'List Your Interior Design Studio | Intrafer for Designers',
  description: 'Get 10 qualified leads per month. No commissions. Join 480+ verified designers on Intrafer.',
  openGraph: {
    title: 'List Your Interior Design Studio | Intrafer for Designers',
    description: 'Get 10 qualified leads per month. No commissions. Join 480+ verified designers on Intrafer.',
    url: 'https://intrafer.in/for-designers',
    siteName: 'Intrafer',
    type: 'website',
  },
};

export default function DesignersHomePage() {
  return (
    <div style={{ fontFamily: 'var(--v2-font-ui)' }}>
      <DesignerHero />
      <SocialProof />
      <WhyIntrafer />
      <DesignerHowItWorks />
      <Pricing />
      <DesignerTestimonials />
      <DesignerFAQ />
      <CTAFinal />
    </div>
  );
}
