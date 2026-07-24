import Link from 'next/link';
import LegalSection from '@/components/ui/LegalSection';

export const metadata = {
  title: 'Vendor Terms and Conditions',
  description: 'The terms and conditions governing interior designers listed on Intrafer.',
};

export default function VendorTermsPage() {
  return (
    <div style={{
      maxWidth: '720px', margin: '0 auto',
      padding: 'clamp(100px, 13vw, 140px) clamp(16px, 5vw, 40px) 80px',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{
          fontSize: '12px', fontWeight: 600,
          letterSpacing: '.1em', textTransform: 'uppercase',
          color: 'var(--primary)', marginBottom: '12px',
        }}>VENDOR LEGAL</div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 5vw, 42px)',
          fontWeight: 400, color: 'var(--text)',
          letterSpacing: '-.02em', marginBottom: '16px',
        }}>Vendor Terms and Conditions</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-hint)' }}>
          Last updated: July 2026 · Applies to interior designers listed on Intrafer
        </p>
        <div style={{ height: '1px', background: 'var(--border)', marginTop: '24px' }} />
      </div>

      <LegalSection title="1. Acceptance of terms">
        <p>These Vendor Terms and Conditions apply to any interior designer
        or design studio (&quot;Vendor&quot;, &quot;you&quot;) that registers
        a profile on Intrafer (intrafer.in). By creating a vendor account,
        listing your studio, or subscribing to a lead plan, you agree to be
        bound by these terms in addition to Intrafer&apos;s general Terms
        of Service.</p>
      </LegalSection>

      <LegalSection title="2. What Intrafer provides to vendors">
        <p style={{ marginBottom: '12px' }}>
          Intrafer is a marketplace platform that connects interior
          designers with homeowners. As a vendor, Intrafer provides:
        </p>
        <ul style={{ paddingLeft: '20px' }}>
          {[
            'A public profile and portfolio listing on the marketplace',
            'Access to OTP-verified homeowner enquiries matched to your city and specialization',
            'A dashboard to manage leads, projects, and reviews',
            'Subscription plans that determine your monthly lead allocation',
          ].map((item, i) => (
            <li key={i} style={{ marginBottom: '8px' }}>{item}</li>
          ))}
        </ul>
        <p style={{ marginTop: '12px' }}>
          <strong>Important:</strong> Intrafer is a marketplace, not your
          employer or business partner. We do not guarantee project volume,
          and we are not a party to any agreement you enter into with a
          homeowner.
        </p>
      </LegalSection>

      <LegalSection title="3. Your obligations as a listed designer">
        <ul style={{ paddingLeft: '20px' }}>
          {[
            'You must provide accurate information about your business and portfolio',
            'All portfolio images must be of projects you have actually completed',
            'You must respond to leads within the specified time period',
            'Subscription fees are non-refundable once a billing period has started',
            'Intrafer reserves the right to remove profiles that violate our standards',
            'You are responsible for delivering services as agreed with homeowners',
            'Any contracts, payments, or disputes arising from a project are directly between you and the homeowner — Intrafer is not involved',
          ].map((item, i) => (
            <li key={i} style={{ marginBottom: '8px' }}>{item}</li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="4. Prohibited activities">
        <p style={{ marginBottom: '12px' }}>As a vendor, you may not:</p>
        <ul style={{ paddingLeft: '20px' }}>
          {[
            'Use stock photos or other designers’ work as your own portfolio',
            'Misrepresent your qualifications, experience, or business credentials',
            'Submit fake or fraudulent leads or reviews',
            'Contact homeowners outside the platform to circumvent lead attribution',
            'Scrape, copy, or republish content or homeowner data from the platform',
            'Use the platform for any unlawful purpose',
          ].map((item, i) => (
            <li key={i} style={{ marginBottom: '8px' }}>{item}</li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="5. Payments and subscriptions">
        <p style={{ marginBottom: '12px' }}>
          Vendor subscription payments are processed securely via Razorpay.
          By subscribing to a plan:
        </p>
        <ul style={{ paddingLeft: '20px' }}>
          {[
            'You choose a 3, 6, or 12-month plan, each with a flat subscription fee and zero commission on your project revenue',
            'You authorize Razorpay to charge your selected payment method for the full plan amount',
            'Plans are prepaid in full for their term and do not auto-renew — you choose to resubscribe at the end of your term',
            'Payments are non-refundable once a term has started',
            'Lead credits do not carry over to the next billing period',
          ].map((item, i) => (
            <li key={i} style={{ marginBottom: '8px' }}>{item}</li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="6. Limitation of liability">
        <p>
          Intrafer provides a marketplace platform on an &quot;as is&quot;
          basis. We are not liable for any disputes, damages, or losses
          arising from interactions or contracts between you and homeowners.
          Our maximum liability to you is limited to the subscription fees
          you paid in the 3 months preceding any claim.
        </p>
      </LegalSection>

      <LegalSection title="7. Changes to these terms">
        <p>
          We may update these vendor terms from time to time. We will
          notify registered vendors of significant changes via email.
          Continued use of your vendor account after changes constitutes
          acceptance of the new terms.
        </p>
      </LegalSection>

      <LegalSection title="8. Governing law">
        <p>
          These terms are governed by the laws of India. Any disputes
          shall be resolved in the courts of Bangalore, Karnataka, India.
        </p>
      </LegalSection>

      <LegalSection title="9. Contact us">
        <p>For questions about these vendor terms:</p>
        <div style={{
          background: 'var(--bg-parchment)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          padding: '16px 20px', marginTop: '12px',
          fontSize: '14px', color: 'var(--text)', lineHeight: 1.8,
        }}>
          <strong>Intrafer</strong><br />
          Email:{' '}
          <a href="mailto:support@intrafer.in"
            style={{ color: 'var(--primary)' }}>
            support@intrafer.in
          </a><br />
          Website: intrafer.in
        </div>
      </LegalSection>

      <div style={{
        borderTop: '1px solid var(--border)',
        paddingTop: '24px', marginTop: '40px',
        display: 'flex', gap: '24px',
      }}>
        <Link href="/for-designers/privacy" style={{ color: 'var(--primary)', fontSize: '14px' }}>
          ← Vendor Privacy Policy
        </Link>
        <Link href="/for-designers" style={{ color: 'var(--primary)', fontSize: '14px' }}>
          Back to for designers →
        </Link>
      </div>
    </div>
  );
}
