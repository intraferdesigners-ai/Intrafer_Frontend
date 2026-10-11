// POST /api/revalidate: the backend's on-demand cache purge. Pure apart
// from the injected revalidateTag/revalidatePath, so
// scripts/testRevalidateRoute.mjs can exercise it without Next.

import { createHash, timingSafeEqual } from 'node:crypto';

export const LIMITS = Object.freeze({
  MAX_TAGS: 20, MAX_TAG_LENGTH: 80, MAX_PATHS: 10, MAX_PATH_LENGTH: 200, MAX_BODY_BYTES: 8192,
});
const TAG_PATTERN = /^[a-z0-9:_-]+$/;
const PATH_PATTERN = /^\/[^\s]*$/;

// Constant-time: both sides are hashed to equal-length digests first, so
// neither the content nor the length of the secret leaks through timing.
export function secretMatches(given, expected) {
  if (typeof expected !== 'string' || !expected || typeof given !== 'string' || !given) return false;
  const digest = (s) => createHash('sha256').update(s).digest();
  return timingSafeEqual(digest(given), digest(expected));
}

// { tags: string[], paths?: string[] } -> { tags, paths }, or null when
// anything is off (wrong type, unknown key, too many, too long, bad chars).
export function parseRevalidateBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  if (Object.keys(body).some((k) => k !== 'tags' && k !== 'paths')) return null;
  const { tags, paths = [] } = body;
  if (!Array.isArray(tags) || !Array.isArray(paths)) return null;
  if (tags.length > LIMITS.MAX_TAGS || paths.length > LIMITS.MAX_PATHS) return null;
  if (tags.length + paths.length === 0) return null;
  const tagOk = (t) => typeof t === 'string' && t.length > 0 && t.length <= LIMITS.MAX_TAG_LENGTH && TAG_PATTERN.test(t);
  const pathOk = (p) => typeof p === 'string' && p.length <= LIMITS.MAX_PATH_LENGTH && PATH_PATTERN.test(p);
  if (!tags.every(tagOk) || !paths.every(pathOk)) return null;
  return { tags, paths };
}

const respond = (status, body) => new Response(body === undefined ? null : JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' },
});

export function createRevalidateHandler({ revalidateTag, revalidatePath, getSecret }) {
  return async function POST(request) {
    // Missing env or wrong/missing header: 401, no detail.
    if (!secretMatches(request.headers.get('x-revalidate-secret'), getSecret())) return respond(401);
    let body;
    try {
      const text = await request.text();
      if (Buffer.byteLength(text) > LIMITS.MAX_BODY_BYTES) return respond(400);
      body = JSON.parse(text);
    } catch {
      return respond(400);
    }
    const parsed = parseRevalidateBody(body);
    if (!parsed) return respond(400);
    for (const tag of parsed.tags) revalidateTag(tag);
    for (const path of parsed.paths) revalidatePath(path);
    return respond(200, { ok: true, tags: parsed.tags, paths: parsed.paths });
  };
}
