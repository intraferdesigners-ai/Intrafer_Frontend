// Whether next/image can safely run `src` through the optimizer
// (/_next/image). Anything it can't — a host missing from the allow-list,
// a relative path, a data: URL, a malformed value — must be rendered with
// `unoptimized` instead: the default loader throws for unlisted hosts in
// dev and 400s in production, where a plain <img> would have just loaded.
//
// Pure — exercised by scripts/testImageHost.mjs.

import remotePatterns from './imageRemotePatterns.js';

const { IMAGE_REMOTE_PATTERNS } = remotePatterns;

// Next's remotePatterns hostname globs: `**.x` = one or more labels before
// x, `*.x` = exactly one, anything else = exact match. Never a suffix
// match, so "res.cloudinary.com.evil.com" doesn't pass.
function hostnameMatches(pattern, hostname) {
  if (pattern.startsWith('**.')) {
    const base = pattern.slice(3);
    return hostname.endsWith(`.${base}`) && hostname.length > base.length + 1;
  }
  if (pattern.startsWith('*.')) {
    const base = pattern.slice(2);
    if (!hostname.endsWith(`.${base}`)) return false;
    const label = hostname.slice(0, -(base.length + 1));
    return label.length > 0 && !label.includes('.');
  }
  return hostname === pattern;
}

// Only https entries count: the http://localhost entry exists for local
// dev uploads, which the production optimizer could never fetch anyway —
// those render unoptimized, exactly as a plain <img> did.
export function canOptimize(src) {
  if (typeof src !== 'string' || !src.trim()) return false;
  let url;
  try {
    url = new URL(src.trim()); // relative or protocol-relative paths throw here
  } catch {
    return false;
  }
  if (url.protocol !== 'https:' || url.username || url.password) return false;
  return IMAGE_REMOTE_PATTERNS.some((p) => p.protocol === 'https'
    && hostnameMatches(p.hostname, url.hostname)
    && (p.port === undefined || p.port === url.port));
}

export { IMAGE_REMOTE_PATTERNS };
