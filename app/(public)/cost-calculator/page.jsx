import CostCalculatorClient from './CostCalculatorClient';

export const metadata = {
  title: 'Interior Design Cost Calculator India 2026 | Intrafer',
  description: 'Estimate your interior design project cost. Updated 2026 rates for all major Indian cities.',
  openGraph: {
    title: 'Interior Design Cost Calculator India 2026 | Intrafer',
    description: 'Estimate your interior design project cost. Updated 2026 rates for all major Indian cities.',
    url: 'https://intrafer.in/cost-calculator',
    siteName: 'Intrafer',
    type: 'website',
  },
};

export default function CostCalculatorPage() {
  return <CostCalculatorClient />;
}
