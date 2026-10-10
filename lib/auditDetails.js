// Readable one-line summaries of an audit entry's optional `details`
// object (set by handlers via res.locals.auditDetails — see the backend's
// middleware/auditLog.js). Plain strings only; callers render them as
// text.
//
// Pure — exercised by scripts/testAuditDetails.mjs.

const MAX_VALUE = 60;
const MAX_TEXT = 200;
const MAX_TITLE_ITEMS = 100;

const truncate = (str, max) => (str.length > max ? `${str.slice(0, max - 1)}…` : str);
const num = (n) => (Number.isFinite(n) ? n : 0);
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function valueText(value, max = MAX_VALUE) {
  if (Array.isArray(value)) return plural(value.length, 'item');
  if (isPlainObject(value)) return truncate(Object.entries(value).map(([k, v]) => `${k}: ${valueText(v, 20)}`).join(', '), max);
  return truncate(String(value), max);
}

// Full, untruncated "key: value" lines for the tooltip — arrays listed.
function titleText(details) {
  return Object.entries(details)
    .filter(([, v]) => v !== null && v !== undefined)
    .map(([k, v]) => {
      if (Array.isArray(v)) {
        const shown = v.slice(0, MAX_TITLE_ITEMS).map((x) => (isPlainObject(x) ? JSON.stringify(x) : String(x)));
        return `${k}: ${shown.join(', ')}${v.length > MAX_TITLE_ITEMS ? `, …and ${v.length - MAX_TITLE_ITEMS} more` : ''}`;
      }
      return `${k}: ${isPlainObject(v) ? JSON.stringify(v) : String(v)}`;
    })
    .join('\n');
}

function genericText(details) {
  const parts = Object.entries(details)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `${k}: ${valueText(v)}`);
  return parts.length ? truncate(parts.join(' · '), MAX_TEXT) : null;
}

// Known actions get a purpose-built line when their details have the
// expected shape; anything else falls back to "key: value" pairs.
const FORMATTERS = {
  'Bulk landing page action': (d) => (typeof d.action === 'string' ? [
    d.action,
    `${num(d.ok)} ok`, `${num(d.unchanged)} unchanged`, `${num(d.failed)} failed`, `${num(d.not_found)} not found`,
    plural(Array.isArray(d.ids) ? d.ids.length : 0, 'id'),
  ].join(' · ') : null),
  'Bulk create landing pages': (d) => ('created' in d ? `created ${num(d.created)} · skipped ${num(d.skipped)} · failed ${num(d.failed)}` : null),
  'Duplicate landing page': (d) => (d.sourceLabel && d.newLabel
    ? `${d.sourceLabel} → ${d.newLabel}${num(d.warnings) > 0 ? ` · ${plural(d.warnings, 'copy warning')}` : ''}`
    : null),
};

// -> { text, title } or null when there's nothing to show.
export function formatAuditDetails(action, details) {
  if (!isPlainObject(details) || Object.keys(details).length === 0) return null;
  const special = FORMATTERS[action]?.(details);
  const text = special ? truncate(special, MAX_TEXT) : genericText(details);
  if (!text) return null;
  return { text, title: titleText(details) };
}
