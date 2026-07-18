import PlansPageClient from './PlansPageClient';

export const metadata = {
  title: 'Pricing Plans for Designers | Intrafer',
  description: 'Simple, transparent pricing for interior designers. One flat subscription, no commissions, ever.',
  openGraph: {
    title: 'Pricing Plans for Designers | Intrafer',
    description: 'Simple, transparent pricing for interior designers. One flat subscription, no commissions, ever.',
    url: 'https://intrafer.in/plans',
    siteName: 'Intrafer',
    type: 'website',
  },
};

export default function PlansPage() {
  return <PlansPageClient />;
}
