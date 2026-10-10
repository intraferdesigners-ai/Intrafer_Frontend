// Run: node scripts/testLandingBulkParse.mjs
import assert from 'node:assert/strict';
import { parseLocations, MAX_LOCATIONS } from '../lib/landingBulkParse.js';

let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`ok - ${name}`); };
const pairs = (out) => out.items.map((i) => `${i.city}|${i.state}`);

test('comma, dash and tab separators', () => {
  const out = parseLocations('Pune, Maharashtra\nSurat - Gujarat\nKochi\tKerala\nMysuru – Karnataka');
  assert.deepEqual(pairs(out), ['Pune|Maharashtra', 'Surat|Gujarat', 'Kochi|Kerala', 'Mysuru|Karnataka']);
});

test('hyphenated city names are not split; the last separator wins', () => {
  const out = parseLocations('Pimpri-Chinchwad, Maharashtra\nPimpri-Chinchwad - Maharashtra\nSome, Odd, City, Goa');
  assert.deepEqual(pairs(out), ['Pimpri-Chinchwad|Maharashtra', 'Pimpri-Chinchwad|Maharashtra', 'Some, Odd, City|Goa']);
});

test('blank lines and # comments are ignored; line numbers kept', () => {
  const out = parseLocations('# Gujarat batch\n\n   \nSurat, Gujarat\n  # indented comment\nVadodara, Gujarat\n');
  assert.equal(out.count, 2);
  assert.deepEqual(out.items.map((i) => i.line), [4, 6]);
});

test('default state for lines without one; explicit state wins', () => {
  const out = parseLocations('Nashik\nPune, Maharashtra\nSurat, Gujarat', { defaultState: '  Maharashtra ' });
  assert.deepEqual(pairs(out), ['Nashik|Maharashtra', 'Pune|Maharashtra', 'Surat|Gujarat']);
});

test('no state and no default → error row, not sent', () => {
  const out = parseLocations('Nashik\nPune, ');
  assert.equal(out.items.length, 0);
  assert.match(out.rows[0].error, /No state/);
  assert.equal(out.rows[1].error, 'State is missing.');
});

test('whitespace collapsed and trimmed; case kept as typed', () => {
  const out = parseLocations('   navi    MUMBAI ,   maharashtra   ');
  assert.deepEqual(pairs(out), ['navi MUMBAI|maharashtra']);
});

test('too-long values and symbol-only values are errors', () => {
  const out = parseLocations(`${'x'.repeat(81)}, Goa\nPanaji, ${'y'.repeat(81)}\n${'x'.repeat(80)}, Goa\n!!!, Goa\n, Goa`);
  assert.match(out.rows[0].error, /City is longer than 80/);
  assert.match(out.rows[1].error, /State is longer than 80/);
  assert.equal(out.rows[2].error, undefined);
  assert.match(out.rows[3].error, /letters or digits/);
  assert.equal(out.rows[4].error, 'City is missing.');
  assert.equal(out.items.length, 1);
});

test('duplicates (by slug, case/spacing-insensitive) are flagged but still sent', () => {
  const out = parseLocations('Pune, Maharashtra\nPUNE , maharashtra\nPune,Maharashtra');
  assert.equal(out.items.length, 3);
  assert.equal(out.rows[0].duplicateOfLine, undefined);
  assert.equal(out.rows[1].duplicateOfLine, 1);
  assert.equal(out.rows[2].duplicateOfLine, 1);
});

test(`${MAX_LOCATIONS} lines ok, ${MAX_LOCATIONS + 1} over the limit (comments don't count)`, () => {
  const lines = (n) => Array.from({ length: n }, (_, i) => `City${i}, State`).join('\n');
  assert.equal(parseLocations(lines(50)).overLimit, false);
  assert.equal(parseLocations(`# note\n${lines(50)}\n\n# end`).overLimit, false);
  const over = parseLocations(lines(51));
  assert.equal(over.count, 51);
  assert.equal(over.overLimit, true);
});

test('CRLF input and empty input', () => {
  assert.deepEqual(pairs(parseLocations('Pune, Maharashtra\r\nSurat, Gujarat\r\n')), ['Pune|Maharashtra', 'Surat|Gujarat']);
  assert.deepEqual(parseLocations(''), { rows: [], items: [], count: 0, overLimit: false });
  assert.deepEqual(parseLocations(undefined).count, 0);
});

console.log(`\n${passed} passed`);
