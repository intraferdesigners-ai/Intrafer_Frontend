// The sitemap: /sitemap.xml is a <sitemapindex> (app/sitemap.xml/route.js)
// over child <urlset>s at /sitemaps/<group>-<n>.xml
// (app/sitemaps/[file]/route.js). Pure apart from the injectable fetch, so
// scripts/testSitemap.mjs runs it against a mocked API.
//
// Groups (only indexable URLs, all on SITE_URL from lib/siteUrl.js):
// - pages:      static pages, /design-styles/<style>/, /cities/<city>/
// - categories: category hubs, state hubs and qualifying city pages
//               (>= MIN_VENDORS_TO_INDEX vendors, decided by the backend's
//               meetsThreshold), merged with admin-authored landing pages
//               (indexable added, Noindex ones dropped — lib/landingSitemap.js)
// - designers:  public vendor profiles
// - projects:   public projects (lib/projectSitemap.js)
// - guides:     /guides/ and every guide
// Each group fails on its own: a group whose data can't be fetched makes
// only its own child fail (the index still lists it, every other child is
// unaffected). A child over MAX_URLS urls or MAX_BYTES bytes is split into
// numbered children (<group>-1, <group>-2, ...).

import { slugify } from './slug.js';
import { mergeLandingPages, fetchLandingSitemapPages } from './landingSitemap.js';
import { fetchPublicProjects, projectEntries } from './projectSitemap.js';
import { GUIDES } from './guides-data.js';
import { STYLE_SLUGS } from './designStyles.js';
import { CITY_PAGE_SLUGS } from './cityPages.js';
import { TAGS } from './cacheTags.js';
import { SERVICE_CATEGORIES } from './categories.js';

export const SITEMAP_GROUPS = Object.freeze(['pages', 'categories', 'designers', 'projects', 'guides']);
export const MAX_URLS = 50000;
export const MAX_BYTES = 50 * 1024 * 1024; // uncompressed, per the sitemaps.org limit
export const SITEMAP_REVALIDATE = 300;

// Tags each group's fetches carry, so the backend's purges reach the cached
// sitemap routes (vendors / projects / landing / taxonomy). pages and guides
// are built from source data only.
export const GROUP_TAGS = Object.freeze({
  pages: [],
  categories: [TAGS.TAXONOMY, TAGS.VENDORS, TAGS.LANDING],
  designers: [TAGS.VENDORS],
  projects: [TAGS.PROJECTS],
  guides: [],
});

// Categories of the URL taxonomy: lib/categories.js (one list, shared with
// the category hubs' "Other services" links). No public "list categories"
// endpoint exists; each slug is checked live (GET
// /public/service-categories/:slug 404s inactive/unknown ones).
export const CATEGORY_SLUGS = Object.freeze(SERVICE_CATEGORIES.map((c) => c.slug));

// Static pages. /guides/ is in the guides group.
export const STATIC_PAGES = Object.freeze([
  { path: '/', priority: 1.0 },
  { path: '/vendors/', priority: 0.9 },
  { path: '/gallery/', priority: 0.8 },
  { path: '/recent-projects/', priority: 0.7 },
  { path: '/cost-calculator/', priority: 0.8 },
  { path: '/wardrobe-calculator/', priority: 0.7 },
  { path: '/design-styles/', priority: 0.7 },
  { path: '/plans/', priority: 0.8 },
  { path: '/for-designers/', priority: 0.8 },
  { path: '/how-it-works/', priority: 0.6 },
  { path: '/about/', priority: 0.6 },
  { path: '/contact/', priority: 0.6 },
  { path: '/faq/', priority: 0.6 },
  { path: '/testimonials/', priority: 0.6 },
  { path: '/privacy/', priority: 0.3 },
  { path: '/terms/', priority: 0.3 },
  { path: '/for-designers/privacy/', priority: 0.3 },
  { path: '/for-designers/terms/', priority: 0.3 },
]);

// ── XML ─────────────────────────────────────────────────────────────────

