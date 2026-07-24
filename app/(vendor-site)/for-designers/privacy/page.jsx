import Link from 'next/link';
import LegalSection from '@/components/ui/LegalSection';

export const metadata = {
  title: 'Vendor Privacy Policy',
  description: 'How Intrafer collects, uses and protects data for interior designers listed on the platform.',
};

export default function VendorPrivacyPolicyPage() {
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
        }}>Vendor Privacy Policy</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-hint)' }}>
          Last updated: July 2026 · Applies to interior designers listed on Intrafer
        </p>
        <div style={{
          height: '1px', background: 'var(--border)',
          marginTop: '24px',
        }} />
      </div>

      <LegalSection title="1. Who we are">
        <p>Intrafer (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is an interior designer
        marketplace platform that connects homeowners with verified
        interior designers across India, accessible at intrafer.in. This
        policy explains how we handle the data of vendors (designers and
        design studios) listed on our platform.</p>
      </LegalSection>

      <LegalSection title="2. Information we collect from vendors">
        <p style={{ marginBottom: '8px' }}><strong>Information you provide:</strong></p>
        <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
          {[
            'Business name, contact name, email address, and phone number when you register',
            'Business description, city, service areas, and specializations',
            'Portfolio images and project details you upload to your profile',
            'Payment and billing details processed when you purchase a subscription plan',
            'Messages and communications with homeowners through our platform',
          ].map((item, i) => (
            <li key={i} style={{ marginBottom: '6px' }}>{item}</li>
          ))}
        </ul>
        <p style={{ marginBottom: '8px' }}><strong>Information collected automatically:</strong></p>
        <ul style={{ paddingLeft: '20px' }}>
          {[
            'Session data and dashboard activity on our platform',
            'Device information and IP address',
            'Lead response times and conversion activity',
          ].map((item, i) => (
            <li key={i} style={{ marginBottom: '6px' }}>{item}</li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="3. How we use vendor information">
        <ul style={{ paddingLeft: '20px' }}>
          {[
            'To publish and maintain your public profile and portfolio listing',
            'To match OTP-verified homeowner enquiries to your city and specialization',
            'To verify your identity and business credentials',
            'To process your subscription payments via Razorpay',
            'To send lead notifications, billing updates, and account communications',
            'To improve our platform and matching quality',
            'To prevent fraud and ensure platform security',
          ].map((item, i) => (
            <li key={i} style={{ marginBottom: '8px' }}>{item}</li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="4. How we protect your information">
        <p style={{ marginBottom: '12px' }}>
          Your business name, portfolio, and public profile details are
          displayed publicly on the marketplace by design, so that
          homeowners can discover and evaluate your studio. Billing and
          payment details are handled directly by Razorpay and are not
          stored on our servers.
        </p>
        <p>
          We use industry-standard encryption (SSL/TLS) for all data
          transmission and JWT-based authentication to protect your vendor
          account. Passwords are encrypted using bcrypt and are never
          stored in plain text.
        </p>
      </LegalSection>

      <LegalSection title="5. Sharing your information">
        <p style={{ marginBottom: '12px' }}>
          We do not sell your personal or business information to third
          parties. We share vendor information only in these cases:
        </p>
        <ul style={{ paddingLeft: '20px' }}>
          {[
            'Your public profile, portfolio, and reviews — visible to all homeowners browsing the marketplace',
            'With payment processors (Razorpay) to process your subscription payments',
            'With service providers who help us operate the platform',
            'When required by law or to protect our legal rights',
          ].map((item, i) => (
            <li key={i} style={{ marginBottom: '8px' }}>{item}</li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="6. Your rights (India DPDP Act 2023)">
        <p style={{ marginBottom: '12px' }}>
          Under India&apos;s Digital Personal Data Protection Act 2023, you have
          the right to:
        </p>
        <ul style={{ paddingLeft: '20px' }}>
          {[
            'Access the personal data we hold about you',
            'Correct inaccurate or incomplete personal data',
            'Request deletion of your personal data, subject to our billing and legal record-keeping obligations',
            'Withdraw consent for data processing',
            'Nominate another person to exercise rights on your behalf',
          ].map((item, i) => (
            <li key={i} style={{ marginBottom: '8px' }}>{item}</li>
          ))}
        </ul>
        <p style={{ marginTop: '12px' }}>
          To exercise any of these rights, contact us at{' '}
          <a href="mailto:support@intrafer.in"
            style={{ color: 'var(--primary)' }}>
            support@intrafer.in
          </a>
        </p>
      </LegalSection>

      <LegalSection title="7. Data retention">
        <p>
          We retain your vendor account and portfolio data for as long as
          your account is active, and billing records for as long as
          required for tax and accounting purposes. If you close your
          vendor account, we remove your public profile and personal data
          within 30 days, except where retention is required by law.
        </p>
      </LegalSection>

      <LegalSection title="8. Contact us">
        <p>
          For privacy-related questions or to exercise your rights,
          contact us at:
        </p>
        <div style={{
          background: 'var(--bg-parchment)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          padding: '16px 20px',
          marginTop: '12px',
          fontSize: '14px',
          color: 'var(--text)',
          lineHeight: 1.8,
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

      {/* Back link */}
      <div style={{
        borderTop: '1px solid var(--border)',
        paddingTop: '24px', marginTop: '40px',
        display: 'flex', gap: '24px',
      }}>
        <Link href="/for-designers" style={{ color: 'var(--primary)', fontSize: '14px' }}>
          ← Back to for designers
        </Link>
        <Link href="/for-designers/terms" style={{ color: 'var(--primary)', fontSize: '14px' }}>
          Vendor Terms →
        </Link>
      </div>
    </div>
  );
}
