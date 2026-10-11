// Quality checklist for the landing page editor. Advisory only: nothing
// here blocks saving or publishing.
//
// Pure — exercised directly by scripts/testLandingChecklist.mjs.

import { resolvePlaceholders } from './landingPlaceholders.js';
import { buildSerpPreview, SERP_LIMITS } from './landingSerp.js';
import { EMPTY_TOKENS, LEVEL_LABELS, isHubLevel, placeholderValues } from './landingLevel.js';

export const KNOWN_TOKENS = ['city', 'state', 'category', 'vendorCount'];
export const MIN_WORDS = 150;
export const MIN_VENDORS_TO_INDEX = 3; // backend MIN_VENDORS_TO_INDEX (src/utils/indexThreshold.js)
const DESCRIPTION_RANGE = [70, 160];
const HEADING_MAX = 70;

const TOKEN = /\{\{\s*([^{}]*?)\s*\}\}/g;

// Rough Markdown-to-words count: keeps link/image text, drops URLs,
// heading/list/quote markers and emphasis, then counts whitespace-
// separated chunks that contain a letter or digit.
export function countWords(markdown) {
  if (typeof markdown !== 'string' || !markdown) return 0;
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>\s]+>/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+[.)])\s+/gm, '')
    .replace(/[*_~`#>|]/g, ' ');
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

// Every distinct {{token}} in `texts` that the renderer doesn't know,
// as written (e.g. "{{City}}" — tokens are case-sensitive).
export function findUnknownTokens(texts) {
  const found = new Set();
  for (const text of texts) {
    if (typeof text !== 'string') continue;
    for (const [whole, name] of text.matchAll(TOKEN)) {
      if (!KNOWN_TOKENS.includes(name)) found.add(whole);
    }
  }
  return [...found];
}

function allTextFields(form) {
  const { banner = {}, seo = {}, sections = [] } = form;
  return [
    banner.headline, banner.subheadline, banner.ctaLabel,
    form.heading, form.intro,
    seo.metaTitle, seo.metaDescription,
    ...sections.flatMap((s) => [
      s.title, s.body,
      ...(s.faqItems || []).flatMap((f) => [f.question, f.answer]),
      ...(s.localities || []),
    ]),
  ];
}

// Every distinct {{token}} in `texts` that is valid but always empty on
// a page of `level` ({{city}} on a hub, {{state}} on a category page).
export function findEmptyTokens(texts, level) {
  const empty = EMPTY_TOKENS[level] || [];
  const found = new Set();
  for (const text of texts) {
    if (typeof text !== 'string') continue;
    for (const [whole, name] of text.matchAll(TOKEN)) {
      if (empty.includes(name)) found.add(whole);
    }
  }
  return [...found];
}

// `form`: the editor's form state (raw, unresolved). `ctx`:
// { categoryName, city, state, vendorCount, level } — vendorCount
// null/undefined while match-check hasn't answered (its check is then left
// out); level defaults to 'city'. The vendor-count and forced-index checks
// are city-only: hubs are always indexed unless set to noindex.
// Returns [{ id, level: 'pass' | 'warn', label, hint }]. Each check has a
// pass label and a warn label; `label` is the one matching `level`, so a
// failing check says what's missing, not just the goal.
export function evaluateChecklist(form, ctx) {
  const { categoryName, city, state, vendorCount, level = 'city' } = ctx;
  const hub = isHubLevel(level);
  const values = placeholderValues(level, { categoryName, state, city, vendorCount: vendorCount ?? 0 });
  const r = (text) => resolvePlaceholders(text, values).trim();
  const banner = form.banner || {};
  const seo = form.seo || {};
  const sections = (form.sections || []).filter((s) => s.enabled !== false);
  const checks = [];
  const add = (id, ok, passLabel, warnLabel, hint) => checks.push({
    id, level: ok ? 'pass' : 'warn', label: ok ? passLabel : warnLabel, hint: ok ? '' : hint,
  });
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

  // Meta title — measured as Google shows it, i.e. with " | Intrafer"
  // (added automatically) counted in the limit.
  const { fullTitle } = buildSerpPreview({ metaTitle: seo.metaTitle, categoryName, city, state, vendorCount, level });
  const titleMax = SERP_LIMITS.desktop.title;
  if (!r(seo.metaTitle)) {
    add('metaTitle', false, '', 'Meta title not set', `Using the automatic title “${fullTitle}”.`);
  } else {
    add('metaTitle', fullTitle.length <= titleMax, `Meta title fits in search results (≤ ${titleMax} characters, counting “ | Intrafer”)`,
      'Meta title is too long for search results',
      `“${fullTitle}” is ${fullTitle.length} characters including “ | Intrafer” — Google will cut it short.`);
  }

  const description = r(seo.metaDescription);
  const [dMin, dMax] = DESCRIPTION_RANGE;
  if (!description) {
    add('metaDescription', false, '', 'Meta description not set', 'Google will pick text from the page instead.');
  } else {
    add('metaDescription', description.length >= dMin && description.length <= dMax,
      `Meta description is ${dMin}–${dMax} characters`,
      `Meta description is too ${description.length < dMin ? 'short' : 'long'}`,
      `It's ${description.length} characters — aim for ${dMin}–${dMax}.`);
  }

  add('bannerImage', Boolean((banner.imageUrl || '').trim()), 'Banner image added', 'Add a banner image',
    'Pages with an image look more trustworthy.');
  add('bannerHeadline', Boolean(r(banner.headline)), 'Banner headline added', 'Add a banner headline',
    'Add a short headline over the banner.');

  const hasLabel = Boolean(r(banner.ctaLabel));
  const hasUrl = Boolean((banner.ctaUrl || '').trim());
  // Half-filled reads differently from empty: the CTA is optional, but a
  // half-filled one blocks saving.
  add('cta', hasLabel && hasUrl, 'CTA button added',
    hasLabel || hasUrl ? 'Finish the CTA button' : 'Add a CTA button (optional)',
    hasLabel || hasUrl
      ? 'Set both the CTA label and the CTA URL — saving is blocked until both are filled or both are empty.'
      : 'Optional — a button such as “Get free quotes” helps visitors take the next step.');

  const words = countWords(r(form.intro))
    + sections.filter((s) => s.type === 'text').reduce((n, s) => n + countWords(r(s.title)) + countWords(r(s.body)), 0);
  add('words', words >= MIN_WORDS, `Enough text (${plural(words, 'word')})`, `Add more text — ${words} of ${MIN_WORDS} words`,
    `Intro and text sections have ${words} word${words === 1 ? '' : 's'} — thin pages rank poorly.`);

  // Complete Q&As per enabled FAQ section; passes when any one has 2+.
  const faqCounts = sections.filter((s) => s.type === 'faq')
    .map((s) => (s.faqItems || []).filter((f) => r(f.question) && r(f.answer)).length);
  const faqTotal = faqCounts.reduce((a, b) => a + b, 0);
  add('faq', faqCounts.some((n) => n >= 2), `FAQ has ${plural(faqTotal, 'question')}`, 'Add an FAQ with at least 2 questions', 'Add an enabled FAQ section with at least 2 complete questions and answers.');

  const localityCounts = sections.filter((s) => s.type === 'localities')
    .map((s) => (s.localities || []).filter((l) => r(l)).length);
  const localityTotal = localityCounts.reduce((a, b) => a + b, 0);
  // Optional, like the CTA: an absent localities list is a suggestion,
  // never an error.
  add('localities', localityCounts.some((n) => n >= 3), `${localityTotal} ${localityTotal === 1 ? 'locality' : 'localities'} listed`,
    'List localities served (optional)', 'Optional — listing the areas you cover helps local searches.');

  const unknown = findUnknownTokens(allTextFields(form));
  add('tokens', unknown.length === 0, 'No unknown placeholders', 'Unknown placeholders found',
    `${unknown.join(', ')} ${unknown.length === 1 ? 'isn’t a placeholder' : 'aren’t placeholders'} and will be removed. Valid: ${KNOWN_TOKENS.map((t) => `{{${t}}}`).join(' ')}.`);

  if (hub) {
    const empty = findEmptyTokens(allTextFields(form), level);
    const pageType = LEVEL_LABELS[level].toLowerCase();
    add('emptyTokens', empty.length === 0, `Placeholders fit a ${pageType}`, `Placeholder${empty.length === 1 ? '' : 's'} empty on a ${pageType}`,
      `${empty.join(', ')} ${empty.length === 1 ? 'is' : 'are'} always empty on a ${pageType} — the text will read with a gap.`);
  }

  if (vendorCount != null && !hub) {
    add('vendors', vendorCount > 0, `${plural(vendorCount, 'vendor')} listed for this city`,
      'No vendors yet — the page will show an empty list',
      'No vendors match yet — the page will show an empty vendor list.');
  }

  const indexing = seo.indexing || 'auto';
  if (hub) {
    add('indexing', true, indexing === 'noindex' ? 'Indexing: off (noindex)' : 'Indexing: on', '', '');
  }
  const thin = (vendorCount != null && vendorCount < MIN_VENDORS_TO_INDEX) || words < MIN_WORDS;
  if (!hub) add('indexing', !(indexing === 'index' && thin),
    { auto: 'Indexing: automatic', index: 'Indexing: forced on', noindex: 'Indexing: off (noindex)' }[indexing] || 'Indexing',
    'Forced indexing on a thin page',
    'Forced index on thin content can hurt SEO — use Auto until the page has more vendors and text.');

  const heading = r(form.heading);
  add('heading', heading.length <= HEADING_MAX, heading ? `Heading (H1) is ${HEADING_MAX} characters or fewer` : 'Heading (H1): automatic',
    'Heading (H1) is too long',
    `The heading is ${heading.length} characters — keep it under ${HEADING_MAX}.`);

  return checks;
}
