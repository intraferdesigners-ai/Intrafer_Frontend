// Live structured-data check of a running site (local `next start` or
// production). Read-only GETs only.
//
//   node scripts/checkStructuredData.mjs <baseUrl> [--city-authored <path>] [--city-auto <path>]
//        [--vendor <path>] [--project <path>] [--guide <path>] [--state <path>] [--path <path>]...
//   node scripts/checkStructuredData.mjs https://www.intrafer.in
//
// Pages: home, a category hub, a state hub, an authored and a programmatic
// city page, a vendor, a project, about, contact, how-it-works, faq, plans,
// guides index + one guide, gallery. Anything not given is discovered from
// real <a href> links (vendor from /vendors/, project from /gallery/, guide
// from /guides/, state from the category hub) or, for city pages, from the
// sitemap (index children followed). For each page it asserts:
// - every JSON-LD block parses; required properties per @type are present;
// - every @id reference resolves to a node defined on the page (the layout's
//   Organization/WebSite/ContactPoint included);
// - FAQ question/answer text appears in the page's HTML text;
// - /plans/ Offer prices equal the prices the cards show, per term;
// - AggregateRating/Review only when backed by reviews visible on the page;
// - no Product, and no priced Offer, outside /plans/ (unpriced
//   makesOffer -> Service offers are allowed on vendor pages only);
// - no apex-host / http own URLs in JSON-LD or the canonical;
// - the BreadcrumbList equals the visible breadcrumb (labels and hrefs).
// Exits 1 on any failure.

const args = process.argv.slice(2);
const base = (args.shift() || '').replace(/\/+$/, '');
if (!/^https?:\/\//.test(base)) {
  console.error('usage: node scripts/checkStructuredData.mjs <baseUrl> [--city-authored <path>] [--city-auto <path>] [--vendor <path>] [--project <path>] [--guide <path>] [--state <path>] [--path <path>]...');
  process.exit(2);
}
const opts = { path: [] };
for (let i = 0; i < args.length; i += 1) {
  const key = args[i].replace(/^--/, '');
  const value = args[(i += 1)];
  if (key === 'path') opts.path.push(value); else opts[key] = value;
}

const WWW = 'https://www.intrafer.in';
const CATEGORY = opts.category || '/interior-designers/';

const get = async (path) => {
  const res = await fetch(`${base}${path}`, { redirect: 'manual', headers: { 'user-agent': 'intrafer-structured-data-check' } });
  return { status: res.status, body: await res.text() };
};

// ── HTML helpers ──
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };
const decode = (s) => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/&([a-z#0-9]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
const norm = (s) => decode(String(s)).replace(/\s+/g, ' ').trim();
const visibleText = (html) => norm(html
  .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<[^>]+>/g, ' '));
// Same, but tags removed without a space (a card's "₹<price>" + "for <n> months").
const tightText = (html) => norm(html
  .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ''));
const hrefsIn = (html) => [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)].map((m) => decode(m[1]));

const jsonLdBlocks = (html) => [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);

