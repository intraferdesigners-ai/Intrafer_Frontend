// Run: node scripts/testRenderPath.mjs
// Core Web Vitals guard for the render path of the public pages:
// (1) the animation library stays out of the shared/first-load components
//     (simple effects are CSS: app/globals.css "Motion utilities");
// (2) interaction-only widgets are loaded lazily (next/dynamic, ssr: false);
// (3) nothing above the fold is server-rendered at opacity 0;
// (4) only Inter (the LCP text font) is preloaded.
// The live counterpart is scripts/checkVitalsBudget.mjs.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const code = (p) => read(p).replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/^\s*\/\/.*$/gm, '');
let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`ok - ${name}`); };
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(jsx?|mjs)$/.test(name)) out.push(relative(ROOT, p));
  }
  return out;
}

// Rendered on every page or on the card/listing/detail pages.
const NO_ANIMATION_LIBRARY = [
  'components/ui/Button.jsx', 'components/ui/Reveal.jsx', 'components/ui/RevealItem.jsx', 'components/ui/useRevealState.js',
  'components/ui/PageTransition.jsx', 'components/ui/HowItWorksCard.jsx', 'components/ui/HoverLift.jsx',
  'components/ui/RotatingWord.jsx', 'components/ui/AnimatedCounter.jsx', 'components/vendor/VendorCard.jsx',
  'components/vendor/VendorCardImage.jsx', 'components/vendor/ProjectImageSlider.jsx',
  'app/layout.jsx', 'app/(public)/layout.jsx', 'app/(vendor-site)/layout.jsx',
  'components/layout/Navbar.jsx', 'components/layout/Footer.jsx', 'components/layout/VendorNavbar.jsx', 'components/layout/VendorFooter.jsx',
];

test('shared components use CSS motion, not framer-motion', () => {
  assert.deepEqual(NO_ANIMATION_LIBRARY.filter((p) => /from 'framer-motion'/.test(read(p))), []);
  const css = read('app/globals.css');
  for (const cls of ['.m-tap', '.m-btn', '.m-hover-zoom', '.m-lift', '.m-reveal', '.m-fade-in', '.m-fade-up', '.m-toggle', '.m-pulse']) {
    assert.ok(css.includes(cls), cls);
  }
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.m-fade-in, \.m-fade-up \{ animation: none; \}/);
});

test('interaction-only widgets are lazy (ssr: false) and never imported directly by a page or layout', () => {
  const deferred = read('components/ui/DeferredWidgets.jsx');
  for (const w of ['RouteProgressBar', 'CompareBar', 'VendorEnquiryOverlay']) {
    assert.match(deferred, new RegExp(`export const ${w} = dynamic\\(\\(\\) => import\\([^)]+\\), \\{ ssr: false \\}\\);`), w);
  }
  assert.match(read('components/ui/LeadCapturePopupLazy.jsx'), /dynamic\(\(\) => import\('\.\/LeadCapturePopup'\), \{ ssr: false \}\)/);
  assert.match(read('components/vendor/VendorCard.jsx'), /const QuickEnquiryModal = dynamic\(\(\) => import\('\.\/QuickEnquiryModal'\), \{ ssr: false \}\);/);
  assert.match(read('components/vendor/VendorCard.jsx'), /import\('@\/lib\/enquiryFlow'\)/);
  // A static import of the widget modules themselves (only the lazy
  // wrappers may load them; DashboardLayout — signed-in dashboards, not
  // audited — keeps its direct CompareBar import).
  const direct = walk(join(ROOT, 'app')).concat(walk(join(ROOT, 'components')))
    .filter((p) => p !== 'components/layout/DashboardLayout.jsx')
    .filter((p) => /^import [^;]* from '[^']*\/(RouteProgressBar|VendorEnquiryOverlay|LeadCapturePopup|QuickEnquiryModal|CompareBar)';/m.test(read(p)));
  assert.deepEqual(direct, []);
});

test('no server-rendered opacity:0 on public components (above-the-fold content must paint without JS)', () => {
  const files = ['components/ui', 'components/vendor', 'components/public', 'components/seo', 'components/layout']
    .flatMap((d) => walk(join(ROOT, d)))
    .filter((p) => !/(RouteProgressBar|CompareBar|VendorEnquiryOverlay|LeadCapturePopup|QuickEnquiryModal|TestimonialCarousel|DashboardLayout|Sidebar)\.jsx$/.test(p));
  // An opacity-0 start inside <AnimatePresence initial={false}> only applies
  // to later swaps (VendorResultsGrid's filter changes), never the first render.
  const offenders = files.filter((p) => /initial=\{\{\s*opacity:\s*0/.test(code(p)) && !/<AnimatePresence[^>]*initial=\{false\}/.test(code(p)));
  assert.deepEqual(offenders, []);
});

test('fonts: only Inter (the LCP text font) is preloaded; Cormorant and JetBrains Mono on demand; all display swap', () => {
  const layout = read('app/layout.jsx');
  const block = (name) => layout.slice(layout.indexOf(`const ${name} = `), layout.indexOf('});', layout.indexOf(`const ${name} = `)));
  assert.match(block('cormorantGaramond'), /preload: false/);
  assert.match(block('jetbrainsMono'), /preload: false/);
  assert.doesNotMatch(block('inter'), /preload: false/);
  for (const n of ['cormorantGaramond', 'inter', 'jetbrainsMono']) assert.match(block(n), /display: 'swap'/, n);
});

console.log(`\n${passed} passed`);
