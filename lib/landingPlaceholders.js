// Placeholder resolution for admin-authored landing pages (Phase 2). The
// backend stores {{city}} {{state}} {{category}} {{vendorCount}} raw; they
// are resolved here at render time. Any other {{token}} — a typo, or one
// a future admin UI might offer before the renderer supports it — is
// stripped rather than shown to visitors as literal braces.
//
// Pure: no imports, no I/O — exercised directly by
// scripts/testLandingPlaceholders.mjs.

const TOKEN = /\{\{\s*([^{}]*?)\s*\}\}/g;

// `values`: { city, state, category, vendorCount }. Non-string input
// (missing field, null) resolves to ''.
export function resolvePlaceholders(text, values) {
  if (typeof text !== 'string' || !text) return '';
  return text.replace(TOKEN, (_, name) => {
    const value = Object.prototype.hasOwnProperty.call(values, name) ? values[name] : undefined;
    return value === undefined || value === null ? '' : String(value);
  });
}

// Returns a copy of the page with every authored text field resolved.
// Shape mirrors the backend LandingPage model; anything missing comes back
// as '' / [] so callers can test for emptiness without null checks.
export function resolveLandingPage(page, values) {
  const r = (text) => resolvePlaceholders(text, values).trim();
  const banner = page.banner || {};
  const seo = page.seo || {};
  return {
    banner: {
      imageUrl: banner.imageUrl || '',
      headline: r(banner.headline),
      subheadline: r(banner.subheadline),
      ctaLabel: r(banner.ctaLabel),
      ctaUrl: banner.ctaUrl || '',
    },
    heading: r(page.heading),
    intro: r(page.intro),
    sections: (page.sections || []).map((s) => ({
      type: s.type,
      enabled: s.enabled !== false,
      title: r(s.title),
      body: r(s.body),
      faqItems: (s.faqItems || [])
        .map((item) => ({ question: r(item.question), answer: r(item.answer) }))
        .filter((item) => item.question && item.answer),
      localities: (s.localities || []).map(r).filter(Boolean),
    })),
    seo: {
      metaTitle: r(seo.metaTitle),
      metaDescription: r(seo.metaDescription),
      ogImage: seo.ogImage || '',
    },
  };
}
