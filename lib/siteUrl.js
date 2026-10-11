// The one place the site's public host is decided. Every absolute URL the
// site emits about itself — canonicals, sitemap <loc>s, the robots.txt
// sitemap line, metadataBase, JSON-LD/OG urls — is built from SITE_URL /
// absoluteUrl() below, never from a literal. Pure, so
// scripts/testSiteUrl.mjs can test it directly.
//
// The live host is https://www.intrafer.in (the apex 301s to it), so that is
// both the fallback and the forced form: an env value naming the apex is
// rewritten to www rather than trusted, so a stale NEXT_PUBLIC_SITE_URL can't
// bring back apex canonicals that point at a redirect.

export const DEFAULT_SITE_URL = 'https://www.intrafer.in';
const APEX_HOST = 'intrafer.in';
const WWW_HOST = 'www.intrafer.in';

// Any input -> a bare origin: "https://host[:port]", no path, no trailing
// slash. Empty/whitespace/unparseable/non-http(s) input -> DEFAULT_SITE_URL.
// A missing scheme is taken as https; the apex (and any http:// form of our
// own host) becomes https://www.intrafer.in.
export function normalizeSiteUrl(raw) {
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (!value) return DEFAULT_SITE_URL;
  let url;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return DEFAULT_SITE_URL;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return DEFAULT_SITE_URL;
  if (url.hostname === APEX_HOST || url.hostname === WWW_HOST) return DEFAULT_SITE_URL;
  return url.origin;
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

// "/vendors/abc/" -> "https://www.intrafer.in/vendors/abc/". The path keeps
// its own trailing slash (or lack of one); a missing leading slash is added
// and runs of slashes ("//vendors//abc/") collapse to one — in the path
// only, never in a ?query or #fragment.
export function absoluteUrl(path = '/', base = SITE_URL) {
  const raw = String(path ?? '');
  const cut = raw.search(/[?#]/);
  const pathname = cut === -1 ? raw : raw.slice(0, cut);
  const rest = cut === -1 ? '' : raw.slice(cut);
  return `${normalizeSiteUrl(base)}${`/${pathname}`.replace(/\/{2,}/g, '/')}${rest}`;
}
