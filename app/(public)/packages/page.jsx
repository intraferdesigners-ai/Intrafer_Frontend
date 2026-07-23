import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, ShieldCheck, Clock, Wallet } from 'lucide-react';
import EMICalculator from '../../../components/ui/EMICalculator';
import Reveal from '../../../components/ui/Reveal';
import RevealItem from '../../../components/ui/RevealItem';

export const metadata = {
  title: 'Interior Design Packages — Fixed Price | Intrafer',
  description: 'Complete home interior packages at transparent fixed prices. Essential, Eleganza, and Eleganza Plus for 2–3 BHK homes.',
};

const PACKAGES = [
  {
    name: 'Essential',
    tagline: 'Perfect for functional homes',
    price: '₹8.85 Lakhs',
    discounted: '₹6.37 Lakhs',
    savings: '₹2.48 Lakhs',
    bhk: '2 BHK · 900–1100 sqft',
    emi: '₹17,700/month',
    emiTenure: '36 months',
    image: '/images/packages/essential.jpg',
    color: '#EDF4FF',
    popular: false,
    includes: [
      'Modular Kitchen (straight/L-shape)',
      'Living room furniture setup',
      'Master bedroom wardrobe',
      'False ceiling (living + master)',
      'Basic lighting plan',
      '2 bathroom vanity',
    ],
    excludes: ['Loose furniture', 'Curtains', 'Premium hardware upgrades'],
  },
  {
    name: 'Eleganza',
    tagline: 'For the discerning homeowner',
    price: '₹15.84 Lakhs',
    discounted: '₹11.41 Lakhs',
    savings: '₹4.43 Lakhs',
    bhk: '3 BHK · 1200–1600 sqft',
    emi: '₹31,700/month',
    emiTenure: '36 months',
    image: '/images/packages/premium.jpg',
    color: '#EFF6FF',
    popular: true,
    includes: [
      'All Essential inclusions',
      'Premium modular kitchen with island option',
      '2 bedroom wardrobes',
      'TV unit + crockery unit',
      'False ceiling all rooms',
      'Accent lighting + cove lighting',
      'Bathroom waterproofing + tile work',
      'Paint + texture walls',
    ],
    excludes: ['Imported materials', 'Branded hardware (can add-on)'],
  },
  {
    name: 'Eleganza Plus',
    tagline: 'Luxury without compromise',
    price: '₹24.03 Lakhs',
    discounted: '₹16.82 Lakhs',
    savings: '₹7.21 Lakhs',
    bhk: '3 BHK · 1200–1600 sqft with premium finishes',
    emi: '₹46,700/month',
    emiTenure: '36 months',
    image: '/images/packages/luxury.jpg',
    color: '#EFF4FF',
    popular: false,
    includes: [
      'All Eleganza inclusions',
      'Branded hardware (Häfele/Hettich)',
      'Premium tiles + stone countertops',
      'Custom joinery in all rooms',
      'Designer lighting fixtures',
      'Pooja unit',
      'Balcony treatment',
      'Dedicated site supervisor',
    ],
    excludes: ['Imported furniture', 'Artwork/accessories'],
  },
];