const XML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
export const escapeXml = (s) => String(s).replace(/[&<>"']/g, (c) => XML_ESCAPES[c]);

const XML_HEAD = '<?xml version="1.0" encoding="UTF-8"?>\n';
const URLSET_OPEN = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
const URLSET_CLOSE = '</urlset>\n';

export function urlXml({ url, lastModified, priority }) {
  return `<url>\n<loc>${escapeXml(url)}</loc>\n${lastModified ? `<lastmod>${escapeXml(lastModified)}</lastmod>\n` : ''}${priority != null ? `<priority>${priority}</priority>\n` : ''}</url>\n`;
}

export const urlsetXml = (entries) => `${XML_HEAD}${URLSET_OPEN}${entries.map(urlXml).join('')}${URLSET_CLOSE}`;

export function sitemapIndexXml(children) {
  const items = children.map(({ loc, lastModified }) => (
    `<sitemap>\n<loc>${escapeXml(loc)}</loc>\n${lastModified ? `<lastmod>${escapeXml(lastModified)}</lastmod>\n` : ''}</sitemap>\n`
  )).join('');
  return `${XML_HEAD}<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}</sitemapindex>\n`;
}

// Splits entries into children of at most maxUrls urls and maxBytes bytes
// (each child's full XML, UTF-8). Always at least one (possibly empty) chunk.
export function chunkEntries(entries, { maxUrls = MAX_URLS, maxBytes = MAX_BYTES } = {}) {
  const overhead = Buffer.byteLength(XML_HEAD + URLSET_OPEN + URLSET_CLOSE);
  const chunks = [[]];
  let bytes = overhead;
  for (const e of entries) {
    const size = Buffer.byteLength(urlXml(e));
    const current = chunks[chunks.length - 1];
    if (current.length > 0 && (current.length >= maxUrls || bytes + size > maxBytes)) {
      chunks.push([]);
      bytes = overhead;
    }
    chunks[chunks.length - 1].push(e);
    bytes += size;
  }
  return chunks;
}

// Newest lastmod in a chunk (ISO strings compare chronologically), or null.
export const latestLastModified = (entries) => entries.reduce((max, e) => (e.lastModified && (!max || e.lastModified > max) ? e.lastModified : max), null);

export const childPath = (group, n) => `/sitemaps/${group}-${n}.xml`;
export function parseChildFile(file) {
  const m = /^([a-z]+)-([1-9]\d{0,4})\.xml$/.exec(String(file || ''));
  return m && SITEMAP_GROUPS.includes(m[1]) ? { group: m[1], n: Number(m[2]) } : null;
}

// ── Groups ──────────────────────────────────────────────────────────────

const iso = (d) => {
  const date = d ? new Date(d) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toISOString() : null;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// A fresh options object per call: Next's fetch deletes `init.next` from
// the object it is given.
const fetchOptions = (group) => ({ next: { revalidate: SITEMAP_REVALIDATE, tags: [...GROUP_TAGS[group]] } });

async function getJson(fetchImpl, url, group, { retries = 1, allow404 = false } = {}) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      const res = await fetchImpl(url, fetchOptions(group));
      if (allow404 && res.status === 404) return null;
      if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt >= retries) throw err;
      await sleep(300);
    }
  }
}

function pagesGroup(baseUrl) {
  return [
    ...STATIC_PAGES.map((p) => ({ url: `${baseUrl}${p.path}`, lastModified: null, priority: p.priority })),
    ...STYLE_SLUGS.map((s) => ({ url: `${baseUrl}/design-styles/${s}/`, lastModified: null, priority: 0.6 })),
    ...CITY_PAGE_SLUGS.map((c) => ({ url: `${baseUrl}/cities/${c}/`, lastModified: null, priority: 0.6 })),
  ];
}

function guidesGroup(baseUrl) {
  return [
    { url: `${baseUrl}/guides/`, lastModified: null, priority: 0.7 },
    ...GUIDES.map((g) => ({ url: `${baseUrl}/guides/${g.slug}/`, lastModified: iso(g.dateModified || g.datePublished), priority: 0.6 })),
  ];
}

// Every approved + listed vendor (GET /public/vendors filters server-side;
// re-checked here), paged 50 at a time.
async function designersGroup(api, baseUrl, fetchImpl) {
  const vendors = [];
  for (let page = 1; ; page += 1) {
    const json = await getJson(fetchImpl, `${api}/public/vendors?page=${page}&limit=50`, 'designers');
    const list = json?.data?.vendors;
    if (!Array.isArray(list)) throw new Error('GET /public/vendors: malformed body');
    vendors.push(...list);
    if (page >= (json.data.totalPages || 1) || list.length === 0) break;
  }
  const seen = new Set();
  return vendors
    .filter((v) => v && v.isApproved === true && v.isListingEnabled === true && v._id && !seen.has(v._id) && seen.add(v._id))
    .map((v) => ({ url: `${baseUrl}/vendors/${v._id}/`, lastModified: iso(v.updatedAt), priority: 0.7 }));
}

