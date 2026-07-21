import Link from 'next/link';
import FaqContent from './FaqContent';

export const metadata = { title: 'Frequently Asked Questions | Intrafer' };

export const FAQ_GROUPS = [
  {
    category: 'GENERAL',
    items: [
      { q: 'What is Intrafer?', a: "Intrafer is an interior designer marketplace connecting homeowners with verified, trusted interior designers across major cities. Browse real portfolios, compare quotes, and find a designer suited to your home." },
      { q: 'Is it free to use as a homeowner?', a: 'Yes, completely free. Homeowners never pay to browse profiles, view portfolios, or submit enquiries. There are zero hidden charges for finding your designer.' },
      { q: 'How are designers verified?', a: 'Every designer on Intrafer is manually reviewed by our team. We verify their portfolio photos (no stock images), check references, and confirm business registration before listing them on the platform.' },
      { q: 'How quickly will I hear back?', a: 'Our designers commit to responding within 48 hours. In practice, most respond within a few hours. If a designer does not respond within 48 hours, we reassign your lead.' },
      { q: 'What cities are covered?', a: 'Currently Bangalore, Mumbai, Delhi, Hyderabad, Chennai, and Pune. We are expanding to more cities rapidly.' },
    ],
  },
  {
    category: 'ENQUIRY PROCESS',
    items: [
      { q: 'How do I submit an enquiry?', a: 'Browse designers on our platform, click "Get Quote" on any profile, fill in your project requirements, and verify with an OTP. It takes under 2 minutes.' },
      { q: 'What information do I need to provide?', a: 'Basic details: project type (kitchen, full home, etc.), approximate budget range, your city, and property type. The more detail you share, the better matched your designer will be.' },
      { q: 'Can I enquire to multiple designers?', a: 'Yes, you can submit separate enquiries to as many designers as you like. We recommend shortlisting 2–3 designers and comparing their proposals.' },
      { q: 'What happens after I submit?', a: 'Your enquiry goes to matched designers. When a designer accepts your lead, their contact details are revealed to you and your details are shared with them. You can then schedule a consultation.' },
      { q: 'Is my phone/email shared immediately?', a: 'No. Your contact details are private until a designer explicitly accepts your lead. This protects you from spam calls while ensuring serious designers can reach you.' },
    ],
  },
  {
    category: 'PRICING & COST',
    items: [
      { q: 'How much does interior design cost in Bangalore?', a: 'Typically ₹800–₹2,500 per sqft depending on material quality, design complexity, and scope. A 2BHK full home typically ranges from ₹6–18 lakhs. Use our cost calculator for a personalised estimate.' },
      { q: 'Do you offer EMI?', a: 'Many designers on Intrafer work with bank EMI options. Some also offer in-house payment plans. Use our EMI calculator to estimate monthly payments on any project budget.' },
      { q: 'Are your cost calculator estimates accurate?', a: 'Our estimates are indicative, typically accurate within ±15% of the final quote. Actual costs depend on material choices, site conditions, and specific design requirements. Always get a written quote.' },
      { q: 'Is there a consultation fee?', a: 'Initial consultations are free on Intrafer. Some designers may charge for detailed design presentations after the first meeting — this will be clearly communicated upfront.' },
      { q: 'How do I compare quotes?', a: 'Submit enquiries to 2–3 designers. When comparing quotes, ensure you are comparing the same scope — check what materials are included, payment terms, and timeline commitments.' },
    ],
  },
  {
    category: 'FOR DESIGNERS',
    items: [
      { q: 'How do I list my studio?', a: 'Register on Intrafer, complete your profile with portfolio photos and service details, and submit for verification. Our team reviews within 2–3 business days.' },
      { q: 'What are the subscription plans?', a: 'Plans run for 3, 6, or 12 months — ₹7,999, ₹14,999, and ₹19,999 respectively — all with upto 10 leads/month. Higher tiers add priority placement, an analytics dashboard, and a dedicated account manager rather than more leads. See our plans page for the full feature breakdown.' },
      { q: 'How many leads will I receive?', a: 'Lead volume depends on your city, plan tier, and how complete your profile is. Designers with full portfolios, good ratings, and quick response times receive significantly more leads.' },
      { q: 'What is the lead reveal process?', a: "When a homeowner submits an enquiry, you receive a notification with project details (but not their contact info). If you accept the lead, the homeowner's phone and email are instantly revealed so you can reach out." },
      { q: 'Can I cancel my subscription?', a: 'You can stop renewing at any time from your dashboard. Plans are prepaid for their full 3, 6, or 12-month term and are non-refundable, but your listing stays live for the term you’ve already paid for.' },
    ],
  },
];

export default function FAQPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '108px 32px 80px' }}>
      <p className="caps-label-primary" style={{ marginBottom: '10px' }}>HELP CENTER</p>
      <h1 className="section-heading" style={{ marginBottom: '8px' }}>Frequently Asked Questions</h1>
      <p style={{ fontSize: '15px', color: 'var(--text-mid)', marginBottom: '32px' }}>
        Everything you need to know about Intrafer.
      </p>

      <FaqContent groups={FAQ_GROUPS} />

      <div className="cta-always-dark" style={{ marginTop: '60px', borderRadius: 'var(--r-xl)', padding: '40px', textAlign: 'center' }}>
        <p style={{ fontSize: '18px', fontWeight: 500, color: '#FAFAF8', marginBottom: '8px' }}>Still have questions?</p>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,.5)', marginBottom: '20px' }}>Our team responds within 2 business hours.</p>
        <Link href="/contact" style={{ display: 'inline-block', background: 'var(--primary)', color: '#fff', padding: '11px 28px', borderRadius: 'var(--r-md)', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
          Contact us
        </Link>
      </div>
    </div>
  );
}
