import Reveal from '@/components/ui/Reveal';
import LandingMarkdown from '@/components/seo/LandingMarkdown';
import { resolveLandingPage } from '@/lib/landingPlaceholders';

// Render pieces shared by every admin-authored landing page — the city
// route (Phase 2) and the state/category hubs (Phase 4C). Server
// components; markup moved here unchanged from the city route.

// Every authored text field with its placeholders resolved (`values`:
// lib/landingLevel.js placeholderValues). Banner/OG image URLs must be
// https — the backend enforces that on save, re-checked so a bad value
// means "no image" rather than a broken one.
export function authoredContent(page, values) {
  const content = resolveLandingPage(page, values);
  const https = (url) => (/^https:\/\//i.test(url) ? url : '');
  content.banner.imageUrl = https(content.banner.imageUrl);
  content.seo.ogImage = https(content.seo.ogImage);
  return content;
}

// Enabled sections with something to show; disabled or empty ones render
// nothing.
export function visibleSections(sections) {
  return sections.filter((sec) => sec.enabled && (
    (sec.type === 'text' && (sec.title || sec.body))
    || (sec.type === 'faq' && sec.faqItems.length > 0)
    || (sec.type === 'localities' && sec.localities.length > 0)
  ));
}

// Every enabled FAQ section's items, exactly as rendered by LandingSections.
export function visibleFaqItems(sections) {
  return sections.filter((sec) => sec.type === 'faq').flatMap((sec) => sec.faqItems);
}

// `questions`: [{ question, answer }] — must be exactly the visible text.
export function buildFaqJsonLd(questions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answer },
    })),
  };
}

// Shared by the automatic pages' FAQs and authored FAQ sections.
export function FaqSection({ title, questions }) {
  return (
    <section style={{ marginTop: '60px' }}>
      <h2 className="page-heading" style={{ marginBottom: '24px' }}>{title}</h2>
      {questions.map((q, i) => (
        <div key={i} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 500, marginBottom: '8px', color: 'var(--text)' }}>{q.question}</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-mid)', lineHeight: 1.7 }}>{q.answer}</p>
        </div>
      ))}
    </section>
  );
}

// The page's single h1 and its intro: the authored heading (else
// `defaultHeading`) and the intro as safe Markdown (else `defaultBlurb`,
// the automatic page's sentence).
export function LandingIntro({ heading, defaultHeading, intro, defaultBlurb }) {
  return (
    <Reveal>
      <p className="caps-label-primary" style={{ marginBottom: '10px' }}>SERVICE CATEGORY</p>
      <h1 className="section-heading" style={{ marginBottom: '16px' }}>{heading || defaultHeading}</h1>
      {intro ? (
        <div style={{ marginBottom: '26px' }}><LandingMarkdown>{intro}</LandingMarkdown></div>
      ) : (
        <p style={{ fontSize: '15px', color: 'var(--text-mid)', lineHeight: 1.8, maxWidth: '680px', marginBottom: '40px' }}>
          {defaultBlurb}
        </p>
      )}
    </Reveal>
  );
}

// `sections`: visibleSections() output, rendered in order.
// `localitiesTitle`: heading for a localities section without a title.
export function LandingSections({ sections, localitiesTitle }) {
  return sections.map((sec, i) => {
    if (sec.type === 'faq') {
      return <FaqSection key={i} title={sec.title || 'Frequently asked questions'} questions={sec.faqItems} />;
    }
    if (sec.type === 'localities') {
      // Plain names, not links — no locality pages exist to link to.
      return (
        <section key={i} style={{ marginTop: '60px' }}>
          <h2 className="page-heading" style={{ marginBottom: '20px' }}>{sec.title || localitiesTitle}</h2>
          <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', listStyle: 'none', padding: 0, margin: 0 }}>
            {sec.localities.map((name, j) => (
              <li
                key={j}
                style={{
                  padding: '8px 14px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)',
                  background: 'var(--surface)', color: 'var(--text)', fontSize: '13px',
                }}
              >
                {name}
              </li>
            ))}
          </ul>
        </section>
      );
    }
    return (
      <section key={i} style={{ marginTop: '60px' }}>
        {sec.title && <h2 className="page-heading" style={{ marginBottom: '20px' }}>{sec.title}</h2>}
        <LandingMarkdown>{sec.body}</LandingMarkdown>
      </section>
    );
  });
}

// Authored-page robots/referrer metadata. `indexable` is computed
// backend-side (city: seo.indexing + the vendor threshold; hubs: anything
// but noindex) and always false for a preview. A preview is also nofollow,
// and sends no Referer so the token in the URL can't leak to linked or
// embedded sites. Indexable pages get no robots key at all.
export function authoredRobots(landing) {
  if (landing.preview === true) return { robots: { index: false, follow: false }, referrer: 'no-referrer' };
  return !landing.indexable && { robots: { index: false, follow: true } };
}