// Every object node in the JSON-LD, with its parent key and parent @type.
function nodesOf(value, parentType = null, key = null, out = []) {
  if (Array.isArray(value)) { value.forEach((v) => nodesOf(v, parentType, key, out)); return out; }
  if (!value || typeof value !== 'object') return out;
  out.push({ node: value, parentType, key });
  for (const [k, v] of Object.entries(value)) nodesOf(v, value['@type'] || parentType, k, out);
  return out;
}
const urlsOf = (v) => (typeof v === 'string' ? (/^https?:\/\//.test(v) ? [v] : [])
  : Array.isArray(v) ? v.flatMap(urlsOf) : v && typeof v === 'object' ? Object.values(v).flatMap(urlsOf) : []);

const BUSINESS_TYPES = new Set(['LocalBusiness', 'HomeAndConstructionBusiness', 'GeneralContractor', 'HousePainter', 'Electrician', 'FurnitureStore', 'Plumber', 'RoofingContractor', 'HVACBusiness', 'Locksmith', 'MovingCompany', 'ProfessionalService', 'Store']);
const has = (o, k) => o[k] !== undefined && o[k] !== null && o[k] !== '' && !(Array.isArray(o[k]) && o[k].length === 0);

function requiredMissing(node, parentType, key) {
  const t = node['@type'];
  const need = {
    Organization: key === 'creator' ? ['name', 'url'] : ['@id', 'name', 'url', 'logo'],
    WebSite: ['@id', 'name', 'url'],
    ContactPoint: ['contactType', 'telephone'],
    BreadcrumbList: ['itemListElement'],
    ListItem: ['position'],
    FAQPage: ['mainEntity', 'url'],
    Question: ['name', 'acceptedAnswer'],
    Answer: ['text'],
    AboutPage: ['url', 'name', 'about'],
    ContactPage: ['url', 'name', 'mainEntity'],
    CollectionPage: ['name', 'mainEntity'],
    WebPage: ['url', 'name'],
    ItemList: ['itemListElement'],
    Product: ['name', 'offers'],
    Offer: parentType === 'Product' ? ['price', 'priceCurrency', 'availability', 'url'] : ['itemOffered'],
    Service: ['name'],
    Article: ['headline', 'author', 'publisher', 'mainEntityOfPage'],
    CreativeWork: ['name', 'url', 'creator'],
    ImageObject: ['contentUrl'],
    Review: ['author', 'reviewRating'],
    Rating: ['ratingValue'],
    AggregateRating: ['ratingValue', 'reviewCount'],
    City: ['name'],
  }[t] || (BUSINESS_TYPES.has(t) ? ['name'] : []);
  return need.filter((k) => !has(node, k));
}

// The visible breadcrumb: <nav aria-label="Breadcrumb"><ol><li>…</li></ol>.
function visibleBreadcrumbs(html) {
  return [...html.matchAll(/<nav aria-label="Breadcrumb"[^>]*>([\s\S]*?)<\/nav>/g)].map((nav) => (
    [...nav[1].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map((li) => {
      const a = li[1].match(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
      if (a) return { label: norm(a[2].replace(/<[^>]+>/g, '')), href: decode(a[1]) };
      const span = li[1].match(/<span aria-current="page"[^>]*>([\s\S]*?)<\/span>/);
      return { label: norm((span ? span[1] : '').replace(/<[^>]+>/g, '')), href: null };
    })
  ));
}

const toWww = (href) => `${WWW}${new URL(href, WWW).pathname}`;

async function checkPage(label, path) {
  const fails = [];
  const fail = (m) => fails.push(m);
  const { status, body } = await get(path);
  if (status !== 200) return { label, path, fails: [`HTTP ${status}`], types: [] };

  const text = visibleText(body);
  const tight = tightText(body);
  const blocks = [];
  for (const raw of jsonLdBlocks(body)) {
    try { blocks.push(JSON.parse(raw)); } catch (e) { fail(`JSON-LD does not parse: ${e.message}`); }
  }
  const nodes = blocks.flatMap((b) => nodesOf(b));
  const types = nodes.map((n) => n.node['@type']).filter(Boolean);

  // Required properties.
  for (const { node, parentType, key } of nodes) {
    if (!node['@type']) continue;
    const missing = requiredMissing(node, parentType, key);
    if (missing.length) fail(`${node['@type']}${key ? ` (${key})` : ''} missing ${missing.join(', ')}`);
  }

  // @id references resolve.
  const defined = new Set(nodes.filter(({ node }) => node['@id'] && Object.keys(node).length > 1).map(({ node }) => node['@id']));
  for (const { node, key } of nodes) {
    if (node['@id'] && Object.keys(node).length === 1 && !defined.has(node['@id'])) fail(`@id ${node['@id']} (${key}) not defined on the page`);
  }
  for (const id of [`${WWW}/#organization`, `${WWW}/#website`]) if (!defined.has(id)) fail(`layout entity ${id} missing`);

  // FAQ text is on the page.
  for (const { node } of nodes.filter(({ node }) => node['@type'] === 'Question')) {
    if (!text.includes(norm(node.name))) fail(`FAQ question not in page text: ${node.name}`);
    const answer = node.acceptedAnswer?.text;
    if (answer && !text.includes(norm(answer))) fail(`FAQ answer not in page text: ${answer.slice(0, 80)}`);
  }

  // Product / Offer only on /plans/; plan prices equal the visible card prices.
  const isPlans = path === '/plans/';
  const isVendor = /^\/vendors\/[a-f0-9]{24}\/$/i.test(path);
  for (const { node, parentType, key } of nodes) {
    if (node['@type'] === 'Product' && !isPlans) fail('Product markup outside /plans/');
    if (node['@type'] === 'Offer' && !isPlans) {
      if (has(node, 'price') || has(node, 'priceSpecification')) fail('priced Offer outside /plans/');
      if (!isVendor || key !== 'makesOffer') fail(`Offer outside /plans/ (${parentType}.${key})`);
    }
  }
  if (isPlans) {
    const cards = new Map([...tight.matchAll(/₹([\d,]+)\s*for\s+(\d+\s+months?)/g)].map((m) => [m[2], Number(m[1].replace(/,/g, ''))]));
    const products = nodes.filter(({ node }) => node['@type'] === 'Product').map(({ node }) => node);
    if (products.length === 0) fail('no Product markup on /plans/');
    if (cards.size !== products.length) fail(`${cards.size} visible price cards vs ${products.length} Products`);
    for (const p of products) {
      const term = p.description?.match(/^For (\d+ months?):/)?.[1];
      if (!cards.has(term)) fail(`Product ${p.name}: no visible card for "${term}"`);
      else if (cards.get(term) !== p.offers?.price) fail(`Product ${p.name}: JSON-LD price ${p.offers?.price} ≠ visible ₹${cards.get(term)}`);
      if (p.offers?.priceCurrency !== 'INR') fail(`Product ${p.name}: priceCurrency ${p.offers?.priceCurrency}`);
    }
  }

  // Ratings and reviews must be visible.
  for (const { node } of nodes) {
    if (node['@type'] === 'AggregateRating') {
      const value = Number(node.ratingValue).toFixed(1);
      if (!text.includes(value) || !new RegExp(`\\b${node.reviewCount} reviews?\\b`).test(text)) fail(`AggregateRating ${value}/${node.reviewCount} not shown on the page`);
    }
    if (node['@type'] === 'Review') {
      if (!text.includes(norm(node.author?.name || ''))) fail(`Review author not shown: ${node.author?.name}`);
      if (node.reviewBody && !text.includes(norm(node.reviewBody))) fail(`Review body not shown: ${node.reviewBody.slice(0, 60)}`);
    }
  }

  // Own URLs on www only (JSON-LD + canonical).
  const canonical = body.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  for (const u of [...blocks.flatMap(urlsOf), ...(canonical ? [decode(canonical)] : [])]) {
    let host = '';
    try { host = new URL(u).hostname; } catch { /* ignore */ }
    if (/(^|\.)intrafer\.in$/.test(host) && !u.startsWith(`${WWW}/`)) fail(`off-host own URL: ${u}`);
  }

  // Breadcrumb JSON-LD == visible breadcrumb.
  const lists = nodes.filter(({ node }) => node['@type'] === 'BreadcrumbList').map(({ node }) => node);
  const visible = visibleBreadcrumbs(body);
  if (path !== '/' && (lists.length !== 1 || visible.length !== 1)) fail(`expected one BreadcrumbList and one visible breadcrumb, got ${lists.length} / ${visible.length}`);
  if (lists.length === 1 && visible.length === 1) {
    const ld = lists[0].itemListElement.map((e) => ({ label: e.name, href: e.item || null }));
    const vis = visible[0].map((v) => ({ label: v.label, href: v.href ? toWww(v.href) : null }));
    if (JSON.stringify(ld) !== JSON.stringify(vis)) fail(`breadcrumb mismatch: JSON-LD ${JSON.stringify(ld)} vs visible ${JSON.stringify(vis)}`);
    lists[0].itemListElement.forEach((e, i) => { if (e.position !== i + 1) fail(`breadcrumb position ${e.position} at index ${i}`); });
  }

  return { label, path, fails, types: [...new Set(types)] };
}

// ── Discovery ──
async function firstLink(fromPath, re) {
  const { status, body } = await get(fromPath);
  if (status !== 200) return null;
  const hit = hrefsIn(body).map((h) => { try { return new URL(h, base).pathname; } catch { return ''; } }).find((p) => re.test(p));
  return hit ? (hit.endsWith('/') ? hit : `${hit}/`) : null;
}
async function sitemapPaths() {
  const locs = async (path) => [...(await get(path)).body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1]));
  const top = await get('/sitemap.xml');
  let urls = [...top.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1]));
  if (/<sitemapindex/.test(top.body)) urls = (await Promise.all(urls.map((u) => locs(new URL(u).pathname)))).flat();
  return urls.map((u) => new URL(u).pathname);
}