export default function PackagesPage() {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(80px,10vw,108px) clamp(16px,4vw,40px) 80px' }}>
      {/* Offer strip */}
      <Reveal>
        <div style={{
          background: 'linear-gradient(90deg, #1D4ED8, #3B82F6)',
          color: '#fff', padding: '16px', textAlign: 'center',
          borderRadius: '12px', marginBottom: '32px', fontSize: '14px', fontWeight: 500,
        }}>
          Save 30% off list price — up to ₹7 Lakhs on a complete home package
        </div>

        <p className="caps-label-primary" style={{ marginBottom: '10px' }}>INTERIOR PACKAGES</p>
        <h1 className="section-heading" style={{ marginBottom: '8px' }}>Complete home interiors at fixed prices</h1>
        <p style={{ fontSize: '15px', color: 'var(--text-mid)', marginBottom: '48px' }}>
          No surprises. No hidden costs. Complete transparency.
        </p>
      </Reveal>

      {/* Package cards */}
      {PACKAGES.map((pkg, i) => (
        <RevealItem
          key={pkg.name}
          index={i}
          style={{
            background: 'var(--surface)',
            border: `${pkg.popular ? '2px' : '1px'} solid ${pkg.popular ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: '20px', overflow: 'hidden',
            marginBottom: '20px', boxShadow: pkg.popular ? 'var(--shadow-md)' : 'var(--shadow-sm)',
          }}
          className="package-card-inner"
        >
          {/* Left — image */}
          <div className="package-card-image package-img-col" style={{ position: 'relative', minHeight: '220px' }}>
            <Image src={pkg.image} alt={pkg.name} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 100vw, 40vw" />
            {pkg.popular && (
              <div style={{
                position: 'absolute', top: '16px', left: '16px',
                background: 'var(--primary)', color: '#fff',
                fontSize: '10px', fontWeight: 700, letterSpacing: '.1em',
                padding: '5px 12px', borderRadius: '4px',
              }}>
                MOST POPULAR
              </div>
            )}
            <div style={{
              position: 'absolute', bottom: '16px', left: '16px',
              background: 'var(--primary)', color: '#fff',
              fontSize: '12px', fontWeight: 600,
              padding: '6px 14px', borderRadius: '6px',
            }}>
              Save {pkg.savings}
            </div>
          </div>

          {/* Right — content */}
          <div style={{ padding: '32px', flex: 1 }}>
            <p className="caps-label-primary" style={{ marginBottom: '4px' }}>{pkg.name}</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 400, color: 'var(--text)', marginBottom: '12px' }}>
              {pkg.tagline}
            </h2>

            {/* Price row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span style={{ textDecoration: 'line-through', fontSize: '16px', color: 'var(--text-hint)' }}>{pkg.price}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--text)', fontWeight: 400 }}>{pkg.discounted}</span>
              <span style={{ fontSize: '12px', background: 'var(--primary-bg)', color: 'var(--primary)', padding: '3px 10px', borderRadius: '20px', fontWeight: 600 }}>30% off</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-hint)', marginBottom: '4px' }}>{pkg.bhk}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-hint)', marginBottom: '20px' }}>EMI from {pkg.emi} for {pkg.emiTenure}</p>

            {/* Includes / Excludes */}
            <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>Includes</p>
                {pkg.includes.map((item) => (
                  <p key={item} style={{ fontSize: '12px', color: 'var(--text-sub)', marginBottom: '5px', display: 'flex', gap: '6px' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>✓</span>{item}
                  </p>
                ))}
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>Not included</p>
                {pkg.excludes.map((item) => (
                  <p key={item} style={{ fontSize: '12px', color: 'var(--text-hint)', marginBottom: '5px', display: 'flex', gap: '6px' }}>
                    <span>×</span>{item}
                  </p>
                ))}
              </div>
            </div>

            <Link href="/enquiry" style={{
              display: 'inline-block', background: 'var(--primary)', color: '#fff',
              padding: '11px 28px', borderRadius: 'var(--r-md)', fontSize: '13px',
              fontWeight: 500, textDecoration: 'none',
            }}>
              Book this package
            </Link>
          </div>
        </RevealItem>
      ))}

      {/* EMI Calculator */}
      <div style={{ marginTop: '60px', marginBottom: '48px' }}>
        <p className="caps-label-primary" style={{ marginBottom: '10px' }}>BUDGET PLANNER</p>
        <h2 className="section-heading" style={{ marginBottom: '32px' }}>Calculate your EMI</h2>
        <EMICalculator defaultAmount={1141000} />
      </div>

      {/* Trust badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '48px' }} className="grid-2col">
        {[
          { Icon: CheckCircle, title: 'Verified designers' },
          { Icon: ShieldCheck, title: '10-year warranty on structure' },
          { Icon: Clock,       title: 'On-time delivery' },
          { Icon: Wallet,      title: 'Fixed price guarantee' },
        ].map((b) => (
          <div key={b.title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'var(--primary-bg)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px',
            }}>
              <b.Icon size={20} color="var(--primary)" />
            </div>
            <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)' }}>{b.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
