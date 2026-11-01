// Live check that the sitemap lists only indexable URLs. Read-only GETs.
//
//   node scripts/checkSitemapUrls.mjs <baseUrl>
//   node scripts/checkSitemapUrls.mjs http://localhost:3000   (www URLs are fetched from this origin)
//
// For /sitemap.xml (a <sitemapindex>) and every child: HTTP 200 and the
// right root element. For every <loc> in every child: on
// https://www.intrafer.in, answers 200 (no redirect), has a canonical equal
// to the <loc> itself, and no noindex (robots meta or X-Robots-Tag); no URL
// is listed twice. Prints URL counts per child. Exits 1 on any failure.
import { WWW, canonicalOf, client, isNoindex, sitemapUrls } from './lib/crawl.mjs';

const base = process.argv[2];
if (!/^https?:\/\//.test(base || '')) {
  console.error('usage: node scripts/checkSitemapUrls.mjs <baseUrl>');
  process.exit(2);
}
const get = client(base);
const failures = [];

const top = await get('/sitemap.xml');
if (!/<sitemapindex[\s>]/.test(top.body)) failures.push('/sitemap.xml is not a <sitemapindex>');
const { children, urls } = await sitemapUrls(get);
console.log(`/sitemap.xml ${top.status}: ${children.length} child sitemaps`);
for (const c of children) {
  console.log(`  ${new URL(c.loc).pathname.padEnd(30)} HTTP ${c.status}  ${c.urls.length} URLs`);
  if (c.status !== 200) failures.push(`${c.loc}: HTTP ${c.status}`);
  if (!c.loc.startsWith(`${WWW}/`)) failures.push(`${c.loc}: not on ${WWW}`);
}
const seen = new Set();
for (const u of urls) {
  if (seen.has(u)) failures.push(`${u}: listed twice`);
  seen.add(u);
}

let checked = 0;
const queue = [...seen];
async function worker() {
  while (queue.length) {
    const url = queue.shift();
    if (!url.startsWith(`${WWW}/`)) { failures.push(`${url}: not on ${WWW}`); continue; }
    const { pathname, search } = new URL(url);
    const r = await get(`${pathname}${search}`);
    checked += 1;
    if (r.status !== 200) { failures.push(`${url}: HTTP ${r.status}${r.location ? ` -> ${r.location}` : ''}`); continue; }
    const canonical = canonicalOf(r.body);
    if (canonical !== url) failures.push(`${url}: canonical ${canonical}`);
    if (isNoindex(r.body, r.headers)) failures.push(`${url}: noindex`);
  }
}
await Promise.all(Array.from({ length: 6 }, worker));

console.log(`\n${checked} sitemap URLs fetched: ${failures.length ? `${failures.length} problem(s)` : 'all 200, self-canonical, indexable'}`);
for (const f of failures) console.log(`  FAIL ${f}`);
process.exit(failures.length ? 1 : 0);
