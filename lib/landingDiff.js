// What restoring a landing page version would change (Phase 4B history
// panel): diffContent(current, snapshot) compares the CURRENT saved
// content with a stored version's snapshot. `before` is the current
// value, `after` the version's. Only the six versioned content keys —
// never location or status.
//
// Pure — exercised by scripts/testLandingDiff.mjs. Returns plain strings
// and numbers; callers render them as text.

const FIELDS = [
  ['banner.headline', 'Banner headline', 'text'],
  ['banner.subheadline', 'Banner subheadline', 'text'],
  ['banner.imageUrl', 'Banner image', 'text'],
  ['banner.ctaLabel', 'CTA label', 'text'],
  ['banner.ctaUrl', 'CTA URL', 'text'],
  ['heading', 'Heading (H1)', 'text'],
  ['intro', 'Intro', 'text'],
  ['vendorList.sort', 'Vendor sort', 'enum'],
  ['vendorList.limit', 'Vendor limit', 'number'],
  ['seo.metaTitle', 'Meta title', 'text'],
  ['seo.metaDescription', 'Meta description', 'text'],
  ['seo.ogImage', 'OG image', 'text'],
  ['seo.indexing', 'Indexing', 'enum'],
];

// Model defaults, so a missing value compares equal to its default.
const DEFAULTS = { 'vendorList.sort': 'featured', 'vendorList.limit': 12, 'seo.indexing': 'auto' };
const SECTION_TYPES = { text: 'Text', faq: 'FAQ', localities: 'Localities' };
const SHORT = 60;

export const CONTENT_KEY_LABELS = {
  banner: 'Banner', heading: 'Heading', intro: 'Intro', sections: 'Sections', vendorList: 'Vendor list', seo: 'SEO',
};

const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
const quote = (s, n = 30) => `“${s.length > n ? `${s.slice(0, n - 1)}…` : s}”`;
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

function normalise(path, kind, value) {
  const v = value === undefined || value === null || value === '' ? DEFAULTS[path] : value;
  if (kind === 'number') return v === undefined || v === '' ? null : Number(v);
  return v === undefined || v === null ? '' : String(v);
}

function fieldSummary(label, kind, before, after) {
  if (kind !== 'text') return `${label}: ${before ?? '—'} → ${after ?? '—'}`;
  if (!before) return `${label} added`;
  if (!after) return `${label} removed`;
  if (before.length <= SHORT && after.length <= SHORT) return `${label}: ${quote(before, SHORT)} → ${quote(after, SHORT)}`;
  return `${label} changed (${before.length} → ${after.length} characters)`;
}

function normaliseSection(s) {
  return {
    type: s?.type || 'text',
    title: s?.title || '',
    body: s?.body || '',
    faqItems: (s?.faqItems || []).map((f) => ({ question: f?.question || '', answer: f?.answer || '' })),
    localities: [...(s?.localities || [])],
    enabled: s?.enabled !== false,
  };
}
const signature = (s) => JSON.stringify(s);
const sectionName = (s, i) => `Section ${i + 1} (${SECTION_TYPES[s.type] || s.type})`;
const describe = (s) => `${SECTION_TYPES[s.type] || s.type}${s.title ? ` ${quote(s.title)}` : ''}`;

// What changed inside one section that kept its type.
function sectionEdits(b, a) {
  const parts = [];
  if (b.enabled !== a.enabled) parts.push(a.enabled ? 'shown' : 'hidden');
  if (b.title !== a.title) parts.push(a.title ? `title ${quote(a.title)}` : 'title removed');
  if (b.type === 'faq' && b.faqItems.length !== a.faqItems.length) {
    parts.push(`${b.faqItems.length} → ${plural(a.faqItems.length, 'question')}`);
  } else if (b.type === 'faq' && signature(b.faqItems) !== signature(a.faqItems)) parts.push('questions edited');
  if (b.type === 'localities' && b.localities.length !== a.localities.length) {
    parts.push(`${b.localities.length} → ${a.localities.length} ${a.localities.length === 1 ? 'locality' : 'localities'}`);
  } else if (b.type === 'localities' && signature(b.localities) !== signature(a.localities)) parts.push('localities edited');
  if (b.body !== a.body) parts.push('text edited');
  return parts.join(', ');
}

// Sections as a list: unchanged ones matched by content, then remaining
// same-type sections paired in order (edited), leftovers added/removed;
// a pure reordering is reported once. Section numbers are positions in
// the version (added/edited) or the current page (removed).
function diffSections(beforeRaw, afterRaw) {
  const before = (beforeRaw || []).map(normaliseSection);
  const after = (afterRaw || []).map(normaliseSection);
  const used = new Set();
  const matchOf = after.map((a) => {
    const i = before.findIndex((b, j) => !used.has(j) && signature(b) === signature(a));
    if (i !== -1) used.add(i);
    return i;
  });

  const changes = [];
  const pairs = [];
  after.forEach((a, ai) => {
    if (matchOf[ai] !== -1) return;
    const bi = before.findIndex((b, j) => !used.has(j) && b.type === a.type);
    if (bi !== -1) {
      used.add(bi);
      pairs.push([bi, ai]);
    } else {
      changes.push({ key: `sections.${ai}`, label: 'Sections', kind: 'list', before: '', after: describe(a), summary: `Section added: ${describe(a)}` });
    }
  });
  pairs.forEach(([bi, ai]) => {
    const summary = `${sectionName(after[ai], ai)}: ${sectionEdits(before[bi], after[ai])}`;
    changes.push({ key: `sections.${ai}`, label: 'Sections', kind: 'list', before: describe(before[bi]), after: describe(after[ai]), summary });
  });
  before.forEach((b, bi) => {
    if (!used.has(bi)) changes.push({ key: `sections.removed.${bi}`, label: 'Sections', kind: 'list', before: describe(b), after: '', summary: `Section removed: ${describe(b)} (was section ${bi + 1})` });
  });

  const matched = matchOf.filter((i) => i !== -1);
  const pairedOrder = pairs.map(([bi]) => bi);
  const order = [...matched, ...pairedOrder];
  const reordered = order.some((v, i) => i > 0 && v < order[i - 1]);
  if (!changes.length && reordered) {
    changes.push({ key: 'sections', label: 'Sections', kind: 'list', before: `${before.length}`, after: `${after.length}`, summary: 'Sections reordered' });
  }
  return changes;
}

// -> [{ key, label, kind: 'text'|'list'|'number'|'enum', before, after, summary }]
export function diffContent(current, snapshot) {
  const cur = current || {};
  const snap = snapshot || {};
  const changes = [];
  for (const [path, label, kind] of FIELDS) {
    const before = normalise(path, kind, get(cur, path));
    const after = normalise(path, kind, get(snap, path));
    if (before !== after) changes.push({ key: path, label, kind, before, after, summary: fieldSummary(label, kind, before, after) });
  }
  return changes.concat(diffSections(cur.sections, snap.sections));
}
