// Live crawl-graph check: breadth-first from the home page following ONLY
// real <a href> links in the server-rendered HTML (no JavaScript), the way a
// crawler's first pass sees the site. Read-only GETs.
//
//   node scripts/checkCrawlGraph.mjs <baseUrl> [--max <pages>]
//
// Reports (and exits 1 on any of the first two):
// 1. orphans: URLs listed in the sitemaps that no followed link reaches;
// 2. indexable city pages (/<category>/<state>/<city>/ in the sitemaps)
//    deeper than 3 clicks from the home page;
// 3. the click-depth histogram, and internal links that answer a redirect
//    (e.g. a missing trailing slash) — followed, but worth fixing.
// Not followed: robots.txt-disallowed paths (/admin, /vendor/dashboard,
// /auth), /api/, /_next/, other hosts, and non-page files.
import { WWW, client, links, sitemapUrls } from './lib/crawl.mjs';

const args = process.argv.slice(2);
const base = (args.shift() || '').replace(/\/+$/, '');
if (!/^https?:\/\//.test(base)) {
  console.error('usage: node scripts/checkCrawlGraph.mjs <baseUrl> [--max <pages>]');
  process.exit(2);
}
const MAX = Number(args[args.indexOf('--max') + 1]) || 5000;
const MAX_DEPTH = 3;
const get = client(base);
const SITE_HOSTS = new Set([new URL(base).host, new URL(WWW).host]);
const SKIP = /^\/(admin|vendor\/dashboard|auth|api|_next)(\/|$)/;
const FILE = /\.(xml|txt|png|jpe?g|webp|avif|gif|svg|ico|pdf|js|css|json)$/i;
const NOT_CITY = /^\/(vendors|projects|guides|design-styles|cities|for-designers|sitemaps)\//;

const key = (u) => `${u.pathname}${u.search}`;

const depth = new Map([['/', 0]]);
const redirects = new Map(); // link -> target
let frontier = ['/'];
let fetched = 0;

for (let d = 0; frontier.length && fetched < MAX; d += 1) {
  const next = [];
  const queue = [...frontier];
  async function worker() {
    while (queue.length && fetched < MAX) {
      let path = queue.shift();
      let r = await get(path);
      fetched += 1;
      // Follow same-site redirects (a crawler does); the target sits at this depth.
      for (let hops = 0; r.status >= 300 && r.status < 400 && r.location && hops < 3; hops += 1) {
        const target = new URL(r.location, `${base}${path}`);
        if (!SITE_HOSTS.has(target.host)) break;
        redirects.set(path, key(target));
        path = key(target);
        if (depth.has(path) && depth.get(path) < d) break;
        if (!depth.has(path)) depth.set(path, d);
        r = await get(path);
        fetched += 1;
      }
      if (r.status !== 200 || !/text\/html/.test(r.headers.get('content-type') || '')) continue;
      for (const u of links(r.body, `${base}${path}`)) {
        if (!SITE_HOSTS.has(u.host) || SKIP.test(u.pathname) || FILE.test(u.pathname)) continue;
        const k = key(u);
        if (depth.has(k)) continue;
        depth.set(k, d + 1);
        next.push(k);
      }
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker));
  frontier = next;
}

const { urls } = await sitemapUrls(get);
const listed = [...new Set(urls.map((u) => { const x = new URL(u); return key(x); }))];
const orphans = listed.filter((p) => !depth.has(p));
const cities = listed.filter((p) => /^\/[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+\/$/.test(p) && !NOT_CITY.test(p));
const deepCities = cities.filter((p) => depth.has(p) && depth.get(p) > MAX_DEPTH);

const hist = {};
for (const p of listed) { const dd = depth.has(p) ? depth.get(p) : 'unreached'; hist[dd] = (hist[dd] || 0) + 1; }

console.log(`crawled ${fetched} responses, ${depth.size} distinct same-site URLs discovered from /`);
console.log(`sitemap URLs: ${listed.length}; click depth of each from the home page:`);
for (const [dd, n] of Object.entries(hist).sort()) console.log(`  depth ${dd}: ${n}`);
console.log(`\nindexable city pages: ${cities.length}`);
for (const p of cities) console.log(`  depth ${depth.has(p) ? depth.get(p) : '—'}  ${p}`);
const redirectList = [...redirects.entries()];
console.log(`\ninternal links that redirect: ${redirectList.length}`);
for (const [from, to] of redirectList.slice(0, 40)) console.log(`  ${from} -> ${to}`);

console.log(`\norphans (in a sitemap, unreachable through links from /): ${orphans.length}`);
for (const p of orphans) console.log(`  ${p}`);
console.log(`city pages deeper than ${MAX_DEPTH}: ${deepCities.length}`);
for (const p of deepCities) console.log(`  depth ${depth.get(p)}  ${p}`);

process.exit(orphans.length || deepCities.length ? 1 : 0);
