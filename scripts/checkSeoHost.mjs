// Live check of a running site (local `next start` or production): every
// URL the site states about itself must be on https://www.intrafer.in.
// Read-only GETs only.
//
//   node scripts/checkSeoHost.mjs <origin> [page paths...] [--404 <path>]...
//   node scripts/checkSeoHost.mjs http://localhost:3000 /vendors/<id>/ --404 /projects/000000000000000000000000/
//
// Checks: robots.txt's Sitemap line; each page's Search Console
// verification meta (exactly once in <head>, siteConfig token); the sitemap index's child <loc>s and
// every <loc> in every child; each page's
// canonical, og:url and JSON-LD url/@id/item values. Each --404 path must
// answer HTTP 404 with a noindex robots meta. Exits 1 on any failure.

import { GOOGLE_SITE_VERIFICATION } from '../lib/siteConfig.js';

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

// /sitemap.xml is a <sitemapindex>: every child <loc> must be on www, and
// each child is fetched (by path, from this origin) and its <loc>s checked.
const locsOf = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const sitemap = await get('/sitemap.xml');
const isIndex = /<sitemapindex[\s>]/.test(sitemap.body);
if (!isIndex) failures.push('sitemap.xml: not a <sitemapindex>');
const children = locsOf(sitemap.body);
if (children.length === 0) failures.push('sitemap.xml: no child sitemaps');
children.forEach((u) => onHost('sitemap index <loc>', u));
console.log(`sitemap.xml ${sitemap.status}: index of ${children.length} child sitemaps`);
const locs = [];
for (const child of children) {
  const path = new URL(child).pathname;
  const res = await get(path);
  if (res.status !== 200) { failures.push(`${path}: HTTP ${res.status}`); continue; }
  if (!/<urlset[\s>]/.test(res.body)) failures.push(`${path}: not a <urlset>`);
  const childLocs = locsOf(res.body);
  const bad = childLocs.filter((u) => !onHost(`${path} <loc>`, u));
  locs.push(...childLocs);
  console.log(`  ${path} ${res.status}: ${childLocs.length} <loc>, ${bad.length} off-host`);
}
if (locs.length === 0) failures.push('sitemaps: no <loc> entries');

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
  // Search Console verification: exactly once, in the server-rendered <head>.
  const head = body.split('</head>')[0];
  const verif = [...body.matchAll(/<meta name="google-site-verification" content="([^"]*)"/g)].map((m) => m[1]);
  const verifInHead = [...head.matchAll(/<meta name="google-site-verification" content="([^"]*)"/g)].length;
  if (verif.length !== 1 || verifInHead !== 1 || verif[0] !== GOOGLE_SITE_VERIFICATION) {
    failures.push(`${path}: google-site-verification ${verif.length}x (${verifInHead} in <head>)${verif[0] && verif[0] !== GOOGLE_SITE_VERIFICATION ? `, token ${verif[0]}` : ''}`);
  }
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
