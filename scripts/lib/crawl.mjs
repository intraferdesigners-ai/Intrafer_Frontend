// Shared by the live crawl scripts (checkSitemapUrls, checkCrawlGraph,
// checkStructuredData's sitemap discovery). Read-only GETs.

export const WWW = 'https://www.intrafer.in';

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
export const decode = (s) => String(s)
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);

export function client(base) {
  const origin = base.replace(/\/+$/, '');
  return async function get(pathOrUrl) {
    const url = new URL(pathOrUrl, `${origin}/`);
    const res = await fetch(`${origin}${url.pathname}${url.search}`, { redirect: 'manual', headers: { 'user-agent': 'intrafer-crawl-check' } });
    return { status: res.status, headers: res.headers, body: await res.text(), location: res.headers.get('location') };
  };
}

export const locsOf = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1].trim()));

// Every URL in every child sitemap of /sitemap.xml (a plain <urlset> works too).
export async function sitemapUrls(get) {
  const top = await get('/sitemap.xml');
  if (top.status !== 200) throw new Error(`/sitemap.xml: HTTP ${top.status}`);
  if (!/<sitemapindex[\s>]/.test(top.body)) return { children: [], urls: locsOf(top.body) };
  const children = [];
  for (const loc of locsOf(top.body)) {
    const r = await get(new URL(loc).pathname);
    children.push({ loc, status: r.status, urls: r.status === 200 ? locsOf(r.body) : [] });
  }
  return { children, urls: children.flatMap((c) => c.urls) };
}

export const canonicalOf = (html) => {
  const m = html.match(/<link rel="canonical" href="([^"]+)"/);
  return m ? decode(m[1]) : null;
};
export const metaRobots = (html) => [...html.matchAll(/<meta name="robots" content="([^"]+)"/g)].map((m) => m[1]).join(',');
export const isNoindex = (html, headers) => /noindex/i.test(metaRobots(html)) || /noindex/i.test(headers?.get?.('x-robots-tag') || '');

// Same-site path+query of every <a href> in the HTML (no JS execution).
export function links(html, pageUrl) {
  const out = [];
  for (const m of html.matchAll(/<a\b[^>]*?\shref="([^"]*)"/gi)) {
    const raw = decode(m[1]).trim();
    if (!raw || /^(mailto:|tel:|javascript:|#)/i.test(raw)) continue;
    let u;
    try { u = new URL(raw, pageUrl); } catch { continue; }
    out.push(u);
  }
  return out;
}
