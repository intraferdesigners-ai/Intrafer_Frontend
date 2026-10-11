// Admin landing-page preview via Next draft mode (app/api/landing-preview/).
// Pure apart from injected dependencies, so scripts/testLandingPreview.mjs
// can drive it without Next.
//
// Entry: GET /api/landing-preview/?token=<t>&path=<landing path>
//   (`preview` is accepted as an alias of `token` for old ?preview= links,
//   redirected here by next.config.js.)
//   - path must be a landing-page path (lib/landingPath.js), else 400.
//   - the token is checked by the backend, uncached: GET /public/landing-page
//     for exactly that path with preview=<t> answers `preview: true` only for
//     a valid, unexpired 'landing-preview' token minted for THAT page.
//   - valid: draft mode on + the token in an httpOnly cookie, both limited to
//     that path and to the token's remaining life (<= 30 min); 307 to the path.
//   - anything else: no cookies, 307 to the public path (today's behaviour
//     for an invalid ?preview= token: the normal page).
//   The redirect never carries the token; every response is no-store,
//   no-referrer, noindex/nofollow. Nothing here logs the URL or the token.
// Exit: GET /api/landing-preview/exit/?path=<landing path> — clears both
//   cookies (and Next's default-path one), 307 to the path (or "/").

import { parseLandingPath, landingQuery } from './landingPath.js';

export const PREVIEW_COOKIE = 'intrafer_lp_preview';
export const DRAFT_COOKIE = '__prerender_bypass'; // Next's draft-mode cookie
export const MAX_PREVIEW_SECONDS = 30 * 60;

export const PREVIEW_HEADERS = Object.freeze({
  'cache-control': 'no-store',
  'referrer-policy': 'no-referrer',
  'x-robots-tag': 'noindex, nofollow',
});

const redirect = (location) => new Response(null, { status: 307, headers: { ...PREVIEW_HEADERS, location } });
const badRequest = () => new Response('Invalid preview link.', { status: 400, headers: { ...PREVIEW_HEADERS, 'content-type': 'text/plain; charset=utf-8' } });

// Seconds until the JWT's exp (read without verifying — the backend already
// verified it), clamped to 1..MAX_PREVIEW_SECONDS; MAX when unreadable.
export function secondsLeft(token, nowMs = Date.now()) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
    const left = Math.floor(payload.exp - nowMs / 1000);
    return Math.max(1, Math.min(MAX_PREVIEW_SECONDS, Number.isFinite(left) ? left : MAX_PREVIEW_SECONDS));
  } catch {
    return MAX_PREVIEW_SECONDS;
  }
}

const cookieOptions = (path, maxAge, secure) => ({ path, maxAge, httpOnly: true, sameSite: 'lax', secure });

// Secure cookies whenever the request itself is https (always, on Vercel).
const isHttps = (request, url) => url.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https';

// deps: { api, fetchImpl, draftMode, cookies }
export function createPreviewEntry(deps) {
  return async function GET(request) {
    const url = new URL(request.url);
    const target = parseLandingPath(url.searchParams.get('path'));
    if (!target) return badRequest();
    const token = url.searchParams.get('token') || url.searchParams.get('preview');
    if (!token || token.length > 2048) return redirect(target.path);

    let valid = false;
    try {
      const res = await deps.fetchImpl(`${deps.api}/public/landing-page?${landingQuery(target, token)}`, { cache: 'no-store' });
      valid = res.ok && (await res.json())?.data?.preview === true;
    } catch {
      valid = false; // backend unreachable: fail closed, no draft mode
    }
    if (!valid) return redirect(target.path);

    const maxAge = secondsLeft(token);
    deps.draftMode().enable();
    const jar = deps.cookies();
    // Narrow Next's draft-mode cookie (default: path "/", session) to this
    // page and the token's life. Same name -> replaces Next's Set-Cookie.
    const bypass = jar.get(DRAFT_COOKIE)?.value;
    const secure = isHttps(request, url);
    if (bypass) jar.set(DRAFT_COOKIE, bypass, cookieOptions(target.path, maxAge, secure));
    jar.set(PREVIEW_COOKIE, token, cookieOptions(target.path, maxAge, secure));
    return redirect(target.path);
  };
}

export function createPreviewExit(deps) {
  return async function GET(request) {
    const url = new URL(request.url);
    const target = parseLandingPath(url.searchParams.get('path'));
    const jar = deps.cookies();
    deps.draftMode().disable(); // clears Next's default-path cookie, if any
    if (target) {
      for (const name of [DRAFT_COOKIE, PREVIEW_COOKIE]) jar.set(name, '', cookieOptions(target.path, 0, isHttps(request, url)));
    }
    return redirect(target ? target.path : '/');
  };
}
