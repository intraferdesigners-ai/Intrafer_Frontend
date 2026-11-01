import Link from 'next/link';
import FaqContent from './FaqContent';
import Reveal from '@/components/ui/Reveal';
import { SITE_URL } from '@/lib/siteUrl';
import Breadcrumb from '@/components/seo/Breadcrumb';
import JsonLd from '@/components/seo/JsonLd';
import { faqPageJsonLd } from '@/lib/structuredData';
import { FAQ_GROUPS, faqItems } from '@/lib/faqData';

export const metadata = {
  title: 'Frequently Asked Questions',
  alternates: { canonical: `${SITE_URL}/faq/` },
};

export default function FAQPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '108px 32px 80px' }}>
      <JsonLd data={faqPageJsonLd({ path: '/faq/', name: metadata.title, items: faqItems(FAQ_GROUPS) })} />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'FAQ' }]} />
      <Reveal>
        <p className="caps-label-primary" style={{ marginBottom: '10px' }}>HELP CENTER</p>
        <h1 className="section-heading" style={{ marginBottom: '8px' }}>Frequently Asked Questions</h1>
        <p style={{ fontSize: '15px', color: 'var(--text-mid)', marginBottom: '32px' }}>
          Everything you need to know about Intrafer.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <FaqContent groups={FAQ_GROUPS} />
      </Reveal>

      <div className="cta-always-dark" style={{ marginTop: '60px', borderRadius: 'var(--r-xl)', padding: '40px', textAlign: 'center' }}>
        <p style={{ fontSize: '18px', fontWeight: 500, color: '#FAFAF8', marginBottom: '8px' }}>Still have questions?</p>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,.5)', marginBottom: '20px' }}>Our team responds within 2 business hours.</p>
        {/* Wrapped in <button>, not styled directly on the <a>, because
            .cta-always-dark's `a { color: #60A5FA !important }` carve-out
            (globals.css) overrides any inline color set on the Link
            itself — that carve-out is meant for plain text links, and
            a solid-background button using it renders invisible text
            in dark mode where --primary is also #60A5FA. */}
        <Link href="/contact">
          <button style={{ background: 'var(--primary)', color: '#fff', padding: '11px 28px', borderRadius: 'var(--r-md)', fontSize: '13px', fontWeight: 500, border: 'none', cursor: 'pointer' }}>
            Contact us
          </button>
        </Link>
      </div>
    </div>
  );
}
