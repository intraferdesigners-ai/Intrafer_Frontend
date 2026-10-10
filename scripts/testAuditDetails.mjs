// Run: node scripts/testAuditDetails.mjs
import assert from 'node:assert/strict';
import { formatAuditDetails } from '../lib/auditDetails.js';

let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`ok - ${name}`); };

test('bulk landing page action', () => {
  const out = formatAuditDetails('Bulk landing page action', {
    action: 'delete', ok: 3, unchanged: 0, failed: 0, not_found: 0, ids: ['a1', 'b2', 'c3'],
  });
  assert.equal(out.text, 'delete · 3 ok · 0 unchanged · 0 failed · 0 not found · 3 ids');
  assert.match(out.title, /^action: delete\n/);
  assert.match(out.title, /ids: a1, b2, c3$/);
});

test('bulk create landing pages', () => {
  const out = formatAuditDetails('Bulk create landing pages', {
    created: 2, failed: 0, skipped: 2, templateId: 't1', category: 'c1',
  });
  assert.equal(out.text, 'created 2 · skipped 2 · failed 0');
  assert.match(out.title, /templateId: t1/);
});

test('duplicate landing page (with and without copy warnings)', () => {
  const d = {
    sourceId: 's1', sourceLabel: 'Interior Designers — Gautam Buddha Nagar, Uttar Pradesh',
    newId: 'n1', newLabel: 'Interior Designers — Nashik, Maharashtra', warnings: 0,
  };
  assert.equal(
    formatAuditDetails('Duplicate landing page', d).text,
    'Interior Designers — Gautam Buddha Nagar, Uttar Pradesh → Interior Designers — Nashik, Maharashtra',
  );
  assert.match(formatAuditDetails('Duplicate landing page', { ...d, warnings: 3 }).text, / · 3 copy warnings$/);
  assert.match(formatAuditDetails('Duplicate landing page', { ...d, warnings: 1 }).text, / · 1 copy warning$/);
  assert.match(formatAuditDetails('Duplicate landing page', d).title, /sourceId: s1/);
});

test('known action with an unexpected shape falls back to key: value', () => {
  assert.equal(formatAuditDetails('Bulk landing page action', { foo: 'bar' }).text, 'foo: bar');
  assert.equal(formatAuditDetails('Duplicate landing page', { newId: 'n1' }).text, 'newId: n1');
});

test('unknown action: key: value pairs, nested objects inline, nulls skipped', () => {
  const out = formatAuditDetails('Something new', { mode: 'x', count: 4, flag: false, empty: null, nested: { a: 1, b: 'two' } });
  assert.equal(out.text, 'mode: x · count: 4 · flag: false · nested: a: 1, b: two');
  assert.doesNotMatch(out.title, /empty/);
});

test('arrays shown as "N items", full list in the title (capped at 100)', () => {
  const ids = Array.from({ length: 120 }, (_, i) => `id${i}`);
  const out = formatAuditDetails('Other', { ids, one: ['x'] });
  assert.equal(out.text, 'ids: 120 items · one: 1 item');
  assert.match(out.title, /ids: id0, id1, .*id99, …and 20 more/);
});

test('long values and long lines are truncated; title keeps the full value', () => {
  const long = 'y'.repeat(500);
  const out = formatAuditDetails('Other', { note: long });
  assert.equal(out.text, `note: ${'y'.repeat(59)}…`);
  assert.ok(out.title.includes(long));
  const many = Object.fromEntries(Array.from({ length: 30 }, (_, i) => [`key${i}`, 'value']));
  assert.equal(formatAuditDetails('Other', many).text.length, 200);
});

test('null, undefined, empty, non-object details → null', () => {
  for (const d of [null, undefined, {}, [], 'text', 42, { onlyNull: null, blank: '' }]) {
    assert.equal(formatAuditDetails('Bulk landing page action', d), null, JSON.stringify(d));
  }
});

test('output is plain strings (rendered as text, never HTML)', () => {
  const out = formatAuditDetails('Other', { html: '<img src=x onerror=alert(1)>' });
  assert.equal(typeof out.text, 'string');
  assert.equal(out.text, 'html: <img src=x onerror=alert(1)>');
});

console.log(`\n${passed} passed`);
