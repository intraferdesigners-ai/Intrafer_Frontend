// Vendor-list pagination on city landing pages (/<category>/<state>/<city>/).
// Pure, so scripts/testCityPagination.mjs unit-tests it.
//
// Public URLs: page 1 is the city URL itself; page N > 1 is
// `<city URL>?page=N`. Page 1 stays a fully cached (ISR) route because it
// never reads searchParams: next.config.js rewrites any `?page=<value>` on
// a city URL to the internal segment /<category>/<state>/<city>/p/<value>/
// (cached per page), whose page validates the value — page=1 redirects to
// the city URL, a valid N within range renders, anything else is a 404.
// Direct visits to the internal /p/<n>/ path redirect to the public URL.

export const CITY_PAGE_SIZE = 12;
export const MAX_PAGE = 9999;

// The raw ?page value -> { kind: 'first' } (redirect to the city URL),
// { kind: 'page', n } (n >= 2, render if within range) or
// { kind: 'invalid' } (404): 0, negatives, decimals, leading zeros,
// non-digits, anything above MAX_PAGE.
export function parsePageParam(raw) {
  const value = typeof raw === 'string' ? raw : '';
  if (!/^[1-9]\d{0,3}$/.test(value)) return { kind: 'invalid' };
  const n = Number(value);
  if (n > MAX_PAGE) return { kind: 'invalid' };
  return n === 1 ? { kind: 'first' } : { kind: 'page', n };
}

export const totalPages = (count, size = CITY_PAGE_SIZE) => Math.max(1, Math.ceil(Math.max(0, Number(count) || 0) / size));

export const cityPath = (category, state, city) => `/${category}/${state}/${city}/`;

// Public href of page n (page 1 = no parameter).
export const pageHref = (basePath, n) => (n <= 1 ? basePath : `${basePath}?page=${n}`);

// 1-based ItemList position of the i-th vendor shown on page n.
export const itemPosition = (n, i, size = CITY_PAGE_SIZE) => (n - 1) * size + i + 1;

// Page numbers for the numbered links: all of them up to 7 pages, else the
// first, the last and the current ±1, with null for each gap ("…").
export function pageItems(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const keep = new Set([1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...keep].sort((a, b) => a - b);
  const out = [];
  for (const p of sorted) {
    if (out.length && p - out[out.length - 1] > 1) out.push(null);
    out.push(p);
  }
  return out;
}
