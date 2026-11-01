// Run: node scripts/testImageDimensions.mjs
// CLS guard for the public site (the Lighthouse-audited pages and every
// component they render): every next/image <Image> has explicit
// width + height, or is `fill` (absolutely positioned, so it can't shift
// layout) inside a positioned parent, with `sizes`; no
// raw <img>; `priority` (eager + preload) only where it is the page's LCP
// candidate, and `sizes` on every fill image. The live counterpart is
// Lighthouse's unsized-images audit in scripts/checkVitalsBudget.mjs.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`ok - ${name}`); };

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.jsx?$/.test(name)) out.push(p);
  }
  return out;
}
// Public pages and the shared components they render (not admin/dashboard).
const SCOPE = ['app/(public)', 'app/(vendor-site)', 'components/public', 'components/seo', 'components/vendor', 'components/ui', 'components/layout'];
const FILES = [join(ROOT, 'app/page.jsx'), ...SCOPE.flatMap((d) => walk(join(ROOT, d)))]
  // Comments removed (they mention <img> / <Image> in prose).
  .map((p) => ({ path: relative(ROOT, p), src: readFileSync(p, 'utf8').replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '') }))
  .filter((f) => !/components\/layout\/(Sidebar|DashboardLayout)\.jsx$/.test(f.path)); // dashboard chrome

// Each <Image ...> element's attribute text, with the source before it.
function images(src) {
  const out = [];
  for (let i = src.indexOf('<Image'); i !== -1; i = src.indexOf('<Image', i + 1)) {
    if (/[A-Za-z]/.test(src[i + 6])) continue; // <ImageField etc.
    let depth = 0;
    let j = i;
    for (; j < src.length; j += 1) {
      if (src[j] === '{') depth += 1;
      else if (src[j] === '}') depth -= 1;
      else if (src[j] === '>' && depth === 0) break;
    }
    out.push({ attrs: src.slice(i, j + 1), before: src.slice(Math.max(0, i - 1500), i), line: src.slice(0, i).split('\n').length });
  }
  return out;
}
const hasAttr = (attrs, name) => new RegExp(`\\s${name}(\\s|=|/?>)`).test(attrs);

// The nearest opening tag before a fill image (its parent in the JSX),
// read brace-aware so `onClick={() => ...}` doesn't end it early. A fill
// image is absolutely positioned, so it can't shift layout itself; it needs
// a positioned parent to size against (else it escapes to an ancestor).
function parentTag(before) {
  const starts = [...before.matchAll(/<(div|span|figure|Link|a|button|section)\b/g)];
  const from = starts[starts.length - 1]?.index;
  if (from === undefined) return '';
  let depth = 0;
  for (let j = from; j < before.length; j += 1) {
    if (before[j] === '{') depth += 1;
    else if (before[j] === '}') depth -= 1;
    else if (before[j] === '>' && depth === 0) return before.slice(from, j + 1);
  }
  return before.slice(from);
}
function parentPositioned(before) {
  const parent = parentTag(before);
  const ok = /position:\s*['"](relative|absolute|fixed|sticky)/.test(parent) || /className="[^"]*\b(relative|absolute)\b/.test(parent);
  return { ok, parent: parent.replace(/\s+/g, ' ').slice(0, 140) };
}

// fill images whose sized parent is the caller's element.
const SHARED_FILL = ['components/vendor/VendorCardImage.jsx', 'components/vendor/ProjectImageSlider.jsx'];

// The above-the-fold hero/LCP image of each page type, and the shared
// components that take `priority` from their caller.
const PRIORITY_ALLOWED = [
  'components/public/HeroImageCollage.jsx', // home hero
  'app/(public)/about/page.jsx', // about banner
  'components/seo/LandingBanner.jsx', // authored landing banner
  'app/(public)/guides/[slug]/page.jsx', // guide hero
  'app/(public)/design-styles/[style]/page.jsx', // style hero
  'app/(public)/cities/[city]/page.jsx', // city hero
  'app/(public)/vendors/[vendorId]/page.jsx', // vendor cover
  'app/(public)/projects/[projectId]/page.jsx', // first project photo
  'components/ui/BeforeAfterSlider.jsx', // when it is the first thing on a project page
  'components/vendor/VendorCardImage.jsx', 'components/vendor/ProjectImageSlider.jsx', // caller-controlled
];

// CompareBar: a 24x24 avatar inside a fixed 24x24 box in the client-only
// compare tray (never in the server HTML, can't shift layout).
const RAW_IMG_ALLOWED = ['components/vendor/CompareBar.jsx'];

test('no raw <img> on public pages (next/image reserves the box and serves sized sources)', () => {
  const hits = FILES.filter((f) => !RAW_IMG_ALLOWED.includes(f.path))
    .flatMap((f) => [...f.src.matchAll(/<img\b/g)].map((m) => `${f.path}:${f.src.slice(0, m.index).split('\n').length}`));
  assert.deepEqual(hits, []);
});

test('every <Image> has width + height, or is fill (with sizes) inside a positioned parent', () => {
  const bad = [];
  for (const f of FILES) {
    for (const img of images(f.src)) {
      const where = `${f.path}:${img.line}`;
      if (hasAttr(img.attrs, 'fill')) {
        // Shared components receive their box from the caller (documented in each).
        if (SHARED_FILL.includes(f.path)) continue;
        const { ok, parent } = parentPositioned(img.before);
        if (!ok) bad.push(`${where}: fill without a positioned parent (${parent})`);
        if (!hasAttr(img.attrs, 'sizes')) bad.push(`${where}: fill without sizes`);
      } else if (!(hasAttr(img.attrs, 'width') && hasAttr(img.attrs, 'height'))) {
        bad.push(`${where}: no width/height`);
      }
    }
  }
  assert.deepEqual(bad, []);
});


test('priority (eager + preload) only on LCP candidates', () => {
  const allowed = new Set(PRIORITY_ALLOWED);
  const found = FILES.flatMap((f) => images(f.src).filter((i) => /\spriority(\s|=\{(?!false)|\/?>)/.test(i.attrs)).map(() => f.path));
  assert.deepEqual([...new Set(found)].filter((p) => !allowed.has(p)), []);
});


console.log(`\n${passed} passed`);
