// Run: node scripts/testPageTitles.mjs
// The root layout's title template ("%s | Intrafer") is the single source of
// the brand suffix: page titles must not add the brand themselves. A title
// that names the brand by design uses { absolute } (no template) and then
// contains it exactly once.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`ok - ${name}`); };

function sourceFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return sourceFiles(p);
    return /^(page|layout)\.jsx?$/.test(name) ? [p] : [];
  });
}

// The metadata parts of a file: `export const metadata = { ... };` and the
// body of `generateMetadata`. Content arrays elsewhere also use `title:`.
function metadataSource(src) {
  const parts = [];
  const meta = src.match(/export const metadata = \{[\s\S]*?\n\};|export const metadata = \{[^\n]*\};/);
  if (meta) parts.push(meta[0]);
  const gm = src.indexOf('export async function generateMetadata');
  if (gm !== -1) parts.push(src.slice(gm, src.indexOf('\n}\n', gm)));
  return parts.join('\n');
}

const files = [join(ROOT, 'app/page.jsx'), ...['app/(public)', 'app/(vendor-site)'].flatMap((d) => sourceFiles(join(ROOT, d)))]
  .map((f) => ({ rel: relative(ROOT, f), meta: metadataSource(readFileSync(f, 'utf8')) }))
  .filter((f) => f.meta);

const titlesOf = (meta) => [...meta.matchAll(/title:\s*(\{\s*absolute:\s*)?(`[^`]*`|'[^']*'|"[^"]*"|landingPageTitle\()/g)]
  .map((m) => ({ absolute: Boolean(m[1]), text: m[2] }));

test('every public page/layout with metadata was scanned', () => {
  assert.ok(files.length >= 25, `only ${files.length}`);
});

test('no page title adds the brand itself (the root template does)', () => {
  const offenders = files.flatMap(({ rel, meta }) => titlesOf(meta)
    .filter((t) => !t.absolute && /intrafer/i.test(t.text))
    .map((t) => `${rel}: ${t.text}`));
  assert.deepEqual(offenders, []);
});

test('absolute titles (brand by design) contain the brand exactly once', () => {
  const absolute = files.flatMap(({ rel, meta }) => titlesOf(meta).filter((t) => t.absolute).map((t) => ({ rel, text: t.text })));
  assert.ok(absolute.length >= 1);
  for (const { rel, text } of absolute) assert.equal((text.match(/intrafer/gi) || []).length, 1, `${rel}: ${text}`);
});

test('the root layout still defines the template', () => {
  assert.match(readFileSync(join(ROOT, 'app/layout.jsx'), 'utf8'), /template: '%s \| Intrafer'/);
});

test('meta descriptions on /about/ and every /cities/[city]/ are 110–160 characters', () => {
  const about = readFileSync(join(ROOT, 'app/(public)/about/page.jsx'), 'utf8').match(/description: "([^"]+)"/)[1];
  assert.ok(about.length >= 110 && about.length <= 160, `about: ${about.length}`);
  const cities = readFileSync(join(ROOT, 'app/(public)/cities/[city]/page.jsx'), 'utf8');
  const tpl = cities.match(/description: `([^`]*\$\{city\.name\}[^`]*)`/)[1];
  const entries = [...cities.matchAll(/name: '([^']+)', state: '([^']+)'/g)];
  assert.ok(entries.length >= 6);
  for (const [, name, state] of entries) {
    const d = tpl.replace('${city.name}', name).replace('${city.state}', state);
    assert.ok(d.length >= 110 && d.length <= 160, `${name}: ${d.length}`);
  }
});

test('a layout with child pages keeps the brand template (a plain title would reset it for them)', () => {
  const layouts = ['app/(public)', 'app/(vendor-site)'].flatMap((d) => sourceFiles(join(ROOT, d))).filter((f) => /layout\.jsx?$/.test(f));
  for (const f of layouts) {
    const meta = metadataSource(readFileSync(f, 'utf8'));
    if (!/title:/.test(meta)) continue;
    const children = sourceFiles(join(f, '..')).filter((c) => /page\.jsx?$/.test(c) && relative(join(f, '..'), c).includes('/'));
    if (children.length === 0) continue;
    assert.match(meta, /template: '%s \| Intrafer'/, relative(ROOT, f));
    // `default` is itself run through the parent's template: no brand in it.
    const def = meta.match(/default: '([^']+)'/);
    if (def) assert.doesNotMatch(def[1], /intrafer/i, `${relative(ROOT, f)} default`);
  }
});

console.log(`\n${passed} passed`);
