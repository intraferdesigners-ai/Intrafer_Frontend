import FaqPageClient from './FaqPageClient';

export const metadata = {
  title: 'Frequently Asked Questions | Intrafer',
  description: 'Everything homeowners and designers ask us about finding designers, leads, and pricing.',
  openGraph: {
    title: 'Frequently Asked Questions | Intrafer',
    description: 'Everything homeowners and designers ask us about finding designers, leads, and pricing.',
    url: 'https://intrafer.in/faq',
    siteName: 'Intrafer',
    type: 'website',
  },
};

export default function FAQPage() {
  return <FaqPageClient />;
}
