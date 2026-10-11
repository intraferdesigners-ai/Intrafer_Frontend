// Server-side GET of a JSON API through Next's data cache, for cached (ISR)
// pages. Errors are never cached:
// - Next's data cache only stores 200 responses.
// - Any failure throws instead of caching a fallback: a time-based
//   regeneration then keeps serving the last good page; a first render, or
//   the first render right after an on-demand purge (Next 14 doesn't serve
//   stale data after revalidateTag), answers 5xx until the backend is back.
// - Except during `next build`, where there is no last good page yet and a
//   throw would fail the deploy: `fallback` is returned instead, and that
//   page is replaced at its next regeneration or purge.
// `nullOn404`: a 404 resolves to null (the caller then calls notFound()).

export const IS_BUILD = process.env.NEXT_PHASE === 'phase-production-build';

export async function cachedJson(url, { revalidate, tags, fallback = null, nullOn404 = false }) {
  let res;
  try {
    res = await fetch(url, { next: { revalidate, tags } });
  } catch (err) {
    if (IS_BUILD) return fallback;
    throw err;
  }
  if (nullOn404 && res.status === 404) return null;
  if (!res.ok) {
    if (IS_BUILD) return fallback;
    throw new Error(`GET ${url} failed: ${res.status}`);
  }
  return res.json();
}
