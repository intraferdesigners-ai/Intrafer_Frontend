// Parses the bulk-create textarea (landing pages, Phase 4A): one location
// per line as "City, State", "City - State" or "City<TAB>State". Lines
// starting with # and blank lines are ignored; a line with only a city
// uses `defaultState`.
//
// Pure — exercised by scripts/testLandingBulkParse.mjs.

import { slugify } from './slug.js';

export const MAX_LOCATIONS = 50;
export const MAX_LENGTH = 80; // backend LandingPage state/city maxlength

const clean = (s) => s.replace(/\s+/g, ' ').trim();

// The LAST separator splits city from state (state names never contain
// one). A dash only counts with spaces around it, so "Pimpri-Chinchwad"
// stays one city.
function splitLine(line) {
  if (line.includes('\t')) {
    const i = line.lastIndexOf('\t');
    return [line.slice(0, i), line.slice(i + 1)];
  }
  const comma = line.lastIndexOf(',');
  if (comma !== -1) return [line.slice(0, comma), line.slice(comma + 1)];
  const dash = [...line.matchAll(/\s+[-–—]\s+/g)].pop();
  if (dash) return [line.slice(0, dash.index), line.slice(dash.index + dash[0].length)];
  return [line, null];
}

// -> { rows, items, count, overLimit }
//   rows:  every location line, in order: { line (1-based), raw, city,
//          state, error?, duplicateOfLine? }
//   items: the rows to send — no `error` — as { state, city, line }.
//          Duplicates are kept (the server reports them as
//          duplicate_in_batch); `duplicateOfLine` lets the UI say so early.
//   count: location lines (rows.length); overLimit: count > MAX_LOCATIONS.
export function parseLocations(text, { defaultState = '' } = {}) {
  const rows = [];
  const seen = new Map();
  const fallbackState = clean(defaultState || '');

  (text || '').split(/\r?\n/).forEach((rawLine, i) => {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const [cityPart, statePart] = splitLine(trimmed);
    const city = clean(cityPart);
    const state = statePart === null ? fallbackState : clean(statePart);
    const row = { line: i + 1, raw: trimmed, city, state };

    if (!city) row.error = 'City is missing.';
    else if (!state) row.error = statePart === null ? 'No state — write “City, State” or set a default state.' : 'State is missing.';
    else if (city.length > MAX_LENGTH) row.error = `City is longer than ${MAX_LENGTH} characters.`;
    else if (state.length > MAX_LENGTH) row.error = `State is longer than ${MAX_LENGTH} characters.`;
    else if (!slugify(city) || !slugify(state)) row.error = 'Use letters or digits in the city and state.';

    if (!row.error) {
      const key = `${slugify(state)}/${slugify(city)}`;
      if (seen.has(key)) row.duplicateOfLine = seen.get(key);
      else seen.set(key, row.line);
    }
    rows.push(row);
  });

  return {
    rows,
    items: rows.filter((r) => !r.error).map((r) => ({ state: r.state, city: r.city, line: r.line })),
    count: rows.length,
    overLimit: rows.length > MAX_LOCATIONS,
  };
}