const cityRe = /^\/[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+\/$/;
const smPaths = (opts['city-authored'] && opts['city-auto']) ? [] : await sitemapPaths();
const sitemapCities = smPaths.filter((p) => cityRe.test(p) && !/^\/(vendors|projects|guides|design-styles|cities|for-designers)\//.test(p));

const PAGES = [
  ['home', '/'],
  ['category hub', CATEGORY],
  ['state hub', opts.state || await firstLink(CATEGORY, new RegExp(`^${CATEGORY}[a-z0-9-]+/?$`))],
  ['city (authored)', opts['city-authored'] || sitemapCities[0] || null],
  ['city (programmatic)', opts['city-auto'] || sitemapCities[1] || null],
  ['vendor', opts.vendor || await firstLink('/vendors/', /^\/vendors\/[a-f0-9]{24}\/?$/i)],
  ['project', opts.project || await firstLink('/gallery/', /^\/projects\/[a-f0-9]{24}\/?$/i) || await firstLink('/recent-projects/', /^\/projects\/[a-f0-9]{24}\/?$/i)],
  ['about', '/about/'],
  ['contact', '/contact/'],
  ['how-it-works', '/how-it-works/'],
  ['faq', '/faq/'],
  ['plans', '/plans/'],
  ['guides index', '/guides/'],
  ['guide', opts.guide || await firstLink('/guides/', /^\/guides\/[a-z0-9-]+\/?$/)],
  ['gallery', '/gallery/'],
  ...opts.path.map((p) => ['extra', p]),
];

let failed = 0;
for (const [label, path] of PAGES) {
  if (!path) { console.log(`SKIP ${label}: no URL found (pass it explicitly)`); failed += 1; continue; }
  const r = await checkPage(label, path);
  console.log(`${r.fails.length ? 'FAIL' : 'ok  '} ${label.padEnd(20)} ${path}  [${r.types.join(', ')}]`);
  for (const f of r.fails) console.log(`       - ${f}`);
  if (r.fails.length) failed += 1;
}
console.log(failed ? `\n${failed} page(s) failed` : `\nall ${PAGES.length} pages passed`);
process.exit(failed ? 1 : 0);
