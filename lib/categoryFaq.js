// The 5-question FAQ set approved by the client for category hub pages
// (SEO restructuring, Step 13) — content sourced verbatim/adapted from the
// existing /faq page (app/(public)/faq/page.jsx's FAQ_GROUPS), not
// fabricated. The underlying facts (verification process, 48-hour
// response commitment, contact-reveal privacy policy) are platform-wide,
// not category-specific — reusing them per category is genuine content
// reuse; this file just swaps in the right noun so the wording reads
// naturally instead of force-fitting one template. Deliberately excludes
// /faq's "FOR DESIGNERS" group, any pricing/subscription content (pricing
// is owned by the plans page and must not be duplicated into category
// content), and the Bangalore-specific cost question
// (reserved for a future city-level FAQ step, not this one).
//
// Keyed by slug rather than display name: a display name alone
// ("Furniture", "Home Automation") doesn't reliably say what the natural
// singular/plural noun for one practitioner/vendor in that category is
// (e.g. "a furniture store", not "a furniture") — this table spells that
// out per category instead of guessing from the name.
const CATEGORY_NOUNS = {
  'interior-designers': { singular: 'interior designer', plural: 'interior designers', article: 'an' },
  architects: { singular: 'architect', plural: 'architects', article: 'an' },
  'home-decorators': { singular: 'home decorator', plural: 'home decorators', article: 'a' },
  'home-renovation': { singular: 'home renovation contractor', plural: 'home renovation contractors', article: 'a' },
  'modular-kitchen': { singular: 'modular kitchen specialist', plural: 'modular kitchen specialists', article: 'a' },
  furniture: { singular: 'furniture store', plural: 'furniture stores', article: 'a' },
  lighting: { singular: 'lighting specialist', plural: 'lighting specialists', article: 'a' },
  'false-ceiling': { singular: 'false ceiling contractor', plural: 'false ceiling contractors', article: 'a' },
  wallpaper: { singular: 'wallpaper specialist', plural: 'wallpaper specialists', article: 'a' },
  painting: { singular: 'painter', plural: 'painters', article: 'a' },
  'home-automation': { singular: 'home automation specialist', plural: 'home automation specialists', article: 'a' },
  landscaping: { singular: 'landscaper', plural: 'landscapers', article: 'a' },
};

// Returns the 5-question FAQ set for one category, or null if the slug
// isn't one of the 12 known categories — the caller renders nothing in
// that case, never a broken/generic fallback.
export function getCategoryFaq(categorySlug) {
  const nouns = CATEGORY_NOUNS[categorySlug];
  if (!nouns) return null;

  const { singular, plural, article } = nouns;

  return [
    {
      // Adapted from /faq's "What is Intrafer?" — same real facts
      // (verified marketplace, real portfolios, compare quotes), reworded
      // to this category.
      question: `What is ${article} ${singular} on Intrafer?`,
      answer: `Intrafer is a verified marketplace connecting homeowners with trusted ${plural} across major cities. Browse real portfolios, compare quotes, and find ${article} ${singular} suited to your project.`,
    },
    {
      // Reused from /faq, verbatim except the closing noun — same
      // adaptation as Q4/Q5 below, so "your designer" doesn't read as a
      // mismatch on non-interior-designer category pages.
      question: 'Is it free to use as a homeowner?',
      answer: `Yes, completely free. Homeowners never pay to browse profiles, view portfolios, or submit enquiries. There are zero hidden charges for finding your ${singular}.`,
    },
    {
      // Adapted from /faq's "How are designers verified?" — same
      // verification facts.
      question: `How are ${plural} verified?`,
      answer: `Every ${singular} on Intrafer is manually reviewed by our team. We verify their portfolio photos (no stock images), check references, and confirm business registration before listing them on the platform.`,
    },
    {
      // Same 48-hour commitment/reassignment facts as /faq, with the
      // category-appropriate noun substituted for "designers".
      question: 'How quickly will I hear back?',
      answer: `Our ${plural} commit to responding within 48 hours. In practice, most respond within a few hours. If ${article} ${singular} does not respond within 48 hours, we reassign your lead.`,
    },
    {
      // Same contact-reveal privacy policy as /faq, noun substituted.
      question: 'Is my phone/email shared immediately?',
      answer: `No. Your contact details are private until ${article} ${singular} explicitly accepts your lead. This protects you from spam calls while ensuring serious ${plural} can reach you.`,
    },
  ];
}