async function projectsGroup(api, baseUrl, fetchImpl) {
  const result = await fetchPublicProjects(api, fetchOptions('projects'), fetchImpl);
  if (!result) throw new Error('GET /public/gallery failed');
  return projectEntries(result.projects, baseUrl, null);
}

// Category hubs, their state hubs, and city pages that meet the indexing
// threshold — then the admin-authored landing pages merged in. A failing
// landing fetch keeps the automatic entries (as before); any other failure
// fails the group.
async function categoriesGroup(api, baseUrl, fetchImpl) {
  const entries = [];
  for (const slug of CATEGORY_SLUGS) {
    const cat = await getJson(fetchImpl, `${api}/public/service-categories/${slug}`, 'categories', { allow404: true });
    if (!cat) continue;
    entries.push({ url: `${baseUrl}/${slug}/`, lastModified: null, priority: 0.8 });

    const statesJson = await getJson(fetchImpl, `${api}/public/states?category=${slug}`, 'categories', { allow404: true });
    for (const s of statesJson?.data?.states || []) {
      if (!s.state) continue;
      const stateSlug = slugify(s.state);
      entries.push({ url: `${baseUrl}/${slug}/${stateSlug}/`, lastModified: null, priority: 0.6 });

      const citiesJson = await getJson(fetchImpl, `${api}/public/category-cities?category=${slug}&state=${stateSlug}`, 'categories', { allow404: true });
      for (const c of citiesJson?.data?.cities || []) {
        if (!c.citySlug) continue;
        const v = await getJson(fetchImpl, `${api}/public/vendors?category=${slug}&state=${stateSlug}&city=${c.citySlug}`, 'categories', { allow404: true });
        if (v?.data?.meetsThreshold) entries.push({ url: `${baseUrl}/${slug}/${stateSlug}/${c.citySlug}/`, lastModified: null, priority: 0.5 });
      }
    }
  }
  const landing = await fetchLandingSitemapPages(api, fetchOptions('categories'), fetchImpl);
  return mergeLandingPages(entries, landing, baseUrl, null);
}

// One group's entries; throws when its data can't be fetched.
export async function groupEntries(group, { api, baseUrl, fetchImpl = fetch }) {
  switch (group) {
    case 'pages': return pagesGroup(baseUrl);
    case 'guides': return guidesGroup(baseUrl);
    case 'designers': return designersGroup(api, baseUrl, fetchImpl);
    case 'projects': return projectsGroup(api, baseUrl, fetchImpl);
    case 'categories': return categoriesGroup(api, baseUrl, fetchImpl);
    default: throw new Error(`unknown sitemap group ${group}`);
  }
}

// The index: every group's children (one per chunk). A group that fails
// still gets its first child listed, so a backend blip never drops a group
// from the index — that child answers 5xx (or its last good copy) instead.
export async function buildSitemapIndex(ctx, limits) {
  const children = [];
  const failed = [];
  for (const group of SITEMAP_GROUPS) {
    let chunks;
    try {
      chunks = chunkEntries(await groupEntries(group, ctx), limits);
    } catch {
      failed.push(group);
      chunks = [[]];
    }
    chunks.forEach((chunk, i) => children.push({ loc: `${ctx.baseUrl}${childPath(group, i + 1)}`, lastModified: latestLastModified(chunk) }));
  }
  return { xml: sitemapIndexXml(children), children, failed };
}

// One child's XML, or null when it doesn't exist (unknown name, or a chunk
// number past the end). Throws when the group's data can't be fetched.
export async function buildSitemapChild(file, ctx, limits) {
  const parsed = parseChildFile(file);
  if (!parsed) return null;
  const chunks = chunkEntries(await groupEntries(parsed.group, ctx), limits);
  const chunk = chunks[parsed.n - 1];
  return chunk ? urlsetXml(chunk) : null;
}
