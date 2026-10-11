// Live check of a running site (local `next start` or production): every
// URL the site states about itself must be on https://www.intrafer.in.
// Read-only GETs only.
//
//   node scripts/checkSeoHost.mjs <origin> [page paths...] [--404 <path>]...
//   node scripts/checkSeoHost.mjs http://localhost:3000 /vendors/<id>/ --404 /projects/000000000000000000000000/
//
// Checks: robots.txt's Sitemap line; every sitemap <loc>; each page's
// canonical, og:url and JSON-LD url/@id/item values. Each --404 path must
// answer HTTP 404 with a noindex robots meta. Exits 1 on any failure.

const WWW_ORIGIN = 'https://www.intrafer.in';
const args = process.argv.slice(2);
const origin = (args.shift() || '').replace(/\/+$/, '');
if (!origin) {
  console.error('usage: node scripts/checkSeoHost.mjs <origin> [paths...] [--404 <path>]...');
  process.exit(2);
}
const pages = [];
const missing = [];
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--404') missing.push(args[(i += 1)]);
  else pages.push(args[i]);
}

const failures = [];
const onHost = (label, url) => {
  let ok = false;
  try { ok = new URL(url).origin === WWW_ORIGIN; } catch { /* not a URL */ }
  if (!ok) failures.push(`${label}: ${url}`);
  return ok;
};
const get = async (path) => {
  const res = await fetch(`${origin}${path}`, { redirect: 'manual' });
  return { status: res.status, body: await res.text() };
};

const robots = await get('/robots.txt');
const sitemapLines = [...robots.body.matchAll(/^Sitemap:\s*(\S+)/gim)].map((m) => m[1]);
if (sitemapLines.length === 0) failures.push('robots.txt: no Sitemap line');
sitemapLines.forEach((u) => onHost('robots.txt Sitemap', u));
console.log(`robots.txt ${robots.status}: Sitemap ${sitemapLines.join(', ')}`);

const sitemap = await get('/sitemap.xml');
const locs = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (locs.length === 0) failures.push('sitemap.xml: no <loc> entries');
const badLocs = locs.filter((u) => !onHost('sitemap <loc>', u));
console.log(`sitemap.xml ${sitemap.status}: ${locs.length} <loc>, ${badLocs.length} off-host`);

for (const path of pages) {
  const { status, body } = await get(path);
  if (status !== 200) failures.push(`${path}: HTTP ${status}, expected 200`);
  const canonical = body.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!canonical) failures.push(`${path}: no canonical`);
  else onHost(`${path} canonical`, canonical);
  const ogUrl = body.match(/<meta property="og:url" content="([^"]+)"/)?.[1];
  if (ogUrl) onHost(`${path} og:url`, ogUrl);
  const ldUrls = [...body.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)]
    .flatMap((m) => [...m[1].matchAll(/"(?:url|@id|item)":"([^"]+)"/g)].map((u) => u[1]))
    .filter((u) => /intrafer|^https?:\/\//.test(u) && !/instagram|linkedin|schema\.org/.test(u));
  ldUrls.forEach((u) => onHost(`${path} JSON-LD`, u));
  console.log(`${path} ${status}: canonical ${canonical}${ogUrl ? `, og:url ${ogUrl}` : ''}, ${ldUrls.length} JSON-LD urls`);
}

for (const path of missing) {
  const { status, body } = await get(path);
  const noindex = /<meta name="robots" content="[^"]*noindex/.test(body);
  if (status !== 404) failures.push(`${path}: HTTP ${status}, expected 404`);
  if (!noindex) failures.push(`${path}: no noindex robots meta`);
  console.log(`${path} ${status}${noindex ? ' (noindex)' : ''}`);
}

if (failures.length) {
  console.error(`\nFAIL (${failures.length}):\n  ${failures.join('\n  ')}`);
  process.exit(1);
}
console.log('\nall URLs on https://www.intrafer.in');
