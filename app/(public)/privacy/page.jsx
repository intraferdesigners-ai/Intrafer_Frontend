import Link from 'next/link';
import LegalSection from '@/components/ui/LegalSection';

export const metadata = {
  title: 'Privacy Policy',
  description: 'How Intrafer collects, uses and protects your personal data.',
};

export default function PrivacyPolicyPage() {
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
        }}>Privacy Policy</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-hint)' }}>
          Last updated: July 2026
        </p>
        <div style={{
          height: '1px', background: 'var(--border)',
          marginTop: '24px',
        }} />
      </div>

      <LegalSection title="1. Who we are">
        <p>Intrafer (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is an interior designer marketplace
        platform that connects homeowners with verified interior designers
        across India. Our platform is accessible at intrafer.in.</p>
      </LegalSection>

      <LegalSection title="2. Information we collect">
        <p style={{ marginBottom: '12px' }}>We collect the following types of information:</p>
        <p style={{ marginBottom: '8px' }}><strong>Information you provide:</strong></p>
        <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
          {[
            'Name, email address, and phone number when you register or submit an enquiry',
            'Business name, description, city, and portfolio images (for designers)',
            'Project requirements, budget, and location preferences (for homeowners)',
            'Messages and communications through our platform',
          ].map((item, i) => (
            <li key={i} style={{ marginBottom: '6px' }}>{item}</li>
          ))}
        </ul>
        <p style={{ marginBottom: '8px' }}><strong>Information collected automatically:</strong></p>
        <ul style={{ paddingLeft: '20px' }}>
          {[
            'Session data and browsing activity on our platform',
            'Device information and IP address',
            'Pages visited and features used',
          ].map((item, i) => (
            <li key={i} style={{ marginBottom: '6px' }}>{item}</li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="3. How we use your information">
        <ul style={{ paddingLeft: '20px' }}>
          {[
            'To connect homeowners with suitable interior designers',
            'To verify your identity via OTP during registration',
            'To send enquiry confirmations and status updates',
            'To process subscription payments (designers)',
            'To improve our platform and user experience',
            'To send relevant communications about your enquiries',
            'To prevent fraud and ensure platform security',
          ].map((item, i) => (
            <li key={i} style={{ marginBottom: '8px' }}>{item}</li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="4. How we protect your information">
        <p style={{ marginBottom: '12px' }}>
          We take data security seriously. Your contact details (phone number
          and email) are kept private and are only shared with a designer
          after they have actively accepted your lead.
        </p>
        <p>
          We use industry-standard encryption (SSL/TLS) for all data
          transmission and JWT-based authentication to protect your account.
          Passwords are encrypted using bcrypt and are never stored in
          plain text.
        </p>
      </LegalSection>

      <LegalSection title="5. Sharing your information">
        <p style={{ marginBottom: '12px' }}>
          We do not sell your personal information to third parties.
          We share your information only in these cases:
        </p>
        <ul style={{ paddingLeft: '20px' }}>
          {[
            'With interior designers — only after they accept your lead',
            'With payment processors (Razorpay) to process subscription payments',
            'With service providers who help us operate our platform',
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
            'Request deletion of your personal data',
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

      <LegalSection title="7. Cookies">
        <p>
          We use essential cookies to keep you logged in and remember
          your preferences. We do not use advertising or tracking cookies.
          You can disable cookies in your browser settings, but this may
          affect platform functionality.
        </p>
      </LegalSection>

      <LegalSection title="8. Data retention">
        <p>
          We retain your personal data for as long as your account is
          active or as needed to provide services. If you delete your
          account, we remove your personal data within 30 days, except
          where retention is required by law.
        </p>
      </LegalSection>

      <LegalSection title="9. Contact us">
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
        <Link href="/" style={{ color: 'var(--primary)', fontSize: '14px' }}>
          ← Back to home
        </Link>
        <Link href="/terms" style={{ color: 'var(--primary)', fontSize: '14px' }}>
          Terms of Service →
        </Link>
      </div>
    </div>
  );
}
