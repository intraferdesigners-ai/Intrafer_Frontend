import Link from 'next/link';
import LegalSection from '@/components/ui/LegalSection';

export const metadata = {
  title: 'Terms of Service',
  description: 'The terms and conditions governing your use of Intrafer.',
};

export default function TermsOfServicePage() {
  return (
    <div style={{
      maxWidth: '720px', margin: '0 auto',
      padding: 'clamp(80px, 12vw, 120px) clamp(16px, 5vw, 40px) 80px',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{
          fontSize: '12px', fontWeight: 600,
          letterSpacing: '.1em', textTransform: 'uppercase',
          color: 'var(--primary)', marginBottom: '12px',
        }}>LEGAL</div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 5vw, 42px)',
          fontWeight: 400, color: 'var(--text)',
          letterSpacing: '-.02em', marginBottom: '16px',
        }}>Terms of Service</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-hint)' }}>
          Last updated: July 2026
        </p>
        <div style={{ height: '1px', background: 'var(--border)', marginTop: '24px' }} />
      </div>

      <LegalSection title="1. Acceptance of terms">
        <p>By accessing or using Intrafer (intrafer.in), you agree to be
        bound by these Terms of Service. If you do not agree to these
        terms, please do not use our platform.</p>
      </LegalSection>

      <LegalSection title="2. What Intrafer provides">
        <p style={{ marginBottom: '12px' }}>
          Intrafer is a marketplace platform that connects homeowners
          with interior designers. We provide:
        </p>
        <ul style={{ paddingLeft: '20px' }}>
          {[
            'A listing and discovery platform for verified interior designers',
            'An enquiry management system for homeowners and designers',
            'Tools for designers to showcase their portfolio and manage leads',
            'Subscription plans for designers to receive qualified leads',
          ].map((item, i) => (
            <li key={i} style={{ marginBottom: '8px' }}>{item}</li>
          ))}
        </ul>
        <p style={{ marginTop: '12px' }}>
          <strong>Important:</strong> Intrafer is a marketplace, not a
          design service provider. We do not employ interior designers
          and are not responsible for the quality of work delivered by
          designers listed on our platform.
        </p>
      </LegalSection>

      <LegalSection title="3. For homeowners">
        <ul style={{ paddingLeft: '20px' }}>
          {[
            'Using Intrafer to find and contact designers is completely free',
            'You must provide accurate information when submitting enquiries',
            'Your contact details are only shared with designers who accept your lead',
            'Intrafer is not a party to any agreement between you and a designer',
            'Any contracts, payments, or disputes are directly between you and the designer',
          ].map((item, i) => (
            <li key={i} style={{ marginBottom: '8px' }}>{item}</li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="4. For interior designers">
        <ul style={{ paddingLeft: '20px' }}>
          {[
            'You must provide accurate information about your business and portfolio',
            'All portfolio images must be of projects you have actually completed',
            'You must respond to leads within the specified time period',
            'Subscription fees are non-refundable once a billing period has started',
            'Intrafer reserves the right to remove profiles that violate our standards',
            'You are responsible for delivering services as agreed with homeowners',
          ].map((item, i) => (
            <li key={i} style={{ marginBottom: '8px' }}>{item}</li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="5. Prohibited activities">
        <p style={{ marginBottom: '12px' }}>You may not:</p>
        <ul style={{ paddingLeft: '20px' }}>
          {[
            'Submit fake or fraudulent enquiries',
            'Use stock photos as your own portfolio work',
            'Misrepresent your qualifications or experience',
            'Contact other users outside the platform to circumvent our systems',
            'Scrape, copy, or republish content from our platform',
            'Use our platform for any unlawful purpose',
          ].map((item, i) => (
            <li key={i} style={{ marginBottom: '8px' }}>{item}</li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="6. Payments and subscriptions">
        <p style={{ marginBottom: '12px' }}>
          Designer subscription payments are processed securely via
          Razorpay. By subscribing:
        </p>
        <ul style={{ paddingLeft: '20px' }}>
          {[
            'You authorize Razorpay to charge your selected payment method',
            'Plans are prepaid in full for their 3, 6, or 12-month term and do not auto-renew — you choose to resubscribe at the end of your term',
            'Payments are non-refundable once a term has started',
            'Lead credits do not carry over to the next billing period',
          ].map((item, i) => (
            <li key={i} style={{ marginBottom: '8px' }}>{item}</li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="7. Limitation of liability">
        <p>
          Intrafer provides a marketplace platform on an &quot;as is&quot; basis.
          We are not liable for any disputes, damages, or losses arising
          from interactions between homeowners and designers. Our maximum
          liability to you is limited to the subscription fees paid in
          the 3 months preceding any claim.
        </p>
      </LegalSection>

      <LegalSection title="8. Changes to these terms">
        <p>
          We may update these terms from time to time. We will notify
          registered users of significant changes via email. Continued
          use of the platform after changes constitutes acceptance of
          the new terms.
        </p>
      </LegalSection>

      <LegalSection title="9. Governing law">
        <p>
          These terms are governed by the laws of India. Any disputes
          shall be resolved in the courts of Bangalore, Karnataka, India.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact us">
        <p>For questions about these terms:</p>
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
        <Link href="/privacy" style={{ color: 'var(--primary)', fontSize: '14px' }}>
          ← Privacy Policy
        </Link>
        <Link href="/" style={{ color: 'var(--primary)', fontSize: '14px' }}>
          Back to home →
        </Link>
      </div>
    </div>
  );
}
