// Run: node scripts/checkPurgeTags.mjs [path-to-Intrafer_Backend]
// Cross-checks cache tags between the two repos (default backend path:
// ../Intrafer_Backend). Fails when:
// - the tag constants differ (lib/cacheTags.js vs src/utils/cacheTags.js),
// - the backend sends a tag no frontend fetch uses (a purge that does nothing),
// - a frontend fetch uses a tag the backend never sends (a cache only the
//   revalidate window can refresh).
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as frontend from '../lib/cacheTags.js';

const FE_ROOT = fileURLToPath(new URL('..', import.meta.url));
const BE_ROOT = resolve(process.argv[2] || join(FE_ROOT, '..', 'Intrafer_Backend'));
const BE_TAGS_FILE = join(BE_ROOT, 'src/utils/cacheTags.js');
if (!existsSync(BE_TAGS_FILE)) {
  console.error(`backend tags not found at ${BE_TAGS_FILE} (pass the Intrafer_Backend path)`);
  process.exit(1);
}
const backend = createRequire(import.meta.url)(BE_TAGS_FILE);

function sourceFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return name === 'node_modules' ? [] : sourceFiles(p);
    return /\.(m?js|jsx)$/.test(name) ? [p] : [];
  });
}
const srcOf = (files, skip) => files.filter((f) => f !== skip).map((f) => readFileSync(f, 'utf8')).join('\n');

// Tags referenced as TAGS.X, plus the prefixes when vendorTag()/projectTag()
// (or the backend's vendorTags/projectTags/reviewTags sets) are used.
function referencedTags(src, TAGS, PREFIXES) {
  const used = new Set();
  for (const [key, value] of Object.entries(TAGS)) if (new RegExp(`TAGS\\.${key}\\b`).test(src)) used.add(value);
  if (/\bvendorTag\(|\bvendorTags\(|\breviewTags\(|\bprojectTags\(/.test(src)) used.add(PREFIXES.VENDOR);
  if (/\bprojectTag\(|\bvendorTags\(|\bprojectTags\(/.test(src)) used.add(PREFIXES.PROJECT);
  return used;
}

let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`ok - ${name}`); };

const feTagsFile = join(FE_ROOT, 'lib/cacheTags.js');
const feUsed = referencedTags(
  srcOf(['app', 'lib', 'components'].flatMap((d) => sourceFiles(join(FE_ROOT, d))), feTagsFile),
  frontend.TAGS, frontend.TAG_PREFIXES,
);
// Backend: the event tag sets live in cacheTags.js itself, so scan its
// function bodies (everything after the TAGS / TAG_PREFIXES declarations)
// plus every other backend source.
const beTagsSrc = readFileSync(BE_TAGS_FILE, 'utf8');
const beSets = beTagsSrc.slice(beTagsSrc.indexOf('const vendorTags'));
const beSent = referencedTags(
  `${beSets}\n${srcOf(sourceFiles(join(BE_ROOT, 'src')), BE_TAGS_FILE)}`,
  backend.TAGS, backend.TAG_PREFIXES,
);

test('tag constants and prefixes are identical on both sides', () => {
  assert.deepEqual({ ...frontend.TAGS }, { ...backend.TAGS });
  assert.deepEqual({ ...frontend.TAG_PREFIXES }, { ...backend.TAG_PREFIXES });
  assert.equal(frontend.vendorTag('x'), backend.vendorTag('x'));
  assert.equal(frontend.projectTag('x'), backend.projectTag('x'));
});

test('every tag the backend sends is used by at least one frontend fetch', () => {
  assert.deepEqual([...beSent].filter((t) => !feUsed.has(t)).sort(), []);
});

test('every tag a frontend fetch uses is sent by the backend', () => {
  assert.deepEqual([...feUsed].filter((t) => !beSent.has(t)).sort(), []);
});

console.log(`\n${passed} passed — tags in use: ${[...feUsed].sort().join(', ')}`);
